import Link from 'next/link';
import AdminShell from '@/components/admin/AdminShell';
import { Box, Chip, Paper, Stack, Typography } from '@mui/material';
import { requireAdminSession } from '@/lib/auth/guards';
import { getVisibleAdminNavigation } from '@/lib/admin/navigation';

export default async function AdminDashboard() {
    const session = await requireAdminSession();
    const modules = getVisibleAdminNavigation(session.role).filter((item) => item.key !== 'dashboard');

    return (
        <AdminShell
            title="Bienvenido al Templo de Control"
            description="El acceso a este panel ahora está protegido con usuario, contraseña y sesión. Desde aquí podremos conectar creación de productos, pedidos y configuraciones internas."
            email={session.email}
            role={session.role}
        >
            <Stack spacing={3.2}>
                <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1.2 }}>
                    {modules.map((module) => (
                        <Link
                            key={module.key}
                            href={module.href}
                            style={{
                                color: module.key === 'products' ? '#000' : '#FFFFF0',
                                backgroundColor: module.key === 'products' ? '#D4AF37' : 'transparent',
                                border: '1px solid rgba(212, 175, 55, 0.22)',
                                textDecoration: 'none',
                                padding: '12px 18px',
                                borderRadius: '999px',
                                fontWeight: 700,
                            }}
                        >
                            {module.label}
                        </Link>
                    ))}
                </Stack>

                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' },
                        gap: 2,
                    }}
                >
                    {[
                        { title: 'Ventas Hoy', value: '$ 0', helper: 'Pendiente conectar Bold' },
                        { title: 'Órdenes Pendientes', value: '0', helper: 'Centro operativo preparado' },
                        { title: 'Productos Publicados', value: 'Catálogo activo', helper: 'Admin con filtros y acciones' },
                        { title: 'Estado del panel', value: 'Protegido', helper: 'Sesión y navegación unificada' },
                    ].map((card) => (
                        <Paper
                            key={card.title}
                            elevation={0}
                            sx={{
                                p: 2.4,
                                borderRadius: '22px',
                                bgcolor: '#111',
                                border: '1px solid rgba(212,175,55,0.12)',
                            }}
                        >
                            <Typography sx={{ color: '#D4AF37', fontWeight: 700 }}>{card.title}</Typography>
                            <Typography sx={{ color: '#FFFFF0', fontFamily: 'var(--font-display)', fontSize: '2rem', mt: 1 }}>
                                {card.value}
                            </Typography>
                            <Typography sx={{ color: '#BDBDBD', mt: 0.8, lineHeight: 1.7 }}>{card.helper}</Typography>
                        </Paper>
                    ))}
                </Box>

                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 2, md: 2.5 },
                        borderRadius: '24px',
                        bgcolor: '#111',
                        border: '1px solid rgba(212,175,55,0.12)',
                    }}
                >
                    <Typography sx={{ color: '#D4AF37', fontFamily: 'var(--font-display)', fontSize: '2rem' }}>
                        Módulos del panel
                    </Typography>
                    <Typography sx={{ color: '#BDBDBD', mt: 1, mb: 2.5, lineHeight: 1.7 }}>
                        Navegación clara, mobile-first y preparada para crecer por módulo sin perder consistencia visual.
                    </Typography>

                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                            gap: 2,
                        }}
                    >
                        {modules.map((module) => (
                            <Link
                                key={module.key}
                                href={module.href}
                                style={{
                                    textDecoration: 'none',
                                }}
                            >
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 2.2,
                                        borderRadius: '20px',
                                        bgcolor: 'rgba(255,255,255,0.02)',
                                        border: '1px solid rgba(212,175,55,0.1)',
                                        transition: 'transform 160ms ease, border-color 160ms ease',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            borderColor: 'rgba(212,175,55,0.26)',
                                        },
                                    }}
                                >
                                    <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Box>
                                            <Typography sx={{ color: '#FFFFF0', fontWeight: 700, fontSize: '1.05rem' }}>
                                                {module.label}
                                            </Typography>
                                            <Typography sx={{ color: '#BDBDBD', mt: 0.8, lineHeight: 1.7 }}>
                                                {module.description}
                                            </Typography>
                                        </Box>
                                        <Chip label="Abrir" size="small" sx={{ bgcolor: 'rgba(212,175,55,0.12)', color: '#D4AF37' }} />
                                    </Stack>
                                </Paper>
                            </Link>
                        ))}
                    </Box>
                </Paper>

                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 2, md: 2.5 },
                        borderRadius: '24px',
                        bgcolor: '#111',
                        border: '1px solid rgba(212,175,55,0.12)',
                        maxWidth: '760px',
                    }}
                >
                    <Typography sx={{ color: '#D4AF37', fontFamily: 'var(--font-display)', fontSize: '1.8rem' }}>
                        Ruta recomendada
                    </Typography>
                    <Typography sx={{ color: '#BDBDBD', mt: 1, mb: 1.5, lineHeight: 1.7 }}>
                        Para que el administrador no se pierda, el panel ya conserva una jerarquía visible y consistente.
                    </Typography>
                    <Typography sx={{ color: '#FFFFF0' }}>
                        Dashboard → Módulo → Listado → Acción
                    </Typography>
                </Paper>
            </Stack>
        </AdminShell>
    );
}
