import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Projects from '@/pages/Projects';
import BaselineControls from '@/pages/BaselineControls';
import DigitalTwin from '@/pages/DigitalTwin';
import RiskAnalysis from '@/pages/RiskAnalysis';
import Recommendations from '@/pages/Recommendations';
import AttackGraph from '@/pages/AttackGraph';
import AICopilot from '@/pages/AICopilot';
import ChangeRequests from '@/pages/ChangeRequests';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
          <Route path="/baseline" element={<ProtectedRoute><BaselineControls /></ProtectedRoute>} />
          <Route path="/digital-twin" element={<ProtectedRoute><DigitalTwin /></ProtectedRoute>} />
          <Route path="/risk-analysis" element={<ProtectedRoute><RiskAnalysis /></ProtectedRoute>} />
          <Route path="/recommendations" element={<ProtectedRoute><Recommendations /></ProtectedRoute>} />
          <Route path="/attack-graph" element={<ProtectedRoute><AttackGraph /></ProtectedRoute>} />
          <Route path="/copilot" element={<ProtectedRoute><AICopilot /></ProtectedRoute>} />
          <Route path="/change-requests" element={<ProtectedRoute><ChangeRequests /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
