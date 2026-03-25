import React, { useRef } from "react";
import { useLocation } from "react-router-dom";
import html2pdf from "html2pdf.js";
import "./ReportPage.css";

const ReportPage = () => {

  const location = useLocation();
  const reportRef = useRef();

  // ✅ SAFE EXTRACTION (your version can crash)
  const summary = location.state?.summary || {};
  const diffs = location.state?.diffs || [];
  const scanId = location.state?.scanId || "N/A";

  // ================= DOWNLOAD PDF =================
  const downloadPDF = () => {
    if (!reportRef.current) return;

    html2pdf()
      .set({
        margin: 10,
        filename: `autofix-report-${scanId}.pdf`,
        html2canvas: { scale: 3 },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait"
        }
      })
      .from(reportRef.current)
      .save();
  };

  return (
    <div className="report-wrapper">

      <button className="download-btn" onClick={downloadPDF}>
        Download PDF
      </button>

      <div ref={reportRef} className="report-container">

        <h1>AutoFix Execution Report</h1>

        <p>
          <b>Scan ID:</b> {scanId}
        </p>

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

        {/* ================= DIFFERENCES ================= */}

        <h2>Code Differences</h2>

        {diffs.length === 0 ? (
          <p>No differences available</p>
        ) : (
          diffs.map((file) => {

            // ✅ NORMALIZED (you had inconsistent handling)
            const lines = file.diffLines || file.lineDiffs || [];

            return (
              <div key={file.relativePath} className="file-diff">

                <h3>{file.relativePath}</h3>

                <div className="unified-diff">

                  {lines.length === 0 ? (
                    <p>No differences found</p>
                  ) : (
                    lines.map((d, i) => {

                      switch (d.type) {

                        case "ADDED":
                          return (
                            <div key={i} className="diff-line added">
                              <span className="symbol">+</span>
                              <span>{d.modifiedLine}</span>
                            </div>
                          );

                        case "REMOVED":
                          return (
                            <div key={i} className="diff-line removed">
                              <span className="symbol">-</span>
                              <span>{d.originalLine}</span>
                            </div>
                          );

                        case "MODIFIED":
                          return (
                            <React.Fragment key={i}>
                              <div className="diff-line removed">
                                <span className="symbol">-</span>
                                <span>{d.originalLine}</span>
                              </div>
                              <div className="diff-line added">
                                <span className="symbol">+</span>
                                <span>{d.modifiedLine}</span>
                              </div>
                            </React.Fragment>
                          );

                        default:
                          return (
                            <div key={i} className="diff-line">
                              <span>{d.originalLine}</span>
                            </div>
                          );
                      }

                    })
                  )}

                </div>
              </div>
            );
          })
        )}

      </div>
    </div>
  );
};

export default ReportPage;