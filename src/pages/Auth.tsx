import React, { useState } from 'react';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { LogIn, UserPlus, Mail, Lock, Chrome } from 'lucide-react';
import { cn } from '../lib/utils';

import { toast } from 'sonner';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success('Login realizado com sucesso!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error("Google Sign In Error:", error);
      toast.error('Erro ao entrar com Google: ' + error.message);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('Bem-vindo de volta!');
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success('Conta criada com sucesso!');
      }
      navigate('/dashboard');
    } catch (error: any) {
      console.error("Email Auth Error:", error);
      toast.error('Erro na autenticação: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white w-full max-w-md rounded-[2.5rem] shadow-xl border border-[#1a1a1a]/5 overflow-hidden"
      >
        <div className="p-12 space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold tracking-tighter">{isLogin ? "Bem-vindo" : "Criar Conta"}</h1>
            <p className="opacity-40 text-sm uppercase tracking-widest font-bold">MB SERIES</p>
          </div>

          <button 
            onClick={handleGoogleSignIn}
            className="w-full border-2 border-[#1a1a1a]/10 py-4 rounded-full flex items-center justify-center gap-3 font-bold hover:bg-black/5 transition-colors"
          >
            <Chrome className="w-5 h-5" />
            <span>Continuar com Google</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#1a1a1a]/5"></div></div>
            <span className="relative bg-white px-4 text-[10px] uppercase tracking-widest font-bold opacity-20">Ou use seu email</span>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold opacity-40 ml-4">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-20" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#1a1a1a]/5 border-none rounded-full py-4 pl-12 pr-6 focus:ring-2 focus:ring-[#1a1a1a]/20 outline-none"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold opacity-40 ml-4">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-20" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#1a1a1a]/5 border-none rounded-full py-4 pl-12 pr-6 focus:ring-2 focus:ring-[#1a1a1a]/20 outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#1a1a1a] text-white py-4 rounded-full font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? "Processando..." : isLogin ? <><LogIn className="w-4 h-4" /> Entrar</> : <><UserPlus className="w-4 h-4" /> Criar Conta</>}
            </button>
          </form>

          <div className="text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm font-bold hover:underline opacity-60"
            >
              {isLogin ? "Não tem uma conta? Cadastre-se" : "Já tem uma conta? Entre aqui"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
