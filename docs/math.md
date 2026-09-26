# LaTeX math in Peekdown

Peekdown renders Markdown math with **KaTeX 0.18.9** and
**marked-katex-extension 5.1.13**, using the existing bundled **Marked 15.0.7**.
Open this document in Peekdown to try the examples below.

## Inline formulas

Write `$...$` for inline math: $E = mc^2$ or $O(n \log n)$.
Chinese text does not need extra spaces: 当$x=1$时，$x^2=1$。

## Display formulas

Put each `$$` delimiter on its own line and leave a blank line around the block:

$$
\sum_{i=1}^{n} i = \frac{n(n+1)}{2}
$$

$$
\begin{aligned}
a^2 + b^2 &= c^2 \\
x &= \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
\end{aligned}
$$

$$
A = \begin{pmatrix} 1 & 2 \\ 3 & 4 \end{pmatrix}
\qquad
f(x) = \begin{cases} x^2 & x \ge 0 \\ -x & x < 0 \end{cases}
$$

A fenced block with language `math` also renders a display formula:

```math
\int_0^1 x^2\,dx = \frac{1}{3}
```

## Literal text and errors

Ordinary code stays code: `$x_i$`. Fences marked `latex`, `tex`, `cpp`, etc.
retain the existing syntax-highlighting behavior, rather than rendering formulas.
Escape literal currency signs: `\$5 and \$10` displays as \$5 and \$10.
Dollar delimiters are intentionally recognized next to text; unescaped currency
pairs can therefore be interpreted as math.

An unfinished delimiter remains text while editing. An invalid completed formula
is shown as an error instead of stopping the document preview: $\frac{1}{$.

## Scope and implementation

This is support for **LaTeX math inside Markdown**, not a `.tex` document compiler.
Supported commands follow [KaTeX's support table](https://katex.org/docs/support_table.html).
Use dollar delimiters or `math` fences; `\(...\)` / `\[...\]`, automatic equation
numbering, cross-formula macro definitions, and arbitrary LaTeX packages are not enabled.
In Markdown tables use `\vert` instead of an unescaped `|` inside a formula.

[marked-katex-extension](https://github.com/UziTech/marked-katex-extension) is
listed in [Marked's official extension directory](https://marked.js.org/using_advanced#extensions).
Its published peer ranges include Marked 15 and KaTeX 0.18. It recognizes the math
tokens before Markdown can interpret their backslashes or underscores. We do not
maintain a separate math tokenizer or run an auto-render pass over generated HTML.

KaTeX's synchronous HTML + MathML output fits Peekdown's cached previews, tabs and
150 ms debounced split preview without introducing asynchronous typesetting.
MathJax is a valid choice for broader TeX features, but that additional scope is
not needed for this lightweight Markdown viewer.

`npm ci --ignore-scripts` installs pinned build inputs with lockfile integrity
checks. `npm run build:math` packages the upstream browser scripts and embeds
only the WOFF2 font sources into the stylesheet. Both MIT notices are included
in the script bundle. Rust then embeds these generated assets in the executable.
Node/npm and internet access are **build-time only**; the distributed EXE needs
neither a CDN nor a sibling asset folder. The generator reports the additional
uncompressed asset size. Generated files are ignored by Git.

To update the libraries, update their exact versions in `package.json` and
`package-lock.json`, regenerate the assets and run `npm test`. The npm copy of
Marked only satisfies the extension's peer dependency; the application and tests
continue using `src/frontend/marked.min.js`.
