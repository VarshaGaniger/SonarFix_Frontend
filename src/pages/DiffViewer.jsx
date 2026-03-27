import { useState, useEffect, useRef } from "react";
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
  FileText,
  Wand2,
  Folder,
  Tag
} from "lucide-react";

import axios from "axios";

import "./DiffViewer.css";
import "./CodeViewer.css";

const DiffViewer = () => {

  const navigate = useNavigate();
  const { projectKey: paramProjectKey } = useParams();

  const projectKey = paramProjectKey || localStorage.getItem("projectKey");
  const [scanId, setScanId] = useState(localStorage.getItem("scanId"));
  const [fixLoading, setFixLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [showReport, setShowReport] = useState(false);
  const [renameOldName, setRenameOldName] = useState("");
  const [renameNewName, setRenameNewName] = useState("");
  const [isRenameMode, setIsRenameMode] = useState(false);
  const [renameType, setRenameType] = useState("variable");
  const [csvFile, setCsvFile] = useState(null);
  const [issues, setIssues] = useState([]);
  const [fileDiffs, setFileDiffs] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef();

  const [openFiles, setOpenFiles] = useState({});
  const [selectedFixes, setSelectedFixes] = useState({});

  const [loading, setLoading] = useState(true);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  const [groupBy, setGroupBy] = useState("file"); // "file" or "rule"
  const [isFixingRule, setIsFixingRule] = useState({});

  /* ---------------- FETCH DATA ---------------- */

  useEffect(() => {

    const fetchData = async () => {

      try {

        const issuesRes = await axios.get(
          `http://localhost:9090/api/scan/${projectKey}/issues/all`
        );

        const backendIssues =
          issuesRes.data.content?.flatMap(g => g.issues) || [];

        const latestScanId = issuesRes.data.scanId;
        if (latestScanId) {
          setScanId(latestScanId);
          localStorage.setItem("scanId", latestScanId);
        }

        const effectiveScanId = latestScanId || scanId;

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

        if (effectiveScanId) {
          await axios.post(
            `http://localhost:9090/api/diff/preview/${effectiveScanId}`
          );

          const diffRes = await axios.get(
            `http://localhost:9090/api/diff/project/${effectiveScanId}`
          );

        const mapped = diffRes.data.map(file => ({
  relativePath: file.relativePath,
  differences: file.lineDiffs || []
}));

          setFileDiffs(mapped);

          if (mapped.length > 0) {
            setSelectedFile(mapped[0].relativePath);
          }

          const fileMap = {};
          mapped.forEach((f, i) => {
            fileMap[f.relativePath] = i === 0;
          });

          setOpenFiles(fileMap);

          const reportRes = await axios.get(
            "http://localhost:9090/api/refactor/final-report",
            { params: { scanId } }
          );

          setReportData(reportRes.data);
          setShowReport(true);
        }

        setSelectedFixes({});

      } catch (err) {
        console.error("Fetch failed", err);
      }

      setLoading(false);

    };

    if (projectKey) fetchData();

  }, [projectKey]);

  /* ---------------- CURRENT FILE ---------------- */

  const normalize = p => p?.replaceAll("\\", "/");

  const currentFile =
    fileDiffs.find(f => normalize(f.relativePath) === normalize(selectedFile)) || null;

  /* ---------------- FILE GROUPING ---------------- */

  const files = fileDiffs
    .map(f => f.relativePath)
    .filter(p => p.endsWith(".java"));

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
    if (isRenameMode) return false;
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

  const isRuleChecked = ruleId => {
    const ruleIssues = issues.filter(i => i.ruleId === ruleId);
    if (ruleIssues.length === 0) return false;
    return ruleIssues.every(i => selectedFixes[i.id]);
  };

  const toggleRuleIssues = ruleId => {
    const ruleIssues = issues.filter(i => i.ruleId === ruleId);
    const shouldSelect = !isRuleChecked(ruleId);
    const updated = { ...selectedFixes };
    ruleIssues.forEach(issue => {
      if (issue.autoFixable) {
        updated[issue.id] = shouldSelect;
      }
    });
    setSelectedFixes(updated);
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
      setSnackbar({ open: true, message: "No fixes selected", severity: "warning" });
      return;
    }
    localStorage.removeItem(`fixAccepted_${scanId}`);
    navigate(`/scan-status/${scanId}?projectKey=${projectKey}&type=fix`);

    axios.post(
      "http://localhost:9090/api/fix/apply/selected",
      selectedIssues,
      { params: { scanId } }
    ).catch(err => console.error("Fix selected failed", err));
  };

  const applyAll = async () => {
    localStorage.removeItem(`fixAccepted_${scanId}`);
    navigate(`/scan-status/${scanId}?projectKey=${projectKey}&type=fix`);
    axios.post(`http://localhost:9090/api/fix/apply/${scanId}`)
      .catch(err => console.error("Fix all failed", err));
  };

  const handleRename = async () => {

    if (renameOldName === renameNewName) {
      setSnackbar({
        open: true,
        message: "Old and new name cannot be same",
        severity: "warning"
      });
      return;
    }

    try {
      setFixLoading(true);
      setIsRenameMode(true);

      const endpointMap = {
        variable: "rename-variable",
        method: "rename-method",
        class: "rename-class"
      };

      const endpoint = endpointMap[renameType];

      const res = await axios.post(
        `http://localhost:9090/api/refactor/${endpoint}`,
        {
          scanId,
          oldName: renameOldName,
          newName: renameNewName
        }
      );

  const mapped = res.data.map(file => ({
  relativePath: file.relativePath,
  differences: file.lineDiffs || []
}));

      setFileDiffs(mapped);

      if (mapped.length > 0) {
        setSelectedFile(mapped[0].relativePath);
      } else {
        setSnackbar({
          open: true,
          message: `No ${renameType} usages found`,
          severity: "info"
        });
      }

      const fileMap = {};
      mapped.forEach(f => {
        fileMap[f.relativePath] = true;
      });
      setOpenFiles(fileMap);
      window.location.reload();

    } catch (err) {
      setSnackbar({
        open: true,
        message: `${renameType} rename failed`,
        severity: "error"
      });
    } finally {
      setFixLoading(false);
    }
  };

const handleCSVUpload = async () => {

  if (!csvFile) {
    setSnackbar({
      open: true,
      message: "Please select a CSV file",
      severity: "warning"
    });
    return;
  }

  try {
    setFixLoading(true);

    const formData = new FormData();
    formData.append("file", csvFile);
    formData.append("scanId", scanId);

    const endpointMap = {
      class: "classes-csv",
      method: "methods-csv",
      variable: "variables-csv"
    };

    const res = await axios.post(
      `http://localhost:9090/api/refactor/rename/${endpointMap[renameType]}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      }
    );

    // ✅ NORMALIZE DIFF (VERY IMPORTANT)
    const mapped = (res.data || []).map(file => ({
      relativePath: file.relativePath,
      differences: file.lineDiffs || file.diffLines || file.differences || []
    }));

    setFileDiffs(mapped);
 
    if (mapped.length > 0) {
      setSelectedFile(mapped[0].relativePath);
    }
     const fileMap = {};
      mapped.forEach(f => {
        fileMap[f.relativePath] = true;
      });
      setOpenFiles(fileMap);
      window.location.reload();


    const reportRes = await axios.get(
      "http://localhost:9090/api/refactor/final-report",
      { params: { scanId } }
    );

    setReportData(reportRes.data);
    setShowReport(true);

    setSnackbar({
      open: true,
      message: `${renameType} CSV rename applied`,
      severity: "success"
    });

  } catch (err) {
    console.error(err);
    setSnackbar({
      open: true,
      message: "CSV rename failed",
      severity: "error"
    });
  } finally {
    setFixLoading(false);
  }
};

  const handleFixByRule = async (e, ruleId) => {
    e.stopPropagation();

    if (!window.confirm(`Are you sure you want to fix all auto-fixable issues for rule ${ruleId}?`)) {
      return;
    }

    try {
      setIsFixingRule(prev => ({ ...prev, [ruleId]: true }));
      setFixLoading(true);
      localStorage.removeItem(`fixAccepted_${scanId}`);

      const resp = await axios.post(
        `http://localhost:9090/api/fix/apply/rule?scanId=${scanId}&ruleId=${ruleId}`
      );

      if (resp.status === 200) {
        const fixedCount = resp.data.fixesApplied;
        setSnackbar({
          open: true,
          message: `Successfully applied ${fixedCount} fixes for rule ${ruleId}!`,
          severity: "success"
        });
        navigate(`/scan-status/${scanId}?projectKey=${projectKey}&type=fix`);
      }

    } catch (err) {
      console.error("Fix by Rule failed", err);
      const errorMsg =
        err.response?.data?.message ||
        (typeof err.response?.data === "string" ? err.response?.data : null) ||
        err.message;
      setSnackbar({
        open: true,
        message: `Failed to apply rule-level fixes: ${errorMsg}`,
        severity: "error"
      });
    } finally {
      setIsFixingRule(prev => ({ ...prev, [ruleId]: false }));
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
const downloadCSV = (type) => {

  const endpointMap = {
    class: "classes",
    method: "methods",
    variable: "variables"
  };

  const url = `http://localhost:9090/api/refactor/export/${endpointMap[type]}/${scanId}`;

  window.open(url);
};
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

            <div className="left-title">
              <h3>TOTAL ISSUES</h3>
              <span className="badge">{issues.length}</span>
            </div>

            <div style={{ padding: "10px 0", display: "flex", flexDirection: "column", gap: "8px" }}>

              <Box sx={{
  p: 2,
  border: "1px solid #e2e8f0",
  borderRadius: "10px",
  background: "#f8fafc"
}}>

  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
    Refactor Rename
  </Typography>

  {/* STEP 1 */}
  <Typography variant="caption" sx={{ color: "#64748b" }}>
    Step 1: Select what you want to rename
  </Typography>

  <select
    value={renameType}
    onChange={(e) => {
      setRenameType(e.target.value);
      setCsvFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }}
    style={{
      width: "100%",
      padding: "8px",
      marginTop: "6px",
      marginBottom: "10px",
      borderRadius: "6px",
      border: "1px solid #cbd5e1"
    }}
  >
    <option value="class">Class</option>
    <option value="method">Method</option>
    <option value="variable">Variable</option>
  </select>

  {/* STEP 2 */}
  <Typography variant="caption" sx={{ color: "#64748b" }}>
    Step 2: Download template
  </Typography>

  <button
    className="btn-outline"
    style={{ width: "100%", marginTop: "6px" }}
    onClick={() => downloadCSV(renameType)}
  >
    Download {renameType.toUpperCase()} CSV
  </button>

  {/* STEP 3 */}
  <Typography variant="caption" sx={{ color: "#64748b", marginTop: "10px", display: "block" }}>
    Step 3: Upload edited CSV
  </Typography>

  <Box sx={{
    border: "1px dashed #cbd5e1",
    borderRadius: "6px",
    padding: "10px",
    marginTop: "6px",
    textAlign: "center",
    background: "#fff"
  }}>
    <input
      ref={fileInputRef}
      type="file"
      accept=".csv"
      onChange={(e) => setCsvFile(e.target.files[0])}
      style={{ marginBottom: "6px" }}
    />

    <Typography variant="caption" sx={{ color: "#94a3b8" }}>
      {csvFile ? csvFile.name : "Upload CSV with new names"}
    </Typography>
  </Box>

  {/* STEP 4 */}
  <button
    className="btn-primary"
    style={{ width: "100%", marginTop: "10px" }}
    disabled={!csvFile || fixLoading}
    onClick={handleCSVUpload}
  >
    Apply Rename
  </button>

</Box>
        
            </div>

            <div className="btn-row">
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

          <div className="group-toggle">
            <button
              className={`toggle-btn ${groupBy === "file" ? "active" : ""}`}
              onClick={() => setGroupBy("file")}
            >
              <Folder size={14} /> Files
            </button>
            <button
              className={`toggle-btn ${groupBy === "rule" ? "active" : ""}`}
              onClick={() => setGroupBy("rule")}
            >
              <Tag size={14} /> Rules
            </button>
          </div>

          <div className="issue-list">

            {groupBy === "file" ? (
              files.map(filePath => (
                <div key={filePath} className="file-group">
                  <div className="file-header">
                    <span onClick={() => toggleFileExpand(filePath)}>
                      {openFiles[filePath] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </span>
                    <input
                      type="checkbox"
                      checked={isFileChecked(filePath)}
                      onChange={() => toggleFileIssues(filePath)}
                    />
                    <div className="file-nav" onClick={() => setSelectedFile(filePath)}>
                      <FileText size={18} />
                      <span className="file-name">{filePath.split(/[/\\]/).pop()}</span>
                    </div>
                  </div>

                  {openFiles[filePath] && getFileIssues(filePath).map(issue => (
                    <div
                      key={issue.id}
                      className="issue-item"
                      onClick={() => {
                        setSelectedFile(filePath);
                        setTimeout(() => {
                          const el = document.getElementById(`line-${issue.line}`);
                          el?.scrollIntoView({ behavior: "smooth", block: "center" });
                        }, 120);
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedFixes[issue.id] || false}
                        onClick={e => e.stopPropagation()}
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
              ))
            ) : (
              Array.from(new Set(issues.map(i => i.ruleId))).map(ruleId => {
                const ruleIssues = issues.filter(i => i.ruleId === ruleId);
                const isAutoFixable = ruleIssues.some(i => i.autoFixable);

                return (
                  <div key={ruleId} className="rule-group">
                    <div className="rule-header" onClick={() => toggleFileExpand(ruleId)}>
                      <span className="expand-icon" style={{ pointerEvents: "none" }}>
                        {openFiles[ruleId] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </span>
                      <input
                        type="checkbox"
                        checked={isRuleChecked(ruleId)}
                        onClick={e => e.stopPropagation()}
                        onChange={() => toggleRuleIssues(ruleId)}
                      />
                      <div className="rule-info">
                        <span className="rule-id">{ruleId}</span>
                        <span className="count-badge">{ruleIssues.length}</span>
                      </div>
                      {isAutoFixable && (
                        <button
                          className={`rule-fix-btn-inline ${isFixingRule[ruleId] ? "fixing" : ""}`}
                          disabled={isFixingRule[ruleId]}
                          onClick={(e) => handleFixByRule(e, ruleId)}
                          title="Fix All for this Rule"
                        >
                          <Wand2 size={14} />
                        </button>
                      )}
                    </div>

                    {openFiles[ruleId] && ruleIssues.map(issue => (
                      <div
                        key={issue.id}
                        className="issue-item rule-sub-item"
                        onClick={() => {
                          setSelectedFile(issue.file);
                          setTimeout(() => {
                            const el = document.getElementById(`line-${issue.line}`);
                            el?.scrollIntoView({ behavior: "smooth", block: "center" });
                          }, 120);
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedFixes[issue.id] || false}
                          onClick={e => e.stopPropagation()}
                          onChange={() => toggleIssue(issue.id)}
                        />
                        <div className="issue-content">
                          <h4>{issue.title}</h4>
                          <div className="issue-meta">
                            <span className="file-mini">{issue.file.split(/[/\\]/).pop()}</span>
                            <span>Line {issue.line}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })
            )}

          </div>

        </aside>

        {/* RIGHT PANEL */}

        <Box className="diff-content">

          <Box className="diff-file-header">
            <FileText size={18} />
            <Typography className="diff-file-name">
              {selectedFile || "No file selected"}
            </Typography>
          </Box>

          <Box className="diff-container">
            {!currentFile?.differences?.length ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  color: "#64748b",
                  background: "white",
                  borderRadius: "8px",
                  border: "1px dashed #cbd5e1",
                  padding: "40px 20px"
                }}
              >
                <Typography variant="h6" sx={{ color: "#334155", mb: 1 }}>
                  No Auto-Fix Proposed
                </Typography>
                <Typography variant="body2">
                  The auto-fix engine did not generate any code changes for this file.
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  This issue may not be fully supported by the current auto-fix rules, or it requires manual resolution.
                </Typography>
              </Box>
            ) : (
              <>
                {/* ORIGINAL */}
                <Box className="diff-column">
                  <Box className="diff-header red">ORIGINAL</Box>
                  <Box className="code-block">
                    {currentFile.differences.map((d, index) => (
                      <Box
                        key={`${d.lineNumber}-${d.type}-orig-${index}`}
                        className={`code-line ${{ ADDED: "added", MODIFIED: "modified" }[d.type] || ""}`}
                      >
                        <Box className="line-number">{d.lineNumber}</Box>
                        <pre className="line-code">{d.originalLine ?? ""}</pre>
                      </Box>
                    ))}
                  </Box>
                </Box>

                {/* FIXED */}
                <Box className="diff-column">
                  <Box className="diff-header green">PROPOSED FIX</Box>
                  <Box className="code-block">
                    {currentFile.differences.map((d, index) => (
                      <Box
                        key={`${d.lineNumber}-${d.type}-fix-${index}`}
                        className={`code-line ${{ ADDED: "added", MODIFIED: "modified" }[d.type] || ""}`}
                      >
                        <Box className="line-number">{d.lineNumber}</Box>
                        <pre className="line-code">{d.modifiedLine ?? ""}</pre>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </>
            )}
          </Box>

        </Box>

      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(p => ({ ...p, open: false }))}
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
            <Typography>Applying fixes...</Typography>
          </Box>
        </Box>
      )}

    </Box>
  );

};

export default DiffViewer;
