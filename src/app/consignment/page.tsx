import { Motion } from "@/components/motion";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  Camera,
  MessagesSquare,
  KeyRound,
  Plus,
} from "lucide-react";
import { AmbientFilm } from "@/components/ambient-film";
import { DistrictCarousel } from "@/components/district-carousel";
import { LeadForm } from "@/components/lead-form";
import { ButtonLink } from "@/components/ui";
export const metadata: Metadata = {
  title: "Car Consignment in Utah",
  description:
    "Let RevDistrict sell your car for you. Explore professional vehicle consignment in Midvale, Utah, and request a consultation.",
};
export default function ConsignmentPage() {
  return (
    <>
      <section
        className="section cinematic-intro consignment-hero"
        data-motion-section
      >
        <AmbientFilm
          src="/video/district-drive-loop.mp4"
          poster="/images/district-detail.webp"
          label="Consignment"
        />
        <div className="cinematic-copy">
          <p className="eyebrow">YOUR CAR. OUR EXPERTISE.</p>
          <h1>
            We handle the sale.
            <br />
            <span className="gold">You get on with life.</span>
          </h1>
          <p className="cinematic-description">
            Let the professionals sell your car for you. Save the time, skip the
            back-and-forth, and put our experience to work toward a stronger
            sale.
          </p>
          <ButtonLink href="#consign">Let’s sell your car</ButtonLink>
        </div>
      </section>
      <section className="section consignment-process" data-motion-section>
        <div className="section-heading">
          <div>
            <p className="eyebrow">SELL WITH REVDISTRICT</p>
            <h2>
              Less on your plate.
              <br />
              More behind your sale.
            </h2>
          </div>
          <p>
            You’re getting the best price with professional presentation from
            people who know how to sell cars.
          </p>
        </div>
        <ol className="process-list" data-stagger>
          <li>
            <div className="process-marker">
              <span className="mono">01 / MAKE A PLAN</span>
              <Camera size={38} strokeWidth={1} data-icon-draw />
            </div>
            <h3>Set it up to sell.</h3>
            <p>
              We review your car together, discuss pricing and agree on the
              consignment terms before moving forward.
            </p>
          </li>
          <li>
            <div className="process-marker">
              <span className="mono">02 / LEAVE IT WITH US</span>
              <MessagesSquare size={38} strokeWidth={1} data-icon-draw />
            </div>
            <h3>We do the legwork.</h3>
            <p>
              Our team handles the presentation, buyer conversations and
              viewings, so selling doesn’t take over your schedule.
            </p>
          </li>
          <li>
            <div className="process-marker">
              <span className="mono">03 / MAKE THE HANDOFF</span>
              <KeyRound size={38} strokeWidth={1} data-icon-draw />
            </div>
            <h3>Finish with a team.</h3>
            <p>
              When a buyer is ready, we help coordinate the sale and paperwork
              according to the terms we agreed with you.
            </p>
          </li>
        </ol>
      </section>
      <section className="sell-body section" id="consign" data-motion-section>
        <aside>
          <p className="eyebrow">TELL US WHAT YOU’VE GOT</p>
          <h2>
            Your car deserves
            <br />a good introduction.
          </h2>
          <p className="consignment-intro">
            Share a few details and your selling goals. We’ll get in touch to
            discuss whether consignment is the right fit.
          </p>
          <DistrictCarousel />
          <div className="sell-note">
            <h3>Sell, trade or consign?</h3>
            <p>
              Consignment means we sell your car on your behalf. For a direct
              sale or a trade toward your next vehicle, use our Sell / Trade
              form.
            </p>
            <Link className="button button--text" href="/sell-your-vehicle">
              Explore Sell / Trade <ArrowUpRight size={16} />
            </Link>
          </div>
        </aside>
        <div className="sell-form-panel">
          <LeadForm kind="consignment" />
        </div>
      </section>
      <section className="faq-section section" data-motion-section>
        <div>
          <p className="eyebrow">BEFORE WE GET STARTED</p>
          <h2>
            A few good
            <br />
            questions.
          </h2>
        </div>
        <div className="faq-list" data-stagger>
          {[
            {
              q: "How much will my car sell for?",
              a: "We’ll recommend a price based on your car, the market and your goals. You decide the asking price and the lowest offer you’re comfortable accepting. We’ll bring every offer to you, so you always have the final say on whether to accept or decline.",
            },
            {
              q: "What are the fees and terms?",
              a: "We keep it simple and transparent. We’ll walk you through the fees, timeline and payment process together, answer your questions and put everything in writing before you get started. You’ll know exactly what to expect while our team takes care of the sale.",
            },
            {
              q: "What if I still have a loan?",
              a: "Still have a loan? We work with this all the time, and we’re happy to help. Share your approximate payoff balance, and we’ll walk you through the lender and title steps to keep your sale moving smoothly.",
            },
          ].map((faq) => (
            <details key={faq.q}>
              <summary>
                {faq.q}
                <Plus size={18} />
              </summary>
              <p>{faq.a}</p>
            </details>
          ))}
        </div>
      </section>
      <Motion />
    </>
  );
}
