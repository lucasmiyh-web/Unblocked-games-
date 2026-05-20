import React, { useEffect, useRef, useState } from 'react';

export default function StarDefender() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    let asteroids: Asteroid[] = [];
    let bullets: Bullet[] = [];
    let ship = {
      x: canvas.width / 2,
      y: canvas.height - 50,
      radius: 15,
      color: '#3b82f6'
    };

    class Particle {
      x: number; y: number; radius: number; color: string; velocity: { x: number; y: number }; alpha: number;
      constructor(x: number, y: number, radius: number, color: string, velocity: { x: number; y: number }) {
        this.x = x; this.y = y; this.radius = radius; this.color = color; this.velocity = velocity; this.alpha = 1;
      }
      draw() {
        ctx!.save();
        ctx!.globalAlpha = this.alpha;
        ctx!.beginPath();
        ctx!.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx!.fillStyle = this.color;
        ctx!.fill();
        ctx!.restore();
      }
      update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= 0.01;
      }
    }

    class Asteroid {
      x: number; y: number; radius: number; color: string; velocity: { x: number; y: number };
      constructor(x: number, y: number, radius: number, color: string, velocity: { x: number; y: number }) {
        this.x = x; this.y = y; this.radius = radius; this.color = color; this.velocity = velocity;
      }
      draw() {
        ctx!.beginPath();
        ctx!.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx!.fillStyle = this.color;
        ctx!.fill();
        ctx!.strokeStyle = 'white';
        ctx!.lineWidth = 2;
        ctx!.stroke();
      }
      update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
      }
    }

    class Bullet {
      x: number; y: number; radius: number; color: string; velocity: { x: number; y: number };
      constructor(x: number, y: number, radius: number, color: string, velocity: { x: number; y: number }) {
        this.x = x; this.y = y; this.radius = radius; this.color = color; this.velocity = velocity;
      }
      draw() {
        ctx!.beginPath();
        ctx!.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx!.fillStyle = this.color;
        ctx!.fill();
      }
      update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
      }
    }

    const spawnAsteroids = () => {
      if (Math.random() < 0.03) {
        const radius = Math.random() * 20 + 10;
        let x, y;
        if (Math.random() < 0.5) {
          x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
          y = Math.random() * canvas.height;
        } else {
          x = Math.random() * canvas.width;
          y = 0 - radius;
        }
        const angle = Math.atan2(ship.y - y, ship.x - x);
        const velocity = {
          x: Math.cos(angle) * (1 + score / 1000),
          y: Math.sin(angle) * (1 + score / 1000)
        };
        asteroids.push(new Asteroid(x, y, radius, '#64748b', velocity));
      }
    };

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Ship
      ctx.beginPath();
      ctx.moveTo(ship.x, ship.y - 20);
      ctx.lineTo(ship.x - 15, ship.y + 10);
      ctx.lineTo(ship.x + 15, ship.y + 10);
      ctx.closePath();
      ctx.fillStyle = '#3b82f6';
      ctx.fill();
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#3b82f6';
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.shadowBlur = 0;

      particles.forEach((particle, index) => {
        if (particle.alpha <= 0) {
          particles.splice(index, 1);
        } else {
          particle.update();
          particle.draw();
        }
      });

      bullets.forEach((bullet, index) => {
        bullet.update();
        bullet.draw();
        if (bullet.x + bullet.radius < 0 || bullet.x - bullet.radius > canvas.width ||
            bullet.y + bullet.radius < 0 || bullet.y - bullet.radius > canvas.height) {
          bullets.splice(index, 1);
        }
      });

      asteroids.forEach((asteroid, aIndex) => {
        asteroid.update();
        asteroid.draw();

        // Collision with ship
        const dist = Math.hypot(ship.x - asteroid.x, ship.y - asteroid.y);
        if (dist - asteroid.radius - ship.radius < 1) {
          cancelAnimationFrame(animationFrameId);
          setGameState('gameover');
        }

        // Collision with bullet
        bullets.forEach((bullet, bIndex) => {
          const dist = Math.hypot(bullet.x - asteroid.x, bullet.y - asteroid.y);
          if (dist - asteroid.radius - bullet.radius < 1) {
            // Explosion particles
            for (let i = 0; i < asteroid.radius * 2; i++) {
              particles.push(new Particle(bullet.x, bullet.y, Math.random() * 2, asteroid.color, {
                x: (Math.random() - 0.5) * (Math.random() * 6),
                y: (Math.random() - 0.5) * (Math.random() * 6)
              }));
            }
            if (asteroid.radius > 15) {
              asteroid.radius -= 10;
              setScore(s => s + 50);
              bullets.splice(bIndex, 1);
            } else {
              setScore(s => s + 100);
              asteroids.splice(aIndex, 1);
              bullets.splice(bIndex, 1);
            }
          }
        });
      });

      spawnAsteroids();
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      ship.x = e.clientX - rect.left;
      ship.y = e.clientY - rect.top;
    };

    const handleMouseClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      const angle = Math.atan2(clickY - ship.y, clickX - ship.x);
      const velocity = {
        x: Math.cos(angle) * 10,
        y: Math.sin(angle) * 10
      };
      bullets.push(new Bullet(ship.x, ship.y, 4, '#ef4444', velocity));
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseClick);
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseClick);
    };
  }, [gameState]);

  const startGame = () => {
    setScore(0);
    setGameState('playing');
  };

  useEffect(() => {
    if (score > highScore) setHighScore(score);
  }, [score]);

  return (
    <div className="w-full h-full bg-slate-950 flex items-center justify-center relative overflow-hidden font-mono">
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={600} 
        className="max-w-full max-h-full cursor-none"
      />
      
      {gameState !== 'playing' && (
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-center items-center justify-center p-6 text-center z-50">
          <div className="max-w-sm">
            <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-4">
              {gameState === 'start' ? 'Sector Defense' : 'System Failure'}
            </h2>
            {gameState === 'gameover' && (
              <div className="mb-8">
                <div className="text-red-500 font-black text-4xl mb-2">{score}</div>
                <div className="text-slate-400 text-xs font-bold uppercase tracking-widest">Final Data Points</div>
              </div>
            )}
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-8 leading-relaxed">
              {gameState === 'start' 
                ? 'Control your interceptor with the cursor. Click to fire thermal pulses. Destroy incoming solid masses.'
                : 'Defensive systems bypassed. Orbital sector lost.'}
            </p>
            <button 
              onClick={startGame}
              className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/20 hover:bg-blue-500 transition-all active:scale-95"
            >
              {gameState === 'start' ? 'Initiate Core' : 'Reboot System'}
            </button>
          </div>
        </div>
      )}

      <div className="absolute top-8 left-8 z-40 text-left">
        <div className="text-blue-500 font-black text-3xl italic tracking-tighter">{score}</div>
        <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Score</div>
      </div>

      <div className="absolute top-8 right-8 z-40 text-right">
        <div className="text-slate-200 font-black text-xl italic tracking-tighter">{highScore}</div>
        <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Best</div>
      </div>
    </div>
  );
}
