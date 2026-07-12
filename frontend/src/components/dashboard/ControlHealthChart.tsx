import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { ControlHealthItem } from '@/types';

function colorFor(score: number): string {
  if (score >= 80) return '#22C55E';
  if (score >= 60) return '#F97316';
  return '#EF4444';
}

export default function ControlHealthChart({ data }: { data: ControlHealthItem[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 24, left: 12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2D3B52" horizontal={false} />
        <XAxis type="number" domain={[0, 100]} stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          type="category"
          dataKey="control_name"
          stroke="#94A3B8"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          width={130}
        />
        <Tooltip
          contentStyle={{ background: '#1E293B', border: '1px solid #2D3B52', borderRadius: 8, color: '#E2E8F0' }}
          labelStyle={{ color: '#94A3B8' }}
        />
        <Bar dataKey="health_score" radius={[0, 6, 6, 0]} name="Health Score" barSize={16}>
          {data.map((entry, idx) => (
            <Cell key={idx} fill={colorFor(entry.health_score)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
