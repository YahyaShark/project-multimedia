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

type Profile = {
  id?: string;
  balance?: number;
  account_number?: string;
  full_name?: string;
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

async function getUserProfile(userId: string) {
  const { serviceRoleKey: key, supabaseUrl: url } = getConfig();
  const response = await fetch(`${url}/rest/v1/profiles?id=eq.${userId}&select=id,balance,account_number,full_name&limit=1`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
  });

  if (!response.ok) {
    throw new Error("Gagal mengambil profil pengguna.");
  }

  const profiles = (await response.json()) as Profile[];
  if (!profiles[0]) {
    throw new Error("Profil pengguna tidak ditemukan.");
  }

  return profiles[0];
}

async function getProfileByAccountNumber(accountNumber: string) {
  const { serviceRoleKey: key, supabaseUrl: url } = getConfig();
  const response = await fetch(`${url}/rest/v1/profiles?account_number=eq.${accountNumber}&select=id,balance,account_number,full_name&limit=1`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
  });

  if (!response.ok) {
    throw new Error("Gagal mencari akun tujuan.");
  }

  const profiles = (await response.json()) as Profile[];
  return profiles[0] || null;
}

async function updateProfileBalance(userId: string, newBalance: number) {
  const { serviceRoleKey: key, supabaseUrl: url } = getConfig();
  const response = await fetch(`${url}/rest/v1/profiles?id=eq.${userId}`, {
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
  userId: string,
  type: string,
  title: string,
  amount: number,
  destinationBank?: string,
  destinationAccount?: string,
  destinationName?: string,
  notes?: string,
) {
  const { serviceRoleKey: key, supabaseUrl: url } = getConfig();
  const response = await fetch(`${url}/rest/v1/transactions`, {
    body: JSON.stringify({
      user_id: userId,
      type,
      title,
      amount,
      destination_bank: destinationBank,
      destination_account: destinationAccount,
      destination_name: destinationName,
      notes,
      created_at: new Date().toISOString(),
    }),
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Gagal menyimpan transaksi.");
  }

  return await response.json();
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
    const senderProfile = await getUserProfile(userId);

    if (!senderProfile.id || senderProfile.balance === undefined) {
      return response.status(400).json({ error: "Akun atau saldo tidak ditemukan." });
    }

    if (senderProfile.balance < nominal) {
      return response.status(400).json({
        error: "Saldo tidak cukup untuk melakukan transfer.",
      });
    }

    // Cek apakah tujuan adalah pengguna NovaBank (destinationAccount adalah account_number)
    const recipientProfile = await getProfileByAccountNumber(destinationAccount);

    let newSenderBalance = senderProfile.balance - nominal;

    if (recipientProfile && recipientProfile.id) {
      // Transfer antar pengguna NovaBank
      const newRecipientBalance = (recipientProfile.balance || 0) + nominal;

      // Update balance kedua pengguna
      await updateProfileBalance(senderProfile.id, newSenderBalance);
      await updateProfileBalance(recipientProfile.id, newRecipientBalance);

      // Insert transaksi untuk pengirim
      await insertTransaction(
        senderProfile.id,
        "transfer",
        `Transfer ke ${recipientProfile.full_name}`,
        -nominal,
        "NovaBank",
        destinationAccount,
        recipientProfile.full_name,
        notes,
      );

      // Insert transaksi untuk penerima
      await insertTransaction(
        recipientProfile.id,
        "transfer",
        `Transfer dari ${senderProfile.full_name}`,
        nominal,
        "NovaBank",
        senderProfile.account_number,
        senderProfile.full_name,
        notes,
      );

      return response.status(201).json({
        message: "Transfer ke pengguna NovaBank berhasil diproses.",
        newBalance: newSenderBalance,
        success: true,
      });
    } else {
      // Transfer ke bank eksternal (simulasi)
      await updateProfileBalance(senderProfile.id, newSenderBalance);

      // Insert transaksi untuk pengirim
      await insertTransaction(
        senderProfile.id,
        "transfer",
        `Transfer ke ${destinationBank}`,
        -nominal,
        destinationBank,
        destinationAccount,
        destinationName,
        notes,
      );

      return response.status(201).json({
        message: "Transfer ke bank eksternal berhasil diproses.",
        newBalance: newSenderBalance,
        success: true,
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Transfer gagal.";
    console.error("[Transfer API Error]", errorMessage, error);
    return response.status(400).json({ error: errorMessage });
  }
}
