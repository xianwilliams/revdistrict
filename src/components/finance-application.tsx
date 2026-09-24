"use client";
import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  LockKeyhole,
  Phone,
} from "lucide-react";
import { site } from "@/lib/site";
import {
  activeFinanceFields,
  employmentFields,
  financeApplicationSchema,
  financeAuthorization,
  financeSteps,
  identityFields,
  needsPrevious,
  previousEmploymentFields,
  previousResidenceFields,
  residenceFields,
  tradeFields,
  validateFinanceFields,
  withPrefix,
  type FinanceField,
  type FinanceStep,
  type FinanceValues,
} from "@/lib/finance-application";

export function FinanceApplication({
  enabled,
  vehicles,
  selectedVehicle = "",
}: {
  enabled: boolean;
  vehicles: { id: string; name: string }[];
  selectedVehicle?: string;
}) {
  const [values, setValues] = useState<FinanceValues>({
    application_type: "individual",
    has_trade: "no",
    entry_id: selectedVehicle,
  });
  const [step, setStep] = useState<FinanceStep>("identity");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "unconfirmed" | "unavailable"
  >("idle");
  const [message, setMessage] = useState("");
  const [reference, setReference] = useState("");
  const form = useRef<HTMLFormElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const steps = financeSteps.filter(
    (s) => s.id !== "coapplicant" || values.application_type === "joint",
  );
  const index = steps.findIndex((s) => s.id === step);
  function change(name: string, value: string) {
    setValues((old) => ({ ...old, [name]: value }));
    setErrors((old) => {
      const next = { ...old };
      delete next[name];
      return next;
    });
  }
  function move(next: FinanceStep) {
    setStep(next);
    setErrors({});
    requestAnimationFrame(() => {
      title.current?.focus({ preventScroll: true });
      form.current?.scrollIntoView({ behavior: "instant", block: "start" });
    });
  }
  function report(next: Record<string, string>) {
    setErrors(next);
    const first = Object.keys(next)[0];
    requestAnimationFrame(() =>
      document.getElementById(`finance-${first}`)?.focus(),
    );
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending" || status === "unconfirmed") return;
    if (index < steps.length - 1) {
      const issues = enabled ? validateFinanceFields(values, step) : {};
      if (Object.keys(issues).length) return report(issues);
      move(steps[index + 1].id);
      return;
    }
    if (!enabled) return;
    const parsed = financeApplicationSchema.safeParse(values);
    if (!parsed.success) {
      const next = Object.fromEntries(
        parsed.error.issues.map((issue) => [
          String(issue.path[0]),
          issue.message,
        ]),
      );
      const firstStep = steps.find((s) =>
        activeFinanceFields(values, s.id).some((field) => next[field.name]),
      );
      if (firstStep && firstStep.id !== step) setStep(firstStep.id);
      report(next);
      return;
    }
    setStatus("sending");
    try {
      const response = await fetch("/api/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const result = await response.json();
      setMessage(
        result.message || "We couldn’t confirm receipt. Please call the team.",
      );
      setReference(result.reference || "");
      if (response.ok) {
        setValues({});
        setStatus("success");
      } else if (response.status === 400) {
        const invalid = Object.fromEntries(
          (result.fields || []).map((name: string) => [
            name,
            "Please check this field.",
          ]),
        );
        const firstStep = steps.find((s) =>
          activeFinanceFields(values, s.id).some(
            (field) => invalid[field.name],
          ),
        );
        if (firstStep) setStep(firstStep.id);
        report(invalid);
        setStatus("idle");
      } else if (response.status === 429) setStatus("idle");
      else if ([403, 413, 415, 503].includes(response.status))
        setStatus("unavailable");
      else setStatus("unconfirmed");
    } catch {
      setMessage(
        "We couldn’t confirm receipt. Please call the team before sending another application.",
      );
      setStatus("unconfirmed");
    }
  }
  function fields(items: FinanceField[], prefix?: string) {
    return (
      <div className="form-grid">
        {(prefix ? withPrefix(items, prefix) : items).map((field) => {
          const id = `finance-${field.name}`;
          const props = {
            id,
            name: field.name,
            value: values[field.name] || "",
            required: field.required,
            "aria-invalid": Boolean(errors[field.name]),
            "aria-describedby": errors[field.name] ? `${id}-error` : undefined,
            onChange: (
              event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
            ) => change(field.name, event.target.value),
          };
          return (
            <label
              key={field.name}
              className={field.wide ? "field-wide" : ""}
              htmlFor={id}
            >
              <span>
                {field.label}
                {field.required ? " *" : ""}
              </span>
              {field.options ? (
                <select {...props}>
                  <option value="">Select an option</option>
                  {field.options.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              ) : (
                <input
                  {...props}
                  type={
                    field.type === "ssn" ? "password" : field.type || "text"
                  }
                  inputMode={
                    field.type === "ssn" || field.name.endsWith("_zip")
                      ? "numeric"
                      : undefined
                  }
                  min={field.min}
                  max={field.max}
                  step={
                    field.type === "number"
                      ? /(_years|_months|trade_year|trade_odo)$/.test(
                          field.name,
                        )
                        ? "1"
                        : "0.01"
                      : undefined
                  }
                  maxLength={field.maxLength || 200}
                  autoComplete="off"
                />
              )}
              {errors[field.name] && (
                <span className="field-error" id={`${id}-error`}>
                  {errors[field.name]}
                </span>
              )}
            </label>
          );
        })}
      </div>
    );
  }
  function person(
    prefix: "applicant" | "coapplicant",
    group: "identity" | "residence" | "employment",
  ) {
    return (
      <>
        {group === "identity" && fields(identityFields, prefix)}
        {group === "residence" && (
          <>
            {fields(residenceFields, prefix)}
            {needsPrevious(values, prefix, "address") && (
              <div className="application-subsection">
                <h3>Previous address</h3>
                <p>
                  Include your previous address when you’ve lived here less than
                  two years.
                </p>
                {fields(previousResidenceFields, prefix)}
              </div>
            )}
          </>
        )}
        {group === "employment" && (
          <>
            <p className="application-help">
              You do not need to disclose alimony, child support or separate
              maintenance income unless you want it considered.
            </p>
            {fields(employmentFields, prefix)}
            {needsPrevious(values, prefix, "employer") && (
              <div className="application-subsection">
                <h3>Previous employment</h3>
                <p>
                  Include your previous employment when you’ve been here less
                  than two years.
                </p>
                {fields(previousEmploymentFields, prefix)}
              </div>
            )}
          </>
        )}
      </>
    );
  }
  if (status === "success")
    return (
      <div className="application-success" role="status">
        <CheckCircle2 size={44} />
        <p className="eyebrow">APPLICATION RECEIVED</p>
        <h2>
          Your next step
          <br />
          starts here.
        </h2>
        <p>{message}</p>
        <span className="mono">Reference: {reference}</span>
        <Link className="button button--gold" href="/inventory">
          Back to inventory <ArrowRight size={18} />
        </Link>
      </div>
    );
  return (
    <div className="application-layout">
      <aside className="application-progress">
        <p className="eyebrow">ONE STEP AT A TIME</p>
        <ol aria-label="Application steps">
          {steps.map((item, i) => (
            <li
              key={item.id}
              aria-current={step === item.id ? "step" : undefined}
            >
              <button
                type="button"
                disabled={status === "sending" || (enabled && i > index)}
                onClick={() => move(item.id)}
              >
                <span>{i < index ? <Check size={15} /> : `0${i + 1}`}</span>
                {item.title}
              </button>
            </li>
          ))}
        </ol>
        <div className="application-assistance">
          <Phone size={18} />
          <p>Questions along the way?</p>
          <a href={site.phoneHref}>{site.phone}</a>
        </div>
      </aside>
      <form
        ref={form}
        className="lead-form application-form"
        method="post"
        action="/api/finance"
        onSubmit={submit}
        noValidate
        autoComplete="off"
      >
        <noscript>
          <div className="application-notice">
            Enable JavaScript to complete this application, or call{" "}
            <a href={site.phoneHref}>{site.phone}</a> for help applying.
          </div>
        </noscript>
        {!enabled && (
          <div className="application-notice" role="status">
            <strong>Online applications are being connected.</strong>
            <p>
              You can explore the steps below. Information entry and submission
              are currently unavailable. To apply now, call{" "}
              <a href={site.phoneHref}>{site.phone}</a>.
            </p>
          </div>
        )}
        <div className="application-step-heading">
          <span className="mono">
            0{index + 1} / 0{steps.length}
          </span>
          <h2 ref={title} tabIndex={-1}>
            {steps[index]?.title}
          </h2>
          <p>Fields marked * are required.</p>
        </div>
        {step === "identity" && (
          <fieldset
            className="application-choice"
            disabled={status === "sending"}
          >
            <legend>Application type</legend>
            {[
              ["individual", "Individual"],
              ["joint", "Joint application"],
            ].map(([value, label]) => (
              <label key={value}>
                <input
                  type="radio"
                  name="application_type"
                  value={value}
                  checked={values.application_type === value}
                  onChange={() => change("application_type", value)}
                />
                {label}
              </label>
            ))}
          </fieldset>
        )}
        <fieldset
          disabled={
            !enabled ||
            status === "sending" ||
            status === "unconfirmed" ||
            status === "unavailable"
          }
        >
          <legend className="sr-only">{steps[index]?.title} information</legend>
          {["identity", "residence", "employment"].includes(step) &&
            person(
              "applicant",
              step as "identity" | "residence" | "employment",
            )}
          {step === "coapplicant" && (
            <>
              <p className="application-help">
                The co-applicant should enter their own details and review the
                authorization before submission.
              </p>
              {person("coapplicant", "identity")}
              <div className="application-subsection">
                <h3>Co-applicant residence</h3>
                {person("coapplicant", "residence")}
              </div>
              <div className="application-subsection">
                <h3>Co-applicant employment</h3>
                {person("coapplicant", "employment")}
              </div>
            </>
          )}
          {step === "vehicle" && (
            <>
              <div className="form-grid">
                <label className="field-wide">
                  Vehicle of interest
                  <select
                    name="entry_id"
                    value={values.entry_id || ""}
                    onChange={(e) => change("entry_id", e.target.value)}
                  >
                    <option value="">I’m still exploring</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              {fields([
                {
                  name: "cash_down",
                  label: "Cash down payment ($)",
                  type: "number",
                  min: 0,
                  max: 1000000,
                },
              ])}
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="has_trade"
                  checked={values.has_trade === "yes"}
                  onChange={(e) =>
                    change("has_trade", e.target.checked ? "yes" : "no")
                  }
                />
                <span>I have a vehicle to trade in.</span>
              </label>
              {values.has_trade === "yes" && (
                <div className="application-subsection">
                  <h3>Your trade-in</h3>
                  {fields(tradeFields)}
                </div>
              )}
              <label>
                Anything else we should know?
                <textarea
                  name="message"
                  rows={3}
                  maxLength={2000}
                  value={values.message || ""}
                  onChange={(e) => change("message", e.target.value)}
                />
              </label>
              <div className="application-review">
                <h3>Review your application</h3>
                <dl>
                  <div>
                    <dt>Applicant</dt>
                    <dd>
                      {values.applicant_name_first || "—"}{" "}
                      {values.applicant_name_last}
                    </dd>
                  </div>
                  <div>
                    <dt>Application</dt>
                    <dd>
                      {values.application_type === "joint"
                        ? "Joint"
                        : "Individual"}
                    </dd>
                  </div>
                  <div>
                    <dt>Email</dt>
                    <dd>{values.applicant_email || "—"}</dd>
                  </div>
                  {values.application_type === "joint" && (
                    <div>
                      <dt>Co-applicant</dt>
                      <dd>
                        {values.coapplicant_name_first || "—"}{" "}
                        {values.coapplicant_name_last}
                      </dd>
                    </div>
                  )}
                </dl>
                <p>
                  Use the steps to review or edit your details. Social Security
                  numbers are not repeated here.
                </p>
              </div>
              <div className="application-authorization">
                <h3>Authorization</h3>
                <p>{financeAuthorization}</p>
                <p>
                  <Link
                    href="/financing/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Read application terms ↗
                  </Link>{" "}
                  ·{" "}
                  <Link
                    href="/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Privacy notice ↗
                  </Link>
                </p>
                <label className="checkbox-label">
                  <input
                    id="finance-acceptance_of_terms"
                    name="acceptance_of_terms"
                    type="checkbox"
                    required
                    checked={values.acceptance_of_terms === "yes"}
                    onChange={(e) =>
                      change(
                        "acceptance_of_terms",
                        e.target.checked ? "yes" : "",
                      )
                    }
                    aria-invalid={Boolean(errors.acceptance_of_terms)}
                  />
                  <span>
                    I am the applicant and I accept this authorization. *
                  </span>
                </label>
                {errors.acceptance_of_terms && (
                  <p className="field-error">
                    Please accept the applicant authorization.
                  </p>
                )}
                {values.application_type === "joint" && (
                  <>
                    <label className="checkbox-label">
                      <input
                        id="finance-coapplicant_acceptance"
                        name="coapplicant_acceptance"
                        type="checkbox"
                        required
                        checked={values.coapplicant_acceptance === "yes"}
                        onChange={(e) =>
                          change(
                            "coapplicant_acceptance",
                            e.target.checked ? "yes" : "",
                          )
                        }
                        aria-invalid={Boolean(errors.coapplicant_acceptance)}
                      />
                      <span>
                        I am the co-applicant and I accept this authorization. *
                      </span>
                    </label>
                    {errors.coapplicant_acceptance && (
                      <p className="field-error">
                        The co-applicant must accept the authorization.
                      </p>
                    )}
                  </>
                )}
                <label className="checkbox-label">
                  <input
                    name="text_consent"
                    type="checkbox"
                    checked={values.text_consent === "yes"}
                    onChange={(e) =>
                      change("text_consent", e.target.checked ? "yes" : "")
                    }
                  />
                  <span>
                    You may text me about this application. Message and data
                    rates may apply. Reply STOP to opt out. Consent is not a
                    condition of purchase.
                  </span>
                </label>
              </div>
            </>
          )}
          <div className="honeypot" aria-hidden="true">
            <label>
              Website
              <input
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={values.website || ""}
                onChange={(e) => change("website", e.target.value)}
              />
            </label>
          </div>
        </fieldset>
        {message && (
          <div className="form-error" role="alert">
            <p>{message}</p>
            {reference && <p className="mono">Reference: {reference}</p>}
            <a href={site.phoneHref}>Call {site.phone}</a>
          </div>
        )}
        <div className="application-actions">
          {index > 0 && (
            <button
              className="button button--outline"
              type="button"
              disabled={status === "sending"}
              onClick={() => move(steps[index - 1].id)}
            >
              <ArrowLeft size={17} /> Back
            </button>
          )}
          <button
            className="button button--gold"
            type="submit"
            disabled={
              status === "sending" ||
              status === "unconfirmed" ||
              status === "unavailable" ||
              (!enabled && index === steps.length - 1)
            }
          >
            {status === "sending"
              ? "Submitting…"
              : index === steps.length - 1
                ? "Submit application"
                : "Continue"}
            <ArrowRight size={18} />
          </button>
        </div>
        <p className="application-footnote">
          <LockKeyhole size={14} /> Your application is sent only when you
          submit. Unsubmitted details are not saved by this website.
        </p>
      </form>
    </div>
  );
}
