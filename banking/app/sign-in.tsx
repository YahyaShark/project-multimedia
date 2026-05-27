import Link from "next/link";

export default function SignInPage() {
  return (
    <main className="login-shell">
      <section className="login-panel">
        <div className="brand-mark" aria-hidden="true">
          NB
        </div>
        <nav className="auth-menu" aria-label="Menu autentikasi">
          <Link className="active" href="/sign-in">
            Sign in
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

        <form className="form-stack">
          <label>
            <span>Nama lengkap</span>
            <input type="text" placeholder="Masukkan nama lengkap" />
          </label>
          <label>
            <span>Username</span>
            <input type="text" placeholder="Buat username" />
          </label>
          <label>
            <span>Password</span>
            <input type="password" placeholder="Buat password" />
          </label>
          <label>
            <span>Konfirmasi password</span>
            <input type="password" placeholder="Ulangi password" />
          </label>
          <button type="button" className="primary-action">
            Buat akun
          </button>
          <Link className="forgot-link" href="/login">
            Sudah punya akun? Login
          </Link>
        </form>
      </section>
    </main>
  );
}
