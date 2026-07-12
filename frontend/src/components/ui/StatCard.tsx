import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: 'accent' | 'safe' | 'warning' | 'critical';
  suffix?: string;
}

const accentMap: Record<string, string> = {
  accent: 'text-accent bg-accent/10',
  safe: 'text-safe bg-safe/10',
  warning: 'text-warning bg-warning/10',
  critical: 'text-critical bg-critical/10',
};

export default function StatCard({ label, value, icon: Icon, accent = 'accent', suffix }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5 flex items-center justify-between hover:border-accent/50 transition-colors">
      <div>
        <p className="text-xs uppercase tracking-wide text-muted font-medium">{label}</p>
        <p className="mt-2 text-3xl font-bold text-text">
          {value}
          {suffix && <span className="text-base font-medium text-muted ml-1">{suffix}</span>}
        </p>
      </div>
      <div className={`h-11 w-11 rounded-lg flex items-center justify-center ${accentMap[accent]}`}>
        <Icon size={22} strokeWidth={2} />
      </div>
    </div>
  );
}
