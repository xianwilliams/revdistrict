import "server-only";

export function financeApplicationConfig() {
  const endpoint = process.env.FINANCE_WEBHOOK_URL || "";
  const token = process.env.FINANCE_WEBHOOK_TOKEN || "";
  let valid = false;
  try {
    const relay = new URL(endpoint);
    const site = new URL(process.env.SITE_URL || "");
    valid =
      relay.protocol === "https:" &&
      !relay.username &&
      !relay.password &&
      (site.protocol === "https:" ||
        ["localhost", "127.0.0.1"].includes(site.hostname));
  } catch {
    /* Missing configuration keeps collection disabled. */
  }
  return {
    endpoint,
    token,
    enabled:
      process.env.FINANCE_APPLICATION_ENABLED === "true" &&
      valid &&
      Boolean(token),
  };
}
