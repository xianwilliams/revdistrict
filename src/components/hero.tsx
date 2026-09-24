"use client";
import { useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Pause, Play, ArrowUpRight } from "lucide-react";
import { useFilmPlayback } from "./use-film-playback";
import { ButtonLink } from "./ui";

const chapters = [
  { title: "The cars", detail: "A LITTLE OBSESSION", at: 0 },
  { title: "The people", detail: "A LOT OF PERSONALITY", at: 10 },
  { title: "The open road", detail: "YOUR NEXT CHAPTER", at: 19 },
];

export function Hero() {
  const {
    root,
    video,
    playing,
    toggle: togglePlayback,
    playAt,
  } = useFilmPlayback();
  const [chapter, setChapter] = useState(0);
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const context = gsap.context(() => {
        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "bottom top",
            scrub: 0.8,
          },
        });
        timeline
          .to(".hero-media", { yPercent: 13, scale: 1.08, ease: "none" }, 0)
          .to(".hero-copy", { y: 105, ease: "none" }, 0)
          .to(".hero-side-note", { y: -65, ease: "none" }, 0);
      }, root);
      return () => context.revert();
    });
    return () => media.revert();
  }, [root]);
  function chooseChapter(index: number) {
    setChapter(index);
    playAt(chapters[index].at);
  }
  return (
    <section ref={root} className="hero" aria-label="Welcome to RevDistrict">
      <div className="hero-media" aria-hidden="true">
        <video
          ref={video}
          poster="/images/hero-film-poster.webp"
          muted
          loop
          playsInline
          preload="none"
          onTimeUpdate={() => {
            const time = video.current?.currentTime || 0;
            setChapter(time >= 19 ? 2 : time >= 10 ? 1 : 0);
            root.current?.style.setProperty(
              "--reel-progress",
              `${time / (video.current?.duration || 1)}`,
            );
          }}
        >
          <source
            src="/video/district-hero-mobile.mp4"
            media="(max-width: 700px)"
            type="video/mp4"
          />
          <source src="/video/district-hero.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="hero-shade" aria-hidden="true" />
      <div className="hero-frame" aria-hidden="true" />
      <div className="hero-copy">
        <p className="eyebrow">
          <span className="status-dot" /> GOOD CARS. REAL PEOPLE.
        </p>
        <h1>
          For the love
          <br />
          <span data-sheen>of the drive.</span>
        </h1>
        <div className="hero-intro">
          <p>
            A car you love. People you’ll actually like. <br />
            Welcome to a different kind of dealership.
          </p>
          <ButtonLink href="/inventory">Explore inventory</ButtonLink>
        </div>
      </div>
      <span className="hero-side-note mono">REVDISTRICT / MIDVALE, UTAH</span>
      <div className="hero-bottom">
        <div
          className="hero-chapters"
          role="group"
          aria-label="Explore the film"
        >
          {chapters.map((item, index) => (
            <button
              key={item.title}
              type="button"
              aria-pressed={chapter === index}
              onClick={() => chooseChapter(index)}
            >
              <span className="mono">{item.detail}</span>
              <strong>{item.title}</strong>
            </button>
          ))}
        </div>
        <div className="hero-film-controls">
          <a href="#the-district" className="hero-story-link mono">
            MEET THE DISTRICT <ArrowUpRight size={15} />
          </a>
          <button
            type="button"
            className="hero-playback"
            onClick={togglePlayback}
            aria-label={
              playing ? "Pause background film" : "Play background film"
            }
          >
            {playing ? <Pause size={17} /> : <Play size={17} />}
          </button>
        </div>
      </div>
      <span className="hero-reel-progress" aria-hidden="true" />
    </section>
  );
}
