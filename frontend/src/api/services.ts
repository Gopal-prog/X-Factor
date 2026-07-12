import apiClient from './axios';
import type {
  LoginPayload,
  LoginResponse,
  DashboardSummary,
  RiskTrendPoint,
  RecentDrift,
  ControlHealthItem,
  Recommendation,
  Project,
  BaselineControl,
  DigitalTwin,
  TwinCreatePayload,
  TwinUpdatePayload,
  DriftDetectionResult,
  RiskAssessment,
  ChangeRequestPayload,
  ChangeRequest,
  ApprovalPayload,
  AttackGraphResponse,
  CopilotChatPayload,
  CopilotChatResponse,
} from '@/types';
import * as mock from '@/mocks/mockData';

// USE_MOCKS controls whether a failed backend call falls back to mock data
// so the UI keeps rendering while the FastAPI backend is offline. Every
// function below always attempts the real API call first.
const USE_MOCKS = false;

async function withFallback<T>(call: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await call();
  } catch (err) {
    if (USE_MOCKS) {
      console.warn('[API] Falling back to mock data:', err);
      return fallback;
    }
    throw err;
  }
}

// ---------- Auth ----------
export const login = (
  payload: LoginPayload
): Promise<LoginResponse> =>

  apiClient.post("/auth/login", {

    employee_id: payload.username,

    password: payload.password

  }).then((r) => r.data);

// ---------- Dashboard ----------
export const getDashboardSummary = async (): Promise<DashboardSummary> => {

  const { data } = await apiClient.get("/dashboard/summary");

  return {

    total_projects: data["Projects"],

    digital_twins: data["Digital Twins"],

    detected_drifts: data["Detected Drifts"],

    pending_requests: data["Pending Requests"],

    average_risk: data["Average Risk"]

  };

};

export const getRiskTrend = async (): Promise<RiskTrendPoint[]> => {

  const { data } = await apiClient.get("/dashboard/risk-trend");

  return data.map((item: any) => ({

    date: item["Time"],

    risk_score: item["Risk Score"]

  }));

};

export const getRecentDrifts = async (): Promise<RecentDrift[]> => {

  const { data } = await apiClient.get("/dashboard/recent-drifts");

  return data.map((item: any) => ({

    id: String(item["Drift ID"]),

    project_name: "SecureTwin",

    twin_id: String(item["Twin ID"]),

    drift_type: item["Type"],

    severity: item["Severity"].toLowerCase(),

    detected_at: item["Detected At"]

  }));

};

export const getControlHealth = async (): Promise<ControlHealthItem[]> => {

  const { data } = await apiClient.get("/dashboard/control-health");

  return data.map((item: any) => ({

    control_name: item["Domain"],

    health_score: item["Controls"]

  }));

};

export const getDashboardRecommendations = async (): Promise<Recommendation[]> => {

  const { data } = await apiClient.get("/dashboard/recommendations");

  return data.map((item: any) => ({

    id: String(item["Recommendation ID"]),

    title: `Twin ${item["Twin ID"]}`,

    description: item["Recommendation"],

    priority: "high",

    created_at: ""

  }));

};

// ---------- Projects ----------
export const getProjects = async (): Promise<Project[]> => {

  const { data } = await apiClient.get("/projects");

  return data.map((item: any) => ({

    id: String(item.project_id),

    name: item.project_name,

    description: item.description,

    environment: item.environment,

    owner: item.application_name,

    status: "Active",

    created_at: "-"

  }));

};

export const getBaseline = async (
  projectId: string
): Promise<BaselineControl[]> => {

  const { data } = await apiClient.get(`/baseline/${projectId}`);

  return data.map((item: any) => ({

    id: String(item.control_id),

    control_id: String(item.control_id),

    name: item.control_name,

    category: item.domain,

    status: "compliant",

    last_checked: "-"

  }));

};

// ---------- Digital Twin ----------
export const createTwin = async (
  payload: TwinCreatePayload
): Promise<DigitalTwin> => {

  const { data } = await apiClient.post("/twin/create", {

    project_id: Number(payload.project_id),

    engineer_id: 1

  });

  return {

    id: String(data.twin_id),

    project_id: payload.project_id,

    name: payload.name,

    status: "running",

    created_at: new Date().toISOString(),

    updated_at: new Date().toISOString()

  };

};
export const updateTwin = async (payload: any): Promise<DigitalTwin> => {

  await apiClient.put("/twin/update", {

    twin_id: Number(payload.id),

    control_id: Number(payload.control_id),

    new_value: payload.new_value

  });

  return {

    id: payload.id,

    project_id: "",

    name: "",

    status: "running",

    created_at: "",

    updated_at: new Date().toISOString()

  };

};


export const detectDrift = async (
  twinId: string
): Promise<DriftDetectionResult> => {

  const { data } = await apiClient.post(
    `/twin/detect-drift/${twinId}`
  );

  return {

    twin_id: twinId,

    drifts_found: data.total_drifts,

    details: data.drifts.map((d: any, index: number) => ({

      id: String(index + 1),

      project_name: "",

      twin_id: twinId,

      drift_type: d.parameter,

      severity: d.severity.toLowerCase(),

      detected_at: ""

    }))

  };

};

export const getTwins = async (): Promise<DigitalTwin[]> => {

  const { data } = await apiClient.get("/twin");

  return data.map((item: any) => ({

    id: String(item.id),

    project_id: String(item.project_id),

    name: item.name,

    status: item.status.toLowerCase(),

    created_at: item.created_at,

    updated_at: item.created_at

  }));

};



// ---------- Risk ----------
export const getRiskAssessment = async (
  twinId: string
): Promise<RiskAssessment> => {

  const { data } = await apiClient.post(`/risk/${twinId}`);

  return {

    twin_id: String(data["Twin ID"]),

    overall_risk: data["Risk Score"],

    business_criticality: data["Business Criticality"],

    compliance_score: data["Compliance Score"],

    anomaly_score: data["Anomaly Score"]

  };

};



// ---------- Recommendations ----------
export const getTwinRecommendations = async (
  twinId: string
): Promise<Recommendation[]> => {

  const { data } = await apiClient.post(`/recommendation/${twinId}`);

  return [

    {

      id: twinId,

      title: "AI Security Recommendation",

      description: data["Recommendation"],

      priority: "high",

      category: `Predicted Risk : ${data["Predicted Risk"]}`,

      created_at: ""

    }

  ];

};


// ---------- Change Requests / Approvals ----------

export const getChangeRequests = async (
  userId: string,
  role: string
): Promise<any[]> => {

  const { data } = await apiClient.get("/change-request/", {
    params: {
      user_id: Number(userId),
      role: role
    }
  });

  return data;
};


export const createChangeRequest = async (
  payload: any
): Promise<any> => {

  const { data } = await apiClient.post(
    "/change-request/",
    null,
    {
      params: {

        project_id: Number(payload.project_id),

        engineer_id: 1,

        twin_id: Number(payload.twin_id),

        reason: payload.reason,

        expected_duration: payload.expected_duration,

        ticket_number: payload.ticket_number,

        maintenance_window: payload.maintenance_window,

      },
    }
  );

  return data;
};


export const submitApproval = async (

  requestId: string,

  payload: ApprovalPayload

) => {

  const { data } = await apiClient.post(

    `/approval/${requestId}`,

    null,

    {

      params: {

        manager_id: 2,

        decision: payload.decision,

        comments: "Approved from SecureTwin"

      }

    }

  );

  return data;

};

// ---------- Attack Graph ----------
export const getAttackGraph = async (
  twinId: string
): Promise<AttackGraphResponse> => {

  const { data } = await apiClient.get(`/attack-graph/${twinId}`);

  return {

    twin_id: twinId,

    nodes: data.nodes.map((n: any) => ({

      id: n.id,

      label: n.label,

      type: "default",

      severity: n.status.toLowerCase()

    })),

    edges: data.edges.map((e: any, index: number) => ({

      id: String(index + 1),

      source: e.source,

      target: e.target,

      label: ""

    }))

  };

};


// ---------- Copilot ----------
export const sendCopilotMessage = async (
  payload: CopilotChatPayload
): Promise<CopilotChatResponse> => {

  const { data } = await apiClient.post("/copilot/chat", {
    user_id: 1,
    twin_id: 5,
    question: payload.message,
  });

  return {
    reply: data.answer,
  };
};