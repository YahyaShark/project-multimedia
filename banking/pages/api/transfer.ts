import type { NextApiRequest, NextApiResponse } from "next";

type TransferRequest = {
  destinationBank?: string;
  destinationAccount?: string;
  destinationName?: string;
  nominal?: number;
  notes?: string;
};

type TransferResponse = {
  success?: boolean;
  message?: string;
  transactionId?: string;
  newBalance?: number;
  error?: string;
};

type SupabaseUser = {
  id?: string;
  error?: string;
  error_description?: string;
  msg?: string;
};

type Account = {
  id?: string;
  balance?: number;
  error?: string;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getConfig() {
  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    throw new Error("Konfigurasi Supabase belum lengkap.");
  }

  return {
    anonKey: supabaseAnonKey,
    serviceRoleKey,
    supabaseUrl,
  };
}

async function getUserId(token: string) {
  const { anonKey, supabaseUrl: url } = getConfig();
  const response = await fetch(`${url}/auth/v1/user`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${token}`,
    },
  });
  const data = (await response.json()) as SupabaseUser;

  if (!response.ok || !data.id) {
    throw new Error(
      data.error_description || data.msg || data.error || "Session login tidak valid.",
    );
  }

  return data.id;
}

async function getUserAccount(userId: string) {
  const { serviceRoleKey: key, supabaseUrl: url } = getConfig();
  const response = await fetch(`${url}/rest/v1/accounts?user_id=eq.${userId}&select=id,balance&limit=1`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
  });

  if (!response.ok) {
    throw new Error("Gagal mengambil akun pengguna.");
  }

  const accounts = (await response.json()) as Account[];
  if (!accounts[0]) {
    throw new Error("Akun pengguna tidak ditemukan.");
  }

  return accounts[0];
}

async function updateAccountBalance(accountId: string, newBalance: number) {
  const { serviceRoleKey: key, supabaseUrl: url } = getConfig();
  const response = await fetch(`${url}/rest/v1/accounts?id=eq.${accountId}`, {
    body: JSON.stringify({ balance: newBalance }),
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    method: "PATCH",
  });

  if (!response.ok) {
    throw new Error("Gagal memperbarui saldo.");
  }
}

async function insertTransaction(
  senderAccountId: string,
  amount: number,
  description: string,
  status: string = "completed",
) {
  const { serviceRoleKey: key, supabaseUrl: url } = getConfig();
  const response = await fetch(`${url}/rest/v1/transactions`, {
    body: JSON.stringify({
      amount,
      created_at: new Date().toISOString(),
      description,
      sender_account_id: senderAccountId,
      status,
    }),
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    method: "POST",
  });

  const data = (await response.json()) as Account[];

  if (!response.ok || !data[0]) {
    throw new Error("Gagal menyimpan transaksi.");
  }

  return data[0];
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse<TransferResponse>,
) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method tidak didukung." });
  }

  const token = request.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return response.status(401).json({ error: "Token login tidak ditemukan." });
  }

  const { destinationBank, destinationAccount, destinationName, nominal, notes } =
    request.body as TransferRequest;

  if (!destinationBank || !destinationAccount || !destinationName || !nominal || nominal <= 0) {
    return response.status(400).json({
      error: "Data transfer tidak lengkap atau nominal tidak valid.",
    });
  }

  if (nominal < 10000 || nominal > 1000000000) {
    return response.status(400).json({
      error: "Nominal transfer harus antara Rp 10.000 - Rp 1.000.000.000",
    });
  }

  try {
    const userId = await getUserId(token);
    const account = await getUserAccount(userId);

    if (!account.id || account.balance === undefined) {
      return response.status(400).json({ error: "Akun atau saldo tidak ditemukan." });
    }

    if (account.balance < nominal) {
      return response.status(400).json({
        error: "Saldo tidak cukup untuk melakukan transfer.",
      });
    }

    const newBalance = account.balance - nominal;

    // Update balance
    await updateAccountBalance(account.id, newBalance);

    // Insert transaction
    const description = `Transfer ke ${destinationBank} - ${destinationName} (${destinationAccount})${notes ? ` - ${notes}` : ""}`;
    const transaction = await insertTransaction(
      account.id,
      -nominal,
      description,
      "completed",
    );

    return response.status(201).json({
      message: "Transfer berhasil diproses.",
      newBalance,
      success: true,
      transactionId: transaction.id as string,
    });
  } catch (error) {
    console.error("Transfer error:", error);
    return response.status(400).json({
      error: error instanceof Error ? error.message : "Gagal memproses transfer.",
    });
  }
}
