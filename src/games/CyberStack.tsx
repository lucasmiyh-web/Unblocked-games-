import React, { useState, useEffect, useRef } from 'react';

interface Block {
  x: number;
  y: number;
  width: number;
  height: number;
  depth: number;
  color: string;
}

export default function CyberStack() {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const state = useRef({
    blocks: [] as Block[],
    currentBlock: null as Block | null,
    direction: 1,
    speed: 2,
    baseWidth: 200,
    baseDepth: 200,
    cameraY: 0,
    targetCameraY: 0,
    hue: 200
  });

  useEffect(() => {
    init();
    const loop = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(loop);
  }, []);

  const init = () => {
    state.current.blocks = [
      { x: 0, y: 0, width: 200, height: 40, depth: 200, color: 'hsl(200, 70%, 50%)' }
    ];
    state.current.currentBlock = { x: -300, y: 40, width: 200, height: 40, depth: 200, color: 'hsl(205, 70%, 50%)' };
    state.current.direction = 1;
    state.current.speed = 2;
    state.current.cameraY = 0;
    state.current.targetCameraY = 0;
    state.current.hue = 200;
    setScore(0);
    setGameOver(false);
  };

  const handleAction = () => {
    if (gameOver) {
      init();
      return;
    }

    const { blocks, currentBlock } = state.current;
    if (!currentBlock) return;

    const lastBlock = blocks[blocks.length - 1];
    const diff = currentBlock.x - lastBlock.x;
    const absDiff = Math.abs(diff);

    if (absDiff >= lastBlock.width) {
      setGameOver(true);
      if (score > highScore) setHighScore(score);
      return;
    }

    // Slice block
    const newWidth = lastBlock.width - absDiff;
    const newX = diff > 0 ? currentBlock.x : lastBlock.x;
    
    const placedBlock = {
      ...currentBlock,
      x: diff > 0 ? lastBlock.x + diff / 2 : lastBlock.x - absDiff / 2, // simplified visual
      width: newWidth,
      color: currentBlock.color
    };
    
    // Correct visual x for stacking logic
    const visualPlacedBlock = {
      ...currentBlock,
      x: diff > 0 ? lastBlock.x + diff/2 : currentBlock.x + absDiff/2, // this is tricky in 2D
      width: newWidth
    };

    // simplified: just keep it simple for 2D stacking
    const finalPlaced = {
      ...currentBlock,
      x: diff > 0 ? currentBlock.x - diff/2 : currentBlock.x,
      width: newWidth
    };

    // Correct logic for 2D stacking:
    const overlapX = Math.max(lastBlock.x, currentBlock.x);
    const overlapEnd = Math.min(lastBlock.x + lastBlock.width, currentBlock.x + currentBlock.width);
    const finalWidth = overlapEnd - overlapX;
    
    const stackBlock = {
      ...currentBlock,
      x: overlapX,
      width: finalWidth
    };

    state.current.blocks.push(stackBlock);
    setScore(s => s + 1);

    // New block setup
    state.current.hue = (state.current.hue + 5) % 360;
    state.current.currentBlock = {
      x: (blocks.length % 2 === 0) ? -400 : 400,
      y: (blocks.length + 1) * 40,
      width: finalWidth,
      height: 40,
      depth: 200,
      color: `hsl(${state.current.hue}, 70%, 50%)`
    };
    state.current.direction = (blocks.length % 2 === 0) ? 1 : -1;
    state.current.speed += 0.1;
    state.current.targetCameraY = blocks.length * 40 - 200;
  };

  const gameLoop = () => {
    update();
    draw();
    requestAnimationFrame(gameLoop);
  };

  const update = () => {
    if (gameOver) return;

    const { currentBlock, direction, speed, targetCameraY } = state.current;
    if (currentBlock) {
      currentBlock.x += direction * speed;
      if (currentBlock.x > 400 || currentBlock.x < -400) {
        state.current.direction *= -1;
      }
    }

    // Smooth camera
    state.current.cameraY += (targetCameraY - state.current.cameraY) * 0.1;
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 600;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height - 100 + state.current.cameraY);

    // Draw blocks
    state.current.blocks.forEach((b, i) => {
      // Fake 3D effect
      ctx.fillStyle = b.color;
      ctx.fillRect(b.x, -b.y, b.width, b.height);
      
      // Top face highlight
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fillRect(b.x, -b.y - 5, b.width, 5);
      
      // Side shadow
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fillRect(b.x + b.width - 10, -b.y, 10, b.height);
    });

    // Current block
    if (state.current.currentBlock && !gameOver) {
      const b = state.current.currentBlock;
      ctx.fillStyle = b.color;
      ctx.fillRect(b.x, -b.y, b.width, b.height);
      
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fillRect(b.x, -b.y - 5, b.width, 5);
    }

    ctx.restore();
  };

  return (
    <div 
      className="relative w-full h-full bg-slate-900 flex items-center justify-center cursor-pointer select-none"
      onClick={handleAction}
    >
      <canvas 
        ref={canvasRef} 
        style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
      />

      {/* UI */}
      <div className="absolute top-10 left-10 text-white">
        <div className="text-[10px] font-black opacity-50 uppercase tracking-[0.2em] mb-1">CURRENT FLOOR</div>
        <div className="text-6xl font-black italic tracking-tighter">{score}</div>
      </div>

      <div className="absolute top-10 right-10 text-right">
        <div className="px-6 py-2 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20">
          CYBER STACK / V1.0
        </div>
      </div>

      {gameOver && (
        <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-6 z-50">
          <div className="max-w-sm w-full bg-white rounded-[3rem] p-12 text-center shadow-2xl">
            <div className="text-5xl mb-6">📉</div>
            <h2 className="text-4xl font-black text-slate-900 mb-2 uppercase tracking-tighter italic">COLLAPSED</h2>
            <p className="text-slate-500 font-medium mb-8">The core structural integrity has been compromised.</p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-50 p-4 rounded-3xl">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">SCORE</div>
                <div className="text-2xl font-black text-blue-600">{score}</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-3xl">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">RECORD</div>
                <div className="text-2xl font-black text-slate-900">{highScore}</div>
              </div>
            </div>

            <button 
              onClick={(e) => { e.stopPropagation(); init(); }}
              className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all"
            >
              TRY AGAIN
            </button>
          </div>
        </div>
      )}

      {!gameOver && score === 0 && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
          <div className="px-8 py-4 bg-white text-slate-900 rounded-full font-black uppercase tracking-widest text-sm shadow-2xl animate-bounce">
            Click to stack!
          </div>
        </div>
      )}
    </div>
  );
}
