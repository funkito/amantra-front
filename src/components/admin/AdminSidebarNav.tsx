'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { AdminRole } from '@/lib/auth/token';
import { getVisibleAdminNavigation } from '@/lib/admin/navigation';

interface AdminSidebarNavProps {
  role: AdminRole;
}

function navLinkStyle(active: boolean) {
  return {
    color: active ? '#000' : '#FFFFF0',
    backgroundColor: active ? '#D4AF37' : 'transparent',
    border: active ? '1px solid #D4AF37' : '1px solid rgba(212, 175, 55, 0.14)',
    textDecoration: 'none',
    fontSize: '0.95rem',
    fontWeight: active ? 700 : 500,
    padding: '12px 14px',
    borderRadius: '14px',
    transition: 'all 160ms ease',
  } as const;
}

export default function AdminSidebarNav({ role }: AdminSidebarNavProps) {
  const pathname = usePathname();
  const items = getVisibleAdminNavigation(role);

  return (
    <nav style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {items.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          style={navLinkStyle(item.href === '/admin_group' ? pathname === '/admin_group' : pathname.startsWith(item.href))}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
