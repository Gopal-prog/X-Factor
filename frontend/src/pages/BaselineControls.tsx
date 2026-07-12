import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Card from '@/components/ui/Card';
import Loader from '@/components/ui/Loader';
import ErrorBanner from '@/components/ui/ErrorBanner';
import Badge from '@/components/ui/Badge';
import { getProjects, getBaseline } from '@/api/services';
import type { Project, BaselineControl } from '@/types';

export default function BaselineControls() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState<string>('');
  const [baseline, setBaseline] = useState<BaselineControl[]>([]);
  const [loading, setLoading] = useState(true);
  const [baselineLoading, setBaselineLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await getProjects();
        if (cancelled) return;
        setProjects(data);
        if (data.length > 0) setProjectId(data[0].id);
      } catch (err) {
        if (!cancelled) setError((err as { message?: string })?.message || 'Failed to load projects.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;
    (async () => {
      setBaselineLoading(true);
      try {
        const data = await getBaseline(projectId);
        if (!cancelled) setBaseline(data);
      } catch {
        if (!cancelled) setBaseline([]);
      } finally {
        if (!cancelled) setBaselineLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const compliantCount = baseline.filter((b) => b.status === 'compliant').length;

  return (
    <AppLayout title="Baseline Controls">
      <div className="space-y-4">
        {error && <ErrorBanner message={error} />}

        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <label htmlFor="project-select" className="text-sm text-muted">
                Project
              </label>
              {loading ? (
                <span className="text-sm text-muted">Loading...</span>
              ) : (
                <select
                  id="project-select"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="bg-surface-hover border border-border rounded-lg px-3 py-2 text-sm text-text focus-ring"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            {baseline.length > 0 && (
              <span className="text-xs text-muted">
                {compliantCount} / {baseline.length} controls compliant
              </span>
            )}
          </div>
        </Card>

        <Card title="Controls">
          {baselineLoading ? (
            <Loader label="Loading baseline controls..." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-muted border-b border-border">
                    <th className="py-2 pr-4 font-medium">Control ID</th>
                    <th className="py-2 pr-4 font-medium">Name</th>
                    <th className="py-2 pr-4 font-medium">Category</th>
                    <th className="py-2 pr-4 font-medium">Status</th>
                    <th className="py-2 pr-4 font-medium">Last Checked</th>
                  </tr>
                </thead>
                <tbody>
                  {baseline.map((b) => (
                    <tr key={b.id} className="border-b border-border/60 hover:bg-surface-hover transition-colors">
                      <td className="py-3 pr-4 font-mono text-xs text-muted">{b.control_id}</td>
                      <td className="py-3 pr-4 text-text font-medium">{b.name}</td>
                      <td className="py-3 pr-4 text-muted">{b.category}</td>
                      <td className="py-3 pr-4">
                        <Badge severity={b.status}>{b.status}</Badge>
                      </td>
                      <td className="py-3 pr-4 text-muted">{b.last_checked ?? '—'}</td>
                    </tr>
                  ))}
                  {baseline.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted">
                        No baseline controls found for this project.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}
