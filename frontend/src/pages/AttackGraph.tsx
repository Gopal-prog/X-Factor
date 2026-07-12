import { useEffect, useMemo, useState, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  MarkerType,
} from 'reactflow';
import type { Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import { RefreshCcw } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import ErrorBanner from '@/components/ui/ErrorBanner';
import { getTwins, getAttackGraph } from '@/api/services';
import type { DigitalTwin, AttackGraphResponse } from '@/types';

const severityColor: Record<string, string> = {

  safe: "#22C55E",

  medium: "#FACC15",

  high: "#F97316",

  critical: "#EF4444",

};
function layoutNodes(graph: AttackGraphResponse): Node[] {
  const columns = 4;
  return graph.nodes.map((n, i) => ({
    id: n.id,
    data: {

  label: (
    <div>

      <strong>{n.label}</strong>

      {("control" in n) && (
        <div style={{ fontSize: 10 }}>
          {(n as any).control}
        </div>
      )}

    </div>
  ),

},
    position: { x: (i % columns) * 220, y: Math.floor(i / columns) * 140 },
    style: {
      background: '#1E293B',
      color: '#E2E8F0',
      border: `2px solid ${severityColor[n.severity ?? 'low']}`,
      borderRadius: 10,
      padding: 10,
      fontSize: 12,
      width: 170,
    },
  }));
}

function layoutEdges(graph: AttackGraphResponse): Edge[] {
  return graph.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label,
    animated: true,
    style: { stroke: '#3B82F6' },
    labelStyle: { fill: '#94A3B8', fontSize: 11 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#3B82F6' },
  }));
}

export default function AttackGraphPage() {
  const [twins, setTwins] = useState<DigitalTwin[]>([]);
  const [twinId, setTwinId] = useState('');
  const [graph, setGraph] = useState<AttackGraphResponse | null>(null);
  const [loadingTwins, setLoadingTwins] = useState(true);
  const [loadingGraph, setLoadingGraph] = useState(false);
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

  const fetchGraph = useCallback(async (id: string) => {
    if (!id) return;
    setLoadingGraph(true);
    setError(null);
    try {
      const data = await getAttackGraph(id);
      setGraph(data);
    } catch (err) {
      setError((err as { message?: string })?.message || 'Failed to load attack graph.');
    } finally {
      setLoadingGraph(false);
    }
  }, []);

  useEffect(() => {
    if (twinId) fetchGraph(twinId);
  }, [twinId, fetchGraph]);

  const nodes = useMemo(() => (graph ? layoutNodes(graph) : []), [graph]);
  const edges = useMemo(() => (graph ? layoutEdges(graph) : []), [graph]);

  return (
    <AppLayout title="Attack Graph">
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
            <Button variant="secondary" onClick={() => fetchGraph(twinId)} loading={loadingGraph}>
              <RefreshCcw size={16} />
              Refresh Graph
            </Button>
          </div>
        </Card>

        <Card title="Attack Path Visualization" className="!p-0 overflow-hidden">
          {loadingGraph ? (
            <div className="p-6">
              <Loader label="Building attack graph..." />
            </div>
          ) : (
            <div style={{ height: 520 }}>
              <ReactFlow nodes={nodes} edges={edges} fitView proOptions={{ hideAttribution: true }}>
                <Background color="#2D3B52" gap={20} />
                <Controls />
                <MiniMap
                  nodeColor={() => '#1E293B'}
                  maskColor="rgba(15, 23, 42, 0.7)"
                  style={{ background: '#0F172A' }}
                />
              </ReactFlow>
            </div>
          )}
        </Card>

        <div className="flex flex-wrap gap-3 text-xs text-muted">
          {Object.entries(severityColor).map(([sev, color]) => (
            <span key={sev} className="flex items-center gap-1.5 capitalize">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
              {sev}
            </span>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
