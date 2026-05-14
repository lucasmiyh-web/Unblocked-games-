import React, { useState, useEffect, useRef } from 'react';

type Point = { x: number, y: number };

export default function RetroSnake() {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const state = useRef({
    snake: [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }] as Point[],
    food: { x: 15, y: 15 } as Point,
    direction: { x: 1, y: 0 },
    nextDirection: { x: 1, y: 0 },
    gridSize: 20,
    tileCount: 20
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const { direction } = state.current;
      if (e.key === 'ArrowUp' && direction.y === 0) state.current.nextDirection = { x: 0, y: -1 };
      if (e.key === 'ArrowDown' && direction.y === 0) state.current.nextDirection = { x: 0, y: 1 };
      if (e.key === 'ArrowLeft' && direction.x === 0) state.current.nextDirection = { x: -1, y: 0 };
      if (e.key === 'ArrowRight' && direction.x === 0) state.current.nextDirection = { x: 1, y: 0 };
    };

    window.addEventListener('keydown', handleKeyDown);
    const interval = setInterval(update, 100);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearInterval(interval);
    };
  }, []);

  const reset = () => {
    state.current.snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    state.current.direction = { x: 1, y: 0 };
    state.current.nextDirection = { x: 1, y: 0 };
    state.current.food = { x: 15, y: 15 };
    setScore(0);
    setGameOver(false);
  };

  const update = () => {
    if (gameOver) return;

    const s = state.current;
    s.direction = s.nextDirection;
    const head = { x: s.snake[0].x + s.direction.x, y: s.snake[0].y + s.direction.y };

    // Wall collision
    if (head.x < 0 || head.x >= s.tileCount || head.y < 0 || head.y >= s.tileCount) {
      setGameOver(true);
      if (score > highScore) setHighScore(score);
      return;
    }

    // Body collision
    if (s.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
      setGameOver(true);
      if (score > highScore) setHighScore(score);
      return;
    }

    const newSnake = [head, ...s.snake];

    // Food collision
    if (head.x === s.food.x && head.y === s.food.y) {
      setScore(sc => sc + 10);
      s.food = {
        x: Math.floor(Math.random() * s.tileCount),
        y: Math.floor(Math.random() * s.tileCount)
      };
    } else {
      newSnake.pop();
    }

    state.current.snake = newSnake;
    draw();
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const s = state.current;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid details
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for(let i=0; i<s.tileCount; i++) {
      ctx.beginPath(); ctx.moveTo(i * s.gridSize, 0); ctx.lineTo(i * s.gridSize, canvas.height); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * s.gridSize); ctx.lineTo(canvas.width, i * s.gridSize); ctx.stroke();
    }

    // Food
    ctx.fillStyle = '#ef4444';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ef4444';
    ctx.fillRect(s.food.x * s.gridSize + 2, s.food.y * s.gridSize + 2, s.gridSize - 4, s.gridSize - 4);
    ctx.shadowBlur = 0;

    // Snake
    s.snake.forEach((segment, i) => {
      ctx.fillStyle = i === 0 ? '#3b82f6' : '#60a5fa';
      ctx.fillRect(segment.x * s.gridSize + 2, segment.y * s.gridSize + 2, s.gridSize - 4, s.gridSize - 4);
      
      if (i === 0) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#3b82f6';
        ctx.strokeRect(segment.x * s.gridSize + 1, segment.y * s.gridSize + 1, s.gridSize - 2, s.gridSize - 2);
        ctx.shadowBlur = 0;
      }
    });
  };

  return (
    <div className="relative w-full h-full bg-slate-900 flex items-center justify-center rounded-3xl overflow-hidden p-8">
      <div className="relative bg-slate-950 p-2 rounded-xl border-4 border-slate-800 shadow-2xl">
        <canvas 
          ref={canvasRef} 
          width={400} 
          height={400}
          className="rounded-lg"
        />
      </div>

      {/* Stats */}
      <div className="absolute top-10 left-10 text-white">
        <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">SCORE</div>
        <div className="text-4xl font-black italic">{score}</div>
      </div>

      <div className="absolute top-10 right-10 flex flex-col items-end gap-2">
        <div className="px-5 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-slate-300 uppercase tracking-widest">
          RETRO_SYSTEM.SYS
        </div>
        <div className="text-right">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">RECORD</div>
          <div className="text-xl font-black text-white">{highScore}</div>
        </div>
      </div>

      {gameOver && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6 z-50">
          <div className="max-w-xs w-full bg-white rounded-[2.5rem] p-10 text-center shadow-2xl">
            <div className="text-4xl mb-4">🐍</div>
            <h2 className="text-3xl font-black text-slate-900 mb-2 uppercase italic tracking-tighter">BITTEN</h2>
            <p className="text-slate-500 font-medium mb-6 text-sm">System overload. The snake self-contained.</p>
            
            <div className="bg-slate-50 p-6 rounded-2xl mb-8">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">FINAL POINTS</div>
              <div className="text-4xl font-black text-blue-600">{score}</div>
            </div>

            <button 
              onClick={reset}
              className="w-full py-4 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest hover:scale-105 transition-all"
            >
              RUN SCRIPT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
