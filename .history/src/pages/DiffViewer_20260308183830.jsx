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

import { ChevronRight, ChevronDown, FileText } from "lucide-react";
import axios from "axios";

import "./DiffViewer.css";

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

  const currentFile =
    fileDiffs.length > 0 ? fileDiffs[currentIndex] : null;

  /* ---------------- FETCH DATA ---------------- */

  useEffect(() => {

    const fetchData = async () => {

      try {

        const issuesRes = await axios.get(
          `http://localhost:8080/api/scan/${scanId}/result`
        );

        const issueList = issuesRes.data.issues.map(issue => ({
          id: issue.key,
          file: issue.file,
          title: issue.title,
          severity: issue.severity.toLowerCase(),
          line: issue.line
        }));

        setIssues(issueList);

        /* preview fixes */

        await axios.post(
          `http://localhost:8080/api/diff/preview/${scanId}`
        );

        /* load diff */

        const diffRes = await axios.get(
          `http://localhost:8080/api/diff/project/${scanId}`
        );

        const mapped = diffRes.data.map(file => ({
          fileName: file.relativePath.split(/[\\/]/).pop(),
          relativePath: file.relativePath,
          differences: file.lineDiffs || []
        }));

        setFileDiffs(mapped);

        /* open first file */

        const openMap = {};
        mapped.forEach((f, i) => {
          openMap[f.relativePath] = i === 0;
        });

        setOpenFiles(openMap);

        /* auto select fixes */

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

    if (scanId) fetchData();

  }, [scanId]);

  /* ---------------- FILE GROUPING ---------------- */

  const files = [...new Set(issues.map(i => i.file))];

  const getFileIssues = file =>
    issues.filter(i => i.file === file);

  const toggleFileExpand = file => {

    setOpenFiles(prev => ({
      ...prev,
      [file]: !prev[file]
    }));

  };

  const toggleIssue = id => {

    setSelectedFixes(prev => ({
      ...prev,
      [id]: !prev[id]
    }));

  };

  /* ---------------- APPLY FIXES ---------------- */

  const applySelected = async () => {

    const selected = issues
      .filter(i => selectedFixes[i.id])
      .map(i => i.id);

    if (selected.length === 0) {

      setSnackbar({
        open: true,
        message: "No fixes selected",
        severity: "warning"
      });

      return;

    }

    try {

      await axios.post(
        `http://localhost:8080/api/fix/apply/selected`,
        selected,
        { params: { scanId } }
      );

      setSnackbar({
        open: true,
        message: `${selected.length} fixes applied`,
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

  /* ---------------- DIFF ROW RENDER ---------------- */

  const renderDiffRows = () => {

    if (!currentFile) return null;

    return currentFile.differences.map((d, i) => {

      const leftText = d.originalLine ?? "";
      const rightText = d.modifiedLine ?? "";

      const leftClass =
        d.type === "REMOVED"
          ? "removed"
          : d.type === "MODIFIED"
          ? "modified"
          : "";

      const rightClass =
        d.type === "ADDED"
          ? "added"
          : d.type === "MODIFIED"
          ? "modified"
          : "";

      return (

        <Box className="diff-row" key={i}>

          {/* LEFT ORIGINAL */}
          <Box className={`code-line ${leftClass}`}>
            <Box className="line-number">{d.lineNumber}</Box>
            <pre className="line-code">{leftText}</pre>
          </Box>

          {/* RIGHT FIXED */}
          <Box className={`code-line ${rightClass}`}>
            <Box className="line-number">{d.lineNumber}</Box>
            <pre className="line-code">{rightText}</pre>
          </Box>

        </Box>

      );

    });

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

          <Typography>Review Fixes</Typography>

        </Breadcrumbs>

        <Typography variant="h5">
          {currentFile ? currentFile.fileName : "No File"}
        </Typography>

      </Box>

      <Box className="review-layout">

        {/* LEFT PANEL */}

        <aside className="left-panel">

          <div className="left-header">

            <h3>Total Issues</h3>
            <span className="badge">{issues.length}</span>

            <button className="btn-outline" onClick={applySelected}>
              Accept Selected
            </button>

            <button className="btn-primary" onClick={applyAll}>
              Accept All
            </button>

          </div>

          <div className="issue-list">

            {files.map(file => (

              <div key={file} className="file-group">

                <div
                  className="file-header"
                  onClick={() =>
                    setCurrentIndex(
                      fileDiffs.findIndex(f => f.relativePath === file)
                    )
                  }
                >

                  <span
                    onClick={e => {
                      e.stopPropagation();
                      toggleFileExpand(file);
                    }}
                  >
                    {openFiles[file]
                      ? <ChevronDown size={16}/>
                      : <ChevronRight size={16}/>}
                  </span>

                  <FileText size={18}/>

                  <span className="file-name">
                    {file.split(/[\\/]/).pop()}
                  </span>

                </div>

                {openFiles[file] &&
                  getFileIssues(file).map(issue => (

                    <div
                      key={issue.id}
                      className="issue-item"
                    >

                      <input
                        type="checkbox"
                        checked={selectedFixes[issue.id]}
                        onChange={() => toggleIssue(issue.id)}
                      />

                      <div>

                        <h4>{issue.title}</h4>

                        <span className={`severity ${issue.severity}`}>
                          {issue.severity}
                        </span>

                        <span>Line {issue.line}</span>

                      </div>

                    </div>

                  ))}

              </div>

            ))}

          </div>

        </aside>

        {/* RIGHT DIFF PANEL */}

        <Box className="diff-content">

          <Box className="diff-header-row">

            <Box className="diff-header red">
              ORIGINAL
            </Box>

            <Box className="diff-header green">
              PROPOSED FIX
            </Box>

          </Box>

          <Box className="diff-body">

            {renderDiffRows()}

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