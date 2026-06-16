'use client';

import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import FacebookIcon from '@mui/icons-material/Facebook';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import XIcon from '@mui/icons-material/X';
import { buildShareLinks, buildShareText, recordShareEvent, type ShareableProduct, type ShareNetworkKey } from '@/lib/social/share';

interface ProductShareButtonProps {
  product: ShareableProduct;
  variant?: 'inline' | 'detail';
}

const buttonSx = {
  borderRadius: '999px',
  textTransform: 'none',
  fontWeight: 700,
};

export default function ProductShareButton({ product, variant = 'inline' }: ProductShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<{ severity: 'success' | 'error'; message: string } | null>(null);

  const shareText = buildShareText(product);
  const links = buildShareLinks(product);

  const handleOpenShare = () => setOpen(true);
  const handleCloseShare = () => setOpen(false);

  const handleShare = async (network: Exclude<ShareNetworkKey, 'COPY_LINK'>) => {
    const url = links[network];
    window.open(url, '_blank', 'noopener,noreferrer,width=720,height=640');
    await recordShareEvent(product.id, network);
    setToast({ severity: 'success', message: `Compartido en ${network.toLowerCase()}.` });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(product.url);
      await recordShareEvent(product.id, 'COPY_LINK');
      setToast({ severity: 'success', message: 'Enlace copiado al portapapeles.' });
    } catch {
      setToast({ severity: 'error', message: 'No fue posible copiar el enlace.' });
    }
  };

  return (
    <>
      <Button
        type="button"
        onClick={handleOpenShare}
        startIcon={<ShareIcon />}
        variant={variant === 'detail' ? 'contained' : 'outlined'}
        sx={{
          ...buttonSx,
          bgcolor: variant === 'detail' ? '#D4AF37' : 'transparent',
          color: variant === 'detail' ? '#140e0a' : '#D4AF37',
          borderColor: 'rgba(212, 175, 55, 0.25)',
          '&:hover': {
            bgcolor: variant === 'detail' ? '#C29B30' : 'rgba(212, 175, 55, 0.08)',
            borderColor: '#D4AF37',
          },
        }}
      >
        Compartir
      </Button>

      <Dialog
        open={open}
        onClose={handleCloseShare}
        fullWidth
        maxWidth="sm"
        slotProps={{
          paper: {
            sx: {
              borderRadius: '24px',
              bgcolor: '#140f0c',
              color: '#FFFFF0',
              border: '1px solid rgba(212,175,55,0.16)',
            },
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          Compartir producto
          <IconButton onClick={handleCloseShare} sx={{ position: 'absolute', right: 16, top: 16, color: '#FFFFF0' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pb: 3 }}>
          <Box
            sx={{
              borderRadius: '20px',
              overflow: 'hidden',
              border: '1px solid rgba(212,175,55,0.12)',
              backgroundColor: '#111',
              mb: 3,
            }}
          >
            {product.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.imageUrl}
                alt={product.title}
                style={{ width: '100%', height: 220, objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <Box
                sx={{
                  height: 220,
                  display: 'grid',
                  placeItems: 'center',
                  background: 'linear-gradient(135deg, rgba(242,200,107,0.18), rgba(24,18,12,0.95))',
                }}
              >
                <Typography sx={{ color: '#D4AF37', fontFamily: 'var(--font-display)', fontSize: '2rem' }}>
                  {product.title}
                </Typography>
              </Box>
            )}

            <Box sx={{ p: 2.2 }}>
              <Typography sx={{ color: '#D4AF37', fontSize: '0.8rem', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                Preview de compartido
              </Typography>
              <Typography sx={{ color: '#FFFFF0', fontFamily: 'var(--font-display)', fontSize: '2rem', mt: 1 }}>
                {product.title}
              </Typography>
              <Typography sx={{ color: '#BDBDBD', mt: 1.2, lineHeight: 1.7 }}>{shareText}</Typography>
            </Box>
          </Box>

          <Stack spacing={1.3}>
            <Button onClick={() => handleShare('WHATSAPP')} startIcon={<WhatsAppIcon />} variant="outlined" sx={{ ...buttonSx, color: '#FFFFF0', borderColor: 'rgba(212,175,55,0.16)', justifyContent: 'flex-start' }}>
              WhatsApp
            </Button>
            <Button onClick={() => handleShare('FACEBOOK')} startIcon={<FacebookIcon />} variant="outlined" sx={{ ...buttonSx, color: '#FFFFF0', borderColor: 'rgba(212,175,55,0.16)', justifyContent: 'flex-start' }}>
              Facebook
            </Button>
            <Button onClick={() => handleShare('TWITTER')} startIcon={<XIcon />} variant="outlined" sx={{ ...buttonSx, color: '#FFFFF0', borderColor: 'rgba(212,175,55,0.16)', justifyContent: 'flex-start' }}>
              Twitter / X
            </Button>
            <Button onClick={() => handleShare('LINKEDIN')} startIcon={<LinkedInIcon />} variant="outlined" sx={{ ...buttonSx, color: '#FFFFF0', borderColor: 'rgba(212,175,55,0.16)', justifyContent: 'flex-start' }}>
              LinkedIn
            </Button>
            <Button onClick={handleCopy} startIcon={<ContentCopyIcon />} variant="contained" sx={{ ...buttonSx, bgcolor: '#D4AF37', color: '#140e0a', justifyContent: 'flex-start', '&:hover': { bgcolor: '#C29B30' } }}>
              Copiar enlace
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={2800}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={toast?.severity ?? 'success'} onClose={() => setToast(null)} variant="filled">
          {toast?.message}
        </Alert>
      </Snackbar>
    </>
  );
}
