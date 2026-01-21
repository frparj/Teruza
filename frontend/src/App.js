import React from 'react';
import '@/App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { CartProvider } from '@/contexts/CartContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/sonner';
import TopBar from '@/components/TopBar';
import BottomNav from '@/components/BottomNav';

// Guest Pages
import HomePage from '@/pages/HomePage';
import CatalogPage from '@/pages/CatalogPage';
import CartPage from '@/pages/CartPage';
import CheckoutPage from '@/pages/CheckoutPage';
import ConfirmationPage from '@/pages/ConfirmationPage';
import InformationPage from '@/pages/InformationPage';

// Admin Pages
import AdminLoginPage from '@/pages/admin/AdminLoginPage';
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import AdminProductFormPage from '@/pages/admin/AdminProductFormPage';
import AdminCategoriesPage from '@/pages/admin/AdminCategoriesPage';
import AdminAnalyticsPage from '@/pages/admin/AdminAnalyticsPage';
import AdminOrdersPage from '@/pages/admin/AdminOrdersPage';

const GuestLayout = ({ children }) => {
  return (
    <div className="mobile-container">
      <TopBar />
      {children}
      <BottomNav />
    </div>
  );
};

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" />;
  }

  return children;
};

function App() {
  return (
    <LanguageProvider>
      <CartProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Guest Routes */}
              <Route
                path="/"
                element={
                  <GuestLayout>
                    <HomePage />
                  </GuestLayout>
                }
              />
              <Route
                path="/catalog"
                element={
                  <GuestLayout>
                    <CatalogPage />
                  </GuestLayout>
                }
              />
              <Route
                path="/cart"
                element={
                  <GuestLayout>
                    <CartPage />
                  </GuestLayout>
                }
              />
              <Route
                path="/checkout"
                element={
                  <GuestLayout>
                    <CheckoutPage />
                  </GuestLayout>
                }
              />
              <Route path="/confirmation" element={<ConfirmationPage />} />
              <Route
                path="/information"
                element={
                  <GuestLayout>
                    <InformationPage />
                  </GuestLayout>
                }
              />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/categories"
                element={
                  <ProtectedRoute>
                    <AdminCategoriesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/products/:id"
                element={
                  <ProtectedRoute>
                    <AdminProductFormPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
          <Toaster position="top-center" richColors />
        </AuthProvider>
      </CartProvider>
    </LanguageProvider>
  );
}

export default App;
