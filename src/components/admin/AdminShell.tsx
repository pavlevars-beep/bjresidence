"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, LayoutGrid, LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ADMIN_NAV_GROUPS } from "./AdminNavConfig";

/**
 * Several nav hrefs are prefixes of their own siblings (e.g. "/admin/residence"
 * "Pregled" is a prefix of "/admin/residence/cabins" "Kabine"), so naive
 * per-link startsWith matching highlights more than one item at once. Instead,
 * find every href that matches the current path, then keep only the longest
 * (most specific) one — exactly one item lights up, ever.
 */
function getActiveHref(pathname: string | null): string | null {
  if (!pathname) return null;
  const allHrefs = ["/admin", ...ADMIN_NAV_GROUPS.flatMap((g) => g.links.map((l) => l.href))];
  const candidates = allHrefs.filter((href) => pathname === href || pathname.startsWith(`${href}/`));
  if (candidates.length === 0) return null;
  return candidates.reduce((best, href) => (href.length > best.length ? href : best));
}

function NavLinks({ pathname, onNavigate }: { pathname: string | null; onNavigate?: () => void }) {
  const activeHref = getActiveHref(pathname);

  return (
    <nav className="flex flex-col gap-5">
      <Link
        href="/admin"
        onClick={onNavigate}
        className={cn(
          "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium",
          activeHref === "/admin" ? "bg-olive-dark text-cream" : "text-ink/70 hover:bg-ink/5"
        )}
      >
        <LayoutGrid size={16} /> Kontrolna tabla
      </Link>

      {ADMIN_NAV_GROUPS.map((group) => (
        <div key={group.label}>
          <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-wood">{group.label}</p>
          <div className="mt-1.5 flex flex-col gap-0.5">
            {group.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={onNavigate}
                className={cn(
                  "rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                  link.href === activeHref ? "bg-olive-dark text-cream" : "text-ink/70 hover:bg-ink/5"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-beige/30">
      <header className="sticky top-0 z-30 border-b border-ink/8 bg-cream/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-full p-2 text-ink/60 hover:bg-ink/5 lg:hidden"
              aria-label="Otvori meni"
            >
              <Menu size={20} />
            </button>
            <Link href="/admin" className="flex items-center gap-2.5">
              <Image src="/images/brand/icon-mark.png" alt="" width={32} height={32} className="h-8 w-8" />
              <div>
                <p className="text-sm font-bold leading-tight text-ink">BJ Residence</p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-wood">Admin</p>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/infopult"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-ink/60 hover:bg-ink/5 sm:flex"
            >
              <ExternalLink size={15} /> /infopult
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-ink/60 hover:bg-ink/5"
            >
              <LogOut size={15} /> Odjava
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-5 py-6 sm:px-8">
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-[76px]">
            <NavLinks pathname={pathname} />
          </div>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 overflow-y-auto bg-cream p-5 shadow-card">
            <div className="mb-5 flex items-center justify-between">
              <span className="text-sm font-bold text-ink">Meni</span>
              <button onClick={() => setMobileOpen(false)} className="rounded-full p-2 text-ink/60 hover:bg-ink/5" aria-label="Zatvori meni">
                <X size={18} />
              </button>
            </div>
            <NavLinks pathname={pathname} onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
