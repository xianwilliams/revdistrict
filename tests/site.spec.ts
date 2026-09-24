import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const car = "/inventory/2024-acura-integra-a-spec-technology/1173076";
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    Element.prototype.requestPointerLock = () => Promise.resolve();
    Element.prototype.setPointerCapture = () => {};
  });
});
test("inventory search, empty results, filters, saving and pagination", async ({
  page,
}) => {
  await page.goto("/inventory");
  await expect(page.locator(".vehicle-card")).toHaveCount(12);
  await page.getByRole("button", { name: "Next page", exact: true }).click();
  await expect(page).toHaveURL(/page=2/);
  await page
    .getByRole("searchbox", { name: "Search inventory" })
    .fill("Acura Integra");
  await page.getByRole("button", { name: "Find your car" }).click();
  await expect(page.locator(".vehicle-card")).toHaveCount(1);
  await expect(page.locator(".vehicle-card")).toContainText("23,071");
  await page.getByRole("button", { name: "Save vehicle", exact: true }).click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Remove saved vehicle" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page
    .getByRole("searchbox", { name: "Search inventory" })
    .fill("no-such-car-xyz");
  await page.getByRole("button", { name: "Find your car" }).click();
  await expect(
    page.getByRole("heading", { name: "A little too specific?" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Clear filters", exact: true })
    .click();
  await page.getByLabel("Body style").selectOption("Truck");
  await expect(page).toHaveURL(/body=Truck/);
  await expect(page.locator(".vehicle-card")).toHaveCount(12);
});
test("signature drive selector carries its choice into inventory", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Performance/ }).click();
  await expect(
    page.getByRole("button", { name: /Performance/ }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("link", { name: "View collection" }).click();
  await expect(page).toHaveURL(/mode=performance/);
  await expect(page.getByLabel("Drive style")).toHaveValue("performance");
});
test("vehicle gallery, keyboard dialog and test drive intent work", async ({
  page,
}) => {
  await page.goto(car);
  const hero = page.locator(".gallery-main>img");
  const before = await hero.getAttribute("src");
  await page.getByRole("button", { name: "Next photo", exact: true }).click();
  await expect(hero).not.toHaveAttribute("src", before!);
  await page.getByRole("button", { name: "View gallery", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(".lightbox-controls")).toContainText("3 / 24");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page
    .locator(".purchase-panel")
    .getByRole("link", { name: "Request a test drive" })
    .click();
  await expect(page.getByLabel("Preferred date *")).toBeVisible();
  await expect(
    page
      .getByRole("button", { name: "Request a test drive", exact: true })
      .first(),
  ).toHaveAttribute("aria-pressed", "true");
  await page
    .getByRole("button", { name: "Ask a question", exact: true })
    .click();
  await expect(page.getByLabel("Preferred date *")).toHaveCount(0);
  await page
    .locator(".purchase-panel")
    .getByRole("link", { name: "Request a test drive" })
    .click();
  await expect(page.getByLabel("Preferred date *")).toBeVisible();
});
test("calculator responds to price, down payment, APR and term", async ({
  page,
}) => {
  await page.goto("/financing");
  await page.getByLabel("Vehicle price").fill("12000");
  await page.getByLabel("Down payment").fill("0");
  await page.getByRole("slider", { name: "APR" }).fill("0");
  await expect(page.locator(".payment-result strong")).toHaveText("$200");
  await page.getByLabel("Loan term").selectOption("36");
  await expect(page.locator(".payment-result strong")).toHaveText("$333");
});
test("contact form validates and reports unavailable delivery honestly", async ({
  page,
}) => {
  await page.goto("/contact-us");
  await page.getByLabel("First name *", { exact: true }).fill("Test");
  await page.getByLabel("Last name *", { exact: true }).fill("Driver");
  await page.getByLabel("Email *", { exact: true }).fill("driver@example.com");
  await page.getByLabel("Phone *", { exact: true }).fill("----------");
  await page
    .getByLabel("Your message *")
    .fill("This is a local validation test.");
  await page.getByLabel(/I agree to be contacted/).check();
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByLabel("Phone *", { exact: true })).toHaveJSProperty(
    "validationMessage",
    "Enter a valid phone number",
  );
  await page.getByLabel("Phone *", { exact: true }).fill("8015550123");
  await page.route("**/api/leads", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({
        message:
          "Online messages are not available yet. Your message has not been sent. Please call or email the team below.",
      }),
    }),
  );
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.locator(".form-error")).toContainText("has not been sent");
  await expect(page.locator(".form-success")).toHaveCount(0);
});
test("lead endpoint rejects cross-origin and unsupported content without forwarding", async ({
  request,
}) => {
  expect(
    (
      await request.post("/api/leads", {
        headers: { Origin: "https://invalid.example" },
        data: {},
      })
    ).status(),
  ).toBe(403);
  expect(
    (
      await request.post("/api/leads", {
        headers: {
          Origin: process.env.TEST_BASE_URL || "http://localhost:3000",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: "firstName=Test",
      })
    ).status(),
  ).toBe(415);
});
test("mobile navigation traps focus, closes, and routes", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Open menu" }).click();
  await page
    .getByRole("navigation", { name: "Expanded navigation" })
    .getByRole("link", { name: "Contact us" })
    .click();
  await expect(page).toHaveURL("/contact-us");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
});
test("film opens only on request, controls work, and closes with Escape", async ({
  page,
}) => {
  await page.goto("/");
  expect(await page.locator(".film-dialog video").count()).toBe(0);
  await page.getByRole("button", { name: "Play More than the cars." }).click();
  await expect(page.locator(".film-dialog video")).toHaveAttribute(
    "controls",
    "",
  );
  await expect(page.locator(".film-dialog video")).not.toHaveAttribute(
    "autoplay",
  );
  await page.keyboard.press("Escape");
  await expect(page.locator(".film-dialog video")).toHaveCount(0);
});
test("cinematic hero respects reduced motion, seeks chapters and exposes a pause control", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("/");
  const background = page.locator(".hero video");
  await expect(background).toHaveJSProperty("paused", true);
  await expect(background).toHaveAttribute("preload", "none");
  await expect(background).toHaveJSProperty("muted", true);
  await page
    .getByRole("button", { name: /A LOT OF PERSONALITY The people/ })
    .click();
  await expect
    .poll(() => background.evaluate((v: HTMLVideoElement) => v.currentTime))
    .toBeGreaterThanOrEqual(10);
  await expect(
    page.getByRole("button", { name: "Pause background film" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Pause background film" }).click();
  await expect(background).toHaveJSProperty("paused", true);
  await page.getByRole("button", { name: /Performance/ }).click();
  await expect(page.locator(".dial-mode")).toHaveText("SPORT");
  expect(
    errors.filter((message) => /hydrat|didn.t match/i.test(message)),
  ).toEqual([]);
});
test("background film pauses when the visitor leaves the hero", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const background = page.locator(".hero video");
  await expect(background).toHaveJSProperty("paused", false);
  await page.locator(".paths-section").scrollIntoViewIfNeeded();
  await expect(background).toHaveJSProperty("paused", true);
});
test("gold sheen travels with desktop scroll after display fonts load", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const sheen = page.locator(".hero [data-sheen]");
  await page.waitForTimeout(900);
  const initial = await sheen.evaluate((el) =>
    getComputedStyle(el).getPropertyValue("--sheen-position"),
  );
  await page.evaluate(() => scrollTo({ top: 280, behavior: "instant" }));
  await expect
    .poll(() =>
      sheen.evaluate((el) =>
        getComputedStyle(el).getPropertyValue("--sheen-position"),
      ),
    )
    .not.toBe(initial);
});
test("core pages pass automated accessibility checks", async ({ page }) => {
  for (const path of [
    "/",
    "/inventory",
    car,
    "/financing",
    "/sell-your-vehicle",
    "/contact-us",
  ]) {
    await page.goto(path);
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      result.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.map((n) => n.target),
      })),
      path,
    ).toEqual([]);
  }
});

test("gallery chooses a phone-sized source and preloads only the next photo", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const requests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("dealrimages")) requests.push(request.url());
  });
  await page.goto(car);
  const photo = page.locator(".gallery-main>img");
  await expect(photo).toHaveAttribute("srcset", /750w/);
  await photo.evaluate((img: HTMLImageElement) => img.decode());
  const current = await photo.evaluate(
    (img: HTMLImageElement) => img.currentSrc,
  );
  expect(Number(new URL(current).searchParams.get("w"))).toBeLessThan(1600);
  await expect
    .poll(() =>
      requests.some(
        (url) =>
          url.includes("QMUQ1HOI47XELE") &&
          Number(new URL(url).searchParams.get("w")) >= 360,
      ),
    )
    .toBe(true);
});

test("interior films respect reduced motion and trade photos can be browsed", async ({
  page,
}) => {
  for (const path of [
    "/sell-your-vehicle",
    "/financing",
    "/our-story",
    "/inventory",
    "/contact-us",
  ]) {
    await page.goto(path);
    const film = page.locator(".ambient-film video");
    await expect(film).toHaveJSProperty("paused", true);
    await expect(film).toHaveAttribute("preload", "none");
    await expect(page.locator(".ambient-film")).toBeVisible();
  }
  await page.goto("/sell-your-vehicle");
  const caption = page.locator(".district-carousel-caption p");
  await expect(caption).toHaveText("Every detail matters.");
  await page.getByRole("button", { name: "Next district photo" }).click();
  await expect(caption).toHaveText("Make room for what’s next.");
  await page.getByRole("button", { name: "Previous district photo" }).click();
  await expect(caption).toHaveText("Every detail matters.");
});
