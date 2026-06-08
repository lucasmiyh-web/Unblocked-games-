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

  // advanced mechanics optional fields
  dashActiveTimer?: number;
  dashDirection?: 'left' | 'right';
  dunkLaunchX?: number;
  dunkLaunchY?: number;
  perfectSwipeGrace?: number;
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

const CurryPeeking = () => (
  <svg className="w-24 h-24 animate-bounce" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="30" fill="#e3a86c" stroke="#1c1917" strokeWidth="3" />
    <path d="M22 45C19 32 30 20 50 20C70 20 81 32 78 45" fill="#1c1917" />
    <circle cx="35" cy="27" r="4" fill="#1c1917"/>
    <circle cx="45" cy="23" r="5" fill="#1c1917"/>
    <circle cx="55" cy="23" r="5" fill="#1c1917"/>
    <circle cx="65" cy="27" r="4" fill="#1c1917"/>
    <rect x="20" y="32" width="60" fill="#2563eb" stroke="#1c1917" strokeWidth="2.5" height="10"/>
    <text x="50" y="40" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">★</text>
    <ellipse cx="38" cy="54" rx="5" ry="3" fill="#ffffff" stroke="#1c1917" strokeWidth="2" />
    <circle cx="39" cy="54" r="2" fill="#ca8a04" />
    <ellipse cx="62" cy="54" rx="5" ry="3" fill="#ffffff" stroke="#1c1917" strokeWidth="2" />
    <circle cx="61" cy="54" r="2" fill="#ca8a04" />
    <path d="M47 54C47 54 50 58 53 54" stroke="#1c1917" strokeWidth="2" strokeLinecap="round" />
    <path d="M35 68C40 76 60 76 65 68" stroke="#1c1917" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    <rect x="47" y="70" width="6" height="6" fill="#1c1917" rx="1" />
    <path d="M42 62C45 61 55 61 58 62" stroke="#1c1917" strokeWidth="2" fill="none" />
  </svg>
);

const LeBronPeeking = () => (
  <svg className="w-24 h-24 animate-bounce" style={{ animationDelay: '0.15s' }} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="30" fill="#4e2f1e" stroke="#050510" strokeWidth="3" />
    <path d="M26 38C34 26 66 26 74 38" stroke="rgba(255,255,255,0.3)" strokeWidth="3" strokeLinecap="round" />
    <path d="M20 50C20 68 30 80 50 80C70 80 81 68 81 50" fill="#0a0a0f" stroke="#050510" strokeWidth="2" />
    <rect x="20" y="32" width="60" fill="#eab308" stroke="#1c1917" strokeWidth="2.5" height="10"/>
    <text x="50" y="40" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">★</text>
    <circle cx="38" cy="50" r="7" stroke="#050505" strokeWidth="3" fill="none" />
    <circle cx="62" cy="50" r="7" stroke="#050505" strokeWidth="3" fill="none" />
    <line x1="45" y1="50" x2="55" y2="50" stroke="#050505" strokeWidth="3" />
    <circle cx="38" cy="50" r="2.5" fill="#ffffff" />
    <circle cx="38" cy="50" r="1.2" fill="#000000" />
    <circle cx="62" cy="50" r="2.5" fill="#ffffff" />
    <circle cx="62" cy="50" r="1.2" fill="#000000" />
    <path d="M42 66C44 68 56 68 58 66" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const HUDPlayerHead = ({ charId }: { charId: string }) => {
  if (charId === 'lebro') {
    return (
      <svg className="w-11 h-11" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Head */}
        <circle cx="50" cy="50" r="30" fill="#4e2f1e" stroke="#000000" strokeWidth="2.5" />
        {/* Beard / Hair background */}
        <path d="M20 50C20 68 30 80 50 80C70 80 80 68 80 50" fill="#0c0c12" stroke="#000000" strokeWidth="2.5" />
        {/* Headband */}
        <rect x="20" y="22" width="60" height="11" fill="#facc15" stroke="#000000" strokeWidth="2.5" />
        <text x="50" y="30" fill="#ffffff" fontSize="8" fontWeight="black" textAnchor="middle">★</text>
        {/* Glasses */}
        <circle cx="36" cy="46" r="8" stroke="#000000" strokeWidth="3" fill="none" />
        <circle cx="64" cy="46" r="8" stroke="#000000" strokeWidth="3" fill="none" />
        <line x1="44" y1="46" x2="56" y2="46" stroke="#000000" strokeWidth="3" />
        <circle cx="36" cy="46" r="2.5" fill="#ffffff" />
        <circle cx="64" cy="46" r="2.5" fill="#ffffff" />
        {/* Smiling toothy mouth */}
        <path d="M35 62C40 70 60 70 65 62" fill="#ffffff" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="50" y1="62" x2="50" y2="67" stroke="#000000" strokeWidth="1.5" />
      </svg>
    );
  } else if (charId === 'steph') {
    return (
      <svg className="w-11 h-11" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Curly hair around crown */}
        <circle cx="50" cy="36" r="32" fill="#1c1917" />
        <circle cx="35" cy="38" r="16" fill="#1c1917" />
        <circle cx="65" cy="38" r="16" fill="#1c1917" />
        {/* Head */}
        <circle cx="50" cy="50" r="30" fill="#e3a86c" stroke="#000000" strokeWidth="2.5" />
        {/* Headband */}
        <rect x="20" y="22" width="60" height="11" fill="#2563eb" stroke="#000000" strokeWidth="2.5" />
        <text x="50" y="30" fill="#ffffff" fontSize="8" fontWeight="black" textAnchor="middle">★</text>
        {/* Mustache & beard */}
        <path d="M38 60C45 64 55 64 62 60" stroke="#1c1917" strokeWidth="2" fill="none" />
        <rect x="47" y="66" width="6" height="6" fill="#1c1917" rx="1" />
        {/* Smiling mouth */}
        <path d="M38 68C42 74 58 74 62 68" stroke="#1c1917" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* Eyes */}
        <ellipse cx="38" cy="48" rx="4" ry="2.5" fill="#ffffff" stroke="#000000" strokeWidth="1.5" />
        <circle cx="39" cy="48" r="1.5" fill="#ca8a04" />
        <ellipse cx="62" cy="48" rx="4" ry="2.5" fill="#ffffff" stroke="#000000" strokeWidth="1.5" />
        <circle cx="61" cy="48" r="1.5" fill="#ca8a04" />
      </svg>
    );
  } else if (charId === 'shaq') {
    return (
      <svg className="w-11 h-11" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Left Ear */}
        <ellipse cx="17" cy="50" rx="5" ry="9" fill="#3f2516" stroke="#000000" strokeWidth="1.5" />
        {/* Right Ear */}
        <ellipse cx="83" cy="50" rx="5" ry="9" fill="#3f2516" stroke="#000000" strokeWidth="1.5" />
        {/* Head */}
        <circle cx="50" cy="50" r="30" fill="#3f2516" stroke="#000000" strokeWidth="2.5" />
        {/* Headband */}
        <rect x="20" y="22" width="60" height="11" fill="#cbd5e1" stroke="#000000" strokeWidth="2.5" />
        <text x="50" y="30" fill="#000000" fontSize="8" fontWeight="black" textAnchor="middle">★</text>
        {/* Big teeth grin */}
        <rect x="35" y="60" width="30" height="9" fill="#000000" rx="1" />
        <rect x="37" y="60" width="26" height="3.5" fill="#ffffff" rx="0.5" />
        {/* Eyes */}
        <ellipse cx="38" cy="48" rx="4.5" ry="3" fill="#ffffff" stroke="#000000" strokeWidth="1.5" />
        <circle cx="38" cy="48" r="1.5" fill="#000000" />
        <ellipse cx="62" cy="48" rx="4.5" ry="3" fill="#ffffff" stroke="#000000" strokeWidth="1.5" />
        <circle cx="62" cy="48" r="1.5" fill="#000000" />
      </svg>
    );
  } else { // jordan
    return (
      <svg className="w-11 h-11" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Head */}
        <circle cx="50" cy="50" r="30" fill="#5e3922" stroke="#000000" strokeWidth="2.5" />
        {/* Headband */}
        <rect x="20" y="22" width="60" height="11" fill="#dc2626" stroke="#000000" strokeWidth="2.5" />
        <text x="50" y="30" fill="#ffffff" fontSize="8" fontWeight="black" textAnchor="middle">★</text>
        {/* Big pink tongue out! */}
        <ellipse cx="50" cy="68" rx="6" ry="10" fill="#f472b6" stroke="#000000" strokeWidth="1.8" />
        <line x1="50" y1="60" x2="50" y2="72" stroke="#000000" strokeWidth="1.2" />
        {/* Grinning mouth details around tongue */}
        <path d="M34 58C38 64 62 64 66 58" stroke="#000000" strokeWidth="2" fill="none" />
        {/* Eyes */}
        <ellipse cx="37" cy="47" rx="5" ry="3.5" fill="#ffffff" stroke="#000000" strokeWidth="1.5" />
        <circle cx="38" cy="47" r="1.5" fill="#000000" />
        <ellipse cx="63" cy="47" rx="5" ry="3.5" fill="#ffffff" stroke="#000000" strokeWidth="1.5" />
        <circle cx="62" cy="47" r="1.5" fill="#000000" />
      </svg>
    );
  }
};

const SevenSegmentDigit = ({ value, color = '#ff9f00' }: { value: number; color?: string }) => {
  // Map of digit to active segments: a, b, c, d, e, f, g
  const segmentsMap: Record<number, boolean[]> = {
    0: [true, true, true, true, true, true, false],
    1: [false, true, true, false, false, false, false],
    2: [true, true, false, true, true, false, true],
    3: [true, true, true, true, false, false, true],
    4: [false, true, true, false, false, true, true],
    5: [true, false, true, true, false, true, true],
    6: [true, false, true, true, true, true, true],
    7: [true, true, true, false, false, false, false],
    8: [true, true, true, true, true, true, true],
    9: [true, true, true, true, false, true, true],
  };

  const active = segmentsMap[value] || [false, false, false, false, false, false, false];

  const segments = [
    { id: 'a', d: 'M 4 2 L 20 2 L 17 5 L 7 5 Z' },         // segment a
    { id: 'b', d: 'M 21 3 L 21 19 L 18 17 L 18 6 Z' },     // segment b
    { id: 'c', d: 'M 21 21 L 21 37 L 18 34 L 18 23 Z' },   // segment c
    { id: 'd', d: 'M 4 38 L 20 38 L 17 35 L 7 35 Z' },     // segment d
    { id: 'e', d: 'M 3 21 L 3 37 L 6 34 L 6 23 Z' },       // segment e
    { id: 'f', d: 'M 3 3 L 3 19 L 6 17 L 6 6 Z' },         // segment f
    { id: 'g', d: 'M 5 20 L 19 20 L 16 18 L 8 18 Z' },     // segment g
  ];

  const offColor = 'rgba(255, 144, 0, 0.05)';

  return (
    <svg className="w-5 h-8 select-none scale-110" viewBox="0 0 24 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      {segments.map((seg, idx) => {
        const isOn = active[idx];
        return (
          <path
            key={seg.id}
            d={seg.d}
            fill={isOn ? color : offColor}
            filter={isOn ? `drop-shadow(0 0 3px ${color}80)` : undefined}
            className="transition-all duration-150"
          />
        );
      })}
    </svg>
  );
};

const Yep10Badge = () => (
  <div className="flex items-center gap-1.5 bg-[#170e2b] border-2 border-[#10b981] rounded-2xl px-3 py-1 text-white shadow-xl pointer-events-auto">
    <svg className="w-6 h-6 animate-pulse" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="35" fill="#0284c7" stroke="#ffffff" strokeWidth="4" />
      <path d="M15 50L5 35L5 65Z" fill="#ff7043" stroke="#ffffff" strokeWidth="3" />
      <circle cx="60" cy="45" r="14" fill="#ffffff" stroke="#000000" strokeWidth="3" />
      <circle cx="62" cy="43" r="5" fill="#000000" />
      <circle cx="60" cy="41" r="1.8" fill="#ffffff" />
      <path d="M40 70C50 78 70 70 70 70" stroke="#000000" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M50 71L53 76L56 71Z" fill="#ffffff" stroke="#000000" strokeWidth="1.2" />
    </svg>
    <div className="flex flex-col text-left">
      <span className="text-[10px] font-black tracking-widest text-[#10b981] italic leading-none font-mono">YEP10</span>
      <span className="text-[6px] font-bold text-pink-400 uppercase tracking-tighter leading-none">Arcade Labs</span>
    </div>
  </div>
);

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
  const [p1SuperMeter, setP1SuperMeter] = useState(30);

  // Tournament flow variables
  const [tournamentRound, setTournamentRound] = useState(1); // 1 = Quarter, 2 = Semi, 3 = Finals
  const [tournamentOpponents, setTournamentOpponents] = useState<string[]>(['steph', 'shaq', 'jordan']);
  const [tournamentWinner, setTournamentWinner] = useState<string | null>(null);

  // Audio configuration ref
  const audioCtxRef = useRef<AudioContext | null>(null);
  const keysPressed = useRef<Set<string>>(new Set());
  const splashTriggerRef = useRef<((text: string) => void) | null>(null);
  const lastP1SuperMeterRef = useRef(30);

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
      
      // Prevent browser default scrolling behavior for Arrow keys and Spacebar during active gameplay
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k) && gameState === 'playing') {
        e.preventDefault();
      }
      initAudio();
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      keysPressed.current.delete(k);
      keysPressed.current.delete(e.key);
      keysPressed.current.delete(e.key.toUpperCase()); // Fix Shift-release key locks (e.g. holding shift then releasing key)
    };
    const handleBlur = () => {
      keysPressed.current.clear();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [gameState]);

  // Clear keys state on game state transitions to avoid stuck locomotion
  useEffect(() => {
    keysPressed.current.clear();
  }, [gameState]);

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
      lastShotType: 'normal' as 'normal' | 'super' | 'dunk',
      isScoring: false
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

          const targetX = bot.team === 'blue' ? 786 : 64;
          const accuracyError = (10 - bot.shootStat) * 4 * (Math.random() - 0.5);
          const finalTargetX = targetX + accuracyError;

          const startX = ball.x;
          const startY = ball.y;
          const targetY = 155;
          const dist = Math.abs(finalTargetX - startX);
          const peakY = Math.min(60, Math.min(startY, targetY) - 50 - dist * 0.12);

          const h_rise = startY - peakY;
          const t_rise = Math.sqrt(Math.max(1, (2 * h_rise) / gravity));
          const h_fall = targetY - peakY;
          const t_fall = Math.sqrt(Math.max(1, (2 * h_fall) / gravity));
          const totalTime = t_rise + t_fall;

          ball.vx = (finalTargetX - startX) / totalTime;
          ball.vy = -Math.sqrt(Math.max(1, 2 * gravity * h_rise));
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

        // Try action dash or swipe
        if (bot.dashTimer <= 0 && ballDist > 120 && ballDist < 250 && Math.random() < 0.12) {
          bot.dashTimer = 300; // 5 seconds cooldown
          bot.dashActiveTimer = 8;
          bot.dashDirection = ball.holder.x > bot.x ? 'right' : 'left';
          playSound('dash');
          createSparks(bot.x + bot.width/2, bot.y + bot.height/2, '#a855f7', 15);
        } else if (ballDist < 50 && Math.random() < 0.06 && bot.dashTimer <= 0) {
          triggerStealSwipe(bot, ball.holder);
          bot.dashTimer = 300; // 5 seconds cooldown
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
    let screenShakeTimer = 0;
    let shakeAmplitude = 0;
    splashTriggerRef.current = (splashWord: string) => {
      activeSplashText = splashWord;
      activeSplashTimer = 75;
    };

    // Main interval tick
    let animId = 0;
    let lastTime = performance.now();
    const fpsInterval = 1000 / 60; // 60 FPS target

    const processFrame = (timestamp: number) => {
      animId = requestAnimationFrame(processFrame);
      const elapsed = timestamp - lastTime;

      if (elapsed < fpsInterval) {
        return;
      }

      lastTime = timestamp - (elapsed % fpsInterval);

      // Apply screen shake translation
      ctx.save();
      if (screenShakeTimer > 0) {
        const dx = (Math.random() - 0.5) * shakeAmplitude;
        const dy = (Math.random() - 0.5) * shakeAmplitude;
        ctx.translate(dx, dy);
        screenShakeTimer--;
      }

      // --- HIGH QUALITY CARTOON SPORTS BACKGROUND ARENA ---
      // Draw general backing board wall with realistic retro brick tile colors
      ctx.fillStyle = '#3a2754'; // Deep plum brick background
      ctx.fillRect(0, 0, virtualWidth, virtualHeight);

      // Draw horizontal-vertical brick line grids for stadium texture
      ctx.strokeStyle = '#231536'; // Dark purple brick joint lines
      ctx.lineWidth = 2.0;
      const brickH = 18;
      const brickW = 40;
      for (let r = 0; r < 230; r += brickH) {
        ctx.beginPath();
        ctx.moveTo(0, r);
        ctx.lineTo(virtualWidth, r);
        ctx.stroke();

        let rowIdx = Math.floor(r / brickH);
        let offset = (rowIdx % 2) * (brickW / 2);
        for (let c = offset - brickW; c < virtualWidth + brickW; c += brickW) {
          ctx.beginPath();
          ctx.moveTo(c, r);
          ctx.lineTo(c, r + brickH);
          ctx.stroke();
        }
      }

      // Render 3 sweeping soft white spotlight cones radiating down
      const spotCenters = [130, 425, 720];
      spotCenters.forEach(centerX => {
        let spotGrad = ctx.createLinearGradient(centerX, 0, centerX, 240);
        spotGrad.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
        spotGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.06)');
        spotGrad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
        ctx.fillStyle = spotGrad;

        ctx.beginPath();
        ctx.moveTo(centerX - 15, 0);
        ctx.lineTo(centerX + 15, 0);
        ctx.lineTo(centerX + 110, 235);
        ctx.lineTo(centerX - 110, 235);
        ctx.closePath();
        ctx.fill();
      });

      // Draw stadium spectator seats rows in background behind the kids
      for (let fx = 25; fx < virtualWidth + 30; fx += 34) {
        ctx.save();
        ctx.translate(fx, 218);
        
        // Seat base frame
        ctx.fillStyle = '#1c0c2a';
        ctx.fillRect(-14, 2, 28, 6);

        // Indigo stadium plastic seat backrest
        ctx.fillStyle = '#5c458a';
        ctx.strokeStyle = '#321c54';
        ctx.lineWidth = 1.8;
        
        // Rounded backrest
        ctx.beginPath();
        ctx.roundRect(-10, -18, 20, 20, 4);
        ctx.fill();
        ctx.stroke();

        // Inner contour definition for plastic design
        ctx.fillStyle = '#4c357a';
        ctx.beginPath();
        ctx.roundRect(-7, -15, 14, 14, 3);
        ctx.fill();

        ctx.restore();
      }

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

        // Spectator signboards: G, L, H, F held high above spectators 6, 7, 8, 9 (indices 5, 6, 7, 8)
        const spectatorIdx = Math.floor((fx - 25) / 34);
        if (spectatorIdx >= 5 && spectatorIdx <= 8) {
          const letters = ['G', 'L', 'H', 'F'];
          const letter = letters[spectatorIdx - 5];

          // Sign pole
          ctx.strokeStyle = '#d1d5db';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(0, -6);
          ctx.lineTo(0, -26);
          ctx.stroke();

          // Sign plate box
          ctx.fillStyle = '#38bdf8'; // Blue layout plates from screenshot
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.roundRect(-9, -44, 18, 20, 2);
          ctx.fill();
          ctx.stroke();

          // Draw the sign letter
          ctx.fillStyle = '#ffffff';
          ctx.font = 'black bold 13px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(letter, 0, -34);
        }

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

      // Draw "MAD PUFFERS" sponsor board on the stadium fence/backboard
      ctx.save();
      const bannerW = 200;
      const bannerH = 45;
      const bannerX = (virtualWidth - bannerW) / 2;
      const bannerY = 180; // sitting neatly on top of the green rail (which is at y=230)
      
      // Banner body
      ctx.fillStyle = '#b1c3d1'; // Silver/light-blue background
      ctx.strokeStyle = '#546b7a';
      ctx.lineWidth = 3;
      ctx.fillRect(bannerX, bannerY, bannerW, bannerH);
      ctx.strokeRect(bannerX, bannerY, bannerW, bannerH);
      
      // Draw screws on corners
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.arc(bannerX + 5, bannerY + 5, 2, 0, Math.PI * 2);
      ctx.arc(bannerX + bannerW - 5, bannerY + 5, 2, 0, Math.PI * 2);
      ctx.arc(bannerX + 5, bannerY + bannerH - 5, 2, 0, Math.PI * 2);
      ctx.arc(bannerX + bannerW - 5, bannerY + bannerH - 5, 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw Cartoon Face (Mad Puffers comic monster) on left side of banner
      ctx.save();
      ctx.translate(bannerX + 25, bannerY + 22);
      // Main dark slate round head
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();
      
      // Eyeballs
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-4, -4, 4, 0, Math.PI * 2);
      ctx.arc(4, -4, 4, 0, Math.PI * 2);
      ctx.fill();
      // Pupils looking crazy (one small, one big)
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(-4, -4, 1.8, 0, Math.PI * 2);
      ctx.arc(4, -4, 2.5, 0, Math.PI * 2);
      ctx.fill();
      
      // Wide open toothy grin mouth
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(0, 4, 6, 0, Math.PI, false);
      ctx.stroke();
      // Cute vertical teeth lines
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-3, 4, 1, 3);
      ctx.fillRect(0, 4, 1, 3);
      ctx.fillRect(3, 4, 1, 3);
      ctx.restore();
      
      // Draw "MAD PUFFERS" Text
      ctx.fillStyle = '#1f2937'; // Deep slate text
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('MAD', bannerX + 48, bannerY + 20);
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('PUFFERS', bannerX + 48, bannerY + 36);
      ctx.restore();

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

      // Render interactive string nets with 3D physical reactiveness and beautiful diamond-mesh design
      
      // Update physics spring constraints on Left Net nodes
      netLeftNodes.forEach((node, i) => {
        const targetAnchorX = 48 + (80 - 48) * (i / 5);
        node.vx += (targetAnchorX - node.x) * 0.15;
        node.vy += (node.oy - node.y) * 0.15;
        node.vx *= 0.82;
        node.vy *= 0.82;
        node.x += node.vx;
        node.y += node.vy;

        // Dynamic flaring collision when ball passes through the Left Net
        const dX = node.x - ball.x;
        const dY = node.y - ball.y;
        const distToBall = Math.hypot(dX, dY);
        const colRadius = ball.radius + 4;
        if (distToBall < colRadius) {
          const force = (colRadius - distToBall) / colRadius;
          const nx = dX / (distToBall || 1);
          const ny = dY / (distToBall || 1);
          node.x += nx * (colRadius - distToBall) * 0.95;
          node.y += ny * (colRadius - distToBall) * 0.95;
          node.vx += ball.vx * 0.25 + nx * force * 1.5;
          node.vy += ball.vy * 0.25 + ny * force * 1.5;
        }
      });

      // Render Left Net with diamond mesh webbing
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.88)';
      ctx.lineWidth = 1.8;
      for (let i = 0; i < 6; i++) {
        const targetAnchorX = 48 + (80 - 48) * (i / 5);
        const node = netLeftNodes[i];
        
        ctx.beginPath();
        ctx.moveTo(targetAnchorX, 160);
        ctx.lineTo(node.x, node.y);
        ctx.stroke();

        if (i < 5) {
          ctx.beginPath();
          ctx.moveTo(targetAnchorX, 160);
          ctx.lineTo(netLeftNodes[i+1].x, netLeftNodes[i+1].y);
          ctx.stroke();
        }
        if (i > 0) {
          ctx.beginPath();
          ctx.moveTo(targetAnchorX, 160);
          ctx.lineTo(netLeftNodes[i-1].x, netLeftNodes[i-1].y);
          ctx.stroke();
        }
      }

      // Draw middle horizontal tier for left net
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(240, 243, 248, 0.92)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 6; i++) {
        const targetAnchorX = 48 + (80 - 48) * (i / 5);
        const node = netLeftNodes[i];
        const mx = (targetAnchorX + node.x) / 2;
        const my = (160 + node.y) / 2;
        if (i === 0) ctx.moveTo(mx, my);
        else ctx.lineTo(mx, my);
      }
      ctx.stroke();

      // Draw bottom ring for left net
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.72)';
      ctx.lineWidth = 2.0;
      for (let i = 0; i < 6; i++) {
        const node = netLeftNodes[i];
        if (i === 0) ctx.moveTo(node.x, node.y);
        else ctx.lineTo(node.x, node.y);
      }
      ctx.stroke();
      ctx.restore();


      // Update physics spring constraints on Right Net nodes
      netRightNodes.forEach((node, i) => {
        const targetAnchorX = 770 + (802 - 770) * (i / 5);
        node.vx += (targetAnchorX - node.x) * 0.15;
        node.vy += (node.oy - node.y) * 0.15;
        node.vx *= 0.82;
        node.vy *= 0.82;
        node.x += node.vx;
        node.y += node.vy;

        // Dynamic flaring collision when ball passes through the Right Net
        const dX = node.x - ball.x;
        const dY = node.y - ball.y;
        const distToBall = Math.hypot(dX, dY);
        const colRadius = ball.radius + 4;
        if (distToBall < colRadius) {
          const force = (colRadius - distToBall) / colRadius;
          const nx = dX / (distToBall || 1);
          const ny = dY / (distToBall || 1);
          node.x += nx * (colRadius - distToBall) * 0.95;
          node.y += ny * (colRadius - distToBall) * 0.95;
          node.vx += ball.vx * 0.25 + nx * force * 1.5;
          node.vy += ball.vy * 0.25 + ny * force * 1.5;
        }
      });

      // Render Right Net with diamond mesh webbing
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.88)';
      ctx.lineWidth = 1.8;
      for (let i = 0; i < 6; i++) {
        const targetAnchorX = 770 + (802 - 770) * (i / 5);
        const node = netRightNodes[i];
        
        ctx.beginPath();
        ctx.moveTo(targetAnchorX, 160);
        ctx.lineTo(node.x, node.y);
        ctx.stroke();

        if (i < 5) {
          ctx.beginPath();
          ctx.moveTo(targetAnchorX, 160);
          ctx.lineTo(netRightNodes[i+1].x, netRightNodes[i+1].y);
          ctx.stroke();
        }
        if (i > 0) {
          ctx.beginPath();
          ctx.moveTo(targetAnchorX, 160);
          ctx.lineTo(netRightNodes[i-1].x, netRightNodes[i-1].y);
          ctx.stroke();
        }
      }

      // Draw middle horizontal tier for right net
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(240, 243, 248, 0.92)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 6; i++) {
        const targetAnchorX = 770 + (802 - 770) * (i / 5);
        const node = netRightNodes[i];
        const mx = (targetAnchorX + node.x) / 2;
        const my = (160 + node.y) / 2;
        if (i === 0) ctx.moveTo(mx, my);
        else ctx.lineTo(mx, my);
      }
      ctx.stroke();

      // Draw bottom ring for right net
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.72)';
      ctx.lineWidth = 2.0;
      for (let i = 0; i < 6; i++) {
        const node = netRightNodes[i];
        if (i === 0) ctx.moveTo(node.x, node.y);
        else ctx.lineTo(node.x, node.y);
      }
      ctx.stroke();
      ctx.restore();

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
                    if (p.isP1) {
            // Player 1 controls (WASD)
            if (p.dashActiveTimer && p.dashActiveTimer > 0) {
              p.vx = p.dashDirection === 'right' ? 19 : -19;
              p.vy = 0;
            } else {
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
                // Dash Trigger (Shift)
                if (keysPressed.current.has('shift') && p.dashTimer <= 0) {
                  p.dashTimer = 300; // 5 seconds cooldown
                  p.dashActiveTimer = 8; // active duration of dash velocity
                  p.dashDirection = p.facing;
                  playSound('dash');
                  createSparks(p.x + p.width/2, p.y + p.height/2, '#a855f7', 15);
                }
              }
            }
              // Spacebar to shoot standard shot or super shot if meter is fully charged
              if (keysPressed.current.has(' ') && ball.holder && ball.holder.id === p.id) {
                ball.holder = null;
                ball.cooldownHolder = p;
                ball.cooldownTimer = 40;
                p.shootAnimTimer = 25;
                ball.x = p.x;
                ball.y = p.y - 15;

                const targetX = p.team === 'blue' ? 786 : 64;

                if (p.superMeter >= 100) {
                  p.superMeter = 0;
                  setIsSuperMode(p.name);
                  setTimeout(() => setIsSuperMode(null), 1200);
                  playSound('special');
                  ball.lastShotType = 'super';
                  
                  // Rocket shot logic
                  const arcTime = 25;
                  ball.vx = (targetX - ball.x) / arcTime;
                  ball.vy = (145 - ball.y) / arcTime - 0.5 * gravity * arcTime;
                  triggerAlert(`${p.name}: SKY FIRESHOT!`);
                  createSparks(p.x, p.y - 20, '#10b981', 15);
                } else {
                  // Standard physical parabolistic throw
                  const accuracyError = (10 - p.shootStat) * 4 * (Math.random() - 0.5);
                  const finalTargetX = targetX + accuracyError;

                  const startX = ball.x;
                  const startY = ball.y;
                  const targetY = 155;
                  const dist = Math.abs(finalTargetX - startX);
                  const peakY = Math.min(60, Math.min(startY, targetY) - 50 - dist * 0.12);

                  const h_rise = startY - peakY;
                  const t_rise = Math.sqrt(Math.max(1, (2 * h_rise) / gravity));
                  const h_fall = targetY - peakY;
                  const t_fall = Math.sqrt(Math.max(1, (2 * h_fall) / gravity));
                  const totalTime = t_rise + t_fall;

                  ball.vx = (finalTargetX - startX) / totalTime;
                  ball.vy = -Math.sqrt(Math.max(1, 2 * gravity * h_rise));
                  ball.lastShotType = 'normal';
                  playSound('rim');
                }
              }
            } else if (p.isP2) {
              // Player 2 local opponent controls (Arrow Keys + Keypad keys '/','.')
            if (p.dashActiveTimer && p.dashActiveTimer > 0) {
              p.vx = p.dashDirection === 'right' ? 19 : -19;
              p.vy = 0;
            } else {
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
                // Steal with key 'M' or ',' (5s dash)
                if ((keysPressed.current.has('m') || keysPressed.current.has('M') || keysPressed.current.has(',')) && p.dashTimer <= 0) {
                  p.dashTimer = 300; // 5 seconds cooldown
                  p.dashActiveTimer = 8;
                  p.dashDirection = p.facing;
                  playSound('dash');
                  createSparks(p.x + p.width/2, p.y + p.height/2, '#a855f7', 15);
                }
              }
            }
              // Shoot with '.' key or 'l'
              if ((keysPressed.current.has('.') || keysPressed.current.has('/')) && ball.holder && ball.holder.id === p.id) {
                ball.holder = null;
                ball.cooldownHolder = p;
                ball.cooldownTimer = 40;
                p.shootAnimTimer = 25;
                ball.x = p.x;
                ball.y = p.y - 15;

                const targetX = p.team === 'blue' ? 786 : 64;

                if (p.superMeter >= 100) {
                  p.superMeter = 0;
                  setIsSuperMode(p.name);
                  setTimeout(() => setIsSuperMode(null), 1200);
                  playSound('special');
                  ball.lastShotType = 'super';
                  
                  // Perfect flight curve
                  const arcTime = 25;
                  ball.vx = (targetX - ball.x) / arcTime;
                  ball.vy = (145 - ball.y) / arcTime - 0.5 * gravity * arcTime;
                  triggerAlert(`${p.name}: ULTRA COMBO SHOT!`);
                  createSparks(p.x, p.y - 20, '#eab308', 15);
                } else {
                  const accuracyError = (10 - p.shootStat) * 4 * (Math.random() - 0.5);
                  const finalTargetX = targetX + accuracyError;

                  const startX = ball.x;
                  const startY = ball.y;
                  const targetY = 155;
                  const dist = Math.abs(finalTargetX - startX);
                  const peakY = Math.min(60, Math.min(startY, targetY) - 50 - dist * 0.12);

                  const h_rise = startY - peakY;
                  const t_rise = Math.sqrt(Math.max(1, (2 * h_rise) / gravity));
                  const h_fall = targetY - peakY;
                  const t_fall = Math.sqrt(Math.max(1, (2 * h_fall) / gravity));
                  const totalTime = t_rise + t_fall;

                  ball.vx = (finalTargetX - startX) / totalTime;
                  ball.vy = -Math.sqrt(Math.max(1, 2 * gravity * h_rise));
                  ball.lastShotType = 'normal';
                  playSound('rim');
                }
              }
            }
          }

        // If athlete is actively dashing, force hyper-dash velocities and decrement active timer
        if (p.dashActiveTimer && p.dashActiveTimer > 0) {
          p.vx = p.dashDirection === 'right' ? 19 : -19;
          p.vy = 0;
          p.dashActiveTimer--;
          
          // Generate a premium colorful particle ghost trail
          if (Math.random() < 0.6) {
            particles.push({
              x: p.x + p.width/2 + (Math.random() - 0.5) * 15,
              y: p.y + p.height/2 + (Math.random() - 0.5) * 20,
              vx: -p.vx * 0.15,
              vy: (Math.random() - 0.5) * 2,
              color: p.team === 'blue' ? '#38bdf8' : '#ec4899',
              size: Math.random() * 6 + 4,
              alpha: 0.8,
              life: 0,
              maxLife: 20
            });
          }

          // Check for pass-through overlap for DASH & STEAL (Perfect Swipe!)
          players.forEach(victim => {
            if (victim.team !== p.team && ball.holder && ball.holder.id === victim.id) {
              const dToOpp = Math.hypot(p.x - victim.x, p.y - victim.y);
              if (dToOpp < 55) {
                if (p.isBot) {
                  // AI tries to perfect-time the swipe! Success probability based on difficulty
                  const swipeSuccessChance = difficulty === 'easy' ? 0.25 : difficulty === 'medium' ? 0.52 : 0.85;
                  if (Math.random() < swipeSuccessChance && ball.holder && ball.holder.id === victim.id) {
                    ball.holder = p;
                    ball.cooldownHolder = victim;
                    ball.cooldownTimer = 45;
                    p.dashActiveTimer = 0; // stop active dash!
                    victim.isStunned = true;
                    victim.stunTimer = 65; // stun!
                    playSound('special');
                    createSparks(p.x + p.width/2, p.y + p.height/2, '#f59e0b', 22);
                    splashTriggerRef.current?.("PERFECT STEAL!");
                  }
                } else {
                  // Human perfect timing swipe window!
                  const isPressingTrigger = p.isP1 
                    ? (keysPressed.current.has('shift') || keysPressed.current.has(' '))
                    : (keysPressed.current.has('m') || keysPressed.current.has('M') || keysPressed.current.has(',') || keysPressed.current.has('.') || keysPressed.current.has('/'));
                  
                  if (isPressingTrigger && ball.holder && ball.holder.id === victim.id) {
                    ball.holder = p;
                    ball.cooldownHolder = victim;
                    ball.cooldownTimer = 45;
                    p.dashActiveTimer = 0; // successfully lock on the ball and stop!
                    victim.isStunned = true;
                    victim.stunTimer = 70; // stun!
                    playSound('special');
                    createSparks(p.x + p.width/2, p.y + p.height/2, '#facc15', 25);
                    splashTriggerRef.current?.("PERFECT STEAL!");
                  }
                }
              }
            }
          });
        }

        // Apply velocities on person / handle epic dunk cinematic flight trajectory!
        if (p.isDunking && p.dunkPhase && p.dunkPhase > 0) {
          p.vx = 0;
          p.vy = 0;
          
          p.dunkPhase += 0.035; // increments trajectory (lasts approx 28 frames)
          const t = p.dunkPhase;
          
          if (t >= 1.0) {
            // SLAM CLIMAX TRIGGER!
            p.isDunking = false;
            p.dunkPhase = 0;
            
            ball.holder = null;
            ball.x = p.team === 'blue' ? 786 : 64;
            ball.y = 175;
            ball.vx = 0;
            ball.vy = 8;
            ball.lastShotType = 'dunk';
            
            // Screen Shake trigger!
            screenShakeTimer = 22;
            shakeAmplitude = 14;
            
            playSound('swish');
            playSound('cheer');
            createSparks(ball.x, 160, '#f59e0b', 30);
            createSparks(ball.x, 160, '#ef4444', 20);
            splashTriggerRef.current?.(`${p.name.toUpperCase()}: MONSTER DUNK!`);
            
            if (p.team === 'blue') setScoreBlue(sc => sc + 3);
            else setScoreRed(sc => sc + 3);
            
            if (p.team === 'blue') {
              netRightNodes.forEach(node => { node.vy += 15; node.vx += (Math.random() - 0.5) * 16; });
            } else {
              netLeftNodes.forEach(node => { node.vy += 15; node.vx += (Math.random() - 0.5) * 16; });
            }
            resetBall();
          } else {
            // FLYING TRAJECTORY INTERPOLATION
            const targetHoopX = p.team === 'blue' ? 745 : 105;
            const targetHoopY = 145;
            
            // Start points
            const startX = p.dunkLaunchX !== undefined ? p.dunkLaunchX : p.x;
            const startY = p.dunkLaunchY !== undefined ? p.dunkLaunchY : p.y;
            
            p.x = startX + (targetHoopX - startX) * t;
            // High parabolic altitude curve
            p.y = startY + (targetHoopY - startY) * t - Math.sin(t * Math.PI) * 180;
            
            // Draw colorful trail particles at feet/torso
            if (Math.random() < 0.7) {
              particles.push({
                x: p.x + p.width / 2 + (Math.random() - 0.5) * 12,
                y: p.y + p.height / 2 + (Math.random() - 0.5) * 12,
                vx: (Math.random() - 0.5) * 3,
                vy: (Math.random() - 0.5) * 3,
                color: p.team === 'blue' ? '#38bdf8' : '#ef4444',
                size: Math.random() * 6 + 4,
                alpha: 0.85,
                life: 0,
                maxLife: 20
              });
            }
            
            // Keep ball snapped to hands (overhead preparatory pose)
            if (ball.holder && ball.holder.id === p.id) {
              ball.x = p.x + (p.facing === 'right' ? 30 : -10);
              ball.y = p.y - 20;
            }
          }
        } else {
          // Standard physics update
          p.vy += gravity;
          p.x += p.vx;
          p.y += p.vy;
          
          // Platform ground alignment limits
          if (p.y > courtFloorY - p.height) {
            p.y = courtFloorY - p.height;
            p.vy = 0;
            p.isDunking = false;
          }
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
        // If human or AI is close to the hoop, trigger dunk trajectory (P1: T key, P2: shoot/jump, Bot: auto)
        const targetedHoopX = p.team === 'blue' ? 780 : 66;
        const dToHoop = Math.abs(p.x - targetedHoopX);
        if (!p.isDunking && !ball.isScoring && ball.holder && ball.holder.id === p.id && dToHoop < 160) {
          const isDunkPressedP1 = p.isP1 && (keysPressed.current.has('t') || keysPressed.current.has('T'));
          const isShootPressedP2 = p.isP2 && (keysPressed.current.has('.') || keysPressed.current.has('/'));
          const isJumpPressedP2 = p.isP2 && keysPressed.current.has('ArrowUp');
          
          if (isDunkPressedP1 || isShootPressedP2 || isJumpPressedP2 || p.isBot) {
            p.isDunking = true;
            p.dunkPhase = 0.01;
            p.dunkLaunchX = p.x;
            p.dunkLaunchY = p.y;
            ball.holder = p; // Lock ball to hand for trajectory
            createSparks(p.x, p.y, '#f59e0b', 12);
            playSound('special');
          }
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
          ctx.save();
          ctx.strokeStyle = '#22c55e'; // Bright green halo ring from screenshot
          ctx.lineWidth = 3.5;
          ctx.shadowColor = '#22c55e';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.ellipse(0, 0, 22 * sScale, 6 * sScale, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        } else if (p.isP2) {
          ctx.save();
          ctx.strokeStyle = '#ef4444'; // Bright red halo ring
          ctx.lineWidth = 3.5;
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.ellipse(0, 0, 22 * sScale, 6 * sScale, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
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

        // Check if any opponent is actively dashing during ball possession (Time Swipe Ring!)
        const isAnOpponentDashing = players.some(item => item.team !== p.team && item.dashActiveTimer !== undefined && item.dashActiveTimer > 0);
        if (isAnOpponentDashing && ball.holder && ball.holder.id === p.id) {
          ctx.save();
          const pulse = Math.abs(Math.sin(Date.now() / 80));
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 3.2 + pulse * 2.5;
          ctx.shadowColor = '#fbbf24';
          ctx.shadowBlur = 15;
          
          // Outer target rings
          ctx.beginPath();
          ctx.arc(0, -15, 30 + pulse * 4, 0, Math.PI * 2);
          ctx.stroke();

          // Rotating crosshairs markings
          const angleRot = (Date.now() / 150) % (Math.PI * 2);
          ctx.rotate(angleRot);
          ctx.strokeStyle = '#f97316';
          ctx.lineWidth = 2.5;
          for (let a = 0; a < Math.PI * 2; a += Math.PI / 2) {
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * 36, Math.sin(a) * 36);
            ctx.lineTo(Math.cos(a) * 44, Math.sin(a) * 44);
            ctx.stroke();
          }
          ctx.restore();

          // Draw the banner text above their head (not rotated so it stays readable!)
          ctx.save();
          ctx.fillStyle = '#facc15';
          ctx.font = '900 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.shadowColor = '#000000';
          ctx.shadowBlur = 4;
          // Draw a stylized background tag
          ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
          ctx.fillRect(-45, -73, 90, 16);
          ctx.fillStyle = '#ffffff';
          ctx.fillText("TIME SWIPE!", 0, -60);
          ctx.restore();
        }

        // Draw 5s dash cooldown ring overhead if active
        if (p.dashTimer > 0 && (p.isP1 || p.isP2)) {
          ctx.save();
          ctx.translate(0, -85);
          
          // Outer gray container
          ctx.strokeStyle = 'rgba(15, 23, 42, 0.55)';
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.arc(0, 0, 7.5, 0, Math.PI * 2);
          ctx.stroke();

          // Green/Purple active percentage sector
          ctx.strokeStyle = '#a855f7'; // Purple dash theme
          ctx.lineWidth = 3.5;
          ctx.lineCap = 'round';
          const pct = p.dashTimer / 300; // 300 frame ticks is full 5s
          ctx.beginPath();
          ctx.arc(0, 0, 7.5, -Math.PI / 2, -Math.PI / 2 + (pct) * Math.PI * 2);
          ctx.stroke();

          ctx.restore();
        }

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
        // Prevent grabbing the ball while it's in a scoring/reset state to avoid duplicate score triggers
        if (!ball.isScoring) {
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
        }

        // --- 3D HIGH-FIDELITY RIM AND BACKBOARD COLLISION ENGINE ---
        // Left Backboard (vertical glass wall at x = 48 from y = 85 to 220)
        if (ball.vx < 0 && ball.x - ball.radius < 48 && ball.x + ball.radius > 32 && ball.y >= 85 && ball.y <= 220) {
          ball.x = 48 + ball.radius;
          ball.vx = -ball.vx * 0.62;
          playSound('rim');
          createSparks(48, ball.y, '#22d3ee', 6);
        }
        // Right Backboard (vertical glass wall at x = 802 from y = 85 to 220)
        if (ball.vx > 0 && ball.x + ball.radius > 802 && ball.x - ball.radius < 818 && ball.y >= 85 && ball.y <= 220) {
          ball.x = 802 - ball.radius;
          ball.vx = -ball.vx * 0.62;
          playSound('rim');
          createSparks(802, ball.y, '#22d3ee', 6);
        }

        // Rim Point Collisions (circular boundary bounces)
        // If ball is scoring, bypass rim point collisions to allow clean insertion
        const isScoringLeft = ball.vy > 0 && ball.y >= 148 && ball.y <= 210 && ball.x > 50 && ball.x < 78;
        const isScoringRight = ball.vy > 0 && ball.y >= 148 && ball.y <= 210 && ball.x > 772 && ball.x < 800;

        const checkRimCollision = (rimX: number, rimY: number) => {
          const dx = ball.x - rimX;
          const dy = ball.y - rimY;
          const dist = Math.hypot(dx, dy);
          const touchDist = ball.radius + 3; // contact depth
          if (dist < touchDist) {
            const nx = dx / (dist || 1);
            const ny = dy / (dist || 1);
            ball.x = rimX + nx * touchDist;
            ball.y = rimY + ny * touchDist;
            
            const dot = ball.vx * nx + ball.vy * ny;
            ball.vx = (ball.vx - 2 * dot * nx) * 0.64;
            ball.vy = (ball.vy - 2 * dot * ny) * 0.64;
            playSound('rim');
            createSparks(rimX, rimY, '#ef4444', 5);
          }
        };

        if (!isScoringLeft && !ball.isScoring) {
          checkRimCollision(48, 160); // Inner left rim hook
          checkRimCollision(80, 160); // Outer left rim tip
        }
        if (!isScoringRight && !ball.isScoring) {
          checkRimCollision(802, 160); // Inner right rim hook
          checkRimCollision(770, 160); // Outer right rim tip
        }

        // Net Funneling Physics: trap and slide ball elegantly downwards inside net thread
        if (ball.y >= 152 && ball.y <= 212) {
          if (ball.x > 49 && ball.x < 79) {
            // Settle towards center of left net (x = 64)
            ball.vx = ball.vx * 0.82 + (64 - ball.x) * 0.12;
            ball.vy = Math.min(ball.vy, 2.5) * 0.94 + 0.12; // slow squeeze drag
          } else if (ball.x > 771 && ball.x < 801) {
            // Settle towards center of right net (x = 786)
            ball.vx = ball.vx * 0.82 + (786 - ball.x) * 0.12;
            ball.vy = Math.min(ball.vy, 2.5) * 0.94 + 0.12; // slow squeeze drag
          }
        }

        // Left basket score circle trigger detection
        const lRimCenter = 64;
        if (!ball.isScoring && ball.vy > 0 && ball.y >= 155 && ball.y <= 165 && ball.x > lRimCenter - 16 && ball.x < lRimCenter + 16) {
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
        const rRimCenter = 786;
        if (!ball.isScoring && ball.vy > 0 && ball.y >= 155 && ball.y <= 165 && ball.x > rRimCenter - 16 && ball.x < rRimCenter + 16) {
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

      ctx.restore(); // Restore global context translation after shake

      // Live sync Player 1 super meter to React state
      const p1Obj = players.find(p => p.isP1);
      if (p1Obj) {
        const currentMeterVal = Math.round(p1Obj.superMeter);
        if (currentMeterVal !== lastP1SuperMeterRef.current) {
          lastP1SuperMeterRef.current = currentMeterVal;
          setP1SuperMeter(currentMeterVal);
        }
      }
    };

    const resetBall = () => {
      if (ball.isScoring) return; // Prevent overlapping resets or re-entrant scoring events
      ball.isScoring = true;
      setTimeout(() => {
        ball.x = 425;
        ball.y = 110;
        ball.vx = 0;
        ball.vy = 0;
        ball.holder = null;
        ball.cooldownHolder = null;
        ball.isScoring = false;
        players.forEach((p, idx) => {
          p.x = p.team === 'blue' ? 180 + idx * 40 : 640 - idx * 40;
          p.y = courtFloorY - 60;
          p.vx = 0;
          p.vy = 0;
          p.isStunned = false;
          p.isDunking = false;
        });
      }, 1500);
    };

    processFrame(performance.now());

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
          {/* Left Circular Special Power Meter */}
          <div className="pointer-events-auto flex items-center gap-3">
            <div className="relative w-18 h-18 rounded-full border-4 border-white/95 bg-[#0e021a] flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.85)] overflow-hidden">
              {/* Inner dynamic fire energy fill based on Player 1's real super meter state */}
              <div 
                className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-purple-700 via-pink-500 to-amber-400 opacity-90 transition-all duration-300"
                style={{ height: `${p1SuperMeter}%` }}
              />
              
              {/* Vector caricature head overlay of selected character */}
              <div className="relative z-10 scale-110 active:scale-125 transition-transform">
                <HUDPlayerHead charId={selectedCharId} />
              </div>
              
              {/* Z letter dynamic action badge */}
              <div className={`absolute bottom-0.5 left-0.5 border border-white rounded-full w-5.5 h-5.5 flex items-center justify-center text-[11px] font-black text-white shadow-md z-20 transition-all ${
                p1SuperMeter >= 100 
                  ? 'bg-gradient-to-b from-yellow-400 to-amber-500 animate-pulse scale-110 shadow-[0_0_8px_#facc15]' 
                  : 'bg-gradient-to-b from-orange-400 to-orange-600'
              }`}>
                Z
              </div>
            </div>
            
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-amber-400 tracking-wider">SUPER POWER</span>
              <span className={`text-[10px] font-mono font-black italic leading-none uppercase transition-all ${
                p1SuperMeter >= 100 
                  ? 'text-yellow-400 animate-pulse drop-shadow-[0_0_4px_rgba(250,204,21,0.8)]' 
                  : 'text-purple-400/80'
              }`}>
                {p1SuperMeter >= 100 ? 'READY !!' : `CHARGING (${p1SuperMeter}%)`}
              </span>
            </div>
          </div>

          {/* SCREENSHOT ACCURATE HIGH-FIDELITY SEGMENT SCOREBOARD */}
          <div className="relative flex flex-col items-center pointer-events-none">
            <div className="relative bg-[#060114]/90 border-[3.5px] border-[#6d28d9] rounded-[2.3rem] px-4 py-1.5 flex items-center gap-3.5 shadow-[0_6px_25px_rgba(0,0,0,0.85),0_0_15px_rgba(139,92,246,0.5)] select-none">
              
              {/* Left Team Logo: LOS ANGELES LAKES */}
              <div className="flex items-center gap-2.5 bg-[#4c1d95]/50 border border-amber-500/30 px-3.5 py-1.5 rounded-full shadow-lg">
                {/* LAKES SVG custom basketball emblem */}
                <svg className="w-9 h-9" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="40" fill="#f97316" stroke="#ffffff" strokeWidth="2" />
                  <path d="M20 50C35 40 65 40 80 50" stroke="#000000" strokeWidth="2.5" fill="none" />
                  <path d="M20 50C35 60 65 60 80 50" stroke="#000000" strokeWidth="2.5" fill="none" />
                  <path d="M50 10C45 35 45 65 50 90" stroke="#000000" strokeWidth="2.5" fill="none" />
                  <rect x="5" y="38" width="90" height="24" fill="#6d28d9" stroke="#ffffff" strokeWidth="1.5" rx="4" transform="rotate(-5 50 50)" />
                  <text x="50" y="55" fill="#facc15" fontSize="13" fontWeight="900" fontStyle="italic" textAnchor="middle" transform="rotate(-5 50 50)">LAKES</text>
                </svg>
                <div className="flex flex-col text-left">
                  <span className="text-[7px] font-black text-amber-400 tracking-[0.08em] leading-none uppercase">LOS ANGELES</span>
                  <span className="text-[12px] font-black text-white italic tracking-tighter leading-none font-sans uppercase">LAKES</span>
                </div>
              </div>

              {/* High precision Retro 7-Segment scoring digits */}
              <div className="flex items-center gap-3 px-3.5 py-1.5 bg-[#060114] border-2 border-[#581c87] rounded-2xl shadow-inner shadow-black">
                <div className="flex gap-1 bg-[#0c0420] p-1.5 rounded-lg border border-[#3b1154]">
                  {scoreBlue > 9 && <SevenSegmentDigit value={Math.floor(scoreBlue / 10)} color="#ff9f00" />}
                  <SevenSegmentDigit value={scoreBlue % 10} color="#ff9f00" />
                </div>
                <span className="text-[#8b5cf6]/80 font-black text-lg select-none leading-none scale-y-75">-</span>
                <div className="flex gap-1 bg-[#0c0420] p-1.5 rounded-lg border border-[#3b1154]">
                  {scoreRed > 9 && <SevenSegmentDigit value={Math.floor(scoreRed / 10)} color="#ff9f00" />}
                  <SevenSegmentDigit value={scoreRed % 10} color="#ff9f00" />
                </div>
              </div>

              {/* Right Team Logo: GOLDEN STATE CALIFORNIA */}
              <div className="flex items-center gap-2.5 bg-[#0c2340]/65 border border-blue-500/30 px-3.5 py-1.5 rounded-full shadow-lg">
                <div className="flex flex-col text-right">
                  <span className="text-[7px] font-black text-sky-400 tracking-[0.08em] leading-none uppercase">GOLDEN STATE</span>
                  <span className="text-[12px] font-black text-white italic tracking-tighter leading-none font-sans uppercase">CALIFORNIA</span>
                </div>
                {/* Golden Gate bridge design SVG */}
                <svg className="w-9 h-9" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="40" fill="#1d4ed8" stroke="#facc15" strokeWidth="2.5" />
                  <path d="M20 60C35 30 65 30 80 60" stroke="#facc15" strokeWidth="4.5" fill="none" />
                  <line x1="30" y1="46" x2="30" y2="60" stroke="#facc15" strokeWidth="2.5" />
                  <line x1="40" y1="38" x2="40" y2="60" stroke="#facc15" strokeWidth="2.5" />
                  <line x1="50" y1="36" x2="50" y2="60" stroke="#facc15" strokeWidth="2.5" />
                  <line x1="60" y1="38" x2="60" y2="60" stroke="#facc15" strokeWidth="2.5" />
                  <line x1="70" y1="46" x2="70" y2="60" stroke="#facc15" strokeWidth="2.5" />
                  <line x1="15" y1="60" x2="85" y2="60" stroke="#facc15" strokeWidth="3" />
                </svg>
              </div>
            </div>

            {/* Glowing toxic neon green digital timer capsule hanging beneath */}
            <div className="mt-[-10px] bg-[#0c0420] border-2 border-[#8b5cf6] rounded-full px-5 py-0.5 shadow-md flex items-center justify-center z-10 shadow-black">
              <span className="font-mono text-sm font-black text-[#58fa58] tracking-widest drop-shadow-[0_0_8px_rgba(88,250,88,0.95)] select-none">
                {timeLeft}.{Math.floor((Date.now() / 100) % 10)}
              </span>
            </div>
          </div>

          {/* Right Action Arcade Controls */}
          <div className="pointer-events-auto flex items-center gap-2">
            {/* Info button */}
            <button 
              onClick={() => triggerAlert("P1: WASD to Run/Jump, SPACE to Shoot, T to Dunk, SHIFT to Steal. | Avoid penalties!")}
              className="w-10 h-10 bg-[#170e2b] hover:bg-[#2e1954] border-2 border-white text-white flex items-center justify-center rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all text-sm font-black cursor-pointer shadow-purple-950/50"
              title="Help Options"
            >
              ?
            </button>
            {/* Pause option */}
            <button 
              onClick={() => triggerAlert("Match Paused - click OK to Resume")}
              className="w-10 h-10 bg-[#170e2b] hover:bg-[#2e1954] border-2 border-white text-white flex items-center justify-center rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all text-xs font-black cursor-pointer shadow-purple-950/50"
              title="Pause Match"
            >
              ||
            </button>
            {/* Sound toggle */}
            <button 
              onClick={() => setSoundEnabled(prev => !prev)}
              className="w-10 h-10 bg-[#170e2b] hover:bg-[#2e1954] border-2 border-white text-white flex items-center justify-center rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all text-sm font-sans font-black cursor-pointer shadow-purple-950/50"
              title="Toggle Audio Synth"
            >
              {soundEnabled ? '♫' : 'Mute'}
            </button>
            {/* Forfeit */}
            <button 
              onClick={() => setGameState('menu')}
              className="px-3.5 py-2.5 bg-gradient-to-r from-red-950 to-rose-900 border-2 border-white rounded-xl hover:brightness-110 hover:scale-105 shadow-md shadow-red-950/50 text-red-200 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
            >
              Forfeit
            </button>
          </div>
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
            <div><span className="text-sky-400 font-bold">P1 (BLUE) CONTROLS:</span> WASD = JUMP / RUN | SPACE = SHOOT | T = EPIC DUNKS | SHIFT = STEAL</div>
            {gameMode === 'pvp' && (
              <div><span className="text-rose-400 font-bold">P2 (RED) CONTROLS:</span> ARROWS = JUMP / RUN | . = SHOOT / DUNKS | M = SWIPE STEAL</div>
            )}
          </div>
        </div>
      ) : null}

      {/* Game Idle Menu Section */}
      {gameState === 'menu' && (
        <div className="absolute inset-0 bg-[#160024] flex flex-col items-center justify-center p-8 z-30 overflow-y-auto relative select-none">
          {/* Animated decorative floating retro neon stars behind menu */}
          <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none">
            <div className="absolute top-[10%] left-[15%] text-pink-500 text-3xl animate-pulse">★</div>
            <div className="absolute top-[20%] right-[20%] text-purple-500 text-2xl animate-pulse delay-75">★</div>
            <div className="absolute bottom-[25%] left-[25%] text-pink-400 text-xl animate-pulse delay-150">★</div>
            <div className="absolute bottom-[15%] right-[10%] text-purple-400 text-4xl animate-pulse delay-300">★</div>
            <div className="absolute top-[45%] left-[8%] text-purple-300 text-lg animate-pulse delay-500">★</div>
            <div className="absolute top-[60%] right-[5%] text-pink-300 text-2xl animate-pulse">★</div>
          </div>

          {/* Upper Right Action Buttons */}
          <div className="absolute top-4 right-4 flex items-center gap-2 pointer-events-auto z-20">
            {/* Trophy icon */}
            <button 
              onClick={() => triggerAlert("HIGH SCORE: Beat the bot teams in 1v1 and 2v2 modes!")}
              className="w-10 h-10 bg-[#3b82f6] hover:bg-[#1d4ed8] border-2 border-white rounded-xl flex items-center justify-center text-white font-black hover:scale-105 active:scale-95 transition-all text-sm shadow-md cursor-pointer"
              title="Show High Score"
            >
              🏅
            </button>
            <button 
              onClick={() => setSoundEnabled(prev => !prev)}
              className="w-10 h-10 bg-[#3b82f6] hover:bg-[#1d4ed8] border-2 border-white rounded-xl flex items-center justify-center text-white font-sans font-bold hover:scale-105 active:scale-95 transition-all text-lg shadow-md cursor-pointer"
              title="Toggle Audio Synth"
            >
              {soundEnabled ? '♫' : 'Mute'}
            </button>
          </div>

          {/* Giant Retro Bubble Title Block with background basketball */}
          <div className="relative mb-6 select-none flex justify-center items-center h-44 w-full">
            {/* Pulsating glowing orange basketball behind title */}
            <div className="absolute w-36 h-36 rounded-full bg-gradient-to-tr from-[#ea580c] via-[#f97316] to-[#fdba74] border-4 border-slate-950 flex flex-col justify-between p-2 shadow-[0_0_35px_rgba(249,115,22,0.45)] animate-pulse overflow-hidden">
              {/* Basketball ribbed lines */}
              <div className="absolute inset-0 border-2 border-slate-950/20 rounded-full" />
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-950 opacity-40 transform -translate-y-1/2" />
              <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-slate-950 opacity-40 transform -translate-x-1/2" />
              <div className="absolute inset-4 border-2 border-slate-950 opacity-30 rounded-full" />
            </div>

            {/* Overlapping double layered comic typography */}
            <div className="relative flex flex-col items-center justify-center transform -rotate-2">
              {/* "BASKETBALL" in heavy blue bubble letters */}
              <h1 className="text-6xl font-black tracking-tight uppercase select-none relative font-sans text-center leading-none">
                {/* Outer magenta shadow glow layer */}
                <span className="absolute left-1.5 top-1.5 text-[#ec4899] font-black uppercase text-6xl tracking-tight filter drop-shadow-[0_4px_12px_rgba(236,72,153,0.9)] opacity-95">
                  BASKETBALL
                </span>
                {/* Black thick border layer */}
                <span className="absolute left-0 top-0 text-slate-950 font-black uppercase text-6xl tracking-tight select-none">
                  BASKETBALL
                </span>
                {/* Front active sky-blue layer */}
                <span className="relative text-transparent bg-clip-text bg-gradient-to-b from-[#38bdf8] to-[#0369a1] font-black uppercase text-6xl tracking-tight [text-shadow:_0_2px_0_#ffffff]">
                  BASKETBALL
                </span>
              </h1>

              {/* "Stars" overlapping at bottom right angled cursive */}
              <h2 className="text-5xl font-black italic tracking-wide select-none absolute bottom-[-18px] right-2 transform rotate-6 leading-none">
                {/* Purple bottom glow */}
                <span className="absolute left-1 top-1 text-[#f472b6] font-black italic text-5xl tracking-wide select-none filter opacity-90">
                  Stars
                </span>
                {/* Front yellow-green layer */}
                <span className="relative text-transparent bg-clip-text bg-gradient-to-b from-[#a3e635] to-[#4d7c0f] font-black italic text-5xl tracking-wide">
                  Stars
                </span>
              </h2>
            </div>
          </div>

          {/* Central Felt-Pad purple Options container */}
          <div className="relative w-full max-w-sm mx-auto bg-gradient-to-b from-[#481165]/95 to-[#2d023a]/95 border-4 border-white/90 rounded-[2.5rem] p-6 shadow-[0_12px_45px_rgba(0,0,0,0.8)] z-10 flex flex-col items-center gap-4">
            {/* Curry peeking on far left */}
            <div className="absolute left-[-85px] top-[26%] z-[-2] pointer-events-none transform -scale-x-100 rotate-6">
              <CurryPeeking />
            </div>

            {/* LeBron peeking on far right */}
            <div className="absolute right-[-85px] top-[24%] z-[-2] pointer-events-none transform rotate-[-6deg]">
              <LeBronPeeking />
            </div>

            {/* Stack of the requested options buttons */}
            <div className="flex flex-col gap-3 w-full">
              {/* 1 PLAYER Button */}
              <button
                onClick={() => {
                  setGameMode('1v1');
                  setGameState('charSelect');
                  playSound('special');
                }}
                className="group relative w-full py-3.5 bg-gradient-to-b from-[#0ea5e9] to-[#0284c7] hover:brightness-105 rounded-3xl border-3 border-white text-center shadow-lg transition-all active:scale-95 cursor-pointer overflow-hidden transform hover:-translate-y-0.5"
              >
                <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="font-sans font-black text-white text-lg uppercase tracking-wider drop-shadow-[0_2.2px_0_#ec4899] italic [text-shadow:_0_1.5px_0_#ec4899,_0_-1.5px_0_#ec4899,_1.5px_0_0_#ec4899] leading-none">
                  1 PLAYER
                </span>
              </button>

              {/* 2 PLAYERS Button */}
              <button
                onClick={() => {
                  setGameMode('pvp');
                  setGameState('charSelect');
                  playSound('special');
                }}
                className="group relative w-full py-3.5 bg-gradient-to-b from-[#0ea5e9] to-[#0284c7] hover:brightness-105 rounded-3xl border-3 border-white text-center shadow-lg transition-all active:scale-95 cursor-pointer overflow-hidden transform hover:-translate-y-0.5"
              >
                <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="font-sans font-black text-white text-lg uppercase tracking-wider drop-shadow-[0_2.2px_0_#ec4899] italic [text-shadow:_0_1.5px_0_#ec4899,_0_-1.5px_0_#ec4899,_1.5px_0_0_#ec4899] leading-none">
                  2 PLAYERS
                </span>
              </button>

              {/* QUICK MATCH Button - triggers instant random arena match */}
              <button
                onClick={() => {
                  const selection1 = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)].id;
                  const remainingChars = CHARACTERS.filter(c => c.id !== selection1);
                  const selection2 = remainingChars[Math.floor(Math.random() * remainingChars.length)].id;
                  
                  setSelectedCharId(selection1);
                  setSelectedCharIdP2(selection2);
                  setGameMode('1v1');
                  playSound('special');
                  startMatch();
                }}
                className="group relative w-full py-3.5 bg-gradient-to-b from-[#a3e635] to-[#65a30d] hover:brightness-105 rounded-3xl border-3 border-white text-center shadow-lg transition-all active:scale-95 cursor-pointer overflow-hidden transform hover:-translate-y-0.5"
              >
                <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="font-sans font-black text-[#1e3a1e] text-lg uppercase tracking-wider drop-shadow-[0_2.2px_0_#e11d48] italic [text-shadow:_0_1.5px_0_#e11d48,_0_-1.5px_0_#e11d48,_1.5px_0_0_#e11d48] leading-none">
                  QUICK MATCH
                </span>
              </button>

              {/* CREDITS Button */}
              <button
                onClick={() => {
                  triggerAlert("CREATED BY YEP10 ARCADE LABS! THANKS FOR PLAYING!");
                }}
                className="group relative w-full py-3.5 bg-gradient-to-b from-[#0ea5e9] to-[#0284c7] hover:brightness-105 rounded-3xl border-3 border-white text-center shadow-lg transition-all active:scale-95 cursor-pointer overflow-hidden transform hover:-translate-y-0.5"
              >
                <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="font-sans font-black text-white text-lg uppercase tracking-wider drop-shadow-[0_2.2px_0_#ec4899] italic [text-shadow:_0_1.5px_0_#ec4899,_0_-1.5px_0_#ec4899,_1.5px_0_0_#ec4899] leading-none">
                  CREDITS
                </span>
              </button>
            </div>

            {/* In-Menu computer difficulty choice */}
            <div className="w-full mt-2 border-t border-white/10 pt-3 flex flex-col items-center">
              <span className="text-[10px] font-black tracking-widest text-[#a3e635] uppercase mb-1.5">CPU SKILL</span>
              <div className="flex gap-2">
                {(['easy', 'medium', 'pro'] as const).map(diff => (
                  <button
                    key={diff}
                    onClick={() => { setDifficulty(diff); playSound('rim'); }}
                    className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase border transition-all ${
                      difficulty === diff
                        ? 'bg-[#a3e635] border-white text-purple-950'
                        : 'bg-black/40 border-white/10 text-white/60 hover:bg-black/60'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Left Version indicator and Bottom Right Branding Badge */}
          <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
            <span className="text-xs font-bold text-white/50 tracking-wide font-mono select-none">
              v1.0.7
            </span>
            <Yep10Badge />
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
