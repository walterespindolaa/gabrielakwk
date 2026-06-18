import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const router = createRouter({
    routeTree,
    context: {},
    scrollRestoration: true,
    // Preload route code/data on hover or touch-start so navigation feels instant.
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    // Keep showing the previous screen during async transitions instead of flashing.
    defaultPendingMs: 250,
    defaultPendingMinMs: 300,
  });

  return router;
};

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
