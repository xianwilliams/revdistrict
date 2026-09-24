import "server-only";
import { cache } from "react";
import { connection } from "next/server";
import preview from "@/data/inventory-preview.json";
import { inventorySchema, type Vehicle } from "./vehicle";
export const getInventory = cache(async () => {
  await connection();
  const endpoint = process.env.INVENTORY_FEED_URL;
  if (!endpoint)
    return {
      vehicles: inventorySchema.parse(preview).vehicles,
      isPreview: true,
      updatedAt: preview.capturedAt,
    };
  if (!endpoint.startsWith("https://"))
    throw new Error("Inventory feed must use HTTPS.");
  const response = await fetch(endpoint, {
    headers: process.env.INVENTORY_FEED_TOKEN
      ? { Authorization: `Bearer ${process.env.INVENTORY_FEED_TOKEN}` }
      : {},
    next: { revalidate: 300, tags: ["inventory"] },
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error("Inventory provider unavailable.");
  const payload = await response.text();
  if (payload.length > 10000000)
    throw new Error("Inventory feed exceeds the supported size.");
  const data = inventorySchema.parse(JSON.parse(payload));
  if (Date.now() - Date.parse(data.capturedAt) > 36 * 60 * 60 * 1000)
    throw new Error("Inventory feed is out of date.");
  return {
    vehicles: data.vehicles.filter((v: Vehicle) => v.status === "active"),
    isPreview: false,
    updatedAt: data.capturedAt,
  };
});
