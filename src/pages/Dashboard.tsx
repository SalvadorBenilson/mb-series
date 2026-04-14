import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Book, Order, ReadingProgress } from '../types';
import { motion } from 'motion/react';
import { BookOpen, Clock, CheckCircle2, AlertCircle, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency, cn } from '../lib/utils';

import { toast } from 'sonner';

const Dashboard = () => {
  const { user } = useAuth();
  const [myBooks, setMyBooks] = useState<(Book & { progress?: ReadingProgress })[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        // Fetch approved orders to get books
        const ordersQuery = query(collection(db, 'orders'), where('userId', '==', user.uid));
        const ordersSnap = await getDocs(ordersQuery);
        const ordersData = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        setOrders(ordersData);

        const approvedBookIds = ordersData
          .filter(o => o.status === 'approved')
          .map(o => o.bookId);

        if (approvedBookIds.length > 0) {
          const booksData: (Book & { progress?: ReadingProgress })[] = [];
          for (const bookId of approvedBookIds) {
            const bookDoc = await getDoc(doc(db, 'books', bookId));
            if (bookDoc.exists()) {
              const book = { id: bookDoc.id, ...bookDoc.data() } as Book;
              
              // Fetch progress
              const progressQuery = query(
                collection(db, 'readingProgress'), 
                where('userId', '==', user.uid),
                where('bookId', '==', bookId)
              );
              const progressSnap = await getDocs(progressQuery);
              if (!progressSnap.empty) {
                booksData.push({ ...book, progress: { id: progressSnap.docs[0].id, ...progressSnap.docs[0].data() } as ReadingProgress });
              } else {
                booksData.push(book);
              }
            }
          }
          setMyBooks(booksData);
        }
      } catch (error: any) {
        console.error("Error fetching dashboard data:", error);
        toast.error('Erro ao carregar biblioteca: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) return <div className="animate-pulse space-y-8"><div className="h-12 bg-black/5 w-48 rounded-lg" /><div className="grid grid-cols-4 gap-4"><div className="h-64 bg-black/5 rounded-2xl" /></div></div>;

  return (
    <div className="space-y-16">
      <header className="space-y-2">
        <h1 className="text-5xl font-bold tracking-tighter">Minha Biblioteca</h1>
        <p className="opacity-60">Bem-vindo de volta. Continue sua jornada literária.</p>
      </header>

      {/* My Books */}
      <section className="space-y-8">
        <div className="flex items-center gap-4">
          <BookOpen className="w-6 h-6" />
          <h2 className="text-2xl font-bold">Livros Adquiridos</h2>
        </div>

        {myBooks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {myBooks.map((book) => (
              <motion.div 
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-[#1a1a1a]/5 flex flex-col"
              >
                <div className="aspect-[3/4] relative group">
                  <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Link 
                      to={`/reader/${book.id}`}
                      className="bg-white text-black px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      {book.progress ? "Continuar Lendo" : "Começar Leitura"}
                    </Link>
                  </div>
                  {book.progress && (
                    <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-xl flex items-center gap-3">
                      <div className="flex-1 h-1 bg-black/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-black" 
                          style={{ width: `${((book.progress.lastPageIndex + 1) / book.content.length) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-tighter">
                        {Math.round(((book.progress.lastPageIndex + 1) / book.content.length) * 100)}%
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-6 space-y-1">
                  <h3 className="font-bold text-lg leading-tight">{book.title}</h3>
                  <p className="text-xs opacity-40 uppercase tracking-widest">{book.author}</p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white/50 border-2 border-dashed border-[#1a1a1a]/10 rounded-[2rem] p-20 text-center space-y-4">
            <p className="opacity-40 font-medium">Você ainda não possui livros em sua biblioteca.</p>
            <Link to="/store" className="inline-block bg-[#1a1a1a] text-white px-8 py-3 rounded-full font-bold">Visitar Loja</Link>
          </div>
        )}
      </section>

      {/* Orders History */}
      <section className="space-y-8">
        <div className="flex items-center gap-4">
          <Clock className="w-6 h-6" />
          <h2 className="text-2xl font-bold">Histórico de Pedidos</h2>
        </div>

        <div className="bg-white rounded-[2rem] overflow-hidden border border-[#1a1a1a]/5">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#1a1a1a]/5 text-[10px] uppercase tracking-[0.2em] font-bold">
                <th className="px-8 py-4">Livro</th>
                <th className="px-8 py-4">Data</th>
                <th className="px-8 py-4">Método</th>
                <th className="px-8 py-4">Valor</th>
                <th className="px-8 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1a1a]/5">
              {orders.map((order) => (
                <tr key={order.id} className="text-sm hover:bg-[#1a1a1a]/[0.02] transition-colors">
                  <td className="px-8 py-6 font-bold">{order.bookTitle}</td>
                  <td className="px-8 py-6 opacity-60">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-8 py-6 uppercase tracking-tighter font-medium">{order.paymentMethod}</td>
                  <td className="px-8 py-6 font-mono">{formatCurrency(order.amount)}</td>
                  <td className="px-8 py-6">
                    <div className={cn(
                      "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      order.status === 'approved' && "bg-emerald-100 text-emerald-700",
                      order.status === 'pending' && "bg-amber-100 text-amber-700",
                      order.status === 'rejected' && "bg-red-100 text-red-700"
                    )}>
                      {order.status === 'approved' && <CheckCircle2 className="w-3 h-3" />}
                      {order.status === 'pending' && <Clock className="w-3 h-3" />}
                      {order.status === 'rejected' && <AlertCircle className="w-3 h-3" />}
                      {order.status === 'approved' ? 'Aprovado' : order.status === 'pending' ? 'Pendente' : 'Rejeitado'}
                    </div>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center opacity-40 italic">Nenhum pedido encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
