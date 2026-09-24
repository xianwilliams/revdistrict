"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  X,
  ArrowRight,
  ArrowLeft,
  Heart,
} from "lucide-react";
import { type Vehicle, matchesMode, driveModes } from "@/lib/vehicle";
import { VehicleCard } from "./vehicle-card";
export function InventoryBrowser({ vehicles }: { vehicles: Vehicle[] }) {
  const params = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [saved, setSaved] = useState<string[]>([]);
  useEffect(() => {
    const update = () => {
      try {
        setSaved(JSON.parse(localStorage.getItem("revdistrict-saved") || "[]"));
      } catch {
        setSaved([]);
      }
    };
    update();
    window.addEventListener("revdistrict-saved", update);
    return () => window.removeEventListener("revdistrict-saved", update);
  }, []);
  const query = params.get("q") || "",
    make = params.get("make") || "",
    body = params.get("body") || "",
    budget = Number(params.get("budget")) || 0,
    mode = params.get("mode") || "all",
    sort = params.get("sort") || "featured",
    onlySaved = params.get("saved") === "true";
  function change(values: Record<string, string>) {
    const next = new URLSearchParams(window.location.search);
    for (const [key, value] of Object.entries(values)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    if (!("page" in values)) next.delete("page");
    window.history.replaceState(
      null,
      "",
      `/inventory${next.size ? "?" + next.toString() : ""}`,
    );
  }
  const filtered = vehicles.filter(
    (v) =>
      (!query ||
        `${v.name} ${v.stock} ${v.vin}`
          .toLowerCase()
          .includes(query.toLowerCase())) &&
      (!make || v.make === make) &&
      (!body || v.body === body) &&
      (!budget || (v.price > 0 && v.price <= budget)) &&
      matchesMode(v, mode) &&
      (!onlySaved || saved.includes(v.id)),
  );
  filtered.sort((a, b) =>
    sort === "price-low"
      ? (a.price || Infinity) - (b.price || Infinity)
      : sort === "price-high"
        ? b.price - a.price
        : sort === "mileage"
          ? (a.mileage || Infinity) - (b.mileage || Infinity)
          : sort === "year"
            ? b.year - a.year
            : Number(b.id) - Number(a.id),
  );
  const totalPages = Math.ceil(filtered.length / 12),
    page = Math.min(
      Math.max(1, Number(params.get("page")) || 1),
      Math.max(1, totalPages),
    );
  const shown = filtered.slice((page - 1) * 12, page * 12);
  const makes = [...new Set(vehicles.map((v) => v.make))].sort();
  const active = query || make || body || budget || mode !== "all" || onlySaved;
  return (
    <div className="inventory-browser">
      <form
        className="inventory-search"
        onSubmit={(event) => {
          event.preventDefault();
          change({
            q: String(new FormData(event.currentTarget).get("q") || ""),
          });
        }}
      >
        <Search size={20} />
        <input
          key={query}
          name="q"
          type="search"
          defaultValue={query}
          aria-label="Search inventory"
          placeholder="Make, model, or that car you can’t stop thinking about..."
        />
        <button className="button button--gold" type="submit">
          Find your car <ArrowRight size={18} />
        </button>
      </form>
      <div className="inventory-layout">
        <aside className={`inventory-filters ${filtersOpen ? "is-open" : ""}`}>
          <div className="filter-heading">
            <span className="mono">REFINE YOUR DRIVE</span>
            <button
              className="icon-button filter-close"
              aria-label="Close filters"
              onClick={() => setFiltersOpen(false)}
            >
              <X size={20} />
            </button>
          </div>
          <label>
            Drive style
            <select
              aria-label="Drive style"
              value={mode}
              onChange={(e) => change({ mode: e.target.value })}
            >
              {driveModes.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Make
            <select
              value={make}
              onChange={(e) => change({ make: e.target.value })}
            >
              <option value="">All makes</option>
              {makes.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </label>
          <label>
            Body style
            <select
              value={body}
              onChange={(e) => change({ body: e.target.value })}
            >
              <option value="">All body styles</option>
              {["Car", "SUV", "Truck", "Van", "Other"].map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </label>
          <label>
            Max price
            <select
              value={budget || ""}
              onChange={(e) => change({ budget: e.target.value })}
            >
              <option value="">Any budget</option>
              {[10000, 15000, 20000, 30000, 40000, 50000, 75000].map((p) => (
                <option value={p} key={p}>
                  Under ${p.toLocaleString()}
                </option>
              ))}
            </select>
          </label>
          <button
            className={`saved-filter ${onlySaved ? "is-active" : ""}`}
            aria-pressed={onlySaved}
            onClick={() => change({ saved: onlySaved ? "" : "true" })}
          >
            <Heart size={16} /> Saved vehicles <span>{saved.length}</span>
          </button>
          {active && (
            <button
              className="reset-filters"
              onClick={() =>
                window.history.replaceState(null, "", "/inventory")
              }
            >
              Reset all filters <X size={14} />
            </button>
          )}
          <div className="filter-help">
            <span className="mono">NOT SEEING THE ONE?</span>
            <p>
              Tell us what’s on your mind.
              <br />
              We’ll help you find it.
            </p>
            <a href="/contact-us" className="text-link">
              Let’s talk <ArrowRight size={16} />
            </a>
          </div>
        </aside>
        <div className="inventory-results">
          <div className="results-toolbar">
            <button
              className="mobile-filter-toggle"
              onClick={() => setFiltersOpen(!filtersOpen)}
              aria-expanded={filtersOpen}
            >
              <SlidersHorizontal size={16} /> Filters
            </button>
            <p className="mono" aria-live="polite">
              {filtered.length} VEHICLES{" "}
              <span className="muted">/ YOUR NEXT CHAPTER</span>
            </p>
            <label className="sort-label">
              <span className="sr-only">Sort vehicles</span>
              <select
                value={sort}
                onChange={(e) => change({ sort: e.target.value })}
              >
                <option value="featured">Recently listed</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
                <option value="mileage">Lowest mileage</option>
                <option value="year">Newest model year</option>
              </select>
            </label>
          </div>
          {shown.length ? (
            <>
              <div className="vehicle-grid inventory-grid">
                {shown.map((v) => (
                  <VehicleCard vehicle={v} key={v.id} />
                ))}
              </div>
              <nav className="pagination" aria-label="Inventory pages">
                <button
                  disabled={page === 1}
                  onClick={() => change({ page: String(page - 1) })}
                  aria-label="Previous page"
                >
                  <ArrowLeft size={18} />
                </button>
                <span className="mono">
                  PAGE {page} OF {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => change({ page: String(page + 1) })}
                  aria-label="Next page"
                >
                  <ArrowRight size={18} />
                </button>
              </nav>
            </>
          ) : (
            <div className="empty-results">
              <Search size={36} />
              <h2>A little too specific?</h2>
              <p>
                Try a different make, budget, or drive style. Your next car
                might be one filter away.
              </p>
              <button
                className="button button--gold"
                onClick={() =>
                  window.history.replaceState(null, "", "/inventory")
                }
              >
                Clear filters <ArrowRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
