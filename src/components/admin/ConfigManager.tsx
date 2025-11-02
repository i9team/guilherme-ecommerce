import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Save } from 'lucide-react';

export function ConfigManager() {
  const [config, setConfig] = useState({
    id: '',
    site_name: '',
    logo: '',
    favicon: '',
    tagline: '',
    description: '',
    primary_color: '',
    secondary_color: '',
    accent_color: '',
    contact_email: '',
    contact_phone: '',
    contact_whatsapp: '',
    social_instagram: '',
    social_facebook: '',
    social_twitter: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('site_config')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setConfig(data);
      }
    } catch (error) {
      console.error('Error loading config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { id, ...dataToSave } = config;
      const { error } = await supabase
        .from('site_config')
        .update(dataToSave)
        .eq('id', id);

      if (error) throw error;
      alert('Configurações salvas com sucesso!');
    } catch (error: any) {
      console.error('Error saving config:', error);
      alert('Erro ao salvar configurações: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-slate-700"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Configurações da Loja</h1>
        <p className="text-sm text-gray-600">Personalize a aparência e informações da sua loja</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md border border-gray-100 p-6 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Informações Básicas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nome da Loja</label>
              <input
                type="text"
                value={config.site_name}
                onChange={(e) => setConfig(prev => ({ ...prev, site_name: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tagline</label>
              <input
                type="text"
                value={config.tagline}
                onChange={(e) => setConfig(prev => ({ ...prev, tagline: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Descrição</label>
            <textarea
              value={config.description}
              onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Logo (URL)</label>
              <input
                type="url"
                value={config.logo}
                onChange={(e) => setConfig(prev => ({ ...prev, logo: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Favicon (URL)</label>
              <input
                type="url"
                value={config.favicon}
                onChange={(e) => setConfig(prev => ({ ...prev, favicon: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Contato</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={config.contact_email}
                onChange={(e) => setConfig(prev => ({ ...prev, contact_email: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Telefone</label>
              <input
                type="tel"
                value={config.contact_phone}
                onChange={(e) => setConfig(prev => ({ ...prev, contact_phone: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">WhatsApp</label>
              <input
                type="tel"
                value={config.contact_whatsapp}
                onChange={(e) => setConfig(prev => ({ ...prev, contact_whatsapp: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Redes Sociais</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Instagram</label>
              <input
                type="url"
                value={config.social_instagram}
                onChange={(e) => setConfig(prev => ({ ...prev, social_instagram: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Facebook</label>
              <input
                type="url"
                value={config.social_facebook}
                onChange={(e) => setConfig(prev => ({ ...prev, social_facebook: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Twitter</label>
              <input
                type="url"
                value={config.social_twitter}
                onChange={(e) => setConfig(prev => ({ ...prev, social_twitter: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </div>
      </form>
    </div>
  );
}
