import { useState, useEffect } from 'react';
import { ShoppingCart, Store } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { SearchBar } from './SearchBar';
import { useLocation } from 'react-router-dom';
import { api, SiteConfig } from '../services/api';

interface HeaderProps {
  onCartClick: () => void;
}

export function Header({ onCartClick }: HeaderProps) {
  const { getItemCount } = useCart();
  const itemCount = getItemCount();
  const location = useLocation();
  const isCheckoutPage = location.pathname === '/checkout';
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await api.getSiteConfig();
        setSiteConfig(config);
      } catch (error) {
        console.error('Error loading site config:', error);
      }
    };
    loadConfig();
  }, []);

  const siteName = siteConfig?.siteName || 'Loja Premium';
  const logo = siteConfig?.logo;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 backdrop-blur-lg bg-white/95 w-full">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20">
          <a href="/" className="flex items-center gap-2 sm:gap-3 group flex-shrink-0">
            {logo ? (
              <img
                src={logo}
                alt={siteName}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl object-cover shadow-md group-hover:shadow-lg transition-all"
              />
            ) : (
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
                <Store className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
            )}
            <span className="text-base sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent whitespace-nowrap">
              {siteName}
            </span>
          </a>

          {!isCheckoutPage && (
            <div className="hidden md:flex flex-1 max-w-xl mx-8">
              <SearchBar />
            </div>
          )}

          <button
            onClick={onCartClick}
            className="relative p-2 sm:p-3 hover:bg-slate-50 rounded-xl transition-all group flex-shrink-0 lg:block hidden"
          >
            <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 group-hover:text-slate-900 transition-colors" />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center shadow-lg">
                {itemCount}
              </span>
            )}
          </button>
        </div>

        {!isCheckoutPage && (
          <div className="md:hidden pb-3 sm:pb-4">
            <SearchBar />
          </div>
        )}
      </div>
    </header>
  );
}
