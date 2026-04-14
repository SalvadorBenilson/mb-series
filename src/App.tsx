import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Store from './pages/Store';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import Reader from './pages/Reader';
import Auth from './pages/Auth';
import { BookOpen } from 'lucide-react';

const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ children, adminOnly }) => {
  const { user, profile, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f2ed]">
        <BookOpen className="w-8 h-8 animate-pulse text-[#1a1a1a]" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" />;
  if (adminOnly && !isAdmin) return <Navigate to="/" />;

  return <>{children}</>;
};

import { Toaster } from 'sonner';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-[#f5f2ed] text-[#1a1a1a] font-serif">
          <Toaster position="top-center" richColors />
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/store" element={<Store />} />
              <Route path="/auth" element={<Auth />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/reader/:bookId" 
                element={
                  <ProtectedRoute>
                    <Reader />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/*" 
                element={
                  <ProtectedRoute adminOnly>
                    <Admin />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
          <footer className="border-t border-[#1a1a1a]/10 py-12 mt-20">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-2xl font-bold tracking-tighter mb-4">MB SERIES</h2>
              <p className="text-sm opacity-60 max-w-md mx-auto">
                Editora dedicada à literatura transformadora e frases que ecoam na alma.
              </p>
              <div className="mt-8 pt-8 border-t border-[#1a1a1a]/5 text-xs opacity-40">
                © 2026 MB SERIES. Todos os direitos reservados.
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
