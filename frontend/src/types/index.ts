// ---------- Auth ----------
export interface LoginPayload {
  username: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
}

export interface LoginResponse {
  user_id: number;
  full_name: string;
  role: string;
  department: string;
}
// ---------- Dashboard ----------
export interface DashboardSummary {
  total_projects: number;
  digital_twins: number;
  detected_drifts: number;
  pending_requests: number;
  average_risk: number;
}

export interface RiskTrendPoint {
  date: string;
  risk_score: number;
}

export interface RecentDrift {
  id: string;
  project_name: string;
  twin_id: string;
  drift_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  detected_at: string;
}

export interface ControlHealthItem {
  control_name: string;
  health_score: number;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category?: string;
  created_at?: string;
}

// ---------- Projects ----------
export interface Project {
  id: string;
  name: string;
  description?: string;
  environment?: string;
  owner?: string;
  status?: string;
  created_at?: string;
}

export interface BaselineControl {
  id: string;
  control_id: string;
  name: string;
  category: string;
  status: 'compliant' | 'non-compliant' | 'partial';
  last_checked?: string;
}

// ---------- Digital Twin ----------
export interface DigitalTwin {
  id: string;
  project_id: string;
  name: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface TwinCreatePayload {
  project_id: string;
  name: string;
  description?: string;
}

export interface TwinUpdatePayload {
  id: string;
  name?: string;
  description?: string;
  status?: string;
}

export interface DriftDetectionResult {
  twin_id: string;
  drifts_found: number;
  details: RecentDrift[];
}

// ---------- Risk ----------
export interface RiskAssessment {
  twin_id: string;
  overall_risk: number;
  business_criticality: number;
  compliance_score: number;
  anomaly_score: number;
}

// ---------- Change Requests / Approvals ----------
export interface ChangeRequestPayload {
  twin_id: string;
  title: string;
  description: string;
  requested_by?: string;
}

export interface ChangeRequest {
  id: string;
  twin_id: string;
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_by?: string;
  created_at?: string;
}

export interface ApprovalPayload {
  decision: 'Approved' | 'Rejected';
  comment?: string;
}

// ---------- Attack Graph ----------
export interface AttackGraphNode {
  id: string;
  label: string;
  type: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export interface AttackGraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface AttackGraphResponse {
  twin_id: string;
  nodes: AttackGraphNode[];
  edges: AttackGraphEdge[];
}

// ---------- Copilot ----------
export interface CopilotMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface CopilotChatPayload {
  message: string;
  history?: CopilotMessage[];
}

export interface CopilotChatResponse {
  reply: string;
}

// ---------- Generic API ----------
export interface ApiError {
  message: string;
  status?: number;
}
