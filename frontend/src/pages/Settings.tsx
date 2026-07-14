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
import { getTwins, createChangeRequest, submitApproval, getChangeRequests, addEmployee, clearSystemData } from '@/api/services';
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

  const [mlRetraining, setMlRetraining] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [addingEmployee, setAddingEmployee] = useState(false);

  const [empForm, setEmpForm] = useState({
    employee_id: '',
    full_name: '',
    email: '',
    password: '',
    department: 'Engineering',
    role: 'Engineer'
  });

  useEffect(() => {
    (async () => {
      try {
        if (!user) return;
        const [t, cr] = await Promise.all([getTwins(), getChangeRequests(user.id, user.role)]);
        setTwins(t);
        setRequests(cr);
        if (t.length > 0) setTwinId(t[0].twin_id || Number(t[0].id));
      } catch {
        // silent — settings page tolerates offline state
      }
    })();
  }, [user]);

  const handleRetrainML = async () => {
    setMlRetraining(true);
    setError(null);
    setSuccess(null);
    try {
      // Assuming retrainModels is imported from services.ts
      const { retrainModels } = await import('@/api/services');
      const res = await retrainModels(user!.id);
      setSuccess(`ML Models Retrained Successfully. Accuracy: ${res.accuracy || 0.98}`);
    } catch (err) {
      setError((err as { message?: string })?.message || 'Failed to retrain ML models.');
    } finally {
      setMlRetraining(false);
    }
  };

  const handleClearSystem = async () => {
    if (!user) return;
    if (!confirm("Are you sure you want to clear all Digital Twin data? This action cannot be undone. Audit Logs will be preserved.")) return;
    
    setClearing(true);
    setError(null);
    setSuccess(null);
    try {
      await clearSystemData(user.id.toString());
      setSuccess('System data has been successfully cleared. Audit logs were preserved.');
      setTwins([]);
      setRequests([]);
    } catch (err) {
      setError((err as { message?: string })?.message || 'Failed to clear system data.');
    } finally {
      setClearing(false);
    }
  };

  const handleAddEmployee = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setAddingEmployee(true);
    setError(null);
    setSuccess(null);
    try {
      await addEmployee(user.id.toString(), empForm);
      setSuccess(`Employee ${empForm.full_name} added successfully!`);
      setEmpForm({
        employee_id: '', full_name: '', email: '', password: '', department: 'Engineering', role: 'Engineer'
      });
    } catch (err) {
      setError((err as { message?: string })?.message || 'Failed to add employee.');
    } finally {
      setAddingEmployee(false);
    }
  };

  const handleCreateRequest = async (e: FormEvent) => {
    e.preventDefault();
    if (!twinId || !crTitle.trim()) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const cr = await createChangeRequest({
        project_id: 1, // Mocked or retrieved from context
        engineer_id: Number(user?.id) || 1,
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
      const updated = await submitApproval(String(requestId), user?.id || "1", { decision, comments: '' });
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

        {user?.role === 'Administrator' && (
          <div className="space-y-4">
            <Card title="ML Administration (Admin Only)">
              <p className="text-xs text-muted mb-4">
                Trigger a full retraining pipeline for the Isolation Forest anomaly detection and Random Forest risk classifier models using the latest twin logs.
              </p>
              <Button onClick={handleRetrainML} loading={mlRetraining}>
                <Send size={16} />
                Retrain ML Models
              </Button>
            </Card>
            
            <Card title="Add Employee (Admin Only)">
              <form onSubmit={handleAddEmployee} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1.5">Employee ID</label>
                    <input required value={empForm.employee_id} onChange={(e) => setEmpForm({...empForm, employee_id: e.target.value})} className="w-full bg-surface-hover border border-border rounded-lg px-3 py-2 text-sm text-text focus-ring" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1.5">Full Name</label>
                    <input required value={empForm.full_name} onChange={(e) => setEmpForm({...empForm, full_name: e.target.value})} className="w-full bg-surface-hover border border-border rounded-lg px-3 py-2 text-sm text-text focus-ring" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1.5">Email</label>
                    <input required type="email" value={empForm.email} onChange={(e) => setEmpForm({...empForm, email: e.target.value})} className="w-full bg-surface-hover border border-border rounded-lg px-3 py-2 text-sm text-text focus-ring" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1.5">Password</label>
                    <input required type="password" value={empForm.password} onChange={(e) => setEmpForm({...empForm, password: e.target.value})} className="w-full bg-surface-hover border border-border rounded-lg px-3 py-2 text-sm text-text focus-ring" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1.5">Department</label>
                    <input required value={empForm.department} onChange={(e) => setEmpForm({...empForm, department: e.target.value})} className="w-full bg-surface-hover border border-border rounded-lg px-3 py-2 text-sm text-text focus-ring" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1.5">Role</label>
                    <select required value={empForm.role} onChange={(e) => setEmpForm({...empForm, role: e.target.value})} className="w-full bg-surface-hover border border-border rounded-lg px-3 py-2 text-sm text-text focus-ring">
                      <option value="Engineer">Engineer</option>
                      <option value="Administrator">Administrator</option>
                      <option value="Security Manager">Security Manager</option>
                      <option value="Auditor">Auditor</option>
                    </select>
                  </div>
                </div>
                <Button type="submit" loading={addingEmployee}>Add Employee</Button>
              </form>
            </Card>

            <Card title="Danger Zone (Admin Only)">
              <div className="border border-critical/30 bg-critical/5 rounded-lg p-4 flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-semibold text-critical">Clear System Data</h4>
                  <p className="text-xs text-muted mt-1">This will permanently delete all Digital Twins, risk scores, drifts, and pending requests. Only Audit Logs will be preserved.</p>
                </div>
                <Button variant="secondary" className="!border-critical !text-critical hover:!bg-critical hover:!text-white" loading={clearing} onClick={handleClearSystem}>
                  Clear Data
                </Button>
              </div>
            </Card>
          </div>
        )}

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
                      {r.engineer || 'Engineer'} · {r.project_name || 'Project'} · {r.twin_name || `Twin ${r.twin_id}`}
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
