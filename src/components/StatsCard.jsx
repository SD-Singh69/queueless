function StatsCard({ title, value, color }) {
  return (
    <div className="stats-card">
      <h3>{title}</h3>
      <h1 style={{ color }}>{value}</h1>
    </div>
  );
}

export default StatsCard;