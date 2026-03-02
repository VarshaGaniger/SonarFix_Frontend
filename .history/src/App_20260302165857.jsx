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

const ProjectLayout = () => {
  return <Outlet />;
};

/* ================= APP ================= */

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>

          {/* Public */}
          <Route path="/" element={<Login />} />

          {/* Protected */}
          <Route element={<RequireAuth />}>
            <Route element={<MainLayout />}>

              {/* Global Pages */}
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="upload" element={<UploadProject />} />
              <Route path="scan-status/:scanId?" element={<ScanStatus />} />

              {/* Project Scoped Pages */}
              <Route path="projects/:projectKey" element={<ProjectLayout />}>

                {/* Default → Issues */}
                <Route index element={<Issues />} />

                <Route path="issues" element={<Issues />} />
                <Route path="code" element={<CodeViewer />} />
              <--  <Route path="diff" element={<DiffViewer />} />
                <Route path="summary" element={<SummaryDownload />} />m-->

              </Route>

            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>

        <ToastContainer position="top-right" autoClose={3000} />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;