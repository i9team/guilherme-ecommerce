import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Check, ChevronLeft, Zap, Package, Truck } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { api, ShippingOption, Product } from '../services/api';
import { maskPhone, maskCpfCnpj, maskCep, unmask } from '../utils/masks';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, getTotal, clearCart, addItem } = useCart();
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
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
    if (items.length === 0) {
      navigate('/');
    }
  }, [items, navigate]);

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

      setStep(3);
    } catch (error) {
      console.error('Error creating order:', error);
      showToast('Erro ao processar pedido. Tente novamente.', 'error');
    }
  };

  const copyPixCode = () => {
    if (pixData) {
      navigator.clipboard.writeText(pixData.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getShippingIcon = (id: string) => {
    if (id === 'free') return <Zap className="w-4 h-4 text-green-600" />;
    if (id === 'express') return <Package className="w-4 h-4 text-slate-700" />;
    return <Truck className="w-4 h-4 text-gray-600" />;
  };

  const selectedShippingOption = shippingOptions.find(opt => opt.id === selectedShipping);
  const shippingPrice = selectedShippingOption?.price || 0;
  const totalWithShipping = getTotal() + shippingPrice;

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen py-6 sm:py-8 lg:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-slate-900 mb-6 sm:mb-8 font-medium hover:gap-3 transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
          Voltar para a loja
        </button>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 lg:p-8 xl:p-10 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent mb-6 sm:mb-8 lg:mb-10">Finalizar Compra</h1>

          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div className={`flex items-center ${step >= 1 ? 'text-slate-700' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 text-sm sm:text-base font-semibold ${step >= 1 ? 'border-slate-700 bg-slate-700 text-white' : 'border-gray-400'}`}>
                1
              </div>
              <span className="ml-2 sm:ml-3 text-sm sm:text-base font-medium hidden xs:inline">Dados</span>
            </div>
            <div className={`flex-1 h-1 mx-2 sm:mx-4 ${step >= 2 ? 'bg-slate-700' : 'bg-gray-300'}`} />
            <div className={`flex items-center ${step >= 2 ? 'text-slate-700' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 text-sm sm:text-base font-semibold ${step >= 2 ? 'border-slate-700 bg-slate-700 text-white' : 'border-gray-400'}`}>
                2
              </div>
              <span className="ml-2 sm:ml-3 text-sm sm:text-base font-medium hidden xs:inline">Entrega</span>
            </div>
            <div className={`flex-1 h-1 mx-2 sm:mx-4 ${step >= 3 ? 'bg-slate-700' : 'bg-gray-300'}`} />
            <div className={`flex items-center ${step >= 3 ? 'text-slate-700' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 text-sm sm:text-base font-semibold ${step >= 3 ? 'border-slate-700 bg-slate-700 text-white' : 'border-gray-400'}`}>
                3
              </div>
              <span className="ml-2 sm:ml-3 text-sm sm:text-base font-medium hidden xs:inline">Pagamento</span>
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-2.5">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-2">Dados Pessoais</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] sm:text-xs font-bold text-gray-700 mb-1">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-2.5 py-1.5 sm:py-2 border border-gray-300 rounded text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-xs font-bold text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-2.5 py-1.5 sm:py-2 border border-gray-300 rounded text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-xs font-bold text-gray-700 mb-1">
                      CPF/CNPJ *
                    </label>
                    <input
                      type="text"
                      name="cpf"
                      value={formData.cpf}
                      onChange={handleInputChange}
                      placeholder="000.000.000-00"
                      className="w-full px-2.5 py-1.5 sm:py-2 border border-gray-300 rounded text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] sm:text-xs font-bold text-gray-700 mb-1">
                      Telefone *
                    </label>
                    <div className="flex gap-1.5 w-full">
                      <select
                        name="ddi"
                        value={formData.ddi}
                        onChange={handleInputChange}
                        className="w-16 flex-shrink-0 px-1.5 py-1.5 sm:py-2 border border-gray-300 rounded text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
                      >
                        <option value="+55">+55</option>
                        <option value="+1">+1</option>
                        <option value="+351">+351</option>
                        <option value="+44">+44</option>
                        <option value="+34">+34</option>
                      </select>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="(00) 00000-0000"
                        className="flex-1 min-w-0 px-2.5 py-1.5 sm:py-2 border border-gray-300 rounded text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {orderBumps.length > 0 && (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-300 rounded-lg p-2.5 sm:p-3">
                  <h3 className="font-bold text-xs sm:text-sm mb-2 text-amber-900">
                    Complete seu pedido
                  </h3>
                  <div className="space-y-1.5">
                    {orderBumps.map((bump) => (
                      <div key={bump.id} className="bg-white rounded p-2 flex gap-2 items-center">
                        <img
                          src={bump.mainImage}
                          alt={bump.name}
                          className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-[10px] sm:text-xs line-clamp-2 mb-0.5">
                            {bump.name}
                          </h4>
                          <p className="text-sm sm:text-base font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                            R$ {(bump.discountPrice || bump.price).toFixed(2).replace('.', ',')}
                          </p>
                        </div>
                        <button
                          onClick={() => handleAddOrderBump(bump)}
                          className="px-2 py-1.5 bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded text-[10px] sm:text-xs font-bold hover:shadow hover:from-slate-600 hover:to-slate-800 transition flex-shrink-0"
                        >
                          + Add
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => setStep(2)}
                disabled={!formData.name || !formData.email || !formData.phone || !formData.cpf}
                className="w-full bg-gradient-to-r from-slate-700 to-slate-900 text-white py-2 sm:py-2.5 rounded text-xs sm:text-sm font-bold hover:shadow-lg hover:from-slate-600 hover:to-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
              >
                Continuar
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-2.5">
              <div>
                <h3 className="text-sm sm:text-base font-bold mb-2">Endereço de Entrega</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] sm:text-xs font-bold text-gray-700 mb-1">
                      CEP *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        placeholder="00000-000"
                        className="w-full px-2.5 py-1.5 sm:py-2 border border-gray-300 rounded text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
                        required
                      />
                      {loadingCep && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                          <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-slate-700"></div>
                        </div>
                      )}
                    </div>
                    <p className="text-[9px] text-gray-500 mt-0.5">Preenchimento automático</p>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] sm:text-xs font-bold text-gray-700 mb-1">
                      Rua *
                    </label>
                    <input
                      type="text"
                      name="street"
                      value={formData.street}
                      onChange={handleInputChange}
                      className="w-full px-2.5 py-1.5 sm:py-2 border border-gray-300 rounded text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-slate-500 bg-gray-50"
                      required
                      readOnly={loadingCep}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-xs font-bold text-gray-700 mb-1">
                      Número *
                    </label>
                    <input
                      type="text"
                      name="number"
                      value={formData.number}
                      onChange={handleInputChange}
                      className="w-full px-2.5 py-1.5 sm:py-2 border border-gray-300 rounded text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-xs font-bold text-gray-700 mb-1">
                      Complemento
                    </label>
                    <input
                      type="text"
                      name="complement"
                      value={formData.complement}
                      onChange={handleInputChange}
                      className="w-full px-2.5 py-1.5 sm:py-2 border border-gray-300 rounded text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-xs font-bold text-gray-700 mb-1">
                      Bairro *
                    </label>
                    <input
                      type="text"
                      name="neighborhood"
                      value={formData.neighborhood}
                      onChange={handleInputChange}
                      className="w-full px-2.5 py-1.5 sm:py-2 border border-gray-300 rounded text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-slate-500 bg-gray-50"
                      required
                      readOnly={loadingCep}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-xs font-bold text-gray-700 mb-1">
                      Cidade *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-2.5 py-1.5 sm:py-2 border border-gray-300 rounded text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-slate-500 bg-gray-50"
                      required
                      readOnly={loadingCep}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] sm:text-xs font-bold text-gray-700 mb-1">
                      Estado *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-2.5 py-1.5 sm:py-2 border border-gray-300 rounded text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-slate-500 bg-gray-50"
                      required
                      readOnly={loadingCep}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm sm:text-base font-bold mb-2">Escolha o Frete</h3>
                <div className="space-y-1.5">
                  {shippingOptions.map((option) => (
                    <label
                      key={option.id}
                      className={`block border rounded p-2 cursor-pointer transition ${
                        selectedShipping === option.id
                          ? option.price === 0
                            ? 'border-green-500 bg-green-50'
                            : 'border-slate-700 bg-slate-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="shipping"
                          value={option.id}
                          checked={selectedShipping === option.id}
                          onChange={(e) => setSelectedShipping(e.target.value)}
                          className="w-3.5 h-3.5 flex-shrink-0"
                        />
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          <div className="flex-shrink-0">{getShippingIcon(option.id)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 flex-wrap">
                              <span className="font-bold text-[10px] sm:text-xs">{option.name}</span>
                              {option.price === 0 && (
                                <span className="text-green-600 font-bold text-[9px]">Grátis</span>
                              )}
                            </div>
                            <p className="text-[9px] text-gray-600">
                              {option.deliveryTime}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm sm:text-base font-bold">
                              {option.price === 0 ? (
                                <span className="text-green-600">R$ 0</span>
                              ) : (
                                `R$ ${option.price.toFixed(2).replace('.', ',')}`
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-2 rounded space-y-1">
                <div className="flex justify-between text-[10px] sm:text-xs">
                  <span>Subtotal</span>
                  <span>R$ {getTotal().toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between text-[10px] sm:text-xs">
                  <span>Frete</span>
                  <span className={shippingPrice === 0 ? 'text-green-600 font-bold' : ''}>
                    {shippingPrice === 0 ? 'Grátis' : `R$ ${shippingPrice.toFixed(2).replace('.', ',')}`}
                  </span>
                </div>
                <div className="flex justify-between text-base sm:text-lg font-bold pt-1 border-t">
                  <span>Total</span>
                  <span className="bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">R$ {totalWithShipping.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>

              <div className="flex gap-1.5">
                <button
                  onClick={() => setStep(1)}
                  className="w-20 border border-gray-300 py-2 rounded text-[10px] sm:text-xs font-bold hover:bg-gray-50 transition"
                >
                  Voltar
                </button>
                <button
                  onClick={handleSubmitOrder}
                  disabled={!formData.zipCode || !formData.street || !formData.number || !formData.neighborhood || !formData.city || !formData.state}
                  className="flex-1 bg-gradient-to-r from-slate-700 to-slate-900 text-white py-2 rounded text-[10px] sm:text-xs font-bold hover:shadow-lg hover:from-slate-600 hover:to-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Gerar PIX
                </button>
              </div>
            </div>
          )}

          {step === 3 && pixData && (
            <div className="space-y-2.5">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full mb-2">
                  <Check className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-base sm:text-lg font-bold mb-1">Pedido Realizado!</h3>
                <p className="text-xs text-gray-600">#{pixData.orderId}</p>
              </div>

              <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-2 rounded border border-slate-200">
                <h4 className="font-bold mb-1.5 text-[10px]">Seus Produtos</h4>
                <div className="space-y-1">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex gap-1.5 bg-white p-1.5 rounded">
                      <img
                        src={item.product.mainImage}
                        alt={item.product.name}
                        className="w-8 h-8 object-cover rounded flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-semibold line-clamp-1">{item.product.name}</p>
                        <p className="text-[8px] text-gray-600">Qtd: {item.quantity}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-[10px] font-bold">
                          R$ {((item.product.discountPrice || item.product.price) * item.quantity).toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 rounded text-center">
                <h4 className="font-bold mb-2 text-xs sm:text-sm">Escaneie para pagar</h4>
                <div className="bg-white p-2 inline-block rounded mb-2 shadow-sm">
                  <img
                    src={pixData.qrCode}
                    alt="QR Code PIX"
                    className="w-36 h-36 sm:w-44 sm:h-44 mx-auto"
                  />
                </div>
                <p className="text-[10px] text-gray-600 mb-1.5">
                  Ou copie o código:
                </p>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={pixData.code}
                    readOnly
                    className="flex-1 px-2 py-1.5 border border-gray-300 rounded bg-white text-[10px] sm:text-xs"
                  />
                  <button
                    onClick={copyPixCode}
                    className="px-3 py-1.5 bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded hover:from-slate-600 hover:to-slate-800 transition flex items-center gap-1 font-bold text-[10px] sm:text-xs"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'OK' : 'Copiar'}
                  </button>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-2.5 rounded border border-slate-200">
                <h4 className="font-bold mb-1 text-[10px]">Valor</h4>
                <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                  R$ {totalWithShipping.toFixed(2).replace('.', ',')}
                </p>
              </div>

              <div className="bg-slate-50 p-2 rounded">
                <ul className="text-[10px] text-gray-700 space-y-1">
                  <li className="flex items-start gap-1">
                    <span className="text-slate-700 mt-0.5">•</span>
                    <span>Confirmação por email após pagamento</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="text-slate-700 mt-0.5">•</span>
                    <span>Prazo começa após confirmação</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="text-slate-700 mt-0.5">•</span>
                    <span>Guarde o número do pedido</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => {
                  clearCart();
                  navigate('/');
                }}
                className="w-full bg-gradient-to-r from-slate-700 to-slate-900 text-white py-2 sm:py-2.5 rounded text-xs sm:text-sm font-bold hover:shadow-lg hover:from-slate-600 hover:to-slate-800 transition"
              >
                Concluir
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
