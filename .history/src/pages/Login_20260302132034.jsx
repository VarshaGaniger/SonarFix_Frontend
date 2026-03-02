import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, InputAdornment, IconButton, Container } from '@mui/material';
import { Terminal, Lock, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();

        // Reset errors
        setUsernameError('');
        setPasswordError('');

        // Check for specific credentials
        if (username === 'admin') {
            if (password === 'admin') {
                localStorage.setItem('isAuthenticated', 'true');
                // Store user info if needed
                localStorage.setItem('user', JSON.stringify({ name: 'Alex Morgan', role: 'DevOps Lead' }));
                navigate('/dashboard');
            } else {
                setPasswordError('Invalid password');
            }
        } else {
            setUsernameError('Invalid username');
        }
    };

    return (
        <Box className="login-container">
            <Container component="main" maxWidth="xs" className="login-content-wrapper">
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 5 }}>
                    <Box className="login-logo-box">
                        <Terminal color="white" size={32} />
                    </Box>
                    <Typography component="h1" variant="h4" className="login-title" sx={{ mb: 1 }}>
                        SonarFix
                    </Typography>
                    <Typography variant="body1" className="login-subtitle">

                        Spring Boot Analysis
                    </Typography>
                </Box>

                <Card className="login-card">
                    <CardContent sx={{ p: 5 }}>
                        <Box sx={{ mb: 4, textAlign: 'center' }}>
                            <Typography variant="h5" component="h2" className="login-title" sx={{ mb: 1, fontSize: '1.25rem !important' }}>
                                Welcome
                            </Typography>
                            <Typography variant="body2" className="login-subtitle">
                                Please enter your credentials to access the dashboard.
                            </Typography>
                        </Box>

                        <Box component="form" onSubmit={handleLogin} noValidate>
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 1, display: 'block', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                                    User Name
                                </Typography>
                                <TextField
                                    fullWidth
                                    placeholder="Enter your username"
                                    variant="outlined"
                                    value={username}
                                    error={!!usernameError}
                                    helperText={usernameError}
                                    onChange={(e) => {
                                        setUsername(e.target.value);
                                        setUsernameError('');
                                    }}
                                    className="login-input"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Terminal size={20} color="#9ca3af" />
                                            </InputAdornment>
                                        ),
                                        sx: {
                                            borderRadius: '10px',
                                            backgroundColor: '#f9fafb',
                                        }
                                    }}
                                />
                            </Box>

                            <Box sx={{ mb: 4 }}>
                                <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 1, display: 'block', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                                    Password
                                </Typography>
                                <TextField
                                    fullWidth
                                    placeholder="••••••••"
                                    type={showPassword ? 'text' : 'password'}
                                    variant="outlined"
                                    value={password}
                                    error={!!passwordError}
                                    helperText={passwordError}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setPasswordError('');
                                    }}
                                    className="login-input"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Lock size={20} color="#9ca3af" />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    edge="end"
                                                >
                                                    {showPassword ? <EyeOff size={20} color="#9ca3af" /> : <Eye size={20} color="#9ca3af" />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                        sx: {
                                            borderRadius: '10px',
                                            backgroundColor: '#f9fafb',
                                        }
                                    }}
                                />
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: '#0066ff',
                                            cursor: 'pointer',
                                            fontWeight: 600,
                                            '&:hover': { textDecoration: 'underline' }
                                        }}
                                        onClick={() => alert('Please contact administrator for password reset.')}
                                    >

                                    </Typography>
                                </Box>
                            </Box>

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                className="login-button"
                                sx={{ mb: 3 }}
                            >
                                Sign In
                            </Button>


                        </Box>
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
};

export default Login;
