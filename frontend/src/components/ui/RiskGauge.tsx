interface RiskGaugeProps {
  value: number; // 0-100
  label: string;
  size?: number;
}

function colorFor(value: number): string {
  if (value >= 75) return 'var(--color-critical)';
  if (value >= 50) return 'var(--color-warning)';
  return 'var(--color-safe)';
}

export default function RiskGauge({ value, label, size = 140 }: RiskGaugeProps) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = circumference - (clamped / 100) * circumference;
  const color = colorFor(clamped);

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={12}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={12}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
        <text
          x="50%"
          y="47%"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={size * 0.22}
          fontWeight={700}
          fill="var(--color-text)"
        >
          {Math.round(clamped)}
        </text>
        <text
          x="50%"
          y="64%"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={size * 0.08}
          fill="var(--color-muted)"
        >
          / 100
        </text>
      </svg>
      <p className="text-sm font-medium text-muted text-center">{label}</p>
    </div>
  );
}
