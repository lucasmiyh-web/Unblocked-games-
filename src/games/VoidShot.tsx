import React, { useEffect, useRef, useState } from 'react';

export default function VoidShot() {
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
    let particles: any[] = [];
    let targets: any[] = [];
    let bullets: any[] = [];
    
    class Target {
      x: number; y: number; radius: number; speed: number;
      constructor() {
        this.radius = Math.random() * 20 + 10;
        this.x = Math.random() * (canvas!.width - this.radius * 2) + this.radius;
        this.y = -this.radius;
        this.speed = Math.random() * 2 + 1 + score / 500;
      }
      draw() {
        ctx!.beginPath();
        ctx!.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx!.fillStyle = '#ef4444';
        ctx!.fill();
        ctx!.strokeStyle = 'white';
        ctx!.stroke();
      }
      update() {
        this.y += this.speed;
      }
    }

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (Math.random() < 0.02) targets.push(new Target());

      targets.forEach((t, i) => {
        t.update();
        t.draw();
        if (t.y > canvas.height + t.radius) {
          setGameState('gameover');
        }
      });

      bullets.forEach((b, bi) => {
        b.y -= 10;
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.arc(b.x, b.y, 5, 0, Math.PI * 2);
        ctx.fill();

        targets.forEach((t, ti) => {
          const dist = Math.hypot(b.x - t.x, b.y - t.y);
          if (dist < t.radius + 5) {
            targets.splice(ti, 1);
            bullets.splice(bi, 1);
            setScore(s => s + 10);
          }
        });

        if (b.y < 0) bullets.splice(bi, 1);
      });
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      bullets.push({ x: e.clientX - rect.left, y: canvas.height - 50 });
    };

    canvas.addEventListener('mousedown', handleClick);
    animate();
    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('mousedown', handleClick);
    };
  }, [gameState]);

  return (
    <div className="w-full h-full bg-slate-950 flex items-center justify-center relative font-mono">
      <canvas ref={canvasRef} width={600} height={800} className="max-w-full max-h-full border border-white/10" />
      <div className="absolute top-8 left-8 text-blue-500 font-black text-2xl">{score}</div>
      
      {gameState !== 'playing' && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-8 text-center">
          <div>
            <h2 className="text-4xl font-black text-white mb-6 uppercase tracking-widest">VOID SHOT</h2>
            <p className="text-slate-400 mb-8 uppercase text-xs font-bold tracking-widest">Intercept all incoming data packets. Do not let any fall.</p>
            <button 
              onClick={() => { setScore(0); setGameState('playing'); }}
              className="px-8 py-4 bg-blue-600 text-white font-black uppercase rounded-2xl hover:bg-blue-500 transition-all"
            >
              Initialize Pulse
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
