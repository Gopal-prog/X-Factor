import { useEffect, useState } from 'react';
import { RefreshCcw } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import ErrorBanner from '@/components/ui/ErrorBanner';
import RiskGauge from '@/components/ui/RiskGauge';
import { getTwins, getRiskAssessment } from '@/api/services';
import type { DigitalTwin, RiskAssessment } from '@/types';

export default function RiskAnalysisPage() {
  const [twins, setTwins] = useState<DigitalTwin[]>([]);
  const [twinId, setTwinId] = useState('');
  const [risk, setRisk] = useState<RiskAssessment | null>(null);
  const [loadingTwins, setLoadingTwins] = useState(true);
  const [loadingRisk, setLoadingRisk] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingTwins(true);
      try {
        const data = await getTwins();
        if (cancelled) return;
        setTwins(data);
        if (data.length > 0) setTwinId(data[0].id);
      } catch (err) {
        if (!cancelled) setError((err as { message?: string })?.message || 'Failed to load digital twins.');
      } finally {
        if (!cancelled) setLoadingTwins(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const fetchRisk = async (id: string) => {
    if (!id) return;
    setLoadingRisk(true);
    setError(null);
    try {
      const data = await getRiskAssessment(id);
      setRisk(data);
    } catch (err) {
      setError((err as { message?: string })?.message || 'Failed to run risk assessment.');
    } finally {
      setLoadingRisk(false);
    }
  };

  useEffect(() => {
    if (twinId) fetchRisk(twinId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [twinId]);

  return (
    <AppLayout title="Risk Analysis">
      <div className="space-y-4">
        {error && <ErrorBanner message={error} />}

        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted">Digital Twin</label>
              {loadingTwins ? (
                <span className="text-sm text-muted">Loading...</span>
              ) : (
                <select
                  value={twinId}
                  onChange={(e) => setTwinId(e.target.value)}
                  className="bg-surface-hover border border-border rounded-lg px-3 py-2 text-sm text-text focus-ring"
                >
                  {twins.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <Button variant="secondary" onClick={() => fetchRisk(twinId)} loading={loadingRisk}>
              <RefreshCcw size={16} />
              Re-run Assessment
            </Button>
          </div>
        </Card>

        <Card title="Risk Breakdown">
          {loadingRisk || !risk ? (
            <Loader label="Running risk assessment..." />
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center py-4">
              <RiskGauge value={risk.overall_risk} label="Overall Risk" />
              <RiskGauge value={risk.business_criticality} label="Business Criticality" />
              <RiskGauge value={risk.compliance_score} label="Compliance Risk" />
              <RiskGauge value={risk.anomaly_score} label="Anomaly Score" />
              <RiskGauge value={risk.security_risk} label="Security Risk" />
              <RiskGauge value={risk.attack_surface} label="Attack Surface" />
              <RiskGauge value={risk.compound_drift} label="Compound Drift" />
              <RiskGauge value={risk.mitigation_score} label="Mitigation Score" />
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}
