import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { createServer } from "node:https";
import { createServer as createTcpServer } from "node:net";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync, spawn } from "node:child_process";

// Exercises the compiled app against isolated HTTPS fixtures, never a dealer service.
const dir = await mkdtemp(join(tmpdir(), "revdistrict-integration-"));
let app;
let fixture;
let browser;
try {
  const key = join(dir, "key.pem");
  const cert = join(dir, "cert.pem");
  execFileSync(
    "openssl",
    [
      "req",
      "-x509",
      "-newkey",
      "rsa:2048",
      "-nodes",
      "-days",
      "1",
      "-subj",
      "/CN=localhost",
      "-addext",
      "subjectAltName=DNS:localhost,IP:127.0.0.1",
      "-keyout",
      key,
      "-out",
      cert,
    ],
    { stdio: "ignore" },
  );
  const preview = JSON.parse(
    await readFile("src/data/inventory-preview.json", "utf8"),
  );
  const vehicle = {
    ...preview.vehicles[0],
    id: "fixture-active",
    slug: "fixture-car",
    name: "Fixture vehicle",
    model: "Fixture",
    images: [],
    price: 0,
    mileage: 0,
    status: "active",
  };
  const received = [];
  let rejectLead = false;
  let rejectFinance = false;
  const receivedFinance = [];
  fixture = createServer(
    { key: await readFile(key), cert: await readFile(cert) },
    async (req, res) => {
      assert.equal(req.headers.authorization, "Bearer local-test-only");
      res.setHeader("Content-Type", "application/json");
      if (req.url === "/feed") {
        res.end(
          JSON.stringify({
            capturedAt: new Date().toISOString(),
            source: "Local test fixture",
            vehicles: [
              vehicle,
              {
                ...vehicle,
                id: "fixture-sold",
                name: "Sold fixture",
                status: "sold",
              },
            ],
          }),
        );
        return;
      }
      let body = "";
      for await (const chunk of req) body += chunk;
      if (req.url === "/finance") {
        receivedFinance.push({
          body: JSON.parse(body),
          idempotencyKey: req.headers["idempotency-key"],
        });
        res.statusCode = 200;
        res.end(JSON.stringify({ accepted: !rejectFinance }));
        return;
      }
      received.push({
        body: JSON.parse(body),
        idempotencyKey: req.headers["idempotency-key"],
      });
      res.statusCode = rejectLead ? 500 : 202;
      res.end(JSON.stringify({ accepted: !rejectLead }));
    },
  );
  await new Promise((resolve) => fixture.listen(0, "127.0.0.1", resolve));
  const fixtureUrl = `https://127.0.0.1:${fixture.address().port}`;
  const portProbe = createTcpServer();
  await new Promise((resolve) => portProbe.listen(0, "127.0.0.1", resolve));
  const port = portProbe.address().port;
  await new Promise((resolve) => portProbe.close(resolve));
  const origin = `http://localhost:${port}`;
  app = spawn(process.execPath, ["server.cjs"], {
    env: {
      ...process.env,
      PORT: String(port),
      SITE_URL: origin,
      SITE_INDEXABLE: "false",
      NODE_EXTRA_CA_CERTS: cert,
      INVENTORY_FEED_URL: `${fixtureUrl}/feed`,
      INVENTORY_FEED_TOKEN: "local-test-only",
      LEAD_WEBHOOK_URL: `${fixtureUrl}/leads`,
      LEAD_WEBHOOK_TOKEN: "local-test-only",
      FINANCE_APPLICATION_ENABLED: "true",
      FINANCE_WEBHOOK_URL: `${fixtureUrl}/finance`,
      FINANCE_WEBHOOK_TOKEN: "local-test-only",
    },
    stdio: "ignore",
  });
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      await fetch(`${origin}/api/leads`);
      ready = true;
      break;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  assert.ok(ready, "Compiled app starts");
  const inventory = await (await fetch(`${origin}/inventory`)).text();
  assert.ok(inventory.includes("Photos coming soon"));
  assert.ok(inventory.includes("fixture-active"));
  assert.ok(!inventory.includes("fixture-sold"));
  assert.ok(!inventory.includes("Inventory preview"));
  const detail = await (
    await fetch(`${origin}/inventory/fixture-car/fixture-active`)
  ).text();
  assert.ok(detail.includes("Photos are on the way."));
  assert.ok(!detail.match(/<meta name="description"[^>]*0 miles/));
  const structured = [
    ...detail.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g),
  ]
    .map((match) => JSON.parse(match[1]))
    .find((data) => data["@type"] === "Car");
  assert.ok(structured, "Authorized active feed emits vehicle structured data");
  assert.ok(!structured.offers, "Unknown price is not a $0 offer");
  assert.ok(
    !structured.mileageFromOdometer,
    "Unknown mileage is not zero miles",
  );
  const lead = {
    firstName: "Local",
    lastName: "Fixture",
    email: "test@example.com",
    phone: "8015550123",
    message: "Synthetic integration test only.",
    intent: "contact",
    consent: true,
  };
  const submit = (data) =>
    fetch(`${origin}/api/leads`, {
      method: "POST",
      headers: { Origin: origin, "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  const accepted = await submit(lead);
  assert.equal(accepted.status, 201);
  assert.equal(received.length, 1);
  assert.equal(received[0].body.email, lead.email);
  assert.equal(received[0].body.id, received[0].idempotencyKey);
  assert.equal(received[0].body.textConsent, false);
  rejectLead = true;
  const rejected = await submit(lead);
  assert.equal(rejected.status, 502);
  assert.match((await rejected.json()).message, /couldn’t confirm delivery/);
  assert.equal((await submit({ ...lead, phone: "---" })).status, 400);
  assert.equal((await submit({ ...lead, website: "bot" })).status, 400);
  assert.equal(
    received.length,
    2,
    "Invalid and honeypot leads were never forwarded",
  );
  const finance = JSON.parse(
    await readFile("tests/fixtures/finance-application.json", "utf8"),
  );
  const postFinance = (data, headers = {}) =>
    fetch(`${origin}/api/finance`, {
      method: "POST",
      headers: {
        Origin: origin,
        "Content-Type": "application/json",
        "X-Forwarded-For": "192.0.2.15",
        ...headers,
      },
      body: JSON.stringify(data),
    });
  const financeAccepted = await postFinance(finance);
  assert.equal(financeAccepted.status, 201);
  const receipt = await financeAccepted.json();
  assert.equal(receivedFinance.length, 1);
  assert.equal(receipt.reference, receivedFinance[0].idempotencyKey);
  assert.equal(
    receivedFinance[0].body.application.applicant_ssn,
    finance.applicant_ssn,
  );
  assert.ok(!JSON.stringify(receipt).includes(finance.applicant_ssn));
  rejectFinance = true;
  assert.equal(
    (await postFinance(finance)).status,
    502,
    "A 200 response without accepted:true is not success",
  );
  rejectFinance = false;
  assert.equal(
    (await postFinance(finance, { Origin: "https://unrelated.example" }))
      .status,
    403,
  );
  const invalidFinance = await postFinance({
    ...finance,
    applicant_email: "not-an-email",
  });
  assert.equal(invalidFinance.status, 400);
  const invalidBody = await invalidFinance.text();
  assert.ok(!invalidBody.includes(finance.applicant_ssn));
  assert.ok(!invalidBody.includes("not-an-email"));
  assert.equal((await postFinance({ ...finance, website: "bot" })).status, 400);
  assert.equal(
    (await postFinance({ ...finance, message: "x".repeat(33000) })).status,
    413,
  );
  assert.equal(
    receivedFinance.length,
    2,
    "Rejected, invalid, cross-origin and honeypot requests were not forwarded",
  );

  // A real browser completes the enabled joint flow against this isolated HTTPS relay.
  browser = await chromium.launch({
    headless: true,
    executablePath:
      process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ||
      (process.platform === "darwin"
        ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
        : undefined),
  });
  const noJsContext = await browser.newContext({
    javaScriptEnabled: false,
    reducedMotion: "reduce",
  });
  const noJsPage = await noJsContext.newPage();
  await noJsPage.goto(`${origin}/financing/apply`);
  await noJsPage.locator('[name="applicant_name_first"]').fill("Synthetic");
  await noJsPage.locator('[name="applicant_ssn"]').fill(finance.applicant_ssn);
  let fallbackRequest;
  await noJsPage.route("**/*", async (route) => {
    if (route.request().isNavigationRequest()) {
      fallbackRequest = route.request();
      await route.fulfill({
        status: 415,
        body: "JavaScript is required to apply.",
      });
    } else await route.continue();
  });
  await noJsPage
    .getByRole("button", { name: "Continue", exact: true })
    .click({ force: true });
  assert.equal(
    fallbackRequest?.method(),
    "POST",
    "Unhydrated forms must not place sensitive data in a URL",
  );
  assert.equal(fallbackRequest?.url(), `${origin}/api/finance`);
  assert.ok(!noJsPage.url().includes(finance.applicant_ssn));
  await noJsContext.close();
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  await context.addInitScript(() => {
    Element.prototype.requestPointerLock = () => Promise.resolve();
    Element.prototype.setPointerCapture = () => {};
  });
  const page = await context.newPage();
  await page.goto(`${origin}/financing/apply`);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  assert.equal(
    await page
      .locator('[name="applicant_name_first"]')
      .evaluate((el) => document.activeElement === el),
    true,
  );
  await page.getByLabel("Joint application", { exact: true }).check();
  const co = Object.fromEntries(
    Object.entries(finance)
      .filter(([key]) => key.startsWith("applicant_"))
      .map(([key, value]) => [
        key.replace("applicant_", "coapplicant_"),
        value,
      ]),
  );
  const fillVisible = async () => {
    for (const [name, value] of Object.entries({ ...finance, ...co })) {
      const input = page.locator(`[name="${name}"]`);
      if (
        (await input.count()) === 1 &&
        (await input.isVisible()) &&
        (await input.isEnabled())
      ) {
        const tag = await input.evaluate((el) => el.tagName);
        const type = await input.getAttribute("type");
        if (tag === "SELECT") await input.selectOption(value);
        else if (!["checkbox", "radio"].includes(type)) await input.fill(value);
      }
    }
  };
  for (let step = 0; step < 4; step++) {
    await fillVisible();
    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    assert.deepEqual(
      accessibility.violations.map(({ id }) => id),
      [],
      `Application step ${step + 1} accessibility`,
    );
    if (step === 1) {
      await page.locator('[name="applicant_current_address_years"]').fill("1");
      assert.equal(
        await page.locator('[name="applicant_previous_address"]').isVisible(),
        true,
      );
      await page.locator('[name="applicant_current_address_years"]').fill("3");
      assert.equal(
        await page.locator('[name="applicant_previous_address"]').count(),
        0,
      );
    }
    await page.getByRole("button", { name: "Continue", exact: true }).click();
  }
  await page
    .getByRole("button", { name: "Submit application", exact: true })
    .waitFor();
  await page.locator('[name="acceptance_of_terms"]').check();
  await page.locator('[name="coapplicant_acceptance"]').check();
  const reviewAccessibility = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  assert.deepEqual(
    reviewAccessibility.violations.map(({ id }) => id),
    [],
    "Application review accessibility",
  );
  await page
    .getByRole("button", { name: "Submit application", exact: true })
    .click();
  await page.getByText("APPLICATION RECEIVED", { exact: true }).waitFor();
  assert.equal(receivedFinance.length, 3);
  assert.equal(receivedFinance[2].body.application.application_type, "joint");
  assert.equal(
    receivedFinance[2].body.application.coapplicant_ssn,
    finance.applicant_ssn,
  );
  assert.equal(
    await page.locator('input[type="password"]').count(),
    0,
    "Sensitive inputs clear after acceptance",
  );
  assert.deepEqual(
    await page.evaluate(() => [localStorage.length, sessionStorage.length]),
    [0, 0],
  );
  await context.close();
  console.log(
    "PASS: authenticated inventory feed, active filtering, missing facts/photos, lead acceptance/rejection, validation and honeypot forwarding guards; authenticated credit delivery, durable receipt, no sensitive error echo, two-year history and complete joint application in a browser.",
  );
} finally {
  if (browser) await browser.close();
  if (app && app.exitCode === null) {
    app.kill("SIGTERM");
    await new Promise((resolve) => app.once("exit", resolve));
  }
  if (fixture) await new Promise((resolve) => fixture.close(resolve));
  await rm(dir, { recursive: true, force: true });
}
