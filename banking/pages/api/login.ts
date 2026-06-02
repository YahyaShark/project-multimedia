import type { NextApiRequest, NextApiResponse } from "next";

type LoginBody = {
  password?: string;
  username?: string;
};

type AuthResponse = {
  access_token?: string;
  refresh_token?: string;
  user?: unknown;
  error?: string;
  error_description?: string;
  msg?: string;
};

type Profile = {
  email?: string;
  error?: string;
  error_description?: string;
  message?: string;
  msg?: string;
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

function normalizeUsername(identifier: string) {
  return identifier.trim().toLowerCase().replace(/[^a-z0-9_]+/g, "_").replace(/^_+|_+$/g, "");
}

function isMissingUsernameColumn(data: Profile | Profile[]) {
  if (Array.isArray(data)) {
    return false;
  }

  const message = data.error_description || data.msg || data.message || data.error || "";

  return (
    message.toLowerCase().includes("profiles.username") ||
    message.toLowerCase().includes("column username")
  );
}

async function getEmailByUsername(identifier: string) {
  const trimmedIdentifier = identifier.trim();

  if (trimmedIdentifier.includes("@")) {
    return trimmedIdentifier;
  }

  const { serviceRoleKey: key, supabaseUrl: url } = getConfig();

  const fullNameResponse = await fetch(
    `${url}/rest/v1/profiles?full_name=ilike.${encodeURIComponent(trimmedIdentifier)}&select=email&limit=1`,
    {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    },
  );
  const fullNameProfiles = (await fullNameResponse.json()) as Profile[];

  if (fullNameResponse.ok && fullNameProfiles[0]?.email) {
    return fullNameProfiles[0].email;
  }

  const normalizedUsername = normalizeUsername(trimmedIdentifier);
  const usernameResponse = await fetch(
    `${url}/rest/v1/profiles?username=eq.${encodeURIComponent(normalizedUsername)}&select=email&limit=1`,
    {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    },
  );
  const usernameData = (await usernameResponse.json()) as Profile[] | Profile;

  if (!usernameResponse.ok && isMissingUsernameColumn(usernameData)) {
    throw new Error("Username tidak ditemukan. Coba login menggunakan email atau nama lengkap.");
  }

  if (Array.isArray(usernameData) && usernameData[0]?.email) {
    return usernameData[0].email;
  }

  throw new Error("Username tidak ditemukan.");
}

async function requestLogin(email: string, password: string) {
  const { anonKey, supabaseUrl: url } = getConfig();
  const response = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    body: JSON.stringify({
      email,
      password,
    }),
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  const data = (await response.json()) as AuthResponse;

  if (!response.ok) {
    throw new Error(data.error_description || data.msg || data.error || "Login gagal.");
  }

  return data;
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse<AuthResponse>,
) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method tidak didukung." });
  }

  const { password, username } = request.body as LoginBody;

  if (!username || !password) {
    return response.status(400).json({ error: "Username dan password wajib diisi." });
  }

  try {
    const email = await getEmailByUsername(username);
    const session = await requestLogin(email, password);

    return response.status(200).json(session);
  } catch (error) {
    return response.status(400).json({
      error: error instanceof Error ? error.message : "Login gagal.",
    });
  }
}
