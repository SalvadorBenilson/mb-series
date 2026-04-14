import React, { useEffect, useState } from 'react';
import { collection, query, getDocs, doc, updateDoc, addDoc, deleteDoc, orderBy, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Order, UserProfile, Book, Quote } from '../types';
import { motion } from 'motion/react';
import { Check, X, Users, ShoppingCart, BookPlus, MessageSquare, Database, Trash2, Star } from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';

import { toast } from 'sonner';

const Admin = () => {
  const [activeTab, setActiveTab] = useState<'orders' | 'users' | 'books' | 'quotes' | 'system'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const ordersSnap = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')));
      setOrders(ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));

      const usersSnap = await getDocs(collection(db, 'users'));
      setUsers(usersSnap.docs.map(doc => ({ ...doc.data() } as UserProfile)));

      const booksSnap = await getDocs(collection(db, 'books'));
      setBooks(booksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Book)));

      const quotesSnap = await getDocs(collection(db, 'quotes'));
      setQuotes(quotesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quote)));
    } catch (error: any) {
      console.error("Error fetching admin data:", error);
      toast.error('Erro ao carregar dados: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApproveOrder = async (order: Order) => {
    try {
      await updateDoc(doc(db, 'orders', order.id), {
        status: 'approved',
        updatedAt: new Date().toISOString()
      });
      
      // Create notification for user
      await addDoc(collection(db, 'notifications'), {
        userId: order.userId,
        message: `Seu pedido do livro "${order.bookTitle}" foi aprovado! Você já pode lê-lo em sua biblioteca.`,
        read: false,
        createdAt: new Date().toISOString()
      });

      toast.success('Pedido aprovado com sucesso!');
      fetchData();
    } catch (error: any) {
      console.error("Error approving order:", error);
      toast.error('Erro ao aprovar pedido: ' + error.message);
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: 'rejected',
        updatedAt: new Date().toISOString()
      });
      toast.success('Pedido rejeitado.');
      fetchData();
    } catch (error: any) {
      console.error("Error rejecting order:", error);
      toast.error('Erro ao rejeitar pedido: ' + error.message);
    }
  };

  const seedInitialData = async () => {
    try {
      // Seed Main Book
      const mainBook = {
        title: "O Menino que Virou Porto Seguro",
        author: "MB SERIES",
        description: "Uma jornada emocionante sobre autodescoberta, resiliência e a busca por um lugar onde a alma possa finalmente descansar. Este livro explora as profundezas do sentimento humano e a capacidade de se tornar o abrigo que sempre procuramos nos outros.",
        price: 5000,
        coverUrl: "https://picsum.photos/seed/portoseguro/800/1200",
        isFeatured: true,
        content: [
          "Capítulo 1: O Início da Jornada\n\nEra uma vez um menino que carregava o mundo nos ombros, sem saber que o peso que sentia não era dele, mas das expectativas que os outros depositavam em seu silêncio...",
          "Capítulo 2: O Encontro com o Mar\n\nAo chegar à beira do abismo, ele percebeu que o horizonte não era o fim, mas um convite para mergulhar em si mesmo...",
          "Capítulo 3: Tornando-se Abrigo\n\nA tempestade veio, e pela primeira vez, ele não correu para se esconder. Ele abriu os braços e percebeu que ele era o porto, ele era a segurança."
        ]
      };
      await addDoc(collection(db, 'books'), mainBook);

      // Seed some quotes
      const initialQuotes = [
        { text: "A música é o barulho que pensa.", author: "Victor Hugo", source: "Literatura", type: "author" },
        { text: "O essencial é invisível aos olhos.", author: "Antoine de Saint-Exupéry", source: "O Pequeno Príncipe", type: "author" },
        { text: "Sem a música, a vida seria um erro.", author: "Friedrich Nietzsche", source: "Filosofia", type: "author" },
        { text: "Que a força esteja com você.", author: "Yoda", source: "Star Wars", type: "movie" },
        { text: "Imagine all the people living life in peace.", author: "John Lennon", source: "Imagine", type: "music" }
      ];
      for (const q of initialQuotes) {
        await addDoc(collection(db, 'quotes'), q);
      }

      toast.success("Dados iniciais semeados com sucesso!");
      fetchData();
    } catch (error: any) {
      console.error("Error seeding data:", error);
      toast.error("Erro ao semear dados: " + error.message);
    }
  };

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-bold tracking-tighter">Painel Admin</h1>
          <p className="opacity-60">Gerencie pedidos, usuários e conteúdo da plataforma.</p>
        </div>
        <div className="flex bg-white p-1 rounded-full shadow-sm border border-[#1a1a1a]/5">
          {[
            { id: 'orders', icon: ShoppingCart, label: 'Pedidos' },
            { id: 'users', icon: Users, label: 'Usuários' },
            { id: 'books', icon: BookPlus, label: 'Livros' },
            { id: 'quotes', icon: MessageSquare, label: 'Frases' },
            { id: 'system', icon: Database, label: 'Sistema' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all",
                activeTab === tab.id ? "bg-[#1a1a1a] text-white" : "hover:bg-black/5"
              )}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden lg:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </header>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-[#1a1a1a]/5 overflow-hidden">
        {activeTab === 'orders' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#1a1a1a]/5 text-[10px] uppercase tracking-[0.2em] font-bold">
                  <th className="px-8 py-4">Usuário</th>
                  <th className="px-8 py-4">Livro</th>
                  <th className="px-8 py-4">Método</th>
                  <th className="px-8 py-4">Valor</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1a1a]/5">
                {orders.map((order) => (
                  <tr key={order.id} className="text-sm hover:bg-[#1a1a1a]/[0.02] transition-colors">
                    <td className="px-8 py-6">
                      <div className="font-bold">{users.find(u => u.uid === order.userId)?.displayName || 'Usuário'}</div>
                      <div className="text-xs opacity-40">{users.find(u => u.uid === order.userId)?.email}</div>
                    </td>
                    <td className="px-8 py-6 font-medium">{order.bookTitle}</td>
                    <td className="px-8 py-6 uppercase tracking-tighter">{order.paymentMethod}</td>
                    <td className="px-8 py-6 font-mono">{formatCurrency(order.amount)}</td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        order.status === 'approved' && "bg-emerald-100 text-emerald-700",
                        order.status === 'pending' && "bg-amber-100 text-amber-700",
                        order.status === 'rejected' && "bg-red-100 text-red-700"
                      )}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      {order.status === 'pending' && (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleApproveOrder(order)}
                            className="p-2 bg-emerald-100 text-emerald-600 rounded-full hover:bg-emerald-600 hover:text-white transition-all"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleRejectOrder(order.id)}
                            className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-600 hover:text-white transition-all"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#1a1a1a]/5 text-[10px] uppercase tracking-[0.2em] font-bold">
                  <th className="px-8 py-4">Nome</th>
                  <th className="px-8 py-4">Email</th>
                  <th className="px-8 py-4">Cargo</th>
                  <th className="px-8 py-4">Criado em</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1a1a]/5">
                {users.map((user) => (
                  <tr key={user.uid} className="text-sm">
                    <td className="px-8 py-6 font-bold">{user.displayName}</td>
                    <td className="px-8 py-6 opacity-60">{user.email}</td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        user.role === 'admin' ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                      )}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-8 py-6 opacity-40">{new Date(user.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="p-12 space-y-8 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <Database className="w-16 h-16 mx-auto opacity-20" />
              <h3 className="text-2xl font-bold">Configurações do Sistema</h3>
              <p className="opacity-60">Utilize as ferramentas abaixo para inicializar ou resetar dados da plataforma.</p>
              <button 
                onClick={seedInitialData}
                className="bg-[#1a1a1a] text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 mx-auto hover:scale-105 transition-transform"
              >
                <Star className="w-4 h-4 fill-current" />
                Semear Dados Iniciais
              </button>
            </div>
          </div>
        )}

        {/* Other tabs can be implemented similarly */}
        {(activeTab === 'books' || activeTab === 'quotes') && (
          <div className="p-20 text-center opacity-40 italic">Funcionalidade de edição em desenvolvimento.</div>
        )}
      </div>
    </div>
  );
};

export default Admin;
