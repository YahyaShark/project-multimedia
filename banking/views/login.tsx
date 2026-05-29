import Link from "next/link";

export default function LoginPage() {
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

        <form className="form-stack">
          <label>
            <span>Username</span>
            <input type="text" placeholder="Masukkan username" />
          </label>
          <label>
            <span>Password</span>
            <input type="password" placeholder="Masukkan password" />
          </label>
          <Link className="primary-action" href="/dashboard">
            Masuk
          </Link>
          <div className="auth-links">
            <Link href="/sign-in">Sign in</Link>
            <Link href="/forgot-password">Lupa sandi?</Link>
          </div>
        </form>
      </section>
    </main>
  );
}
