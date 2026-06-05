import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export type Role = "admin" | "consultora" | "cliente";

export interface AuthState {
  loading: boolean;
  userId: string | null;
  role: Role | null;
  fullName: string | null;
}

/**
 * Hook to fetch the current authenticated user and their role.
 * Subscribes to auth state changes so sign-in/sign-out re-renders.
 */
export function useCurrentUser(): AuthState {
  const [state, setState] = useState<AuthState>({
    loading: true,
    userId: null,
    role: null,
    fullName: null,
  });

  useEffect(() => {
    let active = true;

    async function loadProfile(userId: string) {
      const { data } = await supabase
        .from("profiles")
        .select("role, full_name")
        .eq("id", userId)
        .maybeSingle();
      if (!active) return;
      setState({
        loading: false,
        userId,
        role: (data?.role as Role) ?? "cliente",
        fullName: data?.full_name ?? null,
      });
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setState({ loading: false, userId: null, role: null, fullName: null });
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setState({ loading: false, userId: null, role: null, fullName: null });
      }
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}

/**
 * Returns the destination route for a given role.
 */
export function homeForRole(role: Role | null): string {
  if (role === "admin" || role === "consultora") return "/admin";
  return "/area";
}

/**
 * Guard a route. `requireStaff: true` => only admin/consultora.
 * Redirects to /login when unauthenticated, and to the role's home when
 * an authenticated user tries to access the wrong area.
 */
export function useRequireAuth(options: { requireStaff?: boolean } = {}) {
  const auth = useCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.loading) return;
    if (!auth.userId) {
      navigate({ to: "/login" });
      return;
    }
    if (options.requireStaff && auth.role !== "admin" && auth.role !== "consultora") {
      navigate({ to: "/area" });
    }
  }, [auth.loading, auth.userId, auth.role, options.requireStaff, navigate]);

  return auth;
}
