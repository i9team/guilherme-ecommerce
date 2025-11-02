import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Database {
  public: {
    Tables: {
      admins: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          role?: string;
        };
        Update: {
          name?: string;
          role?: string;
        };
      };
      site_config: {
        Row: {
          id: string;
          site_name: string;
          logo: string;
          favicon: string;
          tagline: string;
          description: string;
          primary_color: string;
          secondary_color: string;
          accent_color: string;
          contact_email: string;
          contact_phone: string;
          contact_whatsapp: string;
          social_instagram: string;
          social_facebook: string;
          social_twitter: string;
          created_at: string;
          updated_at: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          price: number;
          discount_price: number | null;
          category: string;
          subcategory: string;
          main_image: string;
          images: string[];
          description: string;
          variations: any[];
          stock: number;
          rating: number;
          review_count: number;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          slug: string;
          price: number;
          discount_price?: number;
          category: string;
          subcategory: string;
          main_image: string;
          images?: string[];
          description?: string;
          variations?: any[];
          stock?: number;
          rating?: number;
          review_count?: number;
          active?: boolean;
        };
      };
      banners: {
        Row: {
          id: string;
          image: string;
          title: string;
          subtitle: string;
          link: string;
          position: number;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          image: string;
          title: string;
          subtitle: string;
          link?: string;
          position?: number;
          active?: boolean;
        };
      };
    };
  };
}
