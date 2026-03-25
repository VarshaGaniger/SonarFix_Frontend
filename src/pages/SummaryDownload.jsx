import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import {
  CheckCircle,
  Download,
  FileText,
  Bug
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import "./SummaryDownload.css";

const SummaryDownload = () => {

  const navigate = useNavigate();
  const { projectKey } = useParams();
const { scanId: paramScanId } = useParams();

const scanId =
  paramScanId ||
  localStorage.getItem("scanId");
  const [loading, setLoading] = useState(true);
  const [totalIssues, setTotalIssues] = useState(0);
  const [totalFixed, setTotalFixed] = useState(0);
  const [changeLog, setChangeLog] = useState([]);

  useEffect(() => {

const fetchSummary = async () => {
  try {
    const reportRes = await axios.get(
      `http://localhost:9090/api/fix/report/${scanId}`
    );
    const report = reportRes.data;

    //  Total fixes applied — use backend's totalFixes as source of truth
    const fixMap = report.report || {};
    const totalFromBackend = report.totalFixes || 0;
    const fixedFromMap = Object.values(fixMap).reduce((sum, c) => sum + c, 0);
    const effectiveFixed = Math.max(fixedFromMap, totalFromBackend);
    setTotalFixed(effectiveFixed);

    //  Use originalIssueCount (snapshotted before fixing) for accurate remaining
    if (report.originalIssueCount && report.originalIssueCount > 0) {
      setTotalIssues(report.originalIssueCount);
    } else {
      // fallback: fetch from scan result (post-fix count — less accurate)
      try {
        const resultRes = await axios.get(
          `http://localhost:9090/api/scan/result/${scanId}`
        );
        setTotalIssues(resultRes.data.totalIssues || 0);
      } catch {
        // not critical
      }
    }

    const changes = Object.entries(fixMap).map(([fixType, count]) => ({
      fixType,
      count
    }));
    setChangeLog(changes);

  } catch (err) {
    console.error("Failed to load summary", err);
  } finally {
    setLoading(false);
  }
};

    fetchSummary();

  }, [scanId]);

  const remaining = Math.max(
    0,
    totalIssues - totalFixed
  );

  /* ---------- ACTIONS ---------- */

  const handleDownload = () => {

    window.open(
      `http://localhost:9090/api/fix/download/${scanId}`
    );

  };

  const handleReport = async () => {

    try {

      const report = await axios.get(
        `http://localhost:9090/api/fix/report/${scanId}`
      );

      const diff = await axios.get(
        `http://localhost:9090/api/diff/project/${scanId}`
      );

      navigate(`/report/${scanId}`, {
        state: {
          summary: report.data,
          diffs: diff.data,
          scanId
        }
      });

    } catch (err) {

      console.error("Failed to load report", err);

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
          <CheckCircle size={20}/>
        </div>

        <Typography variant="h4"
                    sx={{ fontWeight:800 }}>
          Refactoring Summary & Download
        </Typography>

      </div>

      <div className="summary-hero">

        <div className="hero-check-circle">
          <CheckCircle size={36}/>
        </div>

        <h2>Refactoring Complete!</h2>

        

      </div>

      <div className="summary-stats-row">

        <div className="summary-stat-card green">

          <div className="stat-card-icon green-bg">
            <CheckCircle size={24}/>
          </div>

          <p className="stat-value green">
            {totalFixed}
          </p>

          <p className="stat-label">
            Issues Fixed
          </p>

        </div>

        <div className="summary-stat-card orange">

          <div className="stat-card-icon orange-bg">
            <Bug size={24}/>
          </div>

          <p className="stat-value orange">
            {remaining}
          </p>

          <p className="stat-label">
            Remaining Issues
          </p>

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

            {changeLog.map((entry,idx)=>(

              <tr key={idx}>

                <td>{idx+1}</td>

                <td>
                  {entry.fixType.replace(/_/g," ")}
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
            onClick={handleReport}
          >
            <FileText size={16}/>
            Get Report
          </button>

          <button
            className="btn-download"
            onClick={handleDownload}
          >
            <Download size={16}/>
            Download Refactored Project
          </button>

        </div>

      </div>

    </Box>

  );

};

export default SummaryDownload;