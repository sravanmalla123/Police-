import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import StaffDashboard from './pages/StaffDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import './styles.css';
import { setAuthToken } from './services/api.js';

const LOCAL_KEY = 'police-portal-auth';

function App() {
  const [auth, setAuth] = useState(() => {
    const stored = localStorage.getItem(LOCAL_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (auth) {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(auth));
      setAuthToken(auth.token);
    } else {
      localStorage.removeItem(LOCAL_KEY);
      setAuthToken(null);
    }
  }, [auth]);

  const logout = () => {
    setAuth(null);
    navigate('/');
  };

  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<LoginPage onLogin={setAuth} />} />
        <Route
          path="/staff"
          element={
            auth && auth.role !== 'admin' ? (
              <StaffDashboard auth={auth} onLogout={logout} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/admin"
          element={
            auth && auth.role === 'admin' ? (
              <AdminDashboard auth={auth} onLogout={logout} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
          <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
