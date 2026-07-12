import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { RiskTrendPoint } from '@/types';

export default function RiskTrendChart({ data }: { data: RiskTrendPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2D3B52" />
        <XAxis dataKey="date" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
        <Tooltip
          contentStyle={{ background: '#1E293B', border: '1px solid #2D3B52', borderRadius: 8, color: '#E2E8F0' }}
          labelStyle={{ color: '#94A3B8' }}
        />
        <Line
          type="monotone"
          dataKey="risk_score"
          stroke="#3B82F6"
          strokeWidth={2.5}
          dot={{ r: 3, fill: '#3B82F6' }}
          activeDot={{ r: 5 }}
          name="Risk Score"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
