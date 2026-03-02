import React, { useEffect, useState } from 'react';
import { Grid, Paper, Typography, Box, Card, CardContent, Button, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, LinearProgress, Avatar, Menu, MenuItem, CircularProgress } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Bug, AlertTriangle, Shield, Play, TrendingUp, TrendingDown, Clock, Activity, ExternalLink, FolderOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

const COLORS = ['#f87171', '#3b82f6', '#34d399', '#f59e0b', '#8b5cf6'];

const StatCard = ({ title, value, subtext, icon, trend, trendValue, iconBg }) => (
    <Card className="stat-card" sx={{ height: '100%' }}>
        <CardContent sx={{ p: '24px !important' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                    <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: '0.05em' }}>
                        {title}
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: '#1e293b', mt: 0.5 }}>
                        {value}
                    </Typography>
                </Box>
                <Box sx={{
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <span className={`trend-badge ${trend}`}>
                    {trend === 'trend-up-success' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {trendValue}
                </span>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                    {subtext}
                </Typography>
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
                    axios.get('http://localhost:8080/api/dashboard/summary'),
                    axios.get('http://localhost:8080/api/dashboard/issues-by-severity'),
                    axios.get('http://localhost:8080/api/sonar/projects')
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
                <Button
                    variant="contained"
                    startIcon={<Play size={18} />}
                    onClick={() => navigate('/upload')}
                >
                    New Analysis
                </Button>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 5 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="TOTAL PROJECTS"
                        value={summary?.totalProjects || 0}
                        subtext="active repositories"
                        trendValue="0%"
                        trend="trend-up-success"
                        icon={<FolderOpen color="#0066ff" size={24} />}
                        iconBg="#eff6ff"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="TOTAL ISSUES"
                        value={summary?.totalIssues || 0}
                        subtext="detected across code"
                        trendValue="0%"
                        trend="trend-up-warning"
                        icon={<Bug color="#ef4444" size={24} />}
                        iconBg="#fef2f2"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="TOTAL SCANS"
                        value={summary?.totalScans || 0}
                        subtext="analysis runs"
                        trendValue="0%"
                        trend="trend-up-success"
                        icon={<Activity color="#f59e0b" size={24} />}
                        iconBg="#fffbeb"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="FIXED ISSUES"
                        value={summary?.totalFixed || 0}
                        subtext="successfully remediated"
                        trendValue="0%"
                        trend="trend-up-success"
                        icon={<Shield color="#8b5cf6" size={24} />}
                        iconBg="#f5f3ff"
                    />
                </Grid>
            </Grid>

            {/* Main Content: Charts & Table */}
            <Grid container spacing={3}>
                {/* Issues by Severity Chart */}
                <Grid item xs={12} md={4}>
                    <Card className="stat-card" sx={{ height: '100%', minHeight: 450 }}>
                        <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                            <Box sx={{ width: '100%', textAlign: 'center', mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                                    Issues by Severity
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Distribution across all projects
                                </Typography>
                            </Box>

                            <Box sx={{ width: '100%', height: 260, position: 'relative' }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie
                                            data={severityData}
                                            innerRadius={80}
                                            outerRadius={110}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {severityData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                {/* Center text */}
                                <Box sx={{
                                    position: 'absolute', top: '50%', left: '50%',
                                    transform: 'translate(-50%, -50%)', textAlign: 'center'
                                }}>
                                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b' }}>
                                        {summary?.totalIssues || 0}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, letterSpacing: '0.05em' }}>
                                        TOTAL
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2, mt: 'auto' }}>
                                {severityData.map((item) => (
                                    <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.color }} />
                                        <Typography variant="caption" sx={{ fontWeight: 600, color: '#475569' }}>
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
                    <Card className="stat-card" sx={{ height: '100%', minHeight: 450 }}>
                        <CardContent sx={{ p: 0 }}>
                            <Box sx={{ p: 3, borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                                        Recent Projects
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Recently analyzed repositories
                                    </Typography>
                                </Box>
                            </Box>

                            <TableContainer>
                                <Table sx={{ minWidth: 650 }} aria-label="recent projects table">
                                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                                        <TableRow>
                                            <TableCell sx={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.05em' }}>PROJECT KEY</TableCell>
                                            <TableCell sx={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.05em' }}>DESCRIPTION</TableCell>
                                            <TableCell align="right" sx={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.05em' }}>ACTION</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {recentProjects.length > 0 ? (
                                            recentProjects.map((row) => (
                                                <TableRow key={row.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                    <TableCell component="th" scope="row" sx={{ fontWeight: 600, color: '#1e293b' }}>
                                                        {row.projectKey}
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#64748b' }}>
                                                        {row.description || "Spring Boot Project"}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Button
                                                            size="small"
                                                            sx={{ textTransform: 'none', fontWeight: 600 }}
                                                            startIcon={<ExternalLink size={14} />}
                                                           onClick={() => navigate(`/projects/${row.projectKey}/issues`)}
                                                        >
                                                            View Issues
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={3} align="center" sx={{ py: 8 }}>
                                                    <Typography color="text.secondary">No projects found. Start a new analysis to see results.</Typography>
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
