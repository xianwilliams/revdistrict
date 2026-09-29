"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowUpRight, Menu, X, Phone } from "lucide-react";
import { navigation, site } from "@/lib/site";
export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <Link href="/" aria-label="RevDistrict home" className="brand">
        <img
          src="/images/revdistrict-transparent.png"
          width="1536"
          height="1024"
          alt="RevDistrict"
        />
      </Link>
      <nav className="desktop-nav" aria-label="Main navigation">
        {navigation.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            aria-current={pathname.startsWith(n.href) ? "page" : undefined}
          >
            {n.label}
          </Link>
        ))}
      </nav>
      <div className="header-actions">
        <Link href="/contact-us" className="header-contact button button--gold">
          Let’s Talk <ArrowUpRight size={16} />
        </Link>
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>
            <button className="icon-button menu-button" aria-label="Open menu">
              <Menu size={23} />
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="dialog-overlay" />
            <Dialog.Content className="menu-panel">
              <Dialog.Title className="mono">EXPLORE THE DISTRICT</Dialog.Title>
              <Dialog.Description className="sr-only">
                Navigate RevDistrict’s inventory and services.
              </Dialog.Description>
              <Dialog.Close asChild>
                <button
                  className="icon-button dialog-close"
                  aria-label="Close menu"
                >
                  <X />
                </button>
              </Dialog.Close>
              <nav aria-label="Expanded navigation">
                {[
                  { href: "/", label: "Home" },
                  ...navigation,
                  { href: "/contact-us", label: "Contact Us" },
                ].map((n, i) => (
                  <Link
                    key={n.href}
                    href={n.href}
                    onClick={() => setOpen(false)}
                  >
                    <span className="mono">0{i + 1}</span>
                    {n.label}
                    <ArrowUpRight />
                  </Link>
                ))}
              </nav>
              <a href={site.phoneHref} className="menu-phone">
                <Phone size={18} />
                {site.phone}
              </a>
              <p className="muted">
                {site.address}
                <br />
                {site.city}
              </p>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </header>
  );
}
