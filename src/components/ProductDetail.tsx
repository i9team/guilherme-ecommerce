import { useState, useEffect } from 'react';
import { Star, Truck, Shield, Package, Plus, Minus, X } from 'lucide-react';
import { api, Product, Review } from '../services/api';
import { useCart } from '../contexts/CartContext';

interface ProductDetailProps {
  slug: string;
  onClose: () => void;
}

export function ProductDetail({ slug, onClose }: ProductDetailProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariations, setSelectedVariations] = useState<Record<string, string>>({});
  const { addItem } = useCart();

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const productData = await api.getProductBySlug(slug);
        if (!productData) {
          onClose();
          return;
        }

        setProduct(productData);

        const initialVariations: Record<string, string> = {};
        productData.variations.forEach(variation => {
          initialVariations[variation.type] = variation.options[0];
        });
        setSelectedVariations(initialVariations);

        const [reviewsData, relatedData] = await Promise.all([
          api.getReviews(productData.id),
          api.getRelatedProducts(productData.id),
        ]);

        setReviews(reviewsData);
        setRelatedProducts(relatedData);
      } catch (error) {
        console.error('Error loading product:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [slug, onClose]);

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity, selectedVariations);
      alert('Produto adicionado ao carrinho!');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!product) return null;

  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
      <div className="min-h-screen px-2 sm:px-4 py-4 sm:py-6">
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-2xl relative">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2 bg-gray-100 hover:bg-gray-200 rounded-full shadow-md z-10 transition-colors"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <div className="p-3 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
              <div>
                <div className="relative aspect-square mb-3 overflow-hidden rounded-lg bg-gray-50">
                  <img
                    src={product.images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {hasDiscount && (
                    <div className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-sm sm:text-base font-bold shadow-lg">
                      -{discountPercent}%
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition ${
                        selectedImage === index ? 'border-slate-700' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img src={image} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs sm:text-sm text-slate-500 uppercase tracking-wider font-semibold mb-1">
                  {product.subcategory}
                </p>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>

                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm sm:text-base font-semibold">{product.rating}</span>
                  <span className="text-xs sm:text-sm text-gray-500">({product.reviewCount} avaliações)</span>
                </div>

                <div className="mb-4 bg-gray-50 p-3 rounded-lg">
                  {hasDiscount && (
                    <p className="text-sm sm:text-base text-gray-500 line-through mb-0.5">
                      R$ {product.price.toFixed(2).replace('.', ',')}
                    </p>
                  )}
                  <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                    R$ {(product.discountPrice || product.price).toFixed(2).replace('.', ',')}
                  </p>
                </div>

                {product.variations.map((variation) => (
                  <div key={variation.type} className="mb-4">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      {variation.name}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {variation.options.map((option) => (
                        <button
                          key={option}
                          onClick={() =>
                            setSelectedVariations({
                              ...selectedVariations,
                              [variation.type]: option,
                            })
                          }
                          className={`px-3 py-1.5 border rounded-lg text-xs sm:text-sm font-medium transition ${
                            selectedVariations[variation.type] === option
                              ? 'border-slate-700 bg-slate-700 text-white'
                              : 'border-gray-300 hover:border-slate-400'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="mb-4">
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Quantidade
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-1.5 sm:p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-lg font-semibold w-10 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="p-1.5 sm:p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <span className="text-xs sm:text-sm text-gray-500">
                      {product.stock} disponíveis
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="w-full bg-gradient-to-r from-slate-700 to-slate-900 text-white py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold hover:shadow-lg hover:from-slate-600 hover:to-slate-800 transition-all mb-3"
                >
                  Adicionar ao Carrinho
                </button>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                    <Truck className="w-5 h-5 text-slate-700 mb-1" />
                    <span className="text-[10px] sm:text-xs text-center text-gray-600 font-medium">Frete Grátis</span>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                    <Shield className="w-5 h-5 text-slate-700 mb-1" />
                    <span className="text-[10px] sm:text-xs text-center text-gray-600 font-medium">Compra Segura</span>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                    <Package className="w-5 h-5 text-slate-700 mb-1" />
                    <span className="text-[10px] sm:text-xs text-center text-gray-600 font-medium">Entrega Rápida</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-bold text-base sm:text-lg mb-2">Descrição do Produto</h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{product.description}</p>
                </div>
              </div>
            </div>

            {relatedProducts.length > 0 && (
              <div className="mt-6 sm:mt-8 border-t pt-6">
                <h3 className="text-lg sm:text-xl font-bold mb-4">Produtos Relacionados</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {relatedProducts.map((related) => (
                    <div key={related.id} className="border rounded-lg p-2 hover:shadow-md transition cursor-pointer">
                      <img
                        src={related.mainImage}
                        alt={related.name}
                        className="w-full aspect-square object-cover rounded-lg mb-2"
                      />
                      <h4 className="font-semibold text-xs sm:text-sm mb-1 line-clamp-2">{related.name}</h4>
                      <p className="text-sm sm:text-base font-bold text-slate-900">
                        R$ {(related.discountPrice || related.price).toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {reviews.length > 0 && (
              <div className="mt-6 sm:mt-8 border-t pt-6">
                <h3 className="text-lg sm:text-xl font-bold mb-4">Avaliações de Clientes</h3>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-sm sm:text-base">{review.userName}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3.5 h-3.5 ${
                                    i < review.rating
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            {review.verified && (
                              <span className="text-xs text-emerald-600 font-medium">
                                Compra Verificada
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(review.date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-700 mb-2">{review.comment}</p>
                      {review.images.length > 0 && (
                        <div className="flex gap-2">
                          {review.images.map((image, index) => (
                            <img
                              key={index}
                              src={image}
                              alt=""
                              className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
