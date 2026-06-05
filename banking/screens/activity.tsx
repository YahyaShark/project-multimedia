"use client";

import { useEffect, useMemo, useState } from "react";
import { BankingLayout } from "@/components/banking-layout";
import { PageHeader } from "@/components/page-header";

type Transaction = {
  id: string;
  initial: string;
  title: string;
  date: string;
  type?: string;
  amount: string;
  description?: string;
  destination?: string;
  notes?: string;
  created_at?: string;
};

export default function ActivityPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch transaksi dari database setiap 3 detik untuk real-time
  useEffect(() => {
    async function fetchTransactions() {
      try {
        const accessToken = localStorage.getItem("novabank_access_token");

        if (!accessToken) {
          setTransactions([]);
          return;
        }

        setIsLoading(true);
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
          type?: string;
          title?: string;
          description?: string;
          amount?: number;
          destination_bank?: string;
          destination_account?: string;
          destination_name?: string;
          notes?: string;
          created_at?: string;
        }>;

        // Transform database transactions to UI format
        const formattedTransactions: Transaction[] = dbTransactions.map((trx) => {
          const date = trx.created_at
            ? new Date(trx.created_at).toLocaleDateString("id-ID", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : new Date().toLocaleDateString("id-ID");

          const isIncome = (trx.amount || 0) > 0;
          const amount = new Intl.NumberFormat("id-ID").format(Math.abs(trx.amount || 0));

          return {
            id: trx.id || `TRX-${Date.now()}`,
            initial: isIncome ? "IN" : "OUT",
            title: trx.title || (isIncome ? "Dana masuk" : "Dana keluar"),
            date,
            description: trx.description,
            amount: `${isIncome ? "+" : "-"}Rp ${amount}`,
            destination: [trx.destination_bank, trx.destination_account, trx.destination_name]
              .filter(Boolean)
              .join(" - "),
            notes: trx.notes,
            type: trx.type,
            created_at: trx.created_at,
          };
        });

        setTransactions(formattedTransactions);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching transactions:", error);
        setTransactions([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTransactions();

    // Polling setiap 3 detik untuk update real-time
    const interval = setInterval(fetchTransactions, 3000);

    return () => clearInterval(interval);
  }, []);

  const filteredTransactions = useMemo(() => {
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

    return result;
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
            {isLoading && filteredTransactions.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
                <p>Memuat transaksi...</p>
              </div>
            ) : filteredTransactions.length > 0 ? (
              filteredTransactions.map((item) => (
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
              <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
                <p>Tidak ada transaksi yang sesuai</p>
              </div>
            )}
          </div>
          {isLoading && (
            <p
              style={{
                fontSize: "12px",
                color: "var(--text-muted)",
                textAlign: "center",
                marginTop: "12px",
              }}
            >
              Memperbarui data transaksi...
            </p>
          )}
        </section>
      </main>
    </BankingLayout>
  );
}
