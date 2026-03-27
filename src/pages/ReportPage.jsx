import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import html2pdf from "html2pdf.js";
import "./ReportPage.css";

const ReportPage = () => {
  const location = useLocation();
  const reportRef = useRef();

  const summary = location.state?.summary || {};
  const diffs   = location.state?.diffs   || [];
  const scanId  = location.state?.scanId  || "N/A";

  // ================= USAGE DATA =================
  const [usageData, setUsageData] = useState([]);

  useEffect(() => {
    if (!scanId || scanId === "N/A") return;

    axios
      .get("http://localhost:9090/api/refactor/final-report", {
        params: { scanId },
      })
      .then((res) => setUsageData(res.data || []))
      .catch((err) => console.error("Failed to load usage report", err));
  }, [scanId]);

  // ================= DOWNLOAD PDF =================
  const downloadPDF = () => {
    if (!reportRef.current) return;

    html2pdf()
      .set({
        margin: 10,
        filename: `autofix-report-${scanId}.pdf`,
        html2canvas: { scale: 3 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(reportRef.current)
      .save();
  };

  // ================= RENDER =================
  return (
    <div className="report-wrapper">

      <button className="download-btn" onClick={downloadPDF}>
        Download PDF
      </button>

      <div ref={reportRef} className="report-container">

        <h1>AutoFix Execution Report</h1>
        <p><b>Scan ID:</b> {scanId}</p>

        {/* ================= SUMMARY ================= */}
        <h2>Fix Summary</h2>

        <table className="summary-table">
          <thead>
            <tr>
              <th>Fix Type</th>
              <th>Count</th>
            </tr>
          </thead>
          <tbody>
            {summary?.report
              ? Object.entries(summary.report).map(([type, count]) => (
                  <tr key={type}>
                    <td>{type}</td>
                    <td>{count}</td>
                  </tr>
                ))
              : (
                <tr>
                  <td colSpan="2">No summary available</td>
                </tr>
              )}
          </tbody>
        </table>

        {/* ================= USAGE DETAILS ================= */}
        <h2>Rename Usage Details</h2>

        {usageData.length === 0 ? (
          <div className="empty-state">No rename usage data available</div>
        ) : (
          <table className="summary-table">
            <thead>
              <tr>
                <th>Old Name</th>
                <th>New Name</th>
                <th>File</th>
                <th>Line</th>
                <th>Entity</th>
                <th>Usage</th>
              </tr>
            </thead>
            <tbody>
              {usageData.map((row, i) => (
                <tr key={i}>
                  <td>{row[0]}</td>
                  <td>{row[1]}</td>
                  <td>{row[2]}</td>
                  <td>{row[3]}</td>
                  <td>{row[4]}</td>
                  <td>{row[5]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* ================= DIFFERENCES ================= */}


      </div>
    </div>
  );
};

export default ReportPage;