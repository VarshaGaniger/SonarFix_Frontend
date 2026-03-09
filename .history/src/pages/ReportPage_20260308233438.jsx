import React, { useRef } from "react";
import html2pdf from "html2pdf.js";
import { useLocation } from "react-router-dom";

import "./ReportPage.css";

const ReportPage = () => {

  const { state } = useLocation();

  const { summary, diffs, scanId } = state;

  const reportRef = useRef();

  const downloadPDF = () => {

    const element = reportRef.current;

html2pdf().set({
  margin: 5,
  filename: `autofix-report-${scanId}.pdf`,
  html2canvas: {
    scale: 3
  },
  jsPDF: {
    unit: "mm",
    format: "a4",
    orientation: "landscape"
  }
}).from(element).save();

  };

  return (

    <div className="report-wrapper">

      <button className="download-btn" onClick={downloadPDF}>
        Download PDF
      </button>

      <div ref={reportRef} className="report-container">

        <h1>AutoFix Execution Report</h1>

        <div className="report-meta">

          <p><b>Scan ID:</b> {scanId}</p>
          <p><b>Total Fixes:</b> {summary.totalFixes}</p>

        </div>

        {/* FIX SUMMARY */}

        <h2>Fix Summary</h2>

        <table className="summary-table">

          <thead>
            <tr>
              <th>Fix Type</th>
              <th>Count</th>
            </tr>
          </thead>

          <tbody>

            {Object.entries(summary.report).map(([type,count])=>(
              <tr key={type}>
                <td>{type}</td>
                <td>{count}</td>
              </tr>
            ))}

          </tbody>

        </table>

        {/* CODE DIFF */}

        <h2>Code Differences</h2>

        {diffs.map(file => (

          <div key={file.relativePath} className="file-diff">

            <h3>{file.relativePath}</h3>

            <div className="diff-grid">

              {/* ORIGINAL */}

              <div className="diff-panel">

                <div className="diff-header original">
                  ORIGINAL
                </div>

                {file.lineDiffs.map((d,i)=>(
                  <div key={i} className={`code-line ${d.type.toLowerCase()}`}>
                    <span className="line-number">{d.lineNumber}</span>
                    <span className="line-code">{d.originalLine}</span>
                  </div>
                ))}

              </div>

              {/* FIXED */}

              <div className="diff-panel">

                <div className="diff-header fixed">
                  FIXED
                </div>

                {file.lineDiffs.map((d,i)=>(
                  <div key={i} className={`code-line ${d.type.toLowerCase()}`}>
                    <span className="line-number">{d.lineNumber}</span>
                    <span className="line-code">{d.modifiedLine}</span>
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