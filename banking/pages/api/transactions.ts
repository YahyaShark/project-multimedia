import type { NextApiRequest, NextApiResponse } from "next";

type SupabaseUser = {
  id?: string;
  error?: string;
  error_description?: string;
  msg?: string;
};

type Transaction = {
  id?: string;
  sender_account_id?: string;
  receiver_account_id?: string;
  amount?: number;
  description?: string;
  status?: string;
  created_at?: string;
  error?: string;
};

type ErrorResponse = {
  error: string;
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

async function getUserAccountId(userId: string) {
  const { serviceRoleKey: key, supabaseUrl: url } = getConfig();
  const response = await fetch(`${url}/rest/v1/accounts?user_id=eq.${userId}&select=id&limit=1`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
  });

  if (!response.ok) {
    throw new Error("Gagal mengambil data akun.");
  }

  const accounts = (await response.json()) as Array<{ id: string }>;
  if (!accounts[0]) {
    throw new Error("Akun pengguna tidak ditemukan.");
  }

  return accounts[0].id;
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse<Transaction[] | ErrorResponse>,
) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Method tidak didukung." });
  }

  const token = request.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return response.status(401).json({ error: "Token login tidak ditemukan." });
  }

  try {
    const userId = await getUserId(token);
    console.log("USER ID:", userId);
    const accountId = await getUserAccountId(userId);
    console.log("ACCOUNT ID:", accountId);
    const { serviceRoleKey: key, supabaseUrl: url } = getConfig();

    const queryResponse = await fetch(
      `${url}/rest/v1/transactions?sender_account_id=eq.${accountId}&order=created_at.desc&select=id,sender_account_id,receiver_account_id,amount,description,status,created_at`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
      },
    );

    if (!queryResponse.ok) {
      return response.status(400).json({ error: "Gagal mengambil data transaksi." });
    }

    const transactions = (await queryResponse.json()) as Transaction[];
    console.log("TRANSACTIONS:", transactions);
    return response.status(200).json(transactions);
  } catch (error) {
    return response.status(400).json({
      error: error instanceof Error ? error.message : "Gagal mengambil transaksi.",
    });
  }
}
