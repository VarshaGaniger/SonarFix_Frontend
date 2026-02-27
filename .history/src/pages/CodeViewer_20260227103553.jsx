import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, Breadcrumbs, Link } from "@mui/material";
import {
  ChevronRight,
  ChevronDown,
  FileText,
  Copy,
  Maximize2,
  AlertCircle
} from "lucide-react";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "./CodeViewer.css";

const CodeViewer = () => {
  const location = useLocation();
  const projectKey = location.state?.projectKey;
  const initialIssue = location.state?.issue;

  const [activeTab, setActiveTab] = useState("where");
  const [openFiles, setOpenFiles] = useState({});
  const [autoFixOnly, setAutoFixOnly] = useState(false);
  const [issues, setIssues] = useState([]);
  const [fileContent, setFileContent] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [activeIssueId, setActiveIssueId] = useState(null);
  const [loading, setLoading] = useState(false);

  const editorRef = useRef(null);

  /* ================= FETCH ISSUES ================= */

  useEffect(() => {
    if (!projectKey) return;
    fetchIssues();
  }, [autoFixOnly, projectKey]);

  useEffect(() => {
    if (!initialIssue || issues.length === 0) return;

    const matchedIssue = issues.find(i => i.id === initialIssue.key);
    if (!matchedIssue) return;

    openFile(matchedIssue.file);
    setActiveIssueId(matchedIssue.id);
  }, [issues, initialIssue]);

  const fetchIssues = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `http://localhost:8080/api/scan/${projectKey}/issues/all`,
        {
          params: {
            autoFixOnly,
            page: 1,
            pageSize: 200
          }
        }
      );

      const backendIssues =
        response.data.content?.flatMap(group => group.issues) || [];

      const mapped = backendIssues.map(issue => ({
        id: issue.key,
        file: issue.filePath,
        title: issue.message,
        rule: issue.rule,
        severity: issue.severity?.toLowerCase() || "minor",
        line: issue.line,
        autoFix: issue.autoFixable,
        whyBlocks: Array.isArray(issue.whyBlocks) ? issue.whyBlocks : [],
        fixBlocks: Array.isArray(issue.fixBlocks) ? issue.fixBlocks : [],
        nonCompliantExample: issue.nonCompliantExample,
        compliantExample: issue.compliantExample,
        selected: false
      }));

      setIssues(mapped);

      const fileMap = {};
      mapped.forEach(i => (fileMap[i.file] = true));
      setOpenFiles(fileMap);

    } catch (err) {
      console.error("Error fetching issues:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= FILE ================= */

  const openFile = async (filePath) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/files/${projectKey}`,
        { params: { filePath } }
      );

      setFileContent(response.data);
      setSelectedFile(filePath);
    } catch (err) {
      console.error("Failed to load file", err);
    }
  };

  const activeIssue = issues.find(i => i.id === activeIssueId);

  /* ================= RENDER ================= */

  return (
    <Box className="code-viewer-page">
      <main className="layout">

        {/* LEFT PANEL */}
        <aside className="left-panel">
          <div className="issue-list">
            {[...new Set(issues.map(i => i.file))].map(filePath => (
              <div key={filePath}>
                <div
                  className="file-header"
                  onClick={() => openFile(filePath)}
                >
                  <FileText size={18} />
                  <span>{filePath}</span>
                </div>

                {issues
                  .filter(issue => issue.file === filePath)
                  .map(issue => (
                    <div
                      key={issue.id}
                      className="issue-item"
                      onClick={() => {
                        openFile(issue.file);
                        setActiveIssueId(issue.id);
                        setActiveTab("where");
                      }}
                    >
                      <h4>{issue.title}</h4>
                      <span>{issue.severity.toUpperCase()}</span>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </aside>

        {/* CENTER PANEL */}
        <section className="center-panel" ref={editorRef}>

          {activeIssue && (
            <div className="issue-tabs">
              <button
                className={activeTab === "where" ? "active" : ""}
                onClick={() => setActiveTab("where")}
              >
                Where is the issue?
              </button>

              <button
                className={activeTab === "why" ? "active" : ""}
                onClick={() => setActiveTab("why")}
              >
                Why is this an issue?
              </button>

              {activeIssue.fixBlocks?.length > 0 && (
                <button
                  className={activeTab === "fix" ? "active" : ""}
                  onClick={() => setActiveTab("fix")}
                >
                  How can I fix it?
                </button>
              )}
            </div>
          )}

          {/* WHERE */}
          {activeTab === "where" && (
            <div className="editor-body">
              {fileContent?.lines?.map(line => {
                const highlight =
                  activeIssue && line.lineNumber === activeIssue.line;

                return (
                  <div
                    key={line.lineNumber}
                    className={`code-line ${highlight ? "highlight-line" : ""}`}
                  >
                    <span className="line-number">
                      {line.lineNumber}
                    </span>
                    {line.segments.map((segment, idx) => (
                      <span key={idx}>{segment.text}</span>
                    ))}
                  </div>
                );
              })}
            </div>
          )}

          {/* WHY */}
          {activeTab === "why" && activeIssue && (
            <div className="why-container">
              {activeIssue.whyBlocks.map((block, index) => {

                if (block.type === "heading")
                  return <h3 key={index}>{block.text}</h3>;

                if (block.type === "paragraph")
                  return <p key={index}>{block.text}</p>;

                if (block.type === "unordered_list" && block.items)
                  return (
                    <ul key={index}>
                      {block.items.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  );

                if (block.type === "ordered_list" && block.items)
                  return (
                    <ol key={index}>
                      {block.items.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ol>
                  );

                return null;
              })}

              {activeIssue.nonCompliantExample && (
                <>
                  <h4>Noncompliant Example</h4>
                  <pre><code>{activeIssue.nonCompliantExample}</code></pre>
                </>
              )}

              {activeIssue.compliantExample && (
                <>
                  <h4>Compliant Example</h4>
                  <pre><code>{activeIssue.compliantExample}</code></pre>
                </>
              )}
            </div>
          )}

          {/* FIX */}
          {activeTab === "fix" && activeIssue && (
            <div className="fix-container">
              {activeIssue.fixBlocks.map((block, index) => {

                if (block.type === "heading")
                  return <h3 key={index}>{block.text}</h3>;

                if (block.type === "paragraph")
                  return <p key={index}>{block.text}</p>;

                if (block.type === "unordered_list" && block.items)
                  return (
                    <ul key={index}>
                      {block.items.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  );

                if (block.type === "ordered_list" && block.items)
                  return (
                    <ol key={index}>
                      {block.items.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ol>
                  );

                return null;
              })}
            </div>
          )}

        </section>
      </main>
    </Box>
  );
};

export default CodeViewer;