import puppeteer from "puppeteer-core";
import { mkdirSync } from "node:fs";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const OUT = process.argv[2];
const WIDTH = Number(process.argv[3] ?? 1440);
const HEIGHT = Number(process.argv[4] ?? 900);

mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--hide-scrollbars", "--force-device-scale-factor=1"],
});

const page = await browser.newPage();
await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });

// Reduced motion disables the pinned flow and the entrance animations, so the
// captures show the finished layout of every section rather than mid-animation.
await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);

await page.goto("http://localhost:3000", { waitUntil: "networkidle0", timeout: 60000 });
await page.evaluate(() => document.fonts.ready);
await new Promise((r) => setTimeout(r, 1200));

await page.screenshot({ path: `${OUT}/full-page.png`, fullPage: true });

const sections = await page.evaluate(() =>
  [...document.querySelectorAll("main > section")].map((s) => ({
    id: s.id,
    top: Math.round(s.getBoundingClientRect().top + window.scrollY),
    height: Math.round(s.getBoundingClientRect().height),
  })),
);

for (const section of sections) {
  await page.evaluate((y) => window.scrollTo(0, y), Math.max(0, section.top));
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: `${OUT}/${section.id}.png` });
}

await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await new Promise((r) => setTimeout(r, 500));
await page.screenshot({ path: `${OUT}/footer.png` });

console.log(JSON.stringify({ viewport: `${WIDTH}x${HEIGHT}`, sections }, null, 1));
await browser.close();
