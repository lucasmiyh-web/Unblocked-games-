import React, { useEffect, useRef, useState } from 'react';

export default function VoltRacing() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start');
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let obstacles: { x: number, y: number, w: number, h: number }[] = [];
    let player = { x: canvas.width / 2 - 20, y: canvas.height - 100, w: 40, h: 60 };
    let speed = 5;
    let distance = 0;

    const spawnObstacle = () => {
      if (Math.random() < 0.05) {
        const w = Math.random() * 100 + 50;
        obstacles.push({
          x: Math.random() * (canvas.width - w),
          y: -100,
          w: w,
          h: 20
        });
      }
    };

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Road lines
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      distance += speed;
      for (let i = (distance % 100) - 100; i < canvas.height; i += 100) {
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, i);
        ctx.lineTo(canvas.width / 2, i + 50);
        ctx.stroke();
      }

      // Player
      ctx.fillStyle = '#3b82f6';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#3b82f6';
      ctx.fillRect(player.x, player.y, player.w, player.h);
      ctx.shadowBlur = 0;

      // Obstacles
      ctx.fillStyle = '#ef4444';
      obstacles.forEach((obs, i) => {
        obs.y += speed;
        ctx.fillRect(obs.x, obs.y, obs.w, obs.h);

        if (obs.y > canvas.height) obstacles.splice(i, 1);

        // Collision
        if (
          player.x < obs.x + obs.w &&
          player.x + player.w > obs.x &&
          player.y < obs.y + obs.h &&
          player.y + player.h > obs.y
        ) {
          cancelAnimationFrame(animationFrameId);
          setGameState('gameover');
        }
      });

      spawnObstacle();
      setScore(Math.floor(distance / 10));
      speed = 5 + distance / 5000;
    };

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') player.x = Math.max(0, player.x - 20);
      if (e.key === 'ArrowRight' || e.key === 'd') player.x = Math.min(canvas.width - player.w, player.x + 20);
    };

    window.addEventListener('keydown', handleKey);
    animate();
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKey);
    };
  }, [gameState]);

  return (
    <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center relative font-mono">
      <canvas ref={canvasRef} width={400} height={600} className="max-w-full max-h-full border-x-4 border-slate-800" />
      <div className="absolute top-8 text-blue-500 font-black text-3xl italic">{score}m</div>
      
      {gameState !== 'playing' && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-8 text-center z-50">
          <div>
            <h2 className="text-4xl font-black text-white mb-6 uppercase tracking-widest italic">VOLT RACING</h2>
            <p className="text-slate-400 mb-8 uppercase text-xs font-bold tracking-widest leading-relaxed">
              Dodge the surges. High speed data transport required. <br /> Use ARROWS or WASD.
            </p>
            <button 
              onClick={() => { setScore(0); setGameState('playing'); }}
              className="px-8 py-4 bg-blue-600 text-white font-black uppercase rounded-2xl hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20"
            >
              Ignite Thrusters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
