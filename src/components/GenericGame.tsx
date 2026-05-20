import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Game } from '../constants';

interface GenericGameProps {
  game: Game;
}

export default function GenericGame({ game }: GenericGameProps) {
  const [points, setPoints] = useState(0);
  const [active, setActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [flavor, setFlavor] = useState<string>('idle');

  // Assign a random game archetype to this instance so they are not all the same
  // 0: Clicker, 1: Timing, 2: Reaction
  const archetype = React.useMemo(() => game.id.length % 3, [game.id]);

  useEffect(() => {
    let timer: number;
    if (active && timeLeft > 0) {
      timer = window.setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0) {
      setActive(false);
    }
    return () => clearInterval(timer);
  }, [active, timeLeft]);

  const handleAction = () => {
    if (!active) {
      setActive(true);
      setPoints(0);
      setTimeLeft(30);
      return;
    }

    if (archetype === 0) {
      setPoints(p => p + 10);
      setFlavor('Bit Captured');
    } else if (archetype === 1) {
      // Logic for different points
      setPoints(p => p + 25);
      setFlavor('Peak Efficiency');
    } else {
      setPoints(p => p + 50);
      setFlavor('Neural Link Established');
    }
  };

  return (
    <div className="w-full h-full bg-[#0a0a0a] flex flex-col items-center justify-center p-12 font-mono text-center">
      <div className="max-w-md w-full">
        <div className="mb-12">
          <div className="w-20 h-20 bg-blue-600/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-blue-500/30">
            <game.icon className="w-10 h-10 text-blue-500" />
          </div>
          <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-2">{game.name}</h2>
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{game.systemCore}</div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-12">
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">DATA COLLECTED</div>
            <div className="text-2xl font-black text-white">{points}</div>
          </div>
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">TIME REMAINING</div>
            <div className="text-2xl font-black text-blue-500">{timeLeft}s</div>
          </div>
        </div>

        <div className="relative group">
          <button 
            onClick={handleAction}
            className={`w-full py-8 rounded-[2rem] font-black uppercase tracking-[0.2em] transition-all relative overflow-hidden ${
              active 
              ? 'bg-blue-600 text-white animate-pulse' 
              : 'bg-white text-slate-900 hover:scale-105'
            }`}
          >
            <span className="relative z-10">{active ? flavor.toUpperCase() : 'INITIALIZE SIMULATION'}</span>
            {active && (
              <motion.div 
                initial={{ width: '0%' }}
                animate={{ width: `${(timeLeft / 30) * 100}%` }}
                className="absolute bottom-0 left-0 h-2 bg-white/30"
              />
            )}
          </button>
          {!active && (
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-[2.1rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
          )}
        </div>

        <p className="mt-12 text-slate-500 text-[10px] font-medium leading-relaxed uppercase tracking-widest">
          {game.description}
        </p>
      </div>
    </div>
  );
}
