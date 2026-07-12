import { useEffect, useState } from 'react';
import { RefreshCcw } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import ErrorBanner from '@/components/ui/ErrorBanner';
import RecommendationCard from '@/components/dashboard/RecommendationCard';
import { getTwins, getTwinRecommendations } from '@/api/services';
import type { DigitalTwin, Recommendation } from '@/types';

export default function RecommendationsPage() {
  const [twins, setTwins] = useState<DigitalTwin[]>([]);
  const [twinId, setTwinId] = useState('');
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [loadingTwins, setLoadingTwins] = useState(true);
  const [loadingRecs, setLoadingRecs] = useState(false);
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

  const fetchRecs = async (id: string) => {
    if (!id) return;
    setLoadingRecs(true);
    setError(null);
    try {
      const data = await getTwinRecommendations(id);
      setRecs(data);
    } catch (err) {
      setError((err as { message?: string })?.message || 'Failed to generate recommendations.');
    } finally {
      setLoadingRecs(false);
    }
  };

  useEffect(() => {
    if (twinId) fetchRecs(twinId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [twinId]);

  return (
    <AppLayout title="Recommendations">
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
            <Button variant="secondary" onClick={() => fetchRecs(twinId)} loading={loadingRecs}>
              <RefreshCcw size={16} />
              Regenerate
            </Button>
          </div>
        </Card>

        {loadingRecs ? (
          <Loader label="Generating recommendations..." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recs.map((rec) => (
              <RecommendationCard key={rec.id} rec={rec} />
            ))}
            {recs.length === 0 && (
              <p className="col-span-full text-sm text-muted py-8 text-center">
                No recommendations for this twin.
              </p>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
