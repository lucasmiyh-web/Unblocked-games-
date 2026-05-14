import React, { useEffect, useRef, useState } from 'react';

interface Point {
  x: number;
  y: number;
}

interface Food {
  x: number;
  y: number;
  size: number;
  color: string;
}

export default function HyperSlither() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);

  const gameState = useRef({
    snake: [] as Point[],
    angle: 0,
    speed: 3,
    food: [] as Food[],
    width: 2000,
    height: 2000,
    camera: { x: 0, y: 0 },
    lastTime: 0,
    playerName: "Player 1"
  });

  const mousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    initGame();
    const interval = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(interval);
  }, []);

  const initGame = () => {
    const startX = 1000;
    const startY = 1000;
    gameState.current.snake = [];
    for (let i = 0; i < 20; i++) {
      gameState.current.snake.push({ x: startX - i * 5, y: startY });
    }
    gameState.current.food = Array.from({ length: 100 }, createFood);
    gameState.current.speed = 3;
    setScore(0);
    setGameOver(false);
  };

  function createFood(): Food {
    return {
      x: Math.random() * gameState.current.width,
      y: Math.random() * gameState.current.height,
      size: Math.random() * 5 + 3,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`
    };
  }

  const gameLoop = (time: number) => {
    if (!gameState.current.lastTime) gameState.current.lastTime = time;
    const dt = (time - gameState.current.lastTime) / 16;
    gameState.current.lastTime = time;

    update(dt);
    draw();
    requestAnimationFrame(gameLoop);
  };

  const update = (dt: number) => {
    if (gameOver) return;

    const head = gameState.current.snake[0];
    const dx = mousePos.current.x - window.innerWidth / 2;
    const dy = mousePos.current.y - window.innerHeight / 2;
    const targetAngle = Math.atan2(dy, dx);
    
    // Smooth angle rotation
    let angleDiff = targetAngle - gameState.current.angle;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    gameState.current.angle += angleDiff * 0.1 * dt;

    const newHead = {
      x: head.x + Math.cos(gameState.current.angle) * gameState.current.speed * dt,
      y: head.y + Math.sin(gameState.current.angle) * gameState.current.speed * dt
    };

    // Boundary check
    if (newHead.x < 0 || newHead.x > gameState.current.width || newHead.y < 0 || newHead.y > gameState.current.height) {
      setGameOver(true);
      if (score > highScore) setHighScore(score);
      return;
    }

    // Check food collision
    gameState.current.food = gameState.current.food.filter(f => {
      const dist = Math.hypot(newHead.x - f.x, newHead.y - f.y);
      if (dist < f.size + 15) {
        setScore(s => s + Math.floor(f.size));
        // Grow snake slightly
        for(let i=0; i<3; i++) {
          const last = gameState.current.snake[gameState.current.snake.length - 1];
          gameState.current.snake.push({ ...last });
        }
        return false;
      }
      return true;
    });

    if (gameState.current.food.length < 100) {
      gameState.current.food.push(createFood());
    }

    // Update snake body
    const newSnake = [newHead, ...gameState.current.snake.slice(0, -1)];
    gameState.current.snake = newSnake;

    // Update camera
    gameState.current.camera.x = newHead.x - window.innerWidth / 2;
    gameState.current.camera.y = newHead.y - window.innerHeight / 2;
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const { camera, snake, food, width, height } = gameState.current;

    // Draw Grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    const gridSize = 100;
    const startX = Math.floor(camera.x / gridSize) * gridSize;
    const startY = Math.floor(camera.y / gridSize) * gridSize;

    for (let x = startX - camera.x; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = startY - camera.y; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw Boundary
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 5;
    ctx.strokeRect(-camera.x, -camera.y, width, height);

    // Draw Food
    food.forEach(f => {
      ctx.fillStyle = f.color;
      ctx.beginPath();
      ctx.arc(f.x - camera.x, f.y - camera.y, f.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw Snake
    ctx.lineWidth = 20;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#3b82f6';
    
    ctx.beginPath();
    snake.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x - camera.x, p.y - camera.y);
      else ctx.lineTo(p.x - camera.x, p.y - camera.y);
    });
    ctx.stroke();

    // Draw Head
    const head = snake[0];
    ctx.fillStyle = '#60a5fa';
    ctx.beginPath();
    ctx.arc(head.x - camera.x, head.y - camera.y, 12, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = 'white';
    const eyeOffset = 6;
    const eyeX1 = head.x - camera.x + Math.cos(gameState.current.angle + 0.5) * eyeOffset;
    const eyeY1 = head.y - camera.y + Math.sin(gameState.current.angle + 0.5) * eyeOffset;
    const eyeX2 = head.x - camera.x + Math.cos(gameState.current.angle - 0.5) * eyeOffset;
    const eyeY2 = head.y - camera.y + Math.sin(gameState.current.angle - 0.5) * eyeOffset;
    
    ctx.beginPath(); ctx.arc(eyeX1, eyeY1, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(eyeX2, eyeY2, 3, 0, Math.PI * 2); ctx.fill();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    mousePos.current = { x: e.clientX, y: e.clientY };
  };

  return (
    <div 
      className="relative w-full h-full bg-slate-950 overflow-hidden cursor-none"
      onMouseMove={handleMouseMove}
    >
      <canvas ref={canvasRef} className="block shadow-2xl" />
      
      {/* UI Overlay */}
      <div className="absolute top-6 left-6 flex flex-col gap-2">
        <div className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
          <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">SCORE</div>
          <div className="text-2xl font-black text-white leading-none">{score}</div>
        </div>
        <div className="px-6 py-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/5">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">BEST</div>
          <div className="text-lg font-black text-slate-300 leading-none">{highScore}</div>
        </div>
      </div>

      <div className="absolute top-6 right-6 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest rounded-lg">
        SURVIVAL MODE: ENABLED
      </div>

      {gameOver && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center z-[100]">
          <div className="text-center p-12 bg-white rounded-[3rem] shadow-2xl max-w-sm w-full mx-4">
            <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">💀</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tighter">ELIMINATED</h2>
            <p className="text-slate-500 font-medium mb-8">You hit the energy barrier or another survivor.</p>
            
            <div className="bg-slate-50 p-6 rounded-2xl mb-8">
              <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">FINAL SCORE</div>
              <div className="text-4xl font-black text-blue-600">{score}</div>
            </div>

            <button 
              onClick={initGame}
              className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-slate-200"
            >
              RESPAWN NOW
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      {!gameOver && score < 10 && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 px-8 py-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-white font-black uppercase tracking-widest text-[10px] animate-pulse">
          Move your mouse to steer • Consume energy to grow
        </div>
      )}
    </div>
  );
}
