import { prisma } from '@/lib/prisma';

export async function getAdminBootstrapState() {
  try {
    const adminCount = await prisma.user.count({
      where: {
        role: {
          in: ['SUPERADMIN', 'EDITOR', 'VENDEDOR'],
        },
      },
    });

    return {
      adminCount,
      databaseError: null,
    };
  } catch (error) {
    console.error('Admin bootstrap state error:', error);

    return {
      adminCount: 0,
      databaseError:
        'No fue posible conectar con PostgreSQL. Revisa tu DATABASE_URL, el usuario, la contraseña y que el servicio esté encendido.',
    };
  }
}
