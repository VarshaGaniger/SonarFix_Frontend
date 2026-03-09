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


      const diff = await axios.get(
        `http://localhost:8080/api/diff/project/${scanId}`
      );

 
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

      <button onClick={downloadPDF}>
        Download PDF
      </button>

      <div ref={reportRef}>

        <h1>AutoFix Report</h1>

        <p>Scan ID: {scanId}</p>
        <p>Total Fixes: {summary.totalFixes}</p>

        <h2>Fix Summary</h2>

        <table>

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

        <h2>Code Differences</h2>

        {diffs.map(file => (

          <div key={file.relativePath}>

            <h3>{file.relativePath}</h3>

            {file.lineDiffs.map((line, i) => (

              <pre key={i}>
                {line.lineNumber} {line.modifiedLine}
              </pre>

            ))}

          </div>

        ))}

      </div>

    </div>

  );

};

export default ReportPage;