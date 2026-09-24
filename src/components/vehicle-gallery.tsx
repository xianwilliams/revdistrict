"use client";
import { useState } from "react";
import Image from "next/image";
import {
  canResizeVehicleImage,
  vehicleImageLoader,
} from "@/lib/vehicle-images";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowLeft, ArrowRight, Expand, X, Images } from "lucide-react";
export function VehicleGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const [active, setActive] = useState(0),
    [open, setOpen] = useState(false);
  const total = images.length;
  const [prefetch, setPrefetch] = useState<string | null>(null);
  function prepareNextPhoto() {
    const network = navigator as Navigator & {
      connection?: { saveData?: boolean };
    };
    if (total > 1 && !network.connection?.saveData)
      setPrefetch(images[(active + 1) % total]);
  }
  function next(direction: number) {
    setActive((value) => (value + direction + total) % total);
  }
  if (!total)
    return (
      <div className="gallery-missing">
        <h2>Photos are on the way.</h2>
        <p>Ask the team for a personal walkaround.</p>
      </div>
    );
  return (
    <div className="vehicle-gallery">
      <div className="gallery-main">
        <Image
          src={images[active]}
          loader={vehicleImageLoader}
          unoptimized={!canResizeVehicleImage(images[active])}
          sizes="100vw"
          preload={active === 0}
          onLoad={prepareNextPhoto}
          alt={`${name}, photo ${active + 1} of ${total}`}
          width={1600}
          height={1200}
          loading={active === 0 ? undefined : "eager"}
        />
        <div className="gallery-shade" />
        <button
          className="gallery-expand"
          aria-label="View gallery"
          onClick={() => setOpen(true)}
        >
          <Expand size={18} />
          <span className="mono">VIEW GALLERY</span>
        </button>
        <div className="gallery-controls">
          <span className="mono">
            <Images size={16} />
            {String(active + 1).padStart(2, "0")} /{" "}
            {String(total).padStart(2, "0")}
          </span>
          <button
            className="icon-button"
            onClick={() => next(-1)}
            aria-label="Previous photo"
          >
            <ArrowLeft size={20} />
          </button>
          <button
            className="icon-button"
            onClick={() => next(1)}
            aria-label="Next photo"
          >
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
      {prefetch && (
        <div hidden aria-hidden="true">
          <Image
            src={prefetch}
            loader={vehicleImageLoader}
            unoptimized={!canResizeVehicleImage(prefetch)}
            alt=""
            width={1600}
            height={1200}
            sizes="100vw"
            loading="eager"
            fetchPriority="low"
          />
        </div>
      )}
      <div className="gallery-thumbnails" aria-label="Vehicle photos">
        {images.map((src, index) => (
          <button
            key={src}
            onClick={() => setActive(index)}
            aria-label={`Show photo ${index + 1}`}
            aria-pressed={active === index}
          >
            <Image
              src={src}
              loader={vehicleImageLoader}
              unoptimized={!canResizeVehicleImage(src)}
              sizes="(max-width: 700px) 76px, 110px"
              alt=""
              width={160}
              height={110}
              loading="lazy"
            />
          </button>
        ))}
      </div>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay" />
          <Dialog.Content
            className="gallery-dialog"
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") next(1);
              if (e.key === "ArrowLeft") next(-1);
            }}
          >
            <Dialog.Title className="mono">{name}</Dialog.Title>
            <Dialog.Description className="sr-only">
              Vehicle photo gallery. Use the arrow buttons or left and right
              arrow keys to change photo.
            </Dialog.Description>
            <Dialog.Close asChild>
              <button
                className="icon-button dialog-close"
                aria-label="Close gallery"
              >
                <X />
              </button>
            </Dialog.Close>
            <Image
              src={images[active]}
              loader={vehicleImageLoader}
              unoptimized={!canResizeVehicleImage(images[active])}
              sizes="100vw"
              loading="eager"
              alt={`${name}, photo ${active + 1}`}
              width={1600}
              height={1200}
            />
            <div className="lightbox-controls">
              <button
                className="icon-button"
                onClick={() => next(-1)}
                aria-label="Previous gallery photo"
              >
                <ArrowLeft />
              </button>
              <span className="mono">
                {active + 1} / {total}
              </span>
              <button
                className="icon-button"
                onClick={() => next(1)}
                aria-label="Next gallery photo"
              >
                <ArrowRight />
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
