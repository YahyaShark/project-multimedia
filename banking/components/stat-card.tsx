type StatCardProps = {
  label: string;
  value: string;
  tone: "blue" | "green" | "red";
};

export function StatCard({ label, value, tone }: StatCardProps) {
  return (
    <article className={`stat-card ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
