import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Send, CheckCircle2, XCircle } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import ErrorBanner from '@/components/ui/ErrorBanner';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL } from '@/api/axios';
import { getTwins, createChangeRequest, submitApproval, getChangeRequests } from '@/api/services';
import type { DigitalTwin, ChangeRequest } from '@/types';

export default function Settings() {
  const { user } = useAuth();
  const [twins, setTwins] = useState<DigitalTwin[]>([]);
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [twinId, setTwinId] = useState<number | null>(null);
  const [crTitle, setCrTitle] = useState('');
  const [crDescription, setCrDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [decidingId, setDecidingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [t, cr] = await Promise.all([getTwins(), getChangeRequests()]);
        setTwins(t);
        setRequests(cr);
        if (t.length > 0) setTwinId(t[0].twin_id);
      } catch {
        // silent — settings page tolerates offline state
      }
    })();
  }, []);

  const handleCreateRequest = async (e: FormEvent) => {
    e.preventDefault();
    if (!twinId || !crTitle.trim()) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const cr = await createChangeRequest({
        project_id: 1, // Mocked or retrieved from context
        engineer_id: user?.user_id || 1,
        twin_id: twinId,
        reason: `${crTitle}. ${crDescription}`,
        expected_duration: '1h',
        ticket_number: 'TKT-123',
        maintenance_window: false
      });
      setRequests((prev) => [cr, ...prev]);
      setCrTitle('');
      setCrDescription('');
      setSuccess('Change request submitted for manager approval.');
    } catch (err) {
      setError((err as { message?: string })?.message || 'Failed to submit change request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproval = async (requestId: number, decision: 'Approved' | 'Rejected') => {
    setDecidingId(requestId);
    setError(null);
    try {
      const updated = await submitApproval(String(requestId), { manager_id: user?.user_id || 1, decision, comments: '' });
      setRequests((prev) => prev.map((r) => (r.request_id === requestId ? { ...r, ...updated, status: decision } : r)));
    } catch (err) {
      setError((err as { message?: string })?.message || 'Failed to submit approval decision.');
    } finally {
      setDecidingId(null);
    }
  };

  return (
    <AppLayout title="Settings">
      <div className="space-y-4 max-w-3xl">
        {error && <ErrorBanner message={error} />}
        {success && (
          <div className="rounded-lg border border-safe/40 bg-safe/10 px-4 py-3 text-sm text-safe">{success}</div>
        )}

        <Card title="Profile">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-accent/15 text-accent flex items-center justify-center text-lg font-semibold">
              {user?.full_name?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div>
              <p className="text-sm font-medium text-text">{user?.full_name}</p>
              <p className="text-xs text-muted">{user?.department}</p>
              <p className="text-xs text-muted capitalize">{user?.role}</p>
            </div>
          </div>
        </Card>

        <Card title="API Configuration">
          <p className="text-xs text-muted mb-2">
            The backend base URL is configured via <code className="text-accent">VITE_API_BASE_URL</code> in your
            <code className="text-accent"> .env</code> file.
          </p>
          <div className="bg-surface-hover border border-border rounded-lg px-3 py-2 text-sm font-mono text-text">
            {API_BASE_URL}
          </div>
        </Card>

        <Card title="Submit a Change Request">
          <form onSubmit={handleCreateRequest} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Digital Twin</label>
              <select
                value={twinId ?? ''}
                onChange={(e) => setTwinId(Number(e.target.value))}
                className="w-full bg-surface-hover border border-border rounded-lg px-3 py-2 text-sm text-text focus-ring"
              >
                {twins.map((t) => (
                  <option key={t.twin_id} value={t.twin_id}>
                    Twin #{t.twin_id}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Reason Title</label>
              <input
                value={crTitle}
                onChange={(e) => setCrTitle(e.target.value)}
                placeholder="e.g. Rotate exposed database credentials"
                className="w-full bg-surface-hover border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-muted focus-ring"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Reason Description</label>
              <textarea
                value={crDescription}
                onChange={(e) => setCrDescription(e.target.value)}
                rows={3}
                placeholder="Describe the change being requested..."
                className="w-full bg-surface-hover border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-muted focus-ring resize-none"
              />
            </div>
            <Button type="submit" loading={submitting} disabled={!crTitle.trim() || !twinId}>
              <Send size={16} />
              Submit for Approval
            </Button>
          </form>
        </Card>

        <Card title="Manager Approval Queue">
          <div className="space-y-3">
            {requests.map((r) => (
              <div key={r.request_id} className="rounded-lg border border-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-text">{r.reason}</p>
                    <p className="text-xs text-muted mt-2">
                      Engineer {r.engineer_id} · Twin {r.twin_id}
                    </p>
                  </div>
                  <Badge severity={r.status?.toLowerCase() === 'approved' ? 'compliant' : (r.status?.toLowerCase() === 'rejected' ? 'non-compliant' : 'partial')}>{r.status}</Badge>
                </div>
                {r.status?.toLowerCase() === 'pending' && (
                  <div className="flex gap-2 mt-3">
                    <Button
                      variant="secondary"
                      className="!text-safe !border-safe/30"
                      loading={decidingId === r.request_id}
                      onClick={() => handleApproval(r.request_id, 'Approved')}
                    >
                      <CheckCircle2 size={14} />
                      Approve
                    </Button>
                    <Button
                      variant="secondary"
                      className="!text-critical !border-critical/30"
                      loading={decidingId === r.request_id}
                      onClick={() => handleApproval(r.request_id, 'Rejected')}
                    >
                      <XCircle size={14} />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
            {requests.length === 0 && (
              <p className="text-sm text-muted py-6 text-center">No change requests submitted yet.</p>
            )}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
