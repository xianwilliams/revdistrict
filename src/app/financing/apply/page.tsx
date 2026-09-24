import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FinanceApplication } from "@/components/finance-application";
import { financeApplicationConfig } from "@/lib/finance-config";
import { getInventory } from "@/lib/inventory";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Credit Application",
  robots: { index: false, follow: true },
};
export default async function ApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ entry_id?: string }>;
}) {
  const query = await searchParams;
  let vehicles: { id: string; name: string }[] = [];
  try {
    vehicles = (await getInventory()).vehicles.map(({ id, name }) => ({
      id,
      name,
    }));
  } catch {
    /* An inventory outage must not prevent an application. */
  }
  const selected = vehicles.some((v) => v.id === query.entry_id)
    ? query.entry_id
    : "";
  return (
    <section className="section application-page">
      <Link className="application-back mono" href="/financing">
        <ArrowLeft size={15} /> Back to financing
      </Link>
      <div className="application-intro">
        <div>
          <p className="eyebrow">THE NEXT STEP, TOGETHER</p>
          <h1>
            A plan for
            <br />
            <span className="gold">your next car.</span>
          </h1>
        </div>
        <p>
          Complete your application right here. We’ll help you explore financing
          for your situation, from established credit to buy here, pay here.
        </p>
      </div>
      <FinanceApplication
        enabled={financeApplicationConfig().enabled}
        vehicles={vehicles}
        selectedVehicle={selected}
      />
    </section>
  );
}
