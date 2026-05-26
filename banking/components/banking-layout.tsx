import Link from "next/link";
import { useRouter } from "next/router";
import type { ReactNode } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/transfer", label: "Transfer" },
  { href: "/balance", label: "Cek Saldo" },
  { href: "/activity", label: "Aktivitas" },
];

export function BankingLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

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
            <strong>Selamat datang, Raka</strong>
          </div>
          <div className="profile-pill">
            <span>RA</span>
            <div>
              <strong>Raka Aditya</strong>
              <p>Nasabah Prioritas</p>
            </div>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
