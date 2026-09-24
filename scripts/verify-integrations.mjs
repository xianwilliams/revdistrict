import assert from "node:assert/strict";
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
  console.log(
    "PASS: authenticated inventory feed, active filtering, missing facts/photos, lead acceptance/rejection, validation and honeypot forwarding guards.",
  );
} finally {
  if (app && app.exitCode === null) {
    app.kill("SIGTERM");
    await new Promise((resolve) => app.once("exit", resolve));
  }
  if (fixture) await new Promise((resolve) => fixture.close(resolve));
  await rm(dir, { recursive: true, force: true });
}
