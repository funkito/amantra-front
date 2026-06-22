import Link from 'next/link';
import { Search } from 'lucide-react';
import type { BuilderBlockContent } from '@/lib/builder/types';

interface SiteMenuProps {
  brandLabel?: string;
  ctaLabel?: string;
  ctaHref?: string;
  compact?: boolean;
  content?: BuilderBlockContent;
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
  content,
}: SiteMenuProps) {
  const brandName = content?.brandName || brandLabel;
  const logoUrl = content?.logoUrl?.trim();
  const backgroundColor = content?.menuBackgroundColor || '#ffffff';
  const textColor = content?.menuTextColor || '#4b4038';
  const linkColor = content?.menuLinkColor || textColor;
  const linkBorderColor = content?.menuLinkBorderColor || 'rgba(196,145,45,0.28)';
  const ctaBackgroundColor = content?.menuCtaBackgroundColor || '#f2c86b';
  const ctaTextColor = content?.menuCtaTextColor || '#140e0a';
  const showSearch = content?.showSearch ?? true;
  const socialLinks = [
    { label: 'Instagram', href: content?.instagramUrl, shortLabel: 'IG' },
    { label: 'Facebook', href: content?.facebookUrl, shortLabel: 'FB' },
    { label: 'TikTok', href: content?.tiktokUrl, shortLabel: 'TT' },
  ].filter((item): item is { label: string; href: string; shortLabel: string } => Boolean(item.href));

  return (
    <header
      className={`site-menu-shell${compact ? ' compact' : ''}`}
      style={{
        background: backgroundColor,
        color: textColor,
        borderColor: linkBorderColor,
      }}
    >
      <div className="site-menu-inner">
        <Link href="/" className="site-menu-brand" style={{ color: textColor }}>
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- Logo URL is managed by the builder media library.
            <img src={logoUrl} alt={brandName} className="site-menu-logo" />
          ) : (
            brandName
          )}
        </Link>

        <nav className="site-menu-nav" aria-label="Navegación principal de Amantra">
          {menuLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="site-menu-link"
              style={{
                color: linkColor,
                borderColor: linkBorderColor,
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="site-menu-tools">
          {showSearch ? (
            <form className="site-menu-search" action="/" style={{ borderColor: linkBorderColor }}>
              <Search size={16} aria-hidden="true" />
              <input
                name="q"
                placeholder={content?.searchPlaceholder || 'Buscar'}
                style={{ color: linkColor }}
              />
            </form>
          ) : null}

          {socialLinks.length > 0 ? (
            <div className="site-menu-socials" aria-label="Redes sociales">
              {socialLinks.map((item) => {
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="site-menu-social-link"
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: linkColor, borderColor: linkBorderColor }}
                    aria-label={item.label}
                  >
                    {item.shortLabel}
                  </Link>
                );
              })}
            </div>
          ) : null}

          {ctaLabel && ctaHref ? (
            <Link
              href={ctaHref}
              className="site-menu-cta"
              style={{
                background: ctaBackgroundColor,
                color: ctaTextColor,
              }}
            >
              {ctaLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
