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
  ChevronDown,
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
    makes = params.getAll("make"),
    models = params.getAll("model"),
    body = params.get("body") || "",
    budget = Number(params.get("budget")) || 0,
    mileage = Number(params.get("mileage")) || 0,
    mode = params.get("mode") || "all",
    sort = params.get("sort") || "featured",
    onlySaved = params.get("saved") === "true";
  function change(values: Record<string, string | string[]>) {
    const next = new URLSearchParams(window.location.search);
    for (const [key, value] of Object.entries(values)) {
      next.delete(key);
      for (const item of Array.isArray(value) ? value : [value]) {
        if (item) next.append(key, item);
      }
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
      (!makes.length || makes.includes(v.make)) &&
      (!models.length || models.includes(v.model)) &&
      (!body || v.body === body) &&
      (!budget || (v.price > 0 && v.price <= budget)) &&
      (!mileage || (v.mileage > 0 && v.mileage <= mileage)) &&
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
  const active =
    query ||
    makes.length ||
    models.length ||
    body ||
    budget ||
    mileage ||
    mode !== "all" ||
    onlySaved;
  const [resetCount, setResetCount] = useState(0);
  function reset() {
    window.history.replaceState(null, "", "/inventory");
    setResetCount((count) => count + 1);
  }
  return (
    <div className="inventory-browser">
      <form
        className="inventory-search"
        id="inventory-search"
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          change({
            q: String(form.get("q") || "").trim(),
            make: form.getAll("make").map(String),
            model: form.getAll("model").map(String),
            body: String(form.get("body") || ""),
            budget: String(form.get("budget") || ""),
            mileage: String(form.get("mileage") || ""),
          });
          setFiltersOpen(false);
        }}
      >
        <Search size={20} />
        <input
          key={`${query}-${resetCount}`}
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
          <InventoryFilterFields
            key={`${JSON.stringify({ makes, models, budget, body, mileage })}-${resetCount}`}
            vehicles={vehicles}
            initialMakes={makes}
            initialModels={models}
            budget={budget}
            body={body}
            mileage={mileage}
            onReset={reset}
          />
          {mode !== "all" && (
            <button
              className="reset-filters"
              onClick={() => change({ mode: "" })}
            >
              {driveModes.find((item) => item.id === mode)?.label || mode}{" "}
              <X size={14} />
              <span className="sr-only">Remove drive style</span>
            </button>
          )}
          <button
            className={`saved-filter ${onlySaved ? "is-active" : ""}`}
            aria-pressed={onlySaved}
            onClick={() => change({ saved: onlySaved ? "" : "true" })}
          >
            <Heart size={16} /> Saved vehicles <span>{saved.length}</span>
          </button>
          <p className="saved-help">
            No account needed. Saved on this browser only. Clearing site data
            clears your saved vehicles.
          </p>
          {active && (
            <button className="reset-filters" onClick={reset}>
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
                Try a different make, model, price, or mileage. Your next car
                might be one filter away.
              </p>
              <button className="button button--gold" onClick={reset}>
                Clear filters <ArrowRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InventoryFilterFields({
  vehicles,
  initialMakes,
  initialModels,
  budget,
  body,
  mileage,
  onReset,
}: {
  vehicles: Vehicle[];
  initialMakes: string[];
  initialModels: string[];
  budget: number;
  body: string;
  mileage: number;
  onReset: () => void;
}) {
  const [makes, setMakes] = useState(initialMakes);
  const [models, setModels] = useState(initialModels);
  const availableMakes = [...new Set(vehicles.map((v) => v.make))].sort();
  const availableModels = [
    ...new Set(
      vehicles
        .filter((v) => !makes.length || makes.includes(v.make))
        .map((v) => v.model),
    ),
  ].sort();
  function toggleMake(make: string) {
    const next = makes.includes(make)
      ? makes.filter((item) => item !== make)
      : [...makes, make];
    setMakes(next);
    setModels((current) =>
      current.filter((model) =>
        vehicles.some(
          (v) => v.model === model && (!next.length || next.includes(v.make)),
        ),
      ),
    );
  }
  return (
    <div className="filter-fields">
      <label>
        Max price
        <select
          name="budget"
          form="inventory-search"
          defaultValue={budget || ""}
        >
          <option value="">Any budget</option>
          {[10000, 15000, 20000, 30000, 40000, 50000, 75000].map((price) => (
            <option value={price} key={price}>
              Up to ${price.toLocaleString()}
            </option>
          ))}
        </select>
      </label>
      <CheckboxFilter
        label="Make"
        name="make"
        options={availableMakes}
        selected={makes}
        onToggle={toggleMake}
      />
      <CheckboxFilter
        label="Model"
        name="model"
        options={availableModels}
        selected={models}
        onToggle={(model) =>
          setModels((current) =>
            current.includes(model)
              ? current.filter((item) => item !== model)
              : [...current, model],
          )
        }
      />
      <label>
        Body style
        <select name="body" form="inventory-search" defaultValue={body}>
          <option value="">All body styles</option>
          {["Car", "SUV", "Truck", "Van", "Other"].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </label>
      <label>
        Max mileage
        <select
          name="mileage"
          form="inventory-search"
          defaultValue={mileage || ""}
        >
          <option value="">Any mileage</option>
          {[25000, 50000, 75000, 100000, 150000, 200000].map((value) => (
            <option value={value} key={value}>
              Up to {value.toLocaleString()} mi
            </option>
          ))}
        </select>
      </label>
      <button
        className="button button--gold filter-search"
        type="submit"
        form="inventory-search"
      >
        Search <Search size={16} />
      </button>
      <button className="filter-clear" type="button" onClick={onReset}>
        Clear selections
      </button>
    </div>
  );
}

function CheckboxFilter({
  label,
  name,
  options,
  selected,
  onToggle,
}: {
  label: string;
  name: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <details className="checkbox-filter">
      <summary>
        <span>
          {label}
          <strong>
            {selected.length ? `${selected.length} selected` : `All ${name}s`}
          </strong>
        </span>
        <ChevronDown size={15} aria-hidden="true" />
      </summary>
      <fieldset>
        <legend className="sr-only">{label}</legend>
        {options.map((option) => (
          <label key={option}>
            <input
              type="checkbox"
              name={name}
              form="inventory-search"
              value={option}
              checked={selected.includes(option)}
              onChange={() => onToggle(option)}
            />
            <span>{option}</span>
          </label>
        ))}
      </fieldset>
    </details>
  );
}
