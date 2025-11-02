import { useState, useEffect } from 'react';
import { ProductCard } from './ProductCard';
import { api, Product, Banner, OffersConfig } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Flame, Clock, TrendingDown, Zap, Sparkles, ChevronRight } from 'lucide-react';

export function OffersPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [config, setConfig] = useState<OffersConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsData, bannersData, configData] = await Promise.all([
          api.getProducts(),
          api.getBanners(),
          api.getOffersConfig(),
        ]);
        const offersData = productsData.filter(p => p.discountPrice && p.discountPrice < p.price);
        setProducts(offersData);
        setBanners(bannersData);
        setConfig(configData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleProductClick = (slug: string) => {
    navigate(`/product/${slug}`);
  };

  const handleBannerClick = (link: string) => {
    navigate(link);
  };

  const calculateDiscount = (price: number, discountPrice: number) => {
    return Math.round(((price - discountPrice) / price) * 100);
  };

  const topDealsLimit = config?.sections.topDeals.limit || 3;
  const flashSalesLimit = config?.sections.flashSales.limit || 4;

  const topDeals = products.slice(0, topDealsLimit);
  const flashSales = products.slice(topDealsLimit, topDealsLimit + flashSalesLimit);
  const allOffers = products;

  const pageTitle = config?.pageTitle || 'Ofertas Imperdíveis';
  const pageDescription = config?.pageDescription || 'produtos com desconto especial';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-14 w-14 border-4 border-slate-200 border-t-slate-700"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">

        <div className="mb-3 bg-gradient-to-r from-red-600 via-red-500 to-orange-500 rounded-xl p-4 sm:p-6 text-white shadow-lg">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <Flame className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
              {pageTitle}
            </h1>
          </div>
          <p className="text-xs sm:text-sm opacity-90 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" />
            {products.length} {pageDescription}
          </p>
        </div>

        {config?.banners.enabled && banners.length > 0 && (
          <div className="mb-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {banners.slice(0, config.banners.limit).map((banner) => (
              <button
                key={banner.id}
                onClick={() => handleBannerClick(banner.link)}
                className="relative rounded-lg overflow-hidden group shadow-md hover:shadow-xl transition-all h-32 sm:h-40"
              >
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-3 sm:p-4 text-white">
                  <h3 className="text-xs sm:text-sm font-bold mb-0.5">{banner.title}</h3>
                  <p className="text-[10px] sm:text-xs opacity-90">{banner.subtitle}</p>
                </div>
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
                  <ChevronRight className="w-3 h-3 text-slate-700" />
                </div>
              </button>
            ))}
          </div>
        )}

        {config?.sections.topDeals.enabled && topDeals.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-1.5 rounded-lg shadow-md">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-sm sm:text-base font-bold text-gray-900">{config.sections.topDeals.title}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {topDeals.map((product) => {
                const discount = calculateDiscount(product.price, product.discountPrice || product.price);
                return (
                  <button
                    key={product.id}
                    onClick={() => handleProductClick(product.slug)}
                    className="relative bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all group"
                  >
                    <div className="absolute top-2 left-2 z-10 bg-gradient-to-r from-red-600 to-red-500 text-white px-2 py-1 rounded-full shadow-lg">
                      <span className="text-[10px] sm:text-xs font-bold">-{discount}%</span>
                    </div>
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={product.mainImage}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-2 sm:p-3">
                      <h3 className="text-[10px] sm:text-xs font-bold text-gray-900 line-clamp-2 mb-1">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[9px] text-gray-500 line-through">
                          R$ {product.price.toFixed(2).replace('.', ',')}
                        </span>
                        <span className="text-xs sm:text-sm font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
                          R$ {(product.discountPrice || product.price).toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] text-green-600 font-bold flex items-center gap-0.5">
                          <TrendingDown className="w-3 h-3" />
                          Economize R$ {(product.price - (product.discountPrice || product.price)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {config?.sections.flashSales.enabled && flashSales.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-1.5 rounded-lg shadow-md animate-pulse">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-sm sm:text-base font-bold text-gray-900">{config.sections.flashSales.title}</h2>
              <div className="ml-auto bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                <span className="text-[9px] sm:text-[10px] font-bold">{config.sections.flashSales.badge.text}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {flashSales.map((product) => {
                const discount = calculateDiscount(product.price, product.discountPrice || product.price);
                return (
                  <button
                    key={product.id}
                    onClick={() => handleProductClick(product.slug)}
                    className="bg-gradient-to-br from-white to-gray-50 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all group border border-purple-200"
                  >
                    <div className="relative">
                      <div className="absolute top-1.5 right-1.5 z-10 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-1.5 py-0.5 rounded-full shadow-lg">
                        <span className="text-[9px] font-bold">-{discount}%</span>
                      </div>
                      <div className="aspect-square overflow-hidden">
                        <img
                          src={product.mainImage}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    </div>
                    <div className="p-2">
                      <h3 className="text-[10px] sm:text-xs font-bold text-gray-900 line-clamp-2 mb-1">
                        {product.name}
                      </h3>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[8px] text-gray-500 line-through">
                          R$ {product.price.toFixed(2).replace('.', ',')}
                        </span>
                        <span className="text-xs sm:text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          R$ {(product.discountPrice || product.price).toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {config?.sections.allOffers.enabled && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-gradient-to-br from-slate-700 to-slate-900 p-1.5 rounded-lg shadow-md">
                <TrendingDown className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-sm sm:text-base font-bold text-gray-900">{config.sections.allOffers.title}</h2>
              {config.sections.allOffers.showCount && (
                <span className="ml-auto text-[10px] text-gray-600">{allOffers.length} produtos</span>
              )}
            </div>

          {allOffers.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg shadow-md">
              <Flame className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 font-medium">
                Nenhuma oferta disponível no momento
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Volte em breve para conferir nossas promoções!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
              {allOffers.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={() => handleProductClick(product.slug)}
                />
              ))}
            </div>
          )}
          </div>
        )}
      </div>
    </div>
  );
}
