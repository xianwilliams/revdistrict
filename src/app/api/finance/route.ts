import { NextResponse, type NextRequest } from "next/server";
import { createHash, randomUUID } from "node:crypto";
import {
  financeApplicationSchema,
  financeTermsVersion,
} from "@/lib/finance-application";
import { financeApplicationConfig } from "@/lib/finance-config";
import { rateLimit } from "@/lib/leads";
export const runtime = "nodejs";
const reply = (body: object, status: number) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
export async function POST(request: NextRequest) {
  const config = financeApplicationConfig();
  if (!config.enabled)
    return reply(
      {
        message:
          "Online applications are not available yet. No application has been sent. Please call the team to apply.",
      },
      503,
    );
  const expected = new URL(process.env.SITE_URL!).origin;
  if (request.headers.get("origin") !== expected)
    return reply(
      { message: "Please apply from the RevDistrict website." },
      403,
    );
  if (!request.headers.get("content-type")?.includes("application/json"))
    return reply({ message: "Please use the application form." }, 415);
  const key = createHash("sha256")
    .update(
      "finance:" +
        (request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
          "local"),
    )
    .digest("hex");
  if (!rateLimit(key))
    return reply(
      { message: "Please wait a minute before trying again, or call us." },
      429,
    );
  if (Number(request.headers.get("content-length") || 0) > 32000)
    return reply({ message: "The application is too large." }, 413);
  let input: unknown;
  try {
    const reader = request.body?.getReader();
    if (!reader)
      return reply({ message: "Please complete the application." }, 400);
    const chunks: Uint8Array[] = [];
    let bytes = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 32000) {
        await reader.cancel();
        return reply({ message: "The application is too large." }, 413);
      }
      chunks.push(value);
    }
    input = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return reply(
      { message: "We couldn’t read the application. Please try again." },
      400,
    );
  }
  const result = financeApplicationSchema.safeParse(input);
  if (!result.success)
    return reply(
      {
        message: "Please check the required fields and authorizations.",
        fields: [
          ...new Set(
            result.error.issues.map((issue) =>
              String(issue.path[0] || "application_type"),
            ),
          ),
        ],
      },
      400,
    );
  if (result.data.website)
    return reply({ message: "This application could not be accepted." }, 400);
  const reference = randomUUID();
  const { website: _honeypot, ...application } = result.data;
  void _honeypot;
  try {
    const response = await fetch(config.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.token}`,
        "Idempotency-Key": reference,
      },
      body: JSON.stringify({
        id: reference,
        submittedAt: new Date().toISOString(),
        source: "RevDistrict credit application",
        termsVersion: financeTermsVersion,
        application,
      }),
      signal: AbortSignal.timeout(15000),
      redirect: "error",
      cache: "no-store",
    });
    if (!response.ok) throw new Error("Relay declined");
    const receipt = await response.json();
    if (receipt?.accepted !== true) throw new Error("No durable receipt");
    return reply(
      {
        message:
          "Your application has been received. The team will contact you about next steps. This is not a financing approval.",
        reference,
      },
      201,
    );
  } catch {
    // Never log application values or provider error bodies.
    console.error(
      JSON.stringify({ event: "finance.delivery_unconfirmed", reference }),
    );
    return reply(
      {
        message:
          "We couldn’t confirm receipt. Please call the team with this reference before sending another application.",
        reference,
      },
      502,
    );
  }
}
