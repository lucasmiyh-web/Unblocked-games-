import React, { useState, useEffect, useRef } from 'react';
import { 
  Trophy, 
  Play, 
  Pause,
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Shield, 
  Zap, 
  Sparkles, 
  Gamepad2, 
  Tv, 
  Activity, 
  Award, 
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Info,
  Flame,
  Bomb
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Point = { x: number; y: number };

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  size: number;
  decay: number;
}

interface Obstacle {
  x: number;
  y: number;
}

interface LeaderboardEntry {
  name: string;
  score: number;
  mode: string;
  theme: string;
  date: string;
}

interface ThemeConfig {
  id: string;
  name: string;
  bg: string;
  panelBg: string;
  accent: string;
  accentGlow: string;
  snakeHead: string;
  snakeBody: string;
  foodColor: string;
  gridColor: string;
}

const THEMES: ThemeConfig[] = [
  {
    id: 'neon',
    name: 'Cyber Neon',
    bg: '#090d16',
    panelBg: 'rgba(15, 23, 42, 0.45)',
    accent: '#22c55e',
    accentGlow: 'rgba(34, 197, 94, 0.4)',
    snakeHead: '#10b981',
    snakeBody: '#34d399',
    foodColor: '#f43f5e',
    gridColor: 'rgba(30, 41, 59, 0.4)'
  },
  {
    id: 'vaporwave',
    name: 'Vapor Sunset',
    bg: '#18022c',
    panelBg: 'rgba(59, 7, 100, 0.35)',
    accent: '#ec4899',
    accentGlow: 'rgba(236, 72, 153, 0.4)',
    snakeHead: '#ec4899',
    snakeBody: '#a855f7',
    foodColor: '#eab308',
    gridColor: 'rgba(107, 33, 168, 0.4)'
  },
  {
    id: 'amber',
    name: 'Retro Terminal',
    bg: '#1c1917',
    panelBg: 'rgba(41, 37, 36, 0.45)',
    accent: '#f59e0b',
    accentGlow: 'rgba(245, 158, 11, 0.4)',
    snakeHead: '#f59e0b',
    snakeBody: '#fbbf24',
    foodColor: '#10b981',
    gridColor: 'rgba(68, 64, 60, 0.4)'
  },
  {
    id: 'matrix',
    name: 'Matrix Code',
    bg: '#020617',
    panelBg: 'rgba(6, 78, 59, 0.25)',
    accent: '#22c55e',
    accentGlow: 'rgba(34, 197, 94, 0.5)',
    snakeHead: '#00ff00',
    snakeBody: '#059669',
    foodColor: '#ffffff',
    gridColor: 'rgba(4, 120, 87, 0.3)'
  },
  {
    id: 'blizzard',
    name: 'Glacial Chill',
    bg: '#030712',
    panelBg: 'rgba(17, 24, 39, 0.45)',
    accent: '#3b82f6',
    accentGlow: 'rgba(59, 130, 246, 0.4)',
    snakeHead: '#3b82f6',
    snakeBody: '#93c5fd',
    foodColor: '#f43f5e',
    gridColor: 'rgba(30, 41, 59, 0.4)'
  }
];

export default function RetroSnake() {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activeTheme, setActiveTheme] = useState<ThemeConfig>(THEMES[0]);
  const [gameMode, setGameMode] = useState<'classic' | 'infinity' | 'portal'>('classic');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [crtFilter, setCrtFilter] = useState(true);
  const [isShieldActive, setIsShieldActive] = useState(false);
  const [isHyperdriveActive, setIsHyperdriveActive] = useState(false);
  const [hasAmmo, setHasAmmo] = useState(0);
  const [playerName, setPlayerName] = useState('ANON_RUNNER');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Timers for power-ups
  const [shieldTimer, setShieldTimer] = useState(0);
  const [hyperdriveTimer, setHyperdriveTimer] = useState(0);
  const [goldenTimer, setGoldenTimer] = useState(0);
  const [foodCount, setFoodCount] = useState<number>(3); // Customizable fruit count, max 10

  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Game simulation state references
  const gameState = useRef({
    snake: [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }] as Point[],
    previousSnake: [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }] as Point[],
    direction: { x: 1, y: 0 } as Point,
    nextDirection: { x: 1, y: 0 } as Point,
    foods: [] as { x: number; y: number; type: 'normal' | 'golden' | 'shield' | 'hyperdrive' | 'ammo' }[],
    goldenFood: null as Point | null,
    obstacles: [] as Obstacle[],
    portals: [] as Point[], // Linked portal A & B
    laserProjectiles: [] as { x: number; y: number; vx: number; vy: number }[],
    particles: [] as Particle[],
    screenShake: 0,
    gridSize: 20,
    tileCount: 20,
    tickCount: 0,
    isShield: false,
    isHyperdrive: false,
    ammoCount: 0,
    foodCount: 3
  });

  // Load stats & scoreboard from localStorage
  useEffect(() => {
    const savedHighScore = localStorage.getItem('cyber_snake_highscore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }

    const savedBoard = localStorage.getItem('cyber_snake_leaderboard');
    if (savedBoard) {
      try {
        setLeaderboard(JSON.parse(savedBoard));
      } catch (e) {
        console.error("Failed to parse leaderboard:", e);
      }
    } else {
      const defaultBoard: LeaderboardEntry[] = [
        { name: 'KAI_99', score: 250, mode: 'classic', theme: 'Cyber Neon', date: '6/25/2026' },
        { name: 'GHOST_SYS', score: 180, mode: 'portal', theme: 'Matrix Code', date: '6/24/2026' },
        { name: 'CHIPS', score: 120, mode: 'infinity', theme: 'Vapor Sunset', date: '6/23/2026' }
      ];
      setLeaderboard(defaultBoard);
      localStorage.setItem('cyber_snake_leaderboard', JSON.stringify(defaultBoard));
    }
  }, []);

  // Sync state parameters to ref to prevent stale closuring inside game loop
  useEffect(() => {
    gameState.current.isShield = isShieldActive;
    gameState.current.isHyperdrive = isHyperdriveActive;
    gameState.current.ammoCount = hasAmmo;
    gameState.current.foodCount = foodCount;

    // Adjust food count on the map dynamically when slider value changes
    if (!gameOver && !isPaused) {
      relocateFood(foodCount);
    }
  }, [isShieldActive, isHyperdriveActive, hasAmmo, foodCount, gameOver, isPaused]);

  // Audio helper using Web Audio API Synthesizer
  const playSynthSound = (type: string) => {
    if (isMuted) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      const now = ctx.currentTime;
      
      if (type === 'eat') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(640, now + 0.08);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'gold') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.04); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.08); // G5
        osc.frequency.setValueAtTime(1046.50, now + 0.12); // C6
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.38);
      } else if (type === 'powerup') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(720, now + 0.22);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'portal') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.linearRampToValueAtTime(200, now + 0.18);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'die') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(30, now + 0.5);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.55);
        osc.start(now);
        osc.stop(now + 0.6);
      } else if (type === 'shoot') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.12);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'hit') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.setValueAtTime(45, now + 0.04);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.04);
      }
    } catch (e) {
      console.warn("Audio Context block:", e);
    }
  };

  // Build random Obstacles
  const generateObstacles = () => {
    const list: Obstacle[] = [];
    if (gameMode === 'portal') {
      // Create obstacles (blocks) in central regions
      const blockCoords = [
        { x: 5, y: 5 }, { x: 5, y: 6 }, { x: 5, y: 7 },
        { x: 14, y: 5 }, { x: 14, y: 6 }, { x: 14, y: 7 },
        { x: 5, y: 12 }, { x: 5, y: 13 }, { x: 5, y: 14 },
        { x: 14, y: 12 }, { x: 14, y: 13 }, { x: 14, y: 14 }
      ];
      list.push(...blockCoords);
    }
    return list;
  };

  // Build linked Portals
  const generatePortals = () => {
    if (gameMode === 'portal') {
      return [
        { x: 2, y: 10 },  // Portal A (Orange/Purple)
        { x: 17, y: 10 }  // Portal B (Violet/Cyan)
      ];
    }
    return [];
  };

  // Spawns particle explosions on exact tiles
  const spawnExplosion = (x: number, y: number, color: string, count: number = 8) => {
    const s = gameState.current;
    const px = x * s.gridSize + s.gridSize / 2;
    const py = y * s.gridSize + s.gridSize / 2;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.2 + Math.random() * 2.5;
      s.particles.push({
        x: px,
        y: py,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        alpha: 1.0,
        size: 2.5 + Math.random() * 3,
        decay: 0.03 + Math.random() * 0.04
      });
    }
  };

  // Start / restart game settings
  const resetGame = () => {
    const s = gameState.current;
    s.snake = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 }
    ];
    s.previousSnake = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 }
    ];
    s.direction = { x: 1, y: 0 };
    s.nextDirection = { x: 1, y: 0 };
    s.particles = [];
    s.laserProjectiles = [];
    s.obstacles = generateObstacles();
    s.portals = generatePortals();
    s.foods = []; // Clear previous foods on reset

    // Place starting foods safely
    relocateFood();
    
    setScore(0);
    setIsShieldActive(false);
    setIsHyperdriveActive(false);
    setHasAmmo(0);
    setShieldTimer(0);
    setHyperdriveTimer(0);
    setGoldenTimer(0);
    setGameOver(false);
    setIsPaused(false);
    playSynthSound('click');
  };

  // Relocate / refill foods safely avoiding snake body, walls, obstacles, and existing foods
  const relocateFood = (customCount?: number) => {
    const s = gameState.current;
    const targetCount = customCount !== undefined ? customCount : (s.foodCount || 1);

    // Remove extra food if foodCount was decreased
    if (s.foods.length > targetCount) {
      s.foods = s.foods.slice(0, targetCount);
    }

    // Add new food items if we are under targetCount
    while (s.foods.length < targetCount) {
      let placed = false;
      let attempts = 0;

      // Pick random food type probabilities
      const rng = Math.random();
      let type: 'normal' | 'golden' | 'shield' | 'hyperdrive' | 'ammo' = 'normal';
      if (rng < 0.12) {
        type = 'golden';
      } else if (rng < 0.20) {
        type = 'shield';
      } else if (rng < 0.28) {
        type = 'hyperdrive';
      } else if (rng < 0.35) {
        type = 'ammo';
      }

      while (!placed && attempts < 150) {
        attempts++;
        const candidate = {
          x: Math.floor(Math.random() * s.tileCount),
          y: Math.floor(Math.random() * s.tileCount)
        };

        // Check if collides with snake
        const inSnake = s.snake.some(seg => seg.x === candidate.x && seg.y === candidate.y);
        // Check if collides with obstacles
        const inObstacle = s.obstacles.some(obs => obs.x === candidate.x && obs.y === candidate.y);
        // Check if collides with portals
        const inPortal = s.portals.some(p => p.x === candidate.x && p.y === candidate.y);
        // Check if collides with existing food items
        const inFoods = s.foods.some(f => f.x === candidate.x && f.y === candidate.y);

        if (!inSnake && !inObstacle && !inPortal && !inFoods) {
          s.foods.push({ x: candidate.x, y: candidate.y, type });
          placed = true;
          if (type === 'golden') {
            setGoldenTimer(6); // stay for 6 seconds
          }
        }
      }

      if (attempts >= 150 && !placed) {
        break; // safety exit
      }
    }
  };

  // Input controller
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver) return;
      const s = gameState.current;

      // Handle pause on Escape or P keys
      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        setIsPaused(prev => !prev);
        playSynthSound('click');
        return;
      }

      if (isPaused) return;

      // Directions controls
      if ((e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') && s.direction.y === 0) {
        s.nextDirection = { x: 0, y: -1 };
        e.preventDefault();
      }
      if ((e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') && s.direction.y === 0) {
        s.nextDirection = { x: 0, y: 1 };
        e.preventDefault();
      }
      if ((e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') && s.direction.x === 0) {
        s.nextDirection = { x: -1, y: 0 };
        e.preventDefault();
      }
      if ((e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') && s.direction.x === 0) {
        s.nextDirection = { x: 1, y: 0 };
        e.preventDefault();
      }

      // Shoot trigger
      if (e.key === ' ' || e.key === 'Spacebar') {
        if (s.ammoCount > 0) {
          fireLaser();
        }
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver, isPaused]);

  // Handle firing a retro plasma bullet
  const fireLaser = () => {
    const s = gameState.current;
    if (s.ammoCount <= 0) return;
    
    // Projectile originates from head
    const head = s.snake[0];
    s.laserProjectiles.push({
      x: head.x,
      y: head.y,
      vx: s.direction.x,
      vy: s.direction.y
    });

    setHasAmmo(prev => Math.max(0, prev - 1));
    s.screenShake = 6;
    playSynthSound('shoot');
  };

  // Main game logic loop using high FPS drawing combined with game ticks
  useEffect(() => {
    resetGame();

    let animationId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const elapsed = now - lastTime;
      const s = gameState.current;

      // Frame Rate independent visuals (Particles & Lasers)
      updateVisuals();

      // Snake logic ticker speed configuration based on difficulty & hyperdrive state
      let baseSpeed = difficulty === 'easy' ? 140 : difficulty === 'medium' ? 100 : 70;
      if (isHyperdriveActive) {
        baseSpeed = baseSpeed * 0.65; // speed boosted
      }

      const progress = (gameOver || isPaused) ? 1.0 : Math.min(1.0, elapsed / baseSpeed);
      drawGame(progress);

      if (elapsed >= baseSpeed) {
        lastTime = now;
        if (!gameOver && !isPaused) {
          gameTick();
        }
      }

      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationId);
  }, [gameMode, difficulty, isPaused, gameOver]);

  // Timers countdown ticker
  useEffect(() => {
    if (gameOver || isPaused) return;

    const interval = setInterval(() => {
      // Shield timer
      setShieldTimer(prev => {
        if (prev <= 1) {
          setIsShieldActive(false);
          return 0;
        }
        return prev - 1;
      });

      // Hyperdrive speed timer
      setHyperdriveTimer(prev => {
        if (prev <= 1) {
          setIsHyperdriveActive(false);
          return 0;
        }
        return prev - 1;
      });

      // Golden apple timer
      setGoldenTimer(prev => {
        if (prev <= 1) {
          // If expired, replace golden foods with normal food
          const s = gameState.current;
          s.foods.forEach(f => {
            if (f.type === 'golden') {
              f.type = 'normal';
            }
          });
          return 0;
        }
        return prev - 1;
      });

    }, 1000);

    return () => clearInterval(interval);
  }, [gameOver, isPaused]);

  // Handle continuous smooth visual effects like laser positions & decay of explosion particles
  const updateVisuals = () => {
    const s = gameState.current;

    // Laser bullets motion
    for (let i = s.laserProjectiles.length - 1; i >= 0; i--) {
      const laser = s.laserProjectiles[i];
      // Update bullet position
      laser.x += laser.vx * 0.25; 
      laser.y += laser.vy * 0.25;

      // Obstacle collision check
      const hitObsIdx = s.obstacles.findIndex(obs => 
        Math.round(laser.x) === obs.x && Math.round(laser.y) === obs.y
      );

      if (hitObsIdx !== -1) {
        // Vaporize the obstacle!
        const hitObs = s.obstacles[hitObsIdx];
        s.obstacles.splice(hitObsIdx, 1);
        spawnExplosion(hitObs.x, hitObs.y, '#eab308', 15);
        s.screenShake = 12;
        s.laserProjectiles.splice(i, 1);
        playSynthSound('hit');
        continue;
      }

      // Check boundary limits
      if (laser.x < 0 || laser.x >= s.tileCount || laser.y < 0 || laser.y >= s.tileCount) {
        s.laserProjectiles.splice(i, 1);
      }
    }

    // Particles simulation
    for (let i = s.particles.length - 1; i >= 0; i--) {
      const p = s.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;
      if (p.alpha <= 0) {
        s.particles.splice(i, 1);
      }
    }

    // Dampen screenshake
    if (s.screenShake > 0) {
      s.screenShake *= 0.85;
      if (s.screenShake < 0.1) s.screenShake = 0;
    }
  };

  // Step ticker logic for Grid positions of Snake body
  const gameTick = () => {
    const s = gameState.current;
    s.previousSnake = s.snake.map(p => ({ ...p }));
    s.direction = s.nextDirection;

    // Calculate snake head candidate position
    const head = { 
      x: s.snake[0].x + s.direction.x, 
      y: s.snake[0].y + s.direction.y 
    };

    // Portal logic check before any wall boundary death checks
    let portalWarped = false;
    if (gameMode === 'portal' && s.portals.length === 2) {
      const pA = s.portals[0];
      const pB = s.portals[1];

      if (head.x === pA.x && head.y === pA.y) {
        // Teleport to Portal B exit
        head.x = pB.x + s.direction.x;
        head.y = pB.y + s.direction.y;
        portalWarped = true;
      } else if (head.x === pB.x && head.y === pB.y) {
        // Teleport to Portal A exit
        head.x = pA.x + s.direction.x;
        head.y = pA.y + s.direction.y;
        portalWarped = true;
      }

      if (portalWarped) {
        s.screenShake = 5;
        playSynthSound('portal');
        spawnExplosion(head.x, head.y, '#a855f7', 10);
      }
    }

    // Boundary wrap / collision handler
    if (gameMode === 'infinity' || s.isShield) {
      // Safe Wrap on edges
      if (head.x < 0) head.x = s.tileCount - 1;
      if (head.x >= s.tileCount) head.x = 0;
      if (head.y < 0) head.y = s.tileCount - 1;
      if (head.y >= s.tileCount) head.y = 0;
    } else {
      // Deadly Wall collision check
      if (head.x < 0 || head.x >= s.tileCount || head.y < 0 || head.y >= s.tileCount) {
        triggerDeath();
        return;
      }
    }

    // Static block obstacles crash check
    const crashObstacle = s.obstacles.some(obs => obs.x === head.x && obs.y === head.y);
    if (crashObstacle) {
      if (s.isShield) {
        // Destroy obstacle block seamlessly via shield bubble
        s.obstacles = s.obstacles.filter(obs => obs.x !== head.x || obs.y !== head.y);
        spawnExplosion(head.x, head.y, '#fbbf24', 12);
        playSynthSound('hit');
        s.screenShake = 6;
      } else {
        triggerDeath();
        return;
      }
    }

    // Self body bite collision check
    const bitSelf = s.snake.some(segment => segment.x === head.x && segment.y === head.y);
    if (bitSelf) {
      if (s.isShield) {
        // Strobe shield particles warning instead of death
        spawnExplosion(head.x, head.y, '#a855f7', 4);
        playSynthSound('hit');
      } else {
        triggerDeath();
        return;
      }
    }

    // Prepend new head segment
    const newSnake = [head, ...s.snake];

    // Food target check
    const eatenFoodIdx = s.foods.findIndex(f => head.x === f.x && head.y === f.y);
    if (eatenFoodIdx !== -1) {
      const eatenFood = s.foods[eatenFoodIdx];
      
      // Apply correct scores based on food type collected
      let pointsEarned = 10;
      if (eatenFood.type === 'golden') {
        pointsEarned = 30;
        playSynthSound('gold');
        spawnExplosion(eatenFood.x, eatenFood.y, '#fbbf24', 16);
      } else if (eatenFood.type === 'shield') {
        setIsShieldActive(true);
        setShieldTimer(8); // 8 seconds shield phase duration
        playSynthSound('powerup');
        spawnExplosion(eatenFood.x, eatenFood.y, '#a855f7', 12);
      } else if (eatenFood.type === 'hyperdrive') {
        setIsHyperdriveActive(true);
        setHyperdriveTimer(8); // 8 seconds lightning speed
        playSynthSound('powerup');
        spawnExplosion(eatenFood.x, eatenFood.y, '#06b6d4', 12);
      } else if (eatenFood.type === 'ammo') {
        setHasAmmo(prev => prev + 3);
        playSynthSound('powerup');
        spawnExplosion(eatenFood.x, eatenFood.y, '#f59e0b', 12);
      } else {
        playSynthSound('eat');
        spawnExplosion(eatenFood.x, eatenFood.y, activeTheme.accent, 10);
      }

      // Hyperdrive score boost logic multiplier
      if (isHyperdriveActive) {
        pointsEarned = pointsEarned * 2;
      }

      setScore(sc => sc + pointsEarned);
      s.screenShake = eatenFood.type === 'golden' ? 7 : 2;

      // Remove the eaten food item
      s.foods.splice(eatenFoodIdx, 1);

      // Spawn next food target
      relocateFood();
    } else {
      // Maintain regular snake pacing by popping out the end segment tail
      newSnake.pop();
    }

    s.snake = newSnake;
  };

  // Triggers game over with system failure states
  const triggerDeath = () => {
    const s = gameState.current;
    setGameOver(true);
    s.screenShake = 16;
    playSynthSound('die');
    
    // Spawn massive beautiful particle burst at death location
    if (s.snake.length > 0) {
      const h = s.snake[0];
      spawnExplosion(h.x, h.y, '#ef4444', 35);
    }

    // Save local records
    const finalScore = score;
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('cyber_snake_highscore', finalScore.toString());
      playSynthSound('gold');
    }

    // Save to leaderboard
    const entry: LeaderboardEntry = {
      name: playerName.substring(0, 15) || 'ANON_RUNNER',
      score: finalScore,
      mode: gameMode,
      theme: activeTheme.name,
      date: new Date().toLocaleDateString()
    };

    const updatedLeaderboard = [entry, ...leaderboard].slice(0, 10); // Keep top 10
    setLeaderboard(updatedLeaderboard);
    localStorage.setItem('cyber_snake_leaderboard', JSON.stringify(updatedLeaderboard));
  };

  // Canvas visual rendering logic
  const drawGame = (progress = 1.0) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const s = gameState.current;
    const t = activeTheme;

    // Helper for wrap-aware interpolation
    const getInterpolatedPoint = (start: Point, target: Point, p: number, tileCount: number) => {
      let dx = target.x - start.x;
      let dy = target.y - start.y;

      // Handle wrap-around for X
      if (dx < -tileCount / 2) {
        dx += tileCount;
      } else if (dx > tileCount / 2) {
        dx -= tileCount;
      }

      // Handle wrap-around for Y
      if (dy < -tileCount / 2) {
        dy += tileCount;
      } else if (dy > tileCount / 2) {
        dy -= tileCount;
      }

      // Check if it's a portal warp (large teleportation distance)
      if (Math.abs(dx) > 1.5 || Math.abs(dy) > 1.5) {
        return { x: target.x, y: target.y };
      }

      let x = start.x + dx * p;
      let y = start.y + dy * p;

      if (x < 0) x += tileCount;
      if (x >= tileCount) x -= tileCount;
      if (y < 0) y += tileCount;
      if (y >= tileCount) y -= tileCount;

      return { x, y };
    };

    ctx.save();

    // 1. Screenshake effect matrix translate
    if (s.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * s.screenShake;
      const shakeY = (Math.random() - 0.5) * s.screenShake;
      ctx.translate(shakeX, shakeY);
    }

    // 2. Clear background black panel
    ctx.fillStyle = t.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 3. Ambient grid line graphics
    ctx.strokeStyle = t.gridColor;
    ctx.lineWidth = 1;
    for (let i = 0; i <= s.tileCount; i++) {
      // Vertical grid line
      ctx.beginPath();
      ctx.moveTo(i * s.gridSize, 0);
      ctx.lineTo(i * s.gridSize, canvas.height);
      ctx.stroke();

      // Horizontal grid line
      ctx.beginPath();
      ctx.moveTo(0, i * s.gridSize);
      ctx.lineTo(canvas.width, i * s.gridSize);
      ctx.stroke();
    }

    // 4. Draw static block barriers (Obstacles)
    s.obstacles.forEach(obs => {
      const x = obs.x * s.gridSize;
      const y = obs.y * s.gridSize;

      // Drop shadows on obstacle block
      ctx.shadowBlur = 6;
      ctx.shadowColor = '#64748b';
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.roundRect(x + 1.5, y + 1.5, s.gridSize - 3, s.gridSize - 3, 4);
      ctx.fill();

      // Metallic top cap border glow
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(x + 3, y + 3, s.gridSize - 6, s.gridSize - 6);
    });

    // 5. Draw interactive link portals
    if (gameMode === 'portal' && s.portals.length === 2) {
      s.portals.forEach((p, idx) => {
        const px = p.x * s.gridSize + s.gridSize / 2;
        const py = p.y * s.gridSize + s.gridSize / 2;
        const portalColor = idx === 0 ? '#ec4899' : '#06b6d4';

        // Pulse size based on ticks
        const pulse = 1.5 * Math.sin(Date.now() / 150);
        
        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = portalColor;
        ctx.strokeStyle = portalColor;
        ctx.lineWidth = 3;

        // Draw orbital stargate ring
        ctx.beginPath();
        ctx.arc(px, py, (s.gridSize / 1.5) + pulse, 0, Math.PI * 2);
        ctx.stroke();

        // Inner glowing core
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(px, py, s.gridSize / 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });
    }

    // 6. Draw glowing retro food items
    const size = s.gridSize;

    s.foods.forEach((foodItem) => {
      const fx = foodItem.x * s.gridSize;
      const fy = foodItem.y * s.gridSize;

      ctx.save();
      
      // Choose food glow color based on current random food type
      let foodGlowColor = t.foodColor;
      if (foodItem.type === 'golden') foodGlowColor = '#fbbf24';
      else if (foodItem.type === 'shield') foodGlowColor = '#a855f7';
      else if (foodItem.type === 'hyperdrive') foodGlowColor = '#06b6d4';
      else if (foodItem.type === 'ammo') foodGlowColor = '#f59e0b';

      ctx.shadowBlur = 18;
      ctx.shadowColor = foodGlowColor;
      ctx.fillStyle = foodGlowColor;

      // Pulse size factor for food item
      const scaleFactor = 1.0 + 0.15 * Math.sin((Date.now() + (foodItem.x * 100) + (foodItem.y * 50)) / 120);
      const offset = (size - (size * scaleFactor)) / 2;

      if (foodItem.type === 'golden') {
        // Golden star layout
        ctx.beginPath();
        const cx = fx + size / 2;
        const cy = fy + size / 2;
        const r = (size / 2 - 2) * scaleFactor;
        for (let j = 0; j < 5; j++) {
          ctx.lineTo(cx + r * Math.cos((18 + j * 72) * Math.PI / 180), cy - r * Math.sin((18 + j * 72) * Math.PI / 180));
          ctx.lineTo(cx + (r/2) * Math.cos((54 + j * 72) * Math.PI / 180), cy - (r/2) * Math.sin((54 + j * 72) * Math.PI / 180));
        }
        ctx.closePath();
        ctx.fill();
      } else if (foodItem.type === 'shield') {
        // Shield crest shape layout
        ctx.beginPath();
        const cx = fx + size / 2;
        const cy = fy + size / 2;
        const half = (size / 2 - 2) * scaleFactor;
        ctx.moveTo(cx, cy - half);
        ctx.lineTo(cx + half, cy - half * 0.4);
        ctx.lineTo(cx + half * 0.7, cy + half * 0.8);
        ctx.lineTo(cx, cy + half);
        ctx.lineTo(cx - half * 0.7, cy + half * 0.8);
        ctx.lineTo(cx - half, cy - half * 0.4);
        ctx.closePath();
        ctx.fill();
      } else if (foodItem.type === 'hyperdrive') {
        // Lightning bolt shape layout
        ctx.beginPath();
        const cx = fx + size / 2;
        const cy = fy + size / 2;
        const h = (size / 2 - 1) * scaleFactor;
        ctx.moveTo(cx + h * 0.2, cy - h);
        ctx.lineTo(cx - h * 0.6, cy + h * 0.1);
        ctx.lineTo(cx, cy + h * 0.1);
        ctx.lineTo(cx - h * 0.2, cy + h);
        ctx.lineTo(cx + h * 0.6, cy - h * 0.1);
        ctx.lineTo(cx, cy - h * 0.1);
        ctx.closePath();
        ctx.fill();
      } else if (foodItem.type === 'ammo') {
        // Core cluster bullets shape layout
        const cx = fx + size / 2;
        const cy = fy + size / 2;
        const r = 3.5 * scaleFactor;
        ctx.beginPath(); ctx.arc(cx - 3, cy + 3, r, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + 3, cy + 3, r, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx, cy - 3, r, 0, Math.PI * 2); ctx.fill();
      } else {
        // Regular glowing neon cherry apple circle
        ctx.beginPath();
        ctx.arc(fx + size / 2, fy + size / 2, (size / 2 - 2.5) * scaleFactor, 0, Math.PI * 2);
        ctx.fill();

        // Highlight reflex dot
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(fx + size / 2.8, fy + size / 2.8, 1.8 * scaleFactor, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    // 7. Draw expressive modular snake segments
    const interpSnake: Point[] = [];
    s.snake.forEach((segment, i) => {
      const prevSegment = s.previousSnake && s.previousSnake[i] ? s.previousSnake[i] : segment;
      const pt = getInterpolatedPoint(prevSegment, segment, progress, s.tileCount);
      interpSnake.push(pt);
    });

    // Draw connecting lines between consecutive segments to make the body unified and seamless
    ctx.save();
    for (let i = interpSnake.length - 2; i >= 0; i--) {
      const p1 = interpSnake[i];
      const p2 = interpSnake[i + 1];

      // Check distance in grid space to prevent drawing wrapping line across screen
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      if (Math.abs(dx) > 1.5 || Math.abs(dy) > 1.5) {
        continue;
      }

      const shrinkFactor = Math.max(0.45, 1 - (i / s.snake.length) * 0.4);
      const segmentSize = s.gridSize * shrinkFactor;

      ctx.save();
      ctx.strokeStyle = s.isShield ? 'rgba(192, 132, 252, 0.85)' : (s.isHyperdrive ? '#06b6d4' : t.snakeBody);
      ctx.lineWidth = segmentSize - 1; // Slightly narrower for perfect joint integration
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.beginPath();
      ctx.moveTo(p1.x * s.gridSize + s.gridSize / 2, p1.y * s.gridSize + s.gridSize / 2);
      ctx.lineTo(p2.x * s.gridSize + s.gridSize / 2, p2.y * s.gridSize + s.gridSize / 2);
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();

    // Draw segment nodes on top
    for (let i = interpSnake.length - 1; i >= 0; i--) {
      const pt = interpSnake[i];
      const sx = pt.x * s.gridSize;
      const sy = pt.y * s.gridSize;
      const isHead = i === 0;

      ctx.save();

      // Tail tapering organic sizing
      const shrinkFactor = Math.max(0.45, 1 - (i / s.snake.length) * 0.4);
      const segmentSize = s.gridSize * shrinkFactor;
      const pad = (s.gridSize - segmentSize) / 2;

      // Glow intensity configurations
      if (isHead) {
        ctx.shadowBlur = 16;
        ctx.shadowColor = s.isShield ? '#c084fc' : t.accent;
        ctx.fillStyle = s.isShield ? '#c084fc' : t.snakeHead;
      } else {
        ctx.shadowBlur = s.isHyperdrive ? 10 : 0;
        ctx.shadowColor = s.isHyperdrive ? '#06b6d4' : t.accent;
        ctx.fillStyle = s.isShield ? 'rgba(192, 132, 252, 0.85)' : (s.isHyperdrive ? '#06b6d4' : t.snakeBody);
      }

      // Draw smooth connected circular joints for an organic fluid feel
      ctx.beginPath();
      ctx.arc(sx + s.gridSize / 2, sy + s.gridSize / 2, segmentSize / 2, 0, Math.PI * 2);
      ctx.fill();

      // Draw shiny mechanical core details inside body segment joints
      if (!isHead && segmentSize > 10) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.arc(sx + s.gridSize / 2, sy + s.gridSize / 2, (segmentSize / 2) - 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw cute expressive eyes facing exact movement vectors
      if (isHead) {
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff'; // White eye bases
        const eyeSize = 3.5;
        const pupilSize = 1.6;

        let eyeL = { x: 0, y: 0 };
        let eyeR = { x: 0, y: 0 };

        // Position eyes according to vector direction
        if (s.direction.x !== 0) {
          // Horizontal motion
          const ex = s.direction.x > 0 ? sx + s.gridSize - 5 : sx + 5;
          eyeL = { x: ex, y: sy + 5 };
          eyeR = { x: ex, y: sy + s.gridSize - 5 };
        } else {
          // Vertical motion
          const ey = s.direction.y > 0 ? sy + s.gridSize - 5 : sy + 5;
          eyeL = { x: sx + 5, y: ey };
          eyeR = { x: sx + s.gridSize - 5, y: ey };
        }

        // Left eye
        ctx.beginPath(); ctx.arc(eyeL.x, eyeL.y, eyeSize, 0, Math.PI * 2); ctx.fill();
        // Right eye
        ctx.beginPath(); ctx.arc(eyeR.x, eyeR.y, eyeSize, 0, Math.PI * 2); ctx.fill();

        // Dark pupils inside
        ctx.fillStyle = '#090d16';
        ctx.beginPath(); ctx.arc(eyeL.x + s.direction.x * 1.2, eyeL.y + s.direction.y * 1.2, pupilSize, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(eyeR.x + s.direction.x * 1.2, eyeR.y + s.direction.y * 1.2, pupilSize, 0, Math.PI * 2); ctx.fill();
      }

      ctx.restore();
    }

    // 8. Draw firing plasma laser bullets
    s.laserProjectiles.forEach(laser => {
      const lx = laser.x * s.gridSize + s.gridSize / 2;
      const ly = laser.y * s.gridSize + s.gridSize / 2;

      ctx.save();
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#eab308';
      ctx.fillStyle = '#fbbf24';

      ctx.beginPath();
      if (laser.vx !== 0) {
        // Horizontal laser lines
        ctx.roundRect(lx - 12, ly - 2.5, 24, 5, 2);
      } else {
        // Vertical laser lines
        ctx.roundRect(lx - 2.5, ly - 12, 5, 24, 2);
      }
      ctx.fill();
      ctx.restore();
    });

    // 9. Render dynamic explosion sparks particles
    s.particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    ctx.restore(); // Restore shaking context transformations
  };

  return (
    <div className="relative w-full min-h-screen bg-[#060810] text-slate-100 font-sans p-4 flex flex-col items-center justify-center overflow-x-hidden selection:bg-purple-500 selection:text-white">
      
      {/* Background Starry Nebula Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(30,41,59,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(30,41,59,0.1)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container Header Board */}
      <div className="w-full max-w-6xl flex flex-col md:flex-row items-stretch gap-6 relative z-10">
        
        {/* LEFT COLUMN: Customizable controller cabinet config */}
        <div className="w-full md:w-80 flex flex-col gap-5 shrink-0">
          
          {/* Neon Logo Card */}
          <div className="p-5 rounded-2xl bg-[#0e1322] border border-slate-800/80 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-xl" />
            
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <Gamepad2 className="w-5 h-5 animate-pulse" />
              </div>
              <span className="text-[9px] font-black text-emerald-400 tracking-[0.25em] uppercase">SYSTEM CORE ENGINE</span>
            </div>

            <h1 className="text-2xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-500 uppercase">
              CYBER SNAKE
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 leading-normal">
              High frequency neon vectors with quantum-linked stargate wormholes.
            </p>
          </div>

          {/* Config Settings Board */}
          <div className="p-5 rounded-2xl bg-[#0e1322] border border-slate-800/80 shadow-lg space-y-4">
            
            <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2">
              <Award className="w-4 h-4 text-purple-400" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">GAMEPLAY MATRIX CONFIG</h3>
            </div>

            {/* Game mode selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">GAME TYPE PORTAL</label>
              <div className="grid grid-cols-3 gap-1">
                {(['classic', 'infinity', 'portal'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => {
                      setGameMode(mode);
                      playSynthSound('click');
                    }}
                    className={`py-1.5 rounded-lg font-black text-[9px] uppercase tracking-wider cursor-pointer border transition-all ${
                      gameMode === mode
                        ? 'bg-purple-600/25 text-purple-300 border-purple-500 shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty settings */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">SPEED INTENSITY</label>
              <div className="grid grid-cols-3 gap-1">
                {(['easy', 'medium', 'hard'] as const).map(diff => (
                  <button
                    key={diff}
                    onClick={() => {
                      setDifficulty(diff);
                      playSynthSound('click');
                    }}
                    className={`py-1.5 rounded-lg font-black text-[9px] uppercase tracking-wider cursor-pointer border transition-all ${
                      difficulty === diff
                        ? 'bg-emerald-600/25 text-emerald-300 border-emerald-500 shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Neon Themes selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">AESTHETIC SCHEME</label>
              <div className="grid grid-cols-2 gap-1.5">
                {THEMES.map(theme => (
                  <button
                    key={theme.id}
                    onClick={() => {
                      setActiveTheme(theme);
                      playSynthSound('click');
                    }}
                    className={`p-1.5 rounded-xl border flex items-center gap-1.5 cursor-pointer text-left transition-all ${
                      activeTheme.id === theme.id
                        ? 'bg-slate-800/80 border-slate-400 text-white'
                        : 'bg-slate-900 border-slate-800/80 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: theme.accent }} />
                    <span className="text-[8px] font-black uppercase tracking-wide truncate">{theme.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Fruit Quantity Slider */}
            <div className="space-y-1.5 pt-1.5 border-t border-slate-800/80">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">FRUIT QUANTITY</label>
                <span className="text-[10px] font-black text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">{foodCount} / 10</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={foodCount}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setFoodCount(val);
                    playSynthSound('click');
                  }}
                  className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>
            </div>

            {/* Screen filter scanlines CRT */}
            <div className="flex items-center justify-between pt-1.5 border-t border-slate-800/80">
              <div className="flex items-center gap-1.5">
                <Tv className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[10px] font-black uppercase text-slate-300 tracking-wider">CRT SCREEN FILTER</span>
              </div>
              <button
                onClick={() => { setCrtFilter(!crtFilter); playSynthSound('click'); }}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer border ${
                  crtFilter ? 'bg-blue-600 border-blue-400' : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${
                  crtFilter ? 'left-5.5' : 'left-1'
                }`} />
              </button>
            </div>

          </div>

          {/* Controls instructions */}
          <div className="p-5 rounded-2xl bg-[#0e1322] border border-slate-800/80 shadow-lg">
            <div className="flex items-center gap-1.5 mb-2.5 border-b border-slate-800/80 pb-2">
              <Info className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[10px] font-black uppercase text-slate-300 tracking-wider">INPUT SCHEMATICS</span>
            </div>

            <div className="space-y-2 text-[9px] font-extrabold uppercase text-slate-400 leading-relaxed">
              <div className="flex justify-between items-center bg-slate-950/40 p-1.5 rounded-lg">
                <span>STEER SNAKE</span>
                <span className="text-white bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">W, A, S, D / 🗲 ARROWS</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950/40 p-1.5 rounded-lg">
                <span>FIRE PROJECTILE</span>
                <span className="text-yellow-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">SPACEBAR</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950/40 p-1.5 rounded-lg">
                <span>PAUSE / RESUME</span>
                <span className="text-white bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">ESC / P</span>
              </div>
            </div>
          </div>

        </div>

        {/* CENTER COLUMN: Interactive CRT Cabinets, active panel counters & touch screens */}
        <div className="flex-1 flex flex-col gap-5 items-center justify-center">
          
          {/* Top Panel active gauges */}
          <div className="w-full max-w-lg grid grid-cols-3 gap-3.5">
            
            {/* Score points card */}
            <div className="p-3 bg-[#0e1322] border border-slate-800/80 rounded-2xl relative overflow-hidden flex flex-col justify-center">
              <div className="text-[8px] font-black tracking-widest text-emerald-400 uppercase">ACTIVE SCORE</div>
              <div className="text-2xl font-black italic mt-0.5 text-white flex items-baseline gap-1">
                {score}
                {isHyperdriveActive && <span className="text-[10px] text-yellow-400 font-bold animate-pulse">2x</span>}
              </div>
            </div>

            {/* Record benchmark card */}
            <div className="p-3 bg-[#0e1322] border border-slate-800/80 rounded-2xl relative overflow-hidden flex flex-col justify-center">
              <div className="text-[8px] font-black tracking-widest text-purple-400 uppercase">SYSTEM RECORD</div>
              <div className="text-2xl font-black italic mt-0.5 text-white">{highScore}</div>
            </div>

            {/* Projectiles ammunition status */}
            <div className="p-3 bg-[#0e1322] border border-slate-800/80 rounded-2xl relative overflow-hidden flex flex-col justify-center">
              <div className="text-[8px] font-black tracking-widest text-amber-500 uppercase">EMP AMMUNITION</div>
              <div className="text-2xl font-black italic mt-0.5 text-amber-400 flex items-center gap-1.5">
                <Bomb className={`w-4 h-4 ${hasAmmo > 0 ? 'text-amber-400 animate-bounce' : 'text-slate-600'}`} />
                {hasAmmo}
              </div>
            </div>

          </div>

          {/* Interactive neon retro CRT monitor frame */}
          <div className="relative w-full max-w-lg rounded-3xl bg-[#1e293b] p-3 border-4 border-[#334155] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)]">
            
            {/* CRT monitor housing glare bezel lines */}
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-b from-white/10 to-transparent rounded-t-3xl pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-t from-black/20 to-transparent rounded-b-3xl pointer-events-none" />

            {/* The main simulation screen block */}
            <div className="relative bg-[#050508] rounded-2xl border-2 border-[#090d16] overflow-hidden aspect-square flex items-center justify-center">
              
              <canvas 
                ref={canvasRef} 
                width={400} 
                height={400}
                className="w-full h-full block"
              />

              {/* CRT Scanline Overlay element */}
              {crtFilter && (
                <>
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%] pointer-events-none z-30" />
                  <div className="absolute inset-0 bg-radial-vignette pointer-events-none z-30 opacity-40 mix-blend-overlay" />
                  
                  <style>{`
                    .bg-radial-vignette {
                      background: radial-gradient(circle, transparent 65%, rgba(0,0,0,0.85) 100%);
                    }
                  `}</style>
                </>
              )}

              {/* PAUSED STATE OVERLAY */}
              {isPaused && !gameOver && (
                <div className="absolute inset-0 bg-black/75 backdrop-blur-sm z-40 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-14 h-14 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/30 text-blue-400 mb-4 animate-pulse">
                    <Pause className="w-6 h-6 shrink-0" />
                  </div>
                  <h2 className="text-2xl font-black uppercase italic tracking-wider text-slate-100">SIMULATION PAUSED</h2>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-1 max-w-[200px] leading-relaxed">
                    Preserving kinetic vectors. Press P or Escape to resume.
                  </p>
                  <button
                    onClick={() => { setIsPaused(false); playSynthSound('click'); }}
                    className="mt-5 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 font-black rounded-xl text-[10px] tracking-widest uppercase cursor-pointer"
                  >
                    RESUME SCRIPT
                  </button>
                </div>
              )}

              {/* GAME OVER STATE OVERLAY */}
              {gameOver && (
                <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-40 flex flex-col items-center justify-center p-6 text-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-xs w-full bg-[#0e1322] border border-slate-800 rounded-3xl p-6 text-center relative overflow-hidden"
                  >
                    {/* Retro skull emoji */}
                    <div className="text-4xl mb-2.5">💀</div>
                    <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-400 mb-1 uppercase italic tracking-tighter">
                      VECTOR COLLISION
                    </h2>
                    <p className="text-slate-400 font-bold mb-4 text-[9px] uppercase tracking-wide">
                      Kinetic loop broken. The snake self-contained.
                    </p>
                    
                    <div className="bg-slate-950/60 p-4 rounded-xl mb-5 border border-slate-850">
                      <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">SCORE ACHIEVED</div>
                      <div className="text-3xl font-black text-emerald-400 italic">{score}</div>
                    </div>

                    <button 
                      onClick={resetGame}
                      className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 rounded-xl text-[10px] tracking-widest font-black uppercase cursor-pointer transition-transform active:scale-95 shadow-md shadow-emerald-500/10"
                    >
                      EXECUTE RUN
                    </button>
                  </motion.div>
                </div>
              )}

              {/* ACTIVE POWERUP STATUS ALERTS IN CANVAS */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20 pointer-events-none">
                {isShieldActive && (
                  <div className="px-2.5 py-1 rounded-md bg-purple-500/15 border border-purple-500/30 flex items-center gap-1.5 text-[8px] font-black uppercase tracking-wider text-purple-300 backdrop-blur-xs">
                    <Shield className="w-3 h-3 text-purple-400 animate-pulse shrink-0" />
                    <span>SHIELD PHASE ACTIVE: {shieldTimer}s</span>
                  </div>
                )}
                {isHyperdriveActive && (
                  <div className="px-2.5 py-1 rounded-md bg-cyan-500/15 border border-cyan-500/30 flex items-center gap-1.5 text-[8px] font-black uppercase tracking-wider text-cyan-300 backdrop-blur-xs">
                    <Zap className="w-3 h-3 text-cyan-400 animate-bounce shrink-0" />
                    <span>HYPERDRIVE ACTIVE: {hyperdriveTimer}s</span>
                  </div>
                )}
                {goldenTimer > 0 && gameState.current.foods.some(f => f.type === 'golden') && (
                  <div className="px-2.5 py-1 rounded-md bg-yellow-500/15 border border-yellow-500/30 flex items-center gap-1.5 text-[8px] font-black uppercase tracking-wider text-yellow-300 backdrop-blur-xs">
                    <Sparkles className="w-3 h-3 text-yellow-400 animate-spin shrink-0" />
                    <span>GOLD STAR FLASHING: {goldenTimer}s</span>
                  </div>
                )}
              </div>

            </div>

          </div>

          {/* Touch on-screen keyboard d-pad controls for mobile and click support */}
          <div className="w-full max-w-lg flex flex-col items-center gap-2 mt-1">
            
            <div className="flex items-center gap-6 w-full justify-between px-2 bg-[#0e1322]/40 rounded-xl p-1 border border-slate-800/40">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">TACTILE PAD</span>
              <div className="flex gap-2">
                <button
                  onClick={() => { setIsMuted(!isMuted); playSynthSound('click'); }}
                  className="p-1.5 rounded-lg bg-[#0e1322] border border-slate-800/80 hover:border-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Toggle Sound Synthesizer"
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-blue-400" />}
                </button>
                <button
                  onClick={() => { setIsPaused(!isPaused); playSynthSound('click'); }}
                  className="p-1.5 rounded-lg bg-[#0e1322] border border-slate-800/80 hover:border-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Pause Simulation"
                >
                  {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={resetGame}
                  className="p-1.5 rounded-lg bg-[#0e1322] border border-slate-800/80 hover:border-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Restart Run"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Complete Direction D-Pad buttons layout */}
            <div className="flex items-center gap-4 py-2 justify-center">
              
              {/* Laser Trigger Shooter Block */}
              {hasAmmo > 0 && (
                <button
                  onClick={fireLaser}
                  className="w-14 h-14 rounded-full bg-amber-500 hover:bg-amber-400 active:scale-95 border-2 border-amber-300 flex flex-col items-center justify-center text-slate-950 font-black text-[8px] cursor-pointer shadow-lg animate-pulse"
                >
                  <Flame className="w-4 h-4 shrink-0 mb-0.5" />
                  EMP
                </button>
              )}

              {/* D-PAD cross directions */}
              <div className="relative w-32 h-32 select-none">
                {/* UP */}
                <button
                  onClick={() => {
                    const s = gameState.current;
                    if (s.direction.y === 0) s.nextDirection = { x: 0, y: -1 };
                  }}
                  className="absolute top-0 left-11 w-10 h-10 rounded-t-lg bg-slate-800 hover:bg-slate-700 border-t border-x border-slate-700 flex items-center justify-center text-slate-300 active:bg-slate-600 cursor-pointer"
                >
                  <ChevronUp className="w-5 h-5" />
                </button>
                
                {/* LEFT */}
                <button
                  onClick={() => {
                    const s = gameState.current;
                    if (s.direction.x === 0) s.nextDirection = { x: -1, y: 0 };
                  }}
                  className="absolute top-11 left-0 w-10 h-10 rounded-l-lg bg-slate-800 hover:bg-slate-700 border-l border-y border-slate-700 flex items-center justify-center text-slate-300 active:bg-slate-600 cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* CENTER DEADZONE */}
                <div className="absolute top-11 left-11 w-10 h-10 bg-slate-900 border border-slate-800" />

                {/* RIGHT */}
                <button
                  onClick={() => {
                    const s = gameState.current;
                    if (s.direction.x === 0) s.nextDirection = { x: 1, y: 0 };
                  }}
                  className="absolute top-11 right-0 w-10 h-10 rounded-r-lg bg-slate-800 hover:bg-slate-700 border-r border-y border-slate-700 flex items-center justify-center text-slate-300 active:bg-slate-600 cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* DOWN */}
                <button
                  onClick={() => {
                    const s = gameState.current;
                    if (s.direction.y === 0) s.nextDirection = { x: 0, y: 1 };
                  }}
                  className="absolute bottom-0 left-11 w-10 h-10 rounded-b-lg bg-slate-800 hover:bg-slate-700 border-b border-x border-slate-700 flex items-center justify-center text-slate-300 active:bg-slate-600 cursor-pointer"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>

            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: Live daily leaderboard stats & player customization name badge */}
        <div className="w-full md:w-80 flex flex-col gap-5 shrink-0">
          
          {/* User profile identifier */}
          <div className="p-5 rounded-2xl bg-[#0e1322] border border-slate-800/80 shadow-lg space-y-3 relative">
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-full blur-xl animate-pulse" />
            
            <div className="flex items-center gap-1.5 border-b border-slate-800/80 pb-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">RUNNER SIGNATURE</h3>
            </div>

            <div className="space-y-1.5">
              <label className="text-[8px] font-black uppercase text-slate-400 tracking-widest">SQUAD PROTOCOL TAG</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value.toUpperCase().replace(/\s+/g, '_').substring(0, 15))}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-[10px] font-black text-white focus:outline-none focus:border-emerald-500 uppercase tracking-widest"
                  placeholder="ANON_RUNNER"
                />
              </div>
            </div>
            
            {/* Legend guide definitions */}
            <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
              <div className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-1">MATRIX ITEM DICTIONARY</div>
              <div className="grid grid-cols-2 gap-2 text-[8px] font-extrabold uppercase text-slate-300">
                <div className="flex items-center gap-1.5 bg-slate-950/30 p-1 rounded">
                  <span className="w-2 h-2 rounded-full bg-[#f43f5e] shrink-0" />
                  <span>Cherry (+10)</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-950/30 p-1 rounded">
                  <span className="w-2 h-2 rounded bg-[#fbbf24] shrink-0" />
                  <span>Star (+30)</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-950/30 p-1 rounded">
                  <span className="w-2 h-2 rounded-full bg-[#a855f7] shrink-0" />
                  <span>Shield (Phase)</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-950/30 p-1 rounded">
                  <span className="w-2 h-2 rounded bg-[#06b6d4] shrink-0" />
                  <span>Lightning (2x)</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-950/30 p-1 rounded col-span-2">
                  <span className="w-2 h-2 rounded-full bg-[#f59e0b] shrink-0 animate-pulse" />
                  <span>EMP ammo (+3 Shots)</span>
                </div>
              </div>
            </div>

          </div>

          {/* Daily runs leaderboards */}
          <div className="p-5 rounded-2xl bg-[#0e1322] border border-slate-800/80 shadow-lg space-y-3.5 flex-1 flex flex-col">
            
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <div className="flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">DAILY HIGHSCORE LOGS</h3>
              </div>
              
              {leaderboard.length > 3 && (
                <button
                  onClick={() => {
                    if (window.confirm("Dust off the leaderboard memory cache?")) {
                      localStorage.removeItem('cyber_snake_leaderboard');
                      setLeaderboard([]);
                    }
                  }}
                  className="p-1 rounded bg-red-950/40 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                  title="Clear Score Logs"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="space-y-1.5 overflow-y-auto max-h-[220px] flex-1">
              {leaderboard.length === 0 ? (
                <div className="py-8 flex flex-col items-center justify-center text-center opacity-45">
                  <Trophy className="w-8 h-8 text-slate-600 mb-1" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">NO LOGS FOUND</span>
                </div>
              ) : (
                leaderboard.map((log, index) => (
                  <div 
                    key={index}
                    className="p-2 rounded-xl bg-slate-950/45 border border-slate-850 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`text-[10px] font-black shrink-0 ${
                        index === 0 ? 'text-yellow-400' : index === 1 ? 'text-slate-300' : index === 2 ? 'text-amber-600' : 'text-slate-600'
                      }`}>
                        #{index + 1}
                      </span>
                      <div className="min-w-0">
                        <span className="text-[9px] font-black text-slate-100 uppercase tracking-wider block truncate">{log.name}</span>
                        <span className="text-[7px] text-slate-500 font-extrabold uppercase tracking-widest block truncate">
                          {log.mode} • {log.theme}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-emerald-400 italic block">{log.score}</span>
                      <span className="text-[7px] text-slate-600 font-bold block">{log.date}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
