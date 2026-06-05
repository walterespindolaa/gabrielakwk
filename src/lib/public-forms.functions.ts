import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const tokenSchema = z.object({ token: z.string().uuid() });

export const getInviteForm = createServerFn({ method: "POST" })
  .inputValidator((d) => tokenSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: invite, error: invErr } = await supabaseAdmin
      .from("form_invites")
      .select("token, form_id, cliente_id, submitted_at")
      .eq("token", data.token)
      .maybeSingle();

    if (invErr) throw new Error(invErr.message);
    if (!invite) throw new Error("Convite não encontrado.");

    const [{ data: form, error: formErr }, { data: cliente }] = await Promise.all([
      supabaseAdmin
        .from("forms")
        .select("id, title, description, schema")
        .eq("id", invite.form_id)
        .maybeSingle(),
      supabaseAdmin
        .from("profiles")
        .select("full_name")
        .eq("id", invite.cliente_id)
        .maybeSingle(),
    ]);

    if (formErr) throw new Error(formErr.message);
    if (!form) throw new Error("Formulário não encontrado.");

    return {
      invite: {
        token: invite.token,
        already_submitted: !!invite.submitted_at,
      },
      cliente: { full_name: cliente?.full_name ?? null },
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
      .select("token, form_id, cliente_id, submitted_at")
      .eq("token", data.token)
      .maybeSingle();

    if (invErr) throw new Error(invErr.message);
    if (!invite) throw new Error("Convite inválido.");
    if (invite.submitted_at) throw new Error("Este formulário já foi enviado.");

    const { error: insErr } = await supabaseAdmin.from("form_responses").insert({
      form_id: invite.form_id,
      cliente_id: invite.cliente_id,
      answers: data.answers,
    });
    if (insErr) throw new Error(insErr.message);

    await supabaseAdmin
      .from("form_invites")
      .update({ submitted_at: new Date().toISOString() })
      .eq("token", invite.token);

    return { ok: true };
  });
