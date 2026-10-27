import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const deckPath = resolve(root, 'pptv1/index.html');
const outputPath = resolve(root, 'decks/novara-cx.pdf');
const previewDir = resolve(root, 'decks/.previews');
const mime = { '.html': 'text/html; charset=utf-8', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.pdf': 'application/pdf' };
await readFile(deckPath);
const server = createServer(async (req, res) => {
  try {
    let path = resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (path === resolve(root, 'pptv1')) path = resolve(path, 'index.html');
    if (path !== root && !path.startsWith(root + '/')) { res.writeHead(403).end(); return; }
    const data = await readFile(path);
    res.writeHead(200, { 'Content-Type': mime[extname(path)] || 'application/octet-stream' });
    res.end(data);
  } catch { res.writeHead(404).end(); }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
let browser;
try {
  browser = await chromium.launch({ headless: true, ...(process.env.NOVARA_PDF_BROWSER ? { executablePath: process.env.NOVARA_PDF_BROWSER } : {}) });
  const page = await browser.newPage({ viewport: { width: 1440, height: 810 }, deviceScaleFactor: 1 });
  await page.goto('http://127.0.0.1:' + server.address().port + '/pptv1/', { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.emulateMedia({ media: 'print' });
  const count = await page.locator('.slide').count();
  if (count !== 9) throw new Error('Expected nine slides; found ' + count);
  const broken = await page.evaluate(() => Array.from(document.images).filter(i => !i.complete || !i.naturalWidth).map(i => i.getAttribute('src')));
  if (broken.length) throw new Error('Missing images: ' + broken.join(', '));
  const layoutIssues = await page.evaluate(() => Array.from(document.querySelectorAll('.slide')).flatMap(slide => {
    const b = slide.getBoundingClientRect();
    const footer = slide.querySelector('.footer').getBoundingClientRect();
    return Array.from(slide.children).filter(e => !e.matches('.footer,.masthead')).flatMap(e => {
      const r = e.getBoundingClientRect();
      return r.bottom > footer.top - 8 || r.right > b.right + 1 || r.left < b.left - 1
        ? [{ slide: slide.id, element: e.className, message: 'Content reaches the footer or canvas edge' }] : [];
    });
  }));
  if (layoutIssues.length) throw new Error(JSON.stringify(layoutIssues, null, 2));
  // Downsample large screenshots while retaining vector text in the PDF.
  // Logos remain PNG so their transparency stays intact.
  await page.evaluate(async () => {
    for (const img of Array.from(document.images)) {
      if (img.naturalWidth < 200) continue;
      const canvas = document.createElement('canvas');
      canvas.width = Math.min(1600, img.naturalWidth);
      canvas.height = Math.round(canvas.width * img.naturalHeight / img.naturalWidth);
      const context = canvas.getContext('2d');
      context.fillStyle = '#f5f2ea';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(img, 0, 0, canvas.width, canvas.height);
      img.src = canvas.toDataURL('image/jpeg', .9);
      await img.decode();
    }
  });
  await page.pdf({ path: outputPath, printBackground: true, preferCSSPageSize: true, tagged: true });
  if (process.argv.includes('--previews')) {
    await mkdir(previewDir, { recursive: true });
    for (let i = 0; i < count; i++) await page.locator('.slide').nth(i).screenshot({ path: resolve(previewDir, 'slide-' + (i + 1) + '.png') });
    await writeFile(resolve(previewDir, 'validation.json'), JSON.stringify({ slides: count, brokenImages: broken, layoutIssues }, null, 2));
  }
  console.log('Exported nine landscape slides to ' + outputPath);
} finally {
  if (browser) await browser.close();
  await new Promise(done => server.close(done));
}
