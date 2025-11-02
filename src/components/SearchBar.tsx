import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api, Product } from '../services/api';

export function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadProducts = async () => {
      const products = await api.getProducts();
      setAllProducts(products);
    };
    loadProducts();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase();
      const filtered = allProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query)
      );
      setSearchResults(filtered.slice(0, 5));
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [searchQuery, allProducts]);

  const handleProductClick = (slug: string) => {
    navigate(`/product/${slug}`);
    setSearchQuery('');
    setShowResults(false);
  };

  const handleClear = () => {
    setSearchQuery('');
    setShowResults(false);
  };

  return (
    <div ref={searchRef} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar produtos, categorias..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchQuery.length > 0 && setShowResults(true)}
          className="w-full px-5 py-3 pl-12 pr-10 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        {searchQuery && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>

      {showResults && searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-96 overflow-y-auto z-50">
          {searchResults.map((product) => {
            const finalPrice = product.discountPrice || product.price;
            const hasDiscount = product.discountPrice && product.discountPrice < product.price;

            return (
              <button
                key={product.id}
                onClick={() => handleProductClick(product.slug)}
                className="w-full p-3 hover:bg-gray-50 transition-colors flex items-center gap-3 border-b last:border-b-0"
              >
                <img
                  src={product.mainImage}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1 text-left min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">{product.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{product.category}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {hasDiscount && (
                      <span className="text-xs text-gray-400 line-through">
                        R$ {product.price.toFixed(2).replace('.', ',')}
                      </span>
                    )}
                    <span className="text-sm font-bold text-slate-700">
                      R$ {finalPrice.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {showResults && searchResults.length === 0 && searchQuery.trim().length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl p-4 z-50">
          <p className="text-sm text-gray-500 text-center">Nenhum produto encontrado</p>
        </div>
      )}
    </div>
  );
}
