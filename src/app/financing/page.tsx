import type { Metadata } from "next";
import {
  ArrowUpRight,
  LockKeyhole,
  Plus,
  CarFront,
  FileCheck2,
  Calculator,
} from "lucide-react";
import { AmbientFilm } from "@/components/ambient-film";
import { PaymentCalculator } from "@/components/payment-calculator";
import { ButtonLink } from "@/components/ui";
import { site } from "@/lib/site";
export const metadata: Metadata = { title: "Financing your next chapter" };
export default function FinancingPage() {
  const application =
    process.env.FINANCE_APPLICATION_URL ||
    "https://www.utahusedcarfactory.com/financing";
  return (
    <>
      <section className="finance-hero section" data-motion-section>
        <div className="finance-copy">
          <AmbientFilm
            src="/video/district-cabin-loop.mp4"
            poster="/images/district-interior.webp"
            label="Financing"
            className="finance-atmosphere"
          />
          <p className="eyebrow">THE ROAD AHEAD</p>
          <h1>
            Your next car.
            <br />
            <span className="gold">A plan that fits.</span>
          </h1>
          <p>
            Let’s bring the possibilities into focus. Explore a monthly payment,
            ask us about financing, and take the next step when you’re ready.
          </p>
          <a
            className="button button--gold"
            href={application}
            target="_blank"
            rel="noreferrer"
          >
            <span>Start your application</span>
            <ArrowUpRight size={18} />
          </a>
          <p className="secure-note">
            <LockKeyhole size={14} /> Opens our secure dealer-hosted application
          </p>
          <p className="small muted">
            You may see The Used Car Factory name while our rebrand is in
            progress.
          </p>
        </div>
        <PaymentCalculator />
      </section>
      <section className="finance-process section" data-motion-section>
        <div className="section-heading">
          <h2>
            From possibility
            <br />
            to your driveway.
          </h2>
          <p>
            We’ll help you understand the next step.
            <br />
            Bring your questions. That’s what we’re here for.
          </p>
        </div>
        <ol className="process-list" data-stagger>
          <li>
            <div className="process-marker">
              <span className="mono">01</span>
              <CarFront size={42} strokeWidth={1} data-icon-draw />
            </div>
            <h3>Find your car.</h3>
            <p>
              Start with the vehicle that fits your life. Your budget is part of
              the conversation from the beginning.
            </p>
          </li>
          <li>
            <div className="process-marker">
              <span className="mono">02</span>
              <FileCheck2 size={42} strokeWidth={1} data-icon-draw />
            </div>
            <h3>Explore your options.</h3>
            <p>
              Complete the secure application with your personal, residence,
              employment, and optional co-applicant details.
            </p>
          </li>
          <li>
            <div className="process-marker">
              <span className="mono">03</span>
              <Calculator size={42} strokeWidth={1} data-icon-draw />
            </div>
            <h3>Know the numbers.</h3>
            <p>
              Review available lender terms with the team. Ask about the rate,
              total cost, down payment, and monthly payment.
            </p>
          </li>
        </ol>
      </section>
      <section className="faq-section section" data-motion-section>
        <div className="faq-intro">
          <h2>
            Good questions.
            <br />
            Straight answers.
          </h2>
          <figure className="faq-portrait" data-image-reveal>
            <img
              src="/images/district-people.webp"
              width="1200"
              height="675"
              alt="A member of the RevDistrict team in the showroom"
              loading="lazy"
              data-parallax
            />
            <figcaption className="mono">
              REAL PEOPLE. EVERY STEP OF THE WAY.
            </figcaption>
          </figure>
        </div>
        <div className="faq-list" data-stagger>
          {[
            {
              q: "Will the calculator affect my credit?",
              a: "No. The calculator runs in your browser and does not check your credit or send your financial inputs to us. It is an illustration, not a financing offer.",
            },
            {
              q: "What will I need to apply?",
              a: "The secure application asks for identity and contact details, residence history, employment and income, and optional trade-in or co-applicant information. The team or lender may ask for supporting documents. Submit sensitive information only through the secure application.",
            },
            {
              q: "Can I trade in my current vehicle?",
              a: "Yes. Start with our sell or trade form and tell us about your vehicle. Final trade value and any loan payoff are confirmed with the team after inspection.",
            },
            {
              q: "Is financing guaranteed?",
              a: "No. Financing, rates, and terms are subject to lender review and approval. The team can talk through your situation and the options available.",
            },
          ].map((f) => (
            <details key={f.q}>
              <summary>
                {f.q}
                <Plus size={19} />
              </summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="simple-cta section" data-motion-section>
        <h2>
          Let’s talk numbers.
          <br />
          Human to human.
        </h2>
        <div>
          <ButtonLink href="/contact-us">Let’s talk</ButtonLink>
          <a href={site.phoneHref}>{site.phone}</a>
        </div>
      </section>
    </>
  );
}
