import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { Book, Quote } from '../types';
import { motion } from 'motion/react';
import { ArrowRight, Quote as QuoteIcon, Music, Film, User, Book as BookIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn, formatCurrency } from '../lib/utils';

import { toast } from 'sonner';

const Home = () => {
  const [featuredBook, setFeaturedBook] = useState<Book | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch featured book
        const booksQuery = query(collection(db, 'books'), where('isFeatured', '==', true), limit(1));
        const booksSnap = await getDocs(booksQuery);
        if (!booksSnap.empty) {
          setFeaturedBook({ id: booksSnap.docs[0].id, ...booksSnap.docs[0].data() } as Book);
        }

        // Fetch some quotes
        const quotesSnap = await getDocs(query(collection(db, 'quotes'), limit(6)));
        setQuotes(quotesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quote)));
      } catch (error: any) {
        console.error("Error fetching home data:", error);
        toast.error('Erro ao carregar dados da página inicial: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-24">
      {/* Hero Section - Featured Book */}
      <section className="relative min-h-[80vh] flex items-center">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-[0.3em] opacity-50 font-sans font-bold">Lançamento Principal</span>
              <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9]">
                {featuredBook?.title || "O Menino que Virou Porto Seguro"}
              </h1>
            </div>
            <p className="text-xl opacity-70 leading-relaxed max-w-lg">
              {featuredBook?.description || "Uma jornada emocionante sobre autodescoberta, resiliência e a busca por um lugar onde a alma possa finalmente descansar."}
            </p>
            <div className="flex items-center gap-6">
              <Link 
                to={featuredBook ? `/store?book=${featuredBook.id}` : "/store"}
                className="bg-[#1a1a1a] text-white px-10 py-4 rounded-full text-lg font-medium hover:scale-105 transition-transform flex items-center gap-3"
              >
                Adquirir Agora <ArrowRight className="w-5 h-5" />
              </Link>
              <div className="text-2xl font-light italic opacity-80">
                {featuredBook ? formatCurrency(featuredBook.price) : "AOA 5.000,00"}
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative aspect-[3/4] max-w-md mx-auto"
          >
            <div className="absolute inset-0 bg-[#1a1a1a]/5 rounded-2xl -rotate-6 translate-x-4 translate-y-4" />
            <img 
              src={featuredBook?.coverUrl || "https://picsum.photos/seed/book/800/1200"} 
              alt="Capa do Livro"
              className="relative w-full h-full object-cover rounded-2xl shadow-2xl"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </div>
      </section>

      {/* Quotes Section */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-bold tracking-tight">Ecos de Inspiração</h2>
          <p className="opacity-60 max-w-2xl mx-auto">Frases que marcaram épocas, músicas que tocam o coração e diálogos que definiram gerações.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {quotes.length > 0 ? quotes.map((quote, index) => (
            <motion.div 
              key={quote.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="p-8 bg-white rounded-3xl shadow-sm border border-[#1a1a1a]/5 flex flex-col justify-between group hover:shadow-md transition-shadow"
            >
              <div className="space-y-4">
                <QuoteIcon className="w-8 h-8 opacity-10 group-hover:opacity-20 transition-opacity" />
                <p className="text-xl italic font-medium leading-relaxed">"{quote.text}"</p>
              </div>
              <div className="mt-8 pt-6 border-t border-[#1a1a1a]/5 flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm">{quote.author}</p>
                  <p className="text-xs opacity-40 uppercase tracking-wider">{quote.source}</p>
                </div>
                <div className="opacity-20">
                  {quote.type === 'music' && <Music className="w-4 h-4" />}
                  {quote.type === 'movie' && <Film className="w-4 h-4" />}
                  {quote.type === 'author' && <User className="w-4 h-4" />}
                </div>
              </div>
            </motion.div>
          )) : (
            // Placeholder quotes if none in DB
            [1, 2, 3].map((i) => (
              <div key={i} className="p-8 bg-white/50 rounded-3xl border border-dashed border-[#1a1a1a]/10 animate-pulse h-64" />
            ))
          )}
        </div>
      </section>

      {/* About Section */}
      <section className="bg-[#1a1a1a] text-white rounded-[3rem] p-12 md:p-24 overflow-hidden relative">
        <div className="max-w-3xl space-y-8 relative z-10">
          <h2 className="text-5xl md:text-7xl font-bold tracking-tighter">Nossa Missão</h2>
          <p className="text-xl md:text-2xl opacity-80 leading-relaxed font-light">
            Na <span className="font-bold">MB SERIES</span>, acreditamos que as palavras têm o poder de curar, inspirar e transformar. Somos mais que uma editora; somos um porto seguro para mentes inquietas e corações sonhadores.
          </p>
          <div className="flex gap-4">
            <div className="w-12 h-1 bg-white/20" />
            <div className="w-24 h-1 bg-white" />
          </div>
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
          <BookIcon className="w-full h-full -rotate-12 translate-x-1/4 translate-y-1/4" />
        </div>
      </section>
    </div>
  );
};

export default Home;
