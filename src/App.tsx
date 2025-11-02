import { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import { ToastProvider } from './contexts/ToastContext';
import { AdminAuthProvider, useAdminAuth } from './contexts/AdminAuthContext';
import { Header } from './components/Header';
import { MobileNavFooter } from './components/MobileNavFooter';
import { HomePage } from './components/HomePage';
import { ProductsPage } from './components/ProductsPage';
import { OffersPage } from './components/OffersPage';
import { AboutPage } from './components/AboutPage';
import { ProductPage } from './components/ProductPage';
import { CheckoutPage } from './components/CheckoutPage';
import { Cart } from './components/Cart';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ProductsManager } from './components/admin/ProductsManager';
import { BannersManager } from './components/admin/BannersManager';
import { ConfigManager } from './components/admin/ConfigManager';

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-slate-700"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return <AdminLogin />;
  }

  return <>{children}</>;
}

function AdminPages() {
  return (
    <AdminRoute>
      <AdminLayoutWithPages />
    </AdminRoute>
  );
}

function AdminLayoutWithPages() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  return (
    <AdminLayout>
      {currentPage === 'dashboard' && <AdminDashboard />}
      {currentPage === 'products' && <ProductsManager />}
      {currentPage === 'banners' && <BannersManager />}
      {currentPage === 'config' && <ConfigManager />}
    </AdminLayout>
  );
}

function AdminContent() {
  return <AdminPages />;
}

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showCart, setShowCart] = useState(false);

  const handleProductClick = (slug: string) => {
    navigate(`/product/${slug}`);
  };

  const handleCartClick = () => {
    setShowCart(true);
  };

  const handleCloseCart = () => {
    setShowCart(false);
  };

  const handleCheckout = () => {
    setShowCart(false);
    navigate('/checkout');
  };

  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    return (
      <Routes>
        <Route path="/admin/*" element={<AdminContent />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden w-full pb-16 lg:pb-0">
      <Header onCartClick={handleCartClick} />

      <Routes>
        <Route
          path="/"
          element={<HomePage onProductClick={handleProductClick} />}
        />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/offers" element={<OffersPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/product/:slug" element={<ProductPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
      </Routes>

      <MobileNavFooter onCartClick={handleCartClick} />

      {showCart && (
        <Cart
          onClose={handleCloseCart}
          onCheckout={handleCheckout}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AdminAuthProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </AdminAuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
