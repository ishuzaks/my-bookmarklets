import * as esbuild from "esbuild";

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: node esbuild.js <entryPoint>");
  process.exit(1);
}

// entryPoints に引数を設定
const entryPoints = args;

await esbuild.build({
  entryPoints: entryPoints,
  bundle: true,
  minify: true,
  platform: "browser",
  outdir: "dist",
});
