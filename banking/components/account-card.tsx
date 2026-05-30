"use client";

import { useState } from "react";
import { formatBankNumber, generateCardNumber } from "@/lib/banking-numbers";

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

  return (
    <article className="account-card">
      <div className="account-card-top">
        <span>NovaBank Platinum</span>
        <b>VISA</b>
      </div>
      <div>
        <p>Saldo utama</p>
        <h2>Rp 24.850.000</h2>
      </div>
      <div className="account-card-bottom">
        <span suppressHydrationWarning>{formatBankNumber(cardNumber)}</span>
        <span>12/29</span>
      </div>
    </article>
  );
}
