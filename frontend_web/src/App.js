import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import OwnerDashboard from './pages/OwnerDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import OwnerChat from './pages/OwnerChat';
import EmployeeSetup from './pages/EmployeeSetup';
import EmployeeLogin from './pages/EmployeeLogin';
import EmployeeProfile from './pages/EmployeeProfile';
import { AuthProvider, useAuth } from './context/AuthContext';

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/employee-setup" element={<EmployeeSetup />} />
          <Route path="/employee-login" element={<EmployeeLogin />} />
          <Route
            path="/owner"
            element={
              <PrivateRoute>
                <OwnerDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/owner/chat"
            element={
              <PrivateRoute>
                <OwnerChat />
              </PrivateRoute>
            }
          />
          <Route
            path="/employee"
            element={
              <PrivateRoute>
                <EmployeeDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/employee/profile"
            element={
              <PrivateRoute>
                <EmployeeProfile />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}
