import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import {
  CheckCircle,
  Download,
  RefreshCw,
  Bug
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import "./SummaryDownload.css";

const SummaryDownload = () => {
  const navigate = useNavigate();
  const { projectKey } = useParams();

  const [loading, setLoading] = useState(true);

  /* -------- MOCK DATA -------- */

  const [totalIssues] = useState(28);
  const [totalFixed] = useState(21);

  const [changeLog] = useState([
    { fixType: "SQL_INJECTION", count: 6 },
    { fixType: "NULL_POINTER", count: 8 },
    { fixType: "HARDCODED_CREDENTIALS", count: 3 },
    { fixType: "CODE_SMELL", count: 4 }
  ]);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 800);
  }, []);

  const remaining = Math.max(0, totalIssues - totalFixed);
  const successRate =
    totalIssues > 0 ? Math.round((totalFixed / totalIssues) * 100) : 0;

  /* -------- BUTTON ACTIONS -------- */

  const handleDownload = () => {
    alert("Download triggered (mock download)");
  };

  const handleRescan = () => {
    alert("Rescan triggered (mock action)");
  };

  if (loading) {
    return (
      <Box className="summary-loading">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh" }}>

      {/* TITLE */}

      <div className="summary-page-title">
        <div className="title-icon">
          <CheckCircle size={20} />
        </div>

        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Refactoring Summary & Download
        </Typography>
      </div>

      {/* HERO */}

      <div className="summary-hero">

        <div className="hero-check-circle">
          <CheckCircle size={36} />
        </div>

        <h2>Refactoring Complete!</h2>

        <p>
          {totalFixed} out of {totalIssues} issues have been successfully fixed
        </p>

      </div>

      {/* STATS */}

      <div className="summary-stats-row">

        <div className="summary-stat-card green">

          <div className="stat-card-icon green-bg">
            <CheckCircle size={24} />
          </div>

          <p className="stat-value green">{totalFixed}</p>
          <p className="stat-label">Issues Fixed</p>

        </div>

        <div className="summary-stat-card orange">

          <div className="stat-card-icon orange-bg">
            <Bug size={24} />
          </div>

          <p className="stat-value orange">{remaining}</p>
          <p className="stat-label">Remaining Issues</p>

        </div>

      </div>

      {/* CHANGELOG */}

      <div className="summary-changelog">

        <h3>Detailed Change Log</h3>

        <table className="changelog-table">

          <thead>
            <tr>
              <th>#</th>
              <th>Fix Category</th>
              <th>Fixes Applied</th>
            </tr>
          </thead>

          <tbody>

            {changeLog.map((entry, idx) => (

              <tr key={idx}>

                <td>{idx + 1}</td>

                <td>{entry.fixType.replace(/_/g, " ")}</td>

                <td>
                  <span className="fix-count-badge">{entry.count}</span>
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {/* ACTION BAR */}

      <div className="summary-action-bar">

        <span className="action-bar-text">
          Ready to deploy? Download your refactored project now.
        </span>

        <div className="action-bar-buttons">

          <button className="btn-rescan" onClick={handleRescan}>
            <RefreshCw size={16} />
            Re-scan Project
          </button>

          <button className="btn-download" onClick={handleDownload}>
            <Download size={16} />
            Download Refactored Project
          </button>

        </div>

      </div>

    </Box>
  );
};

export default SummaryDownload;
