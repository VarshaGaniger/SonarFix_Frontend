import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation
} from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./theme/theme";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import Issues from "./pages/Issues";
import Login from "./pages/Login";
import UploadProject from "./pages/UploadProject";
import ScanStatus from "./pages/ScanStatus";
import DiffViewer from "./pages/DiffViewer";
import CodeViewer from "./pages/CodeViewer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* ================= AUTH WRAPPER ================= */

const RequireAuth = () => {
  const isAuthenticated =
    localStorage.getItem("isAuthenticated") === "true";
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

function App() {
  const isAuthenticated =
    localStorage.getItem("isAuthenticated") === "true";

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
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/issues/:projectKey" element={<Issues />} />
              <Route path="/upload" element={<UploadProject />} />
              <Route path="/scan-status/:scanId" element={<ScanStatus />} />
              <Route path="/code-viewer/:projectKey" element={<CodeViewer />} />
              <Route path="/diff-viewer" element={<DiffViewer />} />
            </Route>
          </Route>

          {/* Smart fallback */}
          <Route
            path="*"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Routes>

        <ToastContainer position="top-right" autoClose={3000} />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;