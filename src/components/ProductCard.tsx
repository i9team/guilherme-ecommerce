import { Star, ArrowRight } from 'lucide-react';
import { Product } from '../services/api';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;
  const hasFreeShipping = (product.discountPrice || product.price) >= 200;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl overflow-hidden group cursor-pointer border border-gray-100 hover:border-slate-300 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 flex flex-col h-full"
    >
      <div className="relative overflow-hidden aspect-square bg-gray-50">
        <img
          src={product.mainImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {hasDiscount && (
          <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md text-xs font-bold shadow-lg">
            -{discountPercent}%
          </div>
        )}
        {hasFreeShipping && (
          <div className="absolute top-1.5 sm:top-2 left-1.5 sm:left-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md text-[10px] sm:text-xs font-bold shadow-lg">
            FRETE GRÁTIS
          </div>
        )}
      </div>

      <div className="p-2 sm:p-3 flex flex-col flex-1">
        <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
          {product.subcategory}
        </p>
        <h3 className="font-bold text-gray-900 mb-1.5 sm:mb-2 line-clamp-2 text-xs sm:text-sm leading-tight">
          {product.name}
        </h3>

        <div className="flex items-center gap-1 mb-2">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${
                  i < Math.floor(product.rating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-gray-200 text-gray-200'
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] sm:text-xs font-semibold text-gray-900">{product.rating}</span>
          <span className="text-[10px] sm:text-xs text-gray-400">({product.reviewCount})</span>
        </div>

        <div className="mt-auto">
          <div className="mb-2 min-h-[44px] sm:min-h-[52px] flex flex-col justify-end">
            {hasDiscount && (
              <p className="text-[10px] sm:text-xs text-gray-400 line-through mb-0.5">
                R$ {product.price.toFixed(2).replace('.', ',')}
              </p>
            )}
            <p className="text-lg sm:text-xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
              R$ {(product.discountPrice || product.price).toFixed(2).replace('.', ',')}
            </p>
          </div>

          <button className="w-full bg-gradient-to-r from-slate-700 to-slate-900 text-white py-1.5 sm:py-2 rounded-lg text-[11px] sm:text-xs font-semibold hover:shadow-lg hover:from-slate-600 hover:to-slate-800 transition-all duration-300 flex items-center justify-center gap-1.5">
            Ver Detalhes
            <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
