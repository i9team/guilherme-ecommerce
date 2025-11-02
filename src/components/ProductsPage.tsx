import { useState, useEffect } from 'react';
import { ProductCard } from './ProductCard';
import { api, Product } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, X } from 'lucide-react';

export function ProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showSubcategoryMenu, setShowSubcategoryMenu] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          api.getProducts(),
          api.getCategories(),
        ]);
        setProducts(productsData);
        setFilteredProducts(productsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const loadSubcategories = async () => {
      if (selectedCategory) {
        const subs = await api.getSubcategories(selectedCategory);
        setSubcategories(subs);
      } else {
        setSubcategories([]);
      }
    };
    loadSubcategories();
  }, [selectedCategory]);

  useEffect(() => {
    let filtered = products;

    if (selectedCategory) {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (selectedSubcategory) {
      filtered = filtered.filter(p => p.subcategory === selectedSubcategory);
    }

    setFilteredProducts(filtered);
  }, [selectedCategory, selectedSubcategory, products]);

  const handleProductClick = (slug: string) => {
    navigate(`/product/${slug}`);
  };

  const handleCategorySelect = (category: string) => {
    if (selectedCategory === category) {
      setSelectedCategory(null);
      setSelectedSubcategory(null);
    } else {
      setSelectedCategory(category);
      setSelectedSubcategory(null);
    }
    setShowCategoryMenu(false);
  };

  const handleSubcategorySelect = (subcategory: string) => {
    if (selectedSubcategory === subcategory) {
      setSelectedSubcategory(null);
    } else {
      setSelectedSubcategory(subcategory);
    }
    setShowSubcategoryMenu(false);
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-14 w-14 border-4 border-slate-200 border-t-slate-700"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="mb-3 sm:mb-4">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent mb-1">
            Todos os Produtos
          </h1>
          <p className="text-xs sm:text-sm text-gray-600">
            {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="mb-3 sm:mb-4 flex flex-wrap gap-2">
          <div className="relative">
            <button
              onClick={() => {
                setShowCategoryMenu(!showCategoryMenu);
                setShowSubcategoryMenu(false);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs sm:text-sm font-medium transition-colors ${
                selectedCategory
                  ? 'bg-slate-700 text-white border-slate-700'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-slate-400'
              }`}
            >
              {selectedCategory || 'Categoria'}
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {showCategoryMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowCategoryMenu(false)}
                />
                <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[140px] z-20 max-h-[280px] overflow-y-auto">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategorySelect(category)}
                      className={`w-full text-left px-3 py-1.5 text-xs sm:text-sm hover:bg-gray-50 transition-colors ${
                        selectedCategory === category ? 'bg-slate-50 text-slate-900 font-semibold' : 'text-gray-700'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {selectedCategory && subcategories.length > 0 && (
            <div className="relative">
              <button
                onClick={() => {
                  setShowSubcategoryMenu(!showSubcategoryMenu);
                  setShowCategoryMenu(false);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs sm:text-sm font-medium transition-colors ${
                  selectedSubcategory
                    ? 'bg-slate-700 text-white border-slate-700'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-slate-400'
                }`}
              >
                {selectedSubcategory || 'Subcategoria'}
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {showSubcategoryMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowSubcategoryMenu(false)}
                  />
                  <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[140px] z-20 max-h-[280px] overflow-y-auto">
                    {subcategories.map((subcategory) => (
                      <button
                        key={subcategory}
                        onClick={() => handleSubcategorySelect(subcategory)}
                        className={`w-full text-left px-3 py-1.5 text-xs sm:text-sm hover:bg-gray-50 transition-colors ${
                          selectedSubcategory === subcategory ? 'bg-slate-50 text-slate-900 font-semibold' : 'text-gray-700'
                        }`}
                      >
                        {subcategory}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {(selectedCategory || selectedSubcategory) && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs sm:text-sm font-medium transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Limpar
            </button>
          )}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 sm:py-16 lg:py-20">
            <p className="text-gray-500 text-base sm:text-lg font-medium">
              Nenhum produto encontrado com os filtros selecionados
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => handleProductClick(product.slug)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
