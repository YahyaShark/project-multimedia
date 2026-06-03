"use client";

import { useEffect, useState } from "react";
import { formatBankNumber, generateCardNumber } from "@/lib/banking-numbers";

const INITIAL_BALANCE = 0;

export function AccountCard() {
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

    return parseInt(localStorage.getItem("novabank_balance") || String(INITIAL_BALANCE));
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Listen untuk perubahan balance dari tab/window lain
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
        <h2 suppressHydrationWarning>Rp {formattedBalance}</h2>
      </div>
      <div className="account-card-bottom">
        <span suppressHydrationWarning>{formatBankNumber(cardNumber)}</span>
        <span>12/29</span>  
      </div>
    </article>
  );
}
