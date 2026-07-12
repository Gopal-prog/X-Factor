import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Plus, RefreshCcw, Save, ScanSearch } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import ErrorBanner from '@/components/ui/ErrorBanner';
import Badge from '@/components/ui/Badge';
import { getProjects, getTwins, createTwin, updateTwin, detectDrift } from '@/api/services';
import type { Project, DigitalTwin as DigitalTwinType, DriftDetectionResult } from '@/types';

export default function DigitalTwin() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [twins, setTwins] = useState<DigitalTwinType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Create form state
  const [newName, setNewName] = useState('');
  const [newProjectId, setNewProjectId] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [creating, setCreating] = useState(false);

  // Update form state
  const [editingTwin, setEditingTwin] = useState<DigitalTwinType | null>(null);
  const [editControl, setEditControl] = useState("1");
  const [editValue, setEditValue] = useState("FALSE");
  const [updating, setUpdating] = useState(false);

  // Drift detection state
  const [detectingId, setDetectingId] = useState<string | null>(null);
  const [driftResult, setDriftResult] = useState<DriftDetectionResult | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, t] = await Promise.all([getProjects(), getTwins()]);
      setProjects(p);
      setTwins(t);
      if (p.length > 0) setNewProjectId(p[0].id);
    } catch (err) {
      setError((err as { message?: string })?.message || 'Failed to load twins.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newProjectId) return;
    setCreating(true);
    setError(null);
    setSuccess(null);
    try {
      const twin = await createTwin({ project_id: newProjectId, name: newName, description: newDescription });
      setTwins((prev) => [twin, ...prev]);
      setNewName('');
      setNewDescription('');
      setSuccess(`Digital twin "${twin.name ?? newName}" created.`);
    } catch (err) {
      setError((err as { message?: string })?.message || 'Failed to create digital twin.');
    } finally {
      setCreating(false);
    }
  };

  const openEdit = (twin: DigitalTwinType) => {
    setEditingTwin(twin);

    // Default control
    setEditControl("1");

    // Default modified value
    setEditValue("FALSE");
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingTwin) return;
    setUpdating(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await updateTwin({id: editingTwin.id,control_id: editControl,new_value: editValue});
      setTwins((prev) => prev.map((t) => (t.id === editingTwin.id ? { ...t, ...updated } : t)));
      setSuccess("Security configuration updated successfully.");
      setEditingTwin(null);
    } catch (err) {
      setError((err as { message?: string })?.message || 'Failed to update digital twin.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDetectDrift = async (twinId: string) => {
    setDetectingId(twinId);
    setError(null);
    setDriftResult(null);
    try {
      const result = await detectDrift(twinId);
      setDriftResult(result);
    } catch (err) {
      setError((err as { message?: string })?.message || 'Drift detection failed.');
    } finally {
      setDetectingId(null);
    }
  };

  return (
    <AppLayout title="Digital Twin">
      <div className="space-y-4">
        {error && <ErrorBanner message={error} />}
        {success && (
          <div className="rounded-lg border border-safe/40 bg-safe/10 px-4 py-3 text-sm text-safe">{success}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="Create Digital Twin">
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">Project</label>
                <select
                  value={newProjectId}
                  onChange={(e) => setNewProjectId(e.target.value)}
                  className="w-full bg-surface-hover border border-border rounded-lg px-3 py-2 text-sm text-text focus-ring"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">Twin Name</label>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Payments Gateway Twin"
                  className="w-full bg-surface-hover border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-muted focus-ring"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">Description</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Optional description..."
                  rows={2}
                  className="w-full bg-surface-hover border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-muted focus-ring resize-none"
                />
              </div>
              <Button type="submit" loading={creating} disabled={!newName.trim() || !newProjectId}>
                <Plus size={16} />
                Create Twin
              </Button>
            </form>
          </Card>

          <Card title={editingTwin ? `Update — ${editingTwin.name}` : 'Update Digital Twin'}>
            {editingTwin ? (
              <form onSubmit={handleUpdate} className="space-y-3">

  <div>
    <label className="block text-xs font-medium text-muted mb-1.5">
      Twin
    </label>

    <input
      value={editingTwin.name}
      disabled
      className="w-full bg-surface-hover border border-border rounded-lg px-3 py-2 text-sm"
    />
  </div>

  <div>
    <label className="block text-xs font-medium text-muted mb-1.5">
      Security Control
    </label>

    <select
      value={editControl}
      onChange={(e)=>setEditControl(e.target.value)}
      className="w-full bg-surface-hover border border-border rounded-lg px-3 py-2 text-sm"
    >
      <option value="1">CloudTrail</option>
      <option value="2">Security Group</option>
      <option value="3">IAM MFA</option>
      <option value="4">SSH Access</option>
    </select>

  </div>

  <div>

    <label className="block text-xs font-medium text-muted mb-1.5">
      New Value
    </label>

    <select
      value={editValue}
      onChange={(e)=>setEditValue(e.target.value)}
      className="w-full bg-surface-hover border border-border rounded-lg px-3 py-2 text-sm"
    >

      <option value="TRUE">TRUE</option>

      <option value="FALSE">FALSE</option>

    </select>

  </div>

  <div className="flex gap-2">

    <Button type="submit" loading={updating}>

      <Save size={16}/>

      Update Configuration

    </Button>

    <Button
      type="button"
      variant="secondary"
      onClick={()=>setEditingTwin(null)}
    >

      Cancel

    </Button>

  </div>

</form>
            ) : (
              <p className="text-sm text-muted py-6 text-center">
                Select a Digital Twin to modify its security configuration.
              </p>
            )}
          </Card>
        </div>

        <Card
          title="Digital Twins"
          action={
            <button onClick={load} className="text-muted hover:text-text focus-ring rounded p-1" aria-label="Refresh">
              <RefreshCcw size={16} />
            </button>
          }
        >
          {loading ? (
            <Loader label="Loading digital twins..." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-muted border-b border-border">
                    <th className="py-2 pr-4 font-medium">Name</th>
                    <th className="py-2 pr-4 font-medium">Twin ID</th>
                    <th className="py-2 pr-4 font-medium">Status</th>
                    <th className="py-2 pr-4 font-medium">Updated</th>
                    <th className="py-2 pr-4 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {twins.map((t) => (
                    <tr key={t.id} className="border-b border-border/60 hover:bg-surface-hover transition-colors">
                      <td className="py-3 pr-4 text-text font-medium">{t.name}</td>
                      <td className="py-3 pr-4 font-mono text-xs text-muted">{t.id}</td>
                      <td className="py-3 pr-4">
                        <Badge severity={t.status === 'active' ? 'compliant' : 'partial'}>{t.status}</Badge>
                      </td>
                      <td className="py-3 pr-4 text-muted">{t.updated_at ?? '—'}</td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2 justify-end">
                          <Button variant="secondary" onClick={() => openEdit(t)} className="!px-2.5 !py-1.5 text-xs">
                            Edit
                          </Button>
                          <Button
                            variant="secondary"
                            loading={detectingId === t.id}
                            onClick={() => handleDetectDrift(t.id)}
                            className="!px-2.5 !py-1.5 text-xs"
                          >
                            <ScanSearch size={14} />
                            Detect Drift
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {twins.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted">
                        No digital twins yet. Create one above.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {driftResult && (
          <Card title={`Drift Detection Result — ${driftResult.twin_id}`}>
            <p className="text-sm text-text mb-3">
              <span className="font-semibold">{driftResult.drifts_found}</span> drift(s) found.
            </p>
            {driftResult.details?.length > 0 && (
              <ul className="space-y-2">
                {driftResult.details.map((d) => (
                  <li key={d.id} className="flex items-center justify-between text-sm border-b border-border/60 pb-2">
                    <span className="text-muted">{d.drift_type}</span>
                    <Badge severity={d.severity}>{d.severity}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
