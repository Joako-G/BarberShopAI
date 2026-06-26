import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    setupFiles: "./src/test/setup.ts",
    include: ["src/**/*.test.ts"],
    restoreMocks: true,
    clearMocks: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: [
        "src/modules/appointments/use-cases/**/*.ts",
        "src/modules/appointments/types/**/*.ts",
        "src/modules/dashboard/use-cases/**/*.ts",
        "src/shared/utils/business-time.ts",
        "src/middlewares/**/*.ts",
      ],
      exclude: ["**/index.ts"],
    },
  },
});
