import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <main className="login-shell">
      <section className="login-panel">
        <div className="brand-mark" aria-hidden="true">
          NB
        </div>
        <nav className="auth-menu" aria-label="Menu autentikasi">
          <Link href="/sign-in">Sign in</Link>
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

        <form className="form-stack">
          <label>
            <span>Username</span>
            <input type="text" placeholder="Masukkan username" />
          </label>
          <label>
            <span>Sandi baru</span>
            <input type="password" placeholder="Masukkan sandi baru" />
          </label>
          <label>
            <span>Konfirmasi sandi</span>
            <input type="password" placeholder="Ulangi sandi baru" />
          </label>
          <button type="button" className="primary-action">
            Simpan sandi baru
          </button>
          <Link className="forgot-link" href="/login">
            Kembali ke login
          </Link>
        </form>
      </section>
    </main>
  );
}
