import React, { useRef } from "react";
import { useLocation } from "react-router-dom";
import html2pdf from "html2pdf.js";

import "./ReportPage.css";

const ReportPage = () => {

  const { state } = useLocation();

  const { summary, diffs, scanId } = state;

  const reportRef = useRef();

  const downloadPDF = () => {

    html2pdf()
      .set({
        margin: 10,
        filename: `autofix-report-${scanId}.pdf`,
        html2canvas:{scale:3},
        jsPDF:{
          unit:"mm",
          format:"a4",
          orientation:"portrait"
        }
      })
      .from(reportRef.current)
      .save();

  };

  return (

    <div className="report-wrapper">

      <button
        className="download-btn"
        onClick={downloadPDF}
      >
        Download PDF
      </button>

      <div ref={reportRef}
           className="report-container">

        <h1>AutoFix Execution Report</h1>

        <p>
          <b>Scan ID:</b> {scanId}
        </p>

        <p>
          <b>Total Fixes:</b> {summary.totalFixes}
        </p>

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

            {Object.entries(summary.report)
              .map(([type,count])=>(
                <tr key={type}>
                  <td>{type}</td>
                  <td>{count}</td>
                </tr>
              ))}

          </tbody>

        </table>

        {/* DIFF */}

        <h2>Code Differences</h2>

        {diffs.map(file => (

          <div key={file.relativePath}
               className="file-diff">

            <h3>{file.relativePath}</h3>

            <div className="unified-diff">

              {file.lineDiffs.map((d,i)=>{

                if(d.type==="ADDED"){

                  return(
                    <div key={i}
                         className="diff-line added">
                      <span className="symbol">+</span>
                      <span>{d.modifiedLine}</span>
                    </div>
                  )

                }

                if(d.type==="REMOVED"){

                  return(
                    <div key={i}
                         className="diff-line removed">
                      <span className="symbol">-</span>
                      <span>{d.originalLine}</span>
                    </div>
                  )

                }

                if(d.type==="MODIFIED"){

                  return(
                    <>
                      <div key={i+"r"}
                           className="diff-line removed">
                        <span className="symbol">-</span>
                        <span>{d.originalLine}</span>
                      </div>

                      <div key={i+"a"}
                           className="diff-line added">
                        <span className="symbol">+</span>
                        <span>{d.modifiedLine}</span>
                      </div>
                    </>
                  )

                }

                return(
                  <div key={i}
                       className="diff-line">
                    <span className="symbol"></span>
                    <span>{d.originalLine}</span>
                  </div>
                )

              })}

            </div>

          </div>

        ))}

      </div>

    </div>

  );

};

export default ReportPage;