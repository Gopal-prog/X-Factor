# SecureTwin AI
> **AI-Powered Cyber Digital Twin Platform**

SecureTwin AI is an enterprise cybersecurity platform that creates Digital Twins of IT environments to continuously monitor security configurations, detect configuration drift, assess cyber risk, generate AI-powered recommendations, visualize attack paths, and manage security change approvals.

## 🚀 Features

### Authentication & Access
- **Role-Based Login**: Engineer, Security Manager, Administrator
- **Role-Based Access Control (RBAC)**

### Dashboard & Analytics
- Total Projects & Digital Twins Overview
- Detected Drifts & Pending Requests
- Average Risk & Risk Trend Analysis
- Recent Drifts & AI Recommendations

### Enterprise Project Management
- **Projects**: Enterprise Project Management and Search capabilities
- **Security Baseline Controls**

### Digital Twin Management
- Create Digital Twin
- Update Security Configuration
- Detect Configuration Drift

### Risk & Compliance
- **Risk Analysis**: Overall Risk Score, Business Criticality, Compliance Score, Anomaly Score

### AI & Automation
- **AI Recommendation**: AI-generated Security Recommendations and Predicted Risk Reduction
- **AI Security Copilot**: Security Q&A, Risk Queries, Change Request Queries, Recommendation Queries

### Workflow & Collaboration
- **Change Request Workflow**: Create Request → Manager Approval → Engineer Workflow

### Visualization
- **Attack Graph**: Infrastructure Visualization, Attack Path Analysis, Critical Node Highlighting

---

## 🛠 Technology Stack

### Frontend
- **React**, **TypeScript**, **Vite**
- **Tailwind CSS**
- **React Flow**
- **Axios**, **Lucide React**

### Backend
- **FastAPI**, **Python**
- **SQLAlchemy**, **MySQL**
- **Pydantic**

### Machine Learning
- **Scikit-Learn**
- **Isolation Forest**, **Random Forest**
- **Joblib**

---

## 🏗 Architecture & Workflow

### High-Level Architecture
```text
React Frontend
       │
Axios REST API
       │
FastAPI Backend
       │
Business Services
       │
SQLAlchemy ORM
       │
MySQL Database
       │
ML Models
```

### Application Workflow
`Engineer Login` ➔ `Create Digital Twin` ➔ `Modify Security Configuration` ➔ `Detect Drift` ➔ `Risk Analysis` ➔ `AI Recommendation` ➔ `Create Change Request` ➔ `Security Manager Approval` ➔ `Attack Graph` ➔ `AI Copilot`

---

## 🔌 API Modules

| Module | Endpoint |
|--------|----------|
| Authentication | `/auth` |
| Dashboard | `/dashboard` |
| Projects | `/projects` |
| Baseline | `/baseline` |
| Digital Twin | `/twin` |
| Risk | `/risk` |
| Recommendation | `/recommendation` |
| Attack Graph | `/attack-graph` |
| Change Request | `/change-request` |
| Approval | `/approval` |
| Copilot | `/copilot` |

---

## 🗄 Database

Main tables include:
- `Users`
- `Projects`
- `Baseline Controls`
- `Digital Twins`
- `Twin Configurations`
- `Change Requests`
- `Manager Approvals`
- `Risk History`

---

## 📸 Screenshots

*(Include screenshots for)*
- Login
- Dashboard
- Projects
- Digital Twin
- Risk Analysis
- Recommendations
- Attack Graph
- Change Requests
- AI Copilot

---

## ⚙️ Installation

### Backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
# source venv/bin/activate

pip install -r requirements.txt
uvicorn app:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 👥 Default Users

| Role | Employee ID |
|------|-------------|
| Engineer | `EMP1001` |
| Security Manager | `EMP2002` |
| Administrator | `EMP3002` |

---

## 🔮 Future Enhancements

- [ ] Kubernetes Monitoring
- [ ] Azure Integration
- [ ] AWS Security Hub
- [ ] Terraform Drift Detection
- [ ] Multi-Tenant Support
- [ ] SIEM Integration
- [ ] Real-Time Notifications
- [ ] Generative AI Security Assistant

---

## ✍️ Authors

- **Gopal R**
- **Gokul Shankar A N**

*Department of Computer Science and Engineering*  
*PSG Institute of Technology and Applied Research*