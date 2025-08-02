import { build } from "esbuild";

const ENV = process.env.NODE_ENV || "local";
const BASE_API_URL = process.env.BASE_API_URL || "http://localhost:8888";

const sharedConfig = {
  entryPoints: ["./src/main.ts"],
  bundle: true,
  format: "iife",
  globalName: "IdentityVerificationCDN",
  target: ["es6"],
  define: {
    "process.env.NODE_ENV": JSON.stringify(ENV),
    "process.env.BASE_API_URL": JSON.stringify(BASE_API_URL),
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
