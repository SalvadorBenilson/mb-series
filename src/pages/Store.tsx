import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Book, Order } from '../types';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Check, X, CreditCard, Landmark, Phone, Zap } from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

import { toast } from 'sonner';

const Store = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<Order['paymentMethod']>('KWIK');
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const snap = await getDocs(collection(db, 'books'));
        setBooks(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Book)));
      } catch (error: any) {
        console.error("Error fetching books:", error);
        toast.error('Erro ao carregar catálogo: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  const handleOrder = async () => {
    if (!user) {
      toast.error('Você precisa estar logado para comprar.');
      navigate('/auth');
      return;
    }
    if (!selectedBook) return;

    setIsOrdering(true);
    try {
      await addDoc(collection(db, 'orders'), {
        userId: user.uid,
        bookId: selectedBook.id,
        bookTitle: selectedBook.title,
        status: 'pending',
        paymentMethod,
        amount: selectedBook.price,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setOrderSuccess(true);
      toast.success('Pedido enviado para aprovação!');
      setTimeout(() => {
        setOrderSuccess(false);
        setSelectedBook(null);
        navigate('/dashboard');
      }, 3000);
    } catch (error: any) {
      console.error("Error creating order:", error);
      toast.error("Erro ao processar pedido: " + error.message);
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-bold tracking-tighter">Catálogo</h1>
          <p className="opacity-60">Explore nossa coleção de obras exclusivas.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {books.map((book) => (
          <motion.div 
            key={book.id}
            layoutId={book.id}
            className="bg-white rounded-3xl overflow-hidden shadow-sm border border-[#1a1a1a]/5 group cursor-pointer"
            onClick={() => setSelectedBook(book)}
          >
            <div className="aspect-[3/4] overflow-hidden relative">
              <img 
                src={book.coverUrl} 
                alt={book.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="bg-white text-black px-6 py-2 rounded-full font-bold text-sm">Ver Detalhes</span>
              </div>
            </div>
            <div className="p-6 space-y-2">
              <h3 className="text-xl font-bold leading-tight">{book.title}</h3>
              <p className="text-sm opacity-50">{book.author}</p>
              <div className="pt-4 flex items-center justify-between">
                <span className="text-lg font-bold">{formatCurrency(book.price)}</span>
                <ShoppingCart className="w-5 h-5 opacity-20 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Order Modal */}
      <AnimatePresence>
        {selectedBook && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBook(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-[#f5f2ed] w-full max-w-2xl rounded-[2rem] overflow-hidden shadow-2xl flex flex-col md:flex-row"
            >
              <div className="md:w-2/5 bg-[#1a1a1a] p-8 flex flex-col justify-between text-white">
                <div className="space-y-4">
                  <img src={selectedBook.coverUrl} alt={selectedBook.title} className="w-full aspect-[3/4] object-cover rounded-xl shadow-lg" referrerPolicy="no-referrer" />
                  <h2 className="text-2xl font-bold leading-tight">{selectedBook.title}</h2>
                  <p className="text-sm opacity-60">{selectedBook.author}</p>
                </div>
                <div className="text-3xl font-bold mt-8">{formatCurrency(selectedBook.price)}</div>
              </div>

              <div className="md:w-3/5 p-8 space-y-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold uppercase tracking-widest text-xs opacity-40">Pagamento</h3>
                  <button onClick={() => setSelectedBook(null)} className="p-2 hover:bg-black/5 rounded-full"><X className="w-5 h-5" /></button>
                </div>

                {orderSuccess ? (
                  <div className="h-full flex flex-col items-center justify-center space-y-4 text-center py-12">
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                      <Check className="w-10 h-10" />
                    </div>
                    <h4 className="text-2xl font-bold">Pedido Realizado!</h4>
                    <p className="opacity-60">Seu pedido está aguardando aprovação do administrador. Você será notificado em breve.</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { id: 'KWIK', icon: Zap, label: 'KWIK' },
                        { id: 'IBAN', icon: Landmark, label: 'IBAN' },
                        { id: 'Reference', icon: CreditCard, label: 'Referência' },
                        { id: 'Express', icon: Phone, label: 'Express' }
                      ].map((method) => (
                        <button
                          key={method.id}
                          onClick={() => setPaymentMethod(method.id as Order['paymentMethod'])}
                          className={cn(
                            "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                            paymentMethod === method.id 
                              ? "border-[#1a1a1a] bg-[#1a1a1a] text-white" 
                              : "border-[#1a1a1a]/10 hover:border-[#1a1a1a]/30"
                          )}
                        >
                          <method.icon className="w-6 h-6" />
                          <span className="text-xs font-bold uppercase tracking-tighter">{method.label}</span>
                        </button>
                      ))}
                    </div>

                    <div className="bg-white/50 p-6 rounded-2xl border border-[#1a1a1a]/5 space-y-4">
                      <p className="text-xs opacity-60 leading-relaxed">
                        Após clicar em confirmar, você deverá realizar o pagamento através do método selecionado e aguardar a validação do administrador.
                      </p>
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold opacity-40">Dados para Pagamento</p>
                        <p className="text-sm font-mono">IBAN: AO06 0000 0000 0000 0000 0</p>
                        <p className="text-sm font-mono">NIF: 123456789</p>
                      </div>
                    </div>

                    <button
                      onClick={handleOrder}
                      disabled={isOrdering}
                      className="w-full bg-[#1a1a1a] text-white py-4 rounded-full font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {isOrdering ? "Processando..." : "Confirmar Pedido"}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Store;
