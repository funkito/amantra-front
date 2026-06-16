'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  AppBar,
  Avatar,
  Box,
  Chip,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import ViewQuiltRoundedIcon from '@mui/icons-material/ViewQuiltRounded';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import LocalOfferRoundedIcon from '@mui/icons-material/LocalOfferRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import type { AdminRole } from '@/lib/auth/token';
import LogoutButton from '@/components/admin/LogoutButton';
import { getVisibleAdminNavigation, type AdminNavItem, type AdminModuleKey } from '@/lib/admin/navigation';
import { useState } from 'react';

interface AdminShellClientProps {
  title: string;
  description?: string;
  email: string;
  role: AdminRole;
  children: ReactNode;
}

const drawerWidth = 304;

const iconByKey: Record<AdminModuleKey, ReactNode> = {
  dashboard: <DashboardRoundedIcon />,
  products: <Inventory2RoundedIcon />,
  orders: <ReceiptLongRoundedIcon />,
  builder: <ViewQuiltRoundedIcon />,
  blog: <ArticleRoundedIcon />,
  tags: <LocalOfferRoundedIcon />,
  newsletter: <MailOutlineRoundedIcon />,
  users: <GroupRoundedIcon />,
  settings: <SettingsRoundedIcon />,
};

function isItemActive(pathname: string, item: AdminNavItem) {
  if (item.href === '/admin_group') {
    return pathname === '/admin_group';
  }

  return pathname.startsWith(item.href);
}

function AdminSidebar({
  role,
  email,
  pathname,
  onNavigate,
}: {
  role: AdminRole;
  email: string;
  pathname: string;
  onNavigate?: () => void;
}) {
  const items = getVisibleAdminNavigation(role);

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#090806',
      }}
    >
      <Box sx={{ p: 2.5 }}>
        <Stack direction="row" spacing={1.4} sx={{ alignItems: 'center' }}>
          <Avatar sx={{ bgcolor: '#D4AF37', color: '#140e0a', fontWeight: 800 }}>A</Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ color: '#D4AF37', fontFamily: 'var(--font-display)', fontSize: '1.35rem' }}>
              AMANTRA ADMIN
            </Typography>
            <Typography sx={{ color: '#BDBDBD', fontSize: '0.88rem' }} noWrap>
              {email}
            </Typography>
          </Box>
        </Stack>

        <Chip
          label={role}
          size="small"
          sx={{
            mt: 1.6,
            bgcolor: 'rgba(212,175,55,0.12)',
            color: '#D4AF37',
            fontWeight: 700,
          }}
        />
      </Box>

      <Divider sx={{ borderColor: 'rgba(212,175,55,0.12)' }} />

      <List sx={{ px: 1.5, py: 1.5, display: 'grid', gap: 0.75 }}>
        {items.map((item) => {
          const active = isItemActive(pathname, item);

          return (
            <ListItemButton
              key={item.key}
              component={Link}
              href={item.href}
              onClick={onNavigate}
              sx={{
                borderRadius: '16px',
                alignItems: 'flex-start',
                px: 1.5,
                py: 1.25,
                border: active ? '1px solid #D4AF37' : '1px solid rgba(212,175,55,0.12)',
                bgcolor: active ? '#D4AF37' : 'transparent',
                color: active ? '#140e0a' : '#FFFFF0',
                '&:hover': {
                  bgcolor: active ? '#D4AF37' : 'rgba(255,255,255,0.03)',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 38, color: 'inherit', mt: 0.25 }}>{iconByKey[item.key]}</ListItemIcon>
              <ListItemText
                primary={item.label}
                secondary={item.description}
                slotProps={{
                  primary: {
                    sx: {
                      fontWeight: 700,
                      fontSize: '0.98rem',
                    },
                  },
                  secondary: {
                    sx: {
                      color: active ? 'rgba(20,14,10,0.8)' : '#A79A82',
                      lineHeight: 1.45,
                      mt: 0.2,
                    },
                  },
                }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Box sx={{ mt: 'auto', p: 2 }}>
        <Box
          sx={{
            border: '1px solid rgba(212,175,55,0.1)',
            borderRadius: '18px',
            p: 2,
            bgcolor: '#111',
            mb: 1.6,
          }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
            <AutoAwesomeRoundedIcon sx={{ color: '#D4AF37', fontSize: 18 }} />
            <Typography sx={{ color: '#D4AF37', fontSize: '0.8rem', letterSpacing: '0.12em' }}>
              NAVEGACIÓN
            </Typography>
          </Stack>
          <Typography sx={{ color: '#BDBDBD', fontSize: '0.9rem', lineHeight: 1.65 }}>
            Usa el menú para cambiar de módulo y conservar contexto incluso desde móvil.
          </Typography>
        </Box>

        <LogoutButton />
      </Box>
    </Box>
  );
}

export default function AdminShellClient({ title, description, email, role, children }: AdminShellClientProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobileDrawer = () => setMobileOpen(false);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#050505', color: '#FFFFF0' }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          display: { lg: 'none' },
          bgcolor: 'rgba(9,8,6,0.88)',
          backdropFilter: 'blur(18px)',
          borderBottom: '1px solid rgba(212,175,55,0.12)',
        }}
      >
        <Toolbar sx={{ gap: 1 }}>
          <IconButton edge="start" color="inherit" onClick={() => setMobileOpen(true)}>
            <MenuRoundedIcon />
          </IconButton>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ color: '#D4AF37', fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>
              AMANTRA ADMIN
            </Typography>
            <Typography sx={{ color: '#BDBDBD', fontSize: '0.8rem' }} noWrap>
              {title}
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={closeMobileDrawer}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', lg: 'none' },
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              bgcolor: '#090806',
              borderRight: '1px solid rgba(212,175,55,0.14)',
            },
          }}
        >
          <AdminSidebar role={role} email={email} pathname={pathname} onNavigate={closeMobileDrawer} />
        </Drawer>

        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', lg: 'block' },
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              bgcolor: '#090806',
              borderRight: '1px solid rgba(212,175,55,0.14)',
            },
          }}
          open
        >
          <AdminSidebar role={role} email={email} pathname={pathname} />
        </Drawer>

        <Box component="main" sx={{ flex: 1, minWidth: 0 }}>
          <Box
            sx={{
              px: { xs: 2, md: 3, xl: 4 },
              py: { xs: 2.5, md: 3.5, xl: 4.5 },
            }}
          >
            <Box sx={{ maxWidth: '1320px', mx: 'auto' }}>
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={2}
                sx={{ mb: 3.5, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'flex-end' } }}
              >
                <Box>
                  <Typography
                    sx={{
                      color: '#D4AF37',
                      fontFamily: 'var(--font-display)',
                      fontSize: { xs: '2rem', md: '2.5rem' },
                      lineHeight: 0.98,
                    }}
                  >
                    {title}
                  </Typography>
                  {description ? (
                    <Typography sx={{ color: '#BDBDBD', mt: 1.2, maxWidth: '840px', lineHeight: 1.75 }}>
                      {description}
                    </Typography>
                  ) : null}
                </Box>

                <Tooltip title={email}>
                  <Chip
                    label={email}
                    sx={{
                      maxWidth: '100%',
                      bgcolor: 'rgba(255,255,255,0.04)',
                      color: '#FFFFF0',
                      border: '1px solid rgba(212,175,55,0.12)',
                    }}
                  />
                </Tooltip>
              </Stack>

              {children}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
