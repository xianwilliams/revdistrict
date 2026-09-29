import { Motion } from "@/components/motion";
import type { Metadata } from "next";
import { ArrowDownRight } from "lucide-react";
import { AmbientFilm } from "@/components/ambient-film";
import { DistrictCarousel } from "@/components/district-carousel";
import { LeadForm } from "@/components/lead-form";
export const metadata: Metadata = { title: "Sell or trade your vehicle" };
export default function SellPage() {
  return (
    <>
      <section
        className="sell-hero section cinematic-intro"
        data-motion-section
      >
        <AmbientFilm
          src="/video/district-drive-loop.mp4"
          poster="/images/district-road.webp"
          label="Sell and Trade"
        />
        <div className="cinematic-copy">
          <p className="eyebrow">SELL IT. TRADE IT. START SOMETHING NEW.</p>
          <h1>
            Good endings.
            <br />
            <span className="gold">Better beginnings.</span>
          </h1>
          <div>
            <p>
              Your car’s next chapter could be the start of yours.
              <br />
              Tell us a little about it. We’ll take it from there.
            </p>
            <ArrowDownRight size={58} strokeWidth={1} />
          </div>
        </div>
      </section>
      <section className="sell-body section" data-motion-section>
        <aside>
          <h2>
            A little less hassle.
            <br />A lot more human.
          </h2>
          <div className="sell-step" data-reveal>
            <span className="mono">01 / TELL US ABOUT IT</span>
            <p>
              Share your vehicle’s details, mileage and condition. Photos and
              service records can follow.
            </p>
          </div>
          <div className="sell-step" data-reveal>
            <span className="mono">02 / LET’S TAKE A LOOK</span>
            <p>
              We’ll get in touch to discuss the car and arrange a time to see it
              in person.
            </p>
          </div>
          <div className="sell-step" data-reveal>
            <span className="mono">03 / YOUR CALL</span>
            <p>
              Review the valuation, ask questions, and decide whether to sell or
              put it toward your next car.
            </p>
          </div>
          <DistrictCarousel />
          <div className="sell-note" data-reveal>
            <h3>Still paying it off?</h3>
            <p>
              Include the approximate balance. We can discuss the payoff process
              when we connect.
            </p>
          </div>
        </aside>
        <div className="sell-form-panel">
          <LeadForm kind="trade" />
        </div>
      </section>
      <Motion />
    </>
  );
}
