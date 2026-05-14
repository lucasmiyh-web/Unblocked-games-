import React, { useState, useEffect, useRef } from 'react';

interface Obstacle {
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'jump' | 'duck';
}

export default function NeonRunner() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);

  const state = useRef({
    player: {
      y: 0,
      vy: 0,
      isJumping: false,
      isDucking: false,
      width: 40,
      height: 40
    },
    obstacles: [] as Obstacle[],
    speed: 5,
    distance: 0,
    floorY: 0,
    hue: 180,
    lastObstacleTime: 0
  });

  useEffect(() => {
    init();
    const loop = requestAnimationFrame(gameLoop);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      cancelAnimationFrame(loop);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const init = () => {
    state.current.player = { y: 0, vy: 0, isJumping: false, isDucking: false, width: 40, height: 40 };
    state.current.obstacles = [];
    state.current.speed = 7;
    state.current.distance = 0;
    state.current.hue = 180;
    state.current.lastObstacleTime = 0;
    setScore(0);
    setGameOver(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (gameOver && (e.code === 'Space' || e.code === 'ArrowUp')) {
      init();
      return;
    }

    if (e.code === 'Space' || e.code === 'ArrowUp') {
      if (!state.current.player.isJumping) {
        state.current.player.vy = -12;
        state.current.player.isJumping = true;
      }
    }
    if (e.code === 'ArrowDown') {
      state.current.player.isDucking = true;
    }
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    if (e.code === 'ArrowDown') {
      state.current.player.isDucking = false;
    }
  };

  const gameLoop = (time: number) => {
    update(time);
    draw();
    requestAnimationFrame(gameLoop);
  };

  const update = (time: number) => {
    if (gameOver) return;

    const { player, obstacles, speed } = state.current;
    
    // Physics
    player.vy += 0.6; // Gravity
    player.y += player.vy;

    if (player.y > 0) {
      player.y = 0;
      player.vy = 0;
      player.isJumping = false;
    }

    // Player dimensions based on ducking
    player.height = player.isDucking ? 20 : 40;
    const playerY = player.isDucking ? player.y + 20 : player.y;

    // Obstacle spawning
    if (time - state.current.lastObstacleTime > 1500 / (speed / 7)) {
      const type = Math.random() > 0.3 ? 'jump' : 'duck';
      state.current.obstacles.push({
        x: 800,
        y: type === 'jump' ? 0 : -60,
        w: 30,
        h: type === 'jump' ? 30 : 20,
        type
      });
      state.current.lastObstacleTime = time;
    }

    // Update obstacles
    state.current.obstacles = obstacles.filter(obs => {
      obs.x -= speed;
      
      // Collision check
      const pTop = playerY - 40;
      const pBottom = playerY;
      const pLeft = 100;
      const pRight = 140;

      const oTop = obs.y - obs.h;
      const oBottom = obs.y;
      const oLeft = obs.x;
      const oRight = obs.x + obs.w;

      if (pRight > oLeft && pLeft < oRight && pBottom > oTop && pTop < oBottom) {
        setGameOver(true);
        if (score > highScore) setHighScore(score);
      }

      return obs.x > -50;
    });

    state.current.distance += speed / 100;
    setScore(Math.floor(state.current.distance));
    state.current.speed += 0.001;
    state.current.hue = (state.current.hue + 0.1) % 360;
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 400;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(1, '#1e293b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const floorY = 300;
    
    // Draw Floor
    ctx.strokeStyle = `hsl(${state.current.hue}, 80%, 50%)`;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, floorY);
    ctx.lineTo(canvas.width, floorY);
    ctx.stroke();

    // Floor glow
    ctx.shadowBlur = 20;
    ctx.shadowColor = ctx.strokeStyle;
    ctx.beginPath();
    ctx.moveTo(0, floorY + 2);
    ctx.lineTo(canvas.width, floorY + 2);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Draw Player
    const p = state.current.player;
    ctx.fillStyle = 'white';
    const pY = floorY + p.y - p.height;
    ctx.fillRect(100, pY, p.width, p.height);
    
    // Player glow
    ctx.shadowBlur = 15;
    ctx.shadowColor = 'white';
    ctx.strokeRect(100, pY, p.width, p.height);
    ctx.shadowBlur = 0;

    // Draw Obstacles
    state.current.obstacles.forEach(obs => {
      ctx.fillStyle = '#ef4444';
      const oY = floorY + obs.y - obs.h;
      ctx.fillRect(obs.x, oY, obs.w, obs.h);
      
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ef4444';
      ctx.strokeRect(obs.x, oY, obs.w, obs.h);
      ctx.shadowBlur = 0;
    });

    // Decorative background lines
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for(let i=0; i<10; i++) {
      const x = (state.current.distance * -20 + i * 150) % (canvas.width + 150) - 150;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, floorY); ctx.stroke();
    }
  };

  return (
    <div className="relative w-full h-full bg-slate-900 rounded-3xl overflow-hidden flex items-center justify-center">
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />

      {/* HUD */}
      <div className="absolute top-10 left-10 text-white flex flex-col gap-1">
        <div className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em]">DISTANCE</div>
        <div className="text-4xl font-black italic">{score}m</div>
      </div>

      <div className="absolute top-10 right-10">
        <div className="px-6 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-black text-rose-400 uppercase tracking-widest">
          NEON RUNNER / SYSTEM ACTIVE
        </div>
      </div>

      {gameOver && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6 z-[100]">
          <div className="max-w-md w-full bg-white rounded-[3rem] p-12 text-center shadow-2xl">
            <div className="text-5xl mb-6">💥</div>
            <h2 className="text-4xl font-black text-slate-900 mb-2 uppercase tracking-tighter italic">NEURAL ERROR</h2>
            <p className="text-slate-500 font-medium mb-8">Connection to runner was severed upon impact.</p>
            
            <div className="bg-slate-50 p-8 rounded-[2rem] mb-8">
              <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">LAST ATTEMPT</div>
              <div className="text-5xl font-black text-slate-900">{score}<span className="text-sm">m</span></div>
            </div>

            <button 
              onClick={init}
              className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-slate-200"
            >
              RESTART SEQUENCE
            </button>
          </div>
        </div>
      )}

      {!gameOver && score < 50 && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-4">
          <div className="px-5 py-3 bg-white/10 backdrop-blur-md rounded-xl text-white text-[10px] font-black uppercase tracking-wider border border-white/10">
            SPACE / ↑ TO JUMP
          </div>
          <div className="px-5 py-3 bg-white/10 backdrop-blur-md rounded-xl text-white text-[10px] font-black uppercase tracking-wider border border-white/10">
             ↓ TO DUCK
          </div>
        </div>
      )}
    </div>
  );
}
