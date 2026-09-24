"use client";
import { useState } from "react";
import { Share2, Check, ArrowUpRight } from "lucide-react";
import { SaveVehicle } from "./vehicle-card";
export function VehicleActions({ id, name }: { id: string; name: string }) {
  const [message, setMessage] = useState("");
  async function share() {
    try {
      if (navigator.share)
        await navigator.share({ title: name, url: location.href });
      else {
        await navigator.clipboard.writeText(location.href);
        setMessage("Link copied");
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError")
        setMessage("Copy the URL from your address bar.");
    }
  }
  return (
    <div className="vehicle-actions">
      <SaveVehicle id={id} />
      <button
        className="icon-button"
        onClick={share}
        aria-label="Share vehicle"
      >
        {message === "Link copied" ? <Check size={18} /> : <Share2 size={18} />}
      </button>
      {message && (
        <span role="status" className="small">
          {message}
        </span>
      )}
      <a href="#inquire" className="text-link">
        Make it yours <ArrowUpRight size={18} />
      </a>
    </div>
  );
}
