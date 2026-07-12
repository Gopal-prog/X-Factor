import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
} from "lucide-react";

import AppLayout from "@/components/layout/AppLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Loader from "@/components/ui/Loader";
import ErrorBanner from "@/components/ui/ErrorBanner";

import {
  getProjects,
  getTwins,
  createChangeRequest,
  getChangeRequests,
  submitApproval,
} from "@/api/services";

import type {
  Project,
  DigitalTwin,
  ChangeRequest,
} from "@/types";

import { useAuth } from "@/context/AuthContext";


export default function ChangeRequests() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [twins, setTwins] = useState<DigitalTwin[]>([]);
  const [requests, setRequests] = useState<ChangeRequest[]>([]);

  const [projectId, setProjectId] = useState("");
  const [twinId, setTwinId] = useState("");

  const [reason, setReason] = useState("");
  const [duration, setDuration] = useState("");
  const [ticket, setTicket] = useState("");
  const [maintenance, setMaintenance] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [decisionLoading, setDecisionLoading] =
    useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadData = async () => {

    try {

      setLoading(true);

      const [p, t, r] = await Promise.all([
      getProjects(),
      getTwins(),
      getChangeRequests(user!.id, user!.role),
    ]);

      setProjects(p);

      setTwins(t);

      setRequests(r);

      if (p.length > 0)
        setProjectId(p[0].id);

      if (t.length > 0)
        setTwinId(t[0].id);

    } catch (err) {

      setError(
        (err as { message?: string }).message ??
          "Unable to load data."
      );

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    loadData();

  }, []);

  const submitRequest = async (e: FormEvent) => {

    e.preventDefault();

    setSaving(true);

    setError(null);

    setSuccess(null);

    try {

      await createChangeRequest({

        project_id: projectId,

        twin_id: twinId,

        reason,

        expected_duration: duration,

        ticket_number: ticket,

        maintenance_window: maintenance,

      } as any);

      setReason("");

      setDuration("");

      setTicket("");

      setMaintenance(false);

      setSuccess(
        "Change Request Submitted Successfully."
      );

      await loadData();

    } catch (err) {

      setError(
        (err as { message?: string }).message ??
          "Unable to submit request."
      );

    } finally {

      setSaving(false);

    }

  };

  const approve = async (
    id: string,
    decision: "Approved" | "Rejected"
  ) => {

    try {

      setDecisionLoading(id);

      await submitApproval(id, {

        decision,

      });

      await loadData();

    } finally {

      setDecisionLoading(null);

    }

  };
    return (
    <AppLayout title="Change Management">

      <div className="space-y-6">

        {error && (
          <ErrorBanner message={error} />
        )}

        {success && (

          <div className="rounded-lg border border-green-700 bg-green-900/20 px-4 py-3 text-green-300">

            {success}

          </div>

        )}

        {loading ? (

          <Loader label="Loading Change Requests..." />

        ) : (

          <>

            <Card title="Create Change Request">

              <form
                onSubmit={submitRequest}
                className="grid grid-cols-1 md:grid-cols-2 gap-5"
              >

                <div>

                  <label className="block text-sm mb-2">

                    Project

                  </label>

                  <select

                    value={projectId}

                    onChange={(e) =>
                      setProjectId(e.target.value)
                    }

                    className="w-full rounded-lg border border-border bg-surface px-3 py-2"

                  >

                    {projects.map((p) => (

                      <option
                        key={p.id}
                        value={p.id}
                      >

                        {p.name}

                      </option>

                    ))}

                  </select>

                </div>

                <div>

                  <label className="block text-sm mb-2">

                    Digital Twin

                  </label>

                  <select

                    value={twinId}

                    onChange={(e) =>
                      setTwinId(e.target.value)
                    }

                    className="w-full rounded-lg border border-border bg-surface px-3 py-2"

                  >

                    {twins.map((t) => (

                      <option
                        key={t.id}
                        value={t.id}
                      >

                        {t.name}

                      </option>

                    ))}

                  </select>

                </div>

                <div className="md:col-span-2">

                  <label className="block text-sm mb-2">

                    Reason

                  </label>

                  <textarea

                    rows={4}

                    value={reason}

                    onChange={(e) =>
                      setReason(e.target.value)
                    }

                    className="w-full rounded-lg border border-border bg-surface px-3 py-2"

                    placeholder="Reason for requesting the change..."

                  />

                </div>

                <div>

                  <label className="block text-sm mb-2">

                    Expected Duration

                  </label>

                  <input

                    value={duration}

                    onChange={(e) =>
                      setDuration(e.target.value)
                    }

                    placeholder="2 Hours"

                    className="w-full rounded-lg border border-border bg-surface px-3 py-2"

                  />

                </div>

                <div>

                  <label className="block text-sm mb-2">

                    Ticket Number

                  </label>

                  <input

                    value={ticket}

                    onChange={(e) =>
                      setTicket(e.target.value)
                    }

                    placeholder="CR-1005"

                    className="w-full rounded-lg border border-border bg-surface px-3 py-2"

                  />

                </div>

                <div className="md:col-span-2">

                  <label className="flex items-center gap-3">

                    <input

                      type="checkbox"

                      checked={maintenance}

                      onChange={(e) =>
                        setMaintenance(e.target.checked)
                      }

                    />

                    Maintenance Window Required

                  </label>

                </div>

                <div className="md:col-span-2">

                  <Button
                    type="submit"
                    loading={saving}
                  >

                    <Send size={16} />

                    Submit Change Request

                  </Button>

                </div>

              </form>

            </Card>

            <Card title="Change Request Queue">

              <div className="space-y-4">                {requests.length === 0 ? (

                  <div className="text-center py-10 text-muted">

                    No Change Requests Found

                  </div>

                ) : (

                  requests.map((r: any) => (

                    <div
                      key={r.request_id}
                      className="rounded-xl border border-border p-5 bg-surface"
                    >

                      <div className="flex justify-between items-start">

                        <div>

                          <h3 className="text-lg font-semibold">

                            {r.ticket_number}

                          </h3>

                          <p className="text-sm text-muted mt-1">

                            {r.project_name}

                          </p>

                        </div>

                        <Badge severity={r.status.toLowerCase()}>

                          {r.status}

                        </Badge>

                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-5">

                        <div>

                          <p className="text-xs text-muted">

                            Digital Twin

                          </p>

                          <p>

                            {r.twin_name}

                          </p>

                        </div>

                        <div>

                          <p className="text-xs text-muted">

                            Engineer

                          </p>

                          <p>

                            {r.engineer}

                          </p>

                        </div>

                        <div>

                          <p className="text-xs text-muted">

                            Expected Duration

                          </p>

                          <p>

                            {r.expected_duration}

                          </p>

                        </div>

                        <div>

                          <p className="text-xs text-muted">

                            Maintenance Window

                          </p>

                          <p>

                            {r.maintenance_window
                              ? "Yes"
                              : "No"}

                          </p>

                        </div>

                      </div>

                      <div className="mt-5">

                        <p className="text-xs text-muted mb-2">

                          Reason

                        </p>

                        <div className="rounded-lg bg-surface-hover p-3">

                          {r.reason}

                        </div>

                      </div>

                      {r.status === "Pending" &&
                          (user?.role === "Security Manager" ||
                            user?.role === "Administrator") && (

                            <div className="flex gap-3 mt-5">

                              <Button
                                loading={decisionLoading === String(r.request_id)}
                                onClick={() =>
                                  approve(String(r.request_id), "Approved")
                                }
                              >
                                <CheckCircle2 size={16} />
                                Approve
                              </Button>

                              <Button
                                variant="secondary"
                                loading={decisionLoading === String(r.request_id)}
                                onClick={() =>
                                  approve(String(r.request_id), "Rejected")
                                }
                              >
                                <XCircle size={16} />
                                Reject
                              </Button>

                            </div>

                          )}

                    </div>

                  ))

                )}

              </div>

            </Card>

          </>

        )}

      </div>

    </AppLayout>

  );

}