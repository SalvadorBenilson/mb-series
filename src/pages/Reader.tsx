import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Book, ReadingProgress } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, X, Settings, Maximize, Minimize, Bookmark } from 'lucide-react';
import { cn } from '../lib/utils';

import { toast } from 'sonner';

const Reader = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [book, setBook] = useState<Book | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState(18);
  const [theme, setTheme] = useState<'light' | 'dark' | 'sepia'>('light');
  const [isSaving, setIsSaving] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!bookId || !user) return;

    const fetchBookAndProgress = async () => {
      try {
        const bookSnap = await getDoc(doc(db, 'books', bookId));
        if (bookSnap.exists()) {
          const bookData = { id: bookSnap.id, ...bookSnap.data() } as Book;
          setBook(bookData);

          // Fetch progress
          const progressQuery = query(
            collection(db, 'readingProgress'),
            where('userId', '==', user.uid),
            where('bookId', '==', bookId)
          );
          const progressSnap = await getDocs(progressQuery);
          if (!progressSnap.empty) {
            setCurrentPage((progressSnap.docs[0].data() as ReadingProgress).lastPageIndex);
          }
        } else {
          toast.error('Livro não encontrado.');
          navigate('/dashboard');
        }
      } catch (error: any) {
        console.error("Error fetching reader data:", error);
        toast.error('Erro ao carregar livro: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookAndProgress();
  }, [bookId, user, navigate]);

  const saveProgress = async (pageIndex: number) => {
    if (!user || !bookId) return;
    setIsSaving(true);
    try {
      const progressQuery = query(
        collection(db, 'readingProgress'),
        where('userId', '==', user.uid),
        where('bookId', '==', bookId)
      );
      const progressSnap = await getDocs(progressQuery);
      
      if (!progressSnap.empty) {
        await updateDoc(doc(db, 'readingProgress', progressSnap.docs[0].id), {
          lastPageIndex: pageIndex,
          updatedAt: new Date().toISOString()
        });
      } else {
        await setDoc(doc(collection(db, 'readingProgress')), {
          userId: user.uid,
          bookId,
          lastPageIndex: pageIndex,
          updatedAt: new Date().toISOString()
        });
      }
    } catch (error: any) {
      console.error("Error saving progress:", error);
      toast.error('Erro ao salvar progresso: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePageChange = (newIndex: number) => {
    if (!book || newIndex < 0 || newIndex >= book.content.length) return;
    setCurrentPage(newIndex);
    saveProgress(newIndex);
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-[#1a1a1a] border-t-transparent rounded-full animate-spin" /></div>;
  if (!book) return null;

  const themes = {
    light: "bg-[#f5f2ed] text-[#1a1a1a]",
    dark: "bg-[#1a1a1a] text-[#f5f2ed]",
    sepia: "bg-[#f4ecd8] text-[#5b4636]"
  };

  return (
    <div className={cn("fixed inset-0 z-[200] flex flex-col transition-colors duration-500", themes[theme])}>
      {/* Reader Header */}
      <header className="h-16 px-6 flex items-center justify-between border-b border-current/10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-current/5 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
          <div className="hidden md:block">
            <h1 className="font-bold text-sm tracking-tight">{book.title}</h1>
            <p className="text-[10px] uppercase tracking-widest opacity-60">{book.author}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-6">
          <div className="flex items-center gap-2 bg-current/5 px-3 py-1.5 rounded-full">
            <button onClick={() => setFontSize(s => Math.max(12, s - 2))} className="p-1 hover:bg-current/10 rounded">A-</button>
            <span className="text-xs font-bold w-8 text-center">{fontSize}</span>
            <button onClick={() => setFontSize(s => Math.min(32, s + 2))} className="p-1 hover:bg-current/10 rounded">A+</button>
          </div>

          <div className="flex items-center gap-1">
            {(['light', 'dark', 'sepia'] as const).map((t) => (
              <button 
                key={t}
                onClick={() => setTheme(t)}
                className={cn(
                  "w-6 h-6 rounded-full border border-current/20",
                  t === 'light' && "bg-[#f5f2ed]",
                  t === 'dark' && "bg-[#1a1a1a]",
                  t === 'sepia' && "bg-[#f4ecd8]",
                  theme === t && "ring-2 ring-offset-2 ring-current"
                )}
              />
            ))}
          </div>

          {isSaving && <Bookmark className="w-4 h-4 animate-bounce opacity-40" />}
        </div>
      </header>

      {/* Content Area */}
      <main 
        ref={containerRef}
        className="flex-1 overflow-y-auto py-12 px-6 md:px-0"
      >
        <div className="max-w-2xl mx-auto space-y-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              style={{ fontSize: `${fontSize}px` }}
              className="leading-relaxed whitespace-pre-wrap font-serif"
            >
              {book.content[currentPage]}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Reader Footer / Controls */}
      <footer className="h-20 px-6 flex items-center justify-between border-t border-current/10">
        <button 
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="flex items-center gap-2 px-6 py-2 rounded-full hover:bg-current/5 disabled:opacity-20 transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="hidden md:inline font-bold uppercase tracking-widest text-xs">Anterior</span>
        </button>

        <div className="flex flex-col items-center gap-1">
          <div className="w-48 h-1 bg-current/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-current transition-all duration-500" 
              style={{ width: `${((currentPage + 1) / book.content.length) * 100}%` }}
            />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">
            Página {currentPage + 1} de {book.content.length}
          </span>
        </div>

        <button 
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === book.content.length - 1}
          className="flex items-center gap-2 px-6 py-2 rounded-full hover:bg-current/5 disabled:opacity-20 transition-all"
        >
          <span className="hidden md:inline font-bold uppercase tracking-widest text-xs">Próxima</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </footer>
    </div>
  );
};

export default Reader;
