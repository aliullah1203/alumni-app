export default function StatItem({ icon: Icon, value, label }) {
  return (
    <div className="stat">
      <Icon className="stat__icon" size={30} strokeWidth={1.8} />
      <div>
        <div className="stat__value">{value}</div>
        <div className="stat__label">{label}</div>
      </div>
    </div>
  );
}
