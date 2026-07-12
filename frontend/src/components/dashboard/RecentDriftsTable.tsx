import type { RecentDrift } from '@/types';
import Badge from '../ui/Badge';

export default function RecentDriftsTable({ data }: { data: RecentDrift[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-muted py-8 text-center">No drifts detected recently.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-muted border-b border-border">
            <th className="py-2 pr-4 font-medium">Project</th>
            <th className="py-2 pr-4 font-medium">Twin</th>
            <th className="py-2 pr-4 font-medium">Drift Type</th>
            <th className="py-2 pr-4 font-medium">Severity</th>
            <th className="py-2 pr-4 font-medium">Detected</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.id} className="border-b border-border/60 hover:bg-surface-hover transition-colors">
              <td className="py-3 pr-4 text-text font-medium">{d.project_name}</td>
              <td className="py-3 pr-4 text-muted font-mono text-xs">{d.twin_id}</td>
              <td className="py-3 pr-4 text-muted">{d.drift_type}</td>
              <td className="py-3 pr-4">
                <Badge severity={d.severity}>{d.severity}</Badge>
              </td>
              <td className="py-3 pr-4 text-muted">{new Date(d.detected_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
