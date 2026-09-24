"use client";
import { site } from "@/lib/site";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="empty-page section">
      <p className="eyebrow">LET’S GET YOU BACK ON THE ROAD</p>
      <h1>
        A short
        <br />
        pit stop.
      </h1>
      <p>
        We couldn’t load this page. Please try again, or call the team for
        current vehicle information.
      </p>
      <div className="button-row">
        <button className="button button--gold" onClick={reset}>
          Try again
        </button>
        <a className="button button--outline" href={site.phoneHref}>
          {site.phone}
        </a>
      </div>
    </section>
  );
}
