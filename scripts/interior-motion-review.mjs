import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
const dir = "research/interior-motion";
await fs.mkdir(dir, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});
const results = [];
for (const mode of [
  { width: 1440, height: 1000, motion: "no-preference" },
  { width: 390, height: 844, motion: "no-preference" },
  { width: 390, height: 844, motion: "reduce" },
]) {
  const context = await browser.newContext({
    viewport: { width: mode.width, height: mode.height },
    reducedMotion: mode.motion,
    isMobile: mode.width < 700,
    hasTouch: mode.width < 700,
  });
  await context.addInitScript(() => {
    Element.prototype.requestPointerLock = () => Promise.resolve();
    Element.prototype.setPointerCapture = () => {};
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const [path, scenes] of [
    ["/financing", [".finance-hero", ".finance-process", ".faq-section"]],
    ["/sell-your-vehicle", [".sell-hero", ".district-carousel"]],
    ["/our-story", [".story-page-hero", ".brand-reveal"]],
    ["/contact-us", [".contact-intro", ".contact-details"]],
    ["/inventory", [".inventory-intro"]],
  ]) {
    await page.goto("http://localhost:3001" + path, {
      waitUntil: "networkidle",
    });
    await page.evaluate(() => document.fonts.ready);
    for (const [i, selector] of scenes.entries()) {
      await page.locator(selector).evaluate((e) =>
        scrollTo({
          top: e.getBoundingClientRect().top + scrollY - 60,
          behavior: "instant",
        }),
      );
      await page.waitForTimeout(1300);
      await page.screenshot({
        path: `${dir}/${mode.width}-${mode.motion}-${path.slice(1)}-${i}.png`,
      });
      results.push({
        path,
        selector,
        mode,
        ...(await page.evaluate(() => ({
          overflow: document.documentElement.scrollWidth > innerWidth,
          videoPaused: document.querySelector(".ambient-film video")?.paused,
          brandOpacity: document.querySelector(".brand-reveal img")
            ? getComputedStyle(document.querySelector(".brand-reveal img"))
                .opacity
            : null,
          drawnIcons: [
            ...document.querySelectorAll("[data-icon-draw] path"),
          ].map((el) => getComputedStyle(el).strokeDashoffset),
        }))),
        errors: [...errors],
      });
    }
  }
  await context.close();
}
await fs.writeFile(`${dir}/results.json`, JSON.stringify(results, null, 2));
console.log(`Saved ${results.length} interior motion states.`);
await browser.close();
