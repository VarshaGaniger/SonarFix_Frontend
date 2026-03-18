
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Snackbar,CircularProgress,
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
const [fixLoading, setFixLoading] = useState(false);
  const [issues, setIssues] = useState([]);
  const [fileDiffs, setFileDiffs] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  const [openFiles, setOpenFiles] = useState({});
  const [selectedFixes, setSelectedFixes] = useState({});

  const [loading, setLoading] = useState(true);
  const [oldMethod, setOldMethod] = useState("");
const [newMethod, setNewMethod] = useState("");

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  /* ---------------- FETCH DATA ---------------- */
useEffect(() => {

  const fetchData = async () => {

    try {

      const issuesRes = await axios.get(
        `http://localhost:9090/api/scan/${projectKey}/issues/all`
      );

      const backendIssues =
        issuesRes.data.content?.flatMap(g => g.issues) || [];

      const issueList = backendIssues.map(issue => ({
        id: issue.key,
        ruleId: issue.rule,
        file: issue.filePath,
        title: issue.message,
        severity: issue.severity.toLowerCase(),
        line: issue.line,
        autoFixable: issue.autoFixable
      }));

      setIssues(issueList);

      // 🔥🔥🔥 ADD THIS (CRITICAL FIX)
      await axios.post(
        `http://localhost:9090/api/diff/preview/${scanId}`,
        {
          fixes: [
            {
              fixType: "METHOD_RENAME",
              oldMethodName: "__dummy__",
              newMethodName: "__dummy__"
            }
          ],
          projectPath: localStorage.getItem("projectPath")
        }
      );

      // ✅ NOW diff will work
      const diffRes = await axios.get(
        `http://localhost:9090/api/diff/project/${scanId}`
      );

      const mapped = (diffRes.data || [])
        .map(file => ({
          relativePath: file.relativePath,
          differences: file.lineDiffs || []
        }))
        .filter(file => file.differences.length > 0);

      setFileDiffs(mapped);

      if (mapped.length > 0) {
        setSelectedFile(mapped[0].relativePath);
      }

    } catch (err) {

      console.error("Fetch failed", err);

      setSnackbar({
        open: true,
        message: "Failed to load diff preview",
        severity: "error"
      });

    }

    setLoading(false);

  };

  if (projectKey && scanId) fetchData();

}, [projectKey, scanId]);
  // 🔥 ONLY SHOWING CHANGED PART (useEffect)

  /* ---------------- CURRENT FILE ---------------- */

  const currentFile =
    fileDiffs.find(f => f.relativePath === selectedFile) || null;

  /* ---------------- FILE GROUPING ---------------- */
 const normalize = p => p?.replaceAll("\\", "/");
const files = fileDiffs
  .map(f => f.relativePath)
  .filter(file =>
    issues.some(i =>
      normalize(i.file)?.endsWith(normalize(file))
    )
  );

 

  const getFileIssues = filePath => {

    const normalizedFile = normalize(filePath);

    return issues.filter(issue =>
      normalize(issue.file)?.endsWith(normalizedFile)
    );

  };

  /* ---------------- CHECKBOX LOGIC ---------------- */

  const toggleIssue = id => {

    setSelectedFixes(prev => ({
      ...prev,
      [id]: !prev[id]
    }));

  };

  const isFileChecked = filePath => {

    const fileIssues = getFileIssues(filePath);

    if (fileIssues.length === 0) return false;

    return fileIssues.every(i => selectedFixes[i.id]);

  };

  const toggleFileIssues = filePath => {

    const fileIssues = getFileIssues(filePath);

    const shouldSelect = !isFileChecked(filePath);

    const updated = { ...selectedFixes };

    fileIssues.forEach(issue => {
      updated[issue.id] = shouldSelect;
    });

    setSelectedFixes(updated);

  };

  /* ---------------- 🔥 RENAME FUNCTION ---------------- */

const handleRenamePreview = async () => {

  if (!oldMethod || !newMethod) {
    setSnackbar({
      open: true,
      message: "Enter both method names",
      severity: "warning"
    });
    return;
  }

  try {

    setFixLoading(true);

    await axios.post(
      `http://localhost:9090/api/diff/preview/${scanId}`,
      {
        fixes: [
          {
            fixType: "METHOD_RENAME",
            oldMethodName: oldMethod,
            newMethodName: newMethod
          }
        ],
        projectPath: localStorage.getItem("projectPath")
      }
    );

    // 🔥 reload diff AFTER rename
    const diffRes = await axios.get(
      `http://localhost:9090/api/diff/project/${scanId}`
    );

    const mapped = (diffRes.data || [])
      .map(file => ({
        relativePath: file.relativePath,
        differences: file.lineDiffs || []
      }))
      .filter(file => file.differences.length > 0);

    setFileDiffs(mapped);

    if (mapped.length > 0) {
      setSelectedFile(mapped[0].relativePath);
    }

    setSnackbar({
      open: true,
      message: "Rename preview successful",
      severity: "success"
    });

  } catch (err) {

    console.error("Rename error:", err);

    setSnackbar({
      open: true,
      message: "Rename preview failed",
      severity: "error"
    });

  } finally {
    setFixLoading(false);
  }
};

  /* ---------------- FILE EXPAND ---------------- */

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

  if (!selectedIssues.length) {

    setSnackbar({
      open: true,
      message: "No fixes selected",
      severity: "warning"
    });

    return;
  }

  try {

    setFixLoading(true);

    await axios.post(
      "http://localhost:9090/api/fix/apply/selected",
      selectedIssues,
      { params: { scanId } }
    );

    navigate(`/projects/${projectKey}/summary`);

  } catch {

    setSnackbar({
      open: true,
      message: "Fix failed",
      severity: "error"
    });

  } finally {
    setFixLoading(false);
  }

};

const applyAll = async () => {

  try {

    setFixLoading(true);

    await axios.post(
      `http://localhost:9090/api/fix/apply/${scanId}`
    );

    navigate(`/projects/${projectKey}/summary`);

  } catch {

    setSnackbar({
      open: true,
      message: "AutoFix ALL failed",
      severity: "error"
    });

  } finally {
    setFixLoading(false);
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

        <Breadcrumbs separator={<ChevronRight size={14}/>}>
          <Link onClick={() => navigate("/dashboard")}>
            Projects
          </Link>

          <Link onClick={() =>
            navigate(`/projects/${projectKey}/issues`)
          }>
            {projectKey}
          </Link>

          <Typography>
            Review Project Fixes
          </Typography>
          
        </Breadcrumbs>

      </Box>
<Box className="diff-legend">

  <div className="legend-item">
    <span className="legend-color added"></span>
    <span>Added Line</span>
  </div>

  <div className="legend-item">
    <span className="legend-color removed"></span>
    <span>Removed Line</span>
  </div>

  <div className="legend-item">
    <span className="legend-color modified"></span>
    <span>Modified Line</span>
  </div>

</Box>
      <Box className="review-layout">

        {/* LEFT PANEL */}

        <aside className="left-panel">

          <div className="left-header">

  {/* HEADER */}
  <div className="left-title">
    <h3>TOTAL ISSUES</h3>
    <span className="badge">{issues.length}</span>
  </div>

  {/* 🔥 RENAME CARD */}
  <Box
    sx={{
      mt: 2,
      p: 2,
      border: "1px solid #e5e7eb",
      borderRadius: "10px",
      background: "#fafafa"
    }}
  >

    {/* TITLE */}
    <Typography
      sx={{
        fontWeight: 600,
        fontSize: "15px",
        mb: 1.5
      }}
    >
      Method Rename Factory
    </Typography>

    {/* INPUTS */}
    <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>

      {/* OLD */}
      <Box>
        <Typography sx={{ fontSize: "12px", color: "#555", mb: 0.5 }}>
          Old Method Name
        </Typography>
        <input
          value={oldMethod}
          onChange={(e) => setOldMethod(e.target.value)}
          placeholder="e.g. calculateSum"
          style={{
            width: "100%",
            padding: "9px",
            borderRadius: "6px",
            border: "1px solid #d1d5db",
            fontSize: "13px"
          }}
        />
      </Box>

      {/* NEW */}
      <Box>
        <Typography sx={{ fontSize: "12px", color: "#555", mb: 0.5 }}>
          New Method Name
        </Typography>
        <input
          value={newMethod}
          onChange={(e) => setNewMethod(e.target.value)}
          placeholder="e.g. computeTotal"
          style={{
            width: "100%",
            padding: "9px",
            borderRadius: "6px",
            border: "1px solid #d1d5db",
            fontSize: "13px"
          }}
        />
      </Box>

      {/* BUTTON */}
      <button
        onClick={handleRenamePreview}
        style={{
          marginTop: "6px",
          background: "#2563eb",
          color: "white",
          border: "none",
          padding: "10px",
          borderRadius: "6px",
          cursor: "pointer",
          fontWeight: 500,
          fontSize: "13px",
          transition: "0.2s"
        }}
        onMouseOver={(e) => e.target.style.background = "#1d4ed8"}
        onMouseOut={(e) => e.target.style.background = "#2563eb"}
      >
        Rename & Preview
      </button>

    </Box>

  </Box>

  {/* ACTION BUTTONS */}
  <div className="btn-row" style={{ marginTop: "15px" }}>

    <button
      className="btn-outline"
      disabled={fixLoading}
      onClick={applySelected}
    >
      Accept Fix Selected
    </button>

    <button
      className="btn-primary"
      disabled={fixLoading}
      onClick={applyAll}
    >
      Accept All Fixes
    </button>

  </div>

</div>

          <div className="issue-list">

           {files
  .filter(filePath => getFileIssues(filePath).length > 0)
  .map(filePath => (

              <div key={filePath} className="file-group">

                <div className="file-header">

                  <span
                    onClick={() =>
                      toggleFileExpand(filePath)
                    }
                  >
                    {openFiles[filePath]
                      ? <ChevronDown size={16}/>
                      : <ChevronRight size={16}/>}
                  </span>

                  <input
                    type="checkbox"
                    checked={isFileChecked(filePath)}
                    onChange={() =>
                      toggleFileIssues(filePath)
                    }
                  />

                  <div
                    className="file-nav"
                    onClick={() =>
                      setSelectedFile(filePath)
                    }
                  >
                    <FileText size={18}/>

                    <span className="file-name">
                      {filePath.split(/[/\\]/).pop()}
                    </span>
                  </div>

                </div>

                {openFiles[filePath] &&
                  getFileIssues(filePath).map(issue => (

                    <div
                      key={issue.id}
                      className="issue-item"
                      onClick={() => {

                        setSelectedFile(filePath);

                        setTimeout(() => {

                          const el =
                            document.getElementById(
                              `line-${issue.line}`
                            );

                          el?.scrollIntoView({
                            behavior: "smooth",
                            block: "center"
                          });

                        }, 120);

                      }}
                    >

                      <input
                        type="checkbox"
                        checked={selectedFixes[issue.id] || false}
                        onClick={e => e.stopPropagation()}
                        onChange={() =>
                          toggleIssue(issue.id)
                        }
                      />

                      <div className="issue-content">

                        <h4>{issue.title}</h4>

                        <div className="issue-meta">

                          <span className={`severity ${issue.severity}`}>
                            {issue.severity.toUpperCase()}
                          </span>

                          <span>
                            Line {issue.line}
                          </span>

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

  {/* FILE HEADER */}
  <Box className="diff-file-header">

    <FileText size={18} />

    <Typography className="diff-file-name">
      {selectedFile || "No file selected"}
    </Typography>

  </Box>


  <Box className="diff-container">

            {/* ORIGINAL */}

            <Box className="diff-column">

              <Box className="diff-header red">
                ORIGINAL
              </Box>

              <Box className="code-block">

                {currentFile?.differences?.map(d => (

                  <Box
                    key={`${d.lineNumber}-${d.type}`}
                    id={`line-${d.lineNumber}`}
                    className={`code-line ${
                      { REMOVED:"removed", MODIFIED:"modified" }[d.type] || ""
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

                {currentFile?.differences?.map(d => (

                  <Box
                    key={`${d.lineNumber}-${d.type}-fix`}
                    className={`code-line ${
                      { ADDED:"added", MODIFIED:"modified" }[d.type] || ""
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
          setSnackbar(p => ({ ...p, open:false }))
        }
      >
        <Alert severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
{fixLoading && (

  <Box
    sx={{
      position: "fixed",
      inset: 0,
      zIndex: 2000,
      backdropFilter: "blur(6px)",
      background: "rgba(255,255,255,0.35)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}
  >

    <Box
      sx={{
        background: "white",
        padding: "30px 40px",
        borderRadius: "10px",
        boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "15px"
      }}
    >

      <CircularProgress size={50} />

      <Typography>
        Applying fixes...
      </Typography>

    </Box>

  </Box>

)}
    </Box>
  );

};

export default DiffViewer;




