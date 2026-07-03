"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { GraduationCap, LogOut, Menu, X, type LucideIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export function SidebarShell({
  navItems,
  roleLabel,
  userName,
  children,
}: {
  navItems: NavItem[];
  roleLabel: string;
  userName: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
      {navItems.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-indigo-50 text-indigo-700"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
            )}
          >
            <item.icon className="h-4.5 w-4.5 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const header = (
    <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-4">
      <div className="rounded-xl bg-indigo-600 p-2">
        <GraduationCap className="h-5 w-5 text-white" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-800">CBSE Study Assistant</p>
        <p className="text-xs text-slate-500">{roleLabel}</p>
      </div>
    </div>
  );

  const footer = (
    <div className="border-t border-slate-100 px-3 py-3">
      <p className="truncate px-3 pb-2 text-xs text-slate-500">{userName}</p>
      <button
        onClick={signOut}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-rose-50 hover:text-rose-700"
      >
        <LogOut className="h-4.5 w-4.5" /> Sign out
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-indigo-600" />
          <span className="text-sm font-semibold text-slate-800">CBSE Study Assistant</span>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/30" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 flex h-full w-72 flex-col bg-white shadow-xl">
            {header}
            {nav}
            {footer}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        {header}
        {nav}
        {footer}
      </aside>

      <main className="px-4 py-6 sm:px-6 lg:ml-64 lg:px-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
