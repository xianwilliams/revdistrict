import { Motion } from "@/components/motion";
import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { AmbientFilm } from "@/components/ambient-film";
import { DistrictLogo } from "@/components/district-logo";
import { Film } from "@/components/film";
import { Visit } from "@/components/visit";
import { ButtonLink } from "@/components/ui";
import { site } from "@/lib/site";
export const metadata: Metadata = { title: "The people behind the keys" };
export default function StoryPage() {
  return (
    <>
      <section
        className="story-page-hero section cinematic-intro"
        data-motion-section
      >
        <AmbientFilm
          src="/video/district-people-loop.mp4"
          poster="/images/district-culture.webp"
          label="The District"
        />
        <div className="cinematic-copy">
          <p className="eyebrow">THE PEOPLE BEHIND THE KEYS</p>
          <h1>
            Built around cars.
            <br />
            <span className="gold">Driven by people.</span>
          </h1>
          <div className="story-hero-bottom">
            <p>
              Good cars. Real people. A shared love for the drive.
              <br />
              Welcome to RevDistrict.
            </p>
            <span className="mono">MIDVALE, UTAH</span>
          </div>
        </div>
      </section>
      <section className="story-wide-film section" data-motion-section>
        <Film kind="story" />
      </section>
      <section className="manifesto section" data-motion-section>
        <DistrictLogo />
        <article>
          <h2 data-reveal>
            There’s a story
            <br />
            <span className="gold">behind every key.</span>
          </h2>
          <p>
            A first set of wheels. A growing family. A weekend you’ve been
            planning for years. Finding a car is about where you’re going next.
          </p>
          <p>
            We’re RevDistrict, rooted right here in Midvale. Our people, our
            Utah community and our love for cars are at the center of everything
            we do.
          </p>
          <p>
            We want you to know who you’re buying from. Come meet us, take a
            look around, and ask the questions that matter to you. No automotive
            dictionary required.
          </p>
          <ButtonLink href="/contact-us" variant="text">
            Let’s talk
          </ButtonLink>
        </article>
      </section>
      <section className="people-section section" data-motion-section>
        <div>
          <h2 data-reveal>
            Come for the cars.
            <br />
            <span className="gold">Stay for the people.</span>
          </h2>
          <p>
            Before you visit, spend a few minutes with the team. A look at the
            showroom, the daily life, and what keeps us coming back.
          </p>
          <div className="social-links">
            <a href={site.youtube} target="_blank" rel="noreferrer">
              ON YOUTUBE <ArrowUpRight size={16} />
            </a>
            <a href={site.instagram} target="_blank" rel="noreferrer">
              ON INSTAGRAM <ArrowUpRight size={16} />
            </a>
          </div>
        </div>
        <Film />
      </section>
      <Visit />
      <Motion />
    </>
  );
}
