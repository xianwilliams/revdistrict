"use client";
import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
const frames = [
  {
    image: "/images/district-detail.webp",
    title: "Every detail matters.",
    label: "THE CARE BEHIND THE CARS",
  },
  {
    image: "/images/district-interior.webp",
    title: "Make room for what’s next.",
    label: "A NEW PERSPECTIVE",
  },
  {
    image: "/images/district-bmw.webp",
    title: "A new chapter starts here.",
    label: "YOUR NEXT POSSIBILITY",
  },
];
export function DistrictCarousel() {
  const [active, setActive] = useState(0);
  const frame = frames[active];
  return (
    <div
      className="district-carousel"
      role="region"
      aria-label="Life at RevDistrict"
      aria-roledescription="carousel"
    >
      <div className="district-carousel-frame" data-image-reveal>
        <img
          key={frame.image}
          src={frame.image}
          width="800"
          height="500"
          alt={frame.title}
          loading="lazy"
        />
        <span className="mono">{frame.label}</span>
      </div>
      <div className="district-carousel-caption">
        <p aria-live="polite">{frame.title}</p>
        <div>
          <button
            className="icon-button"
            aria-label="Previous district photo"
            onClick={() =>
              setActive((active + frames.length - 1) % frames.length)
            }
          >
            <ArrowLeft size={18} />
          </button>
          <button
            className="icon-button"
            aria-label="Next district photo"
            onClick={() => setActive((active + 1) % frames.length)}
          >
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
