import React, { useEffect, useState } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  LinearProgress
} from "@mui/material";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";

import { Bug, Shield, FolderOpen, Activity, Play } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import "./Dashboard.css";

const COLORS = ["#ef4444", "#3b82f6", "#22c55e", "#f59e0b"];

const StatCard = ({ title, value, icon, iconBg }) => (
  <Card className="stat-card">
    <CardContent>
      <Box display="flex" justifyContent="space-between">
        <Box>
          <Typography variant="overline">{title}</Typography>
          <Typography variant="h3">{value}</Typography>
        </Box>

        <Box className="icon-box" sx={{ bgcolor: iconBg }}>
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export default function Dashboard() {

  const navigate = useNavigate();

  const [summary,setSummary] = useState(null);
  const [severityData,setSeverityData] = useState([]);
  const [projects,setProjects] = useState([]);
  const [loading,setLoading] = useState(true);

  useEffect(()=>{

    const loadData = async ()=>{

      try{

        const [summaryRes,severityRes,projectsRes] = await Promise.all([
          axios.get("http://localhost:9090/api/dashboard/summary"),
          axios.get("http://localhost:9090/api/dashboard/issues-by-severity"),
          axios.get("http://localhost:9090/api/sonar/projects"),
        ]);

        setSummary(summaryRes.data);

        const sev = severityRes.data.map((s,i)=>({
          name:s.severity,
          value:s.count,
          color:COLORS[i%COLORS.length]
        }));

        setSeverityData(sev);
        setProjects(projectsRes.data);
    

      }catch(err){
        console.error(err);
      }

      setLoading(false);
    };

    loadData();

  },[]);

  if(loading){
    return(
      <Box sx={{display:"flex",justifyContent:"center",mt:10}}>
        <CircularProgress/>
      </Box>
    );
  }

  const healthScore = Math.max(
    0,
    100 - (summary.totalIssues*2)
  );

  const autofixRate = summary.totalIssues === 0
    ? 0
    : Math.round((summary.totalFixed/summary.totalIssues)*100);

  return(

    <Box sx={{p:4}}>

      {/* HEADER */}

      <Box mb={4}>
        <Typography variant="h4" fontWeight={800}>
          Code Quality Dashboard
        </Typography>

        <Typography color="text.secondary">
          Real-time project analysis
        </Typography>
      </Box>

      {/* STAT CARDS */}

      <Grid container spacing={3} mb={4}>

        <Grid item xs={12} md={3}>
          <StatCard
            title="TOTAL PROJECTS"
            value={summary.totalProjects}
            icon={<FolderOpen size={24}/>}
            iconBg="#eff6ff"
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <StatCard
            title="TOTAL ISSUES"
            value={summary.totalIssues}
            icon={<Bug size={24}/>}
            iconBg="#fef2f2"
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <StatCard
            title="FIXED ISSUES"
            value={summary.totalFixed}
            icon={<Shield size={24}/>}
            iconBg="#ecfdf5"
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <StatCard
            title="CODE HEALTH"
            value={`${healthScore}%`}
            icon={<Activity size={24}/>}
            iconBg="#f0fdf4"
          />
        </Grid>

      </Grid>

      {/* CHARTS */}

      <Grid container spacing={3}>

        {/* SEVERITY PIE */}

        <Grid item xs={12} md={4}>
          <Card className="stat-card">

            <CardContent>

              <Typography variant="h6" mb={2}>
                Issues by Severity
              </Typography>

              <ResponsiveContainer width="100%" height={260}>
                <PieChart>

                  <Pie
                    data={severityData}
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {severityData.map((entry,i)=>(
                      <Cell key={i} fill={entry.color}/>
                    ))}
                  </Pie>

                  <Tooltip/>

                </PieChart>
              </ResponsiveContainer>

            </CardContent>

          </Card>
        </Grid>

        {/* ISSUE TREND */}

        <Grid item xs={12} md={8}>
          <Card className="stat-card">

            <CardContent>

              <Typography variant="h6" mb={2}>
                Issue Trend
              </Typography>

              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={trendData}>

                  <CartesianGrid strokeDasharray="3 3"/>

                  <XAxis dataKey="scan"/>

                  <YAxis/>

                  <Tooltip/>

                  <Line
                    type="monotone"
                    dataKey="issues"
                    stroke="#2563eb"
                    strokeWidth={3}
                  />

                </LineChart>
              </ResponsiveContainer>

            </CardContent>

          </Card>
        </Grid>

      </Grid>

      {/* AUTOFIX */}

      <Grid container spacing={3} mt={1}>

        <Grid item xs={12} md={4}>

          <Card className="stat-card">

            <CardContent>

              <Typography variant="h6">
                AutoFix Efficiency
              </Typography>

              <Typography variant="h3" mt={1}>
                {autofixRate}%
              </Typography>

              <Box mt={2}>
                <LinearProgress
                  variant="determinate"
                  value={autofixRate}
                />
              </Box>

              <Typography variant="body2" mt={2}>
                {summary.totalFixed} issues automatically fixed
              </Typography>

            </CardContent>

          </Card>

        </Grid>

        {/* RECENT PROJECTS */}

        <Grid item xs={12} md={8}>

          <Card className="stat-card">

            <CardContent>

              <Typography variant="h6" mb={2}>
                Recent Projects
              </Typography>

              <TableContainer>

                <Table>

                  <TableHead>
                    <TableRow>
                      <TableCell>Project</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>

                    {projects.map(p=>(
                      <TableRow key={p.projectKey}>

                        <TableCell>
                          {p.projectKey}
                        </TableCell>

                        <TableCell>
                          {p.description || "Spring Boot project"}
                        </TableCell>

                        <TableCell align="right">

                          <Button
                            size="small"
                            onClick={()=>navigate(`/projects/${p.projectKey}/issues`)}
                          >
                            View
                          </Button>

                        </TableCell>

                      </TableRow>
                    ))}

                  </TableBody>

                </Table>

              </TableContainer>

            </CardContent>

          </Card>

        </Grid>

      </Grid>

      {/* QUICK ACTION */}

      <Box mt={5}>

        <Button
          startIcon={<Play size={18}/>}
          variant="contained"
          onClick={()=>navigate("/scan")}
        >
          Start New Scan
        </Button>

      </Box>

    </Box>

  );

}