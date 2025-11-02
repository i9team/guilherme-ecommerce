import { useState, useEffect } from 'react';
import { Banner } from './Banner';
import { ProductCard } from './ProductCard';
import { api, Product, Banner as BannerType } from '../services/api';

interface HomePageProps {
  onProductClick: (slug: string) => void;
}

export function HomePage({ onProductClick }: HomePageProps) {
  const [banners, setBanners] = useState<BannerType[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsPerPage] = useState(6);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [bannersData, productsData] = await Promise.all([
          api.getBanners(),
          api.getProducts(),
        ]);
        setBanners(bannersData);
        setProducts(productsData);
        setDisplayedProducts(productsData.slice(0, 6));
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    const startIndex = 0;
    const endIndex = nextPage * productsPerPage;
    setDisplayedProducts(products.slice(startIndex, endIndex));
    setCurrentPage(nextPage);
  };

  const hasMoreProducts = displayedProducts.length < products.length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-14 w-14 border-4 border-slate-200 border-t-slate-700"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Banner banners={banners} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="mb-6 sm:mb-8 lg:mb-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent mb-2 sm:mb-3">
            Nossos Produtos
          </h2>
          <p className="text-base sm:text-lg text-gray-600 font-medium">
            Confira nossa seleção de produtos premium
          </p>
        </div>

        {displayedProducts.length === 0 ? (
          <div className="text-center py-12 sm:py-16 lg:py-20">
            <p className="text-gray-500 text-lg sm:text-xl font-medium">Nenhum produto encontrado</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
              {displayedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={() => onProductClick(product.slug)}
                />
              ))}
            </div>

            {hasMoreProducts && (
              <div className="flex justify-center mt-6 sm:mt-8">
                <button
                  onClick={handleLoadMore}
                  className="px-6 py-2.5 sm:px-8 sm:py-3 bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded-lg font-semibold hover:shadow-lg hover:from-slate-600 hover:to-slate-800 transition-all duration-300 flex items-center gap-2 text-sm sm:text-base"
                >
                  Ver Mais
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs sm:text-sm">
                    +{products.length - displayedProducts.length}
                  </span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
