"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";

// On phones the sidebar is a top bar with a menu. On wider screens it can collapse to a thin rail.
export function SidebarShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  return (
    <aside
      className={`sticky top-0 z-30 flex shrink-0 flex-col border-b border-rule bg-surface md:h-screen md:border-r md:border-b-0 ${
        collapsed ? "md:w-12" : "md:w-60"
      }`}
    >
      <div className={`flex items-center justify-between px-4 py-3 md:pt-6 md:pb-4 ${collapsed ? "md:px-2" : "md:px-5"}`}>
        <Link
          href="/"
          className={`font-serif text-xl font-semibold tracking-tight text-ink ${collapsed ? "md:hidden" : ""}`}
        >
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
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Show sidebar" : "Hide sidebar"}
          title={collapsed ? "Show sidebar" : "Hide sidebar"}
          className="hidden rounded-md px-2 py-1 text-muted hover:bg-pen-soft hover:text-ink md:block"
        >
          {collapsed ? "⇥" : "⇤"}
        </button>
      </div>
      <div
        id="sidebar-nav"
        onClick={(e) => (e.target as HTMLElement).closest("a") && setOpen(false)}
        className={`${open ? "flex" : "hidden"} max-h-[70dvh] min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-4 pb-5 md:max-h-none md:px-5 md:pb-8 ${
          collapsed ? "md:hidden" : "md:flex"
        }`}
      >
        {children}
      </div>
    </aside>
  );
}
