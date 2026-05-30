import { useState } from "react";
import { AccountCard } from "@/components/account-card";
import { BankingLayout } from "@/components/banking-layout";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { formatBankNumber } from "@/lib/banking-numbers";

export default function BalancePage() {
  const [accountNumber] = useState(() => {
    if (typeof window === "undefined") {
      return "537822109034";
    }

    return localStorage.getItem("novabank_account_number") || "537822109034";
  });

  return (
    <BankingLayout>
      <main className="page-stack">
        <PageHeader
          eyebrow="Saldo"
          title="Cek saldo"
          description="Ringkasan saldo rekening dan limit transaksi harian."
        />

        <section className="balance-layout">
          <AccountCard />
          <div className="stats-grid compact">
            <StatCard label="Saldo tersedia" value="Rp 24.850.000" tone="blue" />
            <StatCard label="Saldo ditahan" value="Rp 350.000" tone="red" />
            <StatCard label="Limit transfer hari ini" value="Rp 50.000.000" tone="green" />
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <h2>Detail rekening</h2>
          </div>
          <div className="detail-grid">
            <div>
              <span>Nama rekening</span>
              <strong>Raka Aditya</strong>
            </div>
            <div>
              <span>Nomor rekening</span>
              <strong suppressHydrationWarning>{formatBankNumber(accountNumber)}</strong>
            </div>
            <div>
              <span>Jenis rekening</span>
              <strong>Tabungan Platinum</strong>
            </div>
            <div>
              <span>Status</span>
              <strong>Aktif</strong>
            </div>
          </div>
        </section>
      </main>
    </BankingLayout>
  );
}
