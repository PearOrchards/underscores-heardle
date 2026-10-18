import { defineConfig } from "cypress";
import { existsSync, readFileSync, statSync } from "node:fs";

// Next's dev and build cmds write their own manifests with different "action ids"
// We need these to tell which Server Action is which, so we can stub those too
const MANIFESTS = [
  ".next/dev/server/server-reference-manifest.json",
  ".next/server/server-reference-manifest.json",
];

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on("task", {
        serverActions() {
          const newestManifest = MANIFESTS
            .filter((file) => existsSync(file))
            .sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs)[0];
          if (!newestManifest) throw new Error("No manifests found... did you start the app?");

          // Map each server-action id to its exported name
          const manifest = JSON.parse(readFileSync(newestManifest, "utf8"));
          const actions: Record<string, string> = {};
          for (const [id, action] of Object.entries<{ exportedName: string }>(manifest.node ?? {})) {
            actions[id] = action.exportedName;
          }
          return actions;
        },
      });
    },
    viewportWidth: 1920,
    viewportHeight: 1080,
    baseUrl: "http://localhost:5000",
    supportFile: "cypress/support/e2e.ts", // Global intercepts here
    defaultCommandTimeout: 15000,
  },
});
