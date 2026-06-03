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
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
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
            <div className="password-field">
              <input
                minLength={6}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Buat password"
                required
                type={isPasswordVisible ? "text" : "password"}
                value={password}
              />
              <button
                aria-label={isPasswordVisible ? "Sembunyikan password" : "Lihat password"}
                className="password-toggle"
                onClick={() => setIsPasswordVisible((current) => !current)}
                title={isPasswordVisible ? "Sembunyikan password" : "Lihat password"}
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
          <label>
            <span>Konfirmasi password</span>
            <div className="password-field">
              <input
                minLength={6}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Ulangi password"
                required
                type={isConfirmPasswordVisible ? "text" : "password"}
                value={confirmPassword}
              />
              <button
                aria-label={
                  isConfirmPasswordVisible
                    ? "Sembunyikan konfirmasi password"
                    : "Lihat konfirmasi password"
                }
                className="password-toggle"
                onClick={() => setIsConfirmPasswordVisible((current) => !current)}
                title={
                  isConfirmPasswordVisible
                    ? "Sembunyikan konfirmasi password"
                    : "Lihat konfirmasi password"
                }
                type="button"
              >
                {isConfirmPasswordVisible ? (
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
