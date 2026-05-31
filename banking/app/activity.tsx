"use client";

import { useEffect, useState } from "react";
import { BankingLayout } from "@/components/banking-layout";
import { PageHeader } from "@/components/page-header";
import { transactions as sampleTransactions } from "@/lib/sample-data";

type Transaction = {
  id: string;
  initial: string;
  title: string;
  date: string;
  category?: string;
  amount: string;
  description?: string;
};

export default function ActivityPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(sampleTransactions);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>(sampleTransactions);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    // Baca transaksi dari localStorage
    if (typeof window !== "undefined") {
      const savedTransactions = localStorage.getItem("novabank_transactions");
      if (savedTransactions) {
        try {
          const parsed = JSON.parse(savedTransactions);
          setTransactions([...parsed, ...sampleTransactions]);
        } catch (error) {
          setTransactions(sampleTransactions);
        }
      }
    }
  }, []);

  useEffect(() => {
    let result = transactions;

    // Filter berdasarkan tipe
    if (filterType !== "all") {
      result = result.filter((item) =>
        filterType === "income" ? item.amount.startsWith("+") : item.amount.startsWith("-"),
      );
    }

    // Filter berdasarkan search
    if (searchQuery) {
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.amount.includes(searchQuery),
      );
    }

    setFilteredTransactions(result);
  }, [searchQuery, filterType, transactions]);

  return (
    <BankingLayout>
      <main className="page-stack">
        <PageHeader
          eyebrow="Mutasi"
          title="Aktivitas transaksi"
          description="Daftar transaksi masuk dan keluar dalam rekening."
        />

        <section className="panel">
          <div className="filter-row">
            <input
              type="search"
              placeholder="Cari aktivitas"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="all">Semua transaksi</option>
              <option value="income">Pemasukan</option>
              <option value="expense">Pengeluaran</option>
            </select>
          </div>
          <div className="transaction-list">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((item) => (
                <div className="transaction-item" key={item.id}>
                  <span>{item.initial}</span>
                  <div>
                    <strong>{item.title}</strong>
                    <p>
                      {item.date} {item.category && `- ${item.category}`}
                    </p>
                    {item.description && <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{item.description}</p>}
                  </div>
                  <b className={item.amount.startsWith("+") ? "income" : "expense"}>
                    {item.amount}
                  </b>
                </div>
              ))
            ) : (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
                <p>Tidak ada transaksi yang sesuai</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </BankingLayout>
  );
}
