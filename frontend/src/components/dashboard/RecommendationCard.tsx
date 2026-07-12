import { Lightbulb } from 'lucide-react';
import type { Recommendation } from '@/types';
import Badge from '../ui/Badge';

export default function RecommendationCard({ rec }: { rec: Recommendation }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4 hover:border-accent/50 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0">
            <Lightbulb size={16} />
          </div>
          <h4 className="text-sm font-semibold text-text leading-tight">{rec.title}</h4>
        </div>
        <Badge severity={rec.priority}>{rec.priority}</Badge>
      </div>
      <p className="text-sm text-muted leading-relaxed">{rec.description}</p>
      {rec.category && <p className="mt-2 text-xs text-muted uppercase tracking-wide">{rec.category}</p>}
    </div>
  );
}
