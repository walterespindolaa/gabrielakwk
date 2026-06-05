import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AreaLayout } from "@/components/area/AreaLayout";

export const Route = createFileRoute("/area")({
  component: AreaRoot,
  head: () => ({
    meta: [
      { title: "Sistema CRIA — Área de membros" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function AreaRoot() {
  return (
    <AreaLayout>
      <Outlet />
    </AreaLayout>
  );
}
