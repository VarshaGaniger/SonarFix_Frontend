import React, { useRef } from "react";
import { useLocation } from "react-router-dom";
import html2pdf from "html2pdf.js";
import "./ReportPage.css";

const IGNORE_FOLDERS = ["target/", "build/", ".git/", "node_modules/"];

const shouldIgnore = (path) =>
  IGNORE_FOLDERS.some((f) => path.includes(f));

const ReportPage = () => {

  const { state } = useLocation();
  const { summary, diffs, scanId } = state;

  const reportRef = useRef();

  const downloadPDF = () => {

    html2pdf().set({
      margin: 6,
      filename: `autofix-report-${scanId}.pdf`,
      html2canvas: { scale: 3 },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "landscape"
      }
    })
    .from(reportRef.current)
    .save();

  };

  const filteredDiffs =
    diffs.filter(f => !shouldIgnore(f.relativePath));

  return (

    <div className="report-wrapper">

      <button
        className="download-btn"
        onClick={downloadPDF}
      >
        Download PDF
      </button>

      <div ref={reportRef} className="report-container">

        {/* HEADER */}

        <div className="report-header">

          <h1>AutoFix Static Analysis Report</h1>

          <div className="meta">

            <p><b>Scan ID:</b> {scanId}</p>
            <p><b>Total Fixes:</b> {summary.totalFixes}</p>
            <p><b>Files Modified:</b> {filteredDiffs.length}</p>

          </div>

        </div>

        {/* FIX SUMMARY */}

        <h2>Fix Summary</h2>

        <table className="summary-table">

          <thead>
            <tr>
              <th>Fix Category</th>
              <th>Count</th>
            </tr>
          </thead>

          <tbody>

            {Object.entries(summary.report).map(([type,count]) => (

              <tr key={type}>
                <td>{type.replaceAll("_"," ")}</td>
                <td>{count}</td>
              </tr>

            ))}

          </tbody>

        </table>

        {/* CODE DIFF */}

        <h2>Code Differences</h2>

        {filteredDiffs.map(file => (

          <div key={file.relativePath} className="file-diff">

            <h3 className="file-title">
              {file.relativePath}
            </h3>

            <div className="diff-container">

              {/* ORIGINAL */}

              <div className="diff-column">

                <div className="diff-header removed-header">
                  ORIGINAL
                </div>

                {file.lineDiffs.map((d,i)=>(
                  
                  <div
                    key={i}
                    className={`code-line ${
                      d.type==="REMOVED" || d.type==="MODIFIED"
                        ? "removed"
                        : ""
                    }`}
                  >

                    <span className="line-number">
                      {d.lineNumber}
                    </span>

                    <span className="code">
                      {d.originalLine || ""}
                    </span>

                  </div>

                ))}

              </div>

              {/* FIXED */}

              <div className="diff-column">

                <div className="diff-header added-header">
                  FIXED
                </div>

                {file.lineDiffs.map((d,i)=>(
                  
                  <div
                    key={i}
                    className={`code-line ${
                      d.type==="ADDED" || d.type==="MODIFIED"
                        ? "added"
                        : ""
                    }`}
                  >

                    <span className="line-number">
                      {d.lineNumber}
                    </span>

                    <span className="code">
                      {d.modifiedLine || ""}
                    </span>

                  </div>

                ))}

              </div>

            </div>

          </div>

        ))}

      </div>

    </div>

  );

};

export default ReportPage;