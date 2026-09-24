import { ArrowUpRight, MapPin } from "lucide-react";
import { ButtonLink } from "./ui";
import { site } from "@/lib/site";
export function Visit() {
  return (
    <section className="visit-section section">
      <div className="visit-backdrop" aria-hidden="true">
        <img
          src="/images/district-road.webp"
          width="1600"
          height="800"
          alt=""
          loading="lazy"
          data-parallax
        />
      </div>
      <div className="visit-title">
        <p className="eyebrow">
          <MapPin size={14} /> MADE FOR THE DRIVE. ROOTED IN UTAH.
        </p>
        <h2 data-reveal>
          Your next chapter
          <br />
          starts <span data-sheen>with a key.</span>
        </h2>
        <ButtonLink href="/contact-us">Let’s talk</ButtonLink>
      </div>
      <div className="visit-info">
        <span className="mono">COME FIND US</span>
        <a href={site.maps} target="_blank" rel="noreferrer">
          <span>
            {site.address}
            <br />
            Midvale, Utah
          </span>
          <ArrowUpRight size={28} />
        </a>
        <div className="visit-hours">
          <p>
            Monday–Saturday<span>10:00 AM–7:00 PM</span>
          </p>
          <p>
            Sunday<span>Closed</span>
          </p>
        </div>
        <a href={site.phoneHref} className="visit-phone">
          {site.phone}
        </a>
      </div>
    </section>
  );
}
