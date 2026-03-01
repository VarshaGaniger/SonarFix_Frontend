import React from 'react';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Box, Typography } from '@mui/material';
import { LayoutDashboard, FolderOpen, Activity, AlertCircle, Code, History, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 260;
const projectKey = localStorage.getItem("currentProjectKey");
const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { text: 'Issues Explorer', path: projectKey ? `/issues/${projectKey}` : '/dashboard' },
{ text: 'Code Viewer', path: projectKey ? `/code-viewer/${projectKey}` : '/dashboard' },
        { text: 'Upload Project', icon: <FolderOpen size={20} />, path: '/upload' },
        { text: 'Scan Status', icon: <Activity size={20} />, path: '/scan-status/:scanId' },
        { text: 'Issues Explorer', icon: <AlertCircle size={20} />,path: projectKey ? `/issues/${projectKey}` : '/dashboard' },
        { text: 'Code Viewer', icon: <Code size={20} />, path: projectKey ? `/code-viewer/${projectKey}` : '/dashboard'},
        { text: 'Diff Viewer', icon: <History size={20} />, path: '/diff-viewer' },
        { text: 'Summary & Download', icon: <Activity size={20} />, path: '/summary', isDownload: true },
    ];

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                    borderRight: 'none',
                    backgroundColor: '#1a1b23',
                    color: '#94a3b8',
                    display: 'flex',
                    flexDirection: 'column'
                },
            }}
        >
            <Toolbar sx={{ minHeight: '84px !important', px: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                        width: 32,
                        height: 32,
                        bgcolor: '#2563eb',
                        borderRadius: 1.25,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Code color="white" size={20} strokeWidth={2.5} />
                    </Box>
                    <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, letterSpacing: '-0.02em', fontSize: '1.25rem' }}>
                        SonarFix
                    </Typography>
                </Box>
            </Toolbar>

            <Box sx={{ overflow: 'auto', py: 2, flex: 1 }}>
                <List sx={{ px: 2 }}>
                    {menuItems.map((item) => {
                        const isSelected = location.pathname === item.path;
                        return (
                            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                                <ListItemButton
                                    selected={isSelected}
                                    onClick={() => navigate(item.path)}
                                    sx={{
                                        borderRadius: 2,
                                        py: 1.5,
                                        color: isSelected || item.isDownload ? '#fff' : '#94a3b8',
                                        '&.Mui-selected': {
                                            backgroundColor: '#2d2e3a',
                                            color: '#fff',
                                            '& .MuiListItemIcon-root': {
                                                color: '#fff',
                                            }
                                        },
                                        '&:hover': {
                                            backgroundColor: '#252630',
                                            color: '#fff',
                                            '& .MuiListItemIcon-root': {
                                                color: '#fff',
                                            }
                                        },
                                        ...(item.isDownload && {
                                            mt: 2,
                                            bgcolor: 'transparent',
                                            borderTop: '1px solid #2d2e3a',
                                            pt: 3
                                        })
                                    }}
                                >
                                    <ListItemIcon sx={{
                                        color: isSelected || item.isDownload ? '#fff' : 'inherit',
                                        minWidth: 40
                                    }}>
                                        {item.text === 'Summary & Download' ? <Activity size={20} style={{ transform: 'rotate(180deg)', color: '#60a5fa' }} /> : item.icon}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item.text}
                                        primaryTypographyProps={{
                                            fontWeight: isSelected || item.isDownload ? 600 : 400,
                                            fontSize: '0.9rem',
                                            color: 'inherit'
                                        }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>
            </Box>

            <Box sx={{ p: 2 }}>
                <ListItemButton
                    onClick={() => {
                        localStorage.removeItem('isAuthenticated');
                        navigate('/');
                    }}
                    sx={{
                        borderRadius: 2,
                        py: 1.5,
                        color: '#94a3b8',
                        '&:hover': {
                            backgroundColor: '#ef4444',
                            color: '#fff',
                            '& .MuiListItemIcon-root': {
                                color: '#fff',
                            }
                        }
                    }}
                >
                    <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                        <LogOut size={20} />
                    </ListItemIcon>
                    <ListItemText
                        primary="Sign Out"
                        primaryTypographyProps={{
                            fontWeight: 500,
                            fontSize: '0.875rem'
                        }}
                    />
                </ListItemButton>
            </Box>
        </Drawer>
    );
};

export default Sidebar;
