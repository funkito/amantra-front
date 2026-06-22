import type { BuilderBlockDefinition, BuilderBlockType, BuilderTemplateDefinition } from '@/lib/builder/types';

export const builderBlockLibrary: BuilderBlockDefinition[] = [
  {
    type: 'site_menu',
    label: 'Menú principal',
    description: 'Navegación pública para volver al inicio, catálogo y blog desde cualquier landing.',
    category: 'utility',
    icon: 'menu',
    defaultNode: {
      type: 'site_menu',
      props: {
        paddingY: '18',
        paddingX: '24',
        bgColor: '#120d09',
        textColor: '#f5eddf',
        containerWidth: 'xl',
        textAlign: 'left',
        stylePreset: 'default',
        responsiveVisibility: {
          desktop: true,
          tablet: true,
          mobile: true,
        },
      },
      content: {
        title: 'Amantra',
        ctaLabel: 'Explorar colección',
        ctaHref: '/#catalogo',
      },
    },
  },
  {
    type: 'hero',
    label: 'Hero',
    description: 'Cabecera principal con título, CTA e imagen destacada.',
    category: 'structure',
    icon: 'panel-top',
    defaultNode: {
      type: 'hero',
      props: {
        paddingY: '96',
        paddingX: '24',
        bgColor: '#1b130e',
        textColor: '#f5eddf',
        containerWidth: 'xl',
        textAlign: 'left',
        stylePreset: 'warm',
        responsiveVisibility: {
          desktop: true,
          tablet: true,
          mobile: true,
        },
      },
      content: {
        title: 'Bienestar, diseño y carácter para Amantra',
        subtitle: 'Hero inicial',
        body: 'Bloque principal listo para edición inline y estilos contextuales en la siguiente capa.',
        ctaLabel: 'Explorar colección',
        ctaHref: '/products',
        image: '',
      },
    },
  },
  {
    type: 'section',
    label: 'Sección',
    description: 'Contenedor estructural para introducir contenido o futuras columnas.',
    category: 'structure',
    icon: 'square-stack',
    defaultNode: {
      type: 'section',
      props: {
        paddingY: '64',
        paddingX: '24',
        bgColor: '#111111',
        textColor: '#f5eddf',
        containerWidth: 'lg',
        textAlign: 'left',
        stylePreset: 'default',
        responsiveVisibility: {
          desktop: true,
          tablet: true,
          mobile: true,
        },
      },
      content: {
        title: 'Nueva sección',
        body: 'Área flexible para empezar a construir la página por bloques.',
      },
    },
  },
  {
    type: 'columns',
    label: 'Columnas',
    description: 'Bloque de dos columnas internas para contenido editorial o comparativo.',
    category: 'structure',
    icon: 'columns-2',
    defaultNode: {
      type: 'columns',
      props: {
        paddingY: '56',
        paddingX: '24',
        bgColor: '#16110d',
        textColor: '#f5eddf',
        containerWidth: 'xl',
        textAlign: 'left',
        stylePreset: 'default',
        responsiveVisibility: {
          desktop: true,
          tablet: true,
          mobile: true,
        },
      },
      content: {
        title: 'Sección en columnas',
        body: 'Diseñada para storytelling con dos áreas internas editables.',
        leftTitle: 'Columna izquierda',
        leftBody: 'Usa este espacio para beneficios, inspiración o contexto de producto.',
        rightTitle: 'Columna derecha',
        rightBody: 'Ideal para contrastes, detalles de materiales, procesos o llamados a la acción.',
      },
    },
  },
  {
    type: 'product_grid',
    label: 'Grid de productos',
    description: 'Módulo para conectar catálogo dinámico con filtros y límites.',
    category: 'products',
    icon: 'grid-2x2',
    defaultNode: {
      type: 'product_grid',
      props: {
        paddingY: '48',
        paddingX: '24',
        bgColor: '#120d09',
        textColor: '#f5eddf',
        containerWidth: 'xl',
        textAlign: 'left',
        columns: 3,
        limit: 6,
        stylePreset: 'editorial',
        responsiveVisibility: {
          desktop: true,
          tablet: true,
          mobile: true,
        },
      },
      content: {
        title: 'Productos destacados',
        body: 'Bloque reservado para catálogo público y filtros comerciales.',
        productTag: '',
      },
    },
  },
  {
    type: 'blog_grid',
    label: 'Grid de blog',
    description: 'Módulo para mostrar artículos publicados y filtrarlos por etiqueta editorial.',
    category: 'blog',
    icon: 'layout-grid',
    defaultNode: {
      type: 'blog_grid',
      props: {
        paddingY: '48',
        paddingX: '24',
        bgColor: '#151015',
        textColor: '#f4edf8',
        containerWidth: 'xl',
        textAlign: 'left',
        columns: 3,
        limit: 6,
        stylePreset: 'editorial',
        responsiveVisibility: {
          desktop: true,
          tablet: true,
          mobile: true,
        },
      },
      content: {
        title: 'Historias desde Amantra',
        body: 'Muestra artículos recientes o filtra por una etiqueta concreta del blog.',
        blogTag: '',
      },
    },
  },
  {
    type: 'featured_product',
    label: 'Producto destacado',
    description: 'Bloque editorial para resaltar un producto con foco visual y CTA.',
    category: 'products',
    icon: 'sparkles',
    defaultNode: {
      type: 'featured_product',
      props: {
        paddingY: '56',
        paddingX: '24',
        bgColor: '#1a130d',
        textColor: '#f5eddf',
        containerWidth: 'xl',
        textAlign: 'left',
        stylePreset: 'warm',
        responsiveVisibility: {
          desktop: true,
          tablet: true,
          mobile: true,
        },
      },
      content: {
        title: 'Producto protagonista',
        subtitle: 'Selección de la semana',
        body: 'Presenta una pieza con narrativa de marca, imagen amplia y llamada clara a la acción.',
        image: '',
        ctaLabel: 'Comprar ahora',
        ctaHref: '/products',
      },
    },
  },
  {
    type: 'blog_teaser',
    label: 'Teaser de blog',
    description: 'Promoción de artículo o contenido editorial con imagen y enlace.',
    category: 'blog',
    icon: 'newspaper',
    defaultNode: {
      type: 'blog_teaser',
      props: {
        paddingY: '48',
        paddingX: '24',
        bgColor: '#151015',
        textColor: '#f4edf8',
        containerWidth: 'lg',
        textAlign: 'left',
        stylePreset: 'editorial',
        responsiveVisibility: {
          desktop: true,
          tablet: true,
          mobile: true,
        },
      },
      content: {
        title: 'Desde el blog Amantra',
        subtitle: 'Historia destacada',
        body: 'Usa este bloque para llevar tráfico a una historia, guía o editorial de temporada.',
        image: '',
        ctaLabel: 'Leer artículo',
        ctaHref: '/blog',
      },
    },
  },
  {
    type: 'rich_text',
    label: 'Texto enriquecido',
    description: 'Bloque editorial para titulares, descripciones y storytelling.',
    category: 'blog',
    icon: 'text-cursor-input',
    defaultNode: {
      type: 'rich_text',
      props: {
        paddingY: '40',
        paddingX: '24',
        bgColor: '#16110d',
        textColor: '#f5eddf',
        containerWidth: 'md',
        textAlign: 'left',
        stylePreset: 'default',
        responsiveVisibility: {
          desktop: true,
          tablet: true,
          mobile: true,
        },
      },
      content: {
        title: 'Texto editable',
        body: 'Preparado para edición inline y sanitización estricta en la siguiente capa.',
      },
    },
  },
  {
    type: 'image_banner',
    label: 'Banner multimedia',
    description: 'Bloque visual para imagen promocional o campaña estacional.',
    category: 'multimedia',
    icon: 'image',
    defaultNode: {
      type: 'image_banner',
      props: {
        paddingY: '48',
        paddingX: '24',
        bgColor: '#201712',
        textColor: '#f5eddf',
        containerWidth: 'xl',
        textAlign: 'left',
        stylePreset: 'contrast',
        responsiveVisibility: {
          desktop: true,
          tablet: true,
          mobile: true,
        },
      },
      content: {
        title: 'Campaña visual',
        body: 'Ideal para banners promocionales, editoriales o storytelling de temporada.',
        image: '',
      },
    },
  },
  {
    type: 'wellness_banner',
    label: 'Banner bienestar',
    description: 'Banner premium editable con imagen lateral, beneficios, botones y colores personalizados.',
    category: 'marketing',
    icon: 'leaf',
    defaultNode: {
      type: 'wellness_banner',
      props: {
        paddingY: '32',
        paddingX: '24',
        bgColor: '#fff8ef',
        textColor: '#46352c',
        containerWidth: 'full',
        textAlign: 'left',
        stylePreset: 'warm',
        responsiveVisibility: {
          desktop: true,
          tablet: true,
          mobile: true,
        },
      },
      content: {
        eyebrow: 'BIENESTAR PARA LLEVAR CONTIGO ✧',
        title: 'Armonía para tu cuerpo, mente y espíritu',
        body: 'Productos naturales y rituales conscientes para acompañarte en tu bienestar holístico cada día.',
        image: '',
        ctaLabel: 'Explorar tienda',
        ctaHref: '/#catalogo',
        secondaryCtaLabel: 'Descubrir rituales',
        secondaryCtaHref: '/blog',
        bannerBackgroundColor: '#fbf4e8',
        bannerTextColor: '#46352c',
        bannerAccentColor: '#c4912d',
        bannerMutedColor: '#6f6659',
        benefitOneTitle: '100% Natural',
        benefitOneBody: 'Ingredientes puros y seleccionados',
        benefitTwoTitle: 'Hecho con intención',
        benefitTwoBody: 'Cada producto elaborado con amor y conciencia',
        benefitThreeTitle: 'Conecta & Equilibra',
        benefitThreeBody: 'Rituales que nutren tu bienestar integral',
      },
    },
  },
  {
    type: 'newsletter_cta',
    label: 'CTA newsletter',
    description: 'Sección de captación para email marketing y automatizaciones.',
    category: 'marketing',
    icon: 'mail-plus',
    defaultNode: {
      type: 'newsletter_cta',
      props: {
        paddingY: '40',
        paddingX: '24',
        bgColor: '#2a1d12',
        textColor: '#f5eddf',
        containerWidth: 'md',
        textAlign: 'left',
        stylePreset: 'warm',
        responsiveVisibility: {
          desktop: true,
          tablet: true,
          mobile: true,
        },
      },
      content: {
        title: 'Suscríbete a Amantra',
        body: 'Bloque orientado a captación y mensajes de marca.',
        ctaLabel: 'Quiero novedades',
        ctaHref: '',
      },
    },
  },
];

export const builderBlockCategories = [
  { key: 'structure', label: 'Estructura' },
  { key: 'products', label: 'Productos' },
  { key: 'blog', label: 'Blog' },
  { key: 'multimedia', label: 'Multimedia' },
  { key: 'marketing', label: 'Marketing' },
  { key: 'utility', label: 'Utilidad' },
] as const;

export const builderSectionTemplates: BuilderTemplateDefinition[] = [
  {
    id: 'editorial-launch',
    label: 'Lanzamiento Editorial',
    description: 'Hero + banner visual + texto de apoyo para campañas o nuevas colecciones.',
    blocks: [
      {
        type: 'site_menu',
        props: { stylePreset: 'default', paddingY: '18' },
        content: {
          title: 'Amantra',
          ctaLabel: 'Explorar colección',
          ctaHref: '/#catalogo',
        },
      },
      {
        type: 'hero',
        props: { stylePreset: 'editorial', bgColor: '#17120f', textColor: '#f6efe5' },
        content: {
          title: 'Colección Amantra de Temporada',
          body: 'Una composición elegante para aterrizar una colección o narrar una cápsula editorial.',
          ctaLabel: 'Ver colección',
          ctaHref: '/products',
        },
      },
      {
        type: 'image_banner',
        props: { stylePreset: 'contrast', paddingY: '32' },
        content: {
          title: 'Imagen central de campaña',
          body: 'Intercambia esta imagen por una visual principal y refuerza el storytelling.',
        },
      },
      {
        type: 'rich_text',
        props: { stylePreset: 'default', containerWidth: 'lg' },
        content: {
          title: 'Manifiesto de colección',
          body: 'Usa este bloque para introducir materiales, inspiración y detalles que eleven la experiencia de la página.',
        },
      },
    ],
  },
  {
    id: 'catalog-cta',
    label: 'Catálogo + CTA',
    description: 'Sección de catálogo con remate de newsletter o acción comercial.',
    blocks: [
      {
        type: 'site_menu',
        props: { stylePreset: 'default', paddingY: '18' },
        content: {
          title: 'Amantra',
          ctaLabel: 'Explorar colección',
          ctaHref: '/#catalogo',
        },
      },
      {
        type: 'section',
        props: { stylePreset: 'warm', containerWidth: 'xl' },
        content: {
          title: 'Selección curada',
          body: 'Empieza con un intro breve y lleva al usuario al grid de productos o categorías.',
        },
      },
      {
        type: 'product_grid',
        props: { columns: 3, limit: 6, stylePreset: 'editorial' },
        content: {
          title: 'Favoritos de Amantra',
          body: 'Grid listo para conectarse con colecciones o etiquetas destacadas.',
          productTag: '',
        },
      },
      {
        type: 'newsletter_cta',
        props: { stylePreset: 'warm' },
        content: {
          title: 'Recibe novedades y lanzamientos',
          body: 'Cierra la página con una llamada clara y accionable.',
          ctaLabel: 'Suscribirme',
          ctaHref: '',
        },
      },
    ],
  },
];

export function getBlockDefinition(type: BuilderBlockType) {
  return builderBlockLibrary.find((block) => block.type === type);
}

export function getBuilderTemplate(templateId: string) {
  return builderSectionTemplates.find((template) => template.id === templateId);
}
