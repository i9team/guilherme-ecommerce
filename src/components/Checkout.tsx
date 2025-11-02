import { useState, useEffect } from 'react';
import { X, Copy, Check, ChevronRight, Tag, CreditCard } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { api, ShippingOption, Product, CheckoutConfig } from '../services/api';
import { maskPhone, maskCpfCnpj, maskCep, unmask } from '../utils/masks';

interface CheckoutProps {
  onClose: () => void;
}

export function Checkout({ onClose }: CheckoutProps) {
  const { items, getTotal, clearCart, addItem } = useCart();
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<CheckoutConfig | null>(null);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<string>('');
  const [orderBumps, setOrderBumps] = useState<Product[]>([]);
  const [pixData, setPixData] = useState<{
    code: string;
    qrCode: string;
    amount: number;
    orderId: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    ddi: '+55',
    phone: '',
    cpf: '',
    zipCode: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
  });

  useEffect(() => {
    const loadConfig = async () => {
      const checkoutConfig = await api.getCheckoutConfig();
      setConfig(checkoutConfig);
    };
    loadConfig();
  }, []);

  useEffect(() => {
    const loadShipping = async () => {
      const options = await api.calculateShipping('', getTotal());
      setShippingOptions(options);
      if (options.length > 0) {
        setSelectedShipping(options[0].id);
      }
    };
    loadShipping();
  }, [getTotal]);

  useEffect(() => {
    const loadOrderBumps = async () => {
      if (items.length > 0 && config?.orderBumps.enabled) {
        const firstProductId = items[0].product.id;
        const related = await api.getRelatedProducts(firstProductId);
        const notInCart = related.filter(
          (p) => !items.some((item) => item.product.id === p.id)
        );
        setOrderBumps(notInCart.slice(0, 2));
      }
    };
    loadOrderBumps();
  }, [items, config]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let maskedValue = value;

    if (name === 'phone') {
      maskedValue = maskPhone(value);
    } else if (name === 'cpf') {
      maskedValue = maskCpfCnpj(value);
    } else if (name === 'zipCode') {
      maskedValue = maskCep(value);
    }

    setFormData({
      ...formData,
      [name]: maskedValue,
    });

    if (name === 'zipCode' && unmask(maskedValue).length === 8) {
      handleCepSearch(unmask(maskedValue));
    }
  };

  const handleCepSearch = async (cep: string) => {
    setLoadingCep(true);
    try {
      const address = await api.getAddressByCep(cep);
      if (!address.erro) {
        setFormData(prev => ({
          ...prev,
          street: address.logradouro,
          neighborhood: address.bairro,
          city: address.localidade,
          state: address.uf,
        }));
      }
    } catch (error) {
      console.error('Error fetching CEP:', error);
    } finally {
      setLoadingCep(false);
    }
  };

  const handleAddOrderBump = (product: Product) => {
    const initialVariations: Record<string, string> = {};
    product.variations.forEach(variation => {
      initialVariations[variation.type] = variation.options[0];
    });
    addItem(product, 1, initialVariations);
  };

  const handleSubmitOrder = async () => {
    setIsSubmitting(true);
    try {
      const response = await api.createOrder({
        items: items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          selectedVariations: item.selectedVariations,
        })),
        customer: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          cpf: formData.cpf,
        },
        shipping: {
          zipCode: formData.zipCode,
          street: formData.street,
          number: formData.number,
          complement: formData.complement,
          neighborhood: formData.neighborhood,
          city: formData.city,
          state: formData.state,
        },
        shippingOption: selectedShipping,
      });

      setPixData({
        code: response.pixCode,
        qrCode: response.pixQrCode,
        amount: response.amount,
        orderId: response.orderId,
      });

      if (config?.mode === 'steps') {
        setStep(3);
      } else {
        setStep(2);
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Erro ao processar pedido. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyPixCode = () => {
    if (pixData) {
      navigator.clipboard.writeText(pixData.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const selectedShippingOption = shippingOptions.find(opt => opt.id === selectedShipping);
  const shippingPrice = selectedShippingOption?.price || 0;
  const totalWithShipping = getTotal() + shippingPrice;

  const isStep1Valid = formData.name && formData.email && formData.phone && formData.cpf;
  const isStep2Valid = formData.zipCode && formData.street && formData.number && formData.neighborhood && formData.city && formData.state;
  const isDirectValid = isStep1Valid && isStep2Valid;

  if (!config) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  const renderOrderBumps = () => {
    if (!config.orderBumps.enabled || orderBumps.length === 0) return null;

    return (
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-300 rounded p-2">
        <div className="flex items-center gap-1 mb-1.5">
          <Tag className="w-3 h-3 text-amber-600" />
          <h3 className="font-bold text-[10px] sm:text-xs text-amber-900">
            Complete seu pedido
          </h3>
        </div>
        <div className="space-y-1.5">
          {orderBumps.map((bump) => (
            <div key={bump.id} className="bg-white rounded p-1.5 flex gap-1.5">
              <img
                src={bump.mainImage}
                alt={bump.name}
                className="w-10 h-10 object-cover rounded flex-shrink-0 bg-gray-100"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-[9px] sm:text-[10px] line-clamp-2 mb-0.5">
                  {bump.name}
                </h4>
                <p className="text-[10px] sm:text-xs font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                  R$ {(bump.discountPrice || bump.price).toFixed(2).replace('.', ',')}
                </p>
              </div>
              <button
                onClick={() => handleAddOrderBump(bump)}
                className="px-1.5 py-1 bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded text-[9px] sm:text-[10px] font-bold hover:shadow hover:from-slate-600 hover:to-slate-800 transition-all self-center flex-shrink-0"
              >
                + Add
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderStepMode = () => (
    <>
      <div className="flex items-center justify-between mb-3">
        <div className={`flex items-center gap-1 ${step >= 1 ? 'text-slate-700' : 'text-gray-400'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 text-[10px] font-bold ${step >= 1 ? 'border-slate-700 bg-slate-700 text-white' : 'border-gray-400'}`}>
            1
          </div>
          <span className="font-semibold text-[10px] hidden sm:inline">Dados</span>
        </div>
        <div className={`flex-1 h-[2px] mx-1 ${step >= 2 ? 'bg-slate-700' : 'bg-gray-300'}`} />
        <div className={`flex items-center gap-1 ${step >= 2 ? 'text-slate-700' : 'text-gray-400'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 text-[10px] font-bold ${step >= 2 ? 'border-slate-700 bg-slate-700 text-white' : 'border-gray-400'}`}>
            2
          </div>
          <span className="font-semibold text-[10px] hidden sm:inline">Entrega</span>
        </div>
        <div className={`flex-1 h-[2px] mx-1 ${step >= 3 ? 'bg-slate-700' : 'bg-gray-300'}`} />
        <div className={`flex items-center gap-1 ${step >= 3 ? 'text-slate-700' : 'text-gray-400'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 text-[10px] font-bold ${step >= 3 ? 'border-slate-700 bg-slate-700 text-white' : 'border-gray-400'}`}>
            3
          </div>
          <span className="font-semibold text-[10px] hidden sm:inline">Pagamento</span>
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-2.5">
          <div>
            <h3 className="text-xs sm:text-sm font-bold mb-2">Dados Pessoais</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
              <div className="sm:col-span-2">
                <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 mb-0.5">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 text-[11px] sm:text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-500"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 mb-0.5">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 text-[11px] sm:text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-500"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 mb-0.5">
                  CPF/CNPJ *
                </label>
                <input
                  type="text"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleInputChange}
                  placeholder="000.000.000-00"
                  className="w-full px-2 py-1 text-[11px] sm:text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-500"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 mb-0.5">
                  Telefone *
                </label>
                <div className="flex gap-1.5">
                  <select
                    name="ddi"
                    value={formData.ddi}
                    onChange={handleInputChange}
                    className="w-16 px-1.5 py-1 text-[11px] sm:text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-500"
                  >
                    <option value="+55">+55</option>
                    <option value="+1">+1</option>
                    <option value="+351">+351</option>
                  </select>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="(00) 00000-0000"
                    className="flex-1 px-2 py-1 text-[11px] sm:text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {config.orderBumps.position === 'step1' && renderOrderBumps()}

          <button
            onClick={() => setStep(2)}
            disabled={!isStep1Valid}
            className="w-full bg-gradient-to-r from-slate-700 to-slate-900 text-white py-1.5 sm:py-2 rounded text-[11px] sm:text-xs font-bold hover:shadow-lg hover:from-slate-600 hover:to-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
          >
            Continuar
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-2.5">
          <div>
            <h3 className="text-xs sm:text-sm font-bold mb-2">Endereço de Entrega</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
              <div className="sm:col-span-2">
                <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 mb-0.5">
                  CEP *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    placeholder="00000-000"
                    className="w-full px-2 py-1 text-[11px] sm:text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-500"
                    required
                  />
                  {loadingCep && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-slate-700"></div>
                    </div>
                  )}
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 mb-0.5">
                  Rua *
                </label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 text-[11px] sm:text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50"
                  required
                  readOnly={loadingCep}
                />
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 mb-0.5">
                  Número *
                </label>
                <input
                  type="text"
                  name="number"
                  value={formData.number}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 text-[11px] sm:text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-500"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 mb-0.5">
                  Complemento
                </label>
                <input
                  type="text"
                  name="complement"
                  value={formData.complement}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 text-[11px] sm:text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-500"
                />
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 mb-0.5">
                  Bairro *
                </label>
                <input
                  type="text"
                  name="neighborhood"
                  value={formData.neighborhood}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 text-[11px] sm:text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50"
                  required
                  readOnly={loadingCep}
                />
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 mb-0.5">
                  Cidade *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 text-[11px] sm:text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50"
                  required
                  readOnly={loadingCep}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 mb-0.5">
                  Estado *
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 text-[11px] sm:text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50"
                  required
                  readOnly={loadingCep}
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs sm:text-sm font-bold mb-1.5">Entrega</h3>
            <div className="space-y-1">
              {shippingOptions.map((option) => (
                <label
                  key={option.id}
                  className={`block p-1.5 sm:p-2 border rounded cursor-pointer transition text-[10px] sm:text-xs ${
                    selectedShipping === option.id
                      ? 'border-slate-700 bg-slate-50'
                      : 'border-gray-300 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="shipping"
                    value={option.id}
                    checked={selectedShipping === option.id}
                    onChange={(e) => setSelectedShipping(e.target.value)}
                    className="mr-1.5"
                  />
                  <span className="font-semibold">{option.name}</span>
                  <span className="text-gray-600 ml-1">- {option.deliveryTime}</span>
                  <span className="float-right font-bold">
                    {option.price === 0 ? 'Grátis' : `R$ ${option.price.toFixed(2).replace('.', ',')}`}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {config.orderBumps.position === 'step2' && renderOrderBumps()}

          <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-2 rounded space-y-1">
            <div className="flex justify-between text-[10px] sm:text-xs">
              <span className="text-gray-700">Subtotal</span>
              <span className="font-semibold">R$ {getTotal().toFixed(2).replace('.', ',')}</span>
            </div>
            <div className="flex justify-between text-[10px] sm:text-xs">
              <span className="text-gray-700">Frete</span>
              <span className="font-semibold">
                {shippingPrice === 0 ? 'Grátis' : `R$ ${shippingPrice.toFixed(2).replace('.', ',')}`}
              </span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm font-bold pt-1 border-t border-slate-200">
              <span>Total</span>
              <span className="text-sm sm:text-base bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                R$ {totalWithShipping.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>

          <div className="flex gap-1.5">
            <button
              onClick={() => setStep(1)}
              className="flex-1 border border-gray-300 py-1.5 rounded text-[11px] sm:text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              Voltar
            </button>
            <button
              onClick={handleSubmitOrder}
              disabled={!isStep2Valid || isSubmitting}
              className="flex-1 bg-gradient-to-r from-slate-700 to-slate-900 text-white py-1.5 rounded text-[11px] sm:text-xs font-bold hover:shadow-lg hover:from-slate-600 hover:to-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  Processando...
                </>
              ) : (
                <>
                  <CreditCard className="w-3 h-3" />
                  Finalizar
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );

  const renderDirectMode = () => (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Dados Pessoais</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
              Nome Completo *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
              CPF/CNPJ *
            </label>
            <input
              type="text"
              name="cpf"
              value={formData.cpf}
              onChange={handleInputChange}
              placeholder="000.000.000-00"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
              Telefone *
            </label>
            <div className="flex gap-2">
              <select
                name="ddi"
                value={formData.ddi}
                onChange={handleInputChange}
                className="w-24 px-2 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                <option value="+55">+55</option>
                <option value="+1">+1</option>
                <option value="+351">+351</option>
              </select>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="(00) 00000-0000"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                required
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Endereço de Entrega</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
              CEP *
            </label>
            <div className="relative">
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleInputChange}
                placeholder="00000-000"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                required
              />
              {loadingCep && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-700"></div>
                </div>
              )}
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
              Rua *
            </label>
            <input
              type="text"
              name="street"
              value={formData.street}
              onChange={handleInputChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 bg-gray-50"
              required
              readOnly={loadingCep}
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
              Número *
            </label>
            <input
              type="text"
              name="number"
              value={formData.number}
              onChange={handleInputChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
              Complemento
            </label>
            <input
              type="text"
              name="complement"
              value={formData.complement}
              onChange={handleInputChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
              Bairro *
            </label>
            <input
              type="text"
              name="neighborhood"
              value={formData.neighborhood}
              onChange={handleInputChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 bg-gray-50"
              required
              readOnly={loadingCep}
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
              Cidade *
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 bg-gray-50"
              required
              readOnly={loadingCep}
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-base sm:text-lg font-bold mb-3">Opções de Entrega</h3>
        <div className="space-y-2">
          {shippingOptions.map((option) => (
            <label
              key={option.id}
              className={`block p-3 border rounded-lg cursor-pointer transition text-sm ${
                selectedShipping === option.id
                  ? 'border-slate-700 bg-slate-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input
                type="radio"
                name="shipping"
                value={option.id}
                checked={selectedShipping === option.id}
                onChange={(e) => setSelectedShipping(e.target.value)}
                className="mr-2"
              />
              <span className="font-semibold">{option.name}</span>
              <span className="text-gray-600 ml-2">- {option.deliveryTime}</span>
              <span className="float-right font-bold">
                {option.price === 0 ? 'Grátis' : `R$ ${option.price.toFixed(2).replace('.', ',')}`}
              </span>
            </label>
          ))}
        </div>
      </div>

      {renderOrderBumps()}

      <div className="bg-gray-50 p-3 rounded-lg space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">R$ {getTotal().toFixed(2).replace('.', ',')}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Frete</span>
          <span className="font-medium">
            {shippingPrice === 0 ? 'Grátis' : `R$ ${shippingPrice.toFixed(2).replace('.', ',')}`}
          </span>
        </div>
        <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-200">
          <span className="text-gray-900">Total</span>
          <span className="text-lg bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
            R$ {totalWithShipping.toFixed(2).replace('.', ',')}
          </span>
        </div>
      </div>

      <button
        onClick={handleSubmitOrder}
        disabled={!isDirectValid || isSubmitting}
        className="w-full bg-gradient-to-r from-slate-700 to-slate-900 text-white py-3 rounded-lg text-sm font-bold hover:shadow-lg hover:from-slate-600 hover:to-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Processando...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4" />
            Finalizar Pedido
          </>
        )}
      </button>
    </div>
  );

  const renderPayment = () => (
    <div className="space-y-2.5">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-10 h-10 bg-emerald-100 rounded-full mb-2">
          <Check className="w-5 h-5 text-emerald-600" />
        </div>
        <h3 className="text-sm sm:text-base font-bold mb-0.5">Pedido Realizado!</h3>
        <p className="text-[10px] sm:text-xs text-gray-600">#{pixData?.orderId}</p>
      </div>

      <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-2.5 rounded text-center">
        <h4 className="font-bold mb-2 text-[10px] sm:text-xs">Escaneie para pagar</h4>
        <div className="bg-white p-2 inline-block rounded mb-2 shadow-sm">
          <img
            src={pixData?.qrCode}
            alt="QR Code PIX"
            className="w-32 h-32 sm:w-40 sm:h-40 mx-auto"
          />
        </div>
        <p className="text-[9px] sm:text-[10px] text-gray-600 mb-1.5">
          Ou copie o código:
        </p>
        <div className="flex gap-1">
          <input
            type="text"
            value={pixData?.code}
            readOnly
            className="flex-1 px-1.5 py-1 border border-gray-300 rounded bg-white text-[9px] sm:text-[10px]"
          />
          <button
            onClick={copyPixCode}
            className="px-2 py-1 bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded hover:from-slate-600 hover:to-slate-800 transition flex items-center gap-1 text-[9px] sm:text-[10px] font-bold"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'OK' : 'Copiar'}
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-2 rounded border border-slate-200">
        <h4 className="font-bold mb-1 text-[10px]">Valor</h4>
        <p className="text-lg sm:text-xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
          R$ {totalWithShipping.toFixed(2).replace('.', ',')}
        </p>
      </div>

      <div className="text-[9px] sm:text-[10px] text-gray-600 space-y-0.5 bg-slate-50 p-2 rounded">
        <p>• Confirmação por email após pagamento</p>
        <p>• Prazo começa após confirmação</p>
        <p>• Guarde o número do pedido</p>
      </div>

      <button
        onClick={() => {
          clearCart();
          onClose();
        }}
        className="w-full bg-gradient-to-r from-slate-700 to-slate-900 text-white py-1.5 sm:py-2 rounded text-[11px] sm:text-xs font-bold hover:shadow-lg hover:from-slate-600 hover:to-slate-800 transition-all"
      >
        Concluir
      </button>
    </div>
  );

  const isPaymentStep = (config.mode === 'steps' && step === 3) || (config.mode === 'direct' && step === 2);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
      <div className="min-h-screen px-2 py-2 sm:py-3">
        <div className="max-w-xl mx-auto bg-white rounded-lg shadow-lg">
          <div className="sticky top-0 bg-gradient-to-r from-slate-700 to-slate-900 p-2 flex items-center justify-between z-10 rounded-t-lg">
            <h2 className="text-xs sm:text-sm font-bold text-white">Finalizar Compra</h2>
            <button onClick={onClose} className="p-1 hover:bg-white/10 rounded transition-colors">
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </button>
          </div>

          <div className="p-2.5 sm:p-3">
            {isPaymentStep ? renderPayment() : config.mode === 'steps' ? renderStepMode() : renderDirectMode()}
          </div>
        </div>
      </div>
    </div>
  );
}
