"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import type { ReactNode } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/transfer", label: "Transfer" },
  { href: "/balance", label: "Cek Saldo" },
  { href: "/activity", label: "Aktivitas" },
];

export function BankingLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [{ fullName, initials }] = useState(() => {
    if (typeof window === "undefined") {
      return { fullName: "Nasabah", initials: "NB" };
    }

    const savedFullName = localStorage.getItem("novabank_full_name") || "Nasabah";
    const savedInitials = savedFullName
      .split(" ")
      .map((name) => name.charAt(0))
      .join("")
      .toUpperCase();

    return {
      fullName: savedFullName,
      initials: savedInitials || "NB",
    };
  });

  const firstName = fullName.split(" ")[0];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link href="/dashboard" className="sidebar-brand">
          <span>NB</span>
          <strong>NovaBank</strong>
        </Link>
        <nav aria-label="Menu utama">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={router.pathname === item.href ? "active" : ""}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link className="logout-link" href="/login">
          Keluar
        </Link>
      </aside>

      <div className="content-shell">
        <header className="topbar">
          <div>
            <p className="eyebrow">Personal Banking</p>
            <strong suppressHydrationWarning>Selamat datang, {firstName}</strong>
          </div>
          <div className="profile-pill">
            <span suppressHydrationWarning>{initials}</span>
            <div>
              <strong suppressHydrationWarning>{fullName}</strong>
              <p>Nasabah Prioritas</p>
            </div>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
