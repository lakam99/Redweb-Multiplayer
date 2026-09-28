import { build } from 'esbuild';

await build({
  entryPoints: ['client/main.mjs'],
  outfile: 'public/game.bundle.js',
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: 'es2022',
});
