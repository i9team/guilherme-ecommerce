import { ReactNode, useState } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import {
  LayoutDashboard,
  Package,
  Image,
  Settings,
  LogOut,
  Menu,
  X,
  Store
} from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { signOut, user } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Produtos', icon: Package },
    { id: 'banners', label: 'Banners', icon: Image },
    { id: 'config', label: 'Configurações', icon: Settings },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50">
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                Admin
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-sm text-gray-600">
              {user?.email}
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </div>

      <div className={`fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 z-40 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-gray-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="lg:ml-64 pt-16">
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
