"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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

const PNG_WIDTH = 1080;
const PNG_PADDING = 64;

function drawWrappedText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(" ");
  let line = "";
  let cursorY = y;

  words.forEach((word, index) => {
    const testLine = line ? `${line} ${word}` : word;
    const isLastWord = index === words.length - 1;

    if (context.measureText(testLine).width > maxWidth && line) {
      context.fillText(line, x, cursorY);
      line = word;
      cursorY += lineHeight;
    } else {
      line = testLine;
    }

    if (isLastWord && line) {
      context.fillText(line, x, cursorY);
    }
  });

  return cursorY + lineHeight;
}

function formatFilenameDate() {
  return new Date()
    .toISOString()
    .replace(/[:.]/g, "-")
    .slice(0, 19);
}

// Mengubah logika agar hanya menerima satu object transaksi tunggal
function downloadSingleTransactionAsPng(transaction: Transaction) {
  const rowHeight = 118;
  const headerHeight = 210;
  const footerHeight = 80;
  // Tinggi disesuaikan konstan karena hanya ada 1 baris transaksi
  const height = headerHeight + rowHeight + footerHeight; 
  const canvas = document.createElement("canvas");
  const scale = Math.max(window.devicePixelRatio || 1, 2);
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas tidak tersedia di browser ini.");
  }

  canvas.width = PNG_WIDTH * scale;
  canvas.height = height * scale;
  canvas.style.width = `${PNG_WIDTH}px`;
  canvas.style.height = `${height}px`;
  context.scale(scale, scale);

  context.fillStyle = "#f4f7fb";
  context.fillRect(0, 0, PNG_WIDTH, height);

  context.fillStyle = "#ffffff";
  context.beginPath();
  context.roundRect(36, 36, PNG_WIDTH - 72, height - 72, 18);
  context.fill();

  context.fillStyle = "#1f7a8c";
  context.font = "700 26px Arial, Helvetica, sans-serif";
  context.fillText("NOVA BANK", PNG_PADDING, 92);

  context.fillStyle = "#17202f";
  context.font = "800 46px Arial, Helvetica, sans-serif";
  context.fillText("Detail Transaksi", PNG_PADDING, 148);

  context.fillStyle = "#647084";
  context.font = "400 22px Arial, Helvetica, sans-serif";
  context.fillText(
    `Diunduh ${new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}`,
    PNG_PADDING,
    188,
  );

  const y = headerHeight;
  const isIncome = transaction.amount.startsWith("+");

  context.fillStyle = "#fbfdff";
  context.beginPath();
  context.roundRect(PNG_PADDING, y, PNG_WIDTH - PNG_PADDING * 2, rowHeight - 18, 14);
  context.fill();

  context.strokeStyle = "#dfe6ef";
  context.lineWidth = 1;
  context.stroke();

  context.fillStyle = "#0f2a43";
  context.beginPath();
  context.roundRect(PNG_PADDING + 22, y + 24, 58, 58, 12);
  context.fill();

  context.fillStyle = "#ffffff";
  context.font = "800 18px Arial, Helvetica, sans-serif";
  context.textAlign = "center";
  context.fillText(transaction.initial, PNG_PADDING + 51, y + 60);
  context.textAlign = "left";

  context.fillStyle = "#17202f";
  context.font = "800 24px Arial, Helvetica, sans-serif";
  context.fillText(transaction.title, PNG_PADDING + 104, y + 34);

  context.fillStyle = "#647084";
  context.font = "400 18px Arial, Helvetica, sans-serif";
  context.fillText(transaction.date, PNG_PADDING + 104, y + 63);

  if (transaction.description || transaction.destination) {
    context.font = "400 16px Arial, Helvetica, sans-serif";
    drawWrappedText(
      context,
      [transaction.description, transaction.destination].filter(Boolean).join(" - "),
      PNG_PADDING + 104,
      y + 88,
      560,
      20,
    );
  }

  context.fillStyle = isIncome ? "#15805f" : "#c84d58";
  context.font = "800 24px Arial, Helvetica, sans-serif";
  context.textAlign = "right";
  context.fillText(transaction.amount, PNG_WIDTH - PNG_PADDING - 22, y + 58);
  context.textAlign = "left";

  context.fillStyle = "#647084";
  context.font = "400 16px Arial, Helvetica, sans-serif";
  context.fillText("NovaBank Digital", PNG_PADDING, height - 56);

  const link = document.createElement("a");
  link.download = `bukti-transaksi-${transaction.id}-${formatFilenameDate()}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

export default function ActivityPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

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

    const interval = setInterval(fetchTransactions, 3000);

    return () => clearInterval(interval);
  }, []);

  const filteredTransactions = useMemo(() => {
    let result = transactions;

    if (filterType !== "all") {
      result = result.filter((item) =>
        filterType === "income" ? item.amount.startsWith("+") : item.amount.startsWith("-"),
      );
    }

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

  // Mengubah handler agar menerima parameter item transaksi spesifik
  const handleDownloadPng = useCallback((transaction: Transaction) => {
    try {
      setDownloadError("");
      downloadSingleTransactionAsPng(transaction);
    } catch (error) {
      console.error("Error downloading transaction PNG:", error);
      setDownloadError("Gagal membuat gambar PNG. Silakan coba lagi.");
    }
  }, []);

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
            {/* Tombol global download dihilangkan dari sini karena fungsinya diubah per item */}
          </div>
          {downloadError && <p className="form-message error">{downloadError}</p>}
          <div className="transaction-list">
            {isLoading && filteredTransactions.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
                <p>Memuat transaksi...</p>
              </div>
            ) : filteredTransactions.length > 0 ? (
              filteredTransactions.map((item) => (
                <div className="transaction-item" key={item.id} style={{ display: "flex", alignItems: "center", justifyContent: "between" }}>
                  <span>{item.initial}</span>
                  <div style={{ flex: 1, marginLeft: "12px" }}>
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
                  <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
                    <b className={item.amount.startsWith("+") ? "income" : "expense"}>
                      {item.amount}
                    </b>
                    {/* Menambahkan tombol download untuk masing-masing transaksi */}
                    <button
                      className="primary-action download-action"
                      style={{ padding: "4px 8px", fontSize: "12px" }}
                      onClick={() => handleDownloadPng(item)}
                      type="button"
                    >
                      Download PNG
                    </button>
                  </div>
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