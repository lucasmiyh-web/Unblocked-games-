import React, { useEffect, useRef, useState } from 'react';

export default function CryptoClimb() {
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
    let platforms: any[] = [];
    let player = { x: canvas.width / 2, y: canvas.height - 100, radius: 10, vy: 0, vx: 0, jump: -12 };
    let cameraY = 0;

    const initPlatforms = () => {
      platforms = [];
      for (let i = 0; i < 10; i++) {
        platforms.push({
          x: Math.random() * (canvas.width - 100),
          y: canvas.height - i * 150,
          w: 100,
          h: 15
        });
      }
    };

    initPlatforms();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(0, -cameraY);

      // Player Physics
      player.vy += 0.5;
      player.x += player.vx || 0;
      player.y += player.vy;

      // Wrap around
      if (player.x < 0) player.x = canvas.width;
      if (player.x > canvas.width) player.x = 0;

      // Camera follow
      if (player.y < cameraY + canvas.height / 2) {
        cameraY = player.y - canvas.height / 2;
      }

      // Platforms
      ctx.fillStyle = '#3b82f6';
      platforms.forEach(p => {
        ctx.fillRect(p.x, p.y, p.w, p.h);
        
        // Bounce
        if (player.vy > 0 && 
            player.x > p.x && player.x < p.x + p.w &&
            player.y + player.radius > p.y && player.y + player.radius < p.y + p.h) {
          player.vy = player.jump;
          setScore(s => Math.max(s, Math.floor(-player.y / 10 + 60)));
        }
      });

      // Spawn new platforms
      if (platforms[platforms.length - 1].y > cameraY - 100) {
        platforms.push({
          x: Math.random() * (canvas.width - 100),
          y: platforms[platforms.length - 1].y - 150,
          w: 100,
          h: 15
        });
      }

      // Draw Player
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Death check
      if (player.y > cameraY + canvas.height + 100) {
        setGameState('gameover');
      }
    };

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') player.vx = -5;
      if (e.key === 'ArrowRight' || e.key === 'd') player.vx = 5;
    };
    const handleUp = () => player.vx = 0;

    window.addEventListener('keydown', handleKey);
    window.addEventListener('keyup', handleUp);
    animate();
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('keyup', handleUp);
    };
  }, [gameState]);

  return (
    <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center relative font-mono">
      <canvas ref={canvasRef} width={400} height={600} className="max-w-full max-h-full border-x border-white/5" />
      <div className="absolute top-8 text-blue-400 font-black text-3xl italic">{score}m</div>
      
      {gameState !== 'playing' && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-8 text-center z-50">
          <div>
            <h2 className="text-4xl font-black text-white mb-6 uppercase tracking-widest italic">CRYPTO CLIMB</h2>
            <p className="text-slate-400 mb-8 uppercase text-xs font-bold tracking-widest leading-relaxed">
              Reach the peak of the chain. Don't fall into the fork. <br /> Use ARROWS or WASD.
            </p>
            <button 
              onClick={() => { setScore(0); setGameState('playing'); }}
              className="px-8 py-4 bg-blue-600 text-white font-black uppercase rounded-2xl hover:bg-blue-500 transition-all"
            >
              Start Ascension
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
