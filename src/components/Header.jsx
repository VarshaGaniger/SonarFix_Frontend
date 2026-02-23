import React from 'react';
import { AppBar, Toolbar, Typography, Box, IconButton, Avatar, InputBase, alpha, styled, Badge, Button } from '@mui/material';
import { Search as SearchIcon, Bell, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const drawerWidth = 260;

const Header = () => {
    const navigate = useNavigate();

    return (
        <AppBar
            position="fixed"
            sx={{
                width: `calc(100% - ${drawerWidth}px)`,
                ml: `${drawerWidth}px`,
                bgcolor: '#fff',
                borderBottom: '1px solid #f1f5f9',
            }}
            elevation={0}
        >
            <Toolbar sx={{ minHeight: '84px !important', px: 4 }}>
                <Box sx={{ flexGrow: 1 }} />

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button
                        variant="contained"
                        startIcon={<Plus size={18} />}
                        onClick={() => navigate('/upload')}
                        sx={{
                            bgcolor: '#2563eb',
                            color: '#fff',
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            px: 2,
                            py: 0.75,
                            boxShadow: 'none',
                            '&:hover': { bgcolor: '#1d4ed8', boxShadow: 'none' }
                        }}
                    >
                        New Project
                    </Button>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', ml: 1 }}>
                        <Typography variant="subtitle2" sx={{ color: '#0f172a', fontWeight: 600, fontSize: '0.875rem' }}>
                            Admin
                        </Typography>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                    </Box>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
