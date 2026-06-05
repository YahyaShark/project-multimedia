"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AccountCard } from "@/components/account-card";
import { BankingLayout } from "@/components/banking-layout";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { transactions as sampleTransactions } from "@/lib/sample-data";
import { useLocalStorageValue } from "@/lib/use-local-storage-value";

type Transaction = {
  id: string;
  initial: string;
  title: string;
  date: string;
  category?: string;
  amount: string;
  description?: string;
};

export default function DashboardPage() {
  const savedTransactions = useLocalStorageValue("novabank_transactions", "");
  const baseTransactions: Transaction[] = sampleTransactions;
  const transactions = useMemo(() => {
    if (!savedTransactions) {
      return baseTransactions;
    }

    try {
      const parsed = JSON.parse(savedTransactions) as Transaction[];
      return [...parsed, ...baseTransactions];
    } catch {
      return baseTransactions;
    }
  }, [baseTransactions, savedTransactions]);

  return (
    <BankingLayout>
      <main className="page-stack">
        <PageHeader
          eyebrow="Ringkasan"
          title="Dashboard rekening"
          description="Pantau saldo, mutasi terbaru, dan akses transaksi utama."
        />

        <section className="dashboard-grid">
          <AccountCard />
          <div className="quick-actions">
            <Link href="/transfer">Transfer baru</Link>
            <Link href="/balance">Cek saldo</Link>
            <Link href="/activity">Lihat aktivitas</Link>
          </div>
        </section>

        <section className="stats-grid">
          <StatCard label="Pemasukan bulan ini" value="Rp 12.400.000" tone="green" />
          <StatCard label="Pengeluaran bulan ini" value="Rp 8.750.000" tone="red" />
          <StatCard label="Transfer tertunda" value="2 transaksi" tone="blue" />
        </section>

        <section className="panel">
          <div className="panel-heading">
            <h2>Aktivitas terbaru</h2>
            <Link href="/activity">Lihat semua</Link>
          </div>
          <div className="transaction-list">
            {transactions.slice(0, 4).map((item) => (
              <div className="transaction-item" key={item.id}>
                <span>{item.initial}</span>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.date}</p>
                  {item.description && <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{item.description}</p>}
                </div>
                <b className={item.amount.startsWith("+") ? "income" : "expense"}>
                  {item.amount}
                </b>
              </div>
            ))}
          </div>
        </section>
      </main>
    </BankingLayout>
  );
}
