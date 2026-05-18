'use client';
import { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, ThemeProvider, createTheme } from '@mui/material';

// Dark Mode Theme with Gold Accents
const amantraTheme = createTheme({
    palette: {
        mode: 'dark',
        background: { default: '#000000', paper: '#111111' },
        primary: { main: '#D4AF37' },
        text: { primary: '#FFFFF0', secondary: '#BDBDBD' },
    },
    typography: { fontFamily: '"Cormorant Garamond", "Inter", sans-serif' },
});

export default function ApiKeyManager() {
    const [keys, setKeys] = useState({ bold: '', whatsapp: '', fbPixel: '' });

    const handleSave = async (keyName: string, value: string) => {
        try {
            await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: keyName, value })
            });
            alert('Key Saved!');
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <ThemeProvider theme={amantraTheme}>
            <Box sx={{ p: 4, bgcolor: 'background.default', minHeight: '100vh', color: 'text.primary' }}>
                <Typography variant="h4" color="primary" sx={{ mb: 4, borderBottom: '1px solid #D4AF37', pb: 2 }}>
                    System Connections & API Keys
                </Typography>

                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                        gap: 4,
                    }}
                >
                    <Paper elevation={0} sx={{ p: 3, border: '1px solid rgba(212, 175, 55, 0.3)' }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Bold Payment Gateway</Typography>
                        <TextField
                            fullWidth variant="outlined" label="Production Secret Key"
                            value={keys.bold}
                            onChange={(e) => setKeys({ ...keys, bold: e.target.value })}
                            sx={{ mb: 3 }}
                            type="password"
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            onClick={() => handleSave('BOLD_API_KEY', keys.bold)}
                        >
                            Save Bold Credential
                        </Button>
                    </Paper>
                    {/* Blocks for WhatsApp, FB Pixel etc. */}
                </Box>
            </Box>
        </ThemeProvider>
    );
}
