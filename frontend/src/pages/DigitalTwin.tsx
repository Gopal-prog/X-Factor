import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Plus, RefreshCcw, Save, ScanSearch, RotateCcw, X } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import ErrorBanner from '@/components/ui/ErrorBanner';
import Badge from '@/components/ui/Badge';
import { getProjects, getTwins, createTwin, updateTwin, bulkUpdateTwin, detectDrift, resetTwin, getBaseline, getTwinControls } from '@/api/services';
import type { Project, DigitalTwin as DigitalTwinType, DriftDetectionResult, BaselineControl } from '@/types';

import { useAuth } from '@/context/AuthContext';

export default function DigitalTwin() {
  const { user } = useAuth();
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
  const [bulkEdits, setBulkEdits] = useState<Record<string, string>>({});
  const [updating, setUpdating] = useState(false);
  const [editingBaseline, setEditingBaseline] = useState<BaselineControl[]>([]);
  const [resettingId, setResettingId] = useState<string | null>(null);

  // Drift detection state
  const [detectingId, setDetectingId] = useState<string | null>(null);
  const [driftResult, setDriftResult] = useState<DriftDetectionResult | null>(null);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const [p, t] = await Promise.all([getProjects(user.id), getTwins()]);
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

  const openEdit = async (twin: DigitalTwinType) => {
    setEditingTwin(twin);
    setBulkEdits({});
    setEditingBaseline([]);
    try {
      const controls = await getTwinControls(twin.id);
      setEditingBaseline(controls);
      const initialEdits: Record<string, string> = {};
      controls.forEach(c => {
        initialEdits[c.control_id] = String(c.parameter_value);
      });
      setBulkEdits(initialEdits);
    } catch {
      // ignore
    }
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingTwin || !user) return;
    setUpdating(true);
    setError(null);
    setSuccess(null);
    try {
      const updates = Object.entries(bulkEdits).map(([control_id, new_value]) => ({
        control_id,
        new_value
      }));
      
      const result = await bulkUpdateTwin({
        twin_id: editingTwin.id,
        engineer_id: user.id,
        updates
      });
      
      if (result.drifts_detected > 0) {
        setSuccess(`Success! ${result.drifts_detected} drift(s) detected and a Change Request was automatically created for the Security Manager.`);
      } else {
        setSuccess("Configuration updated successfully. No drifts detected.");
      }
      
      load();
      setEditingTwin(null);
    } catch (err) {
      setError((err as { message?: string })?.message || 'Failed to update digital twin.');
    } finally {
      setUpdating(false);
    }
  };

  const handleBulkEditChange = (controlId: string, val: string) => {
    setBulkEdits(prev => ({...prev, [controlId]: val}));
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

  const handleReset = async (twinId: string) => {
    setResettingId(twinId);
    try {
      await resetTwin(twinId);
      setSuccess(`Twin ${twinId} has been securely reset to its baseline configuration.`);
      setTwins(prev => prev.map(t => t.id === twinId ? { ...t, status: 'approved' } : t));
    } catch (err) {
      setError((err as { message?: string })?.message || 'Failed to reset twin.');
    } finally {
      setResettingId(null);
    }
  };

  const closeDriftModal = () => setDriftResult(null);

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
      Twin ID: {editingTwin.id} — Name:
    </label>
    <input
      value={editingTwin.name}
      disabled
      className="w-full bg-surface-hover border border-border rounded-lg px-3 py-2 text-sm text-muted"
    />
  </div>

  <div className="max-h-80 overflow-y-auto border border-border rounded-lg">
    <table className="w-full text-sm text-left">
      <thead className="bg-surface-hover sticky top-0 border-b border-border z-10">
        <tr>
          <th className="px-3 py-2 font-medium text-muted text-xs">Domain</th>
          <th className="px-3 py-2 font-medium text-muted text-xs">Parameter</th>
          <th className="px-3 py-2 font-medium text-muted text-xs">Severity</th>
          <th className="px-3 py-2 font-medium text-muted text-xs">Value</th>
        </tr>
      </thead>
      <tbody>
        {editingBaseline.length === 0 ? (
          <tr><td colSpan={4} className="p-4 text-center text-muted">Loading parameters...</td></tr>
        ) : (
          editingBaseline.map(b => (
            <tr key={b.control_id} className="border-b border-border/50 hover:bg-surface-hover/30">
              <td className="px-3 py-2 text-xs">{b.domain} - {b.system_name}</td>
              <td className="px-3 py-2 text-xs font-medium">{b.parameter_name}</td>
              <td className="px-3 py-2 text-xs text-muted">{b.severity || 'Normal'}</td>
              <td className="px-3 py-2">
                <input 
                  type="text"
                  value={bulkEdits[b.control_id] ?? ''}
                  onChange={(e) => handleBulkEditChange(String(b.control_id), e.target.value)}
                  className="w-full bg-surface-hover border border-border rounded px-2 py-1 text-xs focus-ring"
                />
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>

  <div className="flex gap-2 pt-2">
    <Button type="submit" loading={updating} className="w-full justify-center">
      <Save size={16}/>
      Save All Changes
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
                            onClick={async () => {
                              try {
                                const { generateComplianceReport } = await import('@/api/services');
                                const report = await generateComplianceReport(t.id);
                                alert(`Report Generated: ${report.status}\n\nCompliance Scores:\nISO 27001: ${report.compliance?.['ISO 27001'] || 'N/A'}\nNIST: ${report.compliance?.['NIST'] || 'N/A'}\nPCI DSS: ${report.compliance?.['PCI DSS'] || 'N/A'}`);
                              } catch (e) {
                                alert('Failed to generate report.');
                              }
                            }}
                            className="!px-2.5 !py-1.5 text-xs text-accent"
                          >
                            PDF Report
                          </Button>
                          <Button
                            variant="secondary"
                            loading={resettingId === t.id}
                            onClick={() => handleReset(t.id)}
                            className="!px-2.5 !py-1.5 text-xs !text-safe !border-safe/30 hover:!bg-safe/10"
                            title="Reset to Secure Baseline"
                          >
                            <RotateCcw size={14} />
                            Reset
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm p-4">
            <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-hover/50">
                <h3 className="font-semibold text-text flex items-center gap-2">
                  <ScanSearch size={18} className="text-accent" />
                  Drift Detection Result — Twin #{driftResult.twin_id}
                </h3>
                <button onClick={closeDriftModal} className="text-muted hover:text-text p-1 rounded focus-ring">
                  <X size={18} />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div className={`p-4 rounded-lg border ${driftResult.drifts_found > 0 ? 'bg-critical/10 border-critical/30' : 'bg-safe/10 border-safe/30'}`}>
                  <p className="text-sm font-medium text-text">
                    <span className={`text-lg font-bold mr-1 ${driftResult.drifts_found > 0 ? 'text-critical' : 'text-safe'}`}>
                      {driftResult.drifts_found}
                    </span>
                    drift(s) found in configuration.
                  </p>
                  {driftResult.drifts_found === 0 && (
                    <p className="text-xs text-muted mt-1">This Digital Twin fully matches its secure baseline.</p>
                  )}
                </div>

                {driftResult.details?.length > 0 && (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {driftResult.details.map((d) => (
                      <div key={d.id} className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-surface-hover/30 text-sm">
                        <span className="font-medium text-text">{d.drift_type}</span>
                        <Badge severity={d.severity}>{d.severity}</Badge>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="pt-2 flex justify-end">
                  {driftResult.drifts_found > 0 ? (
                    <Button onClick={() => { closeDriftModal(); handleReset(driftResult.twin_id); }} className="!bg-safe hover:!bg-safe/90 text-white">
                      <RotateCcw size={16} />
                      Reset to Baseline
                    </Button>
                  ) : (
                    <Button variant="secondary" onClick={closeDriftModal}>Close</Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
