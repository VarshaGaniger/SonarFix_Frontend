import React, { useRef, useState } from 'react';
import { Box, Typography, Card, CardContent, Button, TextField, Breadcrumbs, Link, Divider, IconButton, Avatar, Paper } from '@mui/material';
import { ChevronRight, Upload, Link as LinkIcon, Info, Bell, File, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './UploadProject.css';

const UploadProject = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileSelect = () => {
        fileInputRef.current.click();
    };

    const onFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const onDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = () => {
        setIsDragging(false);
    };

    const onDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const removeFile = (e) => {
        e.stopPropagation();
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    return (
        <Box className="upload-container">
            {/* Header Section */}
            <Box className="upload-header">
                <Breadcrumbs separator={<ChevronRight size={14} />} aria-label="breadcrumb" className="breadcrumb">
                    <Link underline="hover" color="inherit" href="#">
                        Projects
                    </Link>
                    <Typography color="text.primary">Upload Project</Typography>
                </Breadcrumbs>
            </Box>

            {/* Main Content */}
            <Box className="upload-main">
                <Typography variant="h4" className="page-title">
                    New Project Analysis
                </Typography>
                <Typography variant="body1" className="page-subtitle">
                    Upload your Spring Boot source code for comprehensive quality analysis.
                </Typography>

                <Card className="upload-card">
                    <CardContent sx={{ p: 4 }}>
                        <Typography variant="subtitle2" className="section-label">
                            Upload Archive
                        </Typography>

                        <Box
                            className={`dropzone ${isDragging ? 'drag-over' : ''} ${selectedFile ? 'has-file' : ''}`}
                            onClick={handleFileSelect}
                            onDragOver={onDragOver}
                            onDragLeave={onDragLeave}
                            onDrop={onDrop}
                        >
                            <input
                                type="file"
                                hidden
                                ref={fileInputRef}
                                onChange={onFileChange}
                                accept=".zip,.jar,.war"
                            />

                            {selectedFile ? (
                                <Box className="selected-file-view">
                                    <Box className="file-icon-wrapper">
                                        <File size={32} color="#2563eb" />
                                    </Box>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography variant="subtitle1" fontWeight="600" noWrap>
                                            {selectedFile.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to analyze
                                        </Typography>
                                    </Box>
                                    <IconButton size="small" onClick={removeFile} className="remove-file-btn">
                                        <X size={18} />
                                    </IconButton>
                                </Box>
                            ) : (
                                <>
                                    <Box className="upload-icon-wrapper">
                                        <Upload size={32} color="#6366f1" />
                                    </Box>
                                    <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 0.5 }}>
                                        Drag & drop project archive
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ mb: 3 }}>
                                        .zip, .jar, .war (Max 200MB)
                                    </Typography>
                                    <Button variant="outlined" className="select-files-btn">
                                        Select Files
                                    </Button>
                                </>
                            )}
                        </Box>

                        <Box className="divider-wrapper">
                            <Divider className="custom-divider">
                                <Typography variant="caption" className="divider-text">
                                    OR IMPORT FROM GIT
                                </Typography>
                            </Divider>
                        </Box>

                        <Box className="input-section">
                            <Typography variant="subtitle2" className="section-label">
                                Repository URL
                            </Typography>
                            <TextField
                                fullWidth
                                placeholder="https://github.com/username/repository.git"
                                variant="outlined"
                                className="repo-input"
                                InputProps={{
                                    startAdornment: (
                                        <LinkIcon size={18} color="#94a3b8" style={{ marginRight: 12 }} />
                                    ),
                                }}
                            />
                            <Typography variant="caption" className="input-helper">
                                Ensure you have permissions for private repositories.
                            </Typography>
                        </Box>

                        <Button fullWidth variant="contained" className="start-analysis-btn" onClick={() => navigate('/scan-status')}>
                            Start Analysis
                        </Button>
                    </CardContent>
                </Card>

                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                    <Button variant="text" size="small" sx={{ color: '#64748b', textTransform: 'none', gap: 1 }}>
                        <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
                        </Box>
                        View analysis history
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default UploadProject;
