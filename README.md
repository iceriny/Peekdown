# Peekdown

A lightweight native Windows markdown viewer and editor. Native startup, polished rendering — in a single executable.

Built with Rust + WebView2. No installer, no runtime dependencies, no Electron.

![Preview mode](screenshot%201.jpg)
![Split view](screenshot%202.jpg)

## Features

- **Instant startup** — native window, no framework overhead
- **Live preview** — rendered markdown with full GFM support (tables, task lists, footnotes)
- **Split view** — side-by-side editor and preview with live sync (Ctrl+\\)
- **Syntax highlighting** — 30+ languages via highlight.js
- **LaTeX math** — inline `$...$`, display `$$...$$`, and `math` fences via KaTeX, fully offline
- **Multi-tab** — open multiple files, auto-hides tab bar for single files
- **Dark/Light themes** — Catppuccin Mocha and Latte color schemes
- **Find in document** — Ctrl+F with match highlighting and navigation
- **Table of Contents** — auto-generated outline sidebar (Ctrl+Shift+O)
- **Zoom** — Ctrl+/- or Ctrl+scroll, with level indicator
- **Drag & drop** — drop `.md` files to open, drop multiple to open tabs
- **Adjustable preview width** — drag the edge to resize
- **Recent files** — quick-open panel on empty tabs
- **Cross-mode selection** — selected text stays selected when toggling edit/preview
- **English and Chinese** — switch language in Settings; the choice is remembered
- **File associations** — register Peekdown for `.md` and `.txt` from Settings, then choose it in Windows Default apps
- **Single executable** — everything embedded, nothing to install

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| Ctrl+O | Open file |
| Ctrl+S | Save |
| Ctrl+Shift+S | Save As |
| Ctrl+N | New tab |
| Ctrl+W | Close tab |
| Ctrl+Tab | Next tab |
| Ctrl+Shift+Tab | Previous tab |
| Ctrl+E | Toggle edit/preview |
| Ctrl+\\ | Toggle split view |
| Ctrl+F | Find in document |
| Ctrl+Shift+O | Toggle outline |
| Ctrl+= / Ctrl+- | Zoom in/out |
| Ctrl+0 | Reset zoom |

## Build

Requires Rust, Node.js 24+ / npm, and the WebView2 runtime (pre-installed on Windows 10/11).
Node/npm are build tools only; the distributed executable does not need them.

```bash
npm ci --ignore-scripts
npm run build:math
cargo build --release --locked
```

Output: `target/release/peekdown.exe`

The math build embeds KaTeX's scripts, styles, WOFF2 fonts and license notices;
there are no runtime CDN requests or external asset folders. These assets add
approximately 632 KiB before linking. Generated assets are ignored by Git;
regenerate them after updating the locked math dependencies.

Run the focused frontend checks after generating assets:

```bash
npm test
```

## Math examples

Write `The complexity is $O(n \log n)$.` for an inline formula. For display math,
put `$$` on separate lines with a blank line around the block:

```markdown
$$
\sum_{i=1}^{n} i = \frac{n(n+1)}{2}
$$
```

See [the math examples and implementation notes](docs/math.md) for matrices,
aligned equations, literal dollar signs, supported syntax and library updates.
This renders LaTeX math inside Markdown, not complete `.tex` documents.

## Releases

Push a version tag matching `Cargo.toml` (for example, `v1.2.1`). GitHub Actions builds the Windows executable and publishes it as a GitHub Release asset. The workflow uses the repository's built-in `GITHUB_TOKEN`; no personal access token or secret is needed.

To use Peekdown as the default app for `.md` or `.txt`, open the gear menu in Peekdown and select **Set .md and .txt default apps…**. Peekdown registers itself for the current Windows user and opens its Default apps page. Select Peekdown for each extension there. Keep the executable at the same path after choosing it.

## Tech Stack

- **Rust** — window management, file I/O, IPC ([tao](https://github.com/niceshell/niceshell) + [wry](https://github.com/niceshell/niceshell))
- **WebView2** — rendering engine (Edge, pre-installed on Win10/11)
- **marked.js** — markdown to HTML
- **highlight.js** — code syntax highlighting
- **KaTeX + marked-katex-extension** — synchronous math rendering integrated with the existing parser
- **No Electron, no Node at runtime, no bundler** — all frontend assets are embedded at compile time via `include_str!`

## License

MIT
