import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, LinearProgress, Grid, Card, CardContent, Button } from "@mui/material";
import { XCircle, Code, ShieldAlert, Folder } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./ScanStatus.css";

const ScanStatus = () => {
  const navigate = useNavigate();
  const { scanId } = useParams();
  const intervalRef = useRef(null);
  const redirectedRef = useRef(false);

  const [progress, setProgress] = useState(5);
  const [status, setStatus] = useState("STARTING");
  const [metrics, setMetrics] = useState({
    filesScanned: 0,
    linesOfCode: 0,
    issuesFound: 0
  });

  // 🔥 Poll backend every 2 sec
  useEffect(() => {
    if (!scanId) {
      axios.get("http://localhost:8080/api/scan/latest")
        .then(res => {
          if (res.data.scanId) {
            navigate("/scan-status/" + res.data.scanId, { replace: true });
          } else {
            setStatus("NO PREVIOUS SCANS");
            setProgress(0);
          }
        })
        .catch(err => {
          console.error("Latest scan fetch error:", err);
          setStatus("ERROR FETCHING SCANS");
          setProgress(0);
        });
      return;
    }

    intervalRef.current = setInterval(async () => {
      try {
        const res = await axios.get(
          `http://localhost:8080/api/scan/status/${scanId}`
        );
        const backendStatus = res.data.status;
        setStatus(backendStatus);

        setMetrics({
          filesScanned: res.data.filesScanned || 0,
          linesOfCode: res.data.linesOfCode || 0,
          issuesFound: res.data.issuesFound || 0
        });

        // ================= COMPLETED =================
        if (backendStatus === "COMPLETED") {
        setProgress(100);

      if (!redirectedRef.current) {
       redirectedRef.current = true;
       clearInterval(intervalRef.current);
 
    setTimeout(() => {
      navigate("/dashboard");
    }, 1000); // optional 1s delay so user sees 100%
  }
}

        // ================= FAILED =================
        else if (backendStatus === "FAILED") {
          clearInterval(intervalRef.current);
          alert("Scan Failed. Check backend logs.");
        }

        // ================= RUNNING =================
        else {
          setProgress((prev) => (prev < 95 ? prev + 3 : prev));
        }

      } catch (err) {
        console.error("Status fetch error:", err);
      }
    }, 2000);

    return () => clearInterval(intervalRef.current);
  }, [scanId, navigate]);

  const handleCancel = () => {
    clearInterval(intervalRef.current);
    navigate("/dashboard");
  };

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

      {/* Metrics */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Folder size={22} />
              <Typography>Files Scanned</Typography>
              <Typography variant="h4">{metrics.filesScanned.toLocaleString()}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Code size={22} />
              <Typography>Lines of Code</Typography>
              <Typography variant="h4">{metrics.linesOfCode.toLocaleString()}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <ShieldAlert size={22} />
              <Typography>Issues Found</Typography>
              <Typography variant="h4">{metrics.issuesFound.toLocaleString()}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Button
          variant="outlined"
          startIcon={<XCircle size={18} />}
          onClick={handleCancel}
        >
          Cancel Scan
        </Button>
      </Box>
    </Box>
  );
};

export default ScanStatus;