import Link from "next/link";
import { useRouter } from "next/router";
import { FormEvent, useState } from "react";
import { registerAccount } from "@/lib/supabase-auth";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Konfirmasi password belum sama.");
      return;
    }

    setIsLoading(true);

    try {
      await registerAccount(fullName, email, password);
      setMessage("Akun berhasil dibuat. Silakan login.");
      setTimeout(() => router.push("/login"), 900);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal membuat akun.");
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
        <nav className="auth-menu" aria-label="Menu autentikasi">
          <Link className="active" href="/register">
            Buat akun
          </Link>
          <Link href="/forgot-password">Lupa sandi</Link>
        </nav>
        <div>
          <p className="eyebrow">Buat Akun</p>
          <h1>Daftar akun baru</h1>
          <p className="muted">
            Buat username dan sandi untuk mulai menggunakan NovaBank Digital.
          </p>
        </div>

        <form className="form-stack" onSubmit={handleSubmit}>
          <label>
            <span>Nama lengkap</span>
            <input
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Masukkan nama lengkap"
              required
              type="text"
              value={fullName}
            />
          </label>
          <label>
            <span>Email</span>
            <input
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Masukkan email"
              required
              type="email"
              value={email}
            />
          </label>
          <label>
            <span>Password</span>
            <input
              minLength={6}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Buat password"
              required
              type="password"
              value={password}
            />
          </label>
          <label>
            <span>Konfirmasi password</span>
            <input
              minLength={6}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Ulangi password"
              required
              type="password"
              value={confirmPassword}
            />
          </label>
          {message ? <p className="form-message">{message}</p> : null}
          <button className="primary-action" disabled={isLoading} type="submit">
            {isLoading ? "Memproses..." : "Buat akun"}
          </button>
          <Link className="forgot-link" href="/login">
            Sudah punya akun? Login
          </Link>
        </form>
      </section>
    </main>
  );
}
