/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calculator, 
  BookOpen, 
  LogOut, 
  ArrowRight, 
  Github, 
  ExternalLink, 
  Award, 
  TrendingUp,
  Brain,
  Search,
  Menu,
  X,
  Heart,
  Grid,
  Filter,
  ShieldAlert,
  User,
  Maximize2
} from 'lucide-react';
import { GAMES, Game, CATEGORIES } from './constants';
import AuthPage from './components/AuthPage';
import AdminPortal from './components/AdminPortal';
import Leaderboard from './components/Leaderboard';
import { AuthProvider, useAuth } from './context/AuthContext';

function AppContent() {
  const [view, setView] = useState<'home' | 'game'>('home');
  const [activeGame, setActiveGame] = useState<Game | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const gameContainerRef = React.useRef<HTMLDivElement>(null);
  
  const { user, logout, toggleFavorite, recordPlay } = useAuth();

  const userFavorites = useMemo(() => user?.favorites || [], [user]);
  
  const filteredGames = useMemo(() => {
    if (!user) return [];
    return GAMES.filter(game => {
      const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           game.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchesCategory = false;
      if (selectedCategory === 'All') {
        matchesCategory = true;
      } else if (selectedCategory === 'Favorites') {
        matchesCategory = userFavorites.includes(game.id);
      } else {
        matchesCategory = game.category === selectedCategory;
      }
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, userFavorites, user]);

  const handleToggleFavorite = (e: React.MouseEvent, gameId: string) => {
    e.stopPropagation();
    toggleFavorite(gameId);
  };

  const handleStartGame = (game: Game) => {
    setActiveGame(game);
    setView('game');
    recordPlay();
    window.scrollTo(0, 0);
  };

  const handlePanic = () => {
    window.location.href = 'https://senecalearning.com';
  };

  const toggleFullscreen = () => {
    const elem = gameContainerRef.current;
    if (!elem) return;
    
    if (!isFullscreen) {
      // Try native but don't rely on it entirely
      try {
        if (typeof elem.requestFullscreen === 'function') {
          elem.requestFullscreen().catch(() => {});
        } else if (typeof (elem as any).webkitRequestFullscreen === 'function') {
          (elem as any).webkitRequestFullscreen();
        }
      } catch (e) {
        console.warn("Native fullscreen not available, using full-window mode");
      }
      setIsFullscreen(true);
    } else {
      try {
        if (document.fullscreenElement) {
          if (typeof document.exitFullscreen === 'function') {
            document.exitFullscreen().catch(() => {});
          } else if (typeof (document as any).webkitExitFullscreen === 'function') {
            (document as any).webkitExitFullscreen();
          }
        }
      } catch (e) {
        console.warn("Native exit failed");
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      // Only set to false if we actually exited native fullscreen
      if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
        // We don't automatically set isFullscreen to false here 
        // to allow the CSS "Full Window" mode to persist if native failed
      }
    };
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        toggleFullscreen();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen]);

  const renderGame = () => {
    if (!activeGame) return null;

    if (activeGame.url) {
      return (
        <div 
          ref={gameContainerRef}
          className={`
            transition-all duration-300 ease-in-out
            ${isFullscreen 
              ? 'fixed inset-0 z-[9999] bg-slate-950 flex flex-col' 
              : 'w-full aspect-video bg-slate-900 rounded-3xl overflow-hidden shadow-2xl relative'}
          `}
        >
          {isFullscreen && (
            <div className="bg-slate-900/80 backdrop-blur-md border-b border-white/10 px-6 py-3 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <activeGame.icon className="w-5 h-5 text-blue-400" />
                <span className="text-white font-bold text-sm uppercase tracking-wider">{activeGame.name}</span>
              </div>
              <button 
                onClick={toggleFullscreen}
                className="p-2 text-white/60 hover:text-white transition-colors"
                title="Exit Fullscreen"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
          
          <iframe 
            src={activeGame.url} 
            className={`${isFullscreen ? 'flex-1' : 'absolute inset-0'} w-full h-full border-none`}
            allow="autoplay; fullscreen; keyboard; gamepad"
            title={activeGame.name}
            referrerPolicy="no-referrer"
          />
          
          <div className={`absolute bottom-6 right-6 z-30 flex gap-2 ${isFullscreen ? 'opacity-0 hover:opacity-100 transition-opacity duration-300' : ''}`}>
            <a
              href={activeGame.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-white/10 backdrop-blur-md text-white rounded-xl hover:bg-white/20 transition-all active:scale-95 border border-white/20 shadow-xl flex items-center gap-2"
              title="Open in New Tab"
            >
              <ExternalLink className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">Open in Hub</span>
            </a>
            <button
              onClick={toggleFullscreen}
              className="p-3 bg-white/10 backdrop-blur-md text-white rounded-xl hover:bg-white/20 transition-all active:scale-95 border border-white/20 shadow-xl"
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="py-20 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-6 h-6 text-slate-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-1">Module Offline</h3>
        <p className="text-slate-500 font-medium">This module is currently unavailable.</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      <AnimatePresence>
        {isAdminOpen && (
          <AdminPortal onClose={() => setIsAdminOpen(false)} />
        )}
      </AnimatePresence>

      {!user ? (
        <div className="relative">
          <button 
            onClick={() => setIsAdminOpen(true)}
            className="fixed bottom-6 right-6 z-[60] p-4 bg-slate-900 text-white rounded-full shadow-2xl hover:scale-110 transition-all active:scale-95"
            title="System Management"
          >
            <ShieldAlert className="w-6 h-6" />
          </button>
          <AuthPage />
        </div>
      ) : (
        <>
          {/* Navigation */}
          <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setView('home')}
            >
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-200">
                <Calculator className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900 uppercase italic">
                Maths<span className="text-blue-600">Revision</span>
              </span>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsAdminOpen(true)}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
              >
                <ShieldAlert className="w-4 h-4" />
                Admin
              </button>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl">
                <User className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">{user.username}</span>
              </div>
              <button 
                onClick={logout}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
              <button 
                onClick={handlePanic}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-full text-xs font-black uppercase tracking-tighter hover:bg-red-700 transition-all active:scale-95 shadow-lg shadow-red-200"
              >
                <ShieldAlert className="w-4 h-4" />
                Panic
              </button>
              <button 
                className="md:hidden p-2 text-slate-600"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnimatePresence mode="wait">
          {view === 'home' ? (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {/* Search and Filters */}
              <div className="flex flex-col gap-8 mb-12">
                <div className="relative max-w-2xl mx-auto w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search studies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-3xl shadow-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-400 font-medium"
                  />
                </div>

                <div className="flex flex-wrap justify-center gap-2">
                  <button
                    onClick={() => setSelectedCategory('All')}
                    className={`px-6 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all ${selectedCategory === 'All' ? 'bg-slate-900 text-white shadow-xl translate-y-[-2px]' : 'bg-white text-slate-500 border border-slate-100'}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setSelectedCategory('Favorites')}
                    className={`px-6 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${selectedCategory === 'Favorites' ? 'bg-pink-600 text-white shadow-xl translate-y-[-2px]' : 'bg-white text-slate-500 border border-slate-100'}`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${userFavorites.length > 0 ? 'fill-current' : ''}`} />
                    Favorites
                  </button>
                  <button
                    onClick={() => setIsAdminOpen(true)}
                    className="px-6 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-widest bg-slate-900 text-white shadow-xl hover:bg-slate-800 transition-all flex items-center gap-2"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Admin Portal
                  </button>
                  {CATEGORIES.filter(c => c !== 'All').map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-6 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all ${selectedCategory === cat ? 'bg-blue-600 text-white shadow-xl translate-y-[-2px]' : 'bg-white text-slate-500 border border-slate-100'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Modules and Leaderboard Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                  {filteredGames.length > 0 ? (
                    filteredGames.map((game, index) => (
                      <motion.div
                        key={game.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2, delay: Math.min(index * 0.05, 0.3) }}
                        whileHover={{ y: -8 }}
                        onClick={() => handleStartGame(game)}
                        className="group bg-white p-8 rounded-3xl shadow-sm border border-slate-100 cursor-pointer overflow-hidden relative"
                      >
                        <button 
                          onClick={(e) => handleToggleFavorite(e, game.id)}
                          className={`absolute top-6 right-6 z-20 p-2 rounded-xl transition-all shadow-sm ${userFavorites.includes(game.id) ? 'bg-pink-50 text-pink-500' : 'bg-slate-50 text-slate-300'}`}
                        >
                          <Heart className={`w-5 h-5 ${userFavorites.includes(game.id) ? 'fill-current' : ''}`} />
                        </button>
                        
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                          <game.icon className="w-24 h-24" />
                        </div>
                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-50 transition-colors">
                          <game.icon className="w-7 h-7 text-slate-400 group-hover:text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">{game.name}</h3>
                        <p className="text-sm text-slate-500 font-medium mb-6 line-clamp-2">
                          {game.description}
                        </p>
                        <div className="flex flex-col gap-3">
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-slate-200 w-1/3 group-hover:bg-blue-200 transition-colors duration-500" />
                          </div>
                          <button className="mt-2 text-sm font-bold text-blue-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all">
                            Play Now <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-full py-20 text-center">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-6 h-6 text-slate-400" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-1">No studies found</h3>
                      <p className="text-slate-500 font-medium">Try adjusting your search or category filters.</p>
                    </div>
                  )}
                </div>

                <div className="lg:col-span-4 sticky top-24">
                  <Leaderboard />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="game"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-4xl mx-auto"
            >
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    {activeGame && <activeGame.icon className="w-6 h-6 text-blue-600" />}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900">{activeGame?.name}</h2>
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                      <span>{activeGame?.category}</span>
                      <span>•</span>
                      <span>{activeGame?.mathTopic}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setView('home')}
                  className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
                >
                  <LogOut className="w-4 h-4" /> Exit
                </button>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100">
                {renderGame()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Calculator className="w-6 h-6 text-blue-600" />
            <span className="font-bold text-lg tracking-tight uppercase italic">Maths<span className="text-blue-600">Revision</span></span>
          </div>
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsAdminOpen(true)}
              className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em] hover:text-slate-500 transition-colors"
            >
              System Management
            </button>
            <div className="text-xs text-slate-400 font-bold uppercase tracking-tighter">
              © 2026 MathsRevision
            </div>
          </div>
        </div>
      </footer>
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
