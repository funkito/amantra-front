import type { CatalogProduct } from '@/lib/catalog/types';

export const catalogProducts: CatalogProduct[] = [
  {
    id: 'chai-masala-premium',
    slug: 'chai-masala-premium',
    name: 'Masala Chai Premium',
    description:
      'Mezcla aromatica con cardamomo, canela y clavo para una experiencia tradicional india.',
    origin: 'Jaipur',
    category: 'Infusiones',
    imageLabel: 'Masala Chai',
    price: 48000,
    accent: 'from-amber-500/80 via-orange-500/50 to-stone-950',
    notes: ['100 g', 'Origen artesanal', 'Ideal para ritual diario'],
  },
  {
    id: 'incienso-sandalwood',
    slug: 'incienso-sandalwood',
    name: 'Incienso de Sandalo',
    description:
      'Varillas de aroma profundo para ambientar espacios de calma, meditacion y descanso.',
    origin: 'Mysore',
    category: 'Bienestar',
    imageLabel: 'Sandalo',
    price: 36000,
    accent: 'from-amber-200/80 via-yellow-700/30 to-stone-950',
    notes: ['Caja x 20', 'Fragancia suave', 'Hecho a mano'],
  },
  {
    id: 'dupatta-bordado-lotus',
    slug: 'dupatta-bordado-lotus',
    name: 'Dupatta Lotus',
    description:
      'Textil liviano con bordado floral inspirado en palacios del norte de la India.',
    origin: 'Varanasi',
    category: 'Moda',
    imageLabel: 'Lotus',
    price: 129000,
    accent: 'from-rose-400/80 via-fuchsia-500/40 to-stone-950',
    notes: ['Tela suave', 'Edicion boutique', 'Acento ceremonial'],
  },
  {
    id: 'lampara-diya-bronce',
    slug: 'lampara-diya-bronce',
    name: 'Lampara Diya en Bronce',
    description:
      'Pieza decorativa para altares, regalos especiales o rincones de espiritualidad en casa.',
    origin: 'Delhi',
    category: 'Decoracion',
    imageLabel: 'Diya',
    price: 89000,
    accent: 'from-yellow-300/80 via-amber-600/40 to-stone-950',
    notes: ['Bronce pulido', 'Uso decorativo', 'Inspiracion ceremonial'],
  },
  {
    id: 'aceite-ayurveda-jasmin',
    slug: 'aceite-ayurveda-jasmin',
    name: 'Aceite Ayurveda Jazmin',
    description:
      'Aceite corporal para masaje con notas florales y sensacion nutritiva sobre la piel.',
    origin: 'Kerala',
    category: 'Cuidado personal',
    imageLabel: 'Jazmin',
    price: 67000,
    accent: 'from-emerald-400/80 via-lime-500/40 to-stone-950',
    notes: ['250 ml', 'Textura ligera', 'Uso corporal'],
  },
  {
    id: 'cuenco-kansa',
    slug: 'cuenco-kansa',
    name: 'Cuenco Kansa',
    description:
      'Cuenco metalico de tradicion ayurvedica para rituales de autocuidado y bienestar.',
    origin: 'Gujarat',
    category: 'Rituales',
    imageLabel: 'Kansa',
    price: 154000,
    accent: 'from-sky-400/80 via-cyan-500/40 to-stone-950',
    notes: ['Acabado artesanal', 'Pieza de autor', 'Coleccion Amantra'],
  },
];
