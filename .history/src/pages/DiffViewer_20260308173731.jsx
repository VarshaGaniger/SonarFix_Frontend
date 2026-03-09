import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Chip,
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

  /* ---------------- STATES ---------------- */

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

  /* ---------------- STORE PROJECT KEY ---------------- */

  useEffect(() => {
    if (projectKey) {
      localStorage.setItem("projectKey", projectKey);
    }
  }, [projectKey]);

  /* ---------------- FETCH DATA ---------------- */

  useEffect(() => {

    const fetchData = async () => {

      try {

        /* ---------------- FETCH ISSUES ---------------- */

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

/* ---------------- GENERATE PREVIEW ---------------- */

await axios.post(
  `http://localhost:8080/api/diff/preview/${scanId}`
);

/* ---------------- FETCH DIFF ---------------- */

const diffRes = await axios.get(
  `http://localhost:8080/api/diff/project/${scanId}`
);

const mapped = diffRes.data.map(file => ({
  fileName: file.fileName,
  relativePath: file.relativePath,

  differences: (file.lineDiffs || []).map(d => ({
    lineNumber: d.lineNumber,
    originalLine: d.originalLine,
    fixedLine: d.modifiedLine,
    type:
      !d.originalLine
        ? "ADDED"
        : !d.modifiedLine
        ? "REMOVED"
        : "MODIFIED"
  }))
}));

        setFileDiffs(mapped);

        /* ---------------- OPEN FIRST FILE ---------------- */

        const fileMap = {};
        mapped.forEach((f, index) => {
          fileMap[f.relativePath] = index === 0;
        });

        setOpenFiles(fileMap);

        /* ---------------- AUTO SELECT FIXES ---------------- */

        const selectedFixMap = {};
        issueList.forEach(issue => {
          selectedFixMap[issue.id] = true;
        });

        setSelectedFixes(selectedFixMap);

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

  const isFileFullySelected = filePath => {

    const fileIssues = getFileIssues(filePath);

    return (
      fileIssues.length > 0 &&
      fileIssues.every(issue => selectedFixes[issue.id])
    );

  };

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

  const toggleFileSelectAll = filePath => {

    const fileIssues = getFileIssues(filePath);

    const allSelected =
      fileIssues.every(issue => selectedFixes[issue.id]);

    const updated = { ...selectedFixes };

    fileIssues.forEach(issue => {
      updated[issue.id] = !allSelected;
    });

    setSelectedFixes(updated);

  };

  /* ---------------- APPLY FIXES ---------------- */

  const applySelected = async () => {

    const selectedIssues = issues
      .filter(issue => selectedFixes[issue.id])
      .map(issue => issue.id);

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

  /* ---------------- NAVIGATION ---------------- */

  const handleReject = () => {
    navigate(`/projects/${projectKey}/code`);
  };

  const handleClose = () =>
    setSnackbar(prev => ({ ...prev, open: false }));

  /* ---------------- LOADING ---------------- */

  if (loading) {

    return (
      <Box sx={{ padding: 4 }}>
        <Typography>Loading project diff...</Typography>
      </Box>
    );

  }

  /* ---------------- DIFF LINES ---------------- */

  const leftLines =
    currentFile?.differences?.map(d => ({
      line: d.lineNumber,
      text: d.originalLine ?? "",
      type:
        d.type === "REMOVED"
          ? "removed"
          : d.type === "MODIFIED"
          ? "modified"
          : ""
    })) || [];

  const rightLines =
    currentFile?.differences?.map(d => ({
      line: d.lineNumber,
      text: d.fixedLine ?? "",
      type:
        d.type === "ADDED"
          ? "added"
          : d.type === "MODIFIED"
          ? "modified"
          : ""
    })) || [];

  /* ---------------- UI ---------------- */

  return (

    <Box className="diff-viewer-page">

      <Box className="diff-header-section">

        <Breadcrumbs separator={<ChevronRight size={14} />}>

          <Link
            onClick={() => navigate("/dashboard")}
            sx={{ cursor: "pointer" }}
          >
            Projects
          </Link>

          <Link
            onClick={() => navigate(`/projects/${projectKey}/issues`)}
            sx={{ cursor: "pointer" }}
          >
            {projectKey}
          </Link>

          <Typography>Review Project Fixes</Typography>

        </Breadcrumbs>

        <Box className="diff-title-row">

          <Typography variant="h5">
            {currentFile ? currentFile.fileName : "No Changes"}
          </Typography>

          {currentFile && (
            <Chip
              label={`${currentFile.differences?.length || 0} changes`}
              size="small"
            />
          )}

        </Box>

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

            {files.map((filePath, index) => (

              <div className="file-group" key={index}>

                <div
  className="file-header"
  onClick={() =>
    setCurrentIndex(
      fileDiffs.findIndex(f => f.relativePath === filePath)
    )
  }
>

                  <input
                    type="checkbox"
                    checked={isFileFullySelected(filePath)}
                    onChange={() => toggleFileSelectAll(filePath)}
                  />

                  <span onClick={() => toggleFileExpand(filePath)}>
                    {openFiles[filePath]
                      ? <ChevronDown size={16} />
                      : <ChevronRight size={16} />}
                  </span>

                  <FileText size={18} />

                  <span className="file-name">
                    {filePath.split("/").pop()}
                  </span>

                </div>

                {openFiles[filePath] && (

                  getFileIssues(filePath).map(issue => (

                    <div
  key={issue.id}
  className="issue-item"
  onClick={() => {
    setCurrentIndex(
      fileDiffs.findIndex(f => f.relativePath === issue.file)
    );

    setTimeout(() => {
      const el = document.getElementById(`line-${issue.line}`);
      if (el) {
        el.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      }
    }, 200);
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

                  ))

                )}

              </div>

            ))}

          </div>

        </aside>

        {/* RIGHT PANEL */}

        <Box className="diff-content">

          <Box className="diff-container">

            <Box className="diff-column">

              <Box className="diff-header red">ORIGINAL</Box>

              <Box className="code-block">

                {leftLines.map((item, index) => (
             <Box
  key={index}
  id={`line-${item.line}`}
  className={`code-line ${item.type}`}
>
  <Box className="line-number">{item.line}</Box>
  <pre className="line-code">{item.text}</pre>
</Box>
                  
                ))}

              </Box>

            </Box>

            <Box className="diff-column">

              <Box className="diff-header green">PROPOSED FIX</Box>

              <Box className="code-block">

                {rightLines.map((item, index) => (
                  <Box key={index} className={`code-line ${item.type}`}>
                    <Box className="line-number">{item.line}</Box>
                    <pre className="line-code">{item.text}</pre>
                  </Box>
                ))}

              </Box>

            </Box>

          </Box>

        </Box>

      </Box>

      <Box className="diff-action-bar">

        <Button variant="outlined" onClick={handleReject}>
          Cancel
        </Button>

      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleClose}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>

    </Box>

  );

};

export default DiffViewer;