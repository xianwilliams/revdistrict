"use client";
import { useState, useEffect } from "react";
import { ArrowRight, CheckCircle2, Phone, Mail } from "lucide-react";
import Link from "next/link";
import { leadSchema } from "@/lib/leads";
import { site } from "@/lib/site";
export function LeadForm({
  kind = "contact",
  vehicle,
}: {
  kind?: "contact" | "availability" | "trade" | "consignment" | "text";
  vehicle?: { id: string; name: string };
}) {
  const vehicleSubmission = kind === "trade" || kind === "consignment";
  const [intent, setIntent] = useState<string>(kind),
    [state, setState] = useState<"idle" | "sending" | "success" | "error">(
      "idle",
    ),
    [message, setMessage] = useState("");
  useEffect(() => {
    if (kind !== "availability") return;
    const sync = () => {
      if (location.hash === "#test-drive") setIntent("test-drive");
    };
    const selectTestDrive = (event: MouseEvent) => {
      if (
        event.target instanceof Element &&
        event.target.closest('a[href="#test-drive"]')
      )
        setIntent("test-drive");
    };
    sync();
    window.addEventListener("hashchange", sync);
    document.addEventListener("click", selectTestDrive);
    return () => {
      window.removeEventListener("hashchange", sync);
      document.removeEventListener("click", selectTestDrive);
    };
  }, [kind]);
  async function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "sending") return;
    const form = event.currentTarget;
    const data = new FormData(form);
    setState("sending");
    setMessage("");
    const get = (key: string) => String(data.get(key) || "");
    const payload = {
      firstName: get("firstName"),
      lastName: get("lastName"),
      email: get("email"),
      phone: get("phone"),
      message: get("message"),
      intent,
      consent: data.get("consent") === "on",
      textConsent: data.get("textConsent") === "on",
      website: get("website"),
      ...(vehicle ? { vehicleId: vehicle.id, vehicleName: vehicle.name } : {}),
      ...(intent === "test-drive"
        ? {
            preferredDate: get("preferredDate"),
            preferredTime: get("preferredTime"),
          }
        : {}),
      ...(vehicleSubmission
        ? {
            trade: {
              year: Number(get("year")),
              make: get("make"),
              model: get("model"),
              trim: get("trim"),
              mileage: Number(get("mileage")),
              vin: get("vin"),
              condition: get("condition"),
              payoff: get("payoff"),
            },
          }
        : {}),
    };
    const validation = leadSchema.safeParse(payload);
    if (!validation.success) {
      for (const issue of validation.error.issues) {
        const name = String(issue.path.at(-1) || "");
        const field = form.elements.namedItem(name);
        if (
          field instanceof HTMLInputElement ||
          field instanceof HTMLTextAreaElement ||
          field instanceof HTMLSelectElement
        )
          field.setCustomValidity(issue.message);
      }
      setState("idle");
      form.reportValidity();
      return;
    }
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      setMessage(result.message);
      setState(response.ok ? "success" : "error");
      if (response.ok) form.reset();
    } catch {
      setState("error");
      setMessage(
        "We couldn’t confirm delivery. Please call or email the team before submitting again.",
      );
    }
  }
  if (state === "success")
    return (
      <div className="form-success" role="status">
        <CheckCircle2 size={40} />
        <h3>You’re on our radar.</h3>
        <p>{message}</p>
        <button
          className="button button--outline"
          onClick={() => {
            setState("idle");
            setMessage("");
          }}
        >
          Send another message <ArrowRight size={18} />
        </button>
      </div>
    );
  return (
    <form
      className="lead-form"
      onSubmit={submit}
      onInput={(event) => {
        const field = event.target;
        if (
          field instanceof HTMLInputElement ||
          field instanceof HTMLTextAreaElement ||
          field instanceof HTMLSelectElement
        )
          field.setCustomValidity("");
      }}
      action="/api/leads"
      method="post"
    >
      <fieldset disabled={state === "sending"}>
        <legend className="sr-only">
          {vehicleSubmission
            ? "Vehicle valuation request"
            : "Contact RevDistrict"}
        </legend>
        {vehicle && (
          <div className="inquiry-vehicle">
            <span className="mono">LET’S TALK ABOUT</span>
            <strong>{vehicle.name}</strong>
          </div>
        )}
        {kind === "availability" && (
          <div className="inquiry-tabs">
            <button
              type="button"
              aria-pressed={intent === "availability"}
              onClick={() => setIntent("availability")}
            >
              Ask a question
            </button>
            <button
              type="button"
              aria-pressed={intent === "test-drive"}
              onClick={() => setIntent("test-drive")}
            >
              Request a test drive
            </button>
          </div>
        )}
        {vehicleSubmission && (
          <>
            <div className="form-section-title">
              <span className="mono">01 / YOUR VEHICLE</span>
              <h3>What are you driving?</h3>
            </div>
            <div className="form-grid">
              <label>
                Year *
                <input
                  name="year"
                  type="number"
                  min="1900"
                  max={new Date().getFullYear() + 2}
                  required
                  placeholder="2021"
                />
              </label>
              <label>
                Make *
                <input
                  name="make"
                  maxLength={80}
                  required
                  placeholder="Toyota"
                />
              </label>
              <label>
                Model *
                <input
                  name="model"
                  maxLength={100}
                  required
                  placeholder="Tacoma"
                />
              </label>
              <label>
                Trim
                <input name="trim" maxLength={100} placeholder="TRD Off-Road" />
              </label>
              <label>
                Mileage *
                <input
                  name="mileage"
                  type="number"
                  min="0"
                  max="2000000"
                  required
                  placeholder="42000"
                />
              </label>
              <label>
                Overall condition *
                <select name="condition" required defaultValue="">
                  <option value="" disabled>
                    Select condition
                  </option>
                  {["Excellent", "Good", "Fair", "Needs work"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label>
                VIN (optional)
                <input
                  name="vin"
                  maxLength={17}
                  placeholder="17-character VIN"
                />
              </label>
              <label>
                Loan balance (optional)
                <input
                  name="payoff"
                  maxLength={100}
                  placeholder="Approximate payoff"
                />
              </label>
            </div>
            <div className="form-section-title">
              <span className="mono">02 / YOUR DETAILS</span>
              <h3>Let’s make an introduction.</h3>
            </div>
          </>
        )}
        <div className="form-grid">
          <label>
            First name *
            <input
              name="firstName"
              autoComplete="given-name"
              required
              maxLength={100}
              placeholder="First name"
            />
          </label>
          <label>
            Last name *
            <input
              name="lastName"
              autoComplete="family-name"
              required
              maxLength={100}
              placeholder="Last name"
            />
          </label>
          {kind !== "text" && (
            <label>
              Email *
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                placeholder="you@email.com"
              />
            </label>
          )}
          <label>
            Phone *
            <input
              name="phone"
              type="tel"
              autoComplete="tel"
              required
              minLength={10}
              maxLength={30}
              placeholder="(801) 555-0123"
            />
          </label>
          {intent === "test-drive" && (
            <>
              <label>
                Preferred date *
                <input
                  name="preferredDate"
                  type="date"
                  required
                  min={new Date().toLocaleDateString("en-CA", {
                    timeZone: "America/Denver",
                  })}
                />
              </label>
              <label>
                Preferred time *
                <select name="preferredTime" required defaultValue="">
                  <option value="" disabled>
                    Choose a time
                  </option>
                  {["10 AM–12 PM", "12 PM–2 PM", "2 PM–4 PM", "4 PM–6 PM"].map(
                    (t) => (
                      <option key={t}>{t}</option>
                    ),
                  )}
                </select>
              </label>
            </>
          )}
        </div>
        <label>
          {vehicleSubmission ? "Anything else we should know?" : "Your message"}{" "}
          *
          <textarea
            name="message"
            required
            minLength={5}
            maxLength={4000}
            rows={4}
            defaultValue={
              vehicle
                ? `Hi, I’m interested in the ${vehicle.name}. Is it still available?`
                : ""
            }
            placeholder={
              vehicleSubmission
                ? kind === "consignment"
                  ? "Condition, service history, your selling timeline and target price..."
                  : "Condition, upgrades, service history, or what you’d like to trade into..."
                : "What can we help you with?"
            }
          />
        </label>
        <div className="honeypot" aria-hidden="true">
          <label>
            Website
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        <label className="checkbox-label">
          <input type="checkbox" name="consent" required />
          <span>
            I agree to be contacted about this request and have read the{" "}
            <Link href="/privacy-policy">privacy policy</Link>. *
          </span>
        </label>
        <label className="checkbox-label">
          <input
            type="checkbox"
            name="textConsent"
            required={kind === "text"}
          />
          <span>
            {kind === "text"
              ? "I agree to receive text messages about this request."
              : "You may also text me about this request."}{" "}
            Message and data rates may apply. Reply STOP to opt out. Consent is
            not a condition of purchase.{kind === "text" && " *"}
          </span>
        </label>
        {state === "error" && (
          <div className="form-error" role="alert">
            <p>{message}</p>
            <div>
              <a href={site.phoneHref}>
                <Phone size={16} /> {site.phone}
              </a>
              <a href={`mailto:${site.email}`}>
                <Mail size={16} /> Email the team
              </a>
            </div>
          </div>
        )}
        <button
          type="submit"
          className="button button--gold form-submit"
          disabled={state === "sending"}
        >
          <span>
            {state === "sending"
              ? "Sending…"
              : vehicleSubmission
                ? kind === "consignment"
                  ? "Request a consignment consultation"
                  : "Request a valuation"
                : intent === "test-drive"
                  ? "Request a test drive"
                  : kind === "text"
                    ? "Request a text back"
                    : "Send message"}
          </span>
          <ArrowRight size={18} />
        </button>
        <p className="small muted">
          {intent === "test-drive"
            ? "Your appointment is confirmed only after our team contacts you."
            : vehicleSubmission
              ? kind === "consignment"
                ? "A consultation request is not a consignment agreement. Vehicle acceptance, pricing and fees are agreed with the team."
                : "A valuation request is not a binding offer. Final value is subject to inspection."
              : "Please don’t include Social Security numbers, bank details, or other sensitive information."}
        </p>
      </fieldset>
      <noscript>
        <p>
          Please call <a href={site.phoneHref}>{site.phone}</a> or email the
          team to get in touch without JavaScript.
        </p>
      </noscript>
    </form>
  );
}
