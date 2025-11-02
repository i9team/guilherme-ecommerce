import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Eye, EyeOff, ArrowLeft } from 'lucide-react';

interface Banner {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  link: string;
  position: number;
  active: boolean;
}

export function BannersManager() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState({
    image: '',
    title: '',
    subtitle: '',
    link: '/products',
    position: 0,
    active: true,
  });

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('position', { ascending: true });

      if (error) throw error;
      setBanners(data || []);
    } catch (error) {
      console.error('Error loading banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este banner?')) return;

    try {
      const { error } = await supabase.from('banners').delete().eq('id', id);
      if (error) throw error;
      await loadBanners();
    } catch (error) {
      console.error('Error deleting banner:', error);
      alert('Erro ao excluir banner');
    }
  };

  const handleToggleActive = async (banner: Banner) => {
    try {
      const { error } = await supabase
        .from('banners')
        .update({ active: !banner.active })
        .eq('id', banner.id);

      if (error) throw error;
      await loadBanners();
    } catch (error) {
      console.error('Error toggling banner status:', error);
      alert('Erro ao atualizar status');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingBanner) {
        const { error } = await supabase
          .from('banners')
          .update(formData)
          .eq('id', editingBanner.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('banners').insert(formData);
        if (error) throw error;
      }

      setShowForm(false);
      setEditingBanner(null);
      setFormData({
        image: '',
        title: '',
        subtitle: '',
        link: '/products',
        position: 0,
        active: true,
      });
      await loadBanners();
    } catch (error: any) {
      console.error('Error saving banner:', error);
      alert('Erro ao salvar banner: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      image: banner.image,
      title: banner.title,
      subtitle: banner.subtitle,
      link: banner.link,
      position: banner.position,
      active: banner.active,
    });
    setShowForm(true);
  };

  if (showForm) {
    return (
      <div>
        <button
          onClick={() => {
            setShowForm(false);
            setEditingBanner(null);
          }}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </button>

        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {editingBanner ? 'Editar Banner' : 'Novo Banner'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md border border-gray-100 p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              URL da Imagem *
            </label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              required
            />
            {formData.image && (
              <img
                src={formData.image}
                alt="Preview"
                className="mt-3 w-full h-48 object-cover rounded-lg"
              />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Título *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Subtítulo *
              </label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Link *
              </label>
              <input
                type="text"
                value={formData.link}
                onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Posição
              </label>
              <input
                type="number"
                value={formData.position}
                onChange={(e) => setFormData(prev => ({ ...prev, position: parseInt(e.target.value) }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                className="w-4 h-4 text-slate-600 border-gray-300 rounded focus:ring-slate-500"
              />
              <span className="text-sm font-semibold text-gray-700">Banner Ativo</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingBanner(null);
              }}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar Banner'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Banners</h1>
          <p className="text-sm text-gray-600">{banners.length} banners cadastrados</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          Novo Banner
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-slate-700"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {banners.map((banner) => (
            <div key={banner.id} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
              <div className="relative h-48">
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <button
                    onClick={() => handleToggleActive(banner)}
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      banner.active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {banner.active ? 'Ativo' : 'Inativo'}
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-1">{banner.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{banner.subtitle}</p>
                <p className="text-xs text-gray-500 mb-3">Link: {banner.link}</p>
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleEdit(banner)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(banner.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {banners.length === 0 && !loading && (
        <div className="text-center py-12 bg-white rounded-xl shadow-md border border-gray-100">
          <p className="text-gray-500">Nenhum banner cadastrado</p>
        </div>
      )}
    </div>
  );
}
