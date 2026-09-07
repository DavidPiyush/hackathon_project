import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  // Next.js allows JSX inside plain `.js` files, but Vite's oxc transform only
  // enables JSX for `.jsx`/`.tsx` by default. Widening the include lets the
  // tests import real route files such as `app/page.js`.
  plugins: [react({ include: /\.[jt]sx?$/ })],
  oxc: {
    include: /\.[jt]sx?$/,
  },
  resolve: {
    alias: {
      // Mirrors the `@/*` -> `./*` mapping in jsconfig.json. Without this the
      // tests cannot resolve the same import specifiers the app uses.
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.js"],
    include: ["__tests__/**/*.test.{js,jsx}"],
    css: false,
    // The console tests drive the real provider tree and type with
    // userEvent, which simulates per-character delays. The 5s default is
    // enough in isolation but not when suites run in parallel.
    testTimeout: 20000,
  },
});
