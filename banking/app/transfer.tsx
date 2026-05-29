import { BankingLayout } from "@/components/banking-layout";
import { PageHeader } from "@/components/page-header";

export default function TransferPage() {
  return (
    <BankingLayout>
      <main className="page-stack">
        <PageHeader
          eyebrow="Transaksi"
          title="Transfer dana"
          description="Form UI untuk mengirim dana ke rekening tujuan."
        />

        <section className="form-panel">
          <form className="form-grid">
            <label>
              <span>Rekening sumber</span>
              <select defaultValue="primary">
                <option value="primary">NovaBank Utama - 5378 2210 9034</option>
                <option value="savings">Tabungan Pendidikan - 7781 4309 2201</option>
              </select>
            </label>
            <label>
              <span>Bank tujuan</span>
              <select defaultValue="">
                <option value="" disabled>
                  Pilih bank tujuan
                </option>
                <option>NovaBank</option>
                <option>Bank Mandiri</option>
                <option>BCA</option>
                <option>BRI</option>
                <option>BNI</option>
              </select>
            </label>
            <label>
              <span>Nomor rekening tujuan</span>
              <input type="text" placeholder="Masukkan nomor rekening" />
            </label>
            <label>
              <span>Nama penerima</span>
              <input type="text" placeholder="Nama penerima" />
            </label>
            <label>
              <span>Nominal transfer</span>
              <input type="text" placeholder="Rp 0" />
            </label>
            <label>
              <span>Catatan</span>
              <input type="text" placeholder="Opsional" />
            </label>
            <button type="button" className="primary-action form-submit">
              Lanjutkan
            </button>
          </form>
        </section>
      </main>
    </BankingLayout>
  );
}
