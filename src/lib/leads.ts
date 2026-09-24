import { z } from "zod";
const text = z.string().trim().max(200);
export const leadSchema = z
  .object({
    firstName: text.min(1),
    lastName: text.min(1),
    email: z
      .string()
      .trim()
      .max(254)
      .refine(
        (value) => !value || z.email().safeParse(value).success,
        "Enter a valid email address",
      )
      .default(""),
    phone: z
      .string()
      .trim()
      .max(30)
      .refine(
        (v) =>
          v.replace(/\D/g, "").length >= 10 &&
          v.replace(/\D/g, "").length <= 15,
        "Enter a valid phone number",
      ),
    message: z.string().trim().min(5).max(4000),
    intent: z.enum([
      "contact",
      "availability",
      "test-drive",
      "trade",
      "consignment",
      "text",
    ]),
    consent: z.literal(true),
    textConsent: z.boolean().default(false),
    website: z.string().max(200).default(""),
    vehicleId: text.optional(),
    vehicleName: text.optional(),
    preferredDate: z.string().max(10).optional(),
    preferredTime: z.string().max(80).optional(),
    trade: z
      .object({
        year: z.coerce
          .number()
          .int()
          .min(1900)
          .max(new Date().getFullYear() + 2),
        make: text.min(1),
        model: text.min(1),
        trim: text.optional(),
        mileage: z.coerce.number().min(0).max(2000000),
        vin: z.string().trim().max(17).optional(),
        condition: z.enum(["Excellent", "Good", "Fair", "Needs work"]),
        payoff: z.string().max(100).optional(),
      })
      .optional(),
  })
  .refine((v) => v.intent === "text" || Boolean(v.email), {
    message: "Enter your email address.",
    path: ["email"],
  })
  .refine((v) => v.intent !== "text" || v.textConsent, {
    message: "Consent to text is required for a text request.",
    path: ["textConsent"],
  })
  .refine((v) => !["trade", "consignment"].includes(v.intent) || !!v.trade, {
    message: "Vehicle details are required for a valuation.",
    path: ["trade"],
  })
  .refine(
    (v) =>
      v.intent !== "test-drive" || Boolean(v.preferredDate && v.preferredTime),
    { message: "Choose your preferred day and time.", path: ["preferredDate"] },
  );
export type Lead = z.infer<typeof leadSchema>;
const windows = new Map<string, { count: number; expires: number }>();
export function rateLimit(key: string, now = Date.now()) {
  for (const [id, value] of windows)
    if (value.expires <= now) windows.delete(id);
  if (windows.size >= 10000 && !windows.has(key)) return false;
  const current = windows.get(key);
  if (current && current.count >= 5) return false;
  windows.set(key, {
    count: (current?.count || 0) + 1,
    expires: current?.expires || now + 60000,
  });
  return true;
}
