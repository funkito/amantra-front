import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface AdminBreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function AdminBreadcrumbs({ items }: AdminBreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <div key={`${item.label}-${index}`} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  style={{
                    color: '#D4AF37',
                    textDecoration: 'none',
                    fontSize: '0.95rem',
                  }}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  style={{
                    color: isLast ? '#FFFFF0' : '#D4AF37',
                    fontSize: '0.95rem',
                  }}
                >
                  {item.label}
                </span>
              )}

              {!isLast ? <span style={{ color: '#8f846d' }}>/</span> : null}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
