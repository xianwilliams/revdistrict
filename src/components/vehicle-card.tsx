"use client";
import Link from "next/link";
import Image from "next/image";
import {
  canResizeVehicleImage,
  vehicleImageLoader,
} from "@/lib/vehicle-images";
import { ArrowUpRight, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { money, number } from "@/lib/site";
import { vehicleHref, type Vehicle } from "@/lib/vehicle";
export function SaveVehicle({
  id,
  label = "Save vehicle",
}: {
  id: string;
  label?: string;
}) {
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    const update = () => {
      try {
        setSaved(
          JSON.parse(
            localStorage.getItem("revdistrict-saved") || "[]",
          ).includes(id),
        );
      } catch {
        setSaved(false);
      }
    };
    update();
    window.addEventListener("revdistrict-saved", update);
    return () => window.removeEventListener("revdistrict-saved", update);
  }, [id]);
  function toggle() {
    try {
      const current: string[] = JSON.parse(
        localStorage.getItem("revdistrict-saved") || "[]",
      );
      localStorage.setItem(
        "revdistrict-saved",
        JSON.stringify(
          saved ? current.filter((v) => v !== id) : [...current, id],
        ),
      );
      setSaved(!saved);
      window.dispatchEvent(new Event("revdistrict-saved"));
    } catch {
      setSaved(!saved);
    }
  }
  return (
    <button
      type="button"
      className={`save-button ${saved ? "is-saved" : ""}`}
      onClick={toggle}
      aria-label={saved ? "Remove saved vehicle" : label}
      aria-pressed={saved}
    >
      <Heart size={18} fill={saved ? "currentColor" : "none"} />
    </button>
  );
}
export function VehicleCard({
  vehicle: v,
  priority = false,
}: {
  vehicle: Vehicle & { photoCount?: number };
  priority?: boolean;
}) {
  return (
    <article className="vehicle-card">
      <div className="vehicle-card-image">
        <Link href={vehicleHref(v)} aria-label={`View ${v.name}`}>
          {v.images[0] ? (
            <Image
              src={v.images[0]}
              loader={vehicleImageLoader}
              unoptimized={!canResizeVehicleImage(v.images[0])}
              sizes="(max-width: 700px) 90vw, (max-width: 1100px) 45vw, 30vw"
              width={800}
              height={600}
              alt={v.name}
              loading={priority ? "eager" : "lazy"}
            />
          ) : (
            <span className="vehicle-photo-placeholder mono">
              Photos coming soon
            </span>
          )}
        </Link>
        <SaveVehicle id={v.id} />
        <span className="vehicle-card-photo-count mono">
          {v.photoCount ?? v.images.length} PHOTOS
        </span>
      </div>
      <Link href={vehicleHref(v)} className="vehicle-card-details">
        <div>
          <p className="mono">
            {v.year} / {v.make.toUpperCase()}
          </p>
          <h3>
            {v.model} <ArrowUpRight size={21} />
          </h3>
          <p className="vehicle-trim">{v.trim || v.body}</p>
        </div>
        <div className="vehicle-card-bottom">
          <span className="mono">
            {v.mileage ? `${number(v.mileage)} MI` : "MILEAGE ON REQUEST"}{" "}
            <span>·</span> {v.drivetrain}
          </span>
          <strong>{v.price ? money(v.price) : "Call for price"}</strong>
        </div>
      </Link>
    </article>
  );
}
