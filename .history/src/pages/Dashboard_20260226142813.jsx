import React from 'react';
import { Grid, Paper, Typography, Box, Card, CardContent, Button, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, LinearProgress, Avatar, Menu, MenuItem } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Bug, AlertTriangle, Shield, Play, TrendingUp, TrendingDown, Clock, Activity } from 'lucide-react';
import './Dashboard.css';
import { useLocation, useNavigate } from "react-router-dom";
const donutData = [
    { name: 'Critical', value: 360, color: '#f87171' }, // Red
    { name: 'Major', value: 480, color: '#3b82f6' },   // Blue
    { name: 'Minor', value: 400, color: '#34d399' },   // Green
];

const recentScans = [
    { id: '#SC-8291', branch: 'feature/auth-v2', initiator: 'J. Doe', duration: '2m 14s', status: 'Passed', date: '2 mins ago' },
    { id: '#SC-8290', branch: 'hotfix/payment-retry', initiator: 'S. Smith', duration: '1m 45s', status: 'Failed', date: '45 mins ago' },
    { id: '#SC-8289', branch: 'main', initiator: 'Auto-Trigger', duration: '3m 10s', status: 'Passed', date: '2 hours ago' },
    { id: '#SC-8288', branch: 'feature/dashboard-ui', initiator: 'A. Morgan', duration: '2m 55s', status: 'Running', date: 'Just now' },
];

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
    const location = useLocation();
const navigate = useNavigate();

const projectKey = location.state?.projectKey;
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [filterStatus, setFilterStatus] = React.useState('All');
    const open = Boolean(anchorEl);

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

    const filteredScans = filterStatus === 'All'
        ? recentScans
        : recentScans.filter(scan => scan.status === filterStatus);

    return (
        <Box sx={{ p: 0, bgcolor: 'transparent', minHeight: '100vh' }}>

            {/* Header Section */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
                        Project Overview
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Last scan completed 15 minutes ago
                    </Typography>
                </Box>

            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 5 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="TOTAL ISSUES"
                        value="1,240"
                        subtext="from last week"
                        trendValue="5%"
                        trend="trend-up-success"
                        icon={<Bug color="#0066ff" size={24} />}
                        iconBg="#eff6ff"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="CRITICAL ISSUES"
                        value="12"
                        subtext="requires attention"
                        trendValue="2%"
                        trend="trend-up-warning" // Warning because critical issues went up
                        icon={<AlertTriangle color="#ef4444" size={24} />}
                        iconBg="#fef2f2"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="CODE SMELLS"
                        value="84"
                        subtext="improvement"
                        trendValue="12%"
                        trend="trend-up-success"
                        icon={<Activity color="#f59e0b" size={24} />}
                        iconBg="#fffbeb"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="VULNERABILITIES"
                        value="3"
                        subtext="secure status"
                        trendValue="1%"
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
                                    Distribution across codebase
                                </Typography>
                            </Box>

                            <Box sx={{ width: '100%', height: 260, position: 'relative' }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie
                                            data={donutData}
                                            innerRadius={80}
                                            outerRadius={110}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {donutData.map((entry, index) => (
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
                                        1,240
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, letterSpacing: '0.05em' }}>
                                        TOTAL
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', gap: 3, mt: 'auto' }}>
                                {donutData.map((item) => (
                                    <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.color }} />
                                        <Typography variant="caption" sx={{ fontWeight: 600, color: '#475569' }}>
                                            {item.name}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Recent Scans Table */}
                <Grid item xs={12} md={8}>
                    <Card className="stat-card" sx={{ height: '100%', minHeight: 450 }}>
                        <CardContent sx={{ p: 0 }}>
                            <Box sx={{ p: 3, borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                                        Recent Scans
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        History of automated analysis runs
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={handleFilterClick}
                                        sx={{ color: '#64748b', borderColor: '#e2e8f0', textTransform: 'none' }}
                                    >
                                        Filter: {filterStatus}
                                    </Button>
                                    <Menu
                                        anchorEl={anchorEl}
                                        open={open}
                                        onClose={handleFilterClose}
                                        MenuListProps={{
                                            'aria-labelledby': 'basic-button',
                                        }}
                                    >
                                        <MenuItem onClick={() => handleFilterSelect('All')}>All</MenuItem>
                                        <MenuItem onClick={() => handleFilterSelect('Passed')}>Passed</MenuItem>
                                        <MenuItem onClick={() => handleFilterSelect('Failed')}>Failed</MenuItem>
                                        <MenuItem onClick={() => handleFilterSelect('Running')}>Running</MenuItem>
                                    </Menu>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => {
                                            const headers = ["Scan ID", "Branch", "Initiator", "Duration", "Status", "Date"];
                                            const csvContent = [
                                                headers.join(","),
                                                ...filteredScans.map(row =>
                                                    [row.id, row.branch, row.initiator, row.duration, row.status, row.date].join(",")
                                                )
                                            ].join("\n");

                                            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                                            const link = document.createElement("a");
                                            const url = URL.createObjectURL(blob);
                                            link.setAttribute("href", url);
                                            link.setAttribute("download", "recent_scans.csv");
                                            link.style.visibility = 'hidden';
                                            document.body.appendChild(link);
                                            link.click();
                                            document.body.removeChild(link);
                                        }}
                                        sx={{ color: '#64748b', borderColor: '#e2e8f0', textTransform: 'none' }}
                                    >
                                        Export
                                    </Button>
                                </Box>
                            </Box>

                            <TableContainer>
                                <Table sx={{ minWidth: 650 }} aria-label="recent scans table">
                                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                                        <TableRow>
                                            <TableCell sx={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.05em' }}>SCAN ID</TableCell>
                                            <TableCell sx={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.05em' }}>BRANCH</TableCell>
                                            <TableCell sx={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.05em' }}>INITIATOR</TableCell>
                                            <TableCell sx={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.05em' }}>DURATION</TableCell>
                                            <TableCell sx={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.05em' }}>STATUS</TableCell>
                                            <TableCell align="right" sx={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.05em' }}>ACTION</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredScans.map((row) => (
                                            <TableRow key={row.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                <TableCell component="th" scope="row" sx={{ fontWeight: 600, color: '#1e293b' }}>
                                                    {row.id}
                                                </TableCell>
                                                <TableCell>
                                                    <span className="code-badge">{row.branch}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', bgcolor: '#8b5cf6' }}>
                                                            {row.initiator.charAt(0)}
                                                        </Avatar>
                                                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#475569' }}>
                                                            {row.initiator}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell sx={{ color: '#64748b' }}>{row.duration}</TableCell>
                                                <TableCell>
                                                    <span className={`status-badge ${row.status === 'Passed' ? 'status-passed' :
                                                        row.status === 'Failed' ? 'status-failed' : 'status-running'
                                                        }`}>
                                                        {row.status === 'Running' ? (
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                Running <Clock size={12} />
                                                            </Box>
                                                        ) : (
                                                            row.status === 'Passed' ? '● Passed' : '● Failed'
                                                        )}
                                                    </span>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Button size="small" sx={{ textTransform: 'none', fontWeight: 600 }}>
                                                        View Report
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

// Fix for FileCode import inside the component used in JSX if needed, but not used in new design.
// Keeping clean export.
export default Dashboard;
