import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Box,
  Typography
} from '@mui/material';

import {
  LayoutDashboard,
  FolderOpen,
  Activity,
  LogOut,
  Code
} from 'lucide-react';

import { useNavigate, useLocation, useParams } from 'react-router-dom';

const drawerWidth = 260;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectKey } = useParams();

  const isInsideProject = location.pathname.startsWith('/projects/');

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
      path: '/dashboard'
    },
    {
      text: 'Upload Project',
      icon: <FolderOpen size={20} />,
      path: '/upload'
    },
    {
      text: 'Scan Status',
      icon: <Activity size={20} />,
      path: '/scan-status'
    }
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
        }
      }}
    >
      {/* LOGO */}
      <Toolbar sx={{ minHeight: '84px !important', px: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              bgcolor: '#2563eb',
              borderRadius: 1.25,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Code color="white" size={20} strokeWidth={2.5} />
          </Box>
          <Typography
            variant="h6"
            sx={{
              color: '#fff',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              fontSize: '1.25rem'
            }}
          >
            SonarFix
          </Typography>
        </Box>
      </Toolbar>

      {/* MAIN MENU */}
      <Box sx={{ overflow: 'auto', py: 2, flex: 1 }}>
        <List sx={{ px: 2 }}>
          {menuItems.map(item => {
            const isSelected = location.pathname.startsWith(item.path);

            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={isSelected}
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    color: isSelected ? '#fff' : '#94a3b8',
                    '&.Mui-selected': {
                      backgroundColor: '#2d2e3a',
                      color: '#fff'
                    },
                    '&:hover': {
                      backgroundColor: '#252630',
                      color: '#fff'
                    }
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: 'inherit',
                      minWidth: 40
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontWeight: isSelected ? 600 : 400,
                      fontSize: '0.9rem'
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}

          {/* PROJECT SUB NAV (ONLY WHEN INSIDE PROJECT) */}
          {isInsideProject && projectKey && (
            <>
              <Box
                sx={{
                  borderTop: '1px solid #2d2e3a',
                  mt: 2,
                  pt: 2,
                  px: 2
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    color: '#64748b',
                    mb: 1
                  }}
                >
                  PROJECT
                </Typography>

                <ListItemButton
                  selected={location.pathname.includes('/issues')}
                  onClick={() =>
                    navigate(`/projects/${projectKey}/issues`)
                  }
                  sx={{
                    borderRadius: 2,
                    py: 1.2,
                    color: location.pathname.includes('/issues')
                      ? '#fff'
                      : '#94a3b8',
                    '&:hover': {
                      backgroundColor: '#252630',
                      color: '#fff'
                    }
                  }}
                >
                  <ListItemText primary="Issues Explorer" />
                </ListItemButton>

                <ListItemButton
                  selected={location.pathname.includes('/code')}
                  onClick={() =>
                    navigate(`/projects/${projectKey}/code`)
                  }
                  sx={{
                    borderRadius: 2,
                    py: 1.2,
                    color: location.pathname.includes('/code')
                      ? '#fff'
                      : '#94a3b8',
                    '&:hover': {
                      backgroundColor: '#252630',
                      color: '#fff'
                    }
                  }}
                >
                  <ListItemText primary="Code Viewer" />
                </ListItemButton>
                <ListItemButton
                  selected={location.pathname.includes('/diff')}
                  onClick={() =>
              //      navigate(`/projects/${projectKey}/diff`) for integratiom with diff viewer
                      navigate(`/diff`)
                  }
                  sx={{
                    borderRadius: 2,
                    py: 1.2,
                    color: location.pathname.includes('/diff')
                      ? '#fff'
                      : '#94a3b8',
                    '&:hover': {
                      backgroundColor: '#252630',
                      color: '#fff'
                    }
                  }}
                >
                  <ListItemText primary="Diff Viewer" />
                </ListItemButton>

                <ListItemButton
                  selected={location.pathname.includes('/summary')}
                  onClick={() =>
                  //  navigate(`/projects/${projectKey}/summary`)
                  navigate(`/summary`)
                  }
                  sx={{
                    borderRadius: 2,
                    py: 1.2,
                    color: location.pathname.includes('/summary')
                      ? '#fff'
                      : '#94a3b8',
                    '&:hover': {
                      backgroundColor: '#252630',
                      color: '#fff'
                    }
                  }}
                >
                  <ListItemText primary="Summary" />
                </ListItemButton>
              </Box>
            </>
          )}
        </List>
      </Box>

      {/* SIGN OUT */}
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
              color: '#fff'
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