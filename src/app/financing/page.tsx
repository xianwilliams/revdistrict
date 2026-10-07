import { Motion } from "@/components/motion";
import type { Metadata } from "next";
import Link from "next/link";
import { Plus, CarFront, FileCheck2, Calculator } from "lucide-react";
import { AmbientFilm } from "@/components/ambient-film";
import { PaymentCalculator } from "@/components/payment-calculator";
import { ButtonLink } from "@/components/ui";
import { site } from "@/lib/site";
export const metadata: Metadata = { title: "Financing your next chapter" };
export default function FinancingPage() {
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
            Great credit, a fresh start, or somewhere in between. We offer
            financing options through buy here, pay here. Let’s find the path
            that fits your situation.
          </p>
          <ButtonLink href="/financing/apply">
            Start your application
          </ButtonLink>
          <p className="secure-note">
            Apply right here. Individual and joint applications.
          </p>
        </div>
        <PaymentCalculator />
      </section>
      <section className="finance-options section" data-motion-section>
        <div className="section-heading">
          <div>
            <p className="eyebrow">MORE THAN ONE WAY FORWARD</p>
            <h2>
              Different credit.
              <br />
              <span className="gold">Real options.</span>
            </h2>
          </div>
          <p>
            Tell us where you are today.
            <br />
            We’ll help you explore the next step.
          </p>
        </div>
        <div className="finance-options-grid" data-stagger>
          <article>
            <span className="mono">01 / ESTABLISHED CREDIT</span>
            <h3>Build on a strong start.</h3>
            <p>
              Explore financing options for your next vehicle and talk through
              available rates, down payments and loan terms with the team.
            </p>
          </article>
          <article>
            <span className="mono">02 / BUILDING OR REBUILDING</span>
            <h3>Start a conversation.</h3>
            <p>
              First-time buyer or working through a credit setback? Tell us
              about your situation so we can discuss the programs available to
              you.
            </p>
          </article>
          <article>
            <span className="mono">03 / BUY HERE, PAY HERE</span>
            <h3>Another way forward.</h3>
            <p>
              Ask about our buy here, pay here options and how payments through
              the dealership can work for your purchase.
            </p>
          </article>
        </div>
        <p className="small muted">
          Financing is subject to application review and approval. Program
          availability, vehicle eligibility, down payment, rates and terms vary.
        </p>
      </section>
      <section className="finance-process section" data-motion-section>
        <div className="section-heading">
          <h2>
            From possibility
            <br />
            to your driveway.
          </h2>
          <p>
            Your next step is to get pre-approved.
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
            <h3>Get Approved.</h3>
            <p>
              Let’s get started on your pre-approval. Complete your application
              and we’ll help you explore a plan that fits your budget.
            </p>
            <Link className="text-link" href="/financing/apply">
              Start your application
            </Link>
          </li>
          <li>
            <div className="process-marker">
              <span className="mono">02</span>
              <FileCheck2 size={42} strokeWidth={1} data-icon-draw />
            </div>
            <h3>Explore your options.</h3>
            <p>
              We’ll review your application together and talk through the
              financing options available for your next vehicle.
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
              a: (
                <>
                  The{" "}
                  <Link className="faq-link" href="/financing/apply">
                    secure application
                  </Link>{" "}
                  asks for identity and contact details, residence history,
                  employment and income, and optional trade-in or co-applicant
                  information. The team or lender may ask for supporting
                  documents. Submit sensitive information only through the
                  secure application.
                </>
              ),
            },
            {
              q: "Can I trade in my current vehicle?",
              a: (
                <>
                  Yes. Start with our{" "}
                  <Link
                    className="faq-link"
                    href="/sell-your-vehicle#trade-form"
                  >
                    sell or trade form
                  </Link>{" "}
                  and tell us about your vehicle. Final trade value and any loan
                  payoff are confirmed with the team after inspection.
                </>
              ),
            },
            {
              q: "Do you offer buy here, pay here?",
              a: "Yes. Ask the team about our buy here, pay here options, eligible vehicles, down payments and payment schedules. Availability and terms depend on your application and vehicle.",
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
      <Motion />
    </>
  );
}
