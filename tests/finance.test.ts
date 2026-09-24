import assert from "node:assert/strict";
import test from "node:test";
import fixture from "./fixtures/finance-application.json";
import {
  financeApplicationSchema,
  validateFinanceFields,
} from "../src/lib/finance-application";
import { leadSchema } from "../src/lib/leads";

test("credit application accepts complete individual data and strips inactive and unknown fields", () => {
  const parsed = financeApplicationSchema.parse({
    ...fixture,
    coapplicant_ssn: "000-99-9999",
    applicant_previous_employer: "Stale",
    trade_vin: "Stale",
    unexpected: "discard",
  });
  assert.equal(parsed.applicant_ssn, fixture.applicant_ssn);
  for (const field of [
    "coapplicant_ssn",
    "applicant_previous_employer",
    "trade_vin",
    "unexpected",
  ])
    assert.ok(!(field in parsed));
});
test("credit application requires the applicable two-year address and employment history", () => {
  for (const kind of ["address", "employer"]) {
    const result = financeApplicationSchema.safeParse({
      ...fixture,
      [`applicant_current_${kind}_years`]: "1",
    });
    assert.equal(result.success, false);
    if (!result.success)
      assert.ok(
        result.error.issues.some((e) =>
          String(e.path[0]).startsWith(`applicant_previous_${kind}`),
        ),
      );
  }
  assert.ok(
    Object.keys(
      validateFinanceFields(
        { ...fixture, applicant_current_address_years: "1" },
        "residence",
      ),
    ).length > 0,
  );
});
test("joint applications require a complete co-applicant and both authorizations", () => {
  const coapplicant = Object.fromEntries(
    Object.entries(fixture)
      .filter(([key]) => key.startsWith("applicant_"))
      .map(([key, value]) => [
        key.replace("applicant_", "coapplicant_"),
        value,
      ]),
  );
  assert.equal(
    financeApplicationSchema.safeParse({
      ...fixture,
      application_type: "joint",
    }).success,
    false,
  );
  assert.equal(
    financeApplicationSchema.safeParse({
      ...fixture,
      ...coapplicant,
      application_type: "joint",
    }).success,
    false,
  );
  assert.equal(
    financeApplicationSchema.safeParse({
      ...fixture,
      ...coapplicant,
      application_type: "joint",
      coapplicant_acceptance: "yes",
    }).success,
    true,
  );
  assert.equal(
    financeApplicationSchema.safeParse({ ...fixture, acceptance_of_terms: "" })
      .success,
    false,
  );
});
test("credit validation rejects invalid dates, phone numbers, months, SSNs and money", () => {
  for (const [key, value] of Object.entries({
    applicant_dob: "2025-02-30",
    applicant_ssn: "123",
    applicant_phone: "----------",
    applicant_current_address_months: "12",
    applicant_current_address_years: "1.5",
    applicant_gross_monthly_income: "-500",
    cash_down: "Infinity",
  }))
    assert.equal(
      financeApplicationSchema.safeParse({ ...fixture, [key]: value }).success,
      false,
      key,
    );
});
test("trade details are required only when trading, and consignment routes through the lead contract", () => {
  assert.equal(
    financeApplicationSchema.safeParse({ ...fixture, has_trade: "yes" })
      .success,
    false,
  );
  assert.equal(
    financeApplicationSchema.safeParse({
      ...fixture,
      has_trade: "yes",
      trade_year: "2020",
      trade_make: "Example",
      trade_model: "Car",
    }).success,
    true,
  );
  const lead = {
    firstName: "Synthetic",
    lastName: "Test",
    email: "test@example.com",
    phone: "8015550199",
    message: "Test consignment request",
    consent: true,
    intent: "consignment",
  };
  assert.equal(leadSchema.safeParse(lead).success, false);
  assert.equal(
    leadSchema.safeParse({
      ...lead,
      trade: {
        year: 2020,
        make: "Example",
        model: "Car",
        mileage: 45000,
        condition: "Good",
      },
    }).success,
    true,
  );
});
test("text-back requests allow no email but require explicit text consent", () => {
  const lead = {
    firstName: "Synthetic",
    lastName: "Test",
    phone: "8015550199",
    message: "Please text me back",
    consent: true,
    intent: "text",
  };
  assert.equal(leadSchema.safeParse(lead).success, false);
  assert.equal(
    leadSchema.safeParse({ ...lead, textConsent: true }).success,
    true,
  );
  assert.equal(
    leadSchema.safeParse({ ...lead, intent: "contact", textConsent: true })
      .success,
    false,
  );
});
