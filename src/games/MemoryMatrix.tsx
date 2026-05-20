import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function MemoryMatrix() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'showing' | 'gameover'>('start');
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [level, setLevel] = useState(1);
  const [highScore, setHighScore] = useState(0);
  const [activeButton, setActiveButton] = useState<number | null>(null);

  const startLevel = (nextLevel: number) => {
    setLevel(nextLevel);
    const newSequence = [];
    for (let i = 0; i < nextLevel + 2; i++) {
      newSequence.push(Math.floor(Math.random() * 9));
    }
    setSequence(newSequence);
    setUserSequence([]);
    setGameState('showing');
    showSequence(newSequence);
  };

  const showSequence = async (seq: number[]) => {
    for (let i = 0; i < seq.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 600));
      setActiveButton(seq[i]);
      await new Promise(resolve => setTimeout(resolve, 600));
      setActiveButton(null);
    }
    setGameState('playing');
  };

  const handleButtonClick = (index: number) => {
    if (gameState !== 'playing') return;

    const nextUserSequence = [...userSequence, index];
    setUserSequence(nextUserSequence);

    if (index !== sequence[userSequence.length]) {
      setGameState('gameover');
      if (level > highScore) setHighScore(level - 1);
      return;
    }

    if (nextUserSequence.length === sequence.length) {
      setTimeout(() => startLevel(level + 1), 1000);
    }
  };

  return (
    <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center p-8 font-mono">
      <div className="max-w-md w-full">
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="text-blue-500 font-black text-3xl italic tracking-tighter">LVL {level}</div>
            <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Efficiency</div>
          </div>
          <div className="text-right">
            <div className="text-slate-200 font-black text-xl italic tracking-tighter">BEST {highScore}</div>
            <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Peak Load</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {[...Array(9)].map((_, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleButtonClick(i)}
              className={`aspect-square rounded-2xl border-2 transition-all duration-300 relative overflow-hidden ${
                activeButton === i 
                ? 'bg-blue-500 border-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.5)] scale-105 z-10' 
                : 'bg-slate-800/50 border-slate-700 hover:border-slate-500'
              }`}
            >
               {activeButton === i && (
                 <motion.div 
                   layoutId="active-ring"
                   className="absolute inset-0 border-4 border-white/30 rounded-2xl"
                 />
               )}
            </motion.button>
          ))}
        </div>

        <AnimatePresence>
          {gameState !== 'playing' && gameState !== 'showing' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-12 text-center rounded-[2.5rem] z-50"
            >
              <div className="max-w-xs">
                <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-4">
                  {gameState === 'start' ? 'Memory Matrix' : 'Neural Decay'}
                </h2>
                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-8 leading-relaxed">
                  {gameState === 'start' 
                    ? 'Observe the light sequence within the matrix. Replicate the pattern to advance cognitive depth.'
                    : `Core synchronization failed at level ${level}. Your memory lattice collapsed.`}
                </p>
                <button 
                  onClick={() => startLevel(1)}
                  className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/20 hover:bg-blue-500 transition-all active:scale-95"
                >
                  {gameState === 'start' ? 'Begin Uplink' : 'Resync Core'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-center">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-relaxed">
            {gameState === 'showing' ? 'SYNCING PATTERN...' : 
             gameState === 'playing' ? 'INPUT REQUIRED' : 'SYSTEM IDLE'}
          </p>
        </div>
      </div>
    </div>
  );
}
