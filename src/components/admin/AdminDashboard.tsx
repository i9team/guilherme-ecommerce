import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Package, Image, TrendingUp, ShoppingCart } from 'lucide-react';

export function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    activeProducts: 0,
    banners: 0,
    activeBanners: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [productsResult, bannersResult] = await Promise.all([
        supabase.from('products').select('id, active', { count: 'exact' }),
        supabase.from('banners').select('id, active', { count: 'exact' }),
      ]);

      const activeProducts = productsResult.data?.filter(p => p.active).length || 0;
      const activeBanners = bannersResult.data?.filter(b => b.active).length || 0;

      setStats({
        products: productsResult.count || 0,
        activeProducts,
        banners: bannersResult.count || 0,
        activeBanners,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total de Produtos',
      value: stats.products,
      subtitle: `${stats.activeProducts} ativos`,
      icon: Package,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Banners',
      value: stats.banners,
      subtitle: `${stats.activeBanners} ativos`,
      icon: Image,
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Vendas',
      value: '0',
      subtitle: 'Este mês',
      icon: ShoppingCart,
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      title: 'Crescimento',
      value: '0%',
      subtitle: 'vs. mês anterior',
      icon: TrendingUp,
      color: 'from-orange-500 to-orange-600',
    },
  ];

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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-sm text-gray-600">Visão geral da sua loja</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${card.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900 mb-1">{card.value}</p>
                <p className="text-xs text-gray-500">{card.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-slate-500 hover:bg-slate-50 transition-colors text-sm font-medium text-gray-700">
            + Adicionar Produto
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-slate-500 hover:bg-slate-50 transition-colors text-sm font-medium text-gray-700">
            + Criar Banner
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-slate-500 hover:bg-slate-50 transition-colors text-sm font-medium text-gray-700">
            ⚙️ Configurações
          </button>
        </div>
      </div>
    </div>
  );
}
