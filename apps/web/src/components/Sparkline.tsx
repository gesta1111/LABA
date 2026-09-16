interface SparklineProps {
  values: number[];
  minC: number;
  maxC: number;
}

export function Sparkline({ values, minC, maxC }: SparklineProps) {
  const width = 640;
  const height = 160;
  if (values.length === 0) {
    return <p className="text-sm opacity-70">Недостаточно данных для графика</p>;
  }

  const pad = 8;
  const lo = Math.min(minC - 1, ...values);
  const hi = Math.max(maxC + 1, ...values);
  const span = hi - lo || 1;

  const points = values
    .map((value, index) => {
      const x = pad + (index / Math.max(values.length - 1, 1)) * (width - pad * 2);
      const y = height - pad - ((value - lo) / span) * (height - pad * 2);
      return `${x},${y}`;
    })
    .join(" ");

  const yMax = height - pad - ((maxC - lo) / span) * (height - pad * 2);
  const yMin = height - pad - ((minC - lo) / span) * (height - pad * 2);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-40 bg-base-100 rounded-box">
      <line x1="0" y1={yMax} x2={width} y2={yMax} stroke="oklch(0.7 0.15 145)" strokeDasharray="4 4" />
      <line x1="0" y1={yMin} x2={width} y2={yMin} stroke="oklch(0.7 0.15 250)" strokeDasharray="4 4" />
      <polyline fill="none" stroke="currentColor" strokeWidth="2" points={points} />
    </svg>
  );
}
