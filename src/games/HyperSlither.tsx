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

interface Snake {
  id: string;
  points: Point[];
  angle: number;
  speed: number;
  color: string;
  isAI: boolean;
  name: string;
}

export default function HyperSlither() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);

  const gameState = useRef({
    player: {
      points: [] as Point[],
      angle: 0,
      speed: 3,
      color: '#3b82f6'
    },
    aiSnakes: [] as Snake[],
    food: [] as Food[],
    width: 3000,
    height: 3000,
    camera: { x: 0, y: 0 },
    lastTime: 0
  });

  const mousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    initGame();
    const interval = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(interval);
  }, []);

  const initGame = () => {
    const startX = 1500;
    const startY = 1500;
    gameState.current.player.points = [];
    for (let i = 0; i < 20; i++) {
      gameState.current.player.points.push({ x: startX - i * 5, y: startY });
    }
    gameState.current.player.angle = 0;
    gameState.current.food = Array.from({ length: 200 }, createFood);
    
    // Init AI Snakes
    gameState.current.aiSnakes = Array.from({ length: 8 }, (_, i) => createAISnake(`ai-${i}`));
    
    setScore(0);
    setGameOver(false);
  };

  function createFood(x?: number, y?: number, size?: number): Food {
    return {
      x: x ?? Math.random() * gameState.current.width,
      y: y ?? Math.random() * gameState.current.height,
      size: size ?? Math.random() * 5 + 3,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`
    };
  }

  function createAISnake(id: string): Snake {
    const x = Math.random() * gameState.current.width;
    const y = Math.random() * gameState.current.height;
    const points: Point[] = [];
    for (let i = 0; i < 20; i++) {
      points.push({ x: x - i * 5, y });
    }
    return {
      id,
      points,
      angle: Math.random() * Math.PI * 2,
      speed: 2.5 + Math.random(),
      color: `hsl(${Math.random() * 360}, 80%, 50%)`,
      isAI: true,
      name: `Entity_${id.split('-')[1]}`
    };
  }

  const gameLoop = (time: number) => {
    if (!gameState.current.lastTime) gameState.current.lastTime = time;
    const dt = Math.min((time - gameState.current.lastTime) / 16, 2);
    gameState.current.lastTime = time;

    update(dt);
    draw();
    requestAnimationFrame(gameLoop);
  };

  const update = (dt: number) => {
    if (gameOver) return;

    const { player, aiSnakes, food, width, height } = gameState.current;

    // Player Update
    const head = player.points[0];
    const dx = mousePos.current.x - window.innerWidth / 2;
    const dy = mousePos.current.y - window.innerHeight / 2;
    const targetAngle = Math.atan2(dy, dx);
    
    let angleDiff = targetAngle - player.angle;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    player.angle += angleDiff * 0.1 * dt;

    const newHead = {
      x: head.x + Math.cos(player.angle) * player.speed * dt,
      y: head.y + Math.sin(player.angle) * player.speed * dt
    };

    // AI Updates
    aiSnakes.forEach(ai => {
      const aiHead = ai.points[0];
      
      // Simple AI logic: Head towards nearest food or away from player if too close
      let aiTargetX = width / 2;
      let aiTargetY = height / 2;
      
      // Find nearest food
      let minDist = 1000000;
      food.forEach(f => {
        const d = Math.hypot(aiHead.x - f.x, aiHead.y - f.y);
        if (d < minDist) {
          minDist = d;
          aiTargetX = f.x;
          aiTargetY = f.y;
        }
      });

      // Avoid player
      const distToPlayer = Math.hypot(aiHead.x - newHead.x, aiHead.y - newHead.y);
      if (distToPlayer < 100) {
        aiTargetX = aiHead.x + (aiHead.x - newHead.x);
        aiTargetY = aiHead.y + (aiHead.y - newHead.y);
      }

      const aiTargetAngle = Math.atan2(aiTargetY - aiHead.y, aiTargetX - aiHead.x);
      let aiAngleDiff = aiTargetAngle - ai.angle;
      while (aiAngleDiff < -Math.PI) aiAngleDiff += Math.PI * 2;
      while (aiAngleDiff > Math.PI) aiAngleDiff -= Math.PI * 2;
      ai.angle += aiAngleDiff * 0.05 * dt;

      const aiNewHead = {
        x: aiHead.x + Math.cos(ai.angle) * ai.speed * dt,
        y: aiHead.y + Math.sin(ai.angle) * ai.speed * dt
      };

      // AI Boundary wrap
      if (aiNewHead.x < 0) aiNewHead.x = width;
      if (aiNewHead.x > width) aiNewHead.x = 0;
      if (aiNewHead.y < 0) aiNewHead.y = height;
      if (aiNewHead.y > height) aiNewHead.y = 0;

      ai.points = [aiNewHead, ...ai.points.slice(0, -1)];

      // AI Collisions with Player body
      player.points.forEach((p, i) => {
        if (i > 5) {
          const d = Math.hypot(aiNewHead.x - p.x, aiNewHead.y - p.y);
          if (d < 20) {
            // AI Dies - turn to food
            ai.points.forEach((pt, j) => {
              if (j % 5 === 0) food.push(createFood(pt.x, pt.y, 8));
            });
            Object.assign(ai, createAISnake(ai.id));
          }
        }
      });
    });

    // Player Death checks
    // 1. Boundary
    if (newHead.x < 0 || newHead.x > width || newHead.y < 0 || newHead.y > height) {
      setGameOver(true);
      if (score > highScore) setHighScore(score);
      return;
    }

    // 2. Collision with AI bodies
    aiSnakes.forEach(ai => {
      ai.points.forEach(p => {
        const d = Math.hypot(newHead.x - p.x, newHead.y - p.y);
        if (d < 20) {
          setGameOver(true);
          if (score > highScore) setHighScore(score);
        }
      });
    });

    // Update Player body
    player.points = [newHead, ...player.points.slice(0, -1)];

    // Food collision for player
    gameState.current.food = food.filter(f => {
      const dist = Math.hypot(newHead.x - f.x, newHead.y - f.y);
      if (dist < f.size + 15) {
        setScore(s => s + Math.floor(f.size));
        for(let i=0; i<3; i++) {
          player.points.push({ ...player.points[player.points.length-1] });
        }
        return false;
      }
      return true;
    });

    // Food collision for AI
    aiSnakes.forEach(ai => {
      const aiHead = ai.points[0];
      gameState.current.food = gameState.current.food.filter(f => {
        const dist = Math.hypot(aiHead.x - f.x, aiHead.y - f.y);
        if (dist < f.size + 15) {
          for(let i=0; i<2; i++) {
            ai.points.push({ ...ai.points[ai.points.length-1] });
          }
          return false;
        }
        return true;
      });
    });

    if (gameState.current.food.length < 200) {
      gameState.current.food.push(createFood());
    }

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

    const { camera, player, food, width, height, aiSnakes } = gameState.current;

    // Background pattern
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    const gridSize = 150;
    const offX = -camera.x % gridSize;
    const offY = -camera.y % gridSize;

    for (let x = offX; x < canvas.width; x += gridSize) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = offY; y < canvas.height; y += gridSize) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    // Draw Boundary
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 10;
    ctx.strokeRect(-camera.x, -camera.y, width, height);

    // Draw Food
    food.forEach(f => {
      ctx.fillStyle = f.color;
      ctx.beginPath();
      ctx.arc(f.x - camera.x, f.y - camera.y, f.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw AI Snakes
    aiSnakes.forEach(ai => {
      ctx.lineWidth = 15;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = ai.color;
      ctx.beginPath();
      ai.points.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x - camera.x, p.y - camera.y);
        else ctx.lineTo(p.x - camera.x, p.y - camera.y);
      });
      ctx.stroke();
      
      // AI Name
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = 'bold 10px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(ai.name, ai.points[0].x - camera.x, ai.points[0].y - camera.y - 20);
    });

    // Draw Player
    ctx.lineWidth = 20;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = player.color;
    ctx.beginPath();
    player.points.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x - camera.x, p.y - camera.y);
      else ctx.lineTo(p.x - camera.x, p.y - camera.y);
    });
    ctx.stroke();

    // Draw Head
    const head = player.points[0];
    ctx.fillStyle = '#60a5fa';
    ctx.beginPath();
    ctx.arc(head.x - camera.x, head.y - camera.y, 12, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = 'white';
    const eyeOffset = 6;
    const eyeX1 = head.x - camera.x + Math.cos(player.angle + 0.5) * eyeOffset;
    const eyeY1 = head.y - camera.y + Math.sin(player.angle + 0.5) * eyeOffset;
    const eyeX2 = head.x - camera.x + Math.cos(player.angle - 0.5) * eyeOffset;
    const eyeY2 = head.y - camera.y + Math.sin(player.angle - 0.5) * eyeOffset;
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
