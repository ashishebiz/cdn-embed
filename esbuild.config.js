import { build } from "esbuild";

const sharedConfig = {
  entryPoints: ["./src/main.ts"],
  bundle: true,
  format: "iife",
  target: ["es6"],
  sourcemap: false,
};

await build({
  ...sharedConfig,
  outfile: "dist/index.js",
});

await build({
  ...sharedConfig,
  minify: true,
  outfile: "dist/index.min.js",
});
