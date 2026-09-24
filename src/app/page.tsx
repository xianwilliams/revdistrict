import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Hero } from "@/components/hero";
import { DriveSelector } from "@/components/drive-selector";
import { Film } from "@/components/film";
import { Visit } from "@/components/visit";
import { ButtonLink } from "@/components/ui";
import { toVehicleSummary } from "@/lib/vehicle";
import { getInventory } from "@/lib/inventory";
export default async function Home() {
  const inventory = await getInventory();
  return (
    <>
      <Hero />
      <div className="brand-strip">
        <span className="mono">UTAH ROOTS. A NEW DIRECTION.</span>
        <p>
          More than a car.<span className="gold"> A connection.</span>
        </p>
        <span className="mono">
          WELCOME TO THE DISTRICT <ArrowUpRight size={18} />
        </span>
      </div>
      <DriveSelector
        vehicles={inventory.vehicles.map(toVehicleSummary)}
        isPreview={inventory.isPreview}
      />
      <section className="story-section section" id="the-district">
        <div className="story-copy">
          <p className="eyebrow">THE PEOPLE BEHIND THE KEYS</p>
          <h2 data-reveal>
            Car people.
            <br />
            <span data-sheen>Your people.</span>
          </h2>
          <p>
            We get it. The late-night searches. The saved listings. That one car
            you keep coming back to.
          </p>
          <p>
            We’re here for all of it. RevDistrict is a place for your first car,
            your next adventure, and the one you’ve always wanted. Real
            conversations with people who love this as much as you do.
          </p>
          <ButtonLink href="/our-story" variant="text">
            Meet RevDistrict
          </ButtonLink>
          <span className="story-coordinate mono">
            40.6233° N &nbsp; 111.8974° W
          </span>
        </div>
        <div className="story-film-wrap" data-image-reveal>
          <Film />
          <div className="story-inset">
            <img
              src="/images/district-culture.webp"
              width="800"
              height="400"
              alt="The team gathering around a car in the showroom"
              loading="lazy"
            />
            <span className="mono">A LITTLE LOOK BEHIND THE SCENES.</span>
          </div>
          <span className="film-edge-label mono">CARS BRING US TOGETHER.</span>
        </div>
      </section>
      <section className="paths-section section">
        <div className="paths-intro">
          <h2 data-reveal>
            Less friction.
            <br />
            <span data-sheen>More open road.</span>
          </h2>
          <p>
            A better way to get from
            <br />
            “what if” to “let’s go.”
          </p>
        </div>
        <div className="path-list">
          {[
            {
              href: "/inventory",
              title: "Find your next.",
              text: "Explore cars, trucks, and SUVs. Find the one that feels like you.",
              label: "EXPLORE INVENTORY",
              image: "/images/district-bmw.webp",
              note: "THE ONE YOU KEEP THINKING ABOUT",
            },
            {
              href: "/financing",
              title: "Make it happen.",
              text: "Explore your budget and start a secure financing application.",
              label: "EXPLORE FINANCING",
              image: "/images/district-interior.webp",
              note: "A PLAN FOR THE POSSIBILITY",
            },
            {
              href: "/sell-your-vehicle",
              title: "Turn the page.",
              text: "Selling or trading? Tell us what you’re driving. We’ll take it from there.",
              label: "SELL OR TRADE",
              image: "/images/district-detail.webp",
              note: "SOMETHING GOOD COMES NEXT",
            },
          ].map((item, i) => (
            <Link className="path-row" href={item.href} key={item.href}>
              <div className="path-visual">
                <img
                  src={item.image}
                  width="800"
                  height="400"
                  alt=""
                  loading="lazy"
                />
                <span className="mono">
                  0{i + 1} / {item.note}
                </span>
                <ArrowUpRight size={26} />
              </div>
              <div className="path-copy">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <span className="path-label mono">{item.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <Visit />
    </>
  );
}
