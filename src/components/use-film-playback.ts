"use client";
import { useEffect, useRef, useState } from "react";

export function useFilmPlayback<T extends HTMLElement = HTMLElement>() {
  const root = useRef<T>(null);
  const video = useRef<HTMLVideoElement>(null);
  const wanted = useRef(false);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    const element = video.current;
    if (!element || !root.current) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const network = navigator as Navigator & {
      connection?: { saveData?: boolean };
    };
    wanted.current = !motion.matches && !network.connection?.saveData;
    let visible = false;
    let ready = document.readyState === "complete";
    const sync = () => {
      if (ready && visible && wanted.current && !document.hidden)
        void element.play().catch(() => setPlaying(false));
      else element.pause();
    };
    const loaded = () => {
      ready = true;
      sync();
    };
    const preference = () => {
      wanted.current = !motion.matches && !network.connection?.saveData;
      sync();
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        sync();
      },
      { threshold: 0.1 },
    );
    observer.observe(root.current);
    window.addEventListener("load", loaded);
    document.addEventListener("visibilitychange", sync);
    motion.addEventListener("change", preference);
    element.addEventListener("play", onPlay);
    element.addEventListener("pause", onPause);
    return () => {
      observer.disconnect();
      window.removeEventListener("load", loaded);
      document.removeEventListener("visibilitychange", sync);
      motion.removeEventListener("change", preference);
      element.removeEventListener("play", onPlay);
      element.removeEventListener("pause", onPause);
      element.pause();
    };
  }, [root, video]);
  function toggle() {
    const element = video.current;
    if (!element) return;
    wanted.current = element.paused;
    if (element.paused) void element.play().catch(() => setPlaying(false));
    else element.pause();
  }
  return { root, video, playing, toggle };
}
