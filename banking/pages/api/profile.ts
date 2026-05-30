import type { NextApiRequest, NextApiResponse } from "next";

type SupabaseUser = {
  id?: string;
  error?: string;
  error_description?: string;
  msg?: string;
};

type Profile = {
  account_number?: string;
  card_number?: string;
  email?: string;
  full_name?: string;
  id?: string;
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

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse<Profile | ErrorResponse>,
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
    const { anonKey, serviceRoleKey: key, supabaseUrl: url } = getConfig();
    const userResponse = await fetch(`${url}/auth/v1/user`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${token}`,
      },
    });
    const user = (await userResponse.json()) as SupabaseUser;

    if (!userResponse.ok || !user.id) {
      return response.status(401).json({
        error: user.error_description || user.msg || user.error || "Session login tidak valid.",
      });
    }

    const profileResponse = await fetch(
      `${url}/rest/v1/profiles?id=eq.${user.id}&select=id,full_name,email,account_number,card_number&limit=1`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
      },
    );
    const profiles = (await profileResponse.json()) as Profile[];

    if (!profileResponse.ok || !profiles[0]) {
      return response.status(404).json({ error: "Profil nasabah belum ditemukan." });
    }

    return response.status(200).json(profiles[0]);
  } catch (error) {
    return response.status(400).json({
      error: error instanceof Error ? error.message : "Gagal mengambil profil.",
    });
  }
}
