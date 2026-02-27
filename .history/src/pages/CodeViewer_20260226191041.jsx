import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Breadcrumbs,
  Link
} from "@mui/material";
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
  const [activeTab, setActiveTab] = useState("where");
  const initialIssue = location.state?.issue;
  const editorRef = useRef(null);
  const [openFiles, setOpenFiles] = useState({});
  const [autoFixOnly, setAutoFixOnly] = useState(false);
  const [issues, setIssues] = useState([]);
  const [fileContent, setFileContent] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [activeIssueId, setActiveIssueId] = useState(null);
  const [loading, setLoading] = useState(false);

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

    setTimeout(() => {
      const el = document.getElementById(`line-${matchedIssue.line}`);
      if (el) {
        el.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      }
    }, 400);

  }, [issues, initialIssue]);
  
  const fetchIssues = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `http://localhost:8080/api/scan/${projectKey}/issues`,
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
  title: issue.message,        // ✅ show actual message
  rule: issue.rule,            // keep rule separately
  description: issue.description,
  severity: issue.severity?.toLowerCase() || "minor",
  line: issue.line,
  autoFix: issue.autoFixable,
  selected: false
}));
      setIssues(mapped);

      const fileMap = {};
      mapped.forEach(i => fileMap[i.file] = true);
      setOpenFiles(fileMap);

    } catch (err) {
      console.error("Error fetching issues:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleIssue = (id) => {
  setIssues(prev =>
    prev.map(issue =>
      issue.id === id
        ? { ...issue, selected: !issue.selected }
        : issue
    )
  );
};

  /* ================= FETCH FILE ================= */

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

  /* ================= GROUP FILES ================= */

  const files = [...new Set(issues.map(i => i.file))];

  const getFileIssues = (filePath) =>
    issues.filter(issue => issue.file === filePath);

  const isFileFullySelected = (filePath) => {
    const fileIssues = getFileIssues(filePath);
    if (fileIssues.length === 0) return false;
    return fileIssues.every(i => i.selected);
  };

  const toggleFileSelectAll = (filePath) => {
    const fileIssues = getFileIssues(filePath);
    const allSelected = fileIssues.every(i => i.selected);

    setIssues(prev =>
      prev.map(issue =>
        issue.file === filePath
          ? { ...issue, selected: !allSelected }
          : issue
      )
    );
  };

  const toggleFileExpand = (filePath) => {
    setOpenFiles(prev => ({
      ...prev,
      [filePath]: !prev[filePath]
    }));
  };

  /* ================= AUTO FIX ================= */

  const applySelected = async () => {
    const selectedIssues = issues.filter(i => i.selected);
    if (selectedIssues.length === 0) return toast.error("No issues selected");

    try {
      await axios.post("http://localhost:8080/api/fix/apply", {
        issueKeys: selectedIssues.map(i => i.id),
        projectKey
      });
      fetchIssues();
    } catch (err) {
      console.error("Auto-fix failed", err);
    }
  };

  const applyAll = async () => {
    if (issues.length === 0) return toast.error("No issues to apply");

    try {
      await axios.post("http://localhost:8080/api/fix/apply", {
        issueKeys: issues.map(i => i.id),
        projectKey
      });
      fetchIssues();
    } catch (err) {
      console.error("Auto-fix all failed", err);
    }
  };
const maskFilePath = (fullPath) => {
  if (!fullPath) return "";

  const parts = fullPath.split("/");

  if (parts.length <= 3) return fullPath; 

  const first = parts[0]; 
  const lastFolder = parts[parts.length - 2];
  const fileName = parts[parts.length - 1];

  return `${first}/../${lastFolder}/${fileName}`;
};

  const handleCopy = async () => {
  if (!fileContent?.lines) return;

  const fullText = fileContent.lines
    .map(line =>
      line.segments.map(segment => segment.text).join("")
    )
    .join("\n");

  try {
    await navigator.clipboard.writeText(fullText);
    toast.success("Copied to clipboard");
  } catch (err) {
    toast.error("Copy failed", err);
  }
};

const handleFullScreen = () => {
  if (!editorRef.current) return;

  if (!document.fullscreenElement) {
    editorRef.current.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
};
const getActiveIssue = () =>
  issues.find(i => i.id === activeIssueId);

const renderCodeArea = () => {
  const activeIssue = getActiveIssue();

  return (
    <div className="code-area">
      {fileContent?.lines?.map(line => {
        const isHighlighted =
          activeIssue && line.lineNumber === activeIssue.line;

        return (
          <div
            key={line.lineNumber}
            className={`code-line ${isHighlighted ? "highlight-line" : ""}`}
          >
            <span className="line-number">
              {line.lineNumber}
            </span>

            {line.segments.map((segment, idx) => (
              <span key={idx}>
                {segment.text}
              </span>
            ))}
          </div>
        );
      })}
    </div>
  );
};

  return (
    <Box className="code-viewer-page">

      <Box className="code-viewer-nav">
        <Breadcrumbs separator={<ChevronRight size={14} color="#94a3b8" />}>
          <Link underline="hover" color="#64748b">Projects</Link>
          <Link underline="hover" color="#64748b">{projectKey}</Link>
          <Typography sx={{ fontSize: "13px", fontWeight: 600 }}>
            Code Viewer
          </Typography>
        </Breadcrumbs>
      </Box>

      <main className="layout">

        {/* LEFT PANEL */}
        <aside className="left-panel">

          <div className="left-header">
            <div className="left-title">
              <h3>TOTAL ISSUES</h3>
              <span className="badge">{issues.length} TOTAL</span>
            </div>

            <div className="controls">
              <div className="toggle-box">
                <span>Auto-Fixable Only</span>
                <div
                  className={`toggle ${autoFixOnly ? "active" : ""}`}
                  onClick={() => setAutoFixOnly(prev => !prev)}
                >
                  <div className="toggle-dot"></div>
                </div>
              </div>

              <div className="btn-row">
                <button className="btn-outline" onClick={applySelected}>
                  Fix Selected
                </button>
                <button className="btn-primary" onClick={applyAll}>
                  Fix All
                </button>
              </div>
            </div>
          </div>

          <div className="issue-list">
            {files.map(filePath => (
              <div className="file-group" key={filePath}>

                <div
                  className={`file-header ${selectedFile === filePath ? "selected-file" : ""}`}
                  onClick={() => {
                    if (selectedFile !== filePath) {
                      openFile(filePath);
                    }
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isFileFullySelected(filePath)}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => toggleFileSelectAll(filePath)}
                  />

                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFileExpand(filePath);
                    }}
                  >
                    {openFiles[filePath] ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </span>

                  <FileText size={18} />
                 <span className="file-name">{maskFilePath(filePath)}</span>
                </div>

            {openFiles[filePath] &&
  getFileIssues(filePath).map(issue => (
    <div
      key={issue.id}
      className={`issue-item ${issue.selected ? "active" : ""}`}
      onClick={() => {
        openFile(issue.file);

        setActiveIssueId(prev =>
          prev === issue.id ? null : issue.id
        );

        setTimeout(() => {
          const el = document.getElementById(`line-${issue.line}`);
          if (el) {
            el.scrollIntoView({
              behavior: "smooth",
              block: "center"
            });
          }
        }, 300);
      }}
    >

      
    <input type="checkbox" checked={issue.selected}
      onChange={(e) => {
      e.stopPropagation();
      toggleIssue(issue.id);
    }}
    onClick={(e) => e.stopPropagation()}/>
      <div className="issue-content">
        <div className="issue-top">
          <h4>{issue.message}</h4>
          {issue.autoFix && <span className="auto">AUTO</span>}
        </div>

        <p>{issue.title}</p>

        <div className="issue-meta">
          <span className={issue.severity}>
            {issue.severity.toUpperCase()}
          </span>
          <span className="line">Line {issue.line}</span>
        </div>
      </div>

    </div>
))}
              </div>
            ))}
          </div>
        </aside>

        {/* CENTER PANEL */}
 <section className="center-panel" ref={editorRef}>

  {activeIssueId && (
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

      <button
        className={activeTab === "fix" ? "active" : ""}
        onClick={() => setActiveTab("fix")}
      >
        How can I fix it?
      </button>

      <button
        className={activeTab === "activity" ? "active" : ""}
        onClick={() => setActiveTab("activity")}
      >
        Activity
      </button>
    </div>
  )}

  {/* WHERE TAB → SHOW CODE */}
  {activeTab === "where" && (
    <>
      <div className="editor-header">
        <div className="editor-title">
          {selectedFile || "Select a file"}
        </div>
        <div className="editor-actions">
          <button onClick={handleCopy} className="icon-btn">
            <Copy size={18} />
          </button>
          <button onClick={handleFullScreen} className="icon-btn">
            <Maximize2 size={18} />
          </button>
        </div>
      </div>

      <div className="editor-body">
        <div className="code-area">
          {fileContent?.lines?.map(line => {

            const activeIssue = issues.find(
              issue =>
                issue.line === line.lineNumber &&
                issue.id === activeIssueId
            );

            const hasActiveIssue = !!activeIssue;

            return (
              <React.Fragment key={line.lineNumber}>

                <div
                  id={`line-${line.lineNumber}`}
                  className={`code-line ${hasActiveIssue ? "highlight-line" : ""}`}
                >
                  <span className="line-number">
                    {line.lineNumber}
                  </span>

                  {line.segments.map((segment, idx) => (
                    <span key={idx}>
                      {segment.text}
                    </span>
                  ))}
                </div>

                {hasActiveIssue && (
                  <div className="issue-popup-row">
                    <div className="sonar-card">
                      <div className="sonar-header">
                        <div className="rule-info">
                          <span className="rule-key">
                            {activeIssue.rule}
                          </span>
                          <span className="severity-label">
                            {activeIssue.severity.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="sonar-body">
                        <div className="icon-wrapper">
                          <AlertCircle size={18} />
                        </div>

                        <div className="description-wrapper">
                          <p>{activeIssue.title}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </React.Fragment>
            );
          })}
        </div>
      </div>
    </>
  )}

  {/* WHY TAB → SHOW ONLY DESCRIPTION */}
  {activeTab === "why" && (
    <div className="issue-popup-row">
      <div className="sonar-card">
        <h4>{issues.find(i => i.id === activeIssueId)?.rule}</h4>
        <p>{issues.find(i => i.id === activeIssueId)?.description}</p>
      </div>
    </div>
  )}

</section>
      </main>
    </Box>
  );
};

export default CodeViewer;
