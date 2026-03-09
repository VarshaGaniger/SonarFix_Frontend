import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Box,
  Typography,
  Button,
  Breadcrumbs,
  Link,
  Snackbar,
  Alert
} from "@mui/material";

import {
  ChevronRight,
  ChevronDown,
  FileText
} from "lucide-react";

import axios from "axios";

import "./DiffViewer.css";
import "./CodeViewer.css";

const DiffViewer = () => {

  const navigate = useNavigate();
  const { projectKey: paramProjectKey } = useParams();

  const projectKey = paramProjectKey || localStorage.getItem("projectKey");
  const scanId = localStorage.getItem("scanId");

  const [issues, setIssues] = useState([]);
  const [fileDiffs, setFileDiffs] = useState([]);

  const [currentIndex, setCurrentIndex] = useState(0);

  const [openFiles, setOpenFiles] = useState({});
  const [selectedFixes, setSelectedFixes] = useState({});

  const [loading, setLoading] = useState(true);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  /* ---------------- FETCH DATA ---------------- */

  useEffect(() => {

    const fetchData = async () => {

      try {

        /* -------- ISSUES -------- */

        const issuesRes = await axios.get(
          `http://localhost:8080/api/scan/${projectKey}/issues/all`
        );

        const backendIssues =
          issuesRes.data.content?.flatMap(g => g.issues) || [];

        const issueList = backendIssues.map(issue => ({
          id: issue.key,
          file: issue.filePath,
          title: issue.message,
          severity: issue.severity.toLowerCase(),
          line: issue.line
        }));

        setIssues(issueList);

        /* -------- PREVIEW FIXES -------- */

        await axios.post(
          `http://localhost:8080/api/diff/preview/${scanId}`
        );

        /* -------- DIFF -------- */

        const diffRes = await axios.get(
          `http://localhost:8080/api/diff/project/${scanId}`
        );

        const mapped = diffRes.data.map(file => ({
          relativePath: file.relativePath,
          differences: file.lineDiffs || []
        }));

        setFileDiffs(mapped);

        /* -------- OPEN FIRST FILE -------- */

        const fileMap = {};

        mapped.forEach((f, index) => {
          fileMap[f.relativePath] = index === 0;
        });

        setOpenFiles(fileMap);

        const selectedMap = {};

        issueList.forEach(i => {
          selectedMap[i.id] = true;
        });

        setSelectedFixes(selectedMap);

      } catch (err) {
        console.error("Data fetch failed", err);
      }

      setLoading(false);

    };

    if (projectKey && scanId) {
      fetchData();
    }

  }, [projectKey, scanId]);

  /* ---------------- CURRENT FILE ---------------- */

  const currentFile =
    fileDiffs.length > 0 ? fileDiffs[currentIndex] : null;

  /* ---------------- FILE GROUPING ---------------- */

  const files = [...new Set(issues.map(i => i.file))];

  const getFileIssues = filePath =>
    issues.filter(issue => issue.file === filePath);

  /* ---------------- TOGGLES ---------------- */

  const toggleIssue = id => {

    setSelectedFixes(prev => ({
      ...prev,
      [id]: !prev[id]
    }));

  };

  const toggleFileExpand = filePath => {

    setOpenFiles(prev => ({
      ...prev,
      [filePath]: !prev[filePath]
    }));

  };

  /* ---------------- APPLY FIXES ---------------- */

  const applySelected = async () => {

    const selectedIssues = issues
      .filter(i => selectedFixes[i.id])
      .map(i => i.id);

    if (selectedIssues.length === 0) {

      setSnackbar({
        open: true,
        message: "No fixes selected",
        severity: "warning"
      });

      return;

    }

    try {

      await axios.post(
        "http://localhost:8080/api/fix/apply/selected",
        selectedIssues,
        { params: { scanId } }
      );

      setSnackbar({
        open: true,
        message: `${selectedIssues.length} fixes applied`,
        severity: "success"
      });

    } catch {

      setSnackbar({
        open: true,
        message: "Fix failed",
        severity: "error"
      });

    }

  };

  const applyAll = async () => {

    try {

      await axios.post(
        `http://localhost:8080/api/fix/apply/${scanId}`
      );

      setSnackbar({
        open: true,
        message: "All fixes applied",
        severity: "success"
      });

    } catch {

      setSnackbar({
        open: true,
        message: "AutoFix ALL failed",
        severity: "error"
      });

    }

  };

  /* ---------------- LOADING ---------------- */

  if (loading) {

    return (
      <Box sx={{ padding: 4 }}>
        <Typography>Loading project diff...</Typography>
      </Box>
    );

  }

  /* ---------------- UI ---------------- */

  return (

    <Box className="diff-viewer-page">

      <Box className="diff-header-section">

        <Breadcrumbs separator={<ChevronRight size={14} />}>

          <Link onClick={() => navigate("/dashboard")}>
            Projects
          </Link>

          <Link onClick={() => navigate(`/projects/${projectKey}/issues`)}>
            {projectKey}
          </Link>

          <Typography>
            Review Project Fixes
          </Typography>

        </Breadcrumbs>

      </Box>

      <Box className="review-layout">

        {/* LEFT PANEL */}

        <aside className="left-panel">

          <div className="left-header">

            <div className="left-title">
              <h3>TOTAL ISSUES</h3>
              <span className="badge">{issues.length}</span>
            </div>

            <button className="btn-outline" onClick={applySelected}>
              Accept Fix Selected
            </button>

            <button className="btn-primary" onClick={applyAll}>
              Accept All Fixes
            </button>

          </div>

          <div className="issue-list">

            {files.map(filePath => (

              <div key={filePath} className="file-group">

                <div
                  className="file-header"
                  onClick={() => {

                    const idx =
                      fileDiffs.findIndex(
                        f => f.relativePath === filePath
                      );

                    if (idx !== -1) {
                      setCurrentIndex(idx);
                    }

                  }}
                >

                  <span
                    onClick={e => {
                      e.stopPropagation();
                      toggleFileExpand(filePath);
                    }}
                  >
                    {openFiles[filePath]
                      ? <ChevronDown size={16} />
                      : <ChevronRight size={16} />}
                  </span>

                  <FileText size={18} />

                  <span className="file-name">
                    {filePath.split("/").pop()}
                  </span>

                </div>

                {openFiles[filePath] &&
                  getFileIssues(filePath).map(issue => (

                    <div
                      key={issue.id}
                      className="issue-item"
                      onClick={() => {

                        const el =
                          document.getElementById(
                            `line-${issue.line}`
                          );

                        if (el) {
                          el.scrollIntoView({
                            behavior: "smooth",
                            block: "center"
                          });
                        }

                      }}
                    >

                      <input
                        type="checkbox"
                        checked={selectedFixes[issue.id]}
                        onChange={() => toggleIssue(issue.id)}
                      />

                      <div className="issue-content">

                        <h4>{issue.title}</h4>

                        <div className="issue-meta">

                          <span className={`severity ${issue.severity}`}>
                            {issue.severity.toUpperCase()}
                          </span>

                          <span>Line {issue.line}</span>

                        </div>

                      </div>

                    </div>

                  ))}

              </div>

            ))}

          </div>

        </aside>

        {/* RIGHT PANEL */}

        <Box className="diff-content">

          <Box className="diff-container">

            {/* ORIGINAL */}

            <Box className="diff-column">

              <Box className="diff-header red">
                ORIGINAL
              </Box>

              <Box className="code-block">

                {currentFile?.differences?.map((d, i) => (

                  <Box
                    key={i}
                    id={`line-${d.lineNumber}`}
                    className={`code-line ${
                      d.type === "REMOVED"
                        ? "removed"
                        : d.type === "MODIFIED"
                        ? "modified"
                        : ""
                    }`}
                  >

                    <Box className="line-number">
                      {d.lineNumber}
                    </Box>

                    <pre className="line-code">
                      {d.originalLine ?? ""}
                    </pre>

                  </Box>

                ))}

              </Box>

            </Box>

            {/* FIXED */}

            <Box className="diff-column">

              <Box className="diff-header green">
                PROPOSED FIX
              </Box>

              <Box className="code-block">

                {currentFile?.differences?.map((d, i) => (

                  <Box
                    key={i}
                    className={`code-line ${
                      d.type === "ADDED"
                        ? "added"
                        : d.type === "MODIFIED"
                        ? "modified"
                        : ""
                    }`}
                  >

                    <Box className="line-number">
                      {d.lineNumber}
                    </Box>

                    <pre className="line-code">
                      {d.modifiedLine ?? ""}
                    </pre>

                  </Box>

                ))}

              </Box>

            </Box>

          </Box>

        </Box>

      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() =>
          setSnackbar(prev => ({ ...prev, open: false }))
        }
      >

        <Alert severity={snackbar.severity}>
          {snackbar.message}
        </Alert>

      </Snackbar>

    </Box>

  );

};

export default DiffViewer;