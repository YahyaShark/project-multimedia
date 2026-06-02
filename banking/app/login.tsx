import Link from "next/link";
import { useRouter } from "next/router";
import { FormEvent, useState } from "react";
import { loadUserProfile, loginAccount, saveAuthSession } from "@/lib/supabase-auth";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
            <input
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Masukkan password"
              required
              type="password"
              value={password}
            />
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
