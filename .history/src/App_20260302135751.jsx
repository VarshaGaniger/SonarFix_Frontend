import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation
} from 'react-router-dom';

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
import SummaryDownload from './pages/SummaryDownload';

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* ================= AUTH WRAPPER ================= */

const RequireAuth = () => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

/* ================= PROJECT LAYOUT ================= */
/*
  This acts like Sonar's project header.
  It scopes all project-based pages.
*/

const ProjectLayout = () => {
  return <Outlet />;
};

/* ================= APP ROUTING ================= */

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>

          {/* ================= PUBLIC ROUTE ================= */}
          <Route path="/" element={<Login />} />

          {/* ================= PROTECTED ROUTES ================= */}
          <Route element={<RequireAuth />}>
            <Route element={<MainLayout />}>

              {/* ===== GLOBAL PAGES ===== */}
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="upload" element={<UploadProject />} />
              <Route path="scan-status/:scanId?" element={<ScanStatus />} />

              {/* ===== PROJECT-SCOPED ROUTES ===== */}
              <Route path="projects/:projectKey" element={<ProjectLayout />}>

                {/* Project Overview (optional later) */}
                <Route index element={<Issues />} />

                {/* Issues List */}
                <Route path="issues" element={<Issues />} />

                {/* Code Viewer (Issue Detail) */}
                <Route
                  path="issues/:projectKey"
                  element={<CodeViewer />}
                />

                {/* Diff Viewer */}
                <Route
                  path="issues/:issueKey/diff"
                  element={<DiffViewer />}
                />

                {/* Summary */}
                <Route path="summary" element={<SummaryDownload />} />

              </Route>

              {/* ===== Placeholder Routes ===== */}
              <Route path="rules" element={<div>Rules </div>} />
              <Route path="history" element={<div>History </div>} />
              <Route path="remediation" element={<div>Remediation</div>} />
              <Route path="reports" element={<div>Reports</div>} />
              <Route path="security-hotspots" element={<div>Security Hotspots</div>} />
              <Route path="code-measures" element={<div>Code Measures</div>} />
              <Route path="team-access" element={<div>Team Access</div>} />
              <Route path="settings" element={<div>Settings</div>} />

            </Route>
          </Route>

          {/* ================= FALLBACK ================= */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>

        <ToastContainer position="top-right" autoClose={3000} />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;