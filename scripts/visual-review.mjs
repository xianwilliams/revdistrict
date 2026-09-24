import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
const browser = await chromium.launch({
  headless: true,
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});
const dir = process.env.SHOT_DIR || "research/screenshots-v3";
await fs.mkdir(dir, { recursive: true });
const paths = [
  "/",
  "/inventory",
  "/inventory/2024-acura-integra-a-spec-technology/1173076",
  "/financing",
  "/sell-your-vehicle",
  "/contact-us",
  "/our-story",
  "/privacy-policy",
];
const results = [];
for (const viewport of [
  { width: 1440, height: 1000 },
  { width: 390, height: 844 },
  { width: 360, height: 640 },
]) {
  const context = await browser.newContext({
    viewport,
    reducedMotion: "reduce",
  });
  await context.addInitScript(() => {
    Element.prototype.requestPointerLock = () => Promise.resolve();
    Element.prototype.setPointerCapture = () => {};
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const path of viewport.width === 360
    ? [
        "/",
        "/inventory",
        "/inventory/2024-acura-integra-a-spec-technology/1173076",
      ]
    : paths) {
    const response = await page.goto(
      (process.env.TEST_BASE_URL || "http://localhost:3000") + path,
      { waitUntil: "networkidle", timeout: 60000 },
    );
    await page.evaluate(() => document.fonts.ready);
    await page.locator("img").evaluateAll(async (imgs) => {
      await Promise.allSettled(
        imgs.map((img) => {
          img.loading = "eager";
          return img.decode();
        }),
      );
    });
    const slug = path.split("/").filter(Boolean).join("-") || "home";
    await page.screenshot({
      path: `${dir}/${viewport.width}-${slug}.png`,
      fullPage: true,
    });
    if (path === "/" || path.includes("1173076"))
      await page.screenshot({
        path: `${dir}/${viewport.width}-${slug}-opening.png`,
      });
    results.push({
      path,
      width: viewport.width,
      status: response.status(),
      overflow: await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      errors: [...errors],
      brokenImages: await page
        .locator("img")
        .evaluateAll((imgs) =>
          imgs
            .filter((i) => !i.complete || i.naturalWidth === 0)
            .map((i) => i.src),
        ),
    });
  }
  await context.close();
}
await fs.writeFile(`${dir}/results.json`, JSON.stringify(results, null, 2));
console.log(
  JSON.stringify(
    results.map(({ path, width, status, overflow, errors, brokenImages }) => ({
      path,
      width,
      status,
      overflow,
      errors: errors.length,
      brokenImages: brokenImages.length,
    })),
  ),
);
await browser.close();
