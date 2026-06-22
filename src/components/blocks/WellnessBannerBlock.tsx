import type { CSSProperties } from 'react';
import Link from 'next/link';
import { Heart, Leaf, Sparkles } from 'lucide-react';
import type { BuilderBlockContent } from '@/lib/builder/types';

interface WellnessBannerBlockProps {
  content?: BuilderBlockContent;
}

const fallbackBenefits = [
  {
    title: '100% Natural',
    body: 'Ingredientes puros y seleccionados',
    icon: Leaf,
  },
  {
    title: 'Hecho con intención',
    body: 'Cada producto elaborado con amor y conciencia',
    icon: Sparkles,
  },
  {
    title: 'Conecta & Equilibra',
    body: 'Rituales que nutren tu bienestar integral',
    icon: Heart,
  },
];

export default function WellnessBannerBlock({ content }: WellnessBannerBlockProps) {
  const backgroundColor = content?.bannerBackgroundColor || '#fbf4e8';
  const textColor = content?.bannerTextColor || '#46352c';
  const accentColor = content?.bannerAccentColor || '#c4912d';
  const mutedColor = content?.bannerMutedColor || '#6f6659';
  const imageUrl = content?.image?.trim();
  const benefits = [
    {
      title: content?.benefitOneTitle || fallbackBenefits[0].title,
      body: content?.benefitOneBody || fallbackBenefits[0].body,
      icon: fallbackBenefits[0].icon,
    },
    {
      title: content?.benefitTwoTitle || fallbackBenefits[1].title,
      body: content?.benefitTwoBody || fallbackBenefits[1].body,
      icon: fallbackBenefits[1].icon,
    },
    {
      title: content?.benefitThreeTitle || fallbackBenefits[2].title,
      body: content?.benefitThreeBody || fallbackBenefits[2].body,
      icon: fallbackBenefits[2].icon,
    },
  ];
  const cssVars = {
    '--wellness-banner-bg': backgroundColor,
    '--wellness-banner-text': textColor,
    '--wellness-banner-accent': accentColor,
    '--wellness-banner-muted': mutedColor,
  } as CSSProperties;

  return (
    <section className="wellness-banner-block" style={cssVars}>
      <div className="wellness-banner-copy">
        <p className="wellness-banner-eyebrow">
          {content?.eyebrow || 'BIENESTAR PARA LLEVAR CONTIGO ✧'}
        </p>
        <h2>{content?.title || 'Armonía para tu cuerpo, mente y espíritu'}</h2>
        <p className="wellness-banner-body">
          {content?.body ||
            'Productos naturales y rituales conscientes para acompañarte en tu bienestar holístico cada día.'}
        </p>

        <div className="wellness-banner-actions">
          <Link className="wellness-banner-primary" href={content?.ctaHref || '/#catalogo'}>
            {content?.ctaLabel || 'Explorar tienda'}
          </Link>
          <Link className="wellness-banner-secondary" href={content?.secondaryCtaHref || '/blog'}>
            {content?.secondaryCtaLabel || 'Descubrir rituales'}
          </Link>
        </div>

        <div className="wellness-banner-benefits" aria-label="Beneficios destacados">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <article key={benefit.title} className="wellness-banner-benefit">
                <span className="wellness-banner-benefit-icon" aria-hidden="true">
                  <Icon size={22} strokeWidth={1.7} />
                </span>
                <span>
                  <strong>{benefit.title}</strong>
                  <small>{benefit.body}</small>
                </span>
              </article>
            );
          })}
        </div>
      </div>

      <div className="wellness-banner-visual" aria-label="Imagen principal del banner">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- Builder images can be local, Cloudinary, or pasted URLs.
          <img src={imageUrl} alt={content?.title || 'Banner de bienestar Amantra'} />
        ) : (
          <div className="wellness-banner-placeholder">
            <Leaf size={44} />
            <span>Selecciona una imagen para el banner</span>
          </div>
        )}
      </div>
    </section>
  );
}
