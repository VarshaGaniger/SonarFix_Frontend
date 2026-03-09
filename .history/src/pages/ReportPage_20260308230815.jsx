import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import html2pdf from "html2pdf.js";
import { useParams } from "react-router-dom";

import "./ReportPage.css";

const ReportPage = () => {

  const { scanId } = useParams();
  const reportRef = useRef();

  const [summary, setSummary] = useState(null);
  const [diffs, setDiffs] = useState([]);

  useEffect(() => {

    const load = async () => {

      const report = await axios.get(
        `http://localhost:8080/api/fix/report/${scanId}`
      );

      const diff = await axios.get(
        `http://localhost:8080/api/diff/project/${scanId}`
      );

      setSummary(report.data);
      setDiffs(diff.data);

    };

    load();

  }, [scanId]);

  const downloadPDF = () => {

    html2pdf()
      .set({
        margin: 0.5,
        filename: `autofix-report-${scanId}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "a4" }
      })
      .from(reportRef.current)
      .save();

  };

  if (!summary) return <div>Loading report...</div>;
  return (

    <div className="report-page">

      <button className="download-btn" onClick={downloadPDF}>
        Download PDF
      </button>

      <div ref={reportRef} className="report-container">

        <h1>AutoFix Execution Report</h1>

        <div className="report-info">

          <p><b>Scan ID:</b> {scanId}</p>
          <p><b>Total Fixes:</b> {summary.totalFixes}</p>

        </div>

        {/* Fix Summary */}

        <h2>Fix Summary</h2>

        <table className="report-table">

          <thead>
            <tr>
              <th>Fix Type</th>
              <th>Count</th>
            </tr>
          </thead>

          <tbody>

            {Object.entries(summary.report).map(([type, count]) => (

              <tr key={type}>
                <td>{type}</td>
                <td>{count}</td>
              </tr>

            ))}

          </tbody>

        </table>

        {/* Code Differences */}

        <h2>Code Differences</h2>

        {diffs.map(file => (

          <div key={file.relativePath} className="diff-file">

            <h3>{file.relativePath}</h3>

            <div className="diff-columns">

              {/* Original */}

              <div className="diff-column">

                <div className="diff-header red">
                  ORIGINAL
                </div>

                {file.lineDiffs.map((d,i)=>(
                  <pre key={i}
                       className={`diff-line ${d.type.toLowerCase()}`}>
                    {d.lineNumber} {d.originalLine}
                  </pre>
                ))}

              </div>

              {/* Modified */}

              <div className="diff-column">

                <div className="diff-header green">
                  FIXED
                </div>

                {file.lineDiffs.map((d,i)=>(
                  <pre key={i}
                       className={`diff-line ${d.type.toLowerCase()}`}>
                    {d.lineNumber} {d.modifiedLine}
                  </pre>
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