import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function GravityCube() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover' | 'win'>('start');
  const [rotation, setRotation] = useState(0);
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 });
  const [level, setLevel] = useState(0);
  
  const levels = [
    {
      gridSize: 5,
      start: { x: 0, y: 0 },
      end: { x: 4, y: 4 },
      obstacles: [{ x: 2, y: 2 }, { x: 1, y: 3 }, { x: 3, y: 1 }]
    },
    {
      gridSize: 7,
      start: { x: 0, y: 0 },
      end: { x: 6, y: 6 },
      obstacles: [{ x: 3, y: 3 }, { x: 2, y: 4 }, { x: 4, y: 2 }, { x: 1, y: 1 }, { x: 5, y: 5 }]
    }
  ];

  const currentLevel = levels[level % levels.length];

  const startLevel = (idx: number) => {
    setLevel(idx);
    setPlayerPos(levels[idx % levels.length].start);
    setGameState('playing');
    setRotation(0);
  };

  const handleRotate = (dir: 'left' | 'right') => {
    if (gameState !== 'playing') return;
    const newRot = dir === 'left' ? rotation - 90 : rotation + 90;
    setRotation(newRot);
  };

  const move = (dir: 'up' | 'down' | 'left' | 'right') => {
    if (gameState !== 'playing') return;
    
    let { x, y } = playerPos;
    const s = currentLevel.gridSize;

    if (dir === 'up') y = Math.max(0, y - 1);
    if (dir === 'down') y = Math.min(s - 1, y + 1);
    if (dir === 'left') x = Math.max(0, x - 1);
    if (dir === 'right') x = Math.min(s - 1, x + 1);

    // Obstacle Check
    const isObstacle = currentLevel.obstacles.some(obs => obs.x === x && obs.y === y);
    if (isObstacle) {
      setGameState('gameover');
      return;
    }

    setPlayerPos({ x, y });

    // Win Check
    if (x === currentLevel.end.x && y === currentLevel.end.y) {
      if (level < levels.length - 1) {
        setTimeout(() => startLevel(level + 1), 500);
      } else {
        setGameState('win');
      }
    }
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w') move('up');
      if (e.key === 'ArrowDown' || e.key === 's') move('down');
      if (e.key === 'ArrowLeft' || e.key === 'a') move('left');
      if (e.key === 'ArrowRight' || e.key === 'd') move('right');
      if (e.key === 'q') handleRotate('left');
      if (e.key === 'e') handleRotate('right');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [playerPos, gameState, rotation]);

  return (
    <div className="w-full h-full bg-[#0a0a0a] flex flex-col items-center justify-center p-8 font-mono overflow-hidden">
      <div className="flex justify-between w-full max-w-lg mb-12">
        <div>
          <div className="text-white font-black text-2xl italic tracking-tighter">DATA NODE {level + 1}</div>
          <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Navigation Path</div>
        </div>
        <div className="text-right">
          <div className="text-blue-500 font-black text-xl italic tracking-tighter">WASD / ARROWS</div>
          <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Vector Control</div>
        </div>
      </div>

      <div className="relative">
        <motion.div 
          animate={{ rotate: rotation }}
          transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          style={{ 
            display: 'grid', 
            gridTemplateColumns: `repeat(${currentLevel.gridSize}, 1fr)`,
            gap: '8px'
          }}
          className="p-8 bg-slate-900/50 rounded-[2rem] border border-slate-800 shadow-2xl relative"
        >
          {[...Array(currentLevel.gridSize * currentLevel.gridSize)].map((_, i) => {
            const x = i % currentLevel.gridSize;
            const y = Math.floor(i / currentLevel.gridSize);
            const isObstacle = currentLevel.obstacles.some(obs => obs.x === x && obs.y === y);
            const isStart = currentLevel.start.x === x && currentLevel.start.y === y;
            const isEnd = currentLevel.end.x === x && currentLevel.end.y === y;
            const isPlayer = playerPos.x === x && playerPos.y === y;

            return (
              <div 
                key={i}
                className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center text-xs font-black transition-all ${
                  isObstacle ? 'bg-red-500/10 border-red-500/20' : 
                  isEnd ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' :
                  'bg-white/5 border-white/5'
                } border`}
              >
                {isPlayer && (
                  <motion.div 
                    layoutId="player"
                    className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-lg shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center justify-center"
                    animate={{ rotate: -rotation }}
                  >
                    <div className="w-2 h-2 bg-slate-900 rounded-full" />
                  </motion.div>
                )}
                {isEnd && !isPlayer && <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />}
                {isObstacle && <div className="w-full h-full flex items-center justify-center text-red-500/20">×</div>}
              </div>
            );
          })}
        </motion.div>

        <AnimatePresence>
          {gameState !== 'playing' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-[-40px] bg-black/90 backdrop-blur-xl flex items-center justify-center p-12 text-center rounded-[3rem] z-50 border border-white/10 shadow-2xl"
            >
              <div className="max-w-xs">
                <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-4">
                  {gameState === 'start' ? 'Gravity Cube' : 
                   gameState === 'win' ? 'Registry Clear' : 'Fracture'}
                </h2>
                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-8 leading-relaxed">
                  {gameState === 'start' 
                    ? 'Navigate the lattice using vector keys. Avoid static zones and reach the extraction point.'
                    : gameState === 'win' 
                    ? 'All nodes cleared. Structural integrity restored.'
                    : 'Collision detected. Reboot node sequence.'}
                </p>
                <button 
                  onClick={() => startLevel(0)}
                  className="w-full py-5 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-slate-200 transition-all active:scale-95 shadow-2xl shadow-white/10"
                >
                  {gameState === 'win' ? 'Re-Enter Grid' : 'Initiate Sync'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-12 flex gap-4">
        <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Status: </span>
          <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest animate-pulse">Operational</span>
        </div>
        <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mode: </span>
          <span className="text-[10px] font-black text-white uppercase tracking-widest">Navigation</span>
        </div>
      </div>
    </div>
  );
}
