import esbuild from 'esbuild';
import dotenv from 'dotenv';

dotenv.config();

async function run() {
  let ctx = await esbuild.context({
    entryPoints: ['./src/index.ts'],
    bundle: true,
    sourcemap: true,
    format: 'esm',
    outdir: './public/dist',
    logLevel: 'info',
    define: {
      'process.env.MAPBOX_TOKEN': JSON.stringify(process.env.MAPBOX_TOKEN),
      'process.env.AREA_SERVER_PATH': JSON.stringify(process.env.AREA_SERVER_PATH),
      'process.env.TILE_SERVER_PATH': JSON.stringify(process.env.TILE_SERVER_PATH)
    },
    loader: {
      ".png": "file",
      ".jpg": "file",
      ".jpeg": "file",
      ".svg": "file",
      ".gif": "file",
    },
  });

  await ctx.watch();

  console.log('Watching for changes...');
}

run();