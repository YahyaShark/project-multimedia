"use client";

import { useEffect, useState } from "react";
import { formatBankNumber, generateCardNumber } from "@/lib/banking-numbers";

const INITIAL_BALANCE = 0;

function EyeIcon({ hidden }: { hidden: boolean }) {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      {hidden ? (
        <>
          <path d="m3 3 18 18" />
          <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83" />
          <path d="M9.88 4.24A10.9 10.9 0 0 1 12 4c5 0 9 5 9 8a8.8 8.8 0 0 1-1.17 2.68" />
          <path d="M6.61 6.61C4.46 8.04 3 10.38 3 12c0 3 4 8 9 8 1.39 0 2.74-.39 3.93-1.03" />
        </>
      ) : (
        <>
          <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  );
}

export function AccountCard() {
  const [showBalance, setShowBalance] = useState(false);

  const [cardNumber] = useState(() => {
    if (typeof window === "undefined") {
      return "537822109034";
    }

    const savedCardNumber = localStorage.getItem("novabank_card_number");

    if (savedCardNumber) {
      return savedCardNumber;
    }

    const newCardNumber = generateCardNumber();
    localStorage.setItem("novabank_card_number", newCardNumber);
    return newCardNumber;
  });

  const [balance, setBalance] = useState(() => {
    if (typeof window === "undefined") {
      return INITIAL_BALANCE;
    }

    return parseInt(
      localStorage.getItem("novabank_balance") || String(INITIAL_BALANCE)
    );
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "novabank_balance" && e.newValue) {
        setBalance(parseInt(e.newValue));
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const formattedBalance = new Intl.NumberFormat("id-ID").format(balance);

  return (
    <article className="account-card">
      <div className="account-card-top">
        <span>NovaBank Platinum</span>
        <b>VISA</b>
      </div>

      <div>
        <p>Saldo utama</p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <h2 suppressHydrationWarning>
            {showBalance ? `Rp ${formattedBalance}` : "Rp ********"}
          </h2>

          <button
            onClick={() => setShowBalance(!showBalance)}
            aria-label={showBalance ? "Sembunyikan saldo" : "Tampilkan saldo"}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "white",
              display: "flex",
              alignItems: "center",
            }}
          >
            <EyeIcon hidden={showBalance} />
          </button>
        </div>
      </div>

      <div className="account-card-bottom">
        <span suppressHydrationWarning>
          {formatBankNumber(cardNumber)}
        </span>
        <span>12/29</span>
      </div>
    </article>
  );
}
