import { ButtonLink } from "@/components/ui";
export default function NotFound() {
  return (
    <section className="empty-page section">
      <p className="eyebrow">A DIFFERENT ROAD AWAITS</p>
      <h1>
        This one’s
        <br />
        off the map.
      </h1>
      <p>
        This page may have moved, or the vehicle may no longer be listed. Let’s
        find your next drive.
      </p>
      <ButtonLink href="/inventory">Explore inventory</ButtonLink>
    </section>
  );
}
