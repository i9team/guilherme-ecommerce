import { X, Home, Package, ShoppingBag, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-50 lg:hidden"
        onClick={onClose}
      />
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 lg:hidden transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
              Menu
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-700" />
            </button>
          </div>

          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleNavigation('/')}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors text-left"
                >
                  <Home className="w-5 h-5" />
                  <span className="font-medium">Início</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('/products')}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors text-left"
                >
                  <Package className="w-5 h-5" />
                  <span className="font-medium">Produtos</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('/offers')}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors text-left"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span className="font-medium">Ofertas</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('/about')}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors text-left"
                >
                  <Info className="w-5 h-5" />
                  <span className="font-medium">Sobre</span>
                </button>
              </li>
            </ul>
          </nav>

          <div className="p-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Loja Premium © 2024
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
