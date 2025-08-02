import { build } from "esbuild";

const ENV = process.env.NODE_ENV || "development";

const BASE_URL_MAP = {
  local: "http://localhost:8888",
  development: "https://develop-api.chainit.online",
  staging: "https://staging-api.chainit.online",
  production: "https://api.chainit.online",
};

const sharedConfig = {
  entryPoints: ["./src/main.ts"],
  bundle: true,
  format: "iife",
  globalName: "AgeVerificationCDN",
  target: ["es6"],
  define: {
    "process.env.NODE_ENV": `"${ENV}"`,
    "process.env.API_BASE_URL": `"${BASE_URL_MAP[ENV]}"`,
  },
  sourcemap: false,
};

await build({
  ...sharedConfig,
  outfile: `dist/index.${ENV}.js`,
});

await build({
  ...sharedConfig,
  minify: true,
  outfile: `dist/index.${ENV}.min.js`,
});
