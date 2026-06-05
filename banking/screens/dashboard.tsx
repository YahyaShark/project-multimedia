"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AccountCard } from "@/components/account-card";
import { BankingLayout } from "@/components/banking-layout";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";

type Transaction = {
  id: string;
  initial: string;
  title: string;
  date: string;
  amount: string;
  description?: string;
  destination?: string;
};

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);

  useEffect(() => {
    async function fetchLatestTransactions() {
      try {
        const accessToken = localStorage.getItem("novabank_access_token");

        if (!accessToken) {
          setTransactions([]);
          return;
        }

        setIsLoadingTransactions(true);
        const response = await fetch("/api/transactions", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          setTransactions([]);
          return;
        }

        const dbTransactions = (await response.json()) as Array<{
          id?: string;
          title?: string;
          description?: string;
          amount?: number;
          destination_bank?: string;
          destination_account?: string;
          destination_name?: string;
          created_at?: string;
        }>;

        const formattedTransactions = dbTransactions.slice(0, 4).map((trx) => {
          const isIncome = (trx.amount || 0) > 0;
          const amount = new Intl.NumberFormat("id-ID").format(Math.abs(trx.amount || 0));
          const date = trx.created_at
            ? new Date(trx.created_at).toLocaleDateString("id-ID", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : new Date().toLocaleDateString("id-ID");

          return {
            id: trx.id || `TRX-${trx.created_at || Date.now()}`,
            initial: isIncome ? "IN" : "OUT",
            title: trx.title || (isIncome ? "Dana masuk" : "Dana keluar"),
            date,
            description: trx.description,
            amount: `${isIncome ? "+" : "-"}Rp ${amount}`,
            destination: [trx.destination_bank, trx.destination_account, trx.destination_name]
              .filter(Boolean)
              .join(" - "),
          };
        });

        setTransactions(formattedTransactions);
      } catch (error) {
        console.error("Error fetching dashboard transactions:", error);
        setTransactions([]);
      } finally {
        setIsLoadingTransactions(false);
      }
    }

    fetchLatestTransactions();
  }, []);

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
            {isLoadingTransactions ? (
              <div style={{ color: "var(--muted)", padding: "16px" }}>
                Memuat aktivitas terbaru...
              </div>
            ) : transactions.length > 0 ? (
              transactions.map((item) => (
                <div className="transaction-item" key={item.id}>
                  <span>{item.initial}</span>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.date}</p>
                    {item.description && (
                      <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                        {item.description}
                      </p>
                    )}
                    {item.destination && (
                      <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                        {item.destination}
                      </p>
                    )}
                  </div>
                  <b className={item.amount.startsWith("+") ? "income" : "expense"}>
                    {item.amount}
                  </b>
                </div>
              ))
            ) : (
              <div style={{ color: "var(--muted)", padding: "16px" }}>
                Belum ada aktivitas transaksi.
              </div>
            )}
          </div>
        </section>
      </main>
    </BankingLayout>
  );
}
