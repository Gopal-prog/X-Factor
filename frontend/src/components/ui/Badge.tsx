type Severity = 'low' | 'medium' | 'high' | 'critical' | 'compliant' | 'non-compliant' | 'partial' | 'pending' | 'approved' | 'rejected';

const styles: Record<string, string> = {
  low: 'bg-safe/10 text-safe border-safe/30',
  medium: 'bg-warning/10 text-warning border-warning/30',
  high: 'bg-warning/10 text-warning border-warning/30',
  critical: 'bg-critical/10 text-critical border-critical/30',
  compliant: 'bg-safe/10 text-safe border-safe/30',
  'non-compliant': 'bg-critical/10 text-critical border-critical/30',
  partial: 'bg-warning/10 text-warning border-warning/30',
  pending: 'bg-warning/10 text-warning border-warning/30',
  approved: 'bg-safe/10 text-safe border-safe/30',
  rejected: 'bg-critical/10 text-critical border-critical/30',
};

export default function Badge({ children, severity }: { children: React.ReactNode; severity: string }) {
  const cls = styles[severity as Severity] ?? 'bg-accent/10 text-accent border-accent/30';
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${cls}`}>
      {children}
    </span>
  );
}
