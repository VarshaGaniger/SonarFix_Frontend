import React, { useEffect, useState } from 'react';

import { Grid, Typography, Box, Card, CardContent, Button, Table, TableBody, TableCell, TableContainer, TableHead,
TableRow, LinearProgress, Avatar, Menu, MenuItem, CircularProgress } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Bug, Shield, Activity, ExternalLink, FolderOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

const COLORS = ['#f87171', '#3b82f6', '#34d399', '#f59e0b', '#8b5cf6'];
const StatCard = ({ title, value, icon, iconBg }) => (
<Card className="stat-card" sx={{ height: '100%' }}>
    <CardContent sx={{ p: '24px !important' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' ,  gap: 3}}>
            <Box>
                <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: '0.05em' }}>
                    {title}
                </Typography>

                <Typography variant="h3" sx={{ fontWeight: 700, color: '#1e293b', mt: 0.5 }}>
                    {value}
                </Typography>
            </Box>

            <Box className="icon-box" sx={{
                        p: 1.5,
                        bgcolor: iconBg || '#f1f5f9',
                        borderRadius: 3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                {icon}
            </Box>
        </Box>
    </CardContent>
</Card>
);

const Dashboard = () => {
const navigate = useNavigate();
const [anchorEl, setAnchorEl] = useState(null);
const [filterStatus, setFilterStatus] = useState('All');
const [summary, setSummary] = useState(null);
const [severityData, setSeverityData] = useState([]);
const [recentProjects, setRecentProjects] = useState([]);
const [loading, setLoading] = useState(true);

const open = Boolean(anchorEl);

useEffect(() => {
const fetchDashboardData = async () => {
try {
setLoading(true);
const [summaryRes, severityRes, projectsRes] = await Promise.all([
axios.get('http://localhost:9090/api/dashboard/summary'),
axios.get('http://localhost:9090/api/dashboard/issues-by-severity'),
axios.get('http://localhost:9090/api/sonar/projects')
]);

setSummary(summaryRes.data);

// Map severity data for chart
const mappedSeverity = severityRes.data.map((item, index) => ({
name: item.severity,
value: item.count,
color: COLORS[index % COLORS.length]
}));
setSeverityData(mappedSeverity);

setRecentProjects(projectsRes.data);
} catch (error) {
console.error("Error fetching dashboard data:", error);
} finally {
setLoading(false);
}
};

fetchDashboardData();
}, []);

const handleFilterClick = (event) => {
setAnchorEl(event.currentTarget);
};

const handleFilterClose = () => {
setAnchorEl(null);
};

const handleFilterSelect = (status) => {
setFilterStatus(status);
handleFilterClose();
};

const deleteProject = async (projectKey) => {
try {
await axios.delete(`http://localhost:9090/api/sonar/projects/${projectKey}`);

// remove project from UI instantly
setRecentProjects(prev =>
prev.filter(project => project.projectKey !== projectKey)
);

} catch (error) {
console.error("Error deleting project:", error);
}
};

if (loading) {
return (
<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
    <CircularProgress />
</Box>
);
}

return (
<Box sx={{ p: 0, bgcolor: 'transparent', minHeight: '100vh' }}>

    {/* Header Section */}
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5 }}>
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
                Project Overview
            </Typography>
            <Typography variant="body1" color="text.secondary">
                Real-time visualization of your code quality
            </Typography>
        </Box>

    </Box>

    {/* Stats Cards */}
    <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid item xs={12} sm={6} md={3}>
            <StatCard title="TOTAL PROJECTS" value={summary?.totalProjects || 0} icon={<FolderOpen color="#0066ff"
                size={24} />}
            iconBg="#eff6ff"
            />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
            <StatCard title="TOTAL ISSUES" value={summary?.totalIssues || 0} icon={<Bug color="#ef4444" size={24} />}
            iconBg="#fef2f2"
            />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
            <StatCard title="TOTAL SCANS" value={summary?.totalScans || 0} icon={<Activity color="#f59e0b" size={24} />}
            iconBg="#fffbeb"
            />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
            <StatCard title="FIXED ISSUES" value={summary?.totalFixed || 0} icon={<Shield color="#8b5cf6" size={24} />}
            iconBg="#f5f3ff"
            />
        </Grid>
    </Grid>

    {/* Main Content: Charts & Table */}
<Grid container spacing={3}>

  {/* Issues by Severity Chart */}
  <Grid item xs={12} md={4}>
    <Card className="stat-card" sx={{ height: "100%", minHeight: 450 }}>
      <CardContent
        sx={{
          p: 4,
          display: "flex",
          flexDirection: "column",
          height: "100%"
        }}
      >
        <Box sx={{ width: "100%", textAlign: "center", mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#1e293b" }}>
            Issues by Severity
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Distribution across all projects
          </Typography>
        </Box>

        <Box sx={{ width: "100%", height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={severityData} barSize={60}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />

              <Bar dataKey="value">
                {severityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>

        {/* Legend */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 4,
            mt: "auto"
          }}
        >
          {severityData.map((item) => (
            <Box
              key={item.name}
              sx={{ display: "flex", alignItems: "center", gap: 4 }}
            >
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  bgcolor: item.color
                }}
              />

              <Typography
                variant="caption"
                sx={{ fontWeight: 600, color: "#475569" }}
              >
                {item.name} ({item.value})
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  </Grid>

  {/* Recent Projects Table */}
  <Grid item xs={12} md={8}>
    <Card className="stat-card" sx={{ height: "100%", minHeight: 450 }}>
      <CardContent sx={{ p: 0 }}>
        <Box
          sx={{
            p: 3,
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#1e293b" }}>
              Recent Projects
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Recently analyzed repositories
            </Typography>
          </Box>
        </Box>

        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ bgcolor: "#f8fafc" }}>
              <TableRow>
                <TableCell align="center" sx={{ fontWeight: 700 }}>
                  PROJECT KEY
                </TableCell>

                <TableCell align="center" sx={{ fontWeight: 700 }}>
                  PROJECT NAME
                </TableCell>

                <TableCell align="center" sx={{ fontWeight: 700 }}>
                  DESCRIPTION
                </TableCell>

                <TableCell align="center" sx={{ fontWeight: 700 }}>
                  ACTION
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {recentProjects.length > 0 ? (
                recentProjects.map((row) => (
                  <TableRow key={row.projectKey} hover>
                    <TableCell align="center">{row.projectKey}</TableCell>

                    <TableCell align="center">{row.name}</TableCell>

                    <TableCell align="center">
                      {row.description || "Spring Boot Project"}
                    </TableCell>

                    <TableCell align="center">
                      <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
                        <Button
                          size="small"
                          sx={{ textTransform: "none", fontWeight: 600 }}
                          startIcon={<ExternalLink size={14} />}
                          onClick={() => {
                            localStorage.setItem("projectKey", row.projectKey);
                            navigate(`/projects/${row.projectKey}/issues`);
                          }}
                        >
                          View Issues
                        </Button>

                        <Button
                          size="small"
                          color="error"
                          sx={{ textTransform: "none", fontWeight: 600 }}
                          onClick={() => deleteProject(row.projectKey)}
                        >
                          Delete
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">
                      No projects found. Start a new analysis to see results.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
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