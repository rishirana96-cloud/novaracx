# Novara CX prospect deck

- **Source:** [novara-cx.html](novara-cx.html)
- **Shareable PDF:** [novara-cx.pdf](novara-cx.pdf)
- **Canvas:** nine 1440 × 810 slides (16:9).

## View and present

Open the HTML with the repository's `assets` folder intact, or serve the repository with `python3 -m http.server 8080` and open `http://localhost:8080/decks/novara-cx.html`.

Use the arrow keys, Page Up / Page Down, Home / End, or the on-screen controls. Overview shows all nine pages. The deck scales to smaller viewports. Fullscreen and Print / PDF are available in the toolbar.

## Regenerate the PDF

Node.js 22 or newer:

```sh
npm install --prefix decks/tools
cd decks/tools
npx playwright install chromium
cd ../..
node decks/tools/export.mjs --previews
```

The exporter serves the repository on a temporary loopback port, checks all nine slides and image assets, checks footer and canvas clearances, then writes `decks/novara-cx.pdf`. Optional PNG previews and a validation report go in `decks/.previews/`, which is ignored by git.

If using an already installed Chromium browser, set `NOVARA_PDF_BROWSER` to its executable path.

For a manual export, use Print / PDF, select Save as PDF, enable background graphics, disable browser headers and footers, and keep the CSS-defined page size with zero margins.

## Editing

Copy and layout live in the HTML. Change text, colors or slide-specific CSS there and regenerate the PDF before sharing. Keep printed slide height at 810 px. Controls are hidden for print, and all slides print even when only one is visible on screen.

## Content and asset notes

The product images reuse existing Novara CX website assets. Their figures are illustrative and are not presented as client performance results. The 500-hour example is explicitly calculated as 3,000 queries × 10 minutes ÷ 60; it is not a savings forecast. Starter pricing and coverage are founder-provided and should be reviewed before sharing a future revision.

No homepage changes are included.
