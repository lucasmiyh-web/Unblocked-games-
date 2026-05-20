import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

export default function BitShift() {
  const [grid, setGrid] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [solved, setSolved] = useState(false);
  const size = 3; // 3x3 grid

  useEffect(() => {
    shuffle();
  }, []);

  const shuffle = () => {
    const nums = Array.from({ length: size * size }, (_, i) => i);
    // Fisher-Yates shuffle
    for (let i = nums.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nums[i], nums[j]] = [nums[j], nums[i]];
    }
    setGrid(nums);
    setMoves(0);
    setSolved(false);
  };

  const moveTile = (index: number) => {
    if (solved) return;
    const emptyIndex = grid.indexOf(0);
    const row = Math.floor(index / size);
    const col = index % size;
    const emptyRow = Math.floor(emptyIndex / size);
    const emptyCol = emptyIndex % size;

    const isAdjacent = (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
                      (Math.abs(col - emptyCol) === 1 && row === emptyRow);

    if (isAdjacent) {
      const newGrid = [...grid];
      [newGrid[index], newGrid[emptyIndex]] = [newGrid[emptyIndex], newGrid[index]];
      setGrid(newGrid);
      setMoves(m => m + 1);
      
      // Check win
      const isWin = newGrid.every((val, i) => {
        if (i === newGrid.length - 1) return val === 0;
        return val === i + 1;
      });
      if (isWin) setSolved(true);
    }
  };

  return (
    <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center p-8 font-mono">
      <div className="max-w-md w-full">
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="text-blue-500 font-black text-3xl italic tracking-tighter">{moves}</div>
            <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Cycles</div>
          </div>
          <button 
            onClick={shuffle}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest transition-all"
          >
            Reset Array
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {grid.map((val, i) => (
            <motion.button
              key={val}
              layout
              onClick={() => moveTile(i)}
              className={`aspect-square rounded-2xl flex items-center justify-center text-2xl font-black italic shadow-xl transition-all ${
                val === 0 
                ? 'bg-transparent border-2 border-dashed border-slate-800' 
                : 'bg-slate-800 text-white border border-slate-700 hover:border-blue-500'
              }`}
            >
              {val !== 0 && (
                <span className={solved ? 'text-blue-400' : ''}>{val}</span>
              )}
            </motion.button>
          ))}
        </div>

        {solved && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-center"
          >
            <div className="text-blue-500 font-black uppercase italic tracking-tighter mb-1">Pathway Optimized</div>
            <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Complexity resolved in {moves} moves</div>
          </motion.div>
        )}

        <div className="mt-8 text-center">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Memory Optimization v2.0</p>
        </div>
      </div>
    </div>
  );
}
