import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, Breadcrumbs, Link, Chip, IconButton, Button, Snackbar, Alert } from '@mui/material';
import {
    ChevronRight,
    Folder,
    ChevronDown,
    MoreHorizontal,
    Terminal,
    AlertCircle,
    Search,
    FileCode,
    FolderOpen,
    Play,
    Wand2
} from 'lucide-react';
import './CodeViewer.css';

const CodeViewer = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Explorer & Editor State
    const [selectedFile, setSelectedFile] = useState('UserService.java');
    const [openTabs, setOpenTabs] = useState(['UserService.java', 'UserRepository.java', 'application.properties']);
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
    const [explorer, setExplorer] = useState([
        { id: 'src', name: 'src', type: 'folder', level: 0, open: true },
        { id: 'main', name: 'main', parent: 'src', type: 'folder', level: 1, open: true },
        { id: 'java', name: 'java', parent: 'main', type: 'folder', level: 2, open: true },
        { id: 'service', name: 'com.example.service', parent: 'java', type: 'folder', level: 3, open: true },
        { id: 'user-service', name: 'UserService.java', parent: 'service', type: 'file', level: 4, issue: 'red' },
        { id: 'user-repo', name: 'UserRepository.java', parent: 'service', type: 'file', level: 4 },
        { id: 'audit-service', name: 'AuditLogService.java', parent: 'service', type: 'file', level: 4, issue: 'yellow' },
        { id: 'resources', name: 'resources', parent: 'main', type: 'folder', level: 1, open: false },
    ]);
    const [ignoredIssues, setIgnoredIssues] = useState(new Set());
    const [issueQueue, setIssueQueue] = useState([]);
    const [currentQueueIndex, setCurrentQueueIndex] = useState(0);

    const handleIgnore = (fileName, lineNum) => {
        const issueKey = `${fileName}-${lineNum}`;
        setIgnoredIssues(prev => new Set([...prev, issueKey]));
        setNotification({ open: true, message: 'Issue ignored', severity: 'info' });
    };

    useEffect(() => {
        if (location.state?.issueQueue) {
            setIssueQueue(location.state.issueQueue);
            setCurrentQueueIndex(location.state.currentQueueIndex || 0);
            handleFileClick(location.state.issueQueue[location.state.currentQueueIndex || 0]);
            // Clear state to avoid re-triggering on refresh
            window.history.replaceState({}, document.title);
        } else if (location.state?.focusFile) {
            handleFileClick(location.state.focusFile);
            window.history.replaceState({}, document.title);
        } else if (location.state?.notification) {
            setNotification({ open: true, ...location.state.notification });
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const toggleFolder = (id) => {
        setExplorer(prev => prev.map(item =>
            item.id === id ? { ...item, open: !item.open } : item
        ));
    };

    const isVisible = (item) => {
        if (!item.parent) return true;
        const parent = explorer.find(i => i.id === item.id.split('-')[0] || i.id === item.parent);
        return parent ? parent.open && isVisible(parent) : true;
    };

    const fileContent = {
        'UserService.java': [
            { line: 1, text: 'package com.example.service;' },
            { line: 2, text: 'import org.springframework.stereotype.Service;' },
            { line: 3, text: 'import org.springframework.beans.factory.annotation.Autowired;' },
            { line: 4, text: 'import java.util.List;' },
            { line: 5, text: '@Service', type: 'annotation' },
            { line: 6, text: 'public class UserService {' },
            { line: 7, text: '    @Autowired', type: 'annotation' },
            { line: 8, text: '    private UserRepository userRepository;' },
            { line: 9, text: '    // TODO: Implement caching for this method later', type: 'comment' },
            { line: 10, text: '    private final String DB_PASSWORD = "admin123"; // Hardcoded secret detected', type: 'error' },
            { line: 11, text: '    public List<User> findAllUsers() {' },
            { line: 12, text: '        return userRepository.findAll();', type: 'vulnerability' },
            { line: 13, text: '    }' },
            { line: 14, text: '    public User createUser(User user) {' },
            { line: 15, text: '        if (user.getName() == null) {' },
            { line: 16, text: '            throw new IllegalArgumentException();' },
            { line: 17, text: '        }' },
            { line: 18, text: '        System.out.println("Creating user...");' },
            { line: 19, text: '        return userRepository.save(user);' },
            { line: 20, text: '    }' },
            { line: 21, text: '}' }
        ],
        'UserRepository.java': [
            { line: 1, text: 'package com.example.service;' },
            { line: 2, text: 'import org.springframework.data.jpa.repository.JpaRepository;' },
            { line: 3, text: ' ' },
            { line: 4, text: 'public interface UserRepository extends JpaRepository<User, Long> {' },
            { line: 5, text: '    User findByUsername(String username);' },
            { line: 6, text: '}' }
        ],
        'AuditLogService.java': [
            { line: 1, text: 'package com.example.service;' },
            { line: 2, text: 'import org.springframework.stereotype.Service;' },
            { line: 3, text: ' ' },
            { line: 4, text: '@Service', type: 'annotation' },
            { line: 5, text: 'public class AuditLogService {' },
            { line: 6, text: '    // Deprecated logging method detected', type: 'warning' },
            { line: 7, text: '    public void log(String msg) {' },
            { line: 8, text: '        System.out.println(msg);', type: 'vulnerability' },
            { line: 9, text: '    }' },
            { line: 10, text: '}' }
        ],
        'application.properties': [
            { line: 1, text: 'spring.datasource.url=jdbc:postgresql://localhost:5432/sonarfix' },
            { line: 2, text: 'spring.datasource.username=postgres' },
            { line: 3, text: 'spring.datasource.password=password123' },
            { line: 4, text: 'server.port=8080' }
        ],
        'AuthService.java': [
            { line: 1, text: 'package com.example.service;' },
            { line: 2, text: ' ' },
            { line: 3, text: 'public class AuthService {' },
            { line: 4, text: '    private static final String API_KEY = "sk-55eb81a...";', type: 'error' },
            { line: 5, text: ' ' },
            { line: 6, text: '    public void authenticate() {' },
            { line: 7, text: '        System.out.println("Authenticating...");', type: 'vulnerability' },
            { line: 8, text: '    }' },
            { line: 9, text: '}' }
        ]
    };

    const handleFileClick = (fileName) => {
        setSelectedFile(fileName);
        if (!openTabs.includes(fileName)) {
            setOpenTabs([...openTabs, fileName]);
        }
    };

    const closeTab = (e, fileName) => {
        e.stopPropagation();
        const newTabs = openTabs.filter(t => t !== fileName);
        setOpenTabs(newTabs);
        if (selectedFile === fileName && newTabs.length > 0) {
            setSelectedFile(newTabs[0]);
        }
    };

    return (
        <Box className="code-viewer-page">
            <Box className="code-viewer-nav">
                <Breadcrumbs separator={<ChevronRight size={14} color="#94a3b8" />} className="code-breadcrumbs">
                    <Link underline="hover" color="#64748b" href="#" className="breadcrumb-item">Projects</Link>
                    <Link underline="hover" color="#64748b" href="#" className="breadcrumb-item">Spring-Boot-Alpha</Link>
                    <Typography color="#1e293b" sx={{ fontSize: '13px', fontWeight: 600 }}>Code Viewer</Typography>
                </Breadcrumbs>

            </Box>

            <Box className="code-viewer-main">
                <Box className="explorer-sidebar">
                    <Box className="explorer-header">
                        <Typography variant="caption" className="explorer-title">EXPLORER</Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <FolderOpen size={14} />
                            <MoreHorizontal size={14} />
                        </Box>
                    </Box>

                    <Box className="explorer-tree">
                        {explorer.map(item => {
                            if (!isVisible(item)) return null;
                            return (
                                <Box
                                    key={item.id}
                                    className={`tree-item ${item.type} ${selectedFile === item.name ? 'active' : ''}`}
                                    style={{ paddingLeft: `${item.level * 16 + 12}px` }}
                                    onClick={() => item.type === 'file' ? handleFileClick(item.name) : toggleFolder(item.id)}
                                >
                                    {item.type === 'folder' && (
                                        item.open ? <ChevronDown size={14} /> : <ChevronRight size={14} />
                                    )}
                                    {item.type === 'folder' ? (
                                        <Folder size={16} fill="#bfdbfe" color="#3b82f6" />
                                    ) : (
                                        <FileCode size={16} color="#3b82f6" />
                                    )}
                                    <Typography className="tree-text">{item.name}</Typography>
                                    {item.issue && <Box className={`issue-dot ${item.issue}`} />}
                                </Box>
                            );
                        })}
                    </Box>
                </Box>

                <Box className="editor-container">
                    <Box className="tabs-header">
                        <Box className="tabs-list">
                            {openTabs.map(tab => (
                                <Box
                                    key={tab}
                                    className={`editor-tab ${selectedFile === tab ? 'active' : ''}`}
                                    onClick={() => setSelectedFile(tab)}
                                >
                                    <FileCode size={14} color={selectedFile === tab ? "#3b82f6" : "#94a3b8"} />
                                    <Typography>{tab}</Typography>
                                    <span className="close-tab" onClick={(e) => closeTab(e, tab)}>×</span>
                                </Box>
                            ))}
                        </Box>
                    </Box>

                    <Box className="editor-path">
                        <Breadcrumbs separator={<ChevronRight size={10} color="#94a3b8" />}>
                            <Typography sx={{ fontSize: '11px', color: '#94a3b8' }}>src</Typography>
                            <Typography sx={{ fontSize: '11px', color: '#94a3b8' }}>main</Typography>
                            {selectedFile.endsWith('.java') && <Typography sx={{ fontSize: '11px', color: '#94a3b8' }}>java</Typography>}
                            <Typography sx={{ fontSize: '11px', color: '#1e293b', fontWeight: 600 }}>{selectedFile}</Typography>
                        </Breadcrumbs>
                    </Box>

                    <Box className="code-viewport">
                        {(fileContent[selectedFile] || fileContent['UserService.java']).map((line, idx) => (
                            <Box key={idx} className={`code-row ${line.type || ''}`}>
                                <Box className="line-number">{line.line}</Box>
                                <pre className="line-text">{line.text}</pre>
                                {line.type === 'vulnerability' && !ignoredIssues.has(`${selectedFile}-${line.line}`) && (
                                    <Box className="vulnerability-tooltip">
                                        <Box className="tooltip-header">
                                            <AlertCircle size={14} color="#ef4444" />
                                            <Box>
                                                <Typography className="tooltip-title">
                                                    {selectedFile === 'UserService.java' ? 'Hardcoded Password' :
                                                        selectedFile === 'AuthService.java' ? 'Hardcoded API Key' : 'Security Warning'}
                                                </Typography>
                                                <Typography className="tooltip-subtitle">Critical Security Vulnerability</Typography>
                                            </Box>
                                        </Box>
                                        <Typography className="tooltip-desc">
                                            Sensitive data detected in source code. This should be moved to a secure configuration.
                                        </Typography>
                                        <Box className="tooltip-actions">
                                            <Button variant="contained" className="move-btn" onClick={() => navigate('/diff-viewer', {
                                                state: { issueQueue, currentQueueIndex }
                                            })}>Fix now</Button>
                                            <Button variant="text" className="ignore-btn" onClick={() => handleIgnore(selectedFile, line.line)}>Ignore</Button>
                                        </Box>
                                    </Box>
                                )}
                            </Box>
                        ))}
                    </Box>

                    <Box className="editor-status-bar">
                        <Box className="status-left">
                            <Box className="status-item"><Terminal size={14} /> <Typography>Terminal</Typography></Box>
                            <Box className="status-item active"><AlertCircle size={14} /> <Typography>Problems <span>3</span></Typography></Box>
                            <Box className="status-item"><Play size={14} /> <Typography>Output</Typography></Box>
                        </Box>
                        <Box className="status-right">
                            <Typography>UTF-8</Typography>
                            <Typography>Java <ChevronDown size={14} /></Typography>
                        </Box>
                    </Box>
                </Box>
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

export default CodeViewer;
