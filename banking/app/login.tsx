import Link from "next/link";
import { useRouter } from "next/router";
import { FormEvent, useState } from "react";
import { loadUserProfile, loginAccount, saveAuthSession } from "@/lib/supabase-auth";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsLoading(true);

    try {
      const session = await loginAccount(username, password);
      saveAuthSession(session);
      if (session.access_token) {
        await loadUserProfile(session.access_token);
      }
      router.push("/dashboard");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Login gagal.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="login-shell">
      <section className="login-panel">
        <div className="brand-mark" aria-hidden="true">
          NB
        </div>
        <div>
          <p className="eyebrow">NovaBank Digital</p>
          <h1>Masuk ke akun Anda</h1>
          <p className="muted">
            Kelola transfer, saldo, dan aktivitas rekening dalam satu dashboard.
          </p>
        </div>

        <form className="form-stack" onSubmit={handleSubmit}>
          <label>
            <span>Username</span>
            <input
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Masukkan username"
              required
              type="text"
              value={username}
            />
          </label>
          <label>
            <span>Password</span>
            <div className="password-field">
              <input
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Masukkan password"
                required
                type={isPasswordVisible ? "text" : "password"}
                value={password}
              />
              <button
                aria-label={isPasswordVisible ? "Sembunyikan password" : "Lihat password"}
                title={isPasswordVisible ? "Sembunyikan password" : "Lihat password"}
                className="password-toggle"
                onClick={() => setIsPasswordVisible((current) => !current)}
                type="button"
              >
                {isPasswordVisible ? (
                  <svg aria-hidden="true" viewBox="0 0 24 24">
                    <path d="M3 3l18 18" />
                    <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                    <path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c5 0 8.7 4.1 10 8a12.7 12.7 0 0 1-2.3 3.8" />
                    <path d="M6.1 6.1A12.3 12.3 0 0 0 2 12c1.3 3.9 5 8 10 8a10.9 10.9 0 0 0 5.1-1.3" />
                  </svg>
                ) : (
                  <svg aria-hidden="true" viewBox="0 0 24 24">
                    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </label>
          {message ? <p className="form-message error">{message}</p> : null}
          <button className="primary-action" disabled={isLoading} type="submit">
            {isLoading ? "Memproses..." : "Masuk"}
          </button>
          <div className="auth-links">
            <Link href="/register">Buat akun</Link>
            <Link href="/forgot-password">Lupa sandi?</Link>
          </div>
        </form>
      </section>
    </main>
  );
}
