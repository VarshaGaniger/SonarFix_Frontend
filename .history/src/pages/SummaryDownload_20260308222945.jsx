import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { CheckCircle, Download, FileText, Bug } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import "./SummaryDownload.css";

const SummaryDownload = () => {

  const navigate = useNavigate();
  const { projectKey } = useParams();

  const scanId = localStorage.getItem("scanId");

  const [loading, setLoading] = useState(true);
  const [totalIssues, setTotalIssues] = useState(0);
  const [totalFixed, setTotalFixed] = useState(0);
  const [changeLog, setChangeLog] = useState([]);

  useEffect(() => {

    const fetchSummary = async () => {

      try {

        const resultRes = await axios.get(
          `http://localhost:8080/api/scan/result/${scanId}`
        );

        
        const result = resultRes.data;
        

        setTotalIssues(result.totalIssues);
       

        setChangeLog(changes);

      } catch (err) {
        console.error("Failed to load summary", err);
      }

      setLoading(false);

    };

    fetchSummary();

  }, [projectKey]);

  const remaining = Math.max(0, totalIssues - totalFixed);

  const handleDownload = () => {

    window.open(
      `http://localhost:8080/api/fix/download/${scanId}`
    );

  };

  const handleReport = () => {

    navigate(`/report/${scanId}`);

  };

  if (loading) {
    return (
      <Box className="summary-loading">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh" }}>

      <Typography variant="h4">
        Refactoring Summary
      </Typography>

      <h2>
        {totalFixed} out of {totalIssues} issues fixed
      </h2>

      <div>

        <button onClick={handleReport}>
          <FileText size={16} />
          Get Report
        </button>

        <button onClick={handleDownload}>
          <Download size={16} />
          Download Project
        </button>

      </div>

    </Box>
  );
};

export default SummaryDownload;