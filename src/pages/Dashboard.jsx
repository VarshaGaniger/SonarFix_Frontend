import React, { useEffect, useState } from 'react';
import {
  Grid, Typography, Box, Card, CardContent,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, CircularProgress
} from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Bug, AlertTriangle, Shield, Activity } from 'lucide-react';
import axios from 'axios';
import './Dashboard.css';

const COLORS = {
  CRITICAL: '#ef4444',
  MAJOR: '#3b82f6',
  MINOR: '#22c55e',
  UNKNOWN: '#9ca3af'
};

const Dashboard = () => {

  const [summary, setSummary] = useState(null);
  const [severityData, setSeverityData] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [summaryRes, severityRes, projectsRes] = await Promise.all([
          axios.get("http://localhost:8080/api/dashboard/summary"),
          axios.get("http://localhost:8080/api/dashboard/issues-by-severity"),
          axios.get("http://localhost:8080/api/dashboard/recent-projects")
        ]);

        setSummary(summaryRes.data);

        const formattedSeverity = severityRes.data.map(s => ({
          name: s.severity,
          value: s.count,
          color: COLORS[s.severity] || COLORS.UNKNOWN
        }));

        setSeverityData(formattedSeverity);
        setRecentProjects(projectsRes.data);

      } catch (err) {
        console.error("Dashboard load failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  const totalIssues = severityData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Box>

      {/* HEADER */}
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
        Project Overview
      </Typography>

      {/* SUMMARY CARDS */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid item xs={12} md={3}>
          <Card><CardContent>
            <Bug size={22} />
            <Typography>Total Issues</Typography>
            <Typography variant="h4">{summary?.totalIssues || 0}</Typography>
          </CardContent></Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card><CardContent>
            <Activity size={22} />
            <Typography>Total Scans</Typography>
            <Typography variant="h4">{summary?.totalScans || 0}</Typography>
          </CardContent></Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card><CardContent>
            <Shield size={22} />
            <Typography>Total Projects</Typography>
            <Typography variant="h4">{summary?.totalProjects || 0}</Typography>
          </CardContent></Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card><CardContent>
            <AlertTriangle size={22} />
            <Typography>AutoFix Applied</Typography>
            <Typography variant="h4">{summary?.totalFixed || 0}</Typography>
          </CardContent></Card>
        </Grid>
      </Grid>

      {/* DONUT + TABLE */}
      <Grid container spacing={3} alignItems="center" justifyContent="center">

        {/* CENTERED DONUT */}
        <Grid item xs={12} md={7} sx={{ display: 'flex', justifyContent: 'center' }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>

              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Issues by Severity
              </Typography>

              <Box
                sx={{
                  width: 380,
                  height: 380,
                  position: 'relative',
                  margin: '0 auto'
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={severityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={95}
                      outerRadius={150}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {severityData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                {/* CENTER TEXT */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center'
                  }}
                >
                  <Typography variant="h4" sx={{ fontWeight: 800 }}>
                    {totalIssues}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                    TOTAL
                  </Typography>
                </Box>
              </Box>

            </CardContent>
          </Card>
        </Grid>

        {/* RECENT PROJECTS */}
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Recent Projects
              </Typography>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Project Key</TableCell>
                      <TableCell>Project Name</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentProjects.map((proj, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{proj.projectKey}</TableCell>
                        <TableCell>{proj.name || "Unnamed"}</TableCell>
                        <TableCell>{proj.status || "COMPLETED"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

            </CardContent>
          </Card>
        </Grid>

      </Grid>

    </Box>
  );
};

export default Dashboard;