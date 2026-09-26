// Package upstream browser builds; no bundler and no network access at runtime.
import assert from 'node:assert/strict';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const output = resolve(root, 'src/frontend/vendor/math');
const katex = 'node_modules/katex';
const extension = 'node_modules/marked-katex-extension';
const manifest = JSON.parse(read('package.json'));
for (const name of ['katex', 'marked-katex-extension']) {
  const installed = JSON.parse(read(`node_modules/${name}/package.json`));
  assert.equal(installed.version, manifest.devDependencies[name], `Run npm ci for ${name}`);
}

// WebView2 supports WOFF2. Keep one source per face, embedded as a data URL,
// rather than shipping unused WOFF/TTF fallbacks or requesting external fonts.
let fontCount = 0;
const css = read(`${katex}/dist/katex.min.css`).replace(/src:[^;}]+/g, (sources) => {
  const font = sources.match(/url\(["']?(fonts\/[^)"']+\.woff2)["']?\)/);
  assert.ok(font, 'Expected a WOFF2 source in the upstream KaTeX stylesheet');
  const bytes = readFileSync(resolve(root, katex, 'dist', font[1]));
  fontCount++;
  return `src:url(data:font/woff2;base64,${bytes.toString('base64')}) format("woff2")`;
});
assert.ok(fontCount > 0, 'No KaTeX fonts were embedded');
assert.doesNotMatch(css, /url\((?!data:)/, 'Unexpected external CSS asset');

// Preserve both MIT notices inside the executable as well as in npm packages.
const notice = `/*! KaTeX\n${read(`${katex}/LICENSE`)}\nmarked-katex-extension\n${read(`${extension}/LICENSE`)}\n*/\n`;
const scripts = [
  read(`${katex}/dist/katex.min.js`),
  read(`${extension}/lib/index.umd.js`),
].join('\n;\n');
mkdirSync(output, { recursive: true });
writeFileSync(resolve(output, 'libraries.js'), notice + scripts);
writeFileSync(resolve(output, 'katex.css'), css);
console.log(`Embedded KaTeX + marked-katex-extension, ${fontCount} WOFF2 fonts (${Buffer.byteLength(notice + scripts + css)} bytes of uncompressed assets).`);
