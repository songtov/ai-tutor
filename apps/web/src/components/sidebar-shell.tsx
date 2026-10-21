"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";

// On phones the sidebar collapses into a top bar with a menu button.
export function SidebarShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <aside className="sticky top-0 z-30 flex shrink-0 flex-col border-b border-rule bg-surface md:h-screen md:w-60 md:border-r md:border-b-0">
      <div className="flex items-center justify-between px-4 py-3 md:px-5 md:pt-8 md:pb-6">
        <Link href="/" className="font-serif text-xl font-semibold tracking-tight text-ink">
          ai-tutor
        </Link>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="sidebar-nav"
          className="rounded-md px-2 py-1 text-sm font-semibold text-muted hover:text-ink md:hidden"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>
      <div
        id="sidebar-nav"
        onClick={(e) => (e.target as HTMLElement).closest("a") && setOpen(false)}
        className={`${open ? "flex" : "hidden"} max-h-[70dvh] min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-4 pb-5 md:flex md:max-h-none md:px-5 md:pb-8`}
      >
        {children}
      </div>
    </aside>
  );
}
