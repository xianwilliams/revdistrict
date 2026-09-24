import { chromium } from "@playwright/test";
import fs from "node:fs/promises";

const dir = process.env.MOTION_SHOT_DIR || "research/editorial-motion";
await fs.mkdir(dir, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  executablePath:
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});
const results = [];
for (const mode of [
  { width: 1440, height: 1000, motion: "no-preference" },
  { width: 390, height: 844, motion: "no-preference" },
  { width: 1440, height: 1000, motion: "reduce" },
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
  await page.goto(process.env.TEST_BASE_URL || "http://localhost:3000", {
    waitUntil: "networkidle",
  });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.allSettled(
      [...document.images].map((img) => {
        img.loading = "eager";
        return img.decode();
      }),
    );
  });
  const prefix = `${mode.width}-${mode.motion}`;
  if (mode.motion === "no-preference") {
    await page.getByRole("button", { name: "Pause background film" }).click();
  }
  const heroHeight = await page
    .locator(".hero")
    .evaluate((el) => el.offsetHeight);
  for (const [index, progress] of [0, 0.12, 0.25, 0.4, 0.6, 0.8].entries()) {
    await page.evaluate(
      (y) => scrollTo({ top: y, behavior: "instant" }),
      heroHeight * progress,
    );
    await page.waitForTimeout(950);
    await page.screenshot({ path: `${dir}/${prefix}-hero-${index}.png` });
    results.push({
      mode: prefix,
      progress,
      ...(await page.evaluate(() => ({
        media: getComputedStyle(document.querySelector(".hero-media"))
          .transform,
        sideNote: getComputedStyle(document.querySelector(".hero-side-note"))
          .transform,
        dial: getComputedStyle(document.querySelector(".dial-orbit")).transform,
        sheen: getComputedStyle(
          document.querySelector(".hero [data-sheen]"),
        ).getPropertyValue("--sheen-position"),
        videoPaused: document.querySelector(".hero video").paused,
        headline: getComputedStyle(document.querySelector(".hero-copy"))
          .transform,
        overflow: document.documentElement.scrollWidth > innerWidth,
      }))),
    });
  }
  for (const [index, selector] of [
    "#find-your-drive",
    "#the-district",
    ".paths-section",
    ".visit-section",
  ].entries()) {
    const target = page.locator(selector);
    if (!(await target.count())) throw new Error(`Missing scene: ${selector}`);
    await target.evaluate((el) =>
      scrollTo({
        top: el.getBoundingClientRect().top + scrollY - 115,
        behavior: "instant",
      }),
    );
    await page.waitForTimeout(1000);
    if (index === 0) {
      await page.getByRole("button", { name: /Performance/ }).click();
      await page
        .locator(".featured-grid img")
        .evaluateAll((imgs) =>
          Promise.allSettled(imgs.map((img) => img.decode())),
        );
      await page.waitForTimeout(650);
    }
    await page.screenshot({ path: `${dir}/${prefix}-scene-${index}.png` });
  }
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  // Seek one representative frame from every cut and inspect live-text contrast.
  const reel = page.locator(".hero video");
  await reel.evaluate(async (video) => {
    if (video.readyState === 0) {
      video.load();
      await new Promise((resolve) =>
        video.addEventListener("loadedmetadata", resolve, { once: true }),
      );
    }
  });
  for (const [index, time] of [
    1.2, 4.6, 8.2, 11.4, 14.1, 17.2, 20.5,
  ].entries()) {
    await reel.evaluate(async (video, time) => {
      video.pause();
      if (Math.abs(video.currentTime - time) < 0.01) return;
      await new Promise((resolve) => {
        video.addEventListener("seeked", resolve, { once: true });
        video.currentTime = time;
      });
    }, time);
    await page.waitForTimeout(180);
    await page.screenshot({ path: `${dir}/${prefix}-film-${index}.png` });
  }
  results.push({
    mode: prefix,
    ...(await reel.evaluate((video) => ({
      source: video.currentSrc,
      width: video.videoWidth,
      height: video.videoHeight,
      duration: video.duration,
      muted: video.muted,
    }))),
  });
  await context.close();
}
await fs.writeFile(`${dir}/results.json`, JSON.stringify(results, null, 2));
await browser.close();
console.log(
  `Saved ${results.length} motion measurements and 51 screenshots to ${dir}`,
);
