import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Volume2, VolumeX, RotateCcw, Award, Play, Swords } from 'lucide-react';

interface GameCharacter {
  id: string;
  name: string;
  sub: string;
  speed: number;
  jump: number;
  shoot: number;
  defense: number;
  color: string;
  specialName: string;
  specialDesc: string;
  accent: string;
}

const CHARACTERS: GameCharacter[] = [
  {
    id: 'lebro',
    name: 'LEBRO HEAD',
    sub: 'The Akron Gorilla',
    speed: 7,
    jump: 9,
    shoot: 6,
    defense: 8,
    color: '#3b82f6',
    accent: '#facc15',
    specialName: 'METEOR SMASH',
    specialDesc: 'Completely flies to the sky and dunks with a meteor blast!'
  },
  {
    id: 'steph',
    name: 'CURRY POT',
    sub: 'The Golden Chef',
    speed: 9,
    jump: 6,
    shoot: 10,
    defense: 5,
    color: '#eab308',
    accent: '#3b82f6',
    specialName: 'SOLAR FACTION SHOT',
    specialDesc: 'Shoots a heat-seeking fire orb that orbits directly into the net.'
  },
  {
    id: 'shaq',
    name: 'SHAQ BLOCK',
    sub: 'The Rim Breaker',
    speed: 5,
    jump: 7,
    shoot: 5,
    defense: 10,
    color: '#475569',
    accent: '#cbd5e1',
    specialName: 'EARTHQUAKING SLAM',
    specialDesc: 'Dunks with high gravity, stunning any opponents with dizzy stars!'
  },
  {
    id: 'jordan',
    name: 'JORDAN FLY',
    sub: 'His Baldness Goated',
    speed: 8,
    jump: 10,
    shoot: 8,
    defense: 7,
    color: '#dc2626',
    accent: '#ffffff',
    specialName: '舌 TONGUE AIR-WALK',
    specialDesc: 'Walks mid-air horizontally to deliver a double-clutch dunk!'
  }
];

interface PowerUp {
  x: number;
  y: number;
  type: 'speed' | 'boost' | 'freeze';
  active: boolean;
  radius: number;
}

interface MatchPlayer {
  id: string;
  name: string;
  isP1: boolean;
  isP2: boolean;
  team: 'blue' | 'red';
  color: string;
  accent: string;
  charType: string;
  
  // physics state
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  facing: 'right' | 'left';
  
  // game stats & abilities
  speedStat: number;
  jumpStat: number;
  shootStat: number;
  defenseStat: number;
  superMeter: number;
  isStunned: boolean;
  stunTimer: number;
  dashTimer: number;
  isBot: boolean;
  
  // animation frames state
  legRotation: number;
  jumpAnim: number;
  isDunking: boolean;
  dunkPhase: number;
  shootAnimTimer: number;
}

// 3D Visual color shading helper function
function adjustColorBrightness(hex: string, percent: number): string {
  let isPounds = hex.startsWith('#');
  let raw = isPounds ? hex.slice(1) : hex;
  if (raw.length === 3) {
    raw = raw[0] + raw[0] + raw[1] + raw[1] + raw[2] + raw[2];
  }
  let num = parseInt(raw, 16);
  let r = (num >> 16) + Math.round(2.55 * percent);
  let g = ((num >> 8) & 0x00ff) + Math.round(2.55 * percent);
  let b = (num & 0x0000ff) + Math.round(2.55 * percent);
  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

export default function BasketballStars() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Menu selection states
  const [gameState, setGameState] = useState<'menu' | 'charSelect' | 'playing' | 'gameover' | 'tournament_tree' | 'winner_podium'>('menu');
  const [gameMode, setGameMode] = useState<'1v1' | '2v2' | 'coop' | 'pvp'>('1v1');
  const [selectedCharId, setSelectedCharId] = useState('lebro');
  const [selectedCharIdP2, setSelectedCharIdP2] = useState('steph');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'pro'>('medium');
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Match Status variables
  const [scoreBlue, setScoreBlue] = useState(0);
  const [scoreRed, setScoreRed] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [alertText, setAlertText] = useState<string | null>(null);
  const [isSuperMode, setIsSuperMode] = useState<string | null>(null);

  // Tournament flow variables
  const [tournamentRound, setTournamentRound] = useState(1); // 1 = Quarter, 2 = Semi, 3 = Finals
  const [tournamentOpponents, setTournamentOpponents] = useState<string[]>(['steph', 'shaq', 'jordan']);
  const [tournamentWinner, setTournamentWinner] = useState<string | null>(null);

  // Audio configuration ref
  const audioCtxRef = useRef<AudioContext | null>(null);
  const keysPressed = useRef<Set<string>>(new Set());
  const splashTriggerRef = useRef<((text: string) => void) | null>(null);

  // High score tracking
  const [highScore, setHighScore] = useState(() => {
    try { return parseInt(localStorage.getItem('arcade_basket_highscore') || '0', 10); } catch { return 0; }
  });

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  const playSound = (type: 'bounce' | 'rim' | 'swish' | 'cheer' | 'buzzer' | 'dash' | 'special') => {
    if (!soundEnabled) return;
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'bounce') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.35, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.12);
        osc.start(); osc.stop(ctx.currentTime + 0.12);
      } else if (type === 'rim') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(900, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.18);
        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.18);
        osc.start(); osc.stop(ctx.currentTime + 0.18);
      } else if (type === 'swish') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.45, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start(); osc.stop(ctx.currentTime + 0.25);
      } else if (type === 'cheer') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(330, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start(); osc.stop(ctx.currentTime + 0.4);
      } else if (type === 'buzzer') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, ctx.currentTime);
        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.8);
        osc.start(); osc.stop(ctx.currentTime + 0.82);
      } else if (type === 'dash') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start(); osc.stop(ctx.currentTime + 0.1);
      } else if (type === 'special') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start(); osc.stop(ctx.currentTime + 0.52);
      }
    } catch {}
  };

  // Setup keys listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      keysPressed.current.add(k);
      keysPressed.current.add(e.key); // keep both cases for arrows compatibility
      initAudio();
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key.toLowerCase());
      keysPressed.current.delete(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Timer Countdown
  useEffect(() => {
    if (gameState !== 'playing') return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          playSound('buzzer');
          handleMatchOver();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState, gameMode, tournamentRound]);

  const triggerAlert = (text: string) => {
    setAlertText(text);
    
    let splashWord = '';
    const upperText = text.toUpperCase();
    if (upperText.includes('DUNK')) {
      splashWord = 'DUUUNK!!!';
    } else if (upperText.includes('BASKET') || upperText.includes('REBOUND')) {
      splashWord = 'SCORE!!!';
    } else if (upperText.includes('STOLEN') || upperText.includes('YOINK') || upperText.includes('STEAL')) {
      splashWord = 'SWIPE!';
    } else if (upperText.includes('METERS') || upperText.includes('FIRESHOT') || upperText.includes('COMBO')) {
      splashWord = 'SUPER SHOT!';
    } else if (upperText.includes('FREEZE')) {
      splashWord = 'DEEP FREEZE!';
    }
    
    if (splashWord && splashTriggerRef.current) {
      splashTriggerRef.current(splashWord);
    }
    
    setTimeout(() => {
      setAlertText(null);
    }, 1800);
  };

  // Handle final match outcome
  const handleMatchOver = () => {
    if (gameMode === '1v1' || gameMode === '2v2') {
      // Standard local quickplay
      setGameState('gameover');
    } else {
      // Tournament mode
      if (scoreBlue > scoreRed) {
        if (tournamentRound === 3) {
          setTournamentWinner(CHARACTERS.find(c => c.id === selectedCharId)?.name || 'PLAYER');
          setGameState('winner_podium');
          playSound('cheer');
        } else {
          setTournamentRound(r => r + 1);
          setGameState('tournament_tree');
          triggerAlert(`ROUND ${tournamentRound} VICORY!`);
        }
      } else {
        // Lost tournament
        setGameState('gameover');
      }
    }
  };

  // Start the actual physical core match
  const startMatch = () => {
    setTimeLeft(60);
    setScoreBlue(0);
    setScoreRed(0);
    setGameState('playing');
    triggerAlert('MATCH START! READY?');
  };

  // Canvas Core Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const virtualWidth = 850;
    const virtualHeight = 440;
    canvas.width = virtualWidth;
    canvas.height = virtualHeight;

    const gravity = 0.35;
    const courtFloorY = 380;

    // Load active character designs
    const p1Char = CHARACTERS.find(c => c.id === selectedCharId) || CHARACTERS[0];
    const p2Char = CHARACTERS.find(c => c.id === selectedCharIdP2) || CHARACTERS[1];

    // Build the dynamic team players arrays
    let players: MatchPlayer[] = [];

    // Player 1 (Blue Team Host)
    players.push({
      id: 'p1',
      name: p1Char.name,
      isP1: true,
      isP2: false,
      team: 'blue',
      color: p1Char.color,
      accent: p1Char.accent,
      charType: p1Char.id,
      x: 180,
      y: courtFloorY - 60,
      vx: 0,
      vy: 0,
      width: 45,
      height: 60,
      facing: 'right',
      speedStat: p1Char.speed,
      jumpStat: p1Char.jump,
      shootStat: p1Char.shoot,
      defenseStat: p1Char.defense,
      superMeter: 30,
      isStunned: false,
      stunTimer: 0,
      dashTimer: 0,
      isBot: false,
      legRotation: 0,
      jumpAnim: 0,
      isDunking: false,
      dunkPhase: 0,
      shootAnimTimer: 0
    });

    // Player 2 / Opposition Teammates setup based on 2v2 or 1v1
    const setupOppositionAndTeammates = () => {
      // Right Side Opponent (Team Red Main)
      const opID = gameMode === 'pvp' ? 'p2' : 'bot1';
      players.push({
        id: opID,
        name: p2Char.name,
        isP1: false,
        isP2: gameMode === 'pvp',
        team: 'red',
        color: p2Char.color,
        accent: p2Char.accent,
        charType: p2Char.id,
        x: 670,
        y: courtFloorY - 60,
        vx: 0,
        vy: 0,
        width: 45,
        height: 60,
        facing: 'left',
        speedStat: p2Char.speed,
        jumpStat: p2Char.jump,
        shootStat: p2Char.shoot,
        defenseStat: p2Char.defense,
        superMeter: 30,
        isStunned: false,
        stunTimer: 0,
        dashTimer: 0,
        isBot: gameMode !== 'pvp',
        legRotation: 0,
        jumpAnim: 0,
        isDunking: false,
        dunkPhase: 0,
        shootAnimTimer: 0
      });

      // Teammate & second enemy if 2v2 selected
      if (gameMode === '2v2') {
        const charBlueTeammate = CHARACTERS[(CHARACTERS.indexOf(p1Char) + 1) % CHARACTERS.length];
        const charRedTeammate = CHARACTERS[(CHARACTERS.indexOf(p2Char) + 2) % CHARACTERS.length];

        // Blue Teammate (bot)
        players.push({
          id: 'blue_teammate',
          name: charBlueTeammate.name,
          isP1: false,
          isP2: false,
          team: 'blue',
          color: charBlueTeammate.color,
          accent: charBlueTeammate.accent,
          charType: charBlueTeammate.id,
          x: 250,
          y: courtFloorY - 60,
          vx: 0,
          vy: 0,
          width: 45,
          height: 60,
          facing: 'right',
          speedStat: charBlueTeammate.speed,
          jumpStat: charBlueTeammate.jump,
          shootStat: charBlueTeammate.shoot,
          defenseStat: charBlueTeammate.defense,
          superMeter: 10,
          isStunned: false,
          stunTimer: 0,
          dashTimer: 0,
          isBot: true,
          legRotation: 0,
          jumpAnim: 0,
          isDunking: false,
          dunkPhase: 0,
          shootAnimTimer: 0
        });

        // Red Teammate (bot)
        players.push({
          id: 'red_teammate',
          name: charRedTeammate.name,
          isP1: false,
          isP2: false,
          team: 'red',
          color: charRedTeammate.color,
          accent: charRedTeammate.accent,
          charType: charRedTeammate.id,
          x: 600,
          y: courtFloorY - 60,
          vx: 0,
          vy: 0,
          width: 45,
          height: 60,
          facing: 'left',
          speedStat: charRedTeammate.speed,
          jumpStat: charRedTeammate.jump,
          shootStat: charRedTeammate.shoot,
          defenseStat: charRedTeammate.defense,
          superMeter: 10,
          isStunned: false,
          stunTimer: 0,
          dashTimer: 0,
          isBot: true,
          legRotation: 0,
          jumpAnim: 0,
          isDunking: false,
          dunkPhase: 0,
          shootAnimTimer: 0
        });
      }
    };

    setupOppositionAndTeammates();

    // Responsive Interactive Net on BOTH baskets (Spring arrays)
    const netLeftY = 175;
    const netLeftXStart = 42;
    const netLeftXEnd = 86;

    const netRightY = 175;
    const netRightXStart = 764;
    const netRightXEnd = 808;

    interface SpringNode {
      x: number;
      y: number;
      ox: number;
      oy: number;
      vx: number;
      vy: number;
    }

    const netLeftNodes: SpringNode[] = [];
    const netRightNodes: SpringNode[] = [];

    for (let i = 0; i < 6; i++) {
      const offset = (netLeftXEnd - netLeftXStart) * (i / 5);
      netLeftNodes.push({
        x: netLeftXStart + offset,
        y: netLeftY + 22,
        ox: netLeftXStart + offset,
        oy: netLeftY + 22,
        vx: 0, vy: 0
      });
      netRightNodes.push({
        x: netRightXStart + offset,
        y: netRightY + 22,
        ox: netRightXStart + offset,
        oy: netRightY + 22,
        vx: 0, vy: 0
      });
    }

    // Physical ball state
    let ball = {
      x: 425,
      y: 120,
      vx: 0,
      vy: 0,
      radius: 13,
      holder: null as MatchPlayer | null,
      cooldownHolder: null as MatchPlayer | null,
      cooldownTimer: 0,
      lastTeamTouch: 'blue' as 'blue' | 'red',
      isAirborne: true,
      lastShotType: 'normal' as 'normal' | 'super' | 'dunk'
    };

    // Particles array
    interface GameParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      size: number;
      alpha: number;
      life: number;
      maxLife: number;
    }
    let particles: GameParticle[] = [];

    // Falling PowerUps collection
    let powerUps: PowerUp[] = [];
    let powerSpawnTimer = 300; // spawn every bunch of frames

    const createSparks = (x: number, y: number, color: string, count = 12) => {
      for (let i = 0; i < count; i++) {
        particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.5) * 6 - 2,
          color,
          size: Math.random() * 4 + 2,
          alpha: 1,
          life: 0,
          maxLife: 25 + Math.random() * 15
        });
      }
    };

    const triggerStealSwipe = (swiper: MatchPlayer, victim: MatchPlayer) => {
      createSparks(swiper.x, swiper.y - 20, '#38bdf8', 6);
      playSound('dash');
      
      const successChance = 0.35 + (swiper.defenseStat * 0.02);
      if (Math.random() < successChance) {
        // Yoink!
        ball.holder = swiper;
        ball.cooldownHolder = victim;
        ball.cooldownTimer = 40;
        victim.isStunned = true;
        victim.stunTimer = 45; // immobilized briefly with stars
        triggerAlert('YOINK! STOLEN!');
        createSparks(swiper.x, swiper.y - 40, '#f59e0b', 12);
      } else {
        triggerAlert('SWIPE MISSED!');
      }
    };

    const runMatchAI = (bot: MatchPlayer) => {
      if (bot.isStunned) return;

      // Find ball
      const ballDist = Math.hypot(ball.x - bot.x, ball.y - bot.y);
      const isTeammateHolding = ball.holder && ball.holder.team === bot.team && ball.holder.id !== bot.id;
      const isOpponentHolding = ball.holder && ball.holder.team !== bot.team;

      // Decision thresholds based on active selected difficulty
      const reactionDelay = difficulty === 'easy' ? 0.3 : difficulty === 'medium' ? 0.6 : 0.82;

      if (!ball.holder) {
        // Run after loose/unowned ball
        if (ball.x < bot.x - 10) {
          bot.vx = -bot.speedStat * 0.42 * reactionDelay;
          bot.facing = 'left';
        } else if (ball.x > bot.x + 10) {
          bot.vx = bot.speedStat * 0.42 * reactionDelay;
          bot.facing = 'right';
        }

        // Jump if ball is in reachable sky range
        if (ball.y < bot.y - 60 && ballDist < 120 && bot.y >= courtFloorY - 65 && Math.random() < 0.05) {
          bot.vy = -bot.jumpStat * 0.72;
        }
      } else if (ball.holder.id === bot.id) {
        // Bot is currently holding the ball! Run to targeted attack basket
        const targetBasketX = bot.team === 'blue' ? 760 : 70;
        const currentZoneDist = Math.abs(targetBasketX - bot.x);

        // Turn facing correctly
        bot.facing = targetBasketX > bot.x ? 'right' : 'left';

        // Attack drive
        if (bot.x < targetBasketX - 50) {
          bot.vx = bot.speedStat * 0.45;
        } else if (bot.x > targetBasketX + 50) {
          bot.vx = -bot.speedStat * 0.45;
        }

        // Check for Ultra Super meter full attack trigger
        if (bot.superMeter >= 100 && Math.random() < 0.08) {
          bot.superMeter = 0;
          playSound('special');
          setIsSuperMode(bot.name);
          setTimeout(() => setIsSuperMode(null), 1200);

          // Force perfect scoring physics
          ball.holder = null;
          ball.cooldownHolder = bot;
          ball.cooldownTimer = 45;
          bot.shootAnimTimer = 25;
          ball.x = bot.x;
          ball.y = bot.y - 10;
          ball.lastShotType = 'super';

          const bxX = bot.team === 'blue' ? 780 : 50;
          const arcTime = 30;
          ball.vx = (bxX - ball.x) / arcTime;
          ball.vy = (140 - ball.y) / arcTime - 0.5 * gravity * arcTime;
          
          triggerAlert(`${bot.name}: SPECIAL MOVE!`);
          createSparks(bot.x, bot.y - 30, '#10b981', 20);
          return;
        }

        // Close to basket - trigger Dunk behavior!
        if (currentZoneDist < 140 && bot.y >= courtFloorY - 65) {
          bot.vy = -bot.jumpStat * 0.75;
          bot.isDunking = true;
          bot.dunkPhase = 0;
        } else if (currentZoneDist < 260 && Math.random() < 0.015) {
          // Normal medium long shot
          ball.holder = null;
          ball.cooldownHolder = bot;
          ball.cooldownTimer = 45;
          bot.shootAnimTimer = 25;
          ball.x = bot.x;
          ball.y = bot.y - 15;

          const targetX = bot.team === 'blue' ? 780 : 50;
          const distToH = targetX - ball.x;
          const t_vy = -7.5 - Math.random() * 2.5;
          const landingTime = (-t_vy * 2) / gravity;

          ball.vx = distToH / landingTime;
          ball.vy = t_vy;
          ball.lastShotType = 'normal';
          playSound('rim');
        }
      } else if (isOpponentHolding) {
        // Defense check - run near holder to steal or intercept block
        if (ball.holder.x < bot.x) {
          bot.vx = -bot.speedStat * 0.48 * reactionDelay;
          bot.facing = 'left';
        } else {
          bot.vx = bot.speedStat * 0.48 * reactionDelay;
          bot.facing = 'right';
        }

        // Try action swipe or block
        if (ballDist < 50 && Math.random() < 0.06 && bot.dashTimer <= 0) {
          triggerStealSwipe(bot, ball.holder);
          bot.dashTimer = 90; // cooldown
        }
      } else if (isTeammateHolding) {
        // Position strategically by keeping a gap spacing
        const followX = ball.holder.x + (bot.team === 'blue' ? -120 : 120);
        if (bot.x < followX) bot.vx = 2.5;
        else bot.vx = -2.5;
      }
    };

    // State bindings inside canvas thread for hyper-responsive cartoon splash animations
    let activeSplashText = '';
    let activeSplashTimer = 0;
    let ballSpinAngle = 0;
    splashTriggerRef.current = (splashWord: string) => {
      activeSplashText = splashWord;
      activeSplashTimer = 75;
    };

    // Main interval tick
    let animId = 0;
    const processFrame = () => {
      animId = requestAnimationFrame(processFrame);

      // --- HIGH QUALITY CARTOON SPORTS BACKGROUND ARENA ---
      // Draw general backing board wall
      ctx.fillStyle = '#2f3640';
      ctx.fillRect(0, 0, virtualWidth, virtualHeight);

      // Draw large stadium windows overlooking tall skyscraper panels
      const windowXCoords = [
        { x: 50, w: 160 },
        { x: 260, w: 330 },
        { x: 640, w: 160 }
      ];

      windowXCoords.forEach(win => {
        // Sky fill
        let winSkyGrad = ctx.createLinearGradient(0, 15, 0, 235);
        winSkyGrad.addColorStop(0, '#4b5563');
        winSkyGrad.addColorStop(1, '#1f2937');
        ctx.fillStyle = winSkyGrad;
        ctx.fillRect(win.x, 15, win.w, 220);

        // Skyscaper silhouettes
        ctx.fillStyle = '#111827';
        // Left build block inside win
        ctx.fillRect(win.x + win.w * 0.1, 120, win.w * 0.35, 115);
        // Right build block inside win
        ctx.fillRect(win.x + win.w * 0.55, 75, win.w * 0.35, 160);

        // Little golden grid office lights details
        ctx.fillStyle = '#fef08a';
        ctx.globalAlpha = 0.3;
        // left skyscraper windows
        for (let r = 135; r < 220; r += 20) {
          for (let c = win.x + win.w * 0.13; c < win.x + win.w * 0.42; c += 15) {
            ctx.fillRect(c, r, 5, 5);
          }
        }
        // right skyscraper windows
        for (let r = 90; r < 220; r += 20) {
          for (let c = win.x + win.w * 0.58; c < win.x + win.w * 0.88; c += 15) {
            ctx.fillRect(c, r, 5, 5);
          }
        }
        ctx.globalAlpha = 1.0;

        // Shiny glass diagonal reflections highlights
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.lineWidth = 15;
        ctx.beginPath();
        ctx.moveTo(win.x + win.w - 40, 15);
        ctx.lineTo(win.x + 30, 235);
        ctx.stroke();

        // Framings
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 4;
        ctx.strokeRect(win.x, 15, win.w, 220);
      });

      // Render 3 sweeping white spotlight cones radiating down
      const spotCenters = [130, 425, 720];
      spotCenters.forEach(centerX => {
        let spotGrad = ctx.createLinearGradient(centerX, 15, centerX, 240);
        spotGrad.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
        spotGrad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
        ctx.fillStyle = spotGrad;

        ctx.beginPath();
        // Top pin point
        ctx.moveTo(centerX - 10, 15);
        ctx.lineTo(centerX + 10, 15);
        // Blown flare bounds
        ctx.lineTo(centerX + 90, 240);
        ctx.lineTo(centerX - 90, 240);
        ctx.closePath();
        ctx.fill();
      });

      // Draw crowd spectators row (Cheering kids with distinct colorful details)
      for (let fx = 25; fx < virtualWidth; fx += 34) {
        const bounce = Math.sin((Date.now() / 150) + fx) * 5;
        const skinColors = ['#fed7aa', '#fbcfe8', '#ffedd5', '#fca5a5'];
        const shirtColors = ['#ef4444', '#facc15', '#3b82f6', '#ec4899', '#10b981'];
        const hairColors = ['#1e293b', '#b45309', '#ca8a04', '#1c1917'];

        const skin = skinColors[fx % skinColors.length];
        const shirt = shirtColors[(fx + 1) % shirtColors.length];
        const hair = hairColors[(fx + 2) % hairColors.length];

        ctx.save();
        ctx.translate(fx, 215 + bounce);

        // Kid shoulder body shirt
        ctx.fillStyle = shirt;
        ctx.beginPath();
        ctx.ellipse(0, 12, 11, 10, 0, Math.PI, Math.PI * 2);
        ctx.fill();

        // Kid face head
        ctx.fillStyle = skin;
        ctx.beginPath();
        ctx.arc(0, 0, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Kid hairstyle caps
        ctx.fillStyle = hair;
        ctx.beginPath();
        if (fx % 2 === 0) {
          // cute spiky bangs cap
          ctx.arc(0, -4, 6, Math.PI, 0);
          ctx.lineTo(0, -9);
        } else {
          // round afro head cap
          ctx.arc(0, -3, 7, 0, Math.PI * 2);
        }
        ctx.fill();

        // Tiny eye-dots & smiling mouth
        ctx.fillStyle = '#0a0f1d';
        ctx.beginPath();
        ctx.arc(-2.5, -0.5, 0.9, 0, Math.PI * 2);
        ctx.arc(2.5, -0.5, 0.9, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#0a0f1d';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(0, 2.5, 3.2, 0, Math.PI);
        ctx.stroke();

        ctx.restore();
      }

      // Draw horizontal Pine Green metal barrier rail with support posts
      ctx.fillStyle = '#1e4d2b'; // Pine green
      ctx.fillRect(0, 230, virtualWidth, 7);
      for (let px = 40; px < virtualWidth; px += 80) {
        ctx.fillStyle = '#14351d';
        ctx.fillRect(px, 237, 5, 10);
      }

      // --- HIGH QUALITY VARNISHED WOOD BASKETBALL ENCLOSURE COURT ---
      // Apply beautiful varnished wood grain gradient representing basketball timber
      let woodGrad = ctx.createLinearGradient(0, 237, 0, virtualHeight);
      woodGrad.addColorStop(0, '#fef08a'); // Bright clean honey maple
      woodGrad.addColorStop(0.3, '#fbe5a0');
      woodGrad.addColorStop(0.75, '#f59e0b'); // Warm golden amber wood
      woodGrad.addColorStop(1, '#d97706'); // Deep rich maple finish
      ctx.fillStyle = woodGrad;
      ctx.fillRect(0, 237, virtualWidth, virtualHeight - 237);

      // Draw horizontal and vertical parquet lines with mathematical 3D perspective receding lines!
      ctx.save();
      // Receding longitudinal board divisions converging to vanishing point (425, 170)
      for (let xBottom = -300; xBottom < virtualWidth + 300; xBottom += 55) {
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.055)';
        ctx.lineWidth = 1.2;
        const xTop = 425 + (xBottom - 425) * ((237 - 170) / (440 - 170));
        ctx.beginPath();
        ctx.moveTo(xTop, 237);
        ctx.lineTo(xBottom, 440);
        ctx.stroke();
      }

      // Exponentially-spaced horizontal board divisions (closer together at top/horizon)
      let wy = 237;
      let step = 6.5;
      let rowIdx = 0;
      while (wy < virtualHeight) {
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.045)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, wy);
        ctx.lineTo(virtualWidth, wy);
        ctx.stroke();

        // Draw staggered joint blocks along this horizontal line
        rowIdx++;
        const offset = (rowIdx % 2 === 0) ? 27 : 0;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.035)';
        ctx.lineWidth = 0.8;
        for (let xBottom = -300 + offset; xBottom < virtualWidth + 300; xBottom += 110) {
          const xCurrent = 425 + (xBottom - 425) * ((wy - 170) / (440 - 170));
          const nextWy = Math.min(virtualHeight, wy + step);
          const xNext = 425 + (xBottom - 425) * ((nextWy - 170) / (440 - 170));
          ctx.beginPath();
          ctx.moveTo(xCurrent, wy);
          ctx.lineTo(xNext, nextWy);
          ctx.stroke();
        }

        wy += step;
        step *= 1.135; // perspective stretch ratio
      }
      ctx.restore();

      // Glossy Court Lacquer Reflections (Overhead stadium lighting bounce simulation)
      let lacquerReflect = ctx.createLinearGradient(120, 237, 720, 440);
      lacquerReflect.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
      lacquerReflect.addColorStop(0.18, 'rgba(255, 255, 255, 0.01)');
      lacquerReflect.addColorStop(0.48, 'rgba(255, 255, 255, 0.12)'); // Specular reflect hot spot strip
      lacquerReflect.addColorStop(0.68, 'rgba(255, 255, 255, 0.01)');
      lacquerReflect.addColorStop(1, 'rgba(255, 255, 255, 0.06)');
      ctx.fillStyle = lacquerReflect;
      ctx.fillRect(0, 237, virtualWidth, virtualHeight - 237);

      // Draw beautiful luxury Purple Sideline Margins at the top and bottom bounds
      ctx.fillStyle = '#5b21b6'; // Gorgeous professional deep arena purple
      ctx.fillRect(0, 237, virtualWidth, 8); // Top line margin
      ctx.fillRect(0, 424, virtualWidth, 16); // Bottom line margin

      // Draw glossy white boundary lines
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.2;
      // Center court divider line
      ctx.beginPath();
      ctx.moveTo(virtualWidth / 2, 245);
      ctx.lineTo(virtualWidth / 2, 424);
      ctx.stroke();

      // Elliptical center circle (in 3D court perspective)
      ctx.beginPath();
      ctx.ellipse(virtualWidth / 2, 335, 110, 36, 0, 0, Math.PI * 2);
      ctx.stroke();
      
      // Left 3-point key lane markers
      ctx.beginPath();
      ctx.ellipse(0, 335, 150, 68, 0, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();

      // Right 3-point key lane markers
      ctx.beginPath();
      ctx.ellipse(virtualWidth, 335, 150, 68, 0, Math.PI / 2, Math.PI * 3 / 2);
      ctx.stroke();

      // Draw sturdy dark metallic basket posts
      ctx.strokeStyle = '#334155'; // Metallic iron posts
      ctx.lineWidth = 11;
      
      // Left basket post
      ctx.beginPath();
      ctx.moveTo(35, courtFloorY);
      ctx.lineTo(35, 120);
      ctx.lineTo(60, 120);
      ctx.stroke();

      // Right basket post
      ctx.beginPath();
      ctx.moveTo(815, courtFloorY);
      ctx.lineTo(815, 120);
      ctx.lineTo(790, 120);
      ctx.stroke();

      // Draw 3D-slanted glowing cyan translucent glass backboards
      ctx.save();
      // Translucent glossy glass fill
      ctx.fillStyle = 'rgba(6, 182, 212, 0.28)';
      ctx.strokeStyle = '#22d3ee'; // Cyan glow boundaries
      ctx.lineWidth = 3.5;

      // Left glass board (Slanted trapezoid in 3D projection inwards)
      ctx.beginPath();
      ctx.moveTo(15, 60);
      ctx.lineTo(48, 80);
      ctx.lineTo(48, 220);
      ctx.lineTo(15, 200);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      
      // Draw left inner square
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(25, 120);
      ctx.lineTo(40, 130);
      ctx.lineTo(40, 175);
      ctx.lineTo(25, 165);
      ctx.closePath();
      ctx.stroke();

      // Right glass board (Slanted trapezoid in 3D projection inwards)
      ctx.fillStyle = 'rgba(6, 182, 212, 0.28)';
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(835, 60);
      ctx.lineTo(802, 80);
      ctx.lineTo(802, 220);
      ctx.lineTo(835, 200);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Draw right inner square
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(825, 120);
      ctx.lineTo(810, 130);
      ctx.lineTo(810, 175);
      ctx.lineTo(825, 165);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();

      // Draw high-quality horizontal red elliptical Rim/Hoop rings
      ctx.save();
      ctx.strokeStyle = '#ef4444'; // Solid Red rims
      ctx.lineWidth = 5.5;

      // Left Rim
      ctx.beginPath();
      ctx.ellipse(64, 160, 16, 5, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Right Rim
      ctx.beginPath();
      ctx.ellipse(786, 160, 16, 5, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Render interactive string nets
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 2.0;
      // Physics spring constraints on net nodes (attached to Left Rim coords 48-80)
      netLeftNodes.forEach((node, i) => {
        const targetAnchorX = 48 + (80 - 48) * (i / 5);
        node.vx += (targetAnchorX - node.x) * 0.15;
        node.vy += (node.oy - node.y) * 0.15;
        node.vx *= 0.82;
        node.vy *= 0.82;
        node.x += node.vx;
        node.y += node.vy;

        ctx.beginPath();
        ctx.moveTo(targetAnchorX, 160);
        ctx.lineTo(node.x, node.y);
        ctx.stroke();
      });

      // Net right nodes (attached to Right Rim coords 770-802)
      netRightNodes.forEach((node, i) => {
        const targetAnchorX = 770 + (802 - 770) * (i / 5);
        node.vx += (targetAnchorX - node.x) * 0.15;
        node.vy += (node.oy - node.y) * 0.15;
        node.vx *= 0.82;
        node.vy *= 0.82;
        node.x += node.vx;
        node.y += node.vy;

        ctx.beginPath();
        ctx.moveTo(targetAnchorX, 160);
        ctx.lineTo(node.x, node.y);
        ctx.stroke();
      });

      // Spawn falling interactive status Powerups randomly
      powerSpawnTimer--;
      if (powerSpawnTimer <= 0) {
        powerSpawnTimer = 340 + Math.random() * 200;
        const types: ('speed' | 'boost' | 'freeze')[] = ['speed', 'boost', 'freeze'];
        powerUps.push({
          x: 100 + Math.random() * 650,
          y: -15,
          type: types[Math.floor(Math.random() * types.length)],
          active: true,
          radius: 12
        });
      }

      // Update and draw active powerups
      powerUps.forEach((pup, idx) => {
        if (!pup.active) return;
        pup.y += 1.8; // fall speed
        if (pup.y > courtFloorY - 15) {
          pup.y = courtFloorY - 15;
        }

        // Draw bubble orb
        ctx.save();
        ctx.shadowBlur = 10;
        const pColors = { speed: '#eab308', boost: '#3b82f6', freeze: '#22c55e' };
        ctx.shadowColor = pColors[pup.type];
        ctx.fillStyle = pColors[pup.type];
        ctx.beginPath();
        ctx.arc(pup.x, pup.y, pup.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(pup.type[0].toUpperCase(), pup.x, pup.y + 3.2);
        ctx.restore();

        // Check user/enemy touch
        players.forEach(p => {
          const dToPower = Math.hypot(p.x - pup.x, (p.y + 15) - pup.y);
          if (dToPower < p.width / 2 + pup.radius) {
            pup.active = false;
            playSound('special');
            createSparks(pup.x, pup.y, '#f59e0b', 8);

            if (pup.type === 'speed') {
              p.speedStat += 3.5;
              triggerAlert(`${p.name} SPEED BOOST!`);
              setTimeout(() => { p.speedStat = Math.max(5, p.speedStat - 3.5); }, 5000);
            } else if (pup.type === 'boost') {
              p.superMeter = Math.min(100, p.superMeter + 45);
              triggerAlert(`${p.name} METERS CHARGED!`);
            } else if (pup.type === 'freeze') {
              // Freeze other team
              players.forEach(otherp => {
                if (otherp.team !== p.team) {
                  otherp.isStunned = true;
                  otherp.stunTimer = 110; // freeze solid!
                }
              });
              triggerAlert(`FREEZE IMPACT BY ${p.name}!`);
            }
          }
        });
      });

      // Render players
      players.forEach(p => {
        // AI execution bot
        if (p.isBot) {
          runMatchAI(p);
        } else {
          // Responsive Human controls
          // Keys setup
          if (p.isP1) {
            // Player 1 controls (WASD)
            p.vx = 0;
            if (!p.isStunned) {
              if (keysPressed.current.has('a') || keysPressed.current.has('A')) {
                p.vx = -p.speedStat * 0.5;
                p.facing = 'left';
              }
              if (keysPressed.current.has('d') || keysPressed.current.has('D')) {
                p.vx = p.speedStat * 0.5;
                p.facing = 'right';
              }
              // Jump
              if ((keysPressed.current.has('w') || keysPressed.current.has('W')) && p.y >= courtFloorY - 65) {
                p.vy = -p.jumpStat * 0.72;
                playSound('bounce');
              }
              // Dash shoot / steal / super slam
              // Shift to dash & swipe steal
              if ((keysPressed.current.has('shift')) && p.dashTimer <= 0) {
                p.vx = p.facing === 'right' ? 12 : -12;
                p.dashTimer = 81; // ticks wait
                playSound('dash');
                // Check steal overlap
                players.forEach(victim => {
                  if (victim.team !== p.team && ball.holder && ball.holder.id === victim.id) {
                    if (Math.hypot(p.x - victim.x, p.y - victim.y) < 60) {
                      triggerStealSwipe(p, victim);
                    }
                  }
                });
              }
              // Spacebar to shoot standard shot or super shot if meter is fully charged
              if (keysPressed.current.has(' ') && ball.holder && ball.holder.id === p.id) {
                ball.holder = null;
                ball.cooldownHolder = p;
                ball.cooldownTimer = 40;
                p.shootAnimTimer = 25;
                ball.x = p.x;
                ball.y = p.y - 15;

                const targetX = p.team === 'blue' ? 780 : 50;

                if (p.superMeter >= 100) {
                  p.superMeter = 0;
                  setIsSuperMode(p.name);
                  setTimeout(() => setIsSuperMode(null), 1200);
                  playSound('special');
                  ball.lastShotType = 'super';
                  
                  // Rocket shot logic
                  const arcTime = 25;
                  ball.vx = (targetX - ball.x) / arcTime;
                  ball.vy = (140 - ball.y) / arcTime - 0.5 * gravity * arcTime;
                  triggerAlert(`${p.name}: SKY FIRESHOT!`);
                  createSparks(p.x, p.y - 20, '#10b981', 15);
                } else {
                  // Standard physical parabolistic throw
                  const distToH = targetX - ball.x;
                  const t_vy = -7.5 - Math.random() * 2.5;
                  const landingTime = (-t_vy * 2) / gravity;
                  ball.vx = distToH / landingTime;
                  ball.vy = t_vy;
                  ball.lastShotType = 'normal';
                  playSound('rim');
                }
              }
            }
          } else if (p.isP2) {
            // Player 2 local opponent controls (Arrow Keys + Keypad keys '/','.')
            p.vx = 0;
            if (!p.isStunned) {
              if (keysPressed.current.has('ArrowLeft')) {
                p.vx = -p.speedStat * 0.5;
                p.facing = 'left';
              }
              if (keysPressed.current.has('ArrowRight')) {
                p.vx = p.speedStat * 0.5;
                p.facing = 'right';
              }
              // Jump
              if (keysPressed.current.has('ArrowUp') && p.y >= courtFloorY - 65) {
                p.vy = -p.jumpStat * 0.72;
                playSound('bounce');
              }
              // Steal with key 'M' or ','
              if ((keysPressed.current.has('m') || keysPressed.current.has('M') || keysPressed.current.has(',')) && p.dashTimer <= 0) {
                p.vx = p.facing === 'right' ? 12 : -12;
                p.dashTimer = 81;
                playSound('dash');
                players.forEach(victim => {
                  if (victim.team !== p.team && ball.holder && ball.holder.id === victim.id) {
                    if (Math.hypot(p.x - victim.x, p.y - victim.y) < 60) {
                      triggerStealSwipe(p, victim);
                    }
                  }
                });
              }
              // Shoot with '.' key or 'l'
              if ((keysPressed.current.has('.') || keysPressed.current.has('/')) && ball.holder && ball.holder.id === p.id) {
                ball.holder = null;
                ball.cooldownHolder = p;
                ball.cooldownTimer = 40;
                p.shootAnimTimer = 25;
                ball.x = p.x;
                ball.y = p.y - 15;

                const targetX = p.team === 'blue' ? 780 : 50;

                if (p.superMeter >= 100) {
                  p.superMeter = 0;
                  setIsSuperMode(p.name);
                  setTimeout(() => setIsSuperMode(null), 1200);
                  playSound('special');
                  ball.lastShotType = 'super';
                  
                  // Perfect flight curve
                  const arcTime = 25;
                  ball.vx = (targetX - ball.x) / arcTime;
                  ball.vy = (140 - ball.y) / arcTime - 0.5 * gravity * arcTime;
                  triggerAlert(`${p.name}: ULTRA COMBO SHOT!`);
                  createSparks(p.x, p.y - 20, '#eab308', 15);
                } else {
                  const distToH = targetX - ball.x;
                  const t_vy = -7.5 - Math.random() * 2.5;
                  const landingTime = (-t_vy * 2) / gravity;
                  ball.vx = distToH / landingTime;
                  ball.vy = t_vy;
                  ball.lastShotType = 'normal';
                  playSound('rim');
                }
              }
            }
          }
        }

        // Apply velocities on person
        p.vy += gravity;
        p.x += p.vx;
        p.y += p.vy;

        // Platform ground alignment limits
        if (p.y > courtFloorY - p.height) {
          p.y = courtFloorY - p.height;
          p.vy = 0;
        }

        // Left right screen bounds
        if (p.x < 15) p.x = 15;
        if (p.x > virtualWidth - p.width - 15) p.x = virtualWidth - p.width - 15;

        // Tick dynamic walking/throwing animation state variables
        if (p.shootAnimTimer > 0) p.shootAnimTimer--;

        if (p.isDunking) {
          p.legRotation = 1.25; // split-leg kick dunks visual
        } else if (p.y < courtFloorY - p.height - 4) {
          p.legRotation = Math.PI / 4; // bent legs inside air jump arc
        } else if (Math.abs(p.vx) > 0.1) {
          // Increase step cadence matching locomotion velocity
          p.legRotation += Math.abs(p.vx) * 0.05 + 0.08;
        } else {
          // Gradually settle joints when completely stationary
          p.legRotation = p.legRotation * 0.85;
        }

        // Progress indicators cooldowns ticks
        if (p.dashTimer > 0) p.dashTimer--;
        if (p.isStunned) {
          p.stunTimer--;
          if (p.stunTimer <= 0) p.isStunned = false;
        }

        // Slowly accumulate super powers points simply by moving around
        if (Math.abs(p.vx) > 0.1 && p.superMeter < 100 && Math.random() < 0.22) {
          p.superMeter = Math.min(100, p.superMeter + 0.4);
        }

        // --- EXAGGERATED SUPER DUNK MECHANICS TRIGGER ---
        // Player shoots directly via dunks when extremely close to targeted hoop
        const targetedHoopX = p.team === 'blue' ? 780 : 66;
        const dToHoop = Math.abs(p.x - targetedHoopX);
        if (ball.holder && ball.holder.id === p.id && dToHoop < 80 && p.y < courtFloorY - 80) {
          // Play massive action zoom
          p.isDunking = true;
          ball.holder = null;

          // Animate super slam jump trajectory immediately
          ball.x = p.facing === 'right' ? 778 : 66;
          ball.y = 170;
          ball.vx = 0;
          ball.vy = 4;
          ball.lastShotType = 'dunk';

          // Scoring alert instantly
          playSound('swish');
          createSparks(ball.x, ball.y, '#f59e0b', 18);
          triggerAlert(`${p.name}: CRITICAL SMASH DUNK!`);
          
          if (p.team === 'blue') setScoreBlue(sc => sc + 3);
          else setScoreRed(sc => sc + 3);

          if (p.team === 'blue') {
            netRightNodes.forEach(node => { node.vy += 12; node.vx += (Math.random() - 0.5) * 16; });
          } else {
            netLeftNodes.forEach(node => { node.vy += 12; node.vx += (Math.random() - 0.5) * 16; });
          }

          resetBall();
        }

        // --- PLAYER FLOOR INTERACTIVE DOCKING SHADOWS ---
        ctx.save();
        // The shadow is on the floor directly under the player
        const shadowY = courtFloorY - 2;
        // The horizontal width of shadow should squeeze/stretch based on player jump height from ground!
        const heightOffGround = courtFloorY - (p.y + p.height);
        const sScale = Math.max(0.15, 1 - heightOffGround / 185);
        
        ctx.translate(p.x + p.width / 2, shadowY);
        
        // Active indicator circle if this is the user p1
        if (p.isP1) {
          ctx.strokeStyle = 'rgba(34, 211, 238, 0.65)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(0, 0, 22 * sScale, 6 * sScale, 0, 0, Math.PI * 2);
          ctx.stroke();
        } else if (p.isP2) {
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.65)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(0, 0, 22 * sScale, 6 * sScale, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        
        let sGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, 25);
        sGrad.addColorStop(0, 'rgba(0, 0, 0, 0.42)');
        sGrad.addColorStop(1, 'rgba(0, 0, 0, 0.0)');
        
        ctx.fillStyle = sGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, 24 * sScale, 6.5 * sScale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // SUPERSTAR CARICATURE CUSTOM HEADS DRAWING SYSTEM
        ctx.save();
        const walkBobY = (Math.abs(p.vx) > 0.1) ? Math.sin(p.legRotation * 2) * 1.5 : 0;
        const idleBobY = (Math.abs(p.vx) <= 0.1 && !p.isStunned) ? Math.sin(Date.now() / 200) * 0.8 : 0;
        const leanAngle = (Math.abs(p.vx) > 0.1) ? (p.facing === 'right' ? 0.04 : -0.04) : 0;

        ctx.translate(p.x + p.width / 2, p.y + p.height / 2 + walkBobY + idleBobY);
        ctx.rotate(leanAngle);

        // Slowmo freeze ice block covering overlay glows
        if (p.isStunned) {
          ctx.shadowColor = '#3b82f6';
          ctx.shadowBlur = 12;
        }

        // Define skin color based on caricature superstar
        let skinColor = p.color;
        if (p.charType === 'lebro') {
          skinColor = '#4e2f1e'; // Warm deep brown
        } else if (p.charType === 'steph') {
          skinColor = '#e3a86c'; // Lighter sun tan
        } else if (p.charType === 'shaq') {
          skinColor = '#3f2516'; // Dark heavy charcoal
        } else if (p.charType === 'jordan') {
          skinColor = '#5e3922'; // Rich goated brown
        }

        // Draw bases head circle with 3D Spherical Lighting Radial Gradient
        let faceGrad = ctx.createRadialGradient(-6, -26, 2, 0, -18, 22);
        faceGrad.addColorStop(0, adjustColorBrightness(skinColor, 35)); // Specular highlight point on head
        faceGrad.addColorStop(0.7, skinColor);
        faceGrad.addColorStop(1, adjustColorBrightness(skinColor, -30));  // Dark shadow boundary
        
        ctx.beginPath();
        ctx.arc(0, -18, 22, 0, Math.PI * 2);
        ctx.fillStyle = faceGrad;
        ctx.fill();
        ctx.strokeStyle = '#050510';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Draw individual visual attributes per character (caricature details)
        if (p.charType === 'lebro') {
          // Wrap beard around the bottom face halves
          ctx.fillStyle = '#0a0a0f';
          ctx.beginPath();
          ctx.arc(0, -14, 22, 0, Math.PI, false);
          ctx.closePath();
          ctx.fill();

          // Black hipster frames/glasses
          ctx.strokeStyle = '#050505';
          ctx.lineWidth = 3.5;
          // Left lens
          ctx.beginPath();
          ctx.arc(-8, -18, 6, 0, Math.PI * 2);
          ctx.stroke();
          // Right lens
          ctx.beginPath();
          ctx.arc(8, -18, 6, 0, Math.PI * 2);
          ctx.stroke();
          // Bridge
          ctx.beginPath();
          ctx.moveTo(-2, -18);
          ctx.lineTo(2, -18);
          ctx.stroke();
        } else if (p.charType === 'steph') {
          // Drawn shaggy hair curls around crown
          ctx.fillStyle = '#1c1917';
          ctx.beginPath();
          // Little messy spikes
          ctx.arc(0, -32, 10, Math.PI, 0);
          ctx.arc(-10, -30, 8, Math.PI, 0);
          ctx.arc(10, -30, 8, Math.PI, 0);
          ctx.fill();

          // Thin curved mustache & chin fuzzy point
          ctx.strokeStyle = '#1c1917';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, -12, 6, Math.PI * 1.1, Math.PI * 1.9);
          ctx.stroke();
          // tiny chin speck
          ctx.fillStyle = '#1c1917';
          ctx.fillRect(-2, -7, 4, 4);
        } else if (p.charType === 'shaq') {
          // Shiny bald head flare glare arc reflect
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(0, -18, 16, Math.PI * 1.25, Math.PI * 1.75);
          ctx.stroke();

          // Funny big ears
          ctx.fillStyle = skinColor;
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 1.5;
          // Left Ear
          ctx.beginPath();
          ctx.ellipse(-24, -18, 4, 7, Math.PI / 6, 0, Math.PI * 2);
          ctx.fill(); ctx.stroke();
          // Right Ear
          ctx.beginPath();
          ctx.ellipse(24, -18, 4, 7, -Math.PI / 6, 0, Math.PI * 2);
          ctx.fill(); ctx.stroke();

          // Big silly toothy grin mouth block
          ctx.fillStyle = '#0a0f1d';
          ctx.fillRect(-10, -10, 20, 6);
          // White teeth division
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(-8, -10, 16, 2.5);
        } else if (p.charType === 'jordan') {
          // Jordan bald head flare
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(0, -18, 16, Math.PI * 1.25, Math.PI * 1.75);
          ctx.stroke();

          // Jordan's iconic pink action tongue out when moving fast or jumping
          if (p.vy !== 0 || Math.abs(p.vx) > 0.5) {
            ctx.fillStyle = '#f472b6'; // Vibrant pink tongue
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.ellipse(0, -4, 4, 7, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          }
        }

        // Beautiful solid headband wrap
        ctx.fillStyle = p.accent;
        ctx.fillRect(-20, -28, 40, 7.5);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2.0;
        ctx.strokeRect(-20, -28, 40, 7.5);

        // Highlight custom star logo in center of headband
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 6px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('★', 0, -22);

        // 3D Cartoon Glassy Eyes with Dual Specular Reflections
        ctx.save();
        const baseEyeX = p.facing === 'right' ? 6 : -14;
        
        // Draw white sclera with subtle shadow gradient inside eye
        let scleraGrad = ctx.createRadialGradient(baseEyeX - 1, -19, 1, baseEyeX, -18, 6);
        scleraGrad.addColorStop(0, '#ffffff');
        scleraGrad.addColorStop(0.85, '#ffffff');
        scleraGrad.addColorStop(1, '#e2e8f0'); // shadow edge
        
        ctx.fillStyle = scleraGrad;
        ctx.beginPath();
        ctx.arc(baseEyeX, -18, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Shiny Pupil & Iris
        const lookOffset = p.facing === 'right' ? 2.5 : -2.5;
        const pupilX = baseEyeX + lookOffset;
        const pupilY = -18;
        
        let irisColor = '#57534e'; // brown
        if (p.charType === 'steph') irisColor = '#ca8a04'; // radiant hazel/amber gold

        let irisGrad = ctx.createRadialGradient(pupilX - 0.5, pupilY - 0.5, 0.5, pupilX, pupilY, 3.2);
        irisGrad.addColorStop(0, '#000000'); // pupil core
        irisGrad.addColorStop(0.65, irisColor);
        irisGrad.addColorStop(1, '#020617'); // boundary
        
        ctx.fillStyle = irisGrad;
        ctx.beginPath();
        ctx.arc(pupilX, pupilY, 3.2, 0, Math.PI * 2);
        ctx.fill();

        // 3D Glass Hotspot shine reflection dots!
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(pupilX - 1.2, pupilY - 1.2, 1.1, 0, Math.PI * 2); // main highlight
        ctx.fill();
        
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(pupilX + 1.1, pupilY + 1.1, 0.6, 0, Math.PI * 2); // secondary ambient rebound highlight
        ctx.fill();
        ctx.restore();

        // 3D Profile Nose pointing in facing direction
        ctx.save();
        const noseDir = p.facing === 'right' ? 1 : -1;
        ctx.translate(noseDir * 18, -15);
        let noseGrad = ctx.createLinearGradient(0, -3, 0, 3);
        noseGrad.addColorStop(0, adjustColorBrightness(skinColor, 25));
        noseGrad.addColorStop(1, adjustColorBrightness(skinColor, -15));
        ctx.fillStyle = noseGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, 3.5, 4.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = 1.6;
        ctx.stroke();
        ctx.restore();

        // Expressive Athlete Mouth for Non-Shaq / Non-Jordan characters
        if (p.charType !== 'shaq' && p.charType !== 'jordan') {
          ctx.save();
          const mouthX = p.facing === 'right' ? 8 : -8;
          const mouthY = -9;
          ctx.translate(mouthX, mouthY);
          
          ctx.strokeStyle = '#020617';
          ctx.lineWidth = 2;
          
          const isAction = Math.abs(p.vx) > 0.8 || p.vy !== 0 || p.isDunking;
          if (isAction) {
            // Open energetic shouting mouth
            ctx.fillStyle = '#7f1d1d';
            ctx.beginPath();
            ctx.arc(0, 0, 4.2, 0, Math.PI * 2);
            ctx.fill(); ctx.stroke();
            
            // White teeth band
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-2.2, -2.5, 4.4, 1.6);
          } else {
            // Cool athletic smirk
            ctx.beginPath();
            ctx.arc(0, -2, 4.5, 0.1, Math.PI - 0.1);
            ctx.stroke();
          }
          ctx.restore();
        }

        // Stunned dizzy stars overhead indicators
        if (p.isStunned) {
          const orbitX = Math.sin(Date.now() / 80) * 20;
          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.arc(orbitX, -45, 4, 0, Math.PI * 2);
          ctx.fill();
        }

        // --- 3D BONE JOINTED ARM RENDERING INTERFACE ---
        const holdsBall = ball.holder && ball.holder.id === p.id;
        
        // Shoulder locations on the body coordinate frame
        const frontShoulderX = p.facing === 'right' ? 12 : -12;
        const frontShoulderY = 10;
        const backShoulderX = p.facing === 'right' ? -12 : 12;
        const backShoulderY = 10;

        // Ball's local position Relative to this player translated frame
        let relBallX = ball.x - (p.x + p.width / 2);
        let relBallY = ball.y - (p.y + p.height / 2);

        // Calculate procedural target hands
        let frontHandX = frontShoulderX + (p.facing === 'right' ? 10 : -10);
        let frontHandY = 15;
        let backHandX = backShoulderX + (p.facing === 'right' ? -10 : 10);
        let backHandY = -12;

        if (holdsBall) {
          frontHandX = relBallX;
          frontHandY = relBallY;
          backHandX = relBallX - (p.facing === 'right' ? 8 : -8);
          backHandY = relBallY + 4;
        } else if (p.shootAnimTimer > 0) {
          // Dynamic high-reaching throwing follow-through animation
          const progress = p.shootAnimTimer / 25; // starts at 1, goes to 0
          // Whip arm forward and then hold the release pose
          const whipX = Math.sin(progress * Math.PI) * (p.facing === 'right' ? 12 : -12);
          const whipY = -Math.sin(progress * Math.PI) * 10;
          frontHandX = frontShoulderX + (p.facing === 'right' ? 22 : -22) + whipX;
          frontHandY = -24 + whipY - (progress * 4);
          backHandX = backShoulderX + (p.facing === 'right' ? 14 : -14);
          backHandY = -20;
        } else if (p.isDunking || p.vy < -0.5) {
          // Slam dunk arms raised high
          frontHandX = frontShoulderX + (p.facing === 'right' ? 12 : -12);
          frontHandY = -24;
          backHandX = backShoulderX + (p.facing === 'right' ? -6 : 6);
          backHandY = -28;
        } else if (Math.abs(p.vx) > 0.2) {
          // Dynamic swing pose
          const swingAmount = Math.sin(p.legRotation) * 11;
          frontHandX = frontShoulderX + (p.facing === 'right' ? 10 : -10) + swingAmount;
          frontHandY = 16 + Math.cos(p.legRotation) * 4;
          backHandX = backShoulderX + (p.facing === 'right' ? -10 : 10) - swingAmount;
          backHandY = 14 - Math.cos(p.legRotation) * 3;
        } else {
          // Defensive stance high-low blocks
          frontHandX = frontShoulderX + (p.facing === 'right' ? 16 : -16);
          frontHandY = 15;
          backHandX = backShoulderX + (p.facing === 'right' ? -10 : 10);
          backHandY = -12; // reaching high defense block
        }

        // Draw 3D jointed bicep arm subroutine
        const drawShadedArm = (sx: number, sy: number, hx: number, hy: number, isShootingSleeve = false) => {
          ctx.save();
          // Natural limb elbow midpoint calculation
          const ex = (sx + hx) / 2 + (p.facing === 'right' ? -3 : 3);
          const ey = (sy + hy) / 2 + 7;
          
          // Outer high-contrast black contour line-board
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.quadraticCurveTo(ex, ey, hx, hy);
          ctx.strokeStyle = '#020617';
          ctx.lineWidth = 10.5;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.stroke();
          
          // Core volumetric 3D muscle render
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.quadraticCurveTo(ex, ey, hx, hy);
          ctx.lineWidth = 7.0;
          
          let armGrad = ctx.createLinearGradient(sx, sy, hx, hy + 4);
          const baseColor = isShootingSleeve ? p.accent : skinColor;
          armGrad.addColorStop(0, adjustColorBrightness(baseColor, 32)); // highlight glow
          armGrad.addColorStop(0.5, baseColor);
          armGrad.addColorStop(1, adjustColorBrightness(baseColor, -25)); // shade
          
          ctx.strokeStyle = armGrad;
          ctx.stroke();

          // Contrast compression wrist band
          ctx.beginPath();
          const armDx = hx - ex;
          const armDy = hy - ey;
          const armLen = Math.hypot(armDx, armDy) || 1;
          const wx = hx - (armDx / armLen) * 4;
          const wy = hy - (armDy / armLen) * 4;
          ctx.arc(wx, wy, 4.0, 0, Math.PI * 2);
          ctx.fillStyle = isShootingSleeve ? '#ffffff' : p.accent;
          ctx.fill();
          
          // Little five-fingered rounded fist
          ctx.fillStyle = skinColor;
          ctx.beginPath();
          ctx.arc(hx, hy, 4.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#020617';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          
          ctx.restore();
        };

        // --- DRAW BACK Perspected ARM ---
        const backSleeve = p.charType === 'lebro';
        drawShadedArm(backShoulderX, backShoulderY, backHandX, backHandY, backSleeve);

        // 3D Fabric Gloss Jersey shader
        ctx.save();
        let jerseyGrad = ctx.createLinearGradient(-15, 6, 15, 28);
        jerseyGrad.addColorStop(0, adjustColorBrightness(p.accent, 25)); // shiny side
        jerseyGrad.addColorStop(0.5, p.accent);
        jerseyGrad.addColorStop(1, adjustColorBrightness(p.accent, -35)); // shadow corner
        
        ctx.fillStyle = jerseyGrad;
        ctx.beginPath();
        // Give the shirt jersey a real tank top athletic shape with curved armholes and athletic rounded neck!
        ctx.moveTo(-14, 28);
        ctx.lineTo(-14, 10);
        // Left athletic shoulder strap
        ctx.arcTo(-14, 6, -8, 6, 4);
        ctx.lineTo(-6, 6);
        ctx.bezierCurveTo(-4, 14, 4, 14, 6, 6); // Beautiful neck collar dip
        ctx.lineTo(8, 6);
        // Right shoulder strap
        ctx.arcTo(14, 6, 14, 10, 4);
        ctx.lineTo(14, 28);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#050510';
        ctx.lineWidth = 2.2;
        ctx.stroke();

        // Draw professional contrasting jersey collar and trim borders
        ctx.strokeStyle = p.team === 'blue' ? '#3b82f6' : '#ef4444';
        ctx.lineWidth = 1.5;
        // neckline stitch
        ctx.beginPath();
        ctx.bezierCurveTo(-4, 14, 4, 14, 6, 6);
        ctx.stroke();

        // Large printed superstar jersey number with metallic embossing
        ctx.fillStyle = '#ffffff';
        ctx.font = 'black uppercase 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const numLabel = p.team === 'blue' ? '01' : '99';
        // Stroke first
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeText(numLabel, 0, 18);
        ctx.fillText(numLabel, 0, 18);
        ctx.restore();

        // --- DRAW FRONT ARM OVER TOP JERSEY ---
        const frontSleeve = p.charType === 'steph' || p.charType === 'jordan';
        drawShadedArm(frontShoulderX, frontShoulderY, frontHandX, frontHandY, frontSleeve);

        // --- DRAW 3D ATHLETIC BASKETBALL LOOSE SHORTS (TRUNKS) ---
        ctx.save();
        const shortsBaseColor = p.accent;
        let shortsGrad = ctx.createLinearGradient(-16, 24, 16, 35);
        shortsGrad.addColorStop(0, adjustColorBrightness(shortsBaseColor, 20));
        shortsGrad.addColorStop(0.5, shortsBaseColor);
        shortsGrad.addColorStop(1, adjustColorBrightness(shortsBaseColor, -30));
        
        ctx.fillStyle = shortsGrad;
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = 2.2;
        
        // Thick waistband seam
        ctx.beginPath();
        ctx.roundRect(-15.5, 23, 31, 4.5, 2);
        ctx.fill(); ctx.stroke();
        
        // Left shorts leg tube
        ctx.beginPath();
        ctx.moveTo(-15.5, 27.5);
        ctx.lineTo(-1.5, 27.5);
        ctx.lineTo(-0.5, 34);
        ctx.lineTo(-16.5, 34);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        
        // Left shorts gold/red ribbing trim edge
        ctx.fillStyle = p.team === 'blue' ? '#3b82f6' : '#ef4444';
        ctx.fillRect(-16.5, 32, 16, 2);
        ctx.strokeRect(-16.5, 32, 16, 2);
        
        // Right shorts leg tube
        ctx.beginPath();
        ctx.moveTo(1.5, 27.5);
        ctx.lineTo(15.5, 27.5);
        ctx.lineTo(16.5, 34);
        ctx.lineTo(0.5, 34);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        
        // Right shorts trim edge
        ctx.fillStyle = p.team === 'blue' ? '#3b82f6' : '#ef4444';
        ctx.fillRect(0.5, 32, 16, 2);
        ctx.strokeRect(0.5, 32, 16, 2);
        ctx.restore();

        // 3D Jointed Athletic Legs & High-Top Pro Sneaker System
        const leftLegY = 28 + Math.sin(p.legRotation) * 6;
        const rightLegY = 28 + Math.cos(p.legRotation) * 6;

        ctx.save();
        ctx.strokeStyle = '#020617';
        
        // --- DRAW LEFT LEG & SHOE ---
        // Muscle thigh segment emerging from shorts down to knee
        ctx.save();
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = 2;
        
        // Upper thigh muscles (3D colored)
        let thighGradLeft = ctx.createLinearGradient(-12, 31, -6, leftLegY - 4);
        thighGradLeft.addColorStop(0, skinColor);
        thighGradLeft.addColorStop(1, adjustColorBrightness(skinColor, -15));
        ctx.fillStyle = thighGradLeft;
        
        ctx.beginPath();
        ctx.roundRect(-12.5, 31, 7, (leftLegY - 4) - 31 + 2, 2.5);
        ctx.fill(); ctx.stroke();
        
        // Crew sock tube (3D cushion texture)
        const sockTopY = leftLegY - 8;
        const sockBottomY = leftLegY - 4;
        let sockGrad = ctx.createLinearGradient(-13, sockTopY, -5, sockBottomY);
        sockGrad.addColorStop(0, '#f8fafc'); // bright white highlight
        sockGrad.addColorStop(1, '#cbd5e1'); // soft shadow white
        
        ctx.fillStyle = sockGrad;
        ctx.beginPath();
        ctx.roundRect(-13, sockTopY, 8, sockBottomY - sockTopY + 3, 2);
        ctx.fill(); ctx.stroke();
        
        // Tiny dual stripes on crew sock ribbing
        ctx.fillStyle = p.team === 'blue' ? '#2563eb' : '#dc2626';
        ctx.fillRect(-13, sockTopY + 1.8, 8, 1.2);
        ctx.fillRect(-13, sockTopY + 3.8, 8, 1.2);
        ctx.restore();
        
        // Draw left high-top basketball sneaker
        ctx.save();
        ctx.translate(-9, leftLegY);
        // Shoe shadow/body colors (White with p.accent trim)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        // high-top boot shape
        ctx.moveTo(-5, -6);
        ctx.lineTo(3, -6);
        ctx.lineTo(4, 4);
        ctx.lineTo(-7, 4);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        
        // Toe box
        ctx.fillStyle = p.accent;
        ctx.beginPath();
        ctx.moveTo(-2, 4);
        ctx.lineTo(4, 4);
        ctx.lineTo(2, -1);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        
        // White rubber thick modern sole
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(-8, 2, 13, 3.5);
        ctx.strokeRect(-8, 2, 13, 3.5);
        
        // Tiny laces
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-3, -3); ctx.lineTo(1, -3);
        ctx.moveTo(-3, -1); ctx.lineTo(1, -1);
        ctx.stroke();
        ctx.restore();

        // --- DRAW RIGHT LEG & SHOE ---
        ctx.save();
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = 2;
        
        // Upper thigh muscles
        let thighGradRight = ctx.createLinearGradient(6, 31, 12, rightLegY - 4);
        thighGradRight.addColorStop(0, skinColor);
        thighGradRight.addColorStop(1, adjustColorBrightness(skinColor, -15));
        ctx.fillStyle = thighGradRight;
        
        ctx.beginPath();
        ctx.roundRect(5.5, 31, 7, (rightLegY - 4) - 31 + 2, 2.5);
        ctx.fill(); ctx.stroke();
        
        // Crew sock tube
        const rSockTopY = rightLegY - 8;
        const rSockBottomY = rightLegY - 4;
        let rSockGrad = ctx.createLinearGradient(5, rSockTopY, 13, rSockBottomY);
        rSockGrad.addColorStop(0, '#f8fafc');
        rSockGrad.addColorStop(1, '#cbd5e1');
        
        ctx.fillStyle = rSockGrad;
        ctx.beginPath();
        ctx.roundRect(5, rSockTopY, 8, rSockBottomY - rSockTopY + 3, 2);
        ctx.fill(); ctx.stroke();
        
        // Tiny dual stripes on crew sock
        ctx.fillStyle = p.team === 'blue' ? '#2563eb' : '#dc2626';
        ctx.fillRect(5, rSockTopY + 1.8, 8, 1.2);
        ctx.fillRect(5, rSockTopY + 3.8, 8, 1.2);
        ctx.restore();
        
        ctx.save();
        ctx.translate(9, rightLegY);
        let shoeBodyGradRight = ctx.createLinearGradient(-3, -6, 5, 4);
        shoeBodyGradRight.addColorStop(0, '#ffffff');
        shoeBodyGradRight.addColorStop(0.75, '#f1f5f9');
        shoeBodyGradRight.addColorStop(1, '#cbd5e1');
        ctx.fillStyle = shoeBodyGradRight;
        
        ctx.beginPath();
        ctx.moveTo(-3, -6);
        ctx.lineTo(5, -6);
        ctx.lineTo(6, 4);
        ctx.lineTo(-5, 4);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        
        ctx.fillStyle = p.accent;
        ctx.beginPath();
        ctx.moveTo(0, 4);
        ctx.lineTo(6, 4);
        ctx.lineTo(4, -1);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(-6, 2, 13, 3.5);
        ctx.strokeRect(-6, 2, 13, 3.5);
        
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-1, -3); ctx.lineTo(3, -3);
        ctx.moveTo(-1, -1); ctx.lineTo(3, -1);
        ctx.stroke();
        ctx.restore();

        ctx.restore();

        // Snap active ball positions
        if (ball.holder && ball.holder.id === p.id) {
          ball.x = p.x + (p.facing === 'right' ? 38 : -14);
          ball.y = p.y + 10;
        }

        ctx.restore();
      });

      // Manage Ball physics & ground bounds
      if (ball.holder) {
        // snaps ball exactly to owner hand position
        ball.vx = 0;
        ball.vy = 0;
        ball.isAirborne = false;
        ballSpinAngle = ball.holder.facing === 'right' ? 0.35 : -0.35;
      } else {
        ball.isAirborne = true;
        ball.vy += gravity;
        ball.x += ball.vx;
        ball.y += ball.vy;
        ballSpinAngle += ball.vx * 0.05 + 0.02;

        // Ground bounce boundary
        if (ball.y > courtFloorY - ball.radius) {
          ball.y = courtFloorY - ball.radius;
          ball.vy = -ball.vy * 0.75;
          ball.vx *= 0.94;
          playSound('bounce');
        }

        // Sides bounds bounces
        if (ball.x < 15 + ball.radius) {
          ball.x = 15 + ball.radius;
          ball.vx = -ball.vx * 0.6;
          playSound('bounce');
        }
        if (ball.x > virtualWidth - 15 - ball.radius) {
          ball.x = virtualWidth - 15 - ball.radius;
          ball.vx = -ball.vx * 0.6;
          playSound('bounce');
        }

        // Passives block snatch overlap checking
        players.forEach(p => {
          if (p.isStunned) return;
          if (ball.cooldownHolder && ball.cooldownHolder.id === p.id && ball.cooldownTimer > 0) {
            return;
          }

          // Distance logic
          const dToSphere = Math.hypot(p.x + p.width / 2 - ball.x, p.y + p.height / 2 - ball.y);
          if (dToSphere < 36) {
            // Snatch sphere!
            ball.holder = p;
            ball.lastTeamTouch = p.team;
            playSound('bounce');
            createSparks(ball.x, ball.y, p.color, 6);
          }
        });

        // Left basket score circle trigger detection
        const lRimCenter = 66;
        if (ball.vy > 0 && ball.y >= 155 && ball.y <= 165 && ball.x > lRimCenter - 18 && ball.x < lRimCenter + 18) {
          // Point!
          setScoreRed(s => s + (ball.lastShotType === 'super' ? 3 : 2));
          createSparks(lRimCenter, 160, '#ef4444', 18);
          triggerAlert('RED OUTSTANDING BASKET!');
          playSound('swish');
          playSound('cheer');

          // Pull net nodes downwards
          netLeftNodes.forEach(node => { node.vy += 12; node.vx += (Math.random() - 0.5) * 8; });
          resetBall();
        }

        // Right basket score circle trigger detection
        const rRimCenter = 784;
        if (ball.vy > 0 && ball.y >= 155 && ball.y <= 165 && ball.x > rRimCenter - 18 && ball.x < rRimCenter + 18) {
          // Point!
          setScoreBlue(s => s + (ball.lastShotType === 'super' ? 3 : 2));
          createSparks(rRimCenter, 160, '#38bdf8', 18);
          triggerAlert('BLUE POWER REBOUND!');
          playSound('swish');
          playSound('cheer');

          netRightNodes.forEach(node => { node.vy += 12; node.vx += (Math.random() - 0.5) * 8; });
          resetBall();
        }
      }

      // Continuous particle action trails behind the basketball in the sky!
      if (!ball.holder && Math.hypot(ball.vx, ball.vy) > 1.5) {
        const speed = Math.hypot(ball.vx, ball.vy);
        const color = ball.lastShotType === 'super' ? '#facc15' : ball.lastShotType === 'dunk' ? '#38bdf8' : 'rgba(249, 115, 22, 0.5)';
        particles.push({
          x: ball.x - (ball.vx / speed) * 8,
          y: ball.y - (ball.vy / speed) * 8,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          color,
          size: Math.random() * 4 + 3.2,
          alpha: 0.8,
          life: 0,
          maxLife: 15
        });
      }

      // Render 3D High-Fidelity Spinning Basketball
      ctx.save();
      ctx.translate(ball.x, ball.y);
      ctx.rotate(ballSpinAngle);
      
      // Shadow glow around ball
      ctx.shadowColor = 'rgba(234, 88, 12, 0.45)';
      ctx.shadowBlur = 8;

      const bRad = ball.radius;
      // offset highlights to top-left for 3D volumetric sphere lighting
      const bGrad = ctx.createRadialGradient(-bRad * 0.35, -bRad * 0.35, bRad * 0.1, 0, 0, bRad);
      bGrad.addColorStop(0, '#ffedd5'); // highlight shine spot
      bGrad.addColorStop(0.35, '#fb923c');
      bGrad.addColorStop(0.75, '#ea580c');
      bGrad.addColorStop(1, '#7c2d12'); // shadow terminator outline
      
      ctx.fillStyle = bGrad;
      ctx.beginPath();
      ctx.arc(0, 0, bRad, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 2.2;
      ctx.stroke();

      // Reset shadow for seams drawing
      ctx.shadowBlur = 0;

      // Draw real curves representing curved ribs wrapped around the sphere
      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 1.6;
      ctx.lineCap = 'round';
      
      // Horizontal centerline seam
      ctx.beginPath();
      ctx.ellipse(0, 0, bRad, bRad * 0.2, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Vertical centerline seam
      ctx.beginPath();
      ctx.ellipse(0, 0, bRad * 0.2, bRad, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Beautiful side seam circular lines
      ctx.beginPath();
      ctx.arc(-bRad * 0.72, 0, bRad * 0.65, -Math.PI / 2.5, Math.PI / 2.5);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(bRad * 0.72, 0, bRad * 0.65, Math.PI - Math.PI / 2.5, Math.PI + Math.PI / 2.5);
      ctx.stroke();

      ctx.restore();

      // Draw the beautiful floor line details
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(0, courtFloorY, virtualWidth, 4);

      // Decrement snatch ticks timers
      if (ball.cooldownTimer > 0) ball.cooldownTimer--;

      // Filter and draw sparkles
      particles.forEach((pt, index) => {
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.alpha -= 0.04;
        if (pt.alpha <= 0) {
          particles.splice(index, 1);
        } else {
          ctx.save();
          ctx.globalAlpha = pt.alpha;
          ctx.fillStyle = pt.color;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });

      // --- HIGH QUALITY DYNAMIC RETRO-ARCADE CANVAS SPLASH ALERTS ---
      if (activeSplashTimer > 0) {
        activeSplashTimer--;

        // Draw spinning giant orange physical basketball centered
        ctx.save();
        ctx.translate(virtualWidth / 2, virtualHeight / 2 - 35);
        ctx.shadowColor = 'rgba(237, 137, 54, 0.45)';
        ctx.shadowBlur = 25;
        
        ctx.rotate(Date.now() / 200);

        const ballSize = 85;
        let bGrad = ctx.createRadialGradient(-18, -18, 10, 0, 0, ballSize);
        bGrad.addColorStop(0, '#f97316');
        bGrad.addColorStop(0.85, '#dd6b20');
        bGrad.addColorStop(1, '#9a3412');
        ctx.fillStyle = bGrad;
        ctx.strokeStyle = '#0a0f1d';
        ctx.lineWidth = 5.5;

        ctx.beginPath();
        ctx.arc(0, 0, ballSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Seams
        ctx.strokeStyle = '#0a0f1d';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-ballSize, 0); ctx.lineTo(ballSize, 0);
        ctx.moveTo(0, -ballSize); ctx.lineTo(0, ballSize);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(-ballSize * 0.75, 0, ballSize * 0.65, -Math.PI / 3, Math.PI / 3);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(ballSize * 0.75, 0, ballSize * 0.65, Math.PI * 2 / 3, Math.PI * 4 / 3);
        ctx.stroke();
        
        ctx.restore();

        // Draw Comic-Book styled explosive thick yellow typography overlay
        ctx.save();
        ctx.translate(virtualWidth / 2, virtualHeight / 2 - 25);
        ctx.font = 'black italic 64px "Impact", "Arial Black", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Giant black outer border
        ctx.strokeStyle = '#0a0f1d';
        ctx.lineWidth = 16;
        ctx.strokeText(activeSplashText, 0, 0);

        // Crisp white highlighting middle outline
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 7;
        ctx.strokeText(activeSplashText, 0, 0);

        // Beautiful glowing golden face
        ctx.fillStyle = '#facc15';
        ctx.fillText(activeSplashText, 0, 0);
        ctx.restore();
      }
    };

    const resetBall = () => {
      setTimeout(() => {
        ball.x = 425;
        ball.y = 110;
        ball.vx = 0;
        ball.vy = 0;
        ball.holder = null;
        ball.cooldownHolder = null;
        players.forEach((p, idx) => {
          p.x = p.team === 'blue' ? 180 + idx * 40 : 640 - idx * 40;
          p.y = courtFloorY - 60;
          p.vx = 0;
          p.vy = 0;
          p.isStunned = false;
        });
      }, 1500);
    };

    processFrame();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [gameState, gameMode, difficulty]);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full bg-[#0a0f1d] flex flex-col items-center justify-center relative font-mono select-none overflow-hidden"
    >
      {/* Live HUD Match Scoring */}
      {gameState === 'playing' && (
        <div className="absolute top-3 left-6 right-6 z-10 flex items-center justify-between pointer-events-none">
          {/* Left Wing Support Controls: Sfx Mute */}
          <button 
            onClick={() => setSoundEnabled(prev => !prev)}
            className="pointer-events-auto p-3 bg-slate-950/90 border border-sky-500/30 rounded-2xl hover:bg-sky-500/20 shadow-lg text-sky-400 transition-all flex items-center justify-center cursor-pointer"
            title="Toggle SFX Synth"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 animate-bounce" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* BEAUTIFUL METALLIC PILL SCOREBOARD CONTAINER */}
          <div className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-4 border-slate-950 rounded-[2.2rem] px-8 py-2 flex items-center gap-6 shadow-[0_12px_40px_rgba(0,0,0,0.85),0_0_20px_rgba(14,165,233,0.15)] select-none">
            
            {/* Ambient Gold Decorative left Ring */}
            <div className="w-10 h-10 rounded-full border border-amber-400/30 bg-amber-500/10 flex items-center justify-center">
              <span className="text-amber-400 text-xs font-black animate-spin">★</span>
            </div>

            {/* Main Digital Score Counters & Green Ticking Timer */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-8 px-5 py-0.5 bg-black border border-slate-800 rounded-xl">
                {/* BLUE TEAM SCORE (GLOWING ORANGE LED) */}
                <span className="font-mono text-3xl font-black text-amber-500 tracking-wider drop-shadow-[0_0_8px_rgba(245,158,11,0.7)]">
                  {scoreBlue}
                </span>

                {/* Score dividing dot */}
                <span className="text-sky-500/50 font-black text-sm">:</span>

                {/* RED TEAM SCORE (GLOWING ORANGE LED) */}
                <span className="font-mono text-3xl font-black text-amber-500 tracking-wider drop-shadow-[0_0_8px_rgba(245,158,11,0.7)]">
                  {scoreRed}
                </span>
              </div>

              {/* Cyan/Green glow digital timer decimals */}
              <div className="mt-1 px-3 py-0.5 bg-black border border-emerald-950 rounded-lg">
                <span className="font-mono text-xs font-extrabold text-emerald-400 tracking-widest drop-shadow-[0_0_6px_rgba(52,211,153,0.8)]">
                  {timeLeft}.{Math.floor((Date.now() / 100) % 10)}
                </span>
              </div>
            </div>

            {/* Ambient Cyan Decorative right Ring */}
            <div className="w-10 h-10 rounded-full border border-cyan-400/30 bg-cyan-500/10 flex items-center justify-center">
              <span className="text-cyan-400 text-xs font-bold leading-none">🌐</span>
            </div>
          </div>

          {/* Right Wing Support Controls: Forfeit */}
          <button 
            onClick={() => setGameState('menu')}
            className="pointer-events-auto px-4 py-2.5 bg-rose-950/90 border border-rose-500/40 rounded-xl hover:bg-rose-500/35 hover:scale-105 shadow-lg text-rose-400 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
          >
            Forfeit
          </button>
        </div>
      )}

      {/* Floating alert banners */}
      <AnimatePresence>
        {alertText && (
          <motion.div
            initial={{ scale: 0.3, opacity: 0, y: 50 }}
            animate={{ scale: 1.2, opacity: 1, y: 0 }}
            exit={{ scale: 1.5, opacity: 0, y: -50 }}
            className="absolute z-40 top-1/3 bg-amber-500 text-slate-950 font-black text-3xl tracking-tighter uppercase px-8 py-3.5 rounded-3xl italic shadow-[0_10px_40px_rgba(245,158,11,0.4)] border-4 border-slate-950"
          >
            {alertText}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Special Super Skill Power Activations overlay flash */}
      <AnimatePresence>
        {isSuperMode && (
          <motion.div
            initial={{ x: -800, skewX: -20, opacity: 0 }}
            animate={{ x: 0, skewX: -10, opacity: 1 }}
            exit={{ x: 800, skewX: 20, opacity: 0 }}
            className="absolute z-30 inset-x-0 h-28 top-24 bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400 flex items-center justify-center border-y-8 border-slate-950 shadow-2xl"
          >
            <div className="text-center">
              <h3 className="text-3xl font-black text-slate-950 tracking-tight italic uppercase block leading-none">
                {isSuperMode} ACTIVATED!
              </h3>
              <p className="text-white text-sm font-black tracking-wide uppercase mt-1">ULTIMATE BASKETBALL DEFIANCE STYLE!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actual Render viewport view */}
      {gameState === 'playing' ? (
        <div className="w-full h-full relative flex items-center justify-center">
          <canvas ref={canvasRef} className="w-full h-full" />
          
          {/* Controls instructions bar helper inside layout */}
          <div className="absolute bottom-1 bg-slate-950/80 backdrop-blur-md px-6 py-2 rounded-xl text-[10px] text-slate-400 border border-slate-800 flex gap-6 uppercase tracking-wider">
            <div><span className="text-sky-400 font-bold">P1 (BLUE) CONTROLS:</span> WASD = JUMP / RUN | SPACE = SHOOT / FAST DUNKS | SHIFT = STEAL</div>
            {gameMode === 'pvp' && (
              <div><span className="text-rose-400 font-bold">P2 (RED) CONTROLS:</span> ARROWS = JUMP / RUN | . = SHOOT / DUNKS | M = SWIPE STEAL</div>
            )}
          </div>
        </div>
      ) : null}

      {/* Game Idle Menu Section */}
      {gameState === 'menu' && (
        <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-8 z-30 overflow-y-auto">
          <div className="max-w-xl w-full text-center">
            {/* Trophy Icon indicator */}
            <div className="w-20 h-20 bg-sky-500/10 rounded-3xl border border-sky-500/30 flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-10 h-10 text-sky-400 animate-pulse" />
            </div>

            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-amber-300 to-sky-500 tracking-tighter italic uppercase mb-2">
              BASKETBALL STARS
            </h1>
            <p className="text-[10px] text-sky-500 font-black tracking-[0.25em] mb-8 uppercase">
              CARTOON ARCADE 1V1 & 2V2 SPLIT CLASSIC
            </p>

            {/* Select Game Mode row */}
            <h4 className="text-xs text-slate-500 font-black mb-3 tracking-widest uppercase">SELECT MATCH MODE</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              {(['1v1', '2v2', 'pvp'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setGameMode(mode)}
                  className={`py-3.5 rounded-2xl font-black uppercase text-xs tracking-wider border transition-all ${
                    gameMode === mode
                      ? 'bg-sky-600 border-sky-400 text-white shadow-[0_0_15px_rgba(14,165,233,0.35)]'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-900'
                  }`}
                >
                  {mode === '1v1' ? '1v1 Solo AI' : mode === '2v2' ? '2v2 Chaos' : 'Local PvP (1vs1)'}
                </button>
              ))}
              <button
                onClick={() => { setGameMode('1v1'); setGameState('tournament_tree'); setTournamentRound(1); }}
                className="py-3.5 rounded-2xl font-black uppercase text-xs tracking-wider border bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-950 border-amber-400 hover:brightness-105 transition-all flex items-center justify-center gap-1.5"
              >
                <Award className="w-4 h-4 text-slate-950" />
                Tournament
              </button>
            </div>

            {/* Select difficulty if not PvP local */}
            {gameMode !== 'pvp' && (
              <div className="mb-8">
                <h4 className="text-xs text-slate-500 font-black mb-3 tracking-widest uppercase">COMPUTER DIFFICULTY</h4>
                <div className="flex justify-center gap-3">
                  {(['easy', 'medium', 'pro'] as const).map(diff => (
                    <button
                      key={diff}
                      onClick={() => setDifficulty(diff)}
                      className={`px-5 py-2.5 rounded-xl font-bold uppercase text-xs tracking-wider border transition-all ${
                        difficulty === diff
                          ? 'bg-amber-500 border-amber-400 text-slate-950 font-black'
                          : 'bg-slate-900/40 border-slate-800 text-slate-500 hover:bg-slate-900'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => { setGameState('charSelect'); playSound('special'); }}
              className="w-full py-4 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black uppercase rounded-2xl transition-all tracking-[0.1em] shadow-[0_4px_25px_rgba(14,165,233,0.25)] flex items-center justify-center gap-2 text-md border-b-4 border-sky-700"
            >
              <Play className="w-5 h-5 fill-slate-950" />
              CHOOSE YOUR SUPERSTAR
            </button>
          </div>
        </div>
      )}

      {/* Character Selection Screen */}
      {gameState === 'charSelect' && (
        <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-8 z-30 overflow-y-auto">
          <div className="max-w-4xl w-full">
            <h2 className="text-3xl font-black text-white italic tracking-tight text-center mb-1 uppercase">
              CHOOSE ROSTER SUPERSTARS
            </h2>
            <p className="text-xs text-slate-500 text-center mb-8 uppercase tracking-widest">
              EACH LEGEND RECOUNTS STATS POWERED BY EXAGGERATED CARTOON ABILITIES
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Player 1 Selection block */}
              <div className="bg-slate-900/40 p-6 border border-slate-800 rounded-3xl">
                <h3 className="text-sky-400 text-xs font-black mb-4 uppercase tracking-widest">PLAYER 1 TEAM HERO</h3>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {CHARACTERS.map(char => (
                    <button
                      key={char.id}
                      onClick={() => setSelectedCharId(char.id)}
                      className={`p-4 rounded-2xl text-left border transition-all ${
                        selectedCharId === char.id
                          ? 'bg-sky-600/20 border-sky-400'
                          : 'bg-slate-950/60 border-slate-900 hover:border-slate-800'
                      }`}
                    >
                      <div className="text-sm font-black text-white">{char.name}</div>
                      <div className="text-[9px] text-slate-400 font-bold block mt-1">{char.sub}</div>
                    </button>
                  ))}
                </div>

                {/* Stat Bars for selection 1 */}
                {(() => {
                  const selectC = CHARACTERS.find(c => c.id === selectedCharId)!;
                  return (
                    <div className="space-y-3">
                      <div className="text-xs font-black text-amber-400 uppercase tracking-widest mb-1">ABILITIES: {selectC.specialName}</div>
                      <p className="text-[10px] text-slate-400 uppercase leading-relaxed mb-4">{selectC.specialDesc}</p>
                      
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] text-slate-400 font-extrabold"><span>VELOCITY/SPEED</span><span>{selectC.speed}/10</span></div>
                        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800"><div className="bg-sky-500 h-full" style={{ width: `${selectC.speed * 10}%` }} /></div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] text-slate-400 font-extrabold"><span>VERTICAL JUMP</span><span>{selectC.jump}/10</span></div>
                        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800"><div className="bg-emerald-500 h-full" style={{ width: `${selectC.jump * 10}%` }} /></div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] text-slate-400 font-extrabold"><span>ARC SHOOTING</span><span>{selectC.shoot}/10</span></div>
                        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800"><div className="bg-amber-400 h-full" style={{ width: `${selectC.shoot * 10}%` }} /></div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Player 2 / CPU Selection block */}
              <div className="bg-slate-900/40 p-6 border border-slate-800 rounded-3xl">
                <h3 className="text-rose-400 text-xs font-black mb-4 uppercase tracking-widest">
                  {gameMode === 'pvp' ? 'PLAYER 2 TEAM CHAMPION' : 'COMPUTER CHAMPION'}
                </h3>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {CHARACTERS.map(char => (
                    <button
                      key={char.id}
                      onClick={() => setSelectedCharIdP2(char.id)}
                      className={`p-4 rounded-2xl text-left border transition-all ${
                        selectedCharIdP2 === char.id
                          ? 'bg-rose-600/20 border-rose-400'
                          : 'bg-slate-950/60 border-slate-900 hover:border-slate-800'
                      }`}
                    >
                      <div className="text-sm font-black text-white">{char.name}</div>
                      <div className="text-[9px] text-slate-400 font-bold block mt-1">{char.sub}</div>
                    </button>
                  ))}
                </div>

                {/* Stat Bars for selection 2 */}
                {(() => {
                  const selectC = CHARACTERS.find(c => c.id === selectedCharIdP2)!;
                  return (
                    <div className="space-y-3">
                      <div className="text-xs font-black text-rose-400 uppercase tracking-widest mb-1">ABILITIES: {selectC.specialName}</div>
                      <p className="text-[10px] text-slate-400 uppercase leading-relaxed mb-4">{selectC.specialDesc}</p>
                      
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] text-slate-400 font-extrabold"><span>VELOCITY/SPEED</span><span>{selectC.speed}/10</span></div>
                        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800"><div className="bg-rose-500 h-full" style={{ width: `${selectC.speed * 10}%` }} /></div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] text-slate-400 font-extrabold"><span>VERTICAL JUMP</span><span>{selectC.jump}/10</span></div>
                        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800"><div className="bg-emerald-500 h-full" style={{ width: `${selectC.jump * 10}%` }} /></div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] text-slate-400 font-extrabold"><span>ARC SHOOTING</span><span>{selectC.shoot}/10</span></div>
                        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800"><div className="bg-amber-400 h-full" style={{ width: `${selectC.shoot * 10}%` }} /></div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Launch Layout Button Action */}
            <div className="flex justify-between items-center bg-slate-900/80 p-5 rounded-3xl border border-slate-800">
              <button 
                onClick={() => setGameState('menu')}
                className="px-6 py-4 bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold uppercase rounded-2xl text-xs tracking-wider"
              >
                Return Home
              </button>

              <button
                onClick={startMatch}
                className="px-10 py-4 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black uppercase rounded-2xl transition-all tracking-[0.1em] shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:brightness-105 active:scale-95 text-sm flex items-center gap-2"
              >
                <Swords className="w-5 h-5" />
                ENGAGE SYSTEMS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tournament Tree Bracket screen */}
      {gameState === 'tournament_tree' && (
        <div className="absolute inset-0 bg-slate-950/98 flex flex-col items-center justify-center p-8 z-30">
          <div className="max-w-xl w-full text-center">
            <Award className="w-16 h-16 text-amber-400 mx-auto mb-6 animate-bounce" />
            <h2 className="text-3xl font-black text-white italic tracking-tight uppercase mb-2">TOURNAMENT BRACKET</h2>
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-10">DEFEAT THREE LEGENDS IN SEQUENCE TO SEIZE THE COVETED STYLIZED GOLDEN HEADER CUP</p>
            
            <div className="space-y-6 mb-10 text-left max-w-sm mx-auto">
              {/* Round 1 */}
              <div className="flex items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800">
                <span className="text-xs font-black uppercase">Quarter Finals (Round 1)</span>
                <span className={`text-xs px-3 py-1 rounded-full font-black uppercase ${tournamentRound > 1 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                  {tournamentRound > 1 ? 'COMPLETED' : 'ACTIVE'}
                </span>
              </div>
              {/* Round 2 */}
              <div className="flex items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800">
                <span className="text-xs font-black uppercase">Semi Finals (Round 2)</span>
                <span className={`text-xs px-3 py-1 rounded-full font-black uppercase ${tournamentRound > 2 ? 'bg-emerald-500/10 text-emerald-400' : tournamentRound === 2 ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-950 text-slate-600'}`}>
                  {tournamentRound > 2 ? 'COMPLETED' : tournamentRound === 2 ? 'ACTIVE' : 'LOCKED'}
                </span>
              </div>
              {/* Round 3 */}
              <div className="flex items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800">
                <span className="text-xs font-black uppercase">Grand Finals (Cup Round)</span>
                <span className={`text-xs px-3 py-1 rounded-full font-black uppercase ${tournamentRound === 3 ? 'bg-amber-500/10 text-yellow-400' : 'bg-slate-950 text-slate-600'}`}>
                  {tournamentRound === 3 ? 'PLAYING NOW' : 'LOCKED'}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                // Pick target tournament opponent dynamically
                const oppId = tournamentOpponents[tournamentRound - 1] || 'jordan';
                setSelectedCharIdP2(oppId);
                startMatch();
              }}
              className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase rounded-2xl transition-all"
            >
              LAUNCH ROUND {tournamentRound}
            </button>
          </div>
        </div>
      )}

      {/* Game Over outcome split module */}
      {gameState === 'gameover' && (
        <div className="absolute inset-0 bg-slate-950/98 backdrop-blur-md flex items-center justify-center p-8 z-30 font-mono">
          <div className="max-w-md w-full bg-slate-900 border border-red-500/25 p-8 rounded-[2rem] text-center shadow-[0_0_50px_rgba(239,68,68,0.1)]">
            <h2 className="text-4xl font-black text-rose-500 mb-2 uppercase italic tracking-tight">
              STAGE EXPIRED
            </h2>
            <div className="text-[10px] text-rose-400 font-extrabold tracking-widest mb-8 uppercase">
              ATTEMPT COMPLETE - MATCH CONCLUDED
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="text-[9px] text-slate-500 font-black tracking-widest uppercase mb-1">SCORE BLUE</div>
                <div className="text-3xl text-sky-400 font-black italic">{scoreBlue}</div>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="text-[9px] text-slate-500 font-black tracking-widest uppercase mb-1">SCORE RED</div>
                <div className="text-3xl text-rose-500 font-black italic">{scoreRed}</div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setGameState('menu')}
                className="w-1/2 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black uppercase rounded-2xl transition-all"
              >
                Home Exit
              </button>
              <button
                onClick={startMatch}
                className="w-1/2 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-black uppercase rounded-2xl transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Rematch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Victory / Tournament Podium Section */}
      {gameState === 'winner_podium' && (
        <div className="absolute inset-0 bg-slate-950/98 backdrop-blur-md flex items-center justify-center p-8 z-30 font-mono">
          <div className="max-w-md w-full bg-slate-900 border border-amber-500/25 p-8 rounded-[2rem] text-center shadow-[0_0_50px_rgba(245,158,11,0.2)]">
            <Award className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-bounce" />
            
            <h2 className="text-4xl font-black text-yellow-400 mb-2 uppercase italic tracking-tight">
              TOURNAMENT WINNER
            </h2>
            <div className="text-[10px] text-amber-300 font-extrabold tracking-widest mb-8 uppercase">
              YOU ARE THE COVETED ARCADE SUPREME CHAMPION!
            </div>

            <p className="text-slate-400 text-xs uppercase leading-relaxed mb-8">
              Congratulations! You dominated consecutive legends and lifted the master gold basket trophy with outstanding super dunks!
            </p>

            <button
              onClick={() => setGameState('menu')}
              className="w-full py-4 bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-950 font-black uppercase rounded-2xl transition-all hover:brightness-105"
            >
              Collect Rewards & Exit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
