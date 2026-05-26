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
            <span>Email atau nomor rekening</span>
            <input type="text" placeholder="contoh@email.com" />
          </label>
          <label>
            <span>Password</span>
            <input type="password" placeholder="Masukkan password" />
          </label>
          <div className="form-row">
            <label className="check-row">
              <input type="checkbox" />
              <span>Ingat saya</span>
            </label>
            <a href="#">Lupa password?</a>
          </div>
          <Link className="primary-action" href="/dashboard">
            Masuk
          </Link>
        </form>
      </section>

      <aside className="login-visual">
        <div className="card-preview">
          <div className="chip" />
          <p>NovaBank Platinum</p>
          <strong>5378 2210 9034 1188</strong>
          <span>Saldo tersedia</span>
          <h2>Rp 24.850.000</h2>
        </div>
        <div className="security-note">
          <span aria-hidden="true">#</span>
          <div>
            <strong>UI demo</strong>
            <p>Tampilan ini belum terhubung ke backend atau autentikasi asli.</p>
          </div>
        </div>
      </aside>
    </main>
  );
}
