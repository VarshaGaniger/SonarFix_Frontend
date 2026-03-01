import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme/theme';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Issues from './pages/Issues';
import Login from './pages/Login';
import UploadProject from './pages/UploadProject';
import ScanStatus from './pages/ScanStatus';
import DiffViewer from './pages/DiffViewer';
import CodeViewer from './pages/CodeViewer';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// Placeholder components for routes not yet implemented
const Placeholder = ({ title }) => (
  <div style={{ padding: 20 }}>
    <h1>{title}</h1>
    <p>This feature is under development.</p>
  </div>
);

// Auth wrapper component
const RequireAuth = () => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login page but save the current location they were trying to go to
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          {/* Public Route */}
          <Route path="/" element={<Login />} />

          {/* Protected Routes */}
          <Route element={<RequireAuth />}>
            <Route element={<MainLayout />}>
             <Route path="dashboard" element={<Dashboard />} />
               <Route path="/issues/:projectKey" element={<Issues />} />
              <Route path="upload" element={<UploadProject />} />
            <Route path="scan-status/:scanId/:projectKey" element={<ScanStatus />} />
              <Route path="rules" element={<Placeholder title="Rules" />} />
              <Route path="history" element={<Placeholder title="History" />} />
             <Route path="code-viewer/:projectKey" element={<CodeViewer />} />
              <Route path="diff-viewer" element={<DiffViewer />} />
              <Route path="summary" element={<Placeholder title="Summary & Download" />} />
              <Route path="projects" element={<Placeholder title="Projects" />} />
              <Route path="remediation" element={<Placeholder title="Remediation" />} />
              <Route path="reports" element={<Placeholder title="Reports" />} />
              <Route path="security-hotspots" element={<Placeholder title="Security Hotspots" />} />
              <Route path="code-measures" element={<Placeholder title="Code Measures" />} />
              <Route path="team-access" element={<Placeholder title="Team Access" />} />
              <Route path="settings" element={<Placeholder title="Settings" />} />
            </Route>
          </Route>

          {/* Fallback route - if authenticated go to dashboard, else login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        <ToastContainer position="top-right" autoClose={3000} />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
git restore