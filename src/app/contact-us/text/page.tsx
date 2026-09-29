import { Motion } from "@/components/motion";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LeadForm } from "@/components/lead-form";
import { site } from "@/lib/site";
export const metadata: Metadata = { title: "Text the RevDistrict Team" };
export default function TextPage() {
  return (
    <section className="section text-request-page" data-motion-section>
      <Link className="application-back mono" href="/contact-us">
        <ArrowLeft size={15} /> Contact options
      </Link>
      <p className="eyebrow">A CONVERSATION, YOUR WAY</p>
      <h1>
        Start with
        <br />
        <span className="gold">a text.</span>
      </h1>
      <p>
        Leave your mobile number and a little about what you’re looking for. The
        team will text you back. Prefer to start in your messaging app?{" "}
        <a className="gold" href={site.smsHref}>
          Text {site.phone}
        </a>
        .
      </p>
      <LeadForm kind="text" />
      <Motion />
    </section>
  );
}
