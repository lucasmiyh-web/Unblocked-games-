import React, { useEffect, useRef, useState } from 'react';

export default function GhostProtocol() {
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
    let ghosts: any[] = [];
    let player = { x: canvas.width / 2, y: canvas.height / 2, radius: 10 };
    let mouse = { x: canvas.width / 2, y: canvas.height / 2 };

    const spawnGhost = () => {
      if (Math.random() < 0.02) {
        const side = Math.floor(Math.random() * 4);
        let x, y;
        if (side === 0) { x = Math.random() * canvas.width; y = -20; }
        else if (side === 1) { x = canvas.width + 20; y = Math.random() * canvas.height; }
        else if (side === 2) { x = Math.random() * canvas.width; y = canvas.height + 20; }
        else { x = -20; y = Math.random() * canvas.height; }
        ghosts.push({ x, y, speed: Math.random() * 2 + 1 });
      }
    };

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      ctx.fillStyle = 'rgba(10, 10, 10, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Mouse tracking player
      const dx = mouse.x - player.x;
      const dy = mouse.y - player.y;
      player.x += dx * 0.1;
      player.y += dy * 0.1;

      // Draw Player
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#10b981';
      ctx.fill();
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#10b981';
      ctx.stroke();

      ghosts.forEach((g, i) => {
        const angle = Math.atan2(player.y - g.y, player.x - g.x);
        g.x += Math.cos(angle) * g.speed;
        g.y += Math.sin(angle) * g.speed;

        ctx.beginPath();
        ctx.arc(g.x, g.y, 12, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fill();

        // Collision
        const dist = Math.hypot(player.x - g.x, player.y - g.y);
        if (dist < player.radius + 12) {
          cancelAnimationFrame(animationFrameId);
          setGameState('gameover');
        }
      });

      spawnGhost();
      setScore(s => s + 1);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    animate();
    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, [gameState]);

  return (
    <div className="w-full h-full bg-[#0a0a0a] flex flex-col items-center justify-center relative font-mono">
      <canvas ref={canvasRef} width={800} height={600} className="w-full h-full cursor-none" />
      <div className="absolute top-8 left-8 text-emerald-500 font-black text-2xl tracking-tighter italic">STEALTH TIME: {Math.floor(score/60)}s</div>
      
      {gameState !== 'playing' && (
        <div className="absolute inset-0 bg-black/90 flex items-center justify-center p-8 text-center z-50">
          <div>
            <h2 className="text-4xl font-black text-white mb-6 uppercase tracking-[0.2em] italic">GHOST PROTOCOL</h2>
            <p className="text-slate-400 mb-8 uppercase text-xs font-bold tracking-widest leading-relaxed">
              Shadow processes detected. Stay out of phase. <br /> Use mouse to navigate the void.
            </p>
            <button 
              onClick={() => { setScore(0); setGameState('playing'); }}
              className="px-12 py-5 bg-emerald-600 text-white font-black uppercase rounded-2xl hover:bg-emerald-500 transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)]"
            >
              Enable Cloak
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
