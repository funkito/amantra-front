import type { AdminRole } from '@/lib/auth/token';

export type AdminModuleKey =
  | 'dashboard'
  | 'products'
  | 'orders'
  | 'builder'
  | 'blog'
  | 'tags'
  | 'newsletter'
  | 'users'
  | 'settings';

export type AdminNavItem = {
  key: AdminModuleKey;
  label: string;
  description: string;
  href: string;
  allowedRoles?: AdminRole[];
};

export const adminNavigation: AdminNavItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    description: 'Resumen del negocio y accesos rápidos.',
    href: '/admin_group',
  },
  {
    key: 'products',
    label: 'Productos',
    description: 'Catálogo, variantes, publicación y compartidos.',
    href: '/admin_group/admin/products',
    allowedRoles: ['SUPERADMIN', 'EDITOR'],
  },
  {
    key: 'orders',
    label: 'Órdenes',
    description: 'Seguimiento de compras, pagos y estados.',
    href: '/admin_group/admin/orders',
    allowedRoles: ['SUPERADMIN', 'EDITOR'],
  },
  {
    key: 'builder',
    label: 'Builder',
    description: 'Editor visual de páginas y bloques del storefront.',
    href: '/admin_group/admin/builder',
    allowedRoles: ['SUPERADMIN', 'EDITOR'],
  },
  {
    key: 'blog',
    label: 'Blog',
    description: 'Contenido editorial y estrategia orgánica.',
    href: '/admin_group/admin/blog',
    allowedRoles: ['SUPERADMIN', 'EDITOR'],
  },
  {
    key: 'tags',
    label: 'Etiquetas',
    description: 'Vocabulario, filtros y relaciones de contenido.',
    href: '/admin_group/admin/tags',
    allowedRoles: ['SUPERADMIN', 'EDITOR'],
  },
  {
    key: 'newsletter',
    label: 'Newsletter',
    description: 'Interesados, captación y base inicial para campañas.',
    href: '/admin_group/admin/newsletter',
    allowedRoles: ['SUPERADMIN', 'EDITOR'],
  },
  {
    key: 'users',
    label: 'Usuarios',
    description: 'Clientes, administradores y permisos.',
    href: '/admin_group/admin/users',
    allowedRoles: ['SUPERADMIN'],
  },
  {
    key: 'settings',
    label: 'Configuración',
    description: 'Ajustes globales, integraciones y llaves.',
    href: '/admin_group/admin/settings',
    allowedRoles: ['SUPERADMIN'],
  },
];

export function getVisibleAdminNavigation(role: AdminRole) {
  return adminNavigation.filter((item) => !item.allowedRoles || item.allowedRoles.includes(role));
}
