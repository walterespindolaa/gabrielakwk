import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";

export const Route = createFileRoute("/admin")({
  component: AdminRoot,
  head: () => ({
    meta: [
      { title: "Admin — Consultoria CRIAR" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function AdminRoot() {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}
