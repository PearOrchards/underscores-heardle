import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    viewportWidth: 1920,
    viewportHeight: 1080,
    baseUrl: "http://localhost:5000",
    supportFile: "cypress/support/e2e.ts", // Global intercepts here
    defaultCommandTimeout: 15000,
  },
});
