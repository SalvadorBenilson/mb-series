import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase';
import { Book, User, LogOut, ShieldCheck, ShoppingBag } from 'lucide-react';
import { cn } from '../lib/utils';

const Navbar = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  return (
    <nav className="border-bottom border-[#1a1a1a]/10 sticky top-0 bg-[#f5f2ed]/80 backdrop-blur-md z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold tracking-tighter flex items-center gap-2">
          <Book className="w-6 h-6" />
          <span>MB SERIES</span>
        </Link>

        <div className="flex items-center gap-6 text-sm uppercase tracking-widest font-medium">
          <Link to="/store" className="hover:opacity-60 transition-opacity">Loja</Link>
          
          {user ? (
            <>
              <Link to="/dashboard" className="hover:opacity-60 transition-opacity flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                <span>Meus Livros</span>
              </Link>
              
              {isAdmin && (
                <Link to="/admin" className="hover:opacity-60 transition-opacity flex items-center gap-2 text-emerald-700">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin</span>
                </Link>
              )}

              <button 
                onClick={handleLogout}
                className="hover:opacity-60 transition-opacity flex items-center gap-2 text-red-700"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </button>
            </>
          ) : (
            <Link 
              to="/auth" 
              className="bg-[#1a1a1a] text-white px-6 py-2 rounded-full hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              <span>Entrar</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
