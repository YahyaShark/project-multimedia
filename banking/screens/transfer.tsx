"use client";

import { FormEvent, useState } from "react";
import { BankingLayout } from "@/components/banking-layout";
import { PageHeader } from "@/components/page-header";
import { formatBankNumber } from "@/lib/banking-numbers";
import { useLocalStorageValue } from "@/lib/use-local-storage-value";

type TransferData = {
  sourceAccount: string;
  destinationBank: string;
  destinationAccount: string;
  destinationName: string;
  nominal: number;
  notes: string;
};

function formatCurrency(value: string): string {
  const numericValue = value.replace(/\D/g, "");
  if (!numericValue) return "";
  return new Intl.NumberFormat("id-ID").format(parseInt(numericValue));
}

function parseCurrency(value: string): number {
  return parseInt(value.replace(/\D/g, "")) || 0;
}

export default function TransferPage() {
  const accountNumber = useLocalStorageValue("novabank_account_number", "537822109034");

  const [sourceAccount, setSourceAccount] = useState("primary");
  const [destinationBank, setDestinationBank] = useState("NovaBank");
  const [destinationAccount, setDestinationAccount] = useState("");
  const [destinationName, setDestinationName] = useState("");
  const [nominal, setNominal] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [transferData, setTransferData] = useState<TransferData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  function handleNominalChange(e: React.ChangeEvent<HTMLInputElement>) {
    const formatted = formatCurrency(e.target.value);
    setNominal(formatted);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    // Validasi
    if (destinationBank !== "NovaBank") {
      setError("Transfer hanya tersedia untuk rekening NovaBank");
      return;
    }
    if (!destinationAccount || destinationAccount.length < 8) {
      setError("Nomor rekening tujuan harus minimal 8 digit");
      return;
    }
    if (!destinationName.trim()) {
      setError("Nama penerima harus diisi");
      return;
    }
    if (destinationBank === "NovaBank" && destinationAccount === accountNumber) {
      setError("Tidak dapat transfer ke rekening sendiri");
      return;
    }

    const nominalValue = parseCurrency(nominal);
    if (nominalValue < 10000) {
      setError("Nominal transfer minimal Rp 10.000");
      return;
    }
    if (nominalValue > 1000000000) {
      setError("Nominal transfer maksimal Rp 1.000.000.000");
      return;
    }

    // Tampilkan konfirmasi
    const data: TransferData = {
      sourceAccount,
      destinationBank,
      destinationAccount,
      destinationName,
      nominal: nominalValue,
      notes,
    };
    setTransferData(data);
    setShowConfirmation(true);
  }

  async function handleConfirmTransfer() {
    if (!transferData) return;

    setIsLoading(true);
    try {
      const accessToken = localStorage.getItem("novabank_access_token");

      if (!accessToken) {
        setError("Session login tidak ditemukan. Silakan login kembali.");
        setIsLoading(false);
        return;
      }

      // Kirim ke API
      const response = await fetch("/api/transfer", {
        body: JSON.stringify({
          destinationAccount: transferData.destinationAccount,
          destinationBank: transferData.destinationBank,
          destinationName: transferData.destinationName,
          nominal: transferData.nominal,
          notes: transferData.notes,
        }),
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      const text = await response.text();
      let data: Record<string, unknown>;

      try {
        data = JSON.parse(text);
      } catch {
        console.error("Response text:", text);
        setError("Terjadi kesalahan pada server. Periksa console untuk detail.");
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        setError(data.error ? String(data.error) : "Gagal memproses transfer");
        setIsLoading(false);
        return;
      }

      // Update saldo di localStorage untuk sync
      if (data.newBalance) {
        localStorage.setItem("novabank_balance", String(data.newBalance));

        // Trigger refresh di components lain via storage event
        const event = new StorageEvent("storage", {
          key: "novabank_balance",
          newValue: String(data.newBalance),
          url: window.location.href,
        });
        window.dispatchEvent(event);
      }

      // Simpan transaksi ke localStorage sebagai fallback
      const transactions = JSON.parse(
        localStorage.getItem("novabank_transactions") || "[]",
      );
      transactions.unshift({
        id: data.transactionId || `TRF-${Date.now()}`,
        type: "transfer",
        title: `Transfer ke ${transferData.destinationBank}`,
        description: `Ke: ${transferData.destinationName}`,
        amount: `-Rp ${new Intl.NumberFormat("id-ID").format(transferData.nominal)}`,
        date: new Date().toLocaleDateString("id-ID", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        initial: "TRF",
      });
      localStorage.setItem("novabank_transactions", JSON.stringify(transactions));

      setSuccessMessage("Transfer berhasil diproses!");
      setShowConfirmation(false);

      // Reset form
      setTimeout(() => {
        setSourceAccount("primary");
        setDestinationBank("NovaBank");
        setDestinationAccount("");
        setDestinationName("");
        setNominal("");
        setNotes("");
        setSuccessMessage("");
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Terjadi kesalahan saat memproses transfer",
      );
      setIsLoading(false);
    }
  }

  if (successMessage) {
    return (
      <BankingLayout>
        <main className="page-stack">
          <div className="success-container" style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: "64px", marginBottom: "20px" }}>✓</div>
            <h2>{successMessage}</h2>
            <p style={{ color: "var(--text-muted)", marginTop: "10px" }}>
              Transaksi akan diproses dalam beberapa saat
            </p>
          </div>
        </main>
      </BankingLayout>
    );
  }

  return (
    <BankingLayout>
      <main className="page-stack">
        <PageHeader
          eyebrow="Transaksi"
          title="Transfer dana"
          description="Kirim dana ke rekening tujuan dengan aman dan cepat."
        />

        <section className="form-panel">
          <form className="form-grid" onSubmit={handleSubmit}>
            <label>
              <span>Rekening sumber</span>
              <select
                value={sourceAccount}
                onChange={(e) => setSourceAccount(e.target.value)}
                disabled
              >
                <option value="primary" suppressHydrationWarning>
                  NovaBank Utama - {formatBankNumber(accountNumber)}
                </option>
                <option value="savings">Tabungan Pendidikan - 7781 4309 2201</option>
              </select>
            </label>
            <label>
              <span>Bank tujuan</span>
              <select value={destinationBank} onChange={(e) => setDestinationBank(e.target.value)} disabled>
                <option value="NovaBank">NovaBank</option>
              </select>
            </label>
            <label>
              <span>Nomor rekening tujuan (Account Number)</span>
              <input
                type="text"
                placeholder="Contoh: 5378221090"
                value={destinationAccount}
                onChange={(e) =>
                  setDestinationAccount(e.target.value.replace(/\D/g, "").slice(0, 16))
                }
              />
            </label>
            <label>
              <span>Nama penerima</span>
              <input
                type="text"
                placeholder="Nama penerima"
                value={destinationName}
                onChange={(e) => setDestinationName(e.target.value)}
              />
            </label>
            <label>
              <span>Nominal transfer</span>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "12px", top: "12px", color: "var(--text-muted)" }}>
                  Rp
                </span>
                <input
                  type="text"
                  placeholder="0"
                  value={nominal}
                  onChange={handleNominalChange}
                  style={{ paddingLeft: "32px" }}
                />
              </div>
            </label>
            <label>
              <span>Catatan</span>
              <input
                type="text"
                placeholder="Opsional"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={50}
              />
            </label>
            {error && <p style={{ color: "var(--color-error)", fontSize: "14px" }}>{error}</p>}
            <button type="submit" className="primary-action form-submit" disabled={isLoading}>
              {isLoading ? "Memproses..." : "Lanjutkan"}
            </button>
          </form>
        </section>
      </main>

      {showConfirmation && transferData && (
        <div
          className="transfer-modal-overlay"
          onClick={() => setShowConfirmation(false)}
          role="presentation"
        >
          <div
            aria-modal="true"
            className="transfer-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
          >
            <h2 style={{ marginBottom: "20px" }}>Konfirmasi Transfer</h2>
            {transferData.destinationBank === "NovaBank" && (
              <div style={{ backgroundColor: "rgba(76, 175, 80, 0.1)", padding: "12px", borderRadius: "6px", marginBottom: "16px", fontSize: "12px", color: "var(--color-success)" }}>
                ✓ Transfer langsung ke pengguna NovaBank
              </div>
            )}
            <div style={{ marginBottom: "20px", fontSize: "14px", lineHeight: "1.8" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                <span style={{ color: "var(--text-muted)" }}>Ke Bank:</span>
                <strong>{transferData.destinationBank}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                <span style={{ color: "var(--text-muted)" }}>Atas Nama:</span>
                <strong>{transferData.destinationName}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                <span style={{ color: "var(--text-muted)" }}>Nomor Rekening:</span>
                <strong>{formatBankNumber(transferData.destinationAccount)}</strong>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "20px",
                  paddingTop: "20px",
                  borderTop: "1px solid var(--border-color)",
                }}
              >
                <span style={{ color: "var(--text-muted)" }}>Nominal:</span>
                <strong style={{ fontSize: "18px", color: "var(--color-primary)" }}>
                  Rp {new Intl.NumberFormat("id-ID").format(transferData.nominal)}
                </strong>
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button
                onClick={() => setShowConfirmation(false)}
                style={{
                  flex: 1,
                  padding: "12px",
                  border: "1px solid var(--border-color)",
                  borderRadius: "6px",
                  backgroundColor: "transparent",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                Batal
              </button>
              <button
                onClick={handleConfirmTransfer}
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: "12px",
                  backgroundColor: "var(--color-primary)",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  fontWeight: 500,
                  opacity: isLoading ? 0.7 : 1,
                }}
              >
                {isLoading ? "Memproses..." : "Kirim"}
              </button>
            </div>
          </div>
        </div>
      )}
    </BankingLayout>
  );
}
