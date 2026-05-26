import { BankingLayout } from "@/components/banking-layout";
import { PageHeader } from "@/components/page-header";
import { transactions } from "@/lib/sample-data";

export default function ActivityPage() {
  return (
    <BankingLayout>
      <main className="page-stack">
        <PageHeader
          eyebrow="Mutasi"
          title="Aktivitas transaksi"
          description="Daftar transaksi masuk dan keluar dalam rekening."
        />

        <section className="panel">
          <div className="filter-row">
            <input type="search" placeholder="Cari aktivitas" />
            <select defaultValue="all">
              <option value="all">Semua transaksi</option>
              <option value="income">Pemasukan</option>
              <option value="expense">Pengeluaran</option>
            </select>
          </div>
          <div className="transaction-list">
            {transactions.map((item) => (
              <div className="transaction-item" key={item.id}>
                <span>{item.initial}</span>
                <div>
                  <strong>{item.title}</strong>
                  <p>
                    {item.date} - {item.category}
                  </p>
                </div>
                <b className={item.amount.startsWith("+") ? "income" : "expense"}>
                  {item.amount}
                </b>
              </div>
            ))}
          </div>
        </section>
      </main>
    </BankingLayout>
  );
}
