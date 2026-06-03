import Link from "next/link";
import { FormEvent } from "react";
import { useState } from "react";

type ForgotPasswordResponse = {
  error?: string;
  message?: string;
};

export default function ForgotPasswordPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsError(false);

    if (password !== confirmPassword) {
      setIsError(true);
      setMessage("Konfirmasi sandi belum sama.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/forgot-password", {
        body: JSON.stringify({
          confirmPassword,
          password,
          username,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const data = (await response.json()) as ForgotPasswordResponse;

      if (!response.ok) {
        throw new Error(data.error || "Gagal mengubah sandi.");
      }

      setMessage(data.message || "Sandi berhasil diperbarui.");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      setIsError(true);
      setMessage(error instanceof Error ? error.message : "Gagal mengubah sandi.");
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
          <Link href="/register">Buat akun</Link>
          <Link className="active" href="/forgot-password">
            Lupa sandi
          </Link>
        </nav>
        <div>
          <p className="eyebrow">Reset Sandi</p>
          <h1>Ganti sandi akun</h1>
          <p className="muted">
            Masukkan username lalu buat sandi baru untuk akun Anda.
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
            <span>Sandi baru</span>
            <div className="password-field">
              <input
                minLength={6}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Masukkan sandi baru"
                required
                type={isPasswordVisible ? "text" : "password"}
                value={password}
              />
              <button
                aria-label={isPasswordVisible ? "Sembunyikan sandi baru" : "Lihat sandi baru"}
                className="password-toggle"
                onClick={() => setIsPasswordVisible((current) => !current)}
                title={isPasswordVisible ? "Sembunyikan sandi baru" : "Lihat sandi baru"}
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
            <span>Konfirmasi sandi</span>
            <div className="password-field">
              <input
                minLength={6}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Ulangi sandi baru"
                required
                type={isConfirmPasswordVisible ? "text" : "password"}
                value={confirmPassword}
              />
              <button
                aria-label={
                  isConfirmPasswordVisible
                    ? "Sembunyikan konfirmasi sandi"
                    : "Lihat konfirmasi sandi"
                }
                className="password-toggle"
                onClick={() => setIsConfirmPasswordVisible((current) => !current)}
                title={
                  isConfirmPasswordVisible
                    ? "Sembunyikan konfirmasi sandi"
                    : "Lihat konfirmasi sandi"
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
          {message ? (
            <p className={`form-message ${isError ? "error" : ""}`}>{message}</p>
          ) : null}
          <button type="submit" className="primary-action" disabled={isLoading}>
            {isLoading ? "Memproses..." : "Simpan sandi baru"}
          </button>
          <Link className="forgot-link" href="/login">
            Kembali ke login
          </Link>
        </form>
      </section>
    </main>
  );
}
