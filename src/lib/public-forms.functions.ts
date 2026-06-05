import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";


const tokenSchema = z.object({ token: z.string().uuid() });

export const getInviteForm = createServerFn({ method: "POST" })
  .inputValidator((d) => tokenSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: invite, error: invErr } = await supabaseAdmin
      .from("form_invites")
      .select("*")
      .eq("token", data.token)
      .maybeSingle();

    if (invErr) throw new Error(invErr.message);
    if (!invite) throw new Error("Convite não encontrado.");

    const { data: form, error: formErr } = await supabaseAdmin
      .from("forms")
      .select("id, title, description, schema")
      .eq("id", invite.form_id)
      .maybeSingle();

    if (formErr) throw new Error(formErr.message);
    if (!form) throw new Error("Formulário não encontrado.");

    let clienteName: string | null = (invite as any).lead_name ?? null;
    if (!clienteName && invite.cliente_id) {
      const { data: cliente } = await supabaseAdmin
        .from("profiles")
        .select("full_name")
        .eq("id", invite.cliente_id)
        .maybeSingle();
      clienteName = cliente?.full_name ?? null;
    }

    return {
      invite: {
        token: invite.token,
        already_submitted: !!invite.submitted_at,
      },
      cliente: { full_name: clienteName },
      form,
    };
  });

const submitSchema = z.object({
  token: z.string().uuid(),
  answers: z.record(z.string(), z.union([z.string(), z.array(z.string())])),
});

export const submitInviteForm = createServerFn({ method: "POST" })
  .inputValidator((d) => submitSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: invite, error: invErr } = await supabaseAdmin
      .from("form_invites")
      .select("*")
      .eq("token", data.token)
      .maybeSingle();

    if (invErr) throw new Error(invErr.message);
    if (!invite) throw new Error("Convite inválido.");
    if (invite.submitted_at) throw new Error("Este formulário já foi enviado.");

    // Se já houver cliente vinculado, grava também em form_responses para histórico
    if (invite.cliente_id) {
      const { error: insErr } = await supabaseAdmin.from("form_responses").insert({
        form_id: invite.form_id,
        cliente_id: invite.cliente_id,
        answers: data.answers,
      });
      if (insErr) throw new Error(insErr.message);
    }

    const { error: updErr } = await supabaseAdmin
      .from("form_invites")
      .update({
        submitted_at: new Date().toISOString(),
        answers: data.answers as any,
      } as any)
      .eq("token", invite.token);
    if (updErr) throw new Error(updErr.message);

    return { ok: true };
  });

// ----- Admin: criar convite para lead (sem cadastro prévio) -----

const createLeadInviteSchema = z.object({
  form_id: z.string().uuid(),
  lead_name: z.string().trim().min(1).max(200),
  lead_email: z.string().trim().email().max(255).optional().or(z.literal("")),
  lead_whatsapp: z.string().trim().max(40).optional().or(z.literal("")),
});

export const createLeadInvite = createServerFn({ method: "POST" })
  .middleware([
    requireSupabaseAuth,
  ])
  .inputValidator((d) => createLeadInviteSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    // Verifica se quem chama é staff
    const { data: me } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();
    if (!me || (me.role !== "admin" && me.role !== "consultora")) {
      throw new Error("Apenas a equipe pode criar convites.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: invite, error } = await supabaseAdmin
      .from("form_invites")
      .insert({
        form_id: data.form_id,
        lead_name: data.lead_name,
        lead_email: data.lead_email || null,
        lead_whatsapp: data.lead_whatsapp || null,
        created_by: userId,
      } as any)
      .select("token")
      .single();
    if (error) throw new Error(error.message);
    return { token: invite.token };
  });

export const listLeads = createServerFn({ method: "GET" })
  .middleware([
    requireSupabaseAuth,
  ])
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("form_invites")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { leads: data ?? [] };
  });

const approveSchema = z.object({
  token: z.string().uuid(),
  password: z.string().min(8).max(128),
});

export const approveLeadInvite = createServerFn({ method: "POST" })
  .middleware([
    requireSupabaseAuth,
  ])
  .inputValidator((d) => approveSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const { data: me } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();
    if (!me || (me.role !== "admin" && me.role !== "consultora")) {
      throw new Error("Apenas a equipe pode aprovar leads.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: invite, error: invErr } = await supabaseAdmin
      .from("form_invites")
      .select("*")
      .eq("token", data.token)
      .maybeSingle();
    if (invErr) throw new Error(invErr.message);
    if (!invite) throw new Error("Convite não encontrado.");
    const leadEmail = (invite as any).lead_email as string | null;
    const leadName = (invite as any).lead_name as string | null;
    if (!leadEmail) throw new Error("Lead sem e-mail cadastrado.");

    // Cria usuário
    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: leadEmail,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: leadName, role: "cliente" },
    });
    if (createErr || !created.user) throw new Error(createErr?.message ?? "Falha ao criar usuário.");

    const newId = created.user.id;

    // Garante role cliente no profile
    await supabaseAdmin
      .from("profiles")
      .update({ role: "cliente", full_name: leadName ?? undefined } as any)
      .eq("id", newId);

    // Migra resposta para form_responses
    const answers = (invite as any).answers;
    if (answers) {
      await supabaseAdmin.from("form_responses").insert({
        form_id: invite.form_id,
        cliente_id: newId,
        answers,
      });
    }

    // Vincula invite ao novo cliente
    await supabaseAdmin
      .from("form_invites")
      .update({
        cliente_id: newId,
        approved_at: new Date().toISOString(),
        approved_cliente_id: newId,
      } as any)
      .eq("token", invite.token);

    return { ok: true, cliente_id: newId, email: leadEmail };
  });
