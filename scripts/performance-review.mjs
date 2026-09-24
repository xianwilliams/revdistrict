import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
const output = process.env.PERF_OUTPUT || "research/performance/current.json";
const browser = await chromium.launch({
  headless: true,
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});
const results = [];
for (const width of [1440, 390]) {
  const context = await browser.newContext({
    viewport: { width, height: width === 390 ? 844 : 1000 },
    deviceScaleFactor: width === 390 ? 2 : 1,
    reducedMotion: "reduce",
  });
  await context.addInitScript(() => {
    Element.prototype.requestPointerLock = () => Promise.resolve();
    Element.prototype.setPointerCapture = () => {};
    window.__lcp = [];
    new PerformanceObserver((list) =>
      window.__lcp.push(
        ...list.getEntries().map((e) => ({
          time: e.startTime,
          url: e.url,
          tag: e.element?.tagName,
        })),
      ),
    ).observe({ type: "largest-contentful-paint", buffered: true });
  });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
  await cdp.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 150,
    downloadThroughput: (1.6 * 1024 * 1024) / 8,
    uploadThroughput: (750 * 1024) / 8,
  });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await page.goto(
    (process.env.TEST_BASE_URL || "http://localhost:3001") +
      "/inventory/2024-acura-integra-a-spec-technology/1173076",
    { waitUntil: "domcontentloaded" },
  );
  const photo = page.locator(".gallery-main>img");
  await photo.evaluate((img) => img.decode());
  await page.waitForTimeout(1200);
  const initial = await page.evaluate(() => ({
    lcp: window.__lcp.at(-1),
    navigation: performance.getEntriesByType("navigation")[0].toJSON(),
    imageRequests: performance
      .getEntriesByType("resource")
      .filter((r) => r.name.includes("dealrimages"))
      .map((r) => ({
        url: r.name,
        duration: r.duration,
        bytes: r.transferSize,
      })),
    image: document.querySelector(".gallery-main>img").currentSrc,
  }));
  const nextStart = Date.now();
  await page.getByRole("button", { name: "Next photo", exact: true }).click();
  await photo.evaluate((img) => img.decode());
  const nextMs = Date.now() - nextStart;
  results.push({
    width,
    network: "1.6 Mbps / 150 ms / 4x CPU",
    ...initial,
    nextMs,
  });
  await context.close();
}
await fs.mkdir("research/performance", { recursive: true });
await fs.writeFile(output, JSON.stringify(results, null, 2));
console.log(
  JSON.stringify(
    results.map((r) => ({
      width: r.width,
      lcpMs: r.lcp?.time,
      nextMs: r.nextMs,
      image: r.image,
      imageRequests: r.imageRequests.length,
    })),
    null,
    2,
  ),
);
await browser.close();
