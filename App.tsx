
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute'; 
import HomePage from './pages/HomePage';
import BrowsePage from './pages/BrowsePage';
import SellItemPage from './pages/SellItemPage';
import AdminPage from './pages/AdminPage';
import CartPage from './pages/CartPage';
import AuthPage from './pages/AuthPage'; // Import AuthPage
import NotFoundPage from './pages/NotFoundPage';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext'; 

const App: React.FC = () => {
  return (
    <AuthProvider> 
      <CartProvider>
        <HashRouter>
          <div className="flex flex-col min-h-screen bg-gray-900 text-gray-300">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/browse" element={<BrowsePage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/auth" element={<AuthPage />} /> {/* New Auth Route */}
                
                <Route 
                  path="/sell" 
                  element={
                    <ProtectedRoute>
                      <SellItemPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <AdminPage />
                    </ProtectedRoute>
                  } 
                />
                
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </HashRouter>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;