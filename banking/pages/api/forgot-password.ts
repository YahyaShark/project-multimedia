import type { NextApiRequest, NextApiResponse } from "next";

type ForgotPasswordBody = {
  confirmPassword?: string;
  password?: string;
  username?: string;
};

type ErrorData = {
  error?: string;
  error_description?: string;
  message?: string;
  msg?: string;
};

type Profile = ErrorData & {
  id?: string;
};

type ForgotPasswordResponse = {
  error?: string;
  message?: string;
  success?: boolean;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getConfig() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Konfigurasi Supabase server belum lengkap.");
  }

  return {
    serviceRoleKey,
    supabaseUrl,
  };
}

function normalizeUsername(identifier: string) {
  return identifier.trim().toLowerCase().replace(/[^a-z0-9_]+/g, "_").replace(/^_+|_+$/g, "");
}

function getErrorMessage(data: ErrorData, fallback: string) {
  return data.error_description || data.msg || data.message || data.error || fallback;
}

function isMissingUsernameColumn(data: Profile[] | Profile) {
  if (Array.isArray(data)) {
    return false;
  }

  const message = getErrorMessage(data, "");

  return (
    message.toLowerCase().includes("profiles.username") ||
    message.toLowerCase().includes("column username")
  );
}

async function getUserIdByIdentifier(identifier: string) {
  const trimmedIdentifier = identifier.trim();
  const { serviceRoleKey: key, supabaseUrl: url } = getConfig();

  const emailQuery = trimmedIdentifier.includes("@")
    ? `email=eq.${encodeURIComponent(trimmedIdentifier)}`
    : `full_name=ilike.${encodeURIComponent(trimmedIdentifier)}`;

  const profileResponse = await fetch(
    `${url}/rest/v1/profiles?${emailQuery}&select=id&limit=1`,
    {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    },
  );
  const profileData = (await profileResponse.json()) as Profile[] | Profile;

  if (profileResponse.ok && Array.isArray(profileData) && profileData[0]?.id) {
    return profileData[0].id;
  }

  if (!trimmedIdentifier.includes("@")) {
    const normalizedUsername = normalizeUsername(trimmedIdentifier);
    const usernameResponse = await fetch(
      `${url}/rest/v1/profiles?username=eq.${encodeURIComponent(normalizedUsername)}&select=id&limit=1`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
      },
    );
    const usernameData = (await usernameResponse.json()) as Profile[] | Profile;

    if (!usernameResponse.ok && isMissingUsernameColumn(usernameData)) {
      throw new Error("Username tidak ditemukan. Coba gunakan email atau nama lengkap.");
    }

    if (Array.isArray(usernameData) && usernameData[0]?.id) {
      return usernameData[0].id;
    }
  }

  throw new Error("Akun tidak ditemukan.");
}

async function updateUserPassword(userId: string, password: string) {
  const { serviceRoleKey: key, supabaseUrl: url } = getConfig();
  const response = await fetch(`${url}/auth/v1/admin/users/${userId}`, {
    body: JSON.stringify({
      password,
    }),
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    method: "PUT",
  });
  const data = (await response.json()) as ErrorData;

  if (!response.ok) {
    throw new Error(getErrorMessage(data, "Gagal mengubah sandi."));
  }
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse<ForgotPasswordResponse>,
) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method tidak didukung." });
  }

  const { confirmPassword, password, username } = request.body as ForgotPasswordBody;

  if (!username || !password || !confirmPassword) {
    return response.status(400).json({ error: "Username dan sandi baru wajib diisi." });
  }

  if (password.length < 6) {
    return response.status(400).json({ error: "Sandi baru minimal 6 karakter." });
  }

  if (password !== confirmPassword) {
    return response.status(400).json({ error: "Konfirmasi sandi belum sama." });
  }

  try {
    const userId = await getUserIdByIdentifier(username);
    await updateUserPassword(userId, password);

    return response.status(200).json({
      message: "Sandi berhasil diperbarui. Silakan login dengan sandi baru.",
      success: true,
    });
  } catch (error) {
    return response.status(400).json({
      error: error instanceof Error ? error.message : "Gagal mengubah sandi.",
    });
  }
}
