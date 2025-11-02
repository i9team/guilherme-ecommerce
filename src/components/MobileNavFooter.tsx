import { Home, Package, Tag, Info, ShoppingCart } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

interface MobileNavFooterProps {
  onCartClick: () => void;
}

export function MobileNavFooter({ onCartClick }: MobileNavFooterProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { getItemCount } = useCart();
  const itemCount = getItemCount();

  const navItems = [
    { icon: Home, label: 'Início', path: '/' },
    { icon: Package, label: 'Produtos', path: '/products' },
    { icon: Tag, label: 'Ofertas', path: '/offers' },
    { icon: Info, label: 'Sobre', path: '/about' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden z-50 shadow-lg">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                active
                  ? 'text-slate-900 bg-slate-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className={`text-xs ${active ? 'font-semibold' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
        <button
          onClick={onCartClick}
          className="flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-gray-700 transition-colors relative"
        >
          <ShoppingCart className="w-5 h-5 stroke-2" />
          {itemCount > 0 && (
            <span className="absolute top-2 right-1/2 translate-x-2 -translate-y-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {itemCount}
            </span>
          )}
          <span className="text-xs font-medium">Carrinho</span>
        </button>
      </div>
    </nav>
  );
}
