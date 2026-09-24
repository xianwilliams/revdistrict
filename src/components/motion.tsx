"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
export function Motion() {
  const pathname = usePathname();
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    const main = document.getElementById("main");
    if (!main) return;
    let mounted = true;
    let initialized = false;
    let refreshFrame = 0;
    const updateLayout = () => {
      cancelAnimationFrame(refreshFrame);
      refreshFrame = requestAnimationFrame(() => {
        if (!mounted) return;
        if (!initialized) {
          // Next can stream page content inside a hidden boundary before revealing it.
          const targets = main.querySelectorAll(
            "[data-sheen], [data-reveal], [data-image-reveal], [data-parallax], [data-motion-section], h1 .gold, h2 .gold",
          );
          if (
            !targets.length ||
            [...targets].some((element) => !element.getClientRects().length)
          )
            return;
          main
            .querySelectorAll<HTMLElement>(
              "[data-motion-section] h2, [data-motion-section] h3, [data-motion-section] > p, [data-motion-section] article > p, .cinematic-copy > p, .finance-copy > p, .story-hero-bottom, .contact-hours",
            )
            .forEach((element) => {
              if (
                !element.closest(
                  "form, [data-stagger], .payment-calculator, .district-carousel, [data-reveal], .brand-reveal",
                )
              )
                element.setAttribute("data-reveal", "");
            });
          initialized = true;
          media.add("(prefers-reduced-motion: no-preference)", () => {
            gsap.utils
              .toArray<HTMLElement>("[data-stagger]")
              .forEach((group) => {
                gsap.from(group.children, {
                  y: 22,
                  opacity: 0,
                  stagger: 0.13,
                  duration: 0.65,
                  ease: "power3.out",
                  scrollTrigger: {
                    trigger: group,
                    start: "top 90%",
                    once: true,
                  },
                });
              });
            gsap.utils
              .toArray<SVGSVGElement>("[data-icon-draw]")
              .forEach((icon) => {
                const shapes = [
                  ...icon.querySelectorAll<SVGGeometryElement>(
                    "path, line, polyline, circle, rect",
                  ),
                ];
                shapes.forEach((shape) => {
                  const length = shape.getTotalLength();
                  gsap.fromTo(
                    shape,
                    { strokeDasharray: length, strokeDashoffset: length },
                    {
                      strokeDashoffset: 0,
                      duration: 1.1,
                      ease: "power2.out",
                      scrollTrigger: {
                        trigger: icon,
                        start: "top 88%",
                        once: true,
                      },
                    },
                  );
                });
              });
            gsap.utils
              .toArray<HTMLElement>("[data-brand-reveal]")
              .forEach((mark) => {
                const timeline = gsap.timeline({
                  scrollTrigger: {
                    trigger: mark,
                    start: "top 80%",
                    once: true,
                  },
                });
                timeline
                  .from(mark.querySelector(".brand-orbit"), {
                    rotation: -60,
                    opacity: 0,
                    duration: 1.2,
                    ease: "power3.out",
                  })
                  .from(
                    mark.querySelector("img"),
                    {
                      clipPath: "inset(100% 0 0 0)",
                      y: 18,
                      opacity: 0,
                      duration: 1.1,
                      ease: "power3.out",
                    },
                    0.2,
                  )
                  .from(
                    mark.querySelector(".mono"),
                    { y: 8, opacity: 0, duration: 0.6 },
                    0.9,
                  );
              });
            gsap.utils
              .toArray<HTMLElement>(".cinematic-intro h1, .finance-copy h1")
              .forEach((title) => {
                gsap.from(title, {
                  y: 18,
                  duration: 0.85,
                  ease: "power3.out",
                  scrollTrigger: {
                    trigger: title,
                    start: "top 95%",
                    once: true,
                  },
                });
              });
            gsap.utils
              .toArray<HTMLElement>("[data-sheen], h1 .gold, h2 .gold")
              .forEach((element) => {
                gsap.fromTo(
                  element,
                  { "--sheen-position": "115%" },
                  {
                    "--sheen-position": "-15%",
                    ease: "none",
                    scrollTrigger: {
                      trigger: element,
                      start: "top 90%",
                      end: "bottom 15%",
                      scrub: 0.7,
                    },
                  },
                );
              });
            gsap.utils
              .toArray<HTMLElement>("[data-parallax]")
              .forEach((element) => {
                gsap.fromTo(
                  element,
                  { yPercent: -4 },
                  {
                    yPercent: 4,
                    ease: "none",
                    scrollTrigger: {
                      trigger: element.parentElement,
                      start: "top bottom",
                      end: "bottom top",
                      scrub: 0.8,
                    },
                  },
                );
              });
            gsap.utils
              .toArray<HTMLElement>("[data-reveal]")
              .forEach((element) => {
                gsap.from(element, {
                  y: 24,
                  opacity: 0,
                  duration: 0.7,
                  ease: "power3.out",
                  scrollTrigger: {
                    trigger: element,
                    start: "top 95%",
                    once: true,
                  },
                });
              });
            gsap.utils
              .toArray<HTMLElement>("[data-image-reveal]")
              .forEach((element) => {
                gsap.from(element, {
                  clipPath: "inset(8% 0 8% 0)",
                  scale: 1.04,
                  duration: 1,
                  ease: "power3.out",
                  scrollTrigger: {
                    trigger: element,
                    start: "top 92%",
                    once: true,
                  },
                });
              });
          });
        }
        ScrollTrigger.refresh();
      });
    };
    const observer = new ResizeObserver(updateLayout);
    observer.observe(main);
    void document.fonts.ready.then(() => {
      if (mounted) updateLayout();
    });
    updateLayout();
    return () => {
      mounted = false;
      observer.disconnect();
      cancelAnimationFrame(refreshFrame);
      media.revert();
    };
  }, [pathname]);
  return null;
}
