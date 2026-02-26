import React, { useRef, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Divider,
  IconButton,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import {
  Upload,
  Link as LinkIcon,
  Folder,
  File,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./UploadProject.css";

/*
  🔥 IMPORTANT — YOUR REAL BACKEND APIs
  ZIP        → POST /api/project/upload-zip
  GITHUB     → POST /api/project/upload-github?repoUrl=
  LOCAL PATH → POST /api/scan/start?projectPath=
*/

const UploadProject = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [repoUrl, setRepoUrl] = useState("");
  const [localPath, setLocalPath] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  // ================= FILE HANDLERS =================
  const handleFileSelect = () => fileInputRef.current.click();

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedFile(file);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) setSelectedFile(file);
  };

  const removeFile = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ================= START ANALYSIS =================
// ================= START ANALYSIS =================
const startAnalysis = async () => {
  try {
    setLoading(true);

    let uploadResponse;
    let projectPath = "";

    // ================= ZIP Upload =================
    if (selectedFile) {
      const formData = new FormData();
      formData.append("file", selectedFile);

      uploadResponse = await axios.post(
        "http://localhost:8080/api/project/upload-zip",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
    }

    // ================= Git Upload =================
    else if (repoUrl.trim() !== "") {
      uploadResponse = await axios.post(
        "http://localhost:8080/api/project/upload-github",
        null,
        { params: { repoUrl } }
      );
    }

    // ================= Local Upload =================
    else if (localPath.trim() !== "") {
      uploadResponse = await axios.post(
        "http://localhost:8080/api/project/upload-local",
        null,
        { params: { localPath } }
      );
    }

    else {
      alert("Please upload ZIP, enter Git URL, or Local Path.");
      return;
    }

    // ================= EXTRACT PROJECT PATH =================
    const uploadData = uploadResponse.data;

    if (typeof uploadData === "string") {
      // If backend returns: "Project uploaded at: D:/sonar-workspace/123"
      if (uploadData.includes(":")) {
        projectPath = uploadData.split(":").pop().trim();
      } else {
        // If backend returns only the path
        projectPath = uploadData.trim();
      }
    } else if (uploadData.projectPath) {
      projectPath = uploadData.projectPath;
    }

    if (!projectPath) {
      alert("Could not determine project path from upload response.");
      return;
    }

    console.log("Project Path:", projectPath);

    // ================= START SCAN =================
    const scanResponse = await axios.post(
      "http://localhost:8080/api/scan/start",
      null,
      { params: { projectPath } }
    );

    const scanId = scanResponse.data.scanId;

    if (!scanId) {
      alert("Scan ID not returned from backend.");
      return;
    }

    console.log("Scan ID:", scanId);

    // Navigate correctly
    navigate(`/scan-status/${scanId}`);

  } catch (error) {
    console.error("Scan error:", error);
    alert("Something went wrong while starting scan.");
  } finally {
    setLoading(false);
  }
};
     

  return (
    <Box className="upload-container">
      <Box className="upload-main">

        <Typography variant="h4" className="page-title">
          New Project Analysis
        </Typography>

        <Typography variant="body1" className="page-subtitle">
          Upload or connect your Spring Boot project for automated quality analysis.
        </Typography>

        <Card className="upload-card">
          <CardContent sx={{ p: 4 }}>

            {/* ================= ZIP Upload ================= */}
            <Typography variant="subtitle2" className="section-label">
              Upload ZIP Project
            </Typography>

            <Box
              className={`dropzone ${isDragging ? "drag-over" : ""} ${
                selectedFile ? "has-file" : ""
              }`}
              onClick={handleFileSelect}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
            >
              <input
                type="file"
                hidden
                ref={fileInputRef}
                onChange={onFileChange}
                accept=".zip"
              />

              {selectedFile ? (
                <Box className="selected-file-view">
                  <File size={28} color="#2563eb" />
                  <Box sx={{ flex: 1 }}>
                    <Typography fontWeight="600">
                      {selectedFile.name}
                    </Typography>
                    <Typography variant="caption">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </Typography>
                  </Box>
                  <IconButton size="small" onClick={removeFile}>
                    <X size={18} />
                  </IconButton>
                </Box>
              ) : (
                <>
                  <Upload size={32} color="#6366f1" />
                  <Typography fontWeight="600">
                    Drag & Drop ZIP file
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    .zip (Max 200MB)
                  </Typography>
                </>
              )}
            </Box>

            {/* ================= Divider ================= */}
            <Box sx={{ my: 4 }}>
              <Divider>
                <Typography variant="caption">
                  OR CONNECT PROJECT
                </Typography>
              </Divider>
            </Box>

            {/* ================= Git Repo ================= */}
            <Typography variant="subtitle2" className="section-label">
              Git Repository URL
            </Typography>

            <TextField
              fullWidth
              placeholder="https://github.com/user/project.git"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LinkIcon size={18} />
                  </InputAdornment>
                ),
              }}
            />

            {/* ================= Local Path ================= */}
            <Typography variant="subtitle2" className="section-label">
              Local Project Path
            </Typography>

            <TextField
              fullWidth
              placeholder="D:/my-spring-project"
              value={localPath}
              onChange={(e) => setLocalPath(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Folder size={18} />
                  </InputAdornment>
                ),
              }}
            />

            {/* ================= Start Button ================= */}
            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 4, height: 48 }}
              onClick={startAnalysis}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Start Analysis"
              )}
            </Button>

          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default UploadProject;