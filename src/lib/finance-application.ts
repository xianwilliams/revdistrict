import { z } from "zod";

export type FinanceField = {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "date" | "number" | "ssn" | "select";
  required?: boolean;
  options?: readonly string[];
  min?: number;
  max?: number;
  maxLength?: number;
  wide?: boolean;
};
export const states =
  "AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY".split(
    " ",
  );
const stateField = (name: string, required = true): FinanceField => ({
  name,
  label: "State",
  type: "select",
  options: states,
  required,
});
const duration = (prefix: string): FinanceField[] => [
  {
    name: `${prefix}_years`,
    label: "Years",
    type: "number",
    required: true,
    min: 0,
    max: 99,
  },
  {
    name: `${prefix}_months`,
    label: "Months",
    type: "number",
    required: true,
    min: 0,
    max: 11,
  },
];
const address = (prefix: string): FinanceField[] => [
  { name: prefix, label: "Street address", required: true, wide: true },
  { name: `${prefix}_city`, label: "City", required: true },
  stateField(`${prefix}_state`),
  { name: `${prefix}_zip`, label: "ZIP code", required: true, maxLength: 10 },
  ...duration(prefix),
];
export const identityFields: FinanceField[] = [
  { name: "name_first", label: "First name", required: true },
  { name: "name_middle", label: "Middle name" },
  { name: "name_last", label: "Last name", required: true },
  { name: "phone", label: "Phone", type: "tel", required: true, maxLength: 30 },
  {
    name: "email",
    label: "Email",
    type: "email",
    required: true,
    maxLength: 254,
  },
  { name: "dob", label: "Date of birth", type: "date", required: true },
  {
    name: "ssn",
    label: "Social Security number",
    type: "ssn",
    required: true,
    maxLength: 11,
  },
  {
    name: "drivers_license_number",
    label: "Driver’s license number",
    maxLength: 40,
  },
  {
    ...stateField("drivers_license_state", false),
    label: "License issuing state",
  },
  {
    name: "drivers_license_expiry",
    label: "License expiration date",
    type: "date",
    required: true,
  },
  {
    name: "bankruptcy",
    label: "Bankruptcy in the past five years?",
    type: "select",
    options: ["Yes", "No"],
    required: true,
    wide: true,
  },
];
export const residenceFields: FinanceField[] = [
  ...address("current_address"),
  {
    name: "current_address_housing_type",
    label: "Housing type",
    type: "select",
    options: [
      "Owns",
      "Rents",
      "Lease",
      "Lives w/ Parents",
      "Boards",
      "Owns free and clear",
      "Other",
    ],
    required: true,
  },
  {
    name: "current_address_monthly_payment",
    label: "Monthly housing payment ($)",
    type: "number",
    min: 0,
    max: 1000000,
    required: true,
  },
];
export const previousResidenceFields = address("previous_address");
export const employmentFields: FinanceField[] = [
  {
    name: "current_employer",
    label: "Current employer / income source",
    required: true,
    wide: true,
  },
  {
    name: "current_employer_address",
    label: "Employer street address",
    required: true,
    wide: true,
  },
  { name: "current_employer_city", label: "City", required: true },
  stateField("current_employer_state"),
  {
    name: "current_employer_zip",
    label: "ZIP code",
    required: true,
    maxLength: 10,
  },
  { name: "current_employer_position", label: "Position", required: true },
  {
    name: "current_employer_phone",
    label: "Employer phone",
    type: "tel",
    required: true,
    maxLength: 30,
  },
  ...duration("current_employer"),
  {
    name: "gross_monthly_income",
    label: "Gross monthly income ($)",
    type: "number",
    required: true,
    min: 0,
    max: 10000000,
  },
];
export const previousEmploymentFields: FinanceField[] = [
  { name: "previous_employer", label: "Previous employer", required: true },
  { name: "previous_employer_position", label: "Position", required: true },
  ...duration("previous_employer"),
];
export const tradeFields: FinanceField[] = [
  {
    name: "trade_year",
    label: "Year",
    type: "number",
    min: 1900,
    max: new Date().getFullYear() + 2,
    required: true,
  },
  { name: "trade_make", label: "Make", required: true },
  { name: "trade_model", label: "Model", required: true },
  { name: "trade_trim", label: "Trim" },
  { name: "trade_vin", label: "VIN", maxLength: 17 },
  { name: "trade_odo", label: "Mileage", type: "number", min: 0, max: 2000000 },
  {
    name: "trade_payoff",
    label: "Loan payoff ($)",
    type: "number",
    min: 0,
    max: 1000000,
  },
  {
    name: "trade_monthly_payment",
    label: "Monthly payment ($)",
    type: "number",
    min: 0,
    max: 1000000,
  },
];
export const purchaseFields: FinanceField[] = [
  { name: "entry_id", label: "Vehicle of interest", maxLength: 100 },
  {
    name: "cash_down",
    label: "Cash down payment ($)",
    type: "number",
    min: 0,
    max: 1000000,
  },
  {
    name: "message",
    label: "Anything else we should know?",
    maxLength: 2000,
    wide: true,
  },
];
export const financeAuthorization =
  "I certify that the information I have provided is accurate. I authorize RevDistrict and its financing providers to review this application, obtain consumer credit reports, verify employment and credit history, and share the application with lenders to evaluate financing. I have read the application terms and privacy notice. Submitting an application does not guarantee approval or commit me to a purchase.";
export const financeTermsVersion = "2026-09-24";
export type FinanceValues = Record<string, string>;
export type FinanceStep =
  "identity" | "residence" | "employment" | "coapplicant" | "vehicle";
export const financeSteps: { id: FinanceStep; title: string }[] = [
  { id: "identity", title: "About you" },
  { id: "residence", title: "Your address" },
  { id: "employment", title: "Your income" },
  { id: "coapplicant", title: "Co-applicant" },
  { id: "vehicle", title: "Vehicle & review" },
];
export function needsPrevious(
  values: FinanceValues,
  prefix: string,
  kind: "address" | "employer",
) {
  const years = values[`${prefix}_current_${kind}_years`];
  return years !== undefined && years !== "" && Number(years) < 2;
}
export const withPrefix = (fields: FinanceField[], prefix: string) =>
  fields.map((field) => ({ ...field, name: `${prefix}_${field.name}` }));
export function activeFinanceFields(
  values: FinanceValues,
  step?: FinanceStep,
): FinanceField[] {
  const person = (prefix: string, group?: FinanceStep) =>
    [
      ...(!group || group === "identity" ? identityFields : []),
      ...(!group || group === "residence"
        ? [
            ...residenceFields,
            ...(needsPrevious(values, prefix, "address")
              ? previousResidenceFields
              : []),
          ]
        : []),
      ...(!group || group === "employment"
        ? [
            ...employmentFields,
            ...(needsPrevious(values, prefix, "employer")
              ? previousEmploymentFields
              : []),
          ]
        : []),
    ].map((field) => ({ ...field, name: `${prefix}_${field.name}` }));
  return [
    ...(!step || ["identity", "residence", "employment"].includes(step)
      ? person("applicant", step)
      : []),
    ...((!step || step === "coapplicant") && values.application_type === "joint"
      ? person("coapplicant")
      : []),
    ...(!step || step === "vehicle"
      ? [...purchaseFields, ...(values.has_trade === "yes" ? tradeFields : [])]
      : []),
  ];
}
export function validateFinanceFields(
  values: FinanceValues,
  step?: FinanceStep,
) {
  const errors: Record<string, string> = {};
  for (const field of activeFinanceFields(values, step)) {
    const value = (values[field.name] || "").trim();
    if (!value) {
      if (field.required)
        errors[field.name] = `Enter ${field.label.toLowerCase()}.`;
      continue;
    }
    if (value.length > (field.maxLength || 200))
      errors[field.name] = "Please shorten this value.";
    else if (field.options && !field.options.includes(value))
      errors[field.name] = "Choose an available option.";
    else if (field.type === "email" && !z.email().safeParse(value).success)
      errors[field.name] = "Enter a valid email address.";
    else if (field.type === "tel" && !/^\+?[\d\s().-]{10,30}$/.test(value))
      errors[field.name] = "Enter a valid phone number.";
    else if (
      field.type === "tel" &&
      (value.replace(/\D/g, "").length < 10 ||
        value.replace(/\D/g, "").length > 15)
    )
      errors[field.name] = "Enter a valid phone number.";
    else if (field.type === "ssn" && !/^\d{3}-?\d{2}-?\d{4}$/.test(value))
      errors[field.name] = "Enter a nine-digit Social Security number.";
    else if (
      field.type === "date" &&
      (!/^\d{4}-\d{2}-\d{2}$/.test(value) ||
        !Number.isFinite(Date.parse(value)) ||
        new Date(value).toISOString().slice(0, 10) !== value)
    )
      errors[field.name] = "Enter a valid date.";
    else if (
      field.name.endsWith("_dob") &&
      (value >= new Date().toISOString().slice(0, 10) || value < "1900-01-01")
    )
      errors[field.name] = "Enter a valid date of birth.";
    else if (field.name.endsWith("_zip") && !/^\d{5}(-\d{4})?$/.test(value))
      errors[field.name] = "Enter a valid ZIP code.";
    else if (
      field.type === "number" &&
      (!/^\d+(\.\d{1,2})?$/.test(value) ||
        !Number.isFinite(Number(value)) ||
        Number(value) < (field.min ?? 0) ||
        Number(value) > (field.max ?? 10000000))
    )
      errors[field.name] =
        `Enter a number from ${field.min ?? 0} to ${field.max ?? 10000000}.`;
    else if (
      /(?:_years|_months|trade_year|trade_odo)$/.test(field.name) &&
      !Number.isInteger(Number(value))
    )
      errors[field.name] = "Enter a whole number.";
  }
  return errors;
}
const allFields = [
  ...withPrefix(
    [
      ...identityFields,
      ...residenceFields,
      ...previousResidenceFields,
      ...employmentFields,
      ...previousEmploymentFields,
    ],
    "applicant",
  ),
  ...withPrefix(
    [
      ...identityFields,
      ...residenceFields,
      ...previousResidenceFields,
      ...employmentFields,
      ...previousEmploymentFields,
    ],
    "coapplicant",
  ),
  ...tradeFields,
  ...purchaseFields,
];
const shape: Record<string, z.ZodType<string>> = Object.fromEntries(
  allFields.map((field) => [
    field.name,
    z
      .string()
      .trim()
      .max(field.maxLength || 200)
      .default(""),
  ]),
);
export const financeApplicationSchema = z
  .object({
    ...shape,
    application_type: z.enum(["individual", "joint"]),
    has_trade: z.enum(["yes", "no"]),
    acceptance_of_terms: z.literal("yes"),
    coapplicant_acceptance: z.enum(["", "yes"]).default(""),
    text_consent: z.enum(["", "yes"]).default(""),
    website: z.string().max(200).default(""),
  })
  .superRefine((values, context) => {
    for (const [name, message] of Object.entries(validateFinanceFields(values)))
      context.addIssue({ code: "custom", path: [name], message });
    if (
      values.application_type === "joint" &&
      values.coapplicant_acceptance !== "yes"
    )
      context.addIssue({
        code: "custom",
        path: ["coapplicant_acceptance"],
        message: "The co-applicant must accept the authorization.",
      });
  })
  .transform((values) => {
    // Exclude stale co-applicant, previous-history and trade fields after a choice changes.
    const active = activeFinanceFields(values).map((field) => field.name);
    const data: FinanceValues = values;
    return Object.fromEntries(
      [
        ...active,
        "application_type",
        "has_trade",
        "acceptance_of_terms",
        "coapplicant_acceptance",
        "text_consent",
        "website",
      ].map((key) => [
        key,
        key === "coapplicant_acceptance" && values.application_type !== "joint"
          ? ""
          : data[key] || "",
      ]),
    );
  });
