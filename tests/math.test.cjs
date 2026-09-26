const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

const frontend = path.join(__dirname, '../src/frontend');
const read = (file) => readFileSync(path.join(frontend, file), 'utf8');
const context = vm.createContext({ console, window: {} });
// Use the exact browser assets embedded by Rust, not npm's copy of Marked.
for (const file of ['highlight.min.js', 'marked.min.js', 'vendor/math/libraries.js', 'preview.js']) {
  vm.runInContext(read(file), context, { filename: file });
}
const parse = (markdown) => context.marked.parse(markdown);
const countMath = (html) => (html.match(/class="katex"/g) || []).length;

// These tests exercise integration boundaries; TeX parsing belongs to upstream.
test('inline math includes accessible MathML and uses the pinned KaTeX version', () => {
  assert.equal(context.katex.version, require('../package.json').devDependencies.katex);
  const html = parse(String.raw`Equation: $E = mc^2$.`);
  assert.equal(countMath(html), 1);
  assert.match(html, /<math[\s>]/);
  assert.match(html, /encoding="application\/x-tex"/);
  assert.doesNotMatch(html, /katex-display|katex-error/);
});

test('Chinese text can touch inline delimiters', () => {
  const html = parse('当$x=1$时，$x^2=1$。');
  assert.equal(countMath(html), 2);
  assert.doesNotMatch(html, /katex-error/);
});

test('multiline display math preserves TeX before Markdown parsing', () => {
  const html = parse(String.raw`$$
\begin{aligned}
x_1 &= \frac{a_1}{b_1} \\
x_2 &= \sqrt{c_2}
\end{aligned}
$$`);
  assert.equal(countMath(html), 1);
  assert.match(html, /katex-display/);
  assert.doesNotMatch(html, /katex-error|<em>/);
  assert.match(html, /\\begin\{aligned\}/);
});

test('math fences render as display math', () => {
  const html = parse('```math\n\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}\n```');
  assert.equal(countMath(html), 1);
  assert.match(html, /katex-display/);
  assert.doesNotMatch(html, /<pre>|katex-error/);
});

test('ordinary code spans and fences stay literal and highlighted', () => {
  const html = parse('`$x$`\n\n```cpp\nconst char* s = "$x$";\n```\n\n```latex\n$x_i$\n```');
  assert.equal(countMath(html), 0);
  assert.match(html, /<code>\$x\$<\/code>/);
  assert.match(html, /language-cpp/);
  assert.match(html, /hljs-type/);
  assert.match(html, /language-latex/);
});

test('escaped dollar signs and unclosed delimiters remain text', () => {
  assert.equal(countMath(parse(String.raw`Prices: \$5 and \$10.`)), 0);
  assert.equal(countMath(parse('Still typing $x + 1')), 0);
  assert.equal(countMath(parse('$$\nx + 1')), 0);
});

test('headings, tables, lists and blockquotes retain their Markdown structure', () => {
  const html = parse('# $x^2$\n\n| Formula |\n| --- |\n| $a+b$ |\n\n- $c+d$\n\n> $e+f$');
  assert.equal(countMath(html), 4);
  for (const tag of ['h1', 'table', 'li', 'blockquote']) assert.ok(html.includes(`<${tag}>`));
});

test('invalid completed formulas do not break the rest of the document', () => {
  const html = parse('Before\n\n$\\frac{1}{$\n\nAfter\n\n$x+1$');
  assert.match(html, /katex-error/);
  assert.match(html, /<p>Before<\/p>/);
  assert.match(html, /<p>After<\/p>/);
  assert.equal(countMath(html), 1);
});

test('untrusted TeX cannot create links or load images', () => {
  const html = parse(String.raw`$\href{https://example.com}{x}$ $\includegraphics{https://example.com/x.png}$`);
  assert.doesNotMatch(html, /<a[\s>]|<img[\s>]/);
});

test('rendering stays synchronous, deterministic and isolated between documents', () => {
  const before = parse(String.raw`$\peekdownMacro$`);
  parse(String.raw`$\gdef\peekdownMacro{secret}\peekdownMacro$`);
  assert.equal(parse(String.raw`$\peekdownMacro$`), before);
  const source = 'Text $x+1$\n\n$$\ny^2\n$$';
  assert.equal(typeof parse(source), 'string');
  assert.equal(parse(source), parse(source));
});

test('every bundled font is WOFF2 and no stylesheet URL needs a server', () => {
  const css = read('vendor/math/katex.css');
  const urls = [...css.matchAll(/url\(([^)]+)\)/g)].map((match) => match[1]);
  assert.ok(urls.length > 0);
  for (const url of urls) {
    assert.ok(url.startsWith('data:font/woff2;base64,'));
    assert.equal(Buffer.from(url.split(',')[1], 'base64').subarray(0, 4).toString(), 'wOF2');
  }
  assert.equal(urls.length, (css.match(/@font-face/g) || []).length);
});

test('the embedded library bundle preserves upstream license notices', () => {
  const script = read('vendor/math/libraries.js');
  assert.match(script, /Copyright \(c\).*Khan Academy/);
  assert.match(script, /Copyright.*markedjs/);
  assert.match(script, /Permission is hereby granted/);
});
