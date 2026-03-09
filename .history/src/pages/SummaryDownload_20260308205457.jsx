import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import {
  CheckCircle,
  Download,
  RefreshCw,
  Bug
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import "./SummaryDownload.css";

const SummaryDownload = () => {
const navigate = useNavigate();
const { projectKey } = useParams();

const scanId = localStorage.getItem("scanId");

  const [loading, setLoading] = useState(true);

  const [totalIssues, setTotalIssues] = useState(0);
  const [totalFixed, setTotalFixed] = useState(0);
  const [changeLog, setChangeLog] = useState([]);

  useEffect(() => {

    const fetchSummary = async () => {

      try {

        const resultRes = await axios.get(
          `http://localhost:8080/api/scan/result/${projectKey}`
        );

        const reportRes = await axios.get(
          `http://localhost:8080/api/autofix/report/${projectKey}`
        );

        const result = resultRes.data;
        const report = reportRes.data;

        setTotalIssues(result.totalIssues);
        setTotalFixed(report.totalFixes);

        const changes = Object.entries(report.report).map(
          ([fixType, count]) => ({
            fixType,
            count
          })
        );

        setChangeLog(changes);

      } catch (err) {

        console.error("Failed to load summary", err);

      }

      setLoading(false);

    };

    fetchSummary();

  }, [projectKey]);

  const remaining = Math.max(0, totalIssues - totalFixed);

  const successRate =
    totalIssues > 0
      ? Math.round((totalFixed / totalIssues) * 100)
      : 0;

  /* -------- BUTTON ACTIONS -------- */

  const handleDownload = () => {

    window.open(
      `http://localhost:8080/api/autofix/download/${projectKey}`,
     
    );

  };

  const handleRescan = async () => {

    try {

      await axios.post(
        `http://localhost:8080/api/autofix/apply/${projectKey}`
      );

      navigate(`/projects/${projectKey}/issues`);

    } catch (err) {

      alert("Rescan failed");

    }

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

      <div className="summary-page-title">

        <div className="title-icon">
          <CheckCircle size={20} />
        </div>

        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Refactoring Summary & Download
        </Typography>

      </div>

      <div className="summary-hero">

        <div className="hero-check-circle">
          <CheckCircle size={36} />
        </div>

        <h2>Refactoring Complete!</h2>

        <p>
          {totalFixed} out of {totalIssues} issues have been successfully fixed
        </p>

      </div>

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

                <td>
                  {entry.fixType.replace(/_/g, " ")}
                </td>

                <td>
                  <span className="fix-count-badge">
                    {entry.count}
                  </span>
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      <div className="summary-action-bar">

        <span className="action-bar-text">
          Ready to deploy? Download your refactored project now.
        </span>

        <div className="action-bar-buttons">

          <button
            className="btn-rescan"
            onClick={handleRescan}
          >
            <RefreshCw size={16} />
            Re-scan Project
          </button>

          <button
            className="btn-download"
            onClick={handleDownload}
          >
            <Download size={16} />
            Download Refactored Project
          </button>

        </div>

      </div>

    </Box>

  );

};

export default SummaryDownload;