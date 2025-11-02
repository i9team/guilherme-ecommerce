import { useState, useEffect } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, Tag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { api, Product } from '../services/api';

interface CartProps {
  onClose: () => void;
  onCheckout: () => void;
}

export function Cart({ onClose, onCheckout }: CartProps) {
  const { items, updateQuantity, removeItem, getTotal, addItem } = useCart();
  const [orderBumps, setOrderBumps] = useState<Product[]>([]);

  useEffect(() => {
    const loadOrderBumps = async () => {
      if (items.length > 0) {
        const firstProductId = items[0].product.id;
        const related = await api.getRelatedProducts(firstProductId);
        const notInCart = related.filter(
          (p) => !items.some((item) => item.product.id === p.id)
        );
        setOrderBumps(notInCart.slice(0, 2));
      }
    };
    loadOrderBumps();
  }, [items]);

  const handleAddOrderBump = (product: Product) => {
    const initialVariations: Record<string, string> = {};
    product.variations.forEach(variation => {
      initialVariations[variation.type] = variation.options[0];
    });
    addItem(product, 1, initialVariations);
  };

  const handleCheckout = () => {
    if (items.length > 0) {
      onCheckout();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end" onClick={onClose}>
      <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-gradient-to-r from-slate-700 to-slate-900 p-3 sm:p-4 flex items-center justify-between z-10 shadow-md">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Carrinho ({items.length})
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6">
            <div className="bg-gray-100 rounded-full p-6 mb-4">
              <ShoppingBag className="w-16 h-16 text-gray-400" />
            </div>
            <p className="text-lg font-bold text-gray-800 mb-2">Carrinho vazio</p>
            <p className="text-sm text-gray-500 text-center mb-6">
              Adicione produtos para continuar suas compras
            </p>
            <button
              onClick={onClose}
              className="bg-gradient-to-r from-slate-700 to-slate-900 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:shadow-lg transition-all"
            >
              Continuar Comprando
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {items.map((item, index) => {
                const price = item.product.discountPrice || item.product.price;
                const subtotal = price * item.quantity;

                return (
                  <div key={`${item.product.id}-${JSON.stringify(item.selectedVariations)}`}>
                    <div className="bg-white border border-gray-200 rounded-lg p-2.5 hover:shadow-md transition-shadow">
                    <div className="flex gap-2.5">
                      <img
                        src={item.product.mainImage}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0 bg-gray-100"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-xs sm:text-sm mb-1 line-clamp-2 text-gray-900">
                          {item.product.name}
                        </h3>
                        {Object.keys(item.selectedVariations).length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-1.5">
                            {Object.entries(item.selectedVariations).map(([key, value]) => (
                              <span key={key} className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                                {value}
                              </span>
                            ))}
                          </div>
                        )}
                        <p className="text-base font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                          R$ {price.toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id, item.selectedVariations)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors self-start"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-gray-100">
                      <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.selectedVariations,
                              item.quantity - 1
                            )
                          }
                          className="p-1 hover:bg-white rounded transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5 text-gray-600" />
                        </button>
                        <span className="w-7 text-center text-sm font-semibold text-gray-900">{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.selectedVariations,
                              item.quantity + 1
                            )
                          }
                          className="p-1 hover:bg-white rounded transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5 text-gray-600" />
                        </button>
                      </div>

                      <span className="text-sm font-bold text-gray-900">
                        R$ {subtotal.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>

                  {index === 0 && orderBumps.length > 0 && (
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-lg p-3 mt-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Tag className="w-4 h-4 text-amber-600" />
                        <h3 className="font-bold text-sm text-amber-900">
                          Complete seu pedido
                        </h3>
                      </div>
                      <div className="space-y-2">
                        {orderBumps.map((bump) => (
                          <div key={bump.id} className="bg-white rounded-lg p-2 flex gap-2 shadow-sm">
                            <img
                              src={bump.mainImage}
                              alt={bump.name}
                              className="w-12 h-12 object-cover rounded-lg flex-shrink-0 bg-gray-100"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-xs line-clamp-2 mb-0.5 text-gray-900">
                                {bump.name}
                              </h4>
                              <p className="text-sm font-bold text-slate-900">
                                R$ {(bump.discountPrice || bump.price).toFixed(2).replace('.', ',')}
                              </p>
                            </div>
                            <button
                              onClick={() => handleAddOrderBump(bump)}
                              className="px-2.5 py-1.5 bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded-lg text-xs font-semibold hover:shadow-md transition-all self-center flex-shrink-0"
                            >
                              + Add
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                );
              })}
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-3 space-y-3 shadow-lg">
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal ({items.length} {items.length === 1 ? 'item' : 'itens'})</span>
                  <span className="font-medium">R$ {getTotal().toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between text-base font-bold border-t border-gray-200 pt-2">
                  <span className="text-gray-900">Total</span>
                  <span className="text-xl bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                    R$ {getTotal().toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-gradient-to-r from-slate-700 to-slate-900 text-white py-3 rounded-lg text-sm font-bold hover:shadow-lg hover:from-slate-600 hover:to-slate-800 transition-all"
              >
                Finalizar Compra
              </button>

              <button
                onClick={onClose}
                className="w-full border border-gray-300 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all"
              >
                Continuar Comprando
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
