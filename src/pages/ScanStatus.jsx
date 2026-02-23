import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, LinearProgress, Grid, Card, CardContent, Avatar, Button, IconButton, Divider } from '@mui/material';
import { Play, Pause, XCircle, FileText, Code, ShieldAlert, Terminal, ChevronRight, Activity, FolderOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './ScanStatus.css';

const ScanStatus = () => {
    const navigate = useNavigate();
    const [progress, setProgress] = useState(65);

    const handleCancel = () => {
        // In a real application, you would also trigger an API call to cancel the scan
        navigate('/dashboard');
    };

    const systemLogs = [
        { time: '10:42:15', type: 'INFO', message: 'Parsing Abstract Syntax Tree...', color: '#6366f1' },
        { time: '10:42:16', type: 'INFO', message: 'Loading rule set:', detail: 'spring-security-audit-v2', color: '#10b981' },
        { time: '10:42:18', type: 'WARN', message: 'Found deprecated method usage in Controller...', color: '#f59e0b' },
        { time: '10:42:19', type: 'ACTIVE', message: 'Checking dependency graph for transitive vulnerabilities...', color: '#6366f1' },
    ];

    return (
        <Box className="scan-status-page">
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#0f172a', mb: 0.5 }}>
                        Scanning Project: E-Commerce Backend
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#64748b' }}>
                        Started by <Typography component="span" sx={{ fontWeight: 600, color: '#0f172a' }}>jenkins-ci-bot</Typography> 2 minutes ago
                    </Typography>
                </Box>
                <Box className="status-chip-box">
                    <Box sx={{ width: 8, height: 8, bgcolor: '#2563eb', borderRadius: '50%', mr: 1.5, animation: 'pulse 2s infinite' }} />
                    <Typography variant="subtitle2" sx={{ color: '#2563eb', fontWeight: 600 }}>
                        Live Scan in Progress
                    </Typography>
                </Box>
            </Box>

            <Box className="progress-section">
                <Box className="circular-progress-container">
                    <svg className="circular-progress-svg" width="220" height="220" viewBox="0 0 220 220">
                        <circle className="progress-bg" cx="110" cy="110" r="90" />
                        <circle
                            className="progress-bar"
                            cx="110" cy="110" r="90"
                            style={{ strokeDashoffset: `calc(565 - (565 * ${progress}) / 100)` }}
                        />
                    </svg>
                    <Box className="progress-text-overlay">
                        <Typography variant="h2" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                            {progress}%
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: '#94a3b8', mt: 0.5, letterSpacing: '0.05em' }}>
                            COMPLETED
                        </Typography>
                    </Box>
                </Box>

                <Box className="active-task-card">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, justifyContent: 'center' }}>
                        <Activity className="spinning" size={20} color="#2563eb" />
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
                            Analyzing Spring Boot dependencies...
                        </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#64748b', textAlign: 'center' }}>
                        Scanning <code className="code-inline">pom.xml</code> and verifying auto-configuration settings for potential vulnerabilities and code smells.
                    </Typography>
                </Box>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                    <Card className="metric-card">
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Box className="metric-icon-box" sx={{ bgcolor: '#eff6ff' }}>
                                    <FolderOpen size={20} color="#2563eb" />
                                </Box>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: '#94a3b8', bgcolor: '#f8fafc', px: 1, borderRadius: 1 }}>
                                    LIVE
                                </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>Files Scanned</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>1,240</Typography>
                            <LinearProgress variant="determinate" value={70} sx={{ height: 4, borderRadius: 2, bgcolor: '#f1f5f9', '& .MuiLinearProgress-bar': { bgcolor: '#2563eb' } }} />
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card className="metric-card">
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Box className="metric-icon-box" sx={{ bgcolor: '#f5f3ff' }}>
                                    <Code size={20} color="#6366f1" />
                                </Box>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: '#94a3b8', bgcolor: '#f8fafc', px: 1, borderRadius: 1 }}>
                                    LIVE
                                </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>Lines of Code</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>85,402</Typography>
                            <LinearProgress variant="determinate" value={60} sx={{ height: 4, borderRadius: 2, bgcolor: '#f1f5f9', '& .MuiLinearProgress-bar': { bgcolor: '#6366f1' } }} />
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card className="metric-card">
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Box className="metric-icon-box" sx={{ bgcolor: '#fff7ed' }}>
                                    <ShieldAlert size={20} color="#f59e0b" />
                                </Box>
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#ef4444' }} />
                                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#f59e0b' }} />
                                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#fbbf24' }} />
                                </Box>
                            </Box>
                            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>Potential Issues</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>12</Typography>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 600 }}>2 High</Typography>
                                <Typography variant="caption" sx={{ color: '#f59e0b', fontWeight: 600 }}>4 Med</Typography>
                                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>6 Low</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Box className="system-log-section">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 2, borderBottom: '1px solid #f1f5f9' }}>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#cbd5e1' }} />
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#cbd5e1' }} />
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#cbd5e1' }} />
                    </Box>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#94a3b8', letterSpacing: '0.1em' }}>
                        SYSTEM LOG
                    </Typography>
                </Box>
                <Box sx={{ p: 2, bgcolor: '#f8fafc', overflow: 'auto', maxHeight: '200px' }}>
                    {systemLogs.map((log, idx) => (
                        <Box key={idx} sx={{ display: 'flex', gap: 2, mb: 0.5, fontFamily: 'monospace', fontSize: '13px' }}>
                            <Typography sx={{ color: '#94a3b8', fontSize: 'inherit', fontFamily: 'inherit' }}>{log.time}</Typography>
                            <Typography sx={{ color: log.color, fontWeight: 700, minWidth: 60, fontSize: 'inherit', fontFamily: 'inherit' }}>[{log.type}]</Typography>
                            <Typography sx={{ color: '#475569', fontSize: 'inherit', fontFamily: 'inherit' }}>
                                {log.message} {log.detail && <Typography component="span" sx={{ color: '#10b981', fontSize: 'inherit', fontFamily: 'inherit' }}>{log.detail}</Typography>}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Button
                    variant="outlined"
                    startIcon={<XCircle size={18} />}
                    onClick={handleCancel}
                    sx={{
                        borderRadius: 2,
                        px: 4,
                        py: 1,
                        textTransform: 'none',
                        borderColor: '#e2e8f0',
                        color: '#475569',
                        fontWeight: 600,
                        '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' }
                    }}
                >
                    Cancel Scan
                </Button>
            </Box>
        </Box>
    );
};

export default ScanStatus;
