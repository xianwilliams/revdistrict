import { Motion } from "@/components/motion";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Phone, Mail, MapPin, MessageSquare } from "lucide-react";
import { AmbientFilm } from "@/components/ambient-film";
import { LeadForm } from "@/components/lead-form";
import { site } from "@/lib/site";
export const metadata: Metadata = {
  title: "Let’s talk | Visit our Midvale showroom",
};
export default function ContactPage() {
  return (
    <>
      <section
        className="contact-intro section cinematic-intro"
        data-motion-section
      >
        <AmbientFilm
          src="/video/district-people-loop.mp4"
          poster="/images/district-culture.webp"
          label="Contact Us"
        />
        <div className="cinematic-copy">
          <p className="eyebrow">REAL PEOPLE. RIGHT HERE.</p>
          <h1>
            A conversation.
            <br />
            <span className="gold">Not a sales pitch.</span>
          </h1>
          <p className="cinematic-description">
            Come for a closer look. Stay for a conversation.
          </p>
        </div>
      </section>
      <section className="contact-body section" data-motion-section>
        <aside className="contact-details">
          <h2>Let’s talk.</h2>
          <p>
            A question about a car, a trade, or your next move? You’re in the
            right place.
          </p>
          <a className="contact-method" data-reveal href={site.phoneHref}>
            <Phone size={22} data-icon-draw />
            <span>
              <small className="mono">CALL THE TEAM</small>
              <strong>{site.phone}</strong>
            </span>
            <ArrowUpRight size={20} />
          </a>
          <Link className="contact-method" data-reveal href="/contact-us/text">
            <MessageSquare size={22} data-icon-draw />
            <span>
              <small className="mono">START WITH A TEXT</small>
              <strong>Request a text back</strong>
            </span>
            <ArrowUpRight size={20} />
          </Link>
          <a
            className="contact-method"
            data-reveal
            href={`mailto:${site.email}`}
          >
            <Mail size={22} data-icon-draw />
            <span>
              <small className="mono">DROP US A LINE</small>
              <strong>{site.email}</strong>
            </span>
            <ArrowUpRight size={20} />
          </a>
          <a
            className="contact-method"
            data-reveal
            href={site.maps}
            target="_blank"
            rel="noreferrer"
          >
            <MapPin size={22} data-icon-draw />
            <span>
              <small className="mono">COME ON OVER</small>
              <strong>
                {site.address}
                <br />
                {site.city}
              </strong>
            </span>
            <ArrowUpRight size={20} />
          </a>
          <div className="contact-hours">
            <span className="mono">SHOWROOM HOURS</span>
            <p>
              Monday–Saturday<strong>10:00 AM–7:00 PM</strong>
            </p>
            <p>
              Sunday<strong>Closed</strong>
            </p>
          </div>
        </aside>
        <div className="contact-form-panel">
          <h2>What’s on your mind?</h2>
          <LeadForm />
        </div>
      </section>
      <section className="map-section" data-motion-section>
        <iframe
          title="RevDistrict showroom location in Midvale, Utah"
          src="https://maps.google.com/maps?q=7036%20S%20High%20Tech%20Dr%20Midvale%20UT%2084047&t=&z=14&ie=UTF8&iwloc=&output=embed"
          width="1400"
          height="500"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <a
          href={site.maps}
          target="_blank"
          rel="noreferrer"
          className="map-location"
        >
          <span className="mono">THE DISTRICT / MIDVALE</span>
          <strong>See you here.</strong>
          <span>
            Get directions <ArrowUpRight size={18} />
          </span>
        </a>
      </section>
      <Motion />
    </>
  );
}
