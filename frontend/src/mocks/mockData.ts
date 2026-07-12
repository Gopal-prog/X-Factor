import type {
  DashboardSummary,
  RiskTrendPoint,
  RecentDrift,
  ControlHealthItem,
  Recommendation,
  Project,
  BaselineControl,
  DigitalTwin,
  RiskAssessment,
  AttackGraphResponse,
  ChangeRequest,
} from '@/types';

// NOTE: These mocks exist ONLY so the UI can render when the FastAPI backend
// is unreachable during frontend development. Every real API call is wired
// up and preferred; mocks are a fallback of last resort (see api/services.ts).

export const mockSummary: DashboardSummary = {
  total_projects: 12,
  digital_twins: 27,
  detected_drifts: 8,
  pending_requests: 5,
  average_risk: 62,
};

export const mockRiskTrend: RiskTrendPoint[] = [
  { date: 'Mon', risk_score: 48 },
  { date: 'Tue', risk_score: 52 },
  { date: 'Wed', risk_score: 61 },
  { date: 'Thu', risk_score: 58 },
  { date: 'Fri', risk_score: 67 },
  { date: 'Sat', risk_score: 63 },
  { date: 'Sun', risk_score: 70 },
];

export const mockRecentDrifts: RecentDrift[] = [
  { id: 'd1', project_name: 'Payments Gateway', twin_id: 't-101', drift_type: 'Config drift', severity: 'critical', detected_at: '2026-07-11T09:12:00Z' },
  { id: 'd2', project_name: 'Customer Portal', twin_id: 't-104', drift_type: 'Access policy change', severity: 'high', detected_at: '2026-07-11T06:40:00Z' },
  { id: 'd3', project_name: 'Data Lake', twin_id: 't-108', drift_type: 'Firewall rule drift', severity: 'medium', detected_at: '2026-07-10T22:05:00Z' },
  { id: 'd4', project_name: 'Auth Service', twin_id: 't-112', drift_type: 'Certificate expiry', severity: 'low', detected_at: '2026-07-10T14:22:00Z' },
];

export const mockControlHealth: ControlHealthItem[] = [
  { control_name: 'Identity & Access', health_score: 82 },
  { control_name: 'Network Security', health_score: 74 },
  { control_name: 'Data Encryption', health_score: 91 },
  { control_name: 'Patch Management', health_score: 58 },
  { control_name: 'Logging & Monitoring', health_score: 67 },
];

export const mockRecommendations: Recommendation[] = [
  { id: 'r1', title: 'Rotate exposed API keys', description: 'Three API keys in the Payments Gateway twin have not been rotated in over 90 days.', priority: 'critical', category: 'Identity' },
  { id: 'r2', title: 'Tighten inbound firewall rules', description: 'Data Lake security group allows inbound traffic from 0.0.0.0/0 on port 22.', priority: 'high', category: 'Network' },
  { id: 'r3', title: 'Enable MFA for service accounts', description: '4 service accounts in Customer Portal do not enforce multi-factor authentication.', priority: 'medium', category: 'Identity' },
];

export const mockProjects: Project[] = [
  { id: 'p-1', name: 'Payments Gateway', description: 'Core payment processing platform', environment: 'production', owner: 'Priya N.', status: 'active', created_at: '2025-11-02' },
  { id: 'p-2', name: 'Customer Portal', description: 'Customer-facing self-service portal', environment: 'production', owner: 'Marco D.', status: 'active', created_at: '2025-12-14' },
  { id: 'p-3', name: 'Data Lake', description: 'Analytics and reporting data lake', environment: 'staging', owner: 'Aiko T.', status: 'monitoring', created_at: '2026-01-20' },
  { id: 'p-4', name: 'Auth Service', description: 'Central identity and auth microservice', environment: 'production', owner: 'Sam O.', status: 'active', created_at: '2026-02-03' },
];

export const mockBaseline: Record<string, BaselineControl[]> = {
  'p-1': [
    { id: 'b1', control_id: 'CC-101', name: 'TLS 1.2+ enforced', category: 'Encryption', status: 'compliant', last_checked: '2026-07-10' },
    { id: 'b2', control_id: 'CC-102', name: 'PCI network segmentation', category: 'Network', status: 'partial', last_checked: '2026-07-09' },
    { id: 'b3', control_id: 'CC-103', name: 'Key rotation policy', category: 'Identity', status: 'non-compliant', last_checked: '2026-07-08' },
  ],
};

export const mockTwins: DigitalTwin[] = [
  { id: 't-101', project_id: 'p-1', name: 'Payments Gateway Twin', status: 'active', created_at: '2026-01-05', updated_at: '2026-07-10' },
  { id: 't-104', project_id: 'p-2', name: 'Customer Portal Twin', status: 'active', created_at: '2026-02-11', updated_at: '2026-07-09' },
];

export const mockRisk: RiskAssessment = {
  twin_id: 't-101',
  overall_risk: 68,
  business_criticality: 82,
  compliance_score: 71,
  anomaly_score: 45,
};

export const mockAttackGraph: AttackGraphResponse = {
  twin_id: 't-101',
  nodes: [
    { id: 'n1', label: 'Internet', type: 'entry', severity: 'low' },
    { id: 'n2', label: 'Load Balancer', type: 'network', severity: 'low' },
    { id: 'n3', label: 'API Gateway', type: 'service', severity: 'medium' },
    { id: 'n4', label: 'Payments Service', type: 'service', severity: 'high' },
    { id: 'n5', label: 'Customer DB', type: 'data', severity: 'critical' },
  ],
  edges: [
    { id: 'e1', source: 'n1', target: 'n2', label: 'HTTPS' },
    { id: 'e2', source: 'n2', target: 'n3', label: 'HTTPS' },
    { id: 'e3', source: 'n3', target: 'n4', label: 'internal API' },
    { id: 'e4', source: 'n4', target: 'n5', label: 'SQL' },
  ],
};

export const mockChangeRequests: ChangeRequest[] = [
  { id: 'cr-1', twin_id: 't-101', title: 'Rotate DB credentials', description: 'Rotate the exposed database credentials for the payments twin.', status: 'pending', requested_by: 'Priya N.', created_at: '2026-07-11' },
];
