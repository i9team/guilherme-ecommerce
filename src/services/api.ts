import { supabase } from '../lib/supabase';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/mock-data';
const USE_SUPABASE = import.meta.env.VITE_USE_SUPABASE === 'true';

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number;
  category: string;
  subcategory: string;
  mainImage: string;
  images: string[];
  description: string;
  variations: Array<{
    type: string;
    name: string;
    options: string[];
  }>;
  stock: number;
  rating: number;
  reviewCount: number;
}

export interface Banner {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  link: string;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  location?: string;
  rating: number;
  comment: string;
  date: string;
  images: string[];
  verified: boolean;
}

export interface ShippingOption {
  id: string;
  name: string;
  deliveryTime: string;
  price: number;
  minPurchase?: number;
}

export interface CheckoutData {
  items: Array<{
    productId: string;
    quantity: number;
    selectedVariations: Record<string, string>;
  }>;
  customer: {
    name: string;
    email: string;
    phone: string;
    cpf: string;
  };
  shipping: {
    zipCode: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  shippingOption: string;
}

export interface StoreInfo {
  name: string;
  logo: string;
  rating: number;
  totalReviews: number;
  reviews: Review[];
}

export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export interface PixPaymentResponse {
  orderId: string;
  pixCode: string;
  pixQrCode: string;
  amount: number;
  expiresAt: string;
}

export interface CheckoutConfig {
  mode: 'steps' | 'direct';
  enabledFields: Record<string, boolean>;
  orderBumps: {
    enabled: boolean;
    position: 'step1' | 'step2';
  };
}

export interface SiteConfig {
  siteName: string;
  logo: string;
  favicon: string;
  tagline: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  contact: {
    email: string;
    phone: string;
    whatsapp: string;
  };
  social: {
    instagram: string;
    facebook: string;
    twitter: string;
  };
}

export interface OffersConfig {
  pageTitle: string;
  pageDescription: string;
  sections: {
    topDeals: {
      enabled: boolean;
      title: string;
      subtitle: string;
      icon: string;
      limit: number;
      layout: string;
    };
    flashSales: {
      enabled: boolean;
      title: string;
      subtitle: string;
      icon: string;
      limit: number;
      layout: string;
      badge: {
        text: string;
        color: string;
      };
    };
    allOffers: {
      enabled: boolean;
      title: string;
      icon: string;
      showCount: boolean;
    };
  };
  banners: {
    enabled: boolean;
    limit: number;
    height: string;
  };
  filters: {
    minDiscount: number;
    categories: string[];
    sortBy: string;
  };
}

export interface AboutConfig {
  pageTitle: string;
  pageDescription: string;
  hero: {
    title: string;
    subtitle: string;
    badge: {
      text: string;
      icon: string;
    };
  };
  stats: Array<{
    value: string;
    label: string;
    icon: string;
  }>;
  benefits: Array<{
    title: string;
    description: string;
    icon: string;
    color: string;
  }>;
  mission: {
    title: string;
    icon: string;
    text: string;
  };
  guarantee: {
    title: string;
    icon: string;
    text: string;
  };
}

class ApiService {
  private async fetchJson<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    return response.json();
  }

  private transformProduct(dbProduct: any): Product {
    return {
      id: dbProduct.id,
      name: dbProduct.name,
      slug: dbProduct.slug,
      price: dbProduct.price,
      discountPrice: dbProduct.discount_price || undefined,
      category: dbProduct.category,
      subcategory: dbProduct.subcategory,
      mainImage: dbProduct.main_image,
      images: dbProduct.images || [],
      description: dbProduct.description || '',
      variations: dbProduct.variations || [],
      stock: dbProduct.stock || 0,
      rating: dbProduct.rating || 0,
      reviewCount: dbProduct.review_count || 0,
    };
  }

  async getBanners(): Promise<Banner[]> {
    if (USE_SUPABASE) {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('active', true)
        .order('position', { ascending: true });

      if (error) throw error;
      return data || [];
    }
    return this.fetchJson<Banner[]>('/banners.json');
  }

  async getProducts(): Promise<Product[]> {
    if (USE_SUPABASE) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(this.transformProduct);
    }
    return this.fetchJson<Product[]>('/products.json');
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    const products = await this.getProducts();
    return products.find(p => p.slug === slug) || null;
  }

  async getReviews(productId: string): Promise<Review[]> {
    const allReviews = await this.fetchJson<Record<string, Review[]>>('/reviews.json');
    return allReviews[productId] || [];
  }

  async getRelatedProducts(productId: string): Promise<Product[]> {
    const relatedIds = await this.fetchJson<Record<string, string[]>>('/related-products.json');
    const ids = relatedIds[productId] || [];
    const products = await this.getProducts();
    return products.filter(p => ids.includes(p.id));
  }

  async getShippingOptions(): Promise<ShippingOption[]> {
    const data = await this.fetchJson<{ options: ShippingOption[] }>('/shipping.json');
    return data.options;
  }

  async calculateShipping(zipCode: string, cartTotal: number): Promise<ShippingOption[]> {
    const options = await this.getShippingOptions();
    return options.filter(option => {
      if (option.minPurchase) {
        return cartTotal >= option.minPurchase;
      }
      return true;
    });
  }

  async getStoreInfo(): Promise<StoreInfo> {
    return this.fetchJson<StoreInfo>('/store-info.json');
  }

  async searchProducts(query: string): Promise<Product[]> {
    const products = await this.getProducts();
    const lowerQuery = query.toLowerCase();
    return products.filter(p =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.category.toLowerCase().includes(lowerQuery) ||
      p.subcategory.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery)
    );
  }

  async getCategories(): Promise<string[]> {
    const products = await this.getProducts();
    const categories = new Set(products.map(p => p.category));
    return Array.from(categories).sort();
  }

  async getSubcategories(category?: string): Promise<string[]> {
    const products = await this.getProducts();
    const filtered = category ? products.filter(p => p.category === category) : products;
    const subcategories = new Set(filtered.map(p => p.subcategory));
    return Array.from(subcategories).sort();
  }

  async getAddressByCep(cep: string): Promise<ViaCepResponse> {
    const cleanCep = cep.replace(/\D/g, '');
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    if (!response.ok) {
      throw new Error('CEP não encontrado');
    }
    return response.json();
  }

  async getCheckoutConfig(): Promise<CheckoutConfig> {
    return this.fetchJson<CheckoutConfig>('/checkout-config.json');
  }

  async getSiteConfig(): Promise<SiteConfig> {
    if (USE_SUPABASE) {
      const { data, error } = await supabase
        .from('site_config')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        return {
          siteName: data.site_name,
          logo: data.logo,
          favicon: data.favicon,
          tagline: data.tagline,
          description: data.description,
          colors: {
            primary: data.primary_color,
            secondary: data.secondary_color,
            accent: data.accent_color,
          },
          contact: {
            email: data.contact_email,
            phone: data.contact_phone,
            whatsapp: data.contact_whatsapp,
          },
          social: {
            instagram: data.social_instagram,
            facebook: data.social_facebook,
            twitter: data.social_twitter,
          },
        };
      }
    }
    return this.fetchJson<SiteConfig>('/site-config.json');
  }

  async getOffersConfig(): Promise<OffersConfig> {
    return this.fetchJson<OffersConfig>('/offers-config.json');
  }

  async getAboutConfig(): Promise<AboutConfig> {
    return this.fetchJson<AboutConfig>('/about-config.json');
  }

  async createOrder(data: CheckoutData): Promise<PixPaymentResponse> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const orderId = `ORD-${Date.now()}`;
    const pixCode = '00020126580014br.gov.bcb.pix0136' + orderId;
    const amount = 299.90;

    return {
      orderId,
      pixCode,
      pixQrCode: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pixCode)}`,
      amount,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    };
  }
}

export const api = new ApiService();
