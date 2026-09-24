"use client";
import { useFilmPlayback } from "./use-film-playback";
import { Pause, Play } from "lucide-react";

/** Decorative film: the poster paints first; playback never blocks the page. */
export function AmbientFilm({
  src,
  poster,
  label,
  className = "",
}: {
  src: string;
  poster: string;
  label: string;
  className?: string;
}) {
  const { root, video, playing, toggle } = useFilmPlayback<HTMLDivElement>();
  return (
    <div ref={root} className={`ambient-film ${className}`}>
      <div className="ambient-plane" data-parallax aria-hidden="true">
        <img
          src={poster}
          alt=""
          width="1600"
          height="800"
          fetchPriority="high"
        />
        <video
          ref={video}
          src={src}
          poster={poster}
          muted
          loop
          playsInline
          preload="none"
        />
      </div>
      <div className="ambient-scrim" aria-hidden="true" />
      <button
        className="ambient-control"
        onClick={toggle}
        aria-label={`${playing ? "Pause" : "Play"} ${label} film`}
      >
        {playing ? <Pause size={15} /> : <Play size={15} />}
        <span className="sr-only">Background video</span>
      </button>
    </div>
  );
}
