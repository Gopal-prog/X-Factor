import { useEffect, useMemo, useState } from 'react';
import { Search, ChevronRight, X } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import Card from '@/components/ui/Card';
import Loader from '@/components/ui/Loader';
import ErrorBanner from '@/components/ui/ErrorBanner';
import Badge from '@/components/ui/Badge';
import { getProjects, getBaseline } from '@/api/services';
import type { Project, BaselineControl } from '@/types';

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const [selected, setSelected] = useState<Project | null>(null);
  const [baseline, setBaseline] = useState<BaselineControl[]>([]);
  const [baselineLoading, setBaselineLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getProjects();
        if (!cancelled) setProjects(data);
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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.owner?.toLowerCase().includes(q) ||
        p.environment?.toLowerCase().includes(q)
    );
  }, [projects, query]);

  const handleSelect = async (project: Project) => {
    setSelected(project);
    setBaselineLoading(true);
    try {
      const data = await getBaseline(project.id);
      setBaseline(data);
    } catch {
      setBaseline([]);
    } finally {
      setBaselineLoading(false);
    }
  };

  return (
    <AppLayout title="Projects">
      <div className="space-y-4">
        {error && <ErrorBanner message={error} />}

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search projects by name, owner, or environment..."
                className="w-full bg-surface-hover border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-text placeholder:text-muted focus-ring"
              />
            </div>
            <span className="text-xs text-muted">{filtered.length} of {projects.length} projects</span>
          </div>

          {loading ? (
            <Loader label="Loading projects..." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-muted border-b border-border">
                    <th className="py-2 pr-4 font-medium">Name</th>
                    <th className="py-2 pr-4 font-medium">Environment</th>
                    <th className="py-2 pr-4 font-medium">Owner</th>
                    <th className="py-2 pr-4 font-medium">Status</th>
                    <th className="py-2 pr-4 font-medium">Created</th>
                    <th className="py-2 pr-4 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => handleSelect(p)}
                      className="border-b border-border/60 hover:bg-surface-hover transition-colors cursor-pointer"
                    >
                      <td className="py-3 pr-4 text-text font-medium">{p.name}</td>
                      <td className="py-3 pr-4 text-muted capitalize">{p.environment ?? '—'}</td>
                      <td className="py-3 pr-4 text-muted">{p.owner ?? '—'}</td>
                      <td className="py-3 pr-4">
                        <span className="text-xs capitalize text-muted">{p.status ?? '—'}</span>
                      </td>
                      <td className="py-3 pr-4 text-muted">{p.created_at ?? '—'}</td>
                      <td className="py-3 pr-4 text-muted">
                        <ChevronRight size={16} />
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted">
                        No projects match your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {selected && (
          <Card
            title={`Baseline Controls — ${selected.name}`}
            action={
              <button
                onClick={() => setSelected(null)}
                className="text-muted hover:text-text focus-ring rounded p-1"
                aria-label="Close baseline view"
              >
                <X size={16} />
              </button>
            }
          >
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
        )}
      </div>
    </AppLayout>
  );
}
