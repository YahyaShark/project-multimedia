import type { NextApiRequest, NextApiResponse } from "next";

type SupabaseUser = {
  id?: string;
  error?: string;
  error_description?: string;
  msg?: string;
};

type Transaction = {
  id?: string;
  user_id?: string;
  type?: string;
  title?: string;
  description?: string;
  amount?: number;
  destination_bank?: string;
  destination_account?: string;
  destination_name?: string;
  notes?: string;
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
    const { serviceRoleKey: key, supabaseUrl: url } = getConfig();

    const queryResponse = await fetch(
      `${url}/rest/v1/transactions?user_id=eq.${userId}&order=created_at.desc&select=id,user_id,type,title,description,amount,destination_bank,destination_account,destination_name,notes,created_at`,
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
    return response.status(200).json(transactions);
  } catch (error) {
    return response.status(400).json({
      error: error instanceof Error ? error.message : "Gagal mengambil transaksi.",
    });
  }
}
