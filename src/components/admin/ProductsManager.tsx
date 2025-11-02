import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Eye, EyeOff, Search } from 'lucide-react';
import { ProductForm } from './ProductForm';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  discount_price: number | null;
  category: string;
  subcategory: string;
  main_image: string;
  stock: number;
  active: boolean;
}

export function ProductsManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      await loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Erro ao excluir produto');
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ active: !product.active })
        .eq('id', product.id);

      if (error) throw error;
      await loadProducts();
    } catch (error) {
      console.error('Error toggling product status:', error);
      alert('Erro ao atualizar status');
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (showForm) {
    return (
      <ProductForm
        product={editingProduct}
        onSave={async () => {
          setShowForm(false);
          setEditingProduct(null);
          await loadProducts();
        }}
        onCancel={() => {
          setShowForm(false);
          setEditingProduct(null);
        }}
      />
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Produtos</h1>
          <p className="text-sm text-gray-600">{products.length} produtos cadastrados</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          Novo Produto
        </button>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar produtos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-slate-700"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Imagem</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Nome</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Categoria</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Preço</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Estoque</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <img
                        src={product.main_image}
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 text-sm">{product.name}</div>
                      <div className="text-xs text-gray-500">{product.slug}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">{product.category}</div>
                      <div className="text-xs text-gray-500">{product.subcategory}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-semibold text-gray-900">
                        R$ {product.price.toFixed(2)}
                      </div>
                      {product.discount_price && (
                        <div className="text-xs text-green-600 font-medium">
                          R$ {product.discount_price.toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-medium ${product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-orange-600' : 'text-red-600'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleActive(product)}
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          product.active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {product.active ? (
                          <>
                            <Eye className="w-3 h-3" />
                            Ativo
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3" />
                            Inativo
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingProduct(product);
                            setShowForm(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhum produto encontrado</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
