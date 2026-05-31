type AuthResponse = {
  access_token?: string;
  refresh_token?: string;
  user?: unknown;
  error?: string;
  error_description?: string;
  msg?: string;
};

type RegisterResponse = {
  accountNumber?: string;
  cardNumber?: string;
  email?: string;
  error?: string;
  fullName?: string;
};

type ProfileResponse = {
  account_number?: string;
  card_number?: string;
  email?: string;
  error?: string;
  full_name?: string;
  balance?: number;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function getSupabaseConfig() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Konfigurasi Supabase belum lengkap di file .env.");
  }

  return {
    anonKey: supabaseAnonKey,
    url: supabaseUrl,
  };
}

async function requestAuth(path: string, body: Record<string, unknown>) {
  const { anonKey, url } = getSupabaseConfig();
  const response = await fetch(`${url}${path}`, {
    body: JSON.stringify(body),
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  const data = (await response.json()) as AuthResponse;

  if (!response.ok) {
    throw new Error(data.error_description || data.msg || data.error || "Autentikasi gagal.");
  }

  return data;
}

export async function registerAccount(fullName: string, email: string, password: string) {
  const response = await fetch("/api/register", {
    body: JSON.stringify({
      email,
      fullName,
      password,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  const data = (await response.json()) as RegisterResponse;

  if (!response.ok) {
    throw new Error(data.error || "Gagal membuat akun.");
  }

  if (data.accountNumber) {
    localStorage.setItem("novabank_account_number", data.accountNumber);
  }

  if (data.cardNumber) {
    localStorage.setItem("novabank_card_number", data.cardNumber);
  }

  if (data.fullName) {
    localStorage.setItem("novabank_full_name", data.fullName);
  }

  return data;
}

export async function createAuthAccount(fullName: string, email: string, password: string) {
  return requestAuth("/auth/v1/signup", {
    data: {
      full_name: fullName,
    },
    email,
    password,
  });
}

export async function loginAccount(email: string, password: string) {
  return requestAuth("/auth/v1/token?grant_type=password", {
    email,
    password,
  });
}

export async function loadUserProfile(accessToken: string) {
  const response = await fetch("/api/profile", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = (await response.json()) as ProfileResponse;

  if (!response.ok) {
    throw new Error(data.error || "Gagal mengambil profil nasabah.");
  }

  if (data.account_number) {
    localStorage.setItem("novabank_account_number", data.account_number);
  }

  if (data.card_number) {
    localStorage.setItem("novabank_card_number", data.card_number);
  }

  if (data.full_name) {
    localStorage.setItem("novabank_full_name", data.full_name);
  }

  if (data.balance) {
    localStorage.setItem("novabank_balance", String(data.balance));
  }

  return data;
}

export function saveAuthSession(session: AuthResponse) {
  if (typeof window === "undefined") {
    return;
  }

  if (session.access_token) {
    localStorage.setItem("novabank_access_token", session.access_token);
  }

  if (session.refresh_token) {
    localStorage.setItem("novabank_refresh_token", session.refresh_token);
  }
}
