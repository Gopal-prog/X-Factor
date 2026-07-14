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
- **Risk-Gated Approvals**: Dynamic baseline authorization based on threshold evaluations (e.g. Reject baseline updates for critical risks > 30).

### Visualization
- **Live Updates**: Real-time WebSocket integration for instantaneous risk assessments.
- **Attack Graph**: Infrastructure Visualization, Attack Path Analysis, Critical Node Highlighting.

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


- Login
  <img width="727" height="657" alt="image" src="https://github.com/user-attachments/assets/9794f21b-a8de-4322-812c-5f086a535f7a" />

- Dashboard
  <img width="1917" height="906" alt="image" src="https://github.com/user-attachments/assets/ebf37e5c-342d-48a6-bc6e-c549a4222614" />
- Projects
  <img width="1910" height="901" alt="image" src="https://github.com/user-attachments/assets/5004b34a-b54e-49ad-884a-257831f481d9" />

- Digital Twin
  <img width="1611" height="897" alt="image" src="https://github.com/user-attachments/assets/eb52e09f-8159-46ac-b7a7-b61c698b1879" />

- Risk Analysis
  <img width="1612" height="885" alt="image" src="https://github.com/user-attachments/assets/c23b494d-669f-4e08-8f04-ccbfa7145f83" />

- Recommendations
  <img width="1616" height="880" alt="image" src="https://github.com/user-attachments/assets/3a586f76-11b7-4e09-ac0d-b72736137f20" />

- Attack Graph
  <img width="1620" height="885" alt="image" src="https://github.com/user-attachments/assets/4c2830a2-2f00-48c9-82b9-32eae085bbe6" />

- Change Requests
  <img width="1602" height="895" alt="image" src="https://github.com/user-attachments/assets/027e6a79-bd39-483a-8e6e-d4b6967b66e0" />
  <img width="1600" height="885" alt="image" src="https://github.com/user-attachments/assets/4c18c97a-479b-4267-86d1-7f7f34d8849a" />


- AI Copilot
  <img width="1586" height="716" alt="image" src="https://github.com/user-attachments/assets/eb22697f-e8e1-4bc5-b94b-61d3ff5de3f0" />


       
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
