import type { NextApiRequest, NextApiResponse } from "next";
import { generateAccountNumber, generateCardNumber } from "@/lib/banking-numbers";

type RegisterBody = {
  email?: string;
  fullName?: string;
  password?: string;
};

type AuthUserResponse = {
  code?: string;
  details?: string;
  id?: string;
  error?: string;
  error_description?: string;
  message?: string;
  msg?: string;
};

type ErrorResponse = {
  error: string;
};

type SuccessResponse = {
  accountNumber: string;
  cardNumber: string;
  email: string;
  fullName: string;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getServerConfig() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Konfigurasi Supabase server belum lengkap.");
  }

  return {
    serviceRoleKey,
    supabaseUrl,
  };
}

function getSupabaseError(data: AuthUserResponse, fallback: string) {
  if (data.code === "PGRST205") {
    return "Tabel public.profiles belum dibuat di Supabase. Jalankan file supabase-profiles.sql dulu.";
  }

  return data.error_description || data.msg || data.message || data.error || fallback;
}

async function checkProfilesTable() {
  const { serviceRoleKey: key, supabaseUrl: url } = getServerConfig();
  const response = await fetch(`${url}/rest/v1/profiles?select=id&limit=1`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
  });
  const text = await response.text();
  const data = text ? (JSON.parse(text) as AuthUserResponse) : {};

  if (!response.ok) {
    throw new Error(getSupabaseError(data, "Tabel profil belum bisa diakses."));
  }
}

async function createAuthUser(body: Record<string, unknown>) {
  const { serviceRoleKey: key, supabaseUrl: url } = getServerConfig();
  const response = await fetch(`${url}/auth/v1/admin/users`, {
    body: JSON.stringify(body),
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  const data = (await response.json()) as AuthUserResponse;

  if (!response.ok) {
    throw new Error(getSupabaseError(data, "Request Supabase gagal."));
  }

  return data;
}

async function deleteAuthUser(userId: string) {
  const { serviceRoleKey: key, supabaseUrl: url } = getServerConfig();

  await fetch(`${url}/auth/v1/admin/users/${userId}`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
    method: "DELETE",
  });
}

async function insertProfile(body: Record<string, unknown>) {
  const { serviceRoleKey: key, supabaseUrl: url } = getServerConfig();
  const response = await fetch(`${url}/rest/v1/profiles`, {
    body: JSON.stringify(body),
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    method: "POST",
  });
  const text = await response.text();
  const data = text ? (JSON.parse(text) as AuthUserResponse) : {};

  if (!response.ok) {
    throw new Error(getSupabaseError(data, "Gagal menyimpan profil."));
  }
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse<SuccessResponse | ErrorResponse>,
) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method tidak didukung." });
  }

  const { email, fullName, password } = request.body as RegisterBody;

  if (!email || !fullName || !password) {
    return response.status(400).json({ error: "Nama, email, dan password wajib diisi." });
  }

  try {
    await checkProfilesTable();

    const accountNumber = generateAccountNumber();
    const cardNumber = generateCardNumber();
    const user = await createAuthUser({
      email,
      email_confirm: true,
      password,
      user_metadata: {
        full_name: fullName,
      },
    });

    if (!user.id) {
      throw new Error("User Supabase berhasil dibuat, tapi ID user tidak ditemukan.");
    }

    try {
      await insertProfile({
        account_number: accountNumber,
        card_number: cardNumber,
        email,
        full_name: fullName,
        id: user.id,
      });
    } catch (error) {
      await deleteAuthUser(user.id);
      throw error;
    }

    return response.status(201).json({
      accountNumber,
      cardNumber,
      email,
      fullName,
    });
  } catch (error) {
    return response.status(400).json({
      error: error instanceof Error ? error.message : "Gagal membuat akun.",
    });
  }
}
