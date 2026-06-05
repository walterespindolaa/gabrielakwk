import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const STAFF_ROLES = ["admin", "consultora"] as const;

async function assertStaff(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw new Error("Não foi possível verificar permissão.");
  if (!data || !STAFF_ROLES.includes(data.role)) {
    throw new Error("Acesso negado.");
  }
  return data.role as "admin" | "consultora";
}

const createSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(128),
  full_name: z.string().trim().min(1).max(120),
  role: z.enum(["admin", "consultora", "cliente"]),
});

export const createClientUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => createSchema.parse(d))
  .handler(async ({ data, context }) => {
    const callerRole = await assertStaff(context.supabase, context.userId);

    // Consultora cannot create admin or consultora accounts
    if (callerRole === "consultora" && data.role !== "cliente") {
      throw new Error("Apenas administradores podem criar membros da equipe.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        full_name: data.full_name,
        role: data.role,
      },
    });

    if (error || !created.user) {
      throw new Error(error?.message ?? "Falha ao criar usuário.");
    }

    // Ensure profile reflects role (trigger sets it, but make sure for existing rows)
    await supabaseAdmin
      .from("profiles")
      .upsert(
        { id: created.user.id, full_name: data.full_name, role: data.role },
        { onConflict: "id" },
      );

    return { id: created.user.id, email: created.user.email };
  });

const updateRoleSchema = z.object({
  user_id: z.string().uuid(),
  role: z.enum(["admin", "consultora", "cliente"]),
});

export const updateUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => updateRoleSchema.parse(d))
  .handler(async ({ data, context }) => {
    const callerRole = await assertStaff(context.supabase, context.userId);
    if (callerRole !== "admin") {
      throw new Error("Apenas administradores podem alterar papéis.");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ role: data.role })
      .eq("id", data.user_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const deleteSchema = z.object({ user_id: z.string().uuid() });

export const deleteUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => deleteSchema.parse(d))
  .handler(async ({ data, context }) => {
    const callerRole = await assertStaff(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Only admin can delete staff. Consultora may only delete clients.
    const { data: target } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", data.user_id)
      .maybeSingle();
    if (!target) throw new Error("Usuário não encontrado.");
    if (target.role !== "cliente" && callerRole !== "admin") {
      throw new Error("Apenas administradores podem excluir membros da equipe.");
    }

    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.user_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const signedUrlSchema = z.object({
  file_path: z.string().min(1).max(500),
  expires_in: z.number().int().min(30).max(3600).optional(),
});

export const getMaterialSignedUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => signedUrlSchema.parse(d))
  .handler(async ({ data, context }) => {
    // RLS on storage will scope to staff or assigned client.
    const { data: signed, error } = await context.supabase.storage
      .from("materiais")
      .createSignedUrl(data.file_path, data.expires_in ?? 300);
    if (error || !signed) throw new Error(error?.message ?? "Sem permissão para acessar este arquivo.");
    return { url: signed.signedUrl };
  });
