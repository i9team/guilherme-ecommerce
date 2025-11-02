import { useState, useEffect } from 'react';
import { Star, Package, Shield, Truck, Clock, Heart, Award, Users, CheckCircle, BadgeCheck } from 'lucide-react';
import { api, StoreInfo, AboutConfig } from '../services/api';

export function AboutPage() {
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [config, setConfig] = useState<AboutConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [storeData, configData] = await Promise.all([
          api.getStoreInfo(),
          api.getAboutConfig(),
        ]);
        setStoreInfo(storeData);
        setConfig(configData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-14 w-14 border-4 border-slate-200 border-t-slate-700"></div>
      </div>
    );
  }

  if (!storeInfo || !config) {
    return null;
  }

  const iconMap: Record<string, any> = {
    users: Users,
    star: Star,
    heart: Heart,
    award: Award,
    package: Package,
    shield: Shield,
    truck: Truck,
    clock: Clock,
  };

  const colorMap: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600',
    emerald: 'from-emerald-500 to-emerald-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">

        <div className="mb-3 bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 rounded-xl p-4 sm:p-6 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
            <div className="relative flex-shrink-0">
              <img
                src={storeInfo.logo}
                alt={storeInfo.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shadow-lg border-2 border-white/20"
              />
              <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-full p-1">
                <BadgeCheck className="w-4 h-4 fill-white" />
              </div>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1">
                {config.hero.title || storeInfo.name}
              </h1>
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < Math.floor(storeInfo.rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-white/20 text-white/20'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm sm:text-base font-bold">{storeInfo.rating}</span>
                <span className="text-xs text-white/80">
                  ({storeInfo.totalReviews.toLocaleString()})
                </span>
              </div>
              <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
                {config.hero.subtitle}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {config.stats.map((stat, index) => {
            const Icon = iconMap[stat.icon] || Users;
            return (
              <div
                key={index}
                className="bg-white rounded-lg p-3 shadow-md border border-gray-200 text-center hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-center mb-1.5">
                  <div className="bg-gradient-to-br from-slate-700 to-slate-900 p-1.5 rounded-lg">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                </div>
                <p className="text-base sm:text-lg font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="text-[9px] sm:text-[10px] text-gray-600 font-semibold">{stat.label}</p>
              </div>
            );
          })}
        </div>

        <div className="mb-3">
          <h2 className="text-sm sm:text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
            <div className="bg-gradient-to-br from-slate-700 to-slate-900 p-1.5 rounded-lg">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
            Nossos Diferenciais
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {config.benefits.map((benefit, index) => {
              const Icon = iconMap[benefit.icon] || Package;
              const color = colorMap[benefit.color] || 'from-blue-500 to-blue-600';
              return (
                <div
                  key={index}
                  className="bg-white rounded-lg p-3 shadow-md hover:shadow-xl transition-all border border-gray-100"
                >
                  <div className="flex items-center justify-center mb-2">
                    <div className={`bg-gradient-to-br ${color} p-2 rounded-lg shadow-md`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <h3 className="text-[10px] sm:text-xs font-bold text-gray-900 text-center mb-0.5">
                    {benefit.title}
                  </h3>
                  <p className="text-[8px] sm:text-[9px] text-gray-600 text-center">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mb-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 sm:p-4 border border-blue-200">
          <h2 className="text-sm sm:text-base font-bold text-blue-900 mb-2 flex items-center gap-2">
            <Heart className="w-4 h-4 fill-blue-600 text-blue-600" />
            {config.mission.title}
          </h2>
          <p className="text-[10px] sm:text-xs text-blue-800 leading-relaxed">
            {config.mission.text}
          </p>
        </div>

        {storeInfo.reviews.length > 0 && (
          <div>
            <h2 className="text-sm sm:text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
              <div className="bg-gradient-to-br from-amber-400 to-amber-500 p-1.5 rounded-lg">
                <Star className="w-4 h-4 text-white fill-white" />
              </div>
              Avaliações dos Clientes
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {storeInfo.reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white rounded-lg p-3 shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start gap-2 mb-2">
                    <div className="flex-shrink-0 bg-gradient-to-br from-slate-700 to-slate-900 text-white w-8 h-8 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold">
                        {review.userName.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] sm:text-xs font-bold text-gray-900">
                          {review.userName}
                        </span>
                        {review.verified && (
                          <BadgeCheck className="w-3 h-3 text-emerald-500 fill-emerald-500 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < review.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'fill-gray-200 text-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-[9px] sm:text-[10px] text-gray-700 leading-relaxed">
                    {review.comment}
                  </p>
                  <p className="text-[8px] text-gray-500 mt-1.5">
                    {new Date(review.date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-3 sm:p-4 border border-emerald-200 text-center">
          <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
          <h3 className="text-xs sm:text-sm font-bold text-emerald-900 mb-1">
            {config.guarantee.title}
          </h3>
          <p className="text-[9px] sm:text-[10px] text-emerald-800 leading-relaxed max-w-2xl mx-auto">
            {config.guarantee.text}
          </p>
        </div>
      </div>
    </div>
  );
}
