"use client";

import { useEffect, useId, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function DistrictLogo() {
  const root = useRef<HTMLDivElement>(null);
  const id = useId().replaceAll(":", "");
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const context = gsap.context(() => {
        gsap.fromTo(
          ".district-logo-needle",
          { "--needle-angle": "-100deg" },
          {
            "--needle-angle": "12deg",
            ease: "none",
            scrollTrigger: {
              trigger: root.current,
              start: "top 85%",
              end: "bottom 20%",
              scrub: 0.35,
            },
          },
        );
      }, root);
      return () => context.revert();
    });
    return () => media.revert();
  }, []);

  // Both layers use the original PNG; only its needle is isolated and rotated.
  const needleOutline =
    "M 693 458 L 951 312 L 714 495 C 731 502 735 522 715 536 C 695 550 679 544 662 526 C 647 511 647 491 651 479 C 658 458 676 454 693 458 Z";
  const needleClearance =
    "M 638 456 L 688 443 L 951 310 L 949 317 L 738 505 L 721 548 L 650 546 L 635 510 Z";
  return (
    <div className="brand-reveal" ref={root}>
      <svg className="brand-orbit" viewBox="0 0 500 500" aria-hidden="true">
        <circle cx="250" cy="250" r="236" />
        <path d="M 14 250 A 236 236 0 0 1 486 250" />
      </svg>
      <svg
        className="district-logo"
        viewBox="0 0 1254 1254"
        role="img"
        aria-label="RevDistrict original logo with a scroll-driven gauge needle"
      >
        <defs>
          <filter id={`${id}-edge`}>
            <feGaussianBlur stdDeviation="3" />
          </filter>
          <mask
            id={`${id}-face`}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="1254"
            height="1254"
          >
            <rect width="1254" height="1254" fill="white" />
            <path
              d={needleClearance}
              fill="black"
              filter={`url(#${id}-edge)`}
            />
          </mask>
          <clipPath id={`${id}-needle`}>
            <path d={needleOutline} />
          </clipPath>
        </defs>
        <image
          href="/images/revdistrict-original.png"
          width="1254"
          height="1254"
          mask={`url(#${id}-face)`}
        />
        <g className="district-logo-needle">
          <image
            href="/images/revdistrict-original.png"
            width="1254"
            height="1254"
            clipPath={`url(#${id}-needle)`}
          />
        </g>
      </svg>
      <span className="mono">A NEW CHAPTER. THE SAME ROOTS.</span>
    </div>
  );
}
