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

import "./DiffViewer.css";
import "./CodeViewer.css";

const DiffViewer = () => {

  const navigate = useNavigate();
  const { projectKey } = useParams();

  /* ---------------- MOCK DATA ---------------- */

  const mockIssues = [
    {
      id: 1,
      file: "src/App.js",
      title: "Unused variable",
      severity: "minor",
      line: 10,
      changeType: "MODIFIED"
    },
    {
      id: 2,
      file: "src/App.js",
      title: "Console log detected",
      severity: "major",
      line: 15,
      changeType: "REMOVED"
    },
    {
      id: 3,
      file: "src/utils.js",
      title: "Hardcoded value",
      severity: "critical",
      line: 5,
      changeType: "MODIFIED"
    }
  ];

  const mockDiffs = [
    {
      fileName: "App.js",
      relativePath: "src/App.js",
      differences: [
        {
          lineNumber: 10,
          originalLine: "let temp;",
          fixedLine: "",
          type: "REMOVED"
        },
        {
          lineNumber: 15,
          originalLine: "console.log('debug');",
          fixedLine: "",
          type: "REMOVED"
        }
      ]
    },
    {
      fileName: "utils.js",
      relativePath: "src/utils.js",
      differences: [
        {
          lineNumber: 5,
          originalLine: "const limit = 100;",
          fixedLine: "const limit = config.limit;",
          type: "MODIFIED"
        }
      ]
    }
  ];

  /* ---------------- STATES ---------------- */

  const [issues] = useState(mockIssues);
  const [fileDiffs] = useState(mockDiffs);

  const [currentIndex] = useState(0);

  const [openFiles, setOpenFiles] = useState({});
  const [selectedFixes, setSelectedFixes] = useState({});

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  /* ---------------- INIT SELECT ---------------- */

  useEffect(() => {
    const selected = {};
    mockIssues.forEach(issue => {
      selected[issue.id] = true;
    });
    setSelectedFixes(selected);
  }, []);

  /* ---------------- CURRENT FILE ---------------- */

  const currentFile = fileDiffs[currentIndex];

  /* ---------------- FILE GROUP ---------------- */

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

    const allSelected = fileIssues.every(issue => selectedFixes[issue.id]);

    const updated = { ...selectedFixes };

    fileIssues.forEach(issue => {
      updated[issue.id] = !allSelected;
    });

    setSelectedFixes(updated);
  };

  /* ---------------- ACTIONS ---------------- */

  const applySelected = () => {

    const selectedIssues = issues.filter(
      issue => selectedFixes[issue.id]
    );

    console.log("Selected fixes:", selectedIssues);

    setSnackbar({
      open: true,
      message: `${selectedIssues.length} fixes selected`,
      severity: "success"
    });
  };

  const applyAll = () => {

    const allSelected = {};
    issues.forEach(issue => {
      allSelected[issue.id] = true;
    });

    setSelectedFixes(allSelected);

    setSnackbar({
      open: true,
      message: "All fixes selected",
      severity: "success"
    });
  };

  const handleReject = () => {
    navigate(`/projects/${projectKey}/code`);
  };

  const handleClose = () =>
    setSnackbar(prev => ({ ...prev, open: false }));

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

          <Link onClick={() => navigate("/dashboard")} sx={{ cursor: "pointer" }}>
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

                <div className="file-header">

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

                    <div key={issue.id} className="issue-item">

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
                  <Box key={index} className={`code-line ${item.type}`}>
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