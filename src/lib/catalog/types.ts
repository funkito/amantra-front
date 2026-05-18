export interface CatalogProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  origin: string;
  category: string;
  imageLabel: string;
  price: number;
  accent: string;
  notes: string[];
  imageUrl?: string | null;
  images?: string[];
  productUrl?: string;
  shippingLabel?: string;
  shippingCost?: number;
}
