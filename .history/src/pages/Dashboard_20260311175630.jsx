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

    
</Box>
);
};

export default Dashboard;