import { useEffect, useState } from 'react';
import { FolderKanban, GitBranch, GitPullRequestArrow, Clock, Gauge } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import StatCard from '@/components/ui/StatCard';
import Card from '@/components/ui/Card';
import Loader from '@/components/ui/Loader';
import ErrorBanner from '@/components/ui/ErrorBanner';
import RiskTrendChart from '@/components/dashboard/RiskTrendChart';
import ControlHealthChart from '@/components/dashboard/ControlHealthChart';
import RecentDriftsTable from '@/components/dashboard/RecentDriftsTable';
import RecommendationCard from '@/components/dashboard/RecommendationCard';
import {
  getDashboardSummary,
  getRiskTrend,
  getRecentDrifts,
  getControlHealth,
  getDashboardRecommendations,
} from '@/api/services';
import type {
  DashboardSummary,
  RiskTrendPoint,
  RecentDrift,
  ControlHealthItem,
  Recommendation,
} from '@/types';

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [riskTrend, setRiskTrend] = useState<RiskTrendPoint[]>([]);
  const [drifts, setDrifts] = useState<RecentDrift[]>([]);
  const [controlHealth, setControlHealth] = useState<ControlHealthItem[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    // Immediately call all dashboard endpoints in parallel on mount.
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [s, rt, rd, ch, rec] = await Promise.all([
          getDashboardSummary(),
          getRiskTrend(),
          getRecentDrifts(),
          getControlHealth(),
          getDashboardRecommendations(),
        ]);
        if (cancelled) return;
        setSummary(s);
        setRiskTrend(rt);
        setDrifts(rd);
        setControlHealth(ch);
        setRecommendations(rec);
      } catch (err) {
        if (!cancelled) setError((err as { message?: string })?.message || 'Failed to load dashboard data.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AppLayout title="Security Dashboard">
      {error && (
        <div className="mb-4">
          <ErrorBanner message={error} />
        </div>
      )}

      {loading ? (
        <Loader label="Loading dashboard..." />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard label="Total Projects" value={summary?.total_projects ?? 0} icon={FolderKanban} accent="accent" />
            <StatCard label="Digital Twins" value={summary?.digital_twins ?? 0} icon={GitBranch} accent="accent" />
            <StatCard label="Detected Drifts" value={summary?.detected_drifts ?? 0} icon={GitPullRequestArrow} accent="warning" />
            <StatCard label="Pending Requests" value={summary?.pending_requests ?? 0} icon={Clock} accent="warning" />
            <StatCard label="Average Risk" value={summary?.average_risk ?? 0} suffix="/100" icon={Gauge} accent="critical" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card title="Risk Trend (7 days)">
              <RiskTrendChart data={riskTrend} />
            </Card>
            <Card title="Control Health">
              <ControlHealthChart data={controlHealth} />
            </Card>
          </div>

          <Card title="Recent Drifts">
            <RecentDriftsTable data={drifts} />
          </Card>

          <div>
            <h3 className="text-sm font-semibold text-text tracking-wide mb-3">Recommendations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.map((rec) => (
                <RecommendationCard key={rec.id} rec={rec} />
              ))}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
