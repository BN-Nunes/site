import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated/vendored output that should never be linted:
    ".vercel/**",
    ".vinext/**",
    ".wrangler/**",
    ".openai/**",
    "dist/**",
    "node_modules/**",
  ]),
  {
    // `next/image` requires the built-in optimization endpoint, which is only
    // wired up for the Cloudflare Worker target in this project (see
    // worker/index.ts's `/_vinext/image` handler) and is unverified on the
    // Vercel/nitro deployment target. Every <img> in app/ already has
    // explicit width/height (checked manually) plus loading/decoding hints,
    // so the layout-shift and bandwidth risks the rule guards against are
    // already mitigated. Mass-converting to next/image risks breaking the
    // hand-tuned CSS positioning used throughout the design (absolute/cover
    // layouts, decorative overlays), so this is a deliberate, scoped
    // exception rather than a blanket disable.
    files: ["app/**/*.tsx"],
    rules: {
      "@next/next/no-img-element": "off",
    },
  },
]);

export default eslintConfig;
