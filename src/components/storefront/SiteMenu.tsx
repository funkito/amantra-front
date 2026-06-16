import Link from 'next/link';

interface SiteMenuProps {
  brandLabel?: string;
  ctaLabel?: string;
  ctaHref?: string;
  compact?: boolean;
}

const menuLinks = [
  { label: 'Inicio', href: '/' },
  { label: 'Catálogo', href: '/#catalogo' },
  { label: 'Blog', href: '/blog' },
];

export default function SiteMenu({
  brandLabel = 'Amantra',
  ctaLabel = 'Explorar colección',
  ctaHref = '/#catalogo',
  compact = false,
}: SiteMenuProps) {
  return (
    <header className={`site-menu-shell${compact ? ' compact' : ''}`}>
      <div className="site-menu-inner">
        <Link href="/" className="site-menu-brand">
          {brandLabel}
        </Link>

        <nav className="site-menu-nav" aria-label="Navegación principal de Amantra">
          {menuLinks.map((item) => (
            <Link key={item.href} href={item.href} className="site-menu-link">
              {item.label}
            </Link>
          ))}
        </nav>

        {ctaLabel && ctaHref ? (
          <Link href={ctaHref} className="site-menu-cta">
            {ctaLabel}
          </Link>
        ) : null}
      </div>
    </header>
  );
}
