import React from 'react';
import { Box, Toolbar, CssBaseline } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const MainLayout = () => {
    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <Sidebar />
            <Box component="main" sx={{ flexGrow: 1, p: 0, bgcolor: '#ffffff', minHeight: '100vh', color: 'text.primary' }}>
                <Header />
                <Box sx={{ p: 3, mt: '84px' }}>
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
};

export default MainLayout;
