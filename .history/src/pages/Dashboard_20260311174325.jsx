import React, { useEffect, useState } from 'react';
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
    CircularProgress
} from '@mui/material';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

import { Bug, Shield, Activity, ExternalLink, FolderOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';


const COLORS = {
    CRITICAL: "#ef4444",
    MAJOR: "#f97316",
    MINOR: "#3b82f6",
    INFO: "#22c55e"
};

const StatCard = ({ title, value, icon, iconBg }) => (
    <Card className="stat-card" sx={{ height: '100%' }}>
        <CardContent sx={{ p: '24px !important' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 3 }}>
                <Box>
                    <Typography
                        variant="overline"
                        color="text.secondary"
                        sx={{ fontWeight: 600, letterSpacing: '0.05em' }}
                    >
                        {title}
                    </Typography>

                    <Typography
                        variant="h3"
                        sx={{ fontWeight: 700, color: '#1e293b', mt: 0.5 }}
                    >
                        {value}
                    </Typography>
                </Box>

                <Box
                    sx={{
                        p: 1.5,
                        bgcolor: iconBg || '#f1f5f9',
                        borderRadius: 3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    {icon}
                </Box>
            </Box>
        </CardContent>
    </Card>
);


const Dashboard = () => {

    const navigate = useNavigate();

    const [summary, setSummary] = useState(null);
    const [severityData, setSeverityData] = useState([]);
    const [recentProjects, setRecentProjects] = useState([]);
    const [loading, setLoading] = useState(true);


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

                const mappedSeverity = severityRes.data.map((item) => ({
                    name: item.severity,
                    value: item.count,
                    color: COLORS[item.severity] || "#64748b"
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


    const deleteProject = async (projectKey) => {

        try {

            await axios.delete(`http://localhost:9090/api/sonar/projects/${projectKey}`);

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

            {/* Header */}

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



            {/* Stats */}

            <Grid container spacing={3} sx={{ mb: 5 }}>

                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="TOTAL PROJECTS"
                        value={summary?.totalProjects || 0}
                        icon={<FolderOpen color="#0066ff" size={24} />}
                        iconBg="#eff6ff"
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="TOTAL ISSUES"
                        value={summary?.totalIssues || 0}
                        icon={<Bug color="#ef4444" size={24} />}
                        iconBg="#fef2f2"
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="TOTAL SCANS"
                        value={summary?.totalScans || 0}
                        icon={<Activity color="#f59e0b" size={24} />}
                        iconBg="#fffbeb"
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="FIXED ISSUES"
                        value={summary?.totalFixed || 0}
                        icon={<Shield color="#8b5cf6" size={24} />}
                        iconBg="#f5f3ff"
                    />
                </Grid>

            </Grid>



            {/* Charts + Table */}

            <Grid container spacing={3}>

                {/* Severity Chart */}

                <Grid item xs={12} md={4}>

                    <Card className="stat-card" sx={{ height: '100%', minHeight: 450 }}>

                        <CardContent sx={{ p: 4 }}>

                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                                Issues by Severity
                            </Typography>

                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                Distribution across all projects
                            </Typography>


                            <Box sx={{ width: '100%', height: 260 }}>

                                <ResponsiveContainer width="100%" height="100%">

                                    <BarChart
                                        data={severityData}
                                        margin={{ top: 20, right: 10, left: -10, bottom: 0 }}
                                        barSize={45}
                                    >

                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="#e2e8f0"
                                            vertical={false}
                                        />

                                        <XAxis
                                            dataKey="name"
                                            tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }}
                                            axisLine={false}
                                            tickLine={false}
                                        />

                                        <YAxis
                                            allowDecimals={false}
                                            axisLine={false}
                                            tickLine={false}
                                        />

                                        <Tooltip
                                            cursor={{ fill: "rgba(0,0,0,0.04)" }}
                                            contentStyle={{
                                                borderRadius: "10px",
                                                border: "none",
                                                boxShadow: "0 4px 14px rgba(0,0,0,0.1)"
                                            }}
                                        />

                                        <Bar
                                            dataKey="value"
                                            radius={[8, 8, 0, 0]}
                                            animationDuration={900}
                                            label={{ position: "top", fill: "#334155", fontWeight: 600 }}
                                        >

                                            {severityData.map((entry, index) => (
                                                <Cell key={index} fill={entry.color} />
                                            ))}

                                        </Bar>

                                    </BarChart>

                                </ResponsiveContainer>

                            </Box>

                        </CardContent>

                    </Card>

                </Grid>



                {/* Recent Projects */}

                <Grid item xs={12} md={8}>

                    <Card className="stat-card" sx={{ height: '100%', minHeight: 450 }}>

                        <CardContent sx={{ p: 0 }}>

                            <Box sx={{
                                p: 3,
                                borderBottom: '1px solid #f1f5f9',
                                display: 'flex',
                                justifyContent: 'space-between'
                            }}>

                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                        Recent Projects
                                    </Typography>

                                    <Typography variant="body2" color="text.secondary">
                                        Recently analyzed repositories
                                    </Typography>
                                </Box>

                            </Box>


                            <TableContainer>

                                <Table>

                                    <TableHead sx={{ bgcolor: '#f8fafc' }}>

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

                                                    <TableCell align="center">
                                                        {row.projectKey}
                                                    </TableCell>

                                                    <TableCell align="center">
                                                        {row.name}
                                                    </TableCell>

                                                    <TableCell align="center">
                                                        {row.description || "Spring Boot Project"}
                                                    </TableCell>

                                                    <TableCell align="center">

                                                        <Button
                                                            size="small"
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
                                                            onClick={() => deleteProject(row.projectKey)}
                                                        >
                                                            Delete
                                                        </Button>

                                                    </TableCell>

                                                </TableRow>

                                            ))

                                        ) : (

                                            <TableRow>

                                                <TableCell colSpan={4} align="center">

                                                    No projects found

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