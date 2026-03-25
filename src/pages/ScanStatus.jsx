import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  LinearProgress,
  Button
} from "@mui/material";
import { XCircle } from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import "./ScanStatus.css";

const ScanStatus = () => {
  const navigate = useNavigate();

  const { scanId: paramScanId } = useParams();
  const location = useLocation();

  const query = new URLSearchParams(location.search);
  const scanType = query.get("type") || "initial";
  const projectKey = query.get("projectKey");

  const scanId = paramScanId || localStorage.getItem("scanId");

  const intervalRef = useRef(null);
  const redirectedRef = useRef(false);
  const [buildLog, setBuildLog] = useState("");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("STARTING");

 // ================= POLLING =================
useEffect(() => {
  if (!scanId) return;

  intervalRef.current = setInterval(async () => {
    try {
      const res = await axios.get(
        `http://localhost:9090/api/scan/status/${scanId}`
      );

      const backendStatus = res.data.status;
      const backendProgress = res.data.progress;

      setStatus(backendStatus);

      // ✅ Don't let progress go backwards — only move forward
      setProgress(prev => Math.max(prev, backendProgress || 0));

      // Reset progress display when a new scan cycle starts
      if (backendStatus === "QUEUED") {
        setProgress(0); // intentional reset for rescan
      }

      // ================= COMPLETED =================
 if (backendStatus === "COMPLETED") {
  if (!redirectedRef.current) {
    redirectedRef.current = true;
    clearInterval(intervalRef.current);

    if (scanType === "fix") {
      localStorage.setItem(`fixAccepted_${scanId}`, "true"); // ✅ FIXED
    }

    setTimeout(() => {
      if (scanType === "fix") {
        navigate(`/projects/${projectKey}/summary/${scanId}`);
      } else {
        navigate("/dashboard");
      }
    }, 1000);
  }
}

      // ================= FAILED =================
      if (backendStatus === "FAILED" && !redirectedRef.current) {
        redirectedRef.current = true;
        clearInterval(intervalRef.current);
        setTimeout(() => navigate("/dashboard"), 2000);
      }

    } catch (err) {
      console.error("Status fetch error:", err);
    }
  }, 2000);

  return () => clearInterval(intervalRef.current);
}, [scanId, navigate, projectKey, scanType]);
  const handleCancel = () => {
    clearInterval(intervalRef.current);
    navigate("/dashboard");
  };
useEffect(() => {
  if (!scanId) return;

  const logInterval = setInterval(async () => {
    try {
      const res = await axios.get(
        `http://localhost:9090/api/scan/build-log/${scanId}`
      );

      setBuildLog(res.data || "");
    } catch (err) {
      console.error("Log fetch error:", err);
    }
  }, 2000);

  return () => clearInterval(logInterval);
}, [scanId]);
  return (
    <Box className="scan-status-page">

      <Typography variant="h4" sx={{ fontWeight: 700 }}>
        Scan In Progress
      </Typography>

      <Typography sx={{ mb: 3 }}>
        Scan ID: <strong>{scanId}</strong>
      </Typography>

      <Typography variant="h2" sx={{ textAlign: "center", fontWeight: 800 }}>
        {progress}%
      </Typography>

      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{ height: 8, borderRadius: 5, mb: 5 }}
      />

      <Typography sx={{ textAlign: "center", mb: 3 }}>
        Status: <strong>{status}</strong>
      </Typography>

      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Button
          variant="outlined"
          startIcon={<XCircle size={18} />}
          onClick={handleCancel}
        >
          Cancel Scan
        </Button>
      </Box>
<Box className="log-container">
  <Typography variant="h6" sx={{ mb: 1 }}>
    Build Logs
  </Typography>

  <Box
    sx={{
      background: "#0f172a",
      color: "#e2e8f0",
      padding: 2,
      borderRadius: 2,
      height: 250,
      overflowY: "auto",
      fontFamily: "monospace",
      fontSize: "12px",
      whiteSpace: "pre-wrap"
    }}
  >
    {buildLog || "Waiting for logs..."}
  </Box>
</Box>
    </Box>
  );
};

export default ScanStatus;