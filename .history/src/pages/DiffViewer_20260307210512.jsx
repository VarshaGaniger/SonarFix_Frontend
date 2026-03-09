import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, Button, IconButton, Chip, Breadcrumbs, Link, Snackbar, Alert } from '@mui/material';
import { ChevronRight, ChevronLeft, FileCode } from 'lucide-react';
import './DiffViewer.css';

const DiffViewer = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Extract queue state if it exists
    const { issueQueue, currentQueueIndex: queueIdx } = location.state || {};

    const [currentIssueIndex, setCurrentIssueIndex] = useState(0);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const issues = [
        {
            id: 1,
            project: 'SpringBoot-Backend',
            path: 'src/main/java',
            file: 'UserService.java',
            rule: 'Rule S2095',
            description: 'The auto-remediation engine detected an unclosed FileInputStream. The fix wraps the resource in a try-with-resources block to ensure automatic closure.',
            original: [
                { line: 38, text: '    public void processUserData() {' },
                { line: 39, text: '        String path = "data/users.txt";' },
                { line: 40, text: '        Logger log = LoggerFactory.getLogger(this.getClass());' },
                { line: 41, text: ' ' },
                { line: 42, text: '        try {', type: 'removed' },
                { line: 43, text: '            FileInputStream fis = new FileInputStream(path);', type: 'removed' },
                { line: 44, text: '            // Process the file stream...' },
                { line: 45, text: '            readStream(fis);' },
                { line: 46, text: '            // Missing close() call here if exception occurs', type: 'removed' },
                { line: 47, text: '            fis.close();', type: 'removed' },
                { line: 48, text: '        } catch (IOException e) {' },
                { line: 49, text: '            log.error("Error reading file", e);' },
            ],
            proposed: [
                { line: 38, text: '    public void processUserData() {' },
                { line: 39, text: '        String path = "data/users.txt";' },
                { line: 40, text: '        Logger log = LoggerFactory.getLogger(this.getClass());' },
                { line: 41, text: ' ' },
                { line: 42, text: '        try (FileInputStream fis = new FileInputStream(path)) {', type: 'added' },
                { line: 43, text: '            // Resource auto-closed by try-with-resources', type: 'added' },
                { line: 44, text: '            readStream(fis);', type: 'added' },
                { line: 45, text: ' ', type: 'added' },
                { line: 46, text: '        } catch (IOException e) {' },
                { line: 47, text: '            log.error("Error reading file", e);' },
                { line: 48, text: '        }' },
                { line: 49, text: '    }' },
            ]
        },
        {
            id: 2,
            project: 'SpringBoot-Backend',
            path: 'src/main/java',
            file: 'AuthService.java',
            rule: 'Rule S5122',
            description: 'Hardcoded credentials found. This fix moves the sensitive string to an environment variable or configuration file.',
            original: [
                { line: 15, text: 'public class AuthService {' },
                { line: 16, text: '    private static final String API_KEY = "sk-55eb81a...";', type: 'removed' },
                { line: 17, text: ' ' },
                { line: 18, text: '    public void authenticate() {' }
            ],
            proposed: [
                { line: 15, text: 'public class AuthService {' },
                { line: 16, text: '    @Value("${api.key}")', type: 'added' },
                { line: 17, text: '    private String apiKey;', type: 'added' },
                { line: 18, text: ' ' },
                { line: 19, text: '    public void authenticate() {' }
            ]
        }
    ];

    const currentIssue = issues[currentIssueIndex];

    const handleAccept = () => {
        setSnackbar({ open: true, message: 'Issue fixed successfully!', severity: 'success' });

        setTimeout(() => {
            if (issueQueue && issueQueue.length > 0) {
                if (issueQueue.length === 1) {
                    // Single issue selection: go back to issues explorer
                    navigate('/issues', { state: { notification: { message: 'Issue fixed successfully!', severity: 'success' } } });
                } else {
                    const nextQueueIndex = queueIdx + 1;
                    if (nextQueueIndex < issueQueue.length) {
                        // Multi-issue selection: continue to next file
                        navigate('/code-viewer', { state: { issueQueue, currentQueueIndex: nextQueueIndex } });
                    } else {
                        // Queue finished: return to explorer
                        navigate('/issues', { state: { notification: { message: 'All selected fixes applied!', severity: 'success' } } });
                    }
                }
            } else {
                // Legacy loop logic
                const nextIndex = currentIssueIndex + 1;
                const nextIssue = issues[nextIndex] || issues[0];
                navigate('/code-viewer', { state: { focusFile: nextIssue.file } });
            }
        }, 1500);
    };

    const handleReject = () => {
        setSnackbar({ open: true, message: 'Issue fix rejected', severity: 'error' });

        setTimeout(() => {
            if (issueQueue && issueQueue.length > 0) {
                if (issueQueue.length === 1) {
                    navigate('/issues');
                } else {
                    const nextQueueIndex = queueIdx + 1;
                    if (nextQueueIndex < issueQueue.length) {
                        navigate('/code-viewer', { state: { issueQueue, currentQueueIndex: nextQueueIndex } });
                    } else {
                        navigate('/issues');
                    }
                }
            } else {
                // Legacy loop logic
                const nextIndex = currentIssueIndex + 1;
                const nextIssue = issues[nextIndex] || issues[0];
                navigate('/code-viewer', { state: { focusFile: nextIssue.file } });
            }
        }, 1500);
    };

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') return;
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    return (
        <Box className="diff-viewer-page">
            <Box className="diff-header-section">
                <Breadcrumbs separator={<ChevronRight size={14} color="#94a3b8" />} className="diff-breadcrumbs">
                    <Link underline="hover" color="#64748b" href="#" className="breadcrumb-item">
                        <FileCode size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                        {currentIssue.project}
                    </Link>
                    <Link underline="hover" color="#64748b" href="#" className="breadcrumb-item">
                        {currentIssue.path}
                    </Link>
                    <Typography color="#1e293b" sx={{ fontSize: '13px', fontWeight: 600 }}>
                        {currentIssue.file}
                    </Typography>
                </Breadcrumbs>

                <Box sx={{ mt: 3, mb: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a' }}>
                        Before and after - diff viewer
                    </Typography>
                    <Chip label={currentIssue.rule} size="small" sx={{ bgcolor: '#eff6ff', color: '#2563eb', fontWeight: 600, borderRadius: 1.5, fontSize: '11px' }} />
                </Box>

                <Typography variant="body2" sx={{ color: '#64748b', maxWidth: '800px', mb: 3 }}>
                    {currentIssue.description}
                </Typography>
            </Box>

            <Box className="diff-container">
                <Box className="diff-section original">
                    <Box className="diff-section-header">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 8, height: 8, bgcolor: '#ef4444', borderRadius: '50%' }} />
                            <Typography sx={{ fontSize: '11px', fontWeight: 800, color: '#ef4444', letterSpacing: '0.05em' }}>ORIGINAL</Typography>
                        </Box>
                        <Typography sx={{ fontSize: '11px', color: '#94a3b8' }}>HEAD (e4f9a2)</Typography>
                    </Box>
                    <Box className="code-block">
                        {currentIssue.original.map((item, idx) => (
                            <Box key={idx} className={`code-line ${item.type || ''}`}>
                                <Box className="line-num">{item.line}</Box>
                                <pre className="line-content">{item.text}</pre>
                            </Box>
                        ))}
                    </Box>Original
                </Box>

                <Box className="diff-section proposed">
                    <Box className="diff-section-header">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 8, height: 8, bgcolor: '#22c55e', borderRadius: '50%' }} />
                            <Typography sx={{ fontSize: '11px', fontWeight: 800, color: '#22c55e', letterSpacing: '0.05em' }}>PROPOSED FIX</Typography>
                        </Box>
                        <Typography sx={{ fontSize: '11px', color: '#94a3b8' }}>AUTO-GENERATED</Typography>
                    </Box>
                    <Box className="code-block">
                        {currentIssue.proposed.map((item, idx) => (
                            <Box key={idx} className={`code-line ${item.type || ''}`}>
                                <Box className="line-num">{item.line}</Box>
                                <pre className="line-content">{item.text}</pre>
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Box>

            <Box className="diff-action-bar">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 8, height: 8, bgcolor: '#f59e0b', borderRadius: '50%' }} />
                        <Typography sx={{ fontSize: '13px', color: '#64748b' }}>
                            Status: <span style={{ fontWeight: 600, color: '#1e293b' }}>Awaiting Review</span>
                        </Typography>
                    </Box>
                    <Typography sx={{ fontSize: '13px', color: '#94a3b8', borderLeft: '1px solid #e2e8f0', pl: 2 }}>
                        Last analyzed: 2 mins ago
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button variant="outlined" className="reject-btn" onClick={handleReject} sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600, px: 3, borderColor: '#e2e8f0', color: '#475569', '&:hover': { borderColor: '#cbd5e1', bgcolor: '#f8fafc' } }}>
                        Reject Fix
                    </Button>
                    <Button variant="contained" className="accept-btn" onClick={handleAccept} sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600, px: 3, bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' } }}>
                        Accept Fix
                    </Button>
                </Box>
            </Box>

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                <Alert onClose={handleClose} severity={snackbar.severity} variant="filled" sx={{ width: '100%', borderRadius: 2, fontWeight: 600 }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default DiffViewer;
