"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { Play, X, ArrowUpRight } from "lucide-react";
import { films } from "@/lib/media";
import { site } from "@/lib/site";
export function Film({
  kind = "welcome",
  className = "",
}: {
  kind?: keyof typeof films;
  className?: string;
}) {
  const film = films[kind];
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          className={`film-card ${className}`}
          aria-label={`Play ${film.title}`}
        >
          <img
            src={film.poster}
            alt="The RevDistrict team behind the scenes"
            width="1200"
            height="800"
            loading="lazy"
          />
          <div className="film-scrim" />
          <span className="film-play">
            <Play size={24} fill="currentColor" />
          </span>
          <span className="film-caption">
            <span className="mono">MEET THE PEOPLE</span>
            <strong>{film.title}</strong>
            <span className="mono">
              WATCH THE FILM <ArrowUpRight size={16} />
            </span>
          </span>
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="film-dialog">
          <Dialog.Close asChild>
            <button
              className="icon-button dialog-close"
              aria-label="Close film"
            >
              <X />
            </button>
          </Dialog.Close>
          <Dialog.Title>{film.title}</Dialog.Title>
          <Dialog.Description>{film.caption}</Dialog.Description>
          <video
            src={film.src}
            poster={film.poster}
            controls
            playsInline
            preload="metadata"
          />
          <a
            href={site.youtube}
            target="_blank"
            rel="noreferrer"
            className="text-link"
          >
            Watch more on YouTube <ArrowUpRight size={16} />
          </a>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
