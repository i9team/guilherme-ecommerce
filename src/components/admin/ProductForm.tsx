import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Plus, X } from 'lucide-react';

interface ProductFormProps {
  product: any;
  onSave: () => void;
  onCancel: () => void;
}

export function ProductForm({ product, onSave, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    price: '',
    discount_price: '',
    category: '',
    subcategory: '',
    main_image: '',
    images: [] as string[],
    description: '',
    stock: '0',
    rating: '0',
    review_count: '0',
    active: true,
    variations: [] as any[],
  });
  const [loading, setLoading] = useState(false);
  const [imageInput, setImageInput] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        slug: product.slug || '',
        price: product.price?.toString() || '',
        discount_price: product.discount_price?.toString() || '',
        category: product.category || '',
        subcategory: product.subcategory || '',
        main_image: product.main_image || '',
        images: product.images || [],
        description: product.description || '',
        stock: product.stock?.toString() || '0',
        rating: product.rating?.toString() || '0',
        review_count: product.review_count?.toString() || '0',
        active: product.active ?? true,
        variations: product.variations || [],
      });
    }
  }, [product]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));
  };

  const handleAddImage = () => {
    if (imageInput.trim() && !formData.images.includes(imageInput.trim())) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, imageInput.trim()],
      }));
      setImageInput('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSave = {
        name: formData.name,
        slug: formData.slug,
        price: parseFloat(formData.price),
        discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
        category: formData.category,
        subcategory: formData.subcategory,
        main_image: formData.main_image,
        images: formData.images,
        description: formData.description,
        stock: parseInt(formData.stock),
        rating: parseFloat(formData.rating),
        review_count: parseInt(formData.review_count),
        active: formData.active,
        variations: formData.variations,
      };

      if (product) {
        const { error } = await supabase
          .from('products')
          .update(dataToSave)
          .eq('id', product.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert(dataToSave);
        if (error) throw error;
      }

      onSave();
    } catch (error: any) {
      console.error('Error saving product:', error);
      alert('Erro ao salvar produto: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={onCancel}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Voltar
      </button>

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          {product ? 'Editar Produto' : 'Novo Produto'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md border border-gray-100 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nome do Produto *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Slug *
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Preço (R$) *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Preço com Desconto (R$)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.discount_price}
              onChange={(e) => setFormData(prev => ({ ...prev, discount_price: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Categoria *
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Subcategoria *
            </label>
            <input
              type="text"
              value={formData.subcategory}
              onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Estoque *
            </label>
            <input
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                className="w-4 h-4 text-slate-600 border-gray-300 rounded focus:ring-slate-500"
              />
              <span className="text-sm font-semibold text-gray-700">Produto Ativo</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Imagem Principal (URL) *
          </label>
          <input
            type="url"
            value={formData.main_image}
            onChange={(e) => setFormData(prev => ({ ...prev, main_image: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            placeholder="https://exemplo.com/imagem.jpg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Imagens Adicionais (URLs)
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="url"
              value={imageInput}
              onChange={(e) => setImageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddImage();
                }
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              placeholder="https://exemplo.com/imagem.jpg"
            />
            <button
              type="button"
              onClick={handleAddImage}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          {formData.images.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.images.map((img, index) => (
                <div key={index} className="relative group">
                  <img
                    src={img}
                    alt={`Image ${index + 1}`}
                    className="w-20 h-20 rounded-lg object-cover border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Descrição
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar Produto'}
          </button>
        </div>
      </form>
    </div>
  );
}
