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
import { useLocation, useParams } from "react-router-dom";
import axios from "axios";
import "./CodeViewer.css";

const CodeViewer = () => {
  const { projectKey } = useParams();
  const location = useLocation();
  const initialIssueKey = location.state?.issueKey;

  const editorRef = useRef(null);

  const [activeTab, setActiveTab] = useState("where");
  const [openFiles, setOpenFiles] = useState({});
  const [issues, setIssues] = useState([]);
  const [fileContent, setFileContent] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [activeIssueId, setActiveIssueId] = useState(null);
  const [projectName, setProjectName] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!projectKey) {
    return <div style={{ padding: 20 }}>No project selected</div>;
  }

  /* ================= FETCH ISSUES ================= */

  useEffect(() => {
    fetchIssues();
  }, [projectKey]);

  const fetchIssues = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `http://localhost:8080/api/scan/${projectKey}/issues/all`,
        { params: { page: 1, pageSize: 200 } }
      );

      const backendIssues =
        response.data.content?.flatMap(g => g.issues) || [];

      const mapped = backendIssues.map(issue => ({
        id: issue.key,
        file: issue.filePath,
        title: issue.message,
        rule: issue.rule,
        severity: issue.severity?.toLowerCase() || "minor",
        line: issue.line,
        autoFix: issue.autoFixable,
        whyBlocks: issue.whyBlocks || [],
        nonCompliantExample: issue.nonCompliantExample,
        compliantExample: issue.compliantExample,
        selected: false
      }));

      setIssues(mapped);
      setActiveIssueId(null);

      const fileMap = {};
      mapped.forEach(i => {
        fileMap[i.file] = true;
      });
      setOpenFiles(fileMap);

    } catch (err) {
      console.error("Error fetching issues:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= FETCH PROJECT NAME ================= */

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8080/api/sonar/projects"
        );

        const project = res.data.find(
          p => p.projectKey === projectKey
        );

        if (project) setProjectName(project.name);

      } catch (err) {
        console.error("Failed to fetch project name", err);
      }
    };

    fetchProject();
  }, [projectKey]);

  /* ================= INITIAL ISSUE (NAVIGATION) ================= */

  useEffect(() => {
    if (!initialIssueKey || issues.length === 0) return;

    const matched = issues.find(i => i.id === initialIssueKey);
    if (!matched) return;

    openFile(matched.file);
    setActiveIssueId(matched.id);

  }, [issues, initialIssueKey]);

  /* ================= DEFAULT FIRST ISSUE ================= */

  useEffect(() => {
    if (initialIssueKey) return;
    if (issues.length === 0) return;
    if (activeIssueId) return;

    const first = issues[0];
    if (!first) return;

    openFile(first.file);
    setActiveIssueId(first.id);

  }, [issues]);

  /* ================= SCROLL AFTER RENDER ================= */

  useEffect(() => {
    if (!fileContent?.lines) return;
    if (!activeIssueId) return;

    const active = issues.find(i => i.id === activeIssueId);
    if (!active) return;

    const el = document.getElementById(`line-${active.line}`);
    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }

  }, [fileContent, activeIssueId]);

  /* ================= FILE FETCH ================= */

  const openFile = async filePath => {
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

  /* ================= ISSUE ACTIONS ================= */

  const toggleIssue = id => {
    setIssues(prev =>
      prev.map(issue =>
        issue.id === id
          ? { ...issue, selected: !issue.selected }
          : issue
      )
    );
  };

  const activeIssue = issues.find(i => i.id === activeIssueId);

  /* ================= RENDER ================= */

  return (
    <Box className="code-viewer-page">
      <Box className="code-viewer-nav">
        <Breadcrumbs separator={<ChevronRight size={14} color="#94a3b8" />}>
          <Link underline="hover" color="#64748b">
            Projects
          </Link>
          <Link underline="hover" color="#64748b">
            {projectName || projectKey}
          </Link>
          <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
            Code Viewer
          </Typography>
        </Breadcrumbs>
      </Box>

      <main className="layout">
        {/* LEFT PANEL */}
        <aside className="left-panel">
          <div className="left-header">
            <h3>TOTAL ISSUES</h3>
            <span className="badge">{issues.length} TOTAL</span>
          </div>

          <div className="issue-list">
            {issues.map(issue => (
              <div
                key={issue.id}
                className={`issue-item ${
                  activeIssueId === issue.id ? "active" : ""
                }`}
                onClick={() => {
                  openFile(issue.file);
                  setActiveIssueId(issue.id);
                  setActiveTab("where");
                }}
              >
                <h4>{issue.title}</h4>
                <span>Line {issue.line}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* CENTER PANEL */}
        <section className="center-panel" ref={editorRef}>
          {activeTab === "where" && (
            <>
              <div className="editor-header">
                <div className="editor-title">
                  {selectedFile || "Loading..."}
                </div>
              </div>

              <div className="editor-body">
                <div className="code-area">
                  {fileContent?.lines?.map(line => {
                    const highlight =
                      activeIssue &&
                      activeIssue.line === line.lineNumber;

                    return (
                      <div
                        key={line.lineNumber}
                        id={`line-${line.lineNumber}`}
                        className={`code-line ${
                          highlight ? "highlight-line" : ""
                        }`}
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
              </div>
            </>
          )}
        </section>
      </main>
    </Box>
  );
};

export default CodeViewer;