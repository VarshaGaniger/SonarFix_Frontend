import React from "react";
import {
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Menu,
  MenuItem,
  CircularProgress
} from "@mui/material";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  Bug,
  AlertTriangle,
  Shield,
  TrendingUp,
  TrendingDown,
  Clock,
  Activity
} from "lucide-react";

import axios from "axios";
import "./Dashboard.css";

const StatCard = ({ title, value, subtext, icon }) => (
  <Card className="stat-card" sx={{ height: "100%" }}>
    <CardContent sx={{ p: "24px !important" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Box>
          <Typography variant="overline" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            {value}
          </Typography>
        </Box>
        <Box
          sx={{
            p: 1.5,
            bgcolor: "#f1f5f9",
            borderRadius: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          {icon}
        </Box>
      </Box>
      <Typography variant="body2" color="text.secondary">
        {subtext}
      </Typography>
    </CardContent>
  </Card>
);

const Dashboard = () => {


const { projectKey } = useParams();
  const [summary, setSummary] = React.useState(null);
  const [severityData, setSeverityData] = React.useState([]);
  const [recentScans, setRecentScans] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [filterStatus, setFilterStatus] = React.useState("All");

  const open = Boolean(anchorEl);

  React.useEffect(() => {
    if (!projectKey) return;

    setLoading(true);

    Promise.all([
      axios.get(`/api/projects/${projectKey}/dashboard/summary`),
      axios.get(`/api/projects/${projectKey}/dashboard/issues-by-severity`),
      axios.get(`/api/projects/${projectKey}/dashboard/recent-scans`)
    ])
      .then(([summaryRes, severityRes, scansRes]) => {
        setSummary(summaryRes.data);
        setSeverityData(severityRes.data);
        setRecentScans(scansRes.data);
      })
      .catch(err => {
        console.error("Dashboard load error:", err);
      })
      .finally(() => setLoading(false));
  }, [projectKey]);

const donutData = Array.isArray(severityData)
  ? severityData.map(item => ({
      name: item.severity,
      value: item.count,
      color:
        item.severity === "CRITICAL"
          ? "#f87171"
          : item.severity === "MAJOR"
          ? "#3b82f6"
          : "#34d399"
    }))
  : [];

const filteredScans = Array.isArray(recentScans)
  ? filterStatus === "All"
    ? recentScans
    : recentScans.filter(scan => scan.status === filterStatus)
  : [];
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          {projectKey} - Project Overview
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Dynamic data loaded from backend
        </Typography>
      </Box>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid item xs={12} md={3}>
          <StatCard
            title="TOTAL ISSUES"
            value={summary?.totalIssues || 0}
            subtext="Across all modules"
            icon={<Bug size={24} />}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="CRITICAL"
            value={summary?.criticalIssues || 0}
            subtext="Needs immediate attention"
            icon={<AlertTriangle size={24} />}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="CODE SMELLS"
            value={summary?.codeSmells || 0}
            subtext="Maintainability issues"
            icon={<Activity size={24} />}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="VULNERABILITIES"
            value={summary?.vulnerabilities || 0}
            subtext="Security findings"
            icon={<Shield size={24} />}
          />
        </Grid>
      </Grid>

      {/* Chart + Table */}
      <Grid container spacing={3}>
        {/* Chart */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: 450 }}>
            <CardContent>
              <Typography variant="h6">Issues by Severity</Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={donutData}
                      innerRadius={70}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {donutData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Table */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: 450 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Recent Scans
              </Typography>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Scan ID</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredScans.map(row => (
                      <TableRow key={row.id}>
                        <TableCell>{row.id}</TableCell>
                        <TableCell>{row.status}</TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            onClick={() =>
                              navigate(
                                `/scan-status/${row.id}?project=${projectKey}`
                              )
                            }
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
    </Box>
  );
};

export default Dashboard;