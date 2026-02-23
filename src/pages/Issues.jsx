import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Checkbox, IconButton, Button, TextField,
    Breadcrumbs, Link, Chip, Pagination, Snackbar, Alert
} from '@mui/material';
import {
    Search,
    ChevronRight,
    Wand2,
    AlertCircle,
    Slash,
    Circle,
    XCircle,
    MinusCircle,
    ArrowRight
} from 'lucide-react';
import './Issues.css';

const Issues = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [selectedItems, setSelectedItems] = useState([2, 4]);
    const [filter, setFilter] = useState('All');
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

    const issuesData = [
        {
            id: 1,
            severity: 'Critical',
            fileName: 'PaymentController.java',
            path: 'src/main/java/com/fintech/api/controllers/',
            line: 42,
            title: 'SQL Injection Vulnerability',
            description: 'Detected unparameterized query construction using string concat...'
        },
        {
            id: 2,
            severity: 'Critical',
            fileName: 'AuthService.java',
            path: 'src/main/java/com/fintech/api/services/',
            line: 108,
            title: 'Hardcoded Credentials',
            description: 'Secret key found in source code. Move to environment variables.'
        },
        {
            id: 3,
            severity: 'Major',
            fileName: 'TransactionRepo.java',
            path: 'src/main/java/com/fintech/db/repo/',
            line: 15,
            title: 'N+1 Query Problem',
            description: 'Lazy loading inside a loop detected. Consider using JOIN fetch.'
        },
        {
            id: 4,
            severity: 'Major',
            fileName: 'LoggerConfig.java',
            path: 'src/main/java/com/fintech/config/',
            line: 88,
            title: 'Sensitive Data Exposure in Log',
            description: 'Logging user passwords in plain text is prohibited.'
        },
        {
            id: 5,
            severity: 'Minor',
            fileName: 'DtoMapper.java',
            path: 'src/main/java/com/fintech/utils/',
            line: 23,
            title: 'Unused Import',
            description: 'Remove unused import `java.util.Date`.'
        },
        {
            id: 6,
            severity: 'Minor',
            fileName: 'UserEntity.java',
            path: 'src/main/java/com/fintech/db/entities/',
            line: 204,
            title: 'Magic Number',
            description: 'Replace magic number `86400` with a named constant.'
        }
    ];

    useEffect(() => {
        if (location.state?.notification) {
            setNotification({ open: true, ...location.state.notification });
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const handleAutoFix = () => {
        if (selectedItems.length === 0) return;

        const selectedFiles = selectedItems.map(id => {
            const issue = issuesData.find(i => i.id === id);
            return issue ? issue.fileName : null;
        }).filter(name => name !== null);

        navigate('/code-viewer', {
            state: {
                issueQueue: selectedFiles,
                currentQueueIndex: 0
            }
        });
    };

    const filteredIssues = filter === 'All'
        ? issuesData
        : issuesData.filter(issue => issue.severity === filter);

    const handleSelectAll = (event) => {
        if (event.target.checked) {
            const allFilteredIds = filteredIssues.map((i) => i.id);
            setSelectedItems(prev => [...new Set([...prev, ...allFilteredIds])]);
        } else {
            const allFilteredIds = filteredIssues.map((id) => id.id);
            setSelectedItems(prev => prev.filter(id => !allFilteredIds.includes(id)));
        }
    };

    const handleSelectItem = (id) => {
        setSelectedItems(prev =>
            prev.includes(id)
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
    };

    const getSeverityIcon = (severity) => {
        switch (severity.toLowerCase()) {
            case 'critical': return <XCircle size={16} />;
            case 'major': return <AlertCircle size={16} />;
            case 'minor': return <MinusCircle size={16} />;
            default: return <Circle size={16} />;
        }
    };

    const counts = {
        All: issuesData.length,
        Critical: issuesData.filter(i => i.severity === 'Critical').length,
        Major: issuesData.filter(i => i.severity === 'Major').length,
        Minor: issuesData.filter(i => i.severity === 'Minor').length
    };

    const selectedInView = filteredIssues.filter(i => selectedItems.includes(i.id)).length;
    const isAllSelected = filteredIssues.length > 0 && selectedInView === filteredIssues.length;
    const isIndeterminate = selectedInView > 0 && selectedInView < filteredIssues.length;

    return (
        <Box className="issues-explorer">
            {/* Header & Breadcrumbs */}
            <Box sx={{ mb: 4 }}>
                <Breadcrumbs
                    separator={<ChevronRight size={14} color="#94a3b8" />}
                    sx={{ mb: 2, '& .MuiBreadcrumbs-separator': { mx: 1 } }}
                >
                    <Link underline="hover" color="#64748b" href="#" sx={{ fontSize: '13px', fontWeight: 500 }}>
                        Projects
                    </Link>
                    <Typography color="#0f172a" sx={{ fontSize: '13px', fontWeight: 600 }}>
                        Issues Explorer
                    </Typography>
                </Breadcrumbs>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                        Issues Explorer
                    </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 1 }}>
                    Manage and remediate code quality issues for
                    <Chip
                        label="Spring Project"
                        size="small"
                        sx={{ bgcolor: '#eff6ff', color: '#2563eb', fontWeight: 700, borderRadius: 1.5, height: 24, fontSize: '11px' }}
                    />
                </Typography>
            </Box>

            {/* Filters & Actions (No Search) */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box sx={{ display: 'flex', gap: 1, p: 0.5, bgcolor: '#f1f5f9', borderRadius: 2.5 }}>
                    <Button
                        className={`severity-btn ${filter === 'All' ? 'active' : ''}`}
                        onClick={() => setFilter('All')}
                    >
                        All
                    </Button>
                    <Button
                        className={`severity-btn ${filter === 'Critical' ? 'active' : ''}`}
                        onClick={() => setFilter('Critical')}
                    >
                        <Box sx={{ width: 8, height: 8, bgcolor: '#ef4444', borderRadius: '50%', mr: 1 }} />
                        Critical <span className="count-badge">{counts.Critical}</span>
                    </Button>
                    <Button
                        className={`severity-btn ${filter === 'Major' ? 'active' : ''}`}
                        onClick={() => setFilter('Major')}
                    >
                        <Box sx={{ width: 8, height: 8, bgcolor: '#f59e0b', borderRadius: '50%', mr: 1 }} />
                        Major <span className="count-badge">{counts.Major}</span>
                    </Button>
                    <Button
                        className={`severity-btn ${filter === 'Minor' ? 'active' : ''}`}
                        onClick={() => setFilter('Minor')}
                    >
                        <Box sx={{ width: 8, height: 8, bgcolor: '#0ea5e9', borderRadius: '50%', mr: 1 }} />
                        Minor <span className="count-badge">{counts.Minor}</span>
                    </Button>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b' }}>
                        <span style={{ color: '#0f172a' }}>{selectedItems.length}</span> selected
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<Wand2 size={18} />}
                        className="auto-fix-btn"
                        onClick={handleAutoFix}
                    >
                        Auto-Fix
                    </Button>
                </Box>
            </Box>

            {/* Table */}
            <TableContainer sx={{ border: '1px solid #f1f5f9', borderRadius: '12px 12px 0 0', overflow: 'hidden' }}>
                <Table sx={{ minWidth: 650 }}>
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                        <TableRow>
                            <TableCell padding="checkbox" sx={{ borderBottom: '1px solid #f1f5f9', py: 2 }}>
                                <Checkbox
                                    size="small"
                                    sx={{ color: '#cbd5e1' }}
                                    checked={isAllSelected}
                                    indeterminate={isIndeterminate}
                                    onChange={handleSelectAll}
                                />
                            </TableCell>
                            <TableCell sx={{ color: '#94a3b8', fontWeight: 800, fontSize: '11px', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9' }}>
                                SEVERITY
                            </TableCell>
                            <TableCell sx={{ color: '#94a3b8', fontWeight: 800, fontSize: '11px', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9' }}>
                                FILE PATH : LINE
                            </TableCell>
                            <TableCell sx={{ color: '#94a3b8', fontWeight: 800, fontSize: '11px', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9' }}>
                                ISSUE DESCRIPTION
                            </TableCell>
                            <TableCell align="right" sx={{ color: '#94a3b8', fontWeight: 800, fontSize: '11px', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9' }}>
                                AUTO-FIX
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredIssues.map((row) => (
                            <TableRow key={row.id} className="issue-row">
                                <TableCell padding="checkbox" sx={{ border: 'none' }}>
                                    <Checkbox
                                        size="small"
                                        checked={selectedItems.includes(row.id)}
                                        onChange={() => handleSelectItem(row.id)}
                                        sx={{ color: '#cbd5e1', '&.Mui-checked': { color: '#2563eb' } }}
                                    />
                                </TableCell>
                                <TableCell sx={{ border: 'none', verticalAlign: 'top', pt: 3 }}>
                                    <Box className={`severity-pill ${row.severity.toLowerCase()}`}>
                                        {getSeverityIcon(row.severity)}
                                        {row.severity}
                                    </Box>
                                </TableCell>
                                <TableCell sx={{ border: 'none', verticalAlign: 'top', pt: 3 }}>
                                    <Typography sx={{ fontWeight: 700, color: '#1e293b', fontSize: '14px' }}>
                                        {row.fileName}
                                    </Typography>
                                    <Typography className="file-path">{row.path}</Typography>
                                    <Box sx={{ mt: 1 }}>
                                        <span className="line-badge">Line {row.line}</span>
                                    </Box>
                                </TableCell>
                                <TableCell sx={{ border: 'none', verticalAlign: 'top', pt: 3 }}>
                                    <Typography sx={{ fontWeight: 700, color: '#1e293b', fontSize: '14px', mb: 0.5 }}>
                                        {row.title}
                                    </Typography>
                                    <Typography sx={{ color: '#64748b', fontSize: '13px', maxWidth: '450px' }}>
                                        {row.description}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right" sx={{ border: 'none', verticalAlign: 'top', pt: 3 }}>
                                    <IconButton className="magic-wand-btn" onClick={() => {
                                        setSelectedItems([row.id]);
                                        handleAutoFix();
                                    }}>
                                        <Wand2 size={16} />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Pagination & Summary */}
            <Box className="pagination-container">
                <Typography sx={{ color: '#94a3b8', fontSize: '13px', fontWeight: 500 }}>
                    Showing <span style={{ color: '#0f172a', fontWeight: 600 }}>1 to {filteredIssues.length}</span> of {counts.All} results
                </Typography>
                <Pagination
                    count={Math.ceil(counts.All / 10)}
                    shape="rounded"
                    color="primary"
                    sx={{
                        '& .MuiPaginationItem-root': { fontWeight: 600, borderRadius: 1.5 },
                        '& .Mui-selected': { bgcolor: '#2563eb !important' }
                    }}
                />
            </Box>

            <Snackbar
                open={notification.open}
                autoHideDuration={4000}
                onClose={() => setNotification(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert severity={notification.severity} variant="filled" sx={{ width: '100%', borderRadius: 2, fontWeight: 600 }}>
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Issues;
