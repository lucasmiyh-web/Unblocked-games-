import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Award, 
  Play, 
  Swords, 
  Sparkles, 
  ChevronRight, 
  TrendingUp, 
  User, 
  ShieldAlert, 
  Maximize2, 
  Minimize2,
  RefreshCw,
  Cpu
} from 'lucide-react';

// STAGE / TOURNAMENT CONF
interface Team {
  id: string;
  name: string;
  flag: string;
  color: string;
  accent: string;
  stats: {
    speed: number;
    jump: number;
    kick: number;
  };
  specialName: string;
  specialClass: 'grav' | 'volt' | 'warp' | 'fire';
  specialDesc: string;
}

const NATIONS: Team[] = [
  { 
    id: 'brazil', 
    name: 'Brazil', 
    flag: '🇧🇷', 
    color: '#eab308', 
    accent: '#16a34a',
    stats: { speed: 8, jump: 8, kick: 7 },
    specialName: 'SAMBA VORTEX SHOT',
    specialClass: 'warp',
    specialDesc: 'Releases a swirling energy curve ball that creates gravitational swerves in mid-air!'
  },
  { 
    id: 'argentina', 
    name: 'Argentina', 
    flag: '🇦🇷', 
    color: '#38bdf8', 
    accent: '#ffffff',
    stats: { speed: 7, jump: 9, kick: 8 },
    specialName: 'TANGO QUANTUM TELEPORT',
    specialClass: 'warp',
    specialDesc: 'Blinks the ball forward past opposing obstacles directly toward the crossbar!'
  },
  { 
    id: 'france', 
    name: 'France', 
    flag: '🇫🇷', 
    color: '#1d4ed8', 
    accent: '#ef4444',
    stats: { speed: 9, jump: 7, kick: 8 },
    specialName: 'HYPER-SONIC JET BLAST',
    specialClass: 'volt',
    specialDesc: 'Blasts a high-altitude heavy shockwave missile that explodes on turf contact!'
  },
  { 
    id: 'germany', 
    name: 'Germany', 
    flag: '🇩🇪', 
    color: '#0f172a', 
    accent: '#f59e0b',
    stats: { speed: 6, jump: 9, kick: 9 },
    specialName: 'PANZER ANVIL CRASH',
    specialClass: 'grav',
    specialDesc: 'Launches a gold cyber boulder with massive ironweight gravity to crush defense lines!'
  },
  { 
    id: 'england', 
    name: 'England', 
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 
    color: '#ffffff', 
    accent: '#dc2626',
    stats: { speed: 8, jump: 7, kick: 9 },
    specialName: 'ROYAL CORONA FLAME',
    specialClass: 'fire',
    specialDesc: 'Igni-fires the match ball into a molten streak of plasma, melting defensive traction!'
  },
  { 
    id: 'spain', 
    name: 'Spain', 
    flag: '🇪🇸', 
    color: '#dc2626', 
    accent: '#ffcc00',
    stats: { speed: 9, jump: 6, kick: 8 },
    specialName: 'MATADOR PLASMA swerve',
    specialClass: 'fire',
    specialDesc: 'Ignites fire trails that bend randomly with horizontal gravity bursts!'
  },
  { 
    id: 'portugal', 
    name: 'Portugal', 
    flag: '🇵🇹', 
    color: '#15803d', 
    accent: '#dc2626',
    stats: { speed: 9, jump: 9, kick: 6 },
    specialName: 'SIUUU SOLAR BURST',
    specialClass: 'volt',
    specialDesc: 'Unleashes electrostatic lightning discharges that freeze nearby defenders!'
  },
  { 
    id: 'japan', 
    name: 'Japan', 
    flag: '🇯🇵', 
    color: '#f8fafc', 
    accent: '#bc002d',
    stats: { speed: 9, jump: 8, kick: 7 },
    specialName: 'NEO CHERRY WINDWAVE',
    specialClass: 'warp',
    specialDesc: 'Lifts the ball into high-velocity winds that push standard player physics away!'
  }
];

interface DummySkin {
  id: string;
  name: string;
  desc: string;
  styleClass: string;
  bodyColor: string;
  jointColor: string;
  hazardColor: string;
  glow: string;
}

const SKINS: DummySkin[] = [
  { id: 'crash', name: 'CRASH DUMMY', desc: 'Standard industrial crash test mannequin with hazard markings.', styleClass: 'from-amber-500 to-amber-600', bodyColor: '#f59e0b', jointColor: '#1e293b', hazardColor: '#000000', glow: 'rgba(245, 158, 11, 0.4)' },
  { id: 'wood', name: 'WOODEN MANNEQUIN', desc: 'Elegant polished drawing joint mannequin with raw ring fibers.', styleClass: 'from-orange-700 to-amber-700', bodyColor: '#d97706', jointColor: '#78350f', hazardColor: '#451a03', glow: 'rgba(217, 119, 6, 0.25)' },
  { id: 'cyber', name: 'CYBER PROTOTYPE', desc: 'Sleek silver core sheathed in blue neon wire harnesses.', styleClass: 'from-slate-400 to-slate-500', bodyColor: '#cbd5e1', jointColor: '#0284c7', hazardColor: '#38bdf8', glow: 'rgba(56, 189, 248, 0.65)' },
  { id: 'gold', name: 'GOLD PROTO",TYPE', desc: 'Glittering high-performance champion prototype alloy.', styleClass: 'from-yellow-400 to-yellow-500', bodyColor: '#eab308', jointColor: '#451a03', hazardColor: '#ca8a04', glow: 'rgba(234, 179, 8, 0.8)' }
];

// Sound Synth Engine Helper
let audioCtx: AudioContext | null = null;
const playSynthSound = (type: 'kick' | 'bounce' | 'cheer' | 'goal' | 'whistle' | 'perfect' | 'fizz', isMuted: boolean) => {
  if (isMuted) return;
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const now = audioCtx.currentTime;

    if (type === 'kick') {
      // Wood-clack clunk
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.15);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(now + 0.16);

      // Noise burst for synthetic contact
      const bufferSize = audioCtx.sampleRate * 0.05;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;
      const noiseGain = audioCtx.createGain();
      noiseGain.gain.setValueAtTime(0.25, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      noise.connect(noiseGain);
      noiseGain.connect(audioCtx.destination);
      noise.start();
    } else if (type === 'bounce') {
      // Dull rubber whack
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.12);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(now + 0.13);
    } else if (type === 'fizz') {
      // Power up fizz
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.linearRampToValueAtTime(900, now + 0.35);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(now + 0.36);
    } else if (type === 'whistle') {
      // Three distinct whistle sweeps
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.frequency.setValueAtTime(1900, now);
      osc1.frequency.setValueAtTime(1950, now + 0.05);
      osc1.frequency.exponentialRampToValueAtTime(1800, now + 0.25);
      gain1.gain.setValueAtTime(0.2, now);
      gain1.gain.linearRampToValueAtTime(0.2, now + 0.2);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.start();
      osc1.stop(now + 0.26);
    } else if (type === 'perfect') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.12); // A5
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(now + 0.36);
    } else if (type === 'goal') {
      // Crowd swell and massive low hit
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(90, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.6);
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.61);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(now + 0.62);

      // White noise roar
      const bufferSize = audioCtx.sampleRate * 0.9;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(450, now);
      filter.frequency.exponentialRampToValueAtTime(650, now + 0.8);
      const noiseGain = audioCtx.createGain();
      noiseGain.gain.setValueAtTime(0.35, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.85);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(audioCtx.destination);
      noise.start();
    } else if (type === 'cheer') {
      // Subtle background stadium sound
      const bufferSize = audioCtx.sampleRate * 1.5;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.45;
      }
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, now);
      const noiseGain = audioCtx.createGain();
      noiseGain.gain.setValueAtTime(0.18, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.005, now + 1.4);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(audioCtx.destination);
      noise.start();
    }
  } catch (err) {
    console.warn('Synthesizer audio trigger failure:', err);
  }
};

// Particle Effects Struct
interface SplatParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  type: 'ember' | 'sawdust' | 'spark' | 'confetti';
}

// Rope/Net Node structure for interactive spring nets
interface NetPoint {
  x: number;
  y: number;
  ox: number;
  oy: number;
  vx: number;
  vy: number;
  pinned: boolean;
}

interface NetLink {
  pA: NetPoint;
  pB: NetPoint;
  originalLength: number;
}

export default function DummyWorldCup() {
  const [gameState, setGameState] = useState<'menu' | 'select' | 'bracket' | 'playing' | 'gameover' | 'victory'>('menu');
  const [gameMode, setGameMode] = useState<'pve' | 'pvp'>('pve');
  const [selectedP1, setSelectedP1] = useState<string>('brazil');
  const [selectedP2, setSelectedP2] = useState<string>('germany');
  const [p1Skin, setP1Skin] = useState<string>('crash');
  const [p2Skin, setP2Skin] = useState<string>('crash');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [tournamentRound, setTournamentRound] = useState<number>(1); // 1 = Quarter, 2 = Semi, 3 = Finals
  
  // Scoring
  const [scoreP1, setScoreP1] = useState<number>(0);
  const [scoreP2, setScoreP2] = useState<number>(0);
  const [matchTimer, setMatchTimer] = useState<number>(45);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [splashText, setSplashText] = useState<string>('');
  const [splashActive, setSplashActive] = useState<boolean>(false);
  const [statsPanel, setStatsPanel] = useState({ matches: 0, goals: 0, trophies: 0 });

  // Refs for loops
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const loopRef = useRef<number | null>(null);
  const keysPressed = useRef<Set<string>>(new Set());
  const splashTimerRef = useRef<number | null>(null);

  // Load localStorage Stats
  useEffect(() => {
    const saved = localStorage.getItem('dummywc_stats');
    if (saved) {
      try { statsPanel(JSON.parse(saved)); } catch(e){}
    }
  }, []);

  const saveStats = (newMatches: number, newGoals: number, newTrophies: number) => {
    const updated = {
      matches: statsPanel.matches + newMatches,
      goals: statsPanel.goals + newGoals,
      trophies: statsPanel.trophies + newTrophies
    };
    setStatsPanel(updated);
    localStorage.setItem('dummywc_stats', JSON.stringify(updated));
  };

  const currentMatchState = useRef({
    gameState: 'menu',
    scoreP1: 0,
    scoreP2: 0,
    matchTimer: 45,
    selectedP1: 'brazil',
    selectedP2: 'germany',
    p1Skin: 'crash',
    p2Skin: 'crash',
    difficulty: 'medium',
    tournamentRound: 1,
    gameMode: 'pve'
  });

  // Keep state sync ref to avoid React render closures lagging animation frame loops
  useEffect(() => {
    currentMatchState.current = {
      gameState,
      scoreP1,
      scoreP2,
      matchTimer,
      selectedP1,
      selectedP2,
      p1Skin,
      p2Skin,
      difficulty,
      tournamentRound,
      gameMode
    };
  }, [gameState, scoreP1, scoreP2, matchTimer, selectedP1, selectedP2, p1Skin, p2Skin, difficulty, tournamentRound, gameMode]);

  const triggerAnnouncerSplash = (msg: string) => {
    setSplashText(msg);
    setSplashActive(true);
    if (splashTimerRef.current) clearTimeout(splashTimerRef.current);
    splashTimerRef.current = window.setTimeout(() => {
      setSplashActive(false);
    }, 1800);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      keysPressed.current.add(k);
      keysPressed.current.add(e.key);
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(e.key) && currentMatchState.current.gameState === 'playing') {
        e.preventDefault();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      keysPressed.current.delete(k);
      keysPressed.current.delete(e.key);
      keysPressed.current.delete(e.key.toUpperCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (splashTimerRef.current) clearTimeout(splashTimerRef.current);
    };
  }, []);

  // Set match timer
  useEffect(() => {
    let timerId: NodeJS.Timeout | null = null;
    if (gameState === 'playing') {
      timerId = setInterval(() => {
        setMatchTimer(t => {
          if (t <= 1) {
            clearInterval(timerId!);
            playSynthSound('whistle', isMuted);
            // Decide final winner
            const finalP1 = currentMatchState.current.scoreP1;
            const finalP2 = currentMatchState.current.scoreP2;
            setTimeout(() => {
              concludeMatch(finalP1, finalP2);
            }, 1000);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => { if (timerId) clearInterval(timerId); };
  }, [gameState, isMuted]);

  const concludeMatch = (p1G: number, p2G: number) => {
    const isPvE = currentMatchState.current.gameMode === 'pve';
    saveStats(1, p1G, 0);

    if (p1G > p2G) {
      if (isPvE) {
        if (tournamentRound === 3) {
          // Absolute victory lift the custom trophy!
          saveStats(0, 0, 1);
          setGameState('victory');
        } else {
          // Advance bracket
          setTournamentRound(r => r + 1);
          setGameState('bracket');
        }
      } else {
        setGameState('gameover');
      }
    } else {
      // Defeat or tie
      setGameState('gameover');
    }
  };

  const kickOffMatch = () => {
    setScoreP1(0);
    setScoreP2(0);
    setMatchTimer(45);
    setGameState('playing');
    setTimeout(() => {
      triggerAnnouncerSplash("RAGDOLL KICKOFF!");
      playSynthSound('whistle', isMuted);
    }, 100);
  };

  const getOpponentForRound = (round: number) => {
    const index = (round + 2) % NATIONS.length;
    return NATIONS[index];
  };

  // Launch the core HTML5 game simulation
  useEffect(() => {
    if (gameState !== 'playing') {
      if (loopRef.current) cancelAnimationFrame(loopRef.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 500;
    const courtFloor = 415;

    // Load active skin parameters
    const p1Team = NATIONS.find(t => t.id === selectedP1) || NATIONS[0];
    const p2Team = currentMatchState.current.gameMode === 'pve' 
      ? getOpponentForRound(tournamentRound) 
      : (NATIONS.find(t => t.id === selectedP2) || NATIONS[1]);

    const p1SkinData = SKINS.find(s => s.id === p1Skin) || SKINS[0];
    const p2SkinData = SKINS.find(s => s.id === p2Skin) || SKINS[0];

    // SKELETAL RAGDOLL dummy variables
    interface MechanicalLimb {
      angle: number;
      targetAngle: number;
      velocity: number;
      length: number;
      ox: number; 
      oy: number;
    }

    class DummyAthlete {
      x: number;
      y: number;
      vx: number;
      vy: number;
      targetX: number;
      width: number = 38;
      height: number = 65;
      color: string;
      accent: string;
      isP1: boolean;
      facing: 'left' | 'right';
      
      // Ragdoll Joints
      spineAngle: number = 0;
      spineVelocity: number = 0;
      headWobble: number = 0;
      headWobbleVel: number = 0;
      
      // Floating legs/arms swing phase
      walkPhase: number = 0;
      kickDuration: number = 0;
      bicycleTimer: number = 0;
      
      // Stun state
      stunTimer: number = 0;
      isStunned: boolean = false;

      // Stats derived
      speed: number;
      jump: number;
      kickForce: number;

      // Super Meter %
      superMeter: number = 0;
      isSuperShotActive: boolean = false;
      skin: DummySkin;
      team: Team;
      isGoalkeeper: boolean;

      constructor(x: number, y: number, isP1: boolean, team: Team, skin: DummySkin, isGoalkeeper: boolean) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.targetX = x;
        this.isP1 = isP1;
        this.facing = isP1 ? 'right' : 'left';
        this.color = team.color;
        this.accent = team.accent;
        this.speed = 1.8 + (team.stats.speed * 0.12);
        this.jump = 6.8 + (team.stats.jump * 0.22);
        this.kickForce = 7.0 + (team.stats.kick * 0.32);
        this.skin = skin;
        this.team = team;
        this.isGoalkeeper = isGoalkeeper;
      }

      update(ball: any, keys: Set<string>, teammate: DummyAthlete, opponents: DummyAthlete[]) {
        const arenaGravity = 0.32;
        const opponentIsBot = !this.isP1 && currentMatchState.current.gameMode === 'pve';

        // Apply stun cooldown
        if (this.stunTimer > 0) {
          this.stunTimer--;
          this.isStunned = true;
          this.spineAngle += 0.2; // spinning face-flop
          this.vx *= 0.9;
          this.vy += arenaGravity;
          this.y += this.vy;
          if (this.y > courtFloor - this.height) {
            this.y = courtFloor - this.height;
            this.vy = 0;
          }
          if (this.stunTimer === 0) this.isStunned = false;
          return;
        }

        // Action Keys state detection
        let goLeft = false;
        let goRight = false;
        let doJump = false;
        let doKick = false;
        let doSuper = false;

        if (this.isP1) {
          goLeft = keys.has('a') || keys.has('arrowleft');
          goRight = keys.has('d') || keys.has('arrowright');
          doJump = keys.has('w') || keys.has('arrowup');
          doKick = keys.has('s') || keys.has(' ') || keys.has('f') || keys.has('arrowdown');
          // Allow super shots if meter filled
          doSuper = (keys.has('q') || keys.has('e') || keys.has('Shift')) && this.superMeter >= 100;
        } else {
          if (opponentIsBot) {
            // HIGH FIDELITY AI ROBOT BEHAVIOR (Goalie vs Striker Roles)
            const botDifficulty = currentMatchState.current.difficulty;
            const reactRate = botDifficulty === 'easy' ? 0.02 : botDifficulty === 'medium' ? 0.045 : 0.075;
            const dx = ball.x - this.x;

            if (this.isGoalkeeper) {
              // GOALKEEPER AI: Protects right sector
              const targetDefenseX = 660; 
              if (ball.x > 450) {
                if (dx < -30) goLeft = Math.random() < reactRate * 10;
                else if (dx > 30) goRight = Math.random() < reactRate * 10;
              } else {
                if (this.x > targetDefenseX + 15) goLeft = true;
                else if (this.x < targetDefenseX - 15) goRight = true;
              }

              // Save leap if ball is coming high or fast
              const ballComingFace = Math.abs(dx) < 110 && ball.vx > 0;
              if (ballComingFace && ball.y < courtFloor - 75 && Math.random() < reactRate * 1.5) {
                doJump = true;
              }
              // Defensive clearance kick
              if (Math.hypot(dx, ball.y - this.y) < 95 && Math.random() < reactRate * 2.2) {
                doKick = true;
              }
            } else {
              // STRIKER AI: Pursues the ball aggressively in center and left half
              if (Math.abs(dx) > 25) {
                if (dx < 0) goLeft = Math.random() < reactRate * 12;
                else goRight = Math.random() < reactRate * 12;
              }
              
              // Attack jump
              const ballInStrikingRange = Math.abs(dx) < 130 && ball.y < courtFloor - 90;
              if (ballInStrikingRange && Math.random() < reactRate * 1.2) {
                doJump = true;
              }
              // Attack kick
              if (Math.hypot(dx, ball.y - this.y) < 110 && Math.random() < reactRate * 2.4) {
                doKick = true;
              }
            }

            if (this.superMeter >= 100 && Math.random() < 0.01) {
              doSuper = true;
            }
          } else {
            // PvP Player 2 Key Mappings
            goLeft = keys.has('j');
            goRight = keys.has('l');
            doJump = keys.has('i');
            doKick = keys.has('k') || keys.has('enter');
            doSuper = keys.has('o') && this.superMeter >= 100;
          }
        }

        const airborne = this.y < courtFloor - this.height - 5;

        // Horizonal walking influence
        if (goLeft) {
          this.vx = -this.speed;
          this.facing = 'left';
          this.walkPhase += 0.22;
          this.spineAngle -= 0.02 * Math.sin(this.walkPhase);
          if (airborne) {
            this.spineVelocity -= 0.04; // aerial tumble tilt
          }
        } else if (goRight) {
          this.vx = this.speed;
          this.facing = 'right';
          this.walkPhase += 0.22;
          this.spineAngle += 0.02 * Math.sin(this.walkPhase);
          if (airborne) {
            this.spineVelocity += 0.04; // aerial tumble tilt
          }
        } else {
          this.vx *= 0.82; // damping friction
          this.spineAngle *= 0.88; // return vertical
        }

        // Active floppy jumping leap
        if (doJump && !airborne) {
          this.vy = -this.jump;
          this.walkPhase = 0;
          // Leap momentum in direction facing
          this.vx += this.facing === 'right' ? 2.5 : -2.5;
          // Jump flipping angle
          this.spineVelocity = this.facing === 'right' ? 0.32 : -0.32;
          playSynthSound('kick', isMuted);
        }

        // Mid-air acrobatic salvage (bicycle/head flip)
        if (doKick && airborne && this.bicycleTimer <= 0) {
          this.bicycleTimer = 25;
          this.spineVelocity = this.facing === 'right' ? -0.85 : 0.85;
          this.vy = -2.0; // aerial flip lift-boost
          playSynthSound('perfect', isMuted);
        } else if (this.bicycleTimer > 0) {
          this.bicycleTimer--;
        }

        // Kick animation activation
        if (doKick && this.kickDuration <= 0) {
          this.kickDuration = 18;
          playSynthSound('kick', isMuted);
          this.superMeter = Math.min(100, this.superMeter + 10);
        } else if (this.kickDuration > 0) {
          this.kickDuration--;
        }

        // Integrate Physics Forces
        this.vy += arenaGravity;
        this.x += this.vx;
        this.y += this.vy;

        // Ground bounds floor
        if (this.y > courtFloor - this.height) {
          this.y = courtFloor - this.height;
          this.vy = 0;
          if (Math.abs(this.spineAngle) > 0.05) {
            this.spineVelocity = -this.spineVelocity * 0.45;
          }
        }

        // Clamping horizontal zones (to preserve goalie vs attacker layout roles!)
        if (this.isP1) {
          if (this.isGoalkeeper) {
            if (this.x < 35) { this.x = 35; this.vx = 0; }
            if (this.x > 260) { this.x = 260; this.vx = 0; }
          } else {
            if (this.x < 130) { this.x = 130; this.vx = 0; }
            if (this.x > 500) { this.x = 500; this.vx = 0; }
          }
        } else {
          if (this.isGoalkeeper) {
            if (this.x < 540) { this.x = 540; this.vx = 0; }
            if (this.x > 765) { this.x = 765; this.vx = 0; }
          } else {
            if (this.x < 300) { this.x = 300; this.vx = 0; }
            if (this.x > 670) { this.x = 670; this.vx = 0; }
          }
        }

        // Spine Stiffness recovery model
        this.spineAngle += this.spineVelocity;
        this.spineVelocity += -this.spineAngle * 0.14; 
        this.spineVelocity *= 0.86; // raw air dampening

        this.headWobble += this.headWobbleVel;
        this.headWobbleVel += -this.headWobble * 0.2;
        this.headWobbleVel *= 0.84;

        // Super shots discharge trigger
        if (doSuper && !this.isSuperShotActive) {
          this.isSuperShotActive = true;
          this.superMeter = 0;
          ball.vx = this.facing === 'right' ? this.kickForce * 1.85 : -this.kickForce * 1.85;
          ball.vy = -3.5;
          ball.glowingSpecial = this.team.specialClass;
          triggerAnnouncerSplash(`${this.team.name.toUpperCase()}: ${this.team.specialName}!`);
          playSynthSound('goal', isMuted);
          
          if (this.team.specialClass === 'volt') {
            // Shock lock freeze opponents!
            opponents.forEach(op => { op.stunTimer = 100; });
            playSynthSound('perfect', isMuted);
          }
          setTimeout(() => { this.isSuperShotActive = false; }, 800);
        }
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        
        // Target anchor point
        const hx = this.x;
        const hy = this.y + 4;

        // Draw selection shadow trail
        ctx.fillStyle = 'rgba(0,0,0,0.22)';
        ctx.beginPath();
        ctx.ellipse(this.x, courtFloor - 3, 24, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        // 1. DRAW ARMS & SKELETER JOINTS
        const walkRot = Math.sin(this.walkPhase) * 0.45;
        const kickRot = this.kickDuration > 0 ? (this.facing === 'right' ? 1.4 : -1.4) : 0;
        
        ctx.translate(hx, hy);
        ctx.rotate(this.spineAngle);

        const buildJoint = (ox: number, oy: number, targetAng: number, limbLen: number, color: string, w: number = 8) => {
          ctx.save();
          ctx.translate(ox, oy);
          ctx.rotate(targetAng);
          ctx.fillStyle = color;
          ctx.strokeStyle = this.skin.jointColor;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          // Draw wooden capsule bone
          ctx.roundRect(-w/2, 0, w, limbLen, w/2);
          ctx.fill();
          ctx.stroke();
          
          // Joint bolt
          ctx.fillStyle = this.skin.jointColor;
          ctx.beginPath();
          ctx.arc(0, 0, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        };

        // Draw Left arm and leg behind
        const armCol = this.skin.bodyColor;
        buildJoint(-10, -28, walkRot - 0.4, 25, armCol, 7);
        buildJoint(-8, 5, -walkRot + 0.3 + kickRot, 25, armCol, 9); // back thigh leg

        // 2. TORSO CAPSULE
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.skin.jointColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(-this.width/2, -35, this.width, 42, 10);
        ctx.fill();
        ctx.stroke();

        // Overlay hazard lines on Crash Dummy or grain knots on wood
        ctx.clip();
        if (this.skin.id === 'crash') {
          ctx.fillStyle = this.skin.hazardColor;
          ctx.beginPath();
          ctx.moveTo(-18, -12); ctx.lineTo(-4, -12); ctx.lineTo(-12, 1); ctx.fill();
          ctx.beginPath();
          ctx.moveTo(18, -12); ctx.lineTo(4, -12); ctx.lineTo(12, 1); ctx.fill();
        } else if (this.skin.id === 'wood') {
          // Circular wood grain contours
          ctx.strokeStyle = 'rgba(0,0,0,0.12)';
          ctx.lineWidth = 2.5;
          ctx.beginPath(); ctx.arc(0, -10, 18, 0, Math.PI*2); ctx.stroke();
          ctx.beginPath(); ctx.arc(0, -10, 8, 0, Math.PI*2); ctx.stroke();
        } else if (this.skin.id === 'cyber') {
          // Circuit wiring grids
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(-12, -22); ctx.lineTo(12, -22);
          ctx.moveTo(0, -35); ctx.lineTo(0, 5);
          ctx.stroke();
        }
        ctx.restore();

        // Flag badge jersey detailing overlay
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(this.team.flag, this.facing === 'right' ? -6 : 6, -11);

        // Position labeling text GK/ST on jersey
        ctx.fillStyle = 'rgba(255,255,255,0.78)';
        ctx.font = 'black 8.5px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(this.isGoalkeeper ? 'GK' : 'ST', this.facing === 'right' ? 7 : -7, -23);

        // 3. FRONT RAGDOLL ARMS & LEGS
        buildJoint(11, -28, -walkRot + 0.5 + kickRot, 25, armCol, 7); // front arm
        buildJoint(8, 5, walkRot + 0.1 - kickRot * 1.5, 25, armCol, 9); // front leg kick snap mechanics

        // 4. FLOATING HEADER OR CRASH HEAD BALL
        ctx.save();
        ctx.translate(0 + Math.sin(this.headWobble) * 6, -45);
        ctx.rotate(this.headWobble);
        
        ctx.fillStyle = this.skin.bodyColor;
        ctx.strokeStyle = this.skin.jointColor;
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.arc(0, -11, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Draw wooden dummy eye slots or crash sector warning logos
        if (this.skin.id === 'crash') {
          // Classic black/yellow circular warnings
          ctx.fillStyle = this.skin.hazardColor;
          ctx.beginPath();
          ctx.moveTo(0, -11); ctx.arc(0, -11, 14, 0, Math.PI * 0.5); ctx.lineTo(0, -11); ctx.fill();
          ctx.beginPath();
          ctx.moveTo(0, -11); ctx.arc(0, -11, 14, Math.PI, Math.PI * 1.5); ctx.lineTo(0, -11); ctx.fill();
        } else if (this.skin.id === 'cyber') {
          // Glowing electric HUD slots
          ctx.fillStyle = '#06b6d4';
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#06b6d4';
          ctx.fillRect(-8, -15, 6, 3);
          ctx.fillRect(2, -15, 6, 3);
        } else {
          // Simple expressive dots
          ctx.fillStyle = this.skin.hazardColor;
          ctx.beginPath();
          ctx.arc(-5, -13, 2, 0, Math.PI*2);
          ctx.arc(5, -13, 2, 0, Math.PI*2);
          ctx.fill();
          ctx.strokeStyle = this.skin.hazardColor;
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.moveTo(-5, -6); ctx.quadraticCurveTo(0, -9, 5, -6);
          ctx.stroke();
        }
        ctx.restore();

        // Special Freeze Ice Block Overlay if stunned!
        if (this.isStunned) {
          ctx.fillStyle = 'rgba(56, 189, 248, 0.42)';
          ctx.strokeStyle = '#0284c7';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.roundRect(-24, -65, 48, 85, 8);
          ctx.fill();
          ctx.stroke();
        }

        ctx.restore();
      }
    }

    // 2. SOCCER PHYSICAL BALL SECTIONS
    let soccerBall = {
      x: 400,
      y: 120,
      vx: 0,
      vy: 1.0,
      radius: 17,
      rotation: 0,
      glowingSpecial: '' as string, // 'volt', 'warp', etc
      trail: [] as { x: number; y: number; age: number }[],
      dampingX: 0.985,
      dampingY: 0.78
    };

    // Instantiate goalkeeper and striker athletes for each team to achieve realistic Playgama team simulation
    const p1Gk = new DummyAthlete(130, courtFloor - 65, true, p1Team, p1SkinData, true);
    const p1St = new DummyAthlete(280, courtFloor - 65, true, p1Team, p1SkinData, false);
    const p2Gk = new DummyAthlete(670, courtFloor - 65, false, p2Team, p2SkinData, true);
    const p2St = new DummyAthlete(520, courtFloor - 65, false, p2Team, p2SkinData, false);

    // Goal bounds
    const leftGoalLine = 58;
    const rightGoalLine = 742;
    const crossbarHeight = 265;

    // CONFETTI PARTY CONSTRUCT
    const confettiList: SplatParticle[] = [];
    const triggerGoalCelebrationSpark = (goalX: number, goalY: number) => {
      for (let i = 0; i < 45; i++) {
        confettiList.push({
          x: goalX,
          y: goalY,
          vx: (Math.random() - 0.5) * 11,
          vy: -Math.random() * 8 - 4,
          color: `hsl(${Math.random() * 360}, 100%, 65%)`,
          size: Math.random() * 5 + 3,
          life: 0,
          maxLife: 90,
          type: 'confetti'
        });
      }
    };

    // GOAL BANNERS SCORING TRIGGER
    let scoreCooldownTimer = 0;

    // --- Goal Net Physics system ---
    const netPointsLeft: NetPoint[] = [];
    const netLinksLeft: NetLink[] = [];
    const netPointsRight: NetPoint[] = [];
    const netLinksRight: NetLink[] = [];

    // Create Left Net system (hangs from x=[0..leftGoalLine])
    for (let j = 0; j < 5; j++) {
      for (let i = 0; i < 4; i++) {
        const nx = (i / 3) * leftGoalLine;
        const ny = crossbarHeight + (j / 4) * (courtFloor - crossbarHeight);
        const pin = (i === 0) || (j === 0) || (i === 3 && j === 0);
        netPointsLeft.push({ x: nx, y: ny, ox: nx, oy: ny, vx: 0, vy: 0, pinned: pin });
      }
    }
    // Links Left
    for (let j = 0; j < 5; j++) {
      for (let i = 0; i < 4; i++) {
        const id = j * 4 + i;
        if (i < 3) netLinksLeft.push({ pA: netPointsLeft[id], pB: netPointsLeft[id + 1], originalLength: leftGoalLine / 3 });
        if (j < 4) netLinksLeft.push({ pA: netPointsLeft[id], pB: netPointsLeft[id + 4], originalLength: (courtFloor - crossbarHeight) / 4 });
      }
    }

    // Create Right Net system
    for (let j = 0; j < 5; j++) {
      for (let i = 0; i < 4; i++) {
        const nx = rightGoalLine + (i / 3) * (800 - rightGoalLine);
        const ny = crossbarHeight + (j / 4) * (courtFloor - crossbarHeight);
        const pin = (i === 3) || (j === 0) || (i === 0 && j === 0);
        netPointsRight.push({ x: nx, y: ny, ox: nx, oy: ny, vx: 0, vy: 0, pinned: pin });
      }
    }
    // Links Right
    for (let j = 0; j < 5; j++) {
      for (let i = 0; i < 4; i++) {
        const id = j * 4 + i;
        if (i < 3) netLinksRight.push({ pA: netPointsRight[id], pB: netPointsRight[id + 1], originalLength: (800 - rightGoalLine) / 3 });
        if (j < 4) netLinksRight.push({ pA: netPointsRight[id], pB: netPointsRight[id + 4], originalLength: (courtFloor - crossbarHeight) / 4 });
      }
    }

    const resetSoccerGamePitch = (lastScorer: 'p1' | 'p2') => {
      soccerBall.x = 400;
      soccerBall.y = 120;
      soccerBall.vx = lastScorer === 'p1' ? 2.5 : -2.5;
      soccerBall.vy = -3.5;
      soccerBall.glowingSpecial = '';
      
      p1Gk.x = 130; p1Gk.y = courtFloor - p1Gk.height; p1Gk.vx = 0; p1Gk.vy = 0; p1Gk.spineAngle = 0; p1Gk.spineVelocity = 0; p1Gk.stunTimer = 0; p1Gk.isStunned = false;
      p1St.x = 280; p1St.y = courtFloor - p1St.height; p1St.vx = 0; p1St.vy = 0; p1St.spineAngle = 0; p1St.spineVelocity = 0; p1St.stunTimer = 0; p1St.isStunned = false;
      p2Gk.x = 670; p2Gk.y = courtFloor - p2Gk.height; p2Gk.vx = 0; p2Gk.vy = 0; p2Gk.spineAngle = 0; p2Gk.spineVelocity = 0; p2Gk.stunTimer = 0; p2Gk.isStunned = false;
      p2St.x = 520; p2St.y = courtFloor - p2St.height; p2St.vx = 0; p2St.vy = 0; p2St.spineAngle = 0; p2St.spineVelocity = 0; p2St.stunTimer = 0; p2St.isStunned = false;
    };

    // Elastic Collision push away for dummies (creates funny piles, stacks & hurdles on center field!)
    const resolveAthleteOpponentCollision = (a: DummyAthlete, b: DummyAthlete) => {
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.hypot(dx, dy);
      const minDist = 36; // horizontal comfort capsule overlaps
      if (dist < minDist && dist > 0) {
        const angle = Math.atan2(dy, dx);
        const overlap = minDist - dist;
        // Push apart gently
        a.x -= Math.cos(angle) * overlap * 0.5;
        a.y -= Math.sin(angle) * overlap * 0.5;

        // Exchange some velocities
        const tempX = a.vx;
        a.vx = a.vx * 0.45 + b.vx * 0.55;
        b.vx = b.vx * 0.45 + tempX * 0.55;
      }
    };

    const drawGoalposts = (ctx: CanvasRenderingContext2D) => {
      // Left Goal Post Shadow
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.22)';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(3, courtFloor);
      ctx.lineTo(leftGoalLine - 2, crossbarHeight + 2);
      ctx.lineTo(-2, crossbarHeight + 2);
      ctx.stroke();

      // Left Goal Post Frame High Contrast Gloss white
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 6.5;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, courtFloor);
      ctx.lineTo(leftGoalLine, crossbarHeight);
      ctx.lineTo(0, crossbarHeight);
      ctx.stroke();

      // Right Goal Post Shadow
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.22)';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(797, courtFloor);
      ctx.lineTo(rightGoalLine + 2, crossbarHeight + 2);
      ctx.lineTo(802, crossbarHeight + 2);
      ctx.stroke();

      // Right Goal Post Frame High Contrast Gloss white
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 6.5;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(800, courtFloor);
      ctx.lineTo(rightGoalLine, crossbarHeight);
      ctx.lineTo(800, crossbarHeight);
      ctx.stroke();

      // Draw shiny caps at joints
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(leftGoalLine, crossbarHeight, 4, 0, Math.PI * 2);
      ctx.arc(rightGoalLine, crossbarHeight, 4, 0, Math.PI * 2);
      ctx.fill();

      // Net links draws
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.38)';
      ctx.lineWidth = 1.5;
      const drawWeb = (links: NetLink[]) => {
        links.forEach(l => {
          ctx.beginPath();
          ctx.moveTo(l.pA.x, l.pA.y);
          ctx.lineTo(l.pB.x, l.pB.y);
          ctx.stroke();
        });
      };
      drawWeb(netLinksLeft);
      drawWeb(netLinksRight);
    };

    const updateGoalNets = (ball: any) => {
      // Net physics resolution
      const solveNet = (pts: NetPoint[], lks: NetLink[]) => {
        // Gravity
        pts.forEach(p => {
          if (!p.pinned) {
            p.vy += 0.08;
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.95;
            p.vy *= 0.95;
          }
        });
        // Spring links
        for (let step = 0; step < 3; step++) {
          lks.forEach(l => {
            const dx = l.pB.x - l.pA.x;
            const dy = l.pB.y - l.pA.y;
            const dist = Math.hypot(dx, dy);
            const diff = l.originalLength - dist;
            const prc = (diff / dist) * 0.45;
            const offsetX = dx * prc;
            const offsetY = dy * prc;
            if (!l.pA.pinned) { l.pA.x -= offsetX; l.pA.y -= offsetY; }
            if (!l.pB.pinned) { l.pB.x += offsetX; l.pB.y += offsetY; }
          });
        }
        // Collide with ball mechanics
        pts.forEach(p => {
          const db = Math.hypot(ball.x - p.x, ball.y - p.y);
          if (db < ball.radius + 15) {
            const angle = Math.atan2(p.y - ball.y, p.x - ball.x);
            const force = (ball.radius + 15 - db) * 0.4;
            p.vx += Math.cos(angle) * force;
            p.vy += Math.sin(angle) * force;
            ball.vx -= Math.cos(angle) * force * 0.12;
            ball.vy -= Math.sin(angle) * force * 0.12;
          }
        });
      };
      solveNet(netPointsLeft, netLinksLeft);
      solveNet(netPointsRight, netLinksRight);
    };

    const tickAnimation = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. BACKGROUND DRAW (Vibrant Outdoor Stadium Day Sky)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 240);
      skyGrad.addColorStop(0, '#0284c7'); // Rich sky blue
      skyGrad.addColorStop(0.5, '#38bdf8'); // Vibrant sky light blue
      skyGrad.addColorStop(1, '#bae6fd'); // Warm peach sky near horizon
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, canvas.width, 240);

      // Draw Golden Sun high up
      const sunGrad = ctx.createRadialGradient(400, -20, 20, 400, -20, 150);
      sunGrad.addColorStop(0, '#fffbeb');
      sunGrad.addColorStop(0.3, '#fef08a');
      sunGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(400, -20, 150, 0, Math.PI * 2);
      ctx.fill();

      // Drawing cute fluffy clouds drifting in background
      const timeMs = Date.now();
      const drawCloud = (cx: number, cy: number, scale: number) => {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
        ctx.beginPath();
        ctx.arc(cx, cy, 18 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 15 * scale, cy - 8 * scale, 15 * scale, 0, Math.PI * 2);
        ctx.arc(cx - 15 * scale, cy - 5 * scale, 12 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 28 * scale, cy + 2 * scale, 11 * scale, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
      };
      drawCloud(((timeMs / 180) % (canvas.width + 120)) - 60, 60, 1.2);
      drawCloud((((timeMs / 240) + 350) % (canvas.width + 150)) - 75, 45, 0.9);
      drawCloud((((timeMs / 300) + 680) % (canvas.width + 180)) - 90, 80, 1.5);

      // DRAW STADIUM STALKING TRIBUNES (Concrete tiers)
      ctx.fillStyle = '#475569'; // Back dark concrete
      ctx.beginPath();
      ctx.moveTo(0, 240);
      ctx.lineTo(800, 240);
      ctx.lineTo(800, 160);
      ctx.lineTo(0, 160);
      ctx.closePath();
      ctx.fill();

      // Tribune tier lines (3 rows)
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 3;
      for (let r = 0; r < 3; r++) {
        const ry = 160 + r * 27;
        ctx.beginPath();
        ctx.moveTo(0, ry);
        ctx.lineTo(800, ry);
        ctx.stroke();
      }

      // Draw Stadium Pillars & Flagpoles along the horizon
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2.5;
      for (let i = 0; i < 9; i++) {
        const px = 20 + i * 95;
        // Draw pillar
        ctx.beginPath();
        ctx.moveTo(px, 160);
        ctx.lineTo(px, 130);
        ctx.stroke();
        // Drawing flags on poles
        ctx.fillStyle = i % 2 === 0 ? p1Team.color : p2Team.color;
        ctx.beginPath();
        ctx.moveTo(px, 130);
        ctx.lineTo(px + 16, 135);
        ctx.lineTo(px, 142);
        ctx.closePath();
        ctx.fill();
      }

      // HIGH FIDELITY ANIMATED SPECTATORS (Waving country flags!)
      const bobbingSpeed = scoreCooldownTimer > 0 ? 150 : 350;
      const bobbingAmp = scoreCooldownTimer > 0 ? 12 : 5;
      const fanColors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#f8fafc', '#1e293b'];

      for (let r = 0; r < 3; r++) {
        const ry = 175 + r * 27;
        for (let i = 0; i < 30; i++) {
          const fx = 15 + i * 27 + (r * 10) % 15;
          const bob = Math.sin((timeMs / bobbingSpeed) + i + r) * bobbingAmp;
          const fy = ry + bob;
          
          // Fan head dot
          ctx.fillStyle = fanColors[(i + r) % fanColors.length];
          ctx.beginPath();
          ctx.arc(fx, fy - 11, 4.5, 0, Math.PI * 2);
          ctx.fill();

          // Fan body curve
          ctx.beginPath();
          ctx.arc(fx, fy + 4, 7, Math.PI, 0);
          ctx.fill();

          // Country flags waving (wavy curves)
          if ((i + r) % 7 === 0) {
            const isP1Side = fx < 400;
            ctx.font = '10px sans-serif';
            ctx.save();
            ctx.translate(fx + 3, fy - 16);
            ctx.rotate(Math.sin((timeMs / 120) + i) * 0.22);
            ctx.fillText(isP1Side ? p1Team.flag : p2Team.flag, 0, 0);
            ctx.restore();
          }
        }
      }

      // GIANT FLOODLIGHT TOWERS (Highly polished metallic pillars with glowing light beams)
      const drawFloodlight = (x: number) => {
        // High post
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(x, 160);
        ctx.lineTo(x, 40);
        ctx.stroke();

        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(x - 12, 40);
        ctx.lineTo(x + 12, 40);
        ctx.lineTo(x, 160);
        ctx.closePath();
        ctx.stroke();

        // Light head panel
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(x - 18, 25, 36, 16, 4);
        ctx.fill();

        // Drawn bulb halos
        const flareGlow = ctx.createRadialGradient(x, 33, 4, x, 33, 30);
        flareGlow.addColorStop(0, '#ffffff');
        flareGlow.addColorStop(0.3, 'rgba(255, 254, 215, 0.82)');
        flareGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = flareGlow;
        ctx.beginPath();
        ctx.arc(x, 33, 30, 0, Math.PI * 2);
        ctx.fill();
      };
      drawFloodlight(75);
      drawFloodlight(725);

      // SIDELINE ADVERTISEMENT SPONSOR BOARDS WITH SPRAY TEXTS
      const adLabels = [
        "PLAYGAMA", "DUMMIES WORLD CUP", "DOONDOOK", "GOALLL!!!", "SOCCER STAR", "FAIR PLAY"
      ];
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 240, 800, 175); // Stadium stands dark containment apron wall

      for (let b = 0; b < 6; b++) {
        const bx = 45 + b * 118;
        const by = 217;
        
        ctx.fillStyle = b % 2 === 0 ? '#1e293b' : '#334155';
        ctx.strokeStyle = b % 3 === 0 ? '#38bdf8' : b % 3 === 1 ? '#eab308' : '#f43f5e';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.roundRect(bx, by, 106, 22, 3);
        ctx.fill();
        ctx.stroke();

        // Sponsor text labeling
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(adLabels[b], bx + 53, by + 13);
      }

      // Draw Pitch ground turf with beautiful Alternating vertical stripes (Vibrant Lawnmower lawn style)
      const segmentsNum = 12;
      const segWidth = canvas.width / segmentsNum;
      for (let s = 0; s < segmentsNum; s++) {
        ctx.fillStyle = s % 2 === 0 ? '#10b981' : '#059669'; // Vibrant playground field greens!
        ctx.fillRect(s * segWidth, courtFloor, segWidth, canvas.height - courtFloor);
      }

      // Pitch lines white chalk (High Contrast glossy finish)
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3.5;
      
      // Center Line
      ctx.beginPath();
      ctx.moveTo(400, courtFloor);
      ctx.lineTo(400, canvas.height);
      ctx.stroke();

      // Center Circle
      ctx.beginPath();
      ctx.arc(400, (courtFloor + canvas.height) / 2, 45, 0, Math.PI * 2);
      ctx.stroke();

      // Top chalk boundary border
      ctx.beginPath();
      ctx.moveTo(0, courtFloor + 1.5);
      ctx.lineTo(800, courtFloor + 1.5);
      ctx.stroke();

      // Penalty area box Left
      ctx.beginPath();
      ctx.rect(-10, courtFloor, 155, canvas.height - courtFloor + 10);
      ctx.stroke();

      // Penalty area box Right
      ctx.beginPath();
      ctx.rect(655, courtFloor, 155, canvas.height - courtFloor + 10);
      ctx.stroke();

      // Scoreboard HUD built inside the stadium canvas center!
      ctx.save();
      ctx.translate(400, 25);
      // Main board body
      ctx.fillStyle = '#020617';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-80, 0, 160, 36, 6);
      ctx.fill();
      ctx.stroke();

      // Support metal posts
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-50, 0); ctx.lineTo(-50, -10);
      ctx.moveTo(50, 0); ctx.lineTo(50, -10);
      ctx.stroke();

      // Scoreboard active texts
      ctx.fillStyle = '#ffcc00';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${p1Team.flag}  ${scoreP1} - ${scoreP2}  ${p2Team.flag}`, 0, 22);
      ctx.restore();

      // Goal Nets computation & Drawing
      updateGoalNets(soccerBall);
      drawGoalposts(ctx);

      // 2. ATHLETE SIMULATION UPDATES (Both goalkeeper and striker on each side)
      p1Gk.update(soccerBall, keysPressed.current, p1St, [p2Gk, p2St]);
      p1St.update(soccerBall, keysPressed.current, p1Gk, [p2Gk, p2St]);
      p2Gk.update(soccerBall, keysPressed.current, p2St, [p1Gk, p1St]);
      p2St.update(soccerBall, keysPressed.current, p2Gk, [p1Gk, p1St]);

      // Handle friendly / aggressive physical pushes & hurdles between floppy dummies
      resolveAthleteOpponentCollision(p1Gk, p1St);
      resolveAthleteOpponentCollision(p2Gk, p2St);
      resolveAthleteOpponentCollision(p1St, p2St);
      resolveAthleteOpponentCollision(p1St, p2Gk);
      resolveAthleteOpponentCollision(p2St, p1Gk);

      // Draw all four athletes
      p1Gk.draw(ctx);
      p1St.draw(ctx);
      p2Gk.draw(ctx);
      p2St.draw(ctx);

      // 3. PHYSICAL BALL COMPUTATION
      soccerBall.vy += 0.18; // ball gravity weight
      soccerBall.vx *= soccerBall.dampingX;
      soccerBall.vy *= 0.985;
      soccerBall.x += soccerBall.vx;
      soccerBall.y += soccerBall.vy;

      // Friction bounce on ground turf
      if (soccerBall.y > courtFloor - soccerBall.radius) {
        soccerBall.y = courtFloor - soccerBall.radius;
        soccerBall.vy = -soccerBall.vy * soccerBall.dampingY;
        soccerBall.vx *= 0.95;
        if (Math.abs(soccerBall.vy) > 1.0) {
          playSynthSound('bounce', isMuted);
        }
      }

      // Sky ceiling limits
      if (soccerBall.y < soccerBall.radius) {
        soccerBall.y = soccerBall.radius;
        soccerBall.vy = -soccerBall.vy * 0.5;
      }

      // Border bounds
      if (soccerBall.x < soccerBall.radius) {
        soccerBall.x = soccerBall.radius;
        soccerBall.vx = -soccerBall.vx * 0.6;
      }
      if (soccerBall.x > canvas.width - soccerBall.radius) {
        soccerBall.x = canvas.width - soccerBall.radius;
        soccerBall.vx = -soccerBall.vx * 0.6;
      }

      // 4. MULTI-CIRCLE ATHLETE COLLISION RESOLUTION
      const resolveBallAthleteCollisions = (player: DummyAthlete) => {
        // We model college head, torso capsule, and active shoe swing spheres
        const checkSphereColl = (cx: number, cy: number, r: number) => {
          const dist = Math.hypot(soccerBall.x - cx, soccerBall.y - cy);
          if (dist < soccerBall.radius + r) {
            // Push out physics
            const angle = Math.atan2(soccerBall.y - cy, soccerBall.x - cx);
            const overlap = (soccerBall.radius + r) - dist;
            soccerBall.x += Math.cos(angle) * overlap;
            soccerBall.y += Math.sin(angle) * overlap;

            // Simple energy relative physics kick reflection
            const rx = soccerBall.vx - player.vx;
            const ry = soccerBall.vy - player.vy;
            let normalVel = rx * Math.cos(angle) + ry * Math.sin(angle);
            
            if (player.kickDuration > 0) {
              // High impact kinetic kick: launches ball beautifully forward at goal height
              const xForce = player.facing === 'right' ? player.kickForce * 1.15 : -player.kickForce * 1.15;
              const yForce = -player.kickForce * 0.7 - Math.random() * 2;
              soccerBall.vx = xForce;
              soccerBall.vy = yForce;
              playSynthSound('goal', isMuted);
            } else if (normalVel < 0) {
              const impulse = -(1.45) * normalVel;
              soccerBall.vx += Math.cos(angle) * impulse;
              soccerBall.vy += Math.sin(angle) * impulse;
              soccerBall.vx += player.vx * 0.35;
              soccerBall.vy += player.vy * 0.35;
              playSynthSound('kick', isMuted);
            }
          }
        };

        // Torso collision sphere stack
        checkSphereColl(player.x, player.y - 12, 18);
        checkSphereColl(player.x, player.y - 28, 16);
        
        // Head circle bubble
        checkSphereColl(player.x + Math.sin(player.headWobble)*5, player.y - 52, 15);

        // Shoes swing nodes
        const shoeXOffset = player.facing === 'right' ? 14 : -14;
        const shoeX = player.x + shoeXOffset + (player.kickDuration > 0 ? (player.facing === 'right' ? 14 : -14) : 0);
        checkSphereColl(shoeX, player.y + 18, 11);
      };

      resolveBallAthleteCollisions(p1Gk);
      resolveBallAthleteCollisions(p1St);
      resolveBallAthleteCollisions(p2Gk);
      resolveBallAthleteCollisions(p2St);

      // Special Ability visual trails
      if (soccerBall.glowingSpecial) {
        soccerBall.trail.push({ x: soccerBall.x, y: soccerBall.y, age: 0 });
        ctx.save();
        ctx.strokeStyle = soccerBall.glowingSpecial === 'volt' ? '#38bdf8' : soccerBall.glowingSpecial === 'fire' ? '#ef4444' : '#c084fc';
        ctx.shadowBlur = 12;
        ctx.shadowColor = ctx.strokeStyle;
        ctx.lineWidth = 15;
        ctx.beginPath();
        soccerBall.trail.forEach((t, index) => {
          if (index === 0) ctx.moveTo(t.x, t.y);
          else ctx.lineTo(t.x, t.y);
        });
        ctx.stroke();
        ctx.restore();
      }

      // Age trails limits
      soccerBall.trail.forEach(t => t.age++);
      soccerBall.trail = soccerBall.trail.filter(t => t.age < 12);

      // 5. DRAW ACTIVE BALL (High-fidelity Spinning Classic Soccer Ball)
      soccerBall.rotation += soccerBall.vx * 0.05;
      ctx.save();
      ctx.translate(soccerBall.x, soccerBall.y);
      ctx.rotate(soccerBall.rotation);
      
      // Draw ball base sphere shadow-shading
      const ballGrad = ctx.createRadialGradient(-4, -4, 2, 0, 0, soccerBall.radius);
      ballGrad.addColorStop(0, '#ffffff');
      ballGrad.addColorStop(0.85, '#e2e8f0');
      ballGrad.addColorStop(1, '#94a3b8');
      ctx.fillStyle = ballGrad;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(0, 0, soccerBall.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Draw Center black pentagon
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * Math.PI * 2 / 5) - Math.PI / 2;
        const px = Math.cos(angle) * (soccerBall.radius * 0.35);
        const py = Math.sin(angle) * (soccerBall.radius * 0.35);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();

      // Draw radiating seam lines and surrounding black pentagon fragments
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.6;
      for (let i = 0; i < 5; i++) {
        const angle = (i * Math.PI * 2 / 5) - Math.PI / 2;
        const rStart = soccerBall.radius * 0.35;
        const rEnd = soccerBall.radius;
        
        // Seam segment line
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * rStart, Math.sin(angle) * rStart);
        ctx.lineTo(Math.cos(angle) * rEnd, Math.sin(angle) * rEnd);
        ctx.stroke();

        // Edge black panel wedge
        const midAngle = angle + (Math.PI / 5);
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.moveTo(Math.cos(midAngle) * (soccerBall.radius * 0.65), Math.sin(midAngle) * (soccerBall.radius * 0.65));
        ctx.lineTo(Math.cos(angle) * rEnd, Math.sin(angle) * rEnd);
        ctx.lineTo(Math.cos(angle + (Math.PI * 2 / 5)) * rEnd, Math.sin(angle + (Math.PI * 2 / 5)) * rEnd);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();

      // 6. DETECT ACTUAL SCORING GOAL EVENTST
      if (scoreCooldownTimer <= 0) {
        // Goal LEFT: Score for P2 (Home of P1 gets breached)
        if (soccerBall.x < leftGoalLine && soccerBall.y > crossbarHeight && soccerBall.y < courtFloor) {
          setScoreP2(s => s + 1);
          triggerAnnouncerSplash("GOAL FOR BLUE/RED OPPONENT!");
          playSynthSound('goal', isMuted);
          triggerGoalCelebrationSpark(leftGoalLine, crossbarHeight + 20);
          scoreCooldownTimer = 100;
          setTimeout(() => { resetSoccerGamePitch('p2'); }, 1400);
        }
        // Goal RIGHT: Score for P1 (breached right frame)
        if (soccerBall.x > rightGoalLine && soccerBall.y > crossbarHeight && soccerBall.y < courtFloor) {
          setScoreP1(s => s + 1);
          triggerAnnouncerSplash("GOAL GOAL GOAL FOR P1!");
          playSynthSound('goal', isMuted);
          playSynthSound('perfect', isMuted);
          triggerGoalCelebrationSpark(rightGoalLine, crossbarHeight + 20);
          scoreCooldownTimer = 100;
          setTimeout(() => { resetSoccerGamePitch('p1'); }, 1400);
        }
      } else {
        scoreCooldownTimer--;
      }

      // Draw confetti particles
      confettiList.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15; // physical weight
        p.life++;
        ctx.fillStyle = p.color;
        ctx.save();
        ctx.globalAlpha = 1.0 - (p.life / p.maxLife);
        ctx.fillRect(p.x, p.y, p.size, p.size);
        ctx.restore();
      });

      // Filter aged sparks
      const keeps = confettiList.filter(p => p.life < p.maxLife);
      confettiList.length = 0;
      confettiList.push(...keeps);

      loopRef.current = requestAnimationFrame(tickAnimation);
    };

    tickAnimation();

    return () => {
      if (loopRef.current) cancelAnimationFrame(loopRef.current);
    };
  }, [gameState, selectedP1, selectedP2, p1Skin, p2Skin, difficulty, tournamentRound, isMuted]);

  // Restart back to Select Nation Menu
  const handleMainMenuReset = () => {
    setTournamentRound(1);
    setScoreP1(0);
    setScoreP2(0);
    setGameState('menu');
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-[#0ea5e9] via-[#0284c7] to-[#0f172a] flex flex-col items-center justify-center p-4 relative overflow-hidden select-none font-sans">
      
      {/* Dynamic Static Tech Matrix Grid overlays */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />

      {/* Modern Header HUD with volume toggle */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
        <button
          onClick={() => {
            const next = !isMuted;
            setIsMuted(next);
            playSynthSound('kick', next);
          }}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-all shadow-md flex items-center justify-center cursor-pointer active:scale-95"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-emerald-500 animate-pulse" /> : <Volume2 className="w-4 h-4 text-sky-400" />}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* GAME MENU SCREEN */}
        {gameState === 'menu' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center gap-6 max-w-xl text-center relative z-20"
          >
            {/* Title branding text with industrial stripes visual */}
            <div className="relative inline-block mb-3">
              <span className="absolute -top-3 left-4 text-[9px] px-1.5 py-0.5 rounded-sm bg-yellow-400 text-slate-950 font-black tracking-widest uppercase">
                Arcade Ragdoll Edition
              </span>
              <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-sky-300 to-indigo-400 uppercase">
                DUMMIES WORLD CUP
              </h1>
              <div className="flex justify-center gap-1.5 mt-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="w-6 h-1.5 bg-yellow-400 skew-x-12" />
                ))}
                <span className="text-[10px] text-slate-400 font-extrabold tracking-[0.2em] uppercase">COLLISION ENGINE v2.5</span>
              </div>
            </div>

            <p className="text-sm text-slate-400 max-w-md uppercase tracking-wide leading-relaxed font-semibold">
              Take charge of floppy, physically jointed crash-test dummies. Swing your mechanical limbs, jump, tumble, and unleash high-velocity electric power shots!
            </p>

            {/* Selection modes Grid */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-sm pt-4">
              <button
                onClick={() => { setGameMode('pve'); setGameState('select'); playSynthSound('whistle', isMuted); }}
                className="group relative flex flex-col items-center gap-2.5 p-4 rounded-2xl bg-gradient-to-b from-[#0b0f19] to-[#020617] border border-slate-800 hover:border-sky-500 transition-all cursor-pointer active:scale-95 shadow-lg shadow-sky-500/5 text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-sky-950/40 flex items-center justify-center border border-sky-900 group-hover:bg-sky-900/30">
                  <Trophy className="w-6 h-6 text-sky-400 group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <div className="text-[11px] font-black tracking-[0.25em] text-sky-200">WORLD CUP</div>
                  <div className="text-[8px] text-slate-500 uppercase tracking-wider font-extrabold mt-0.5">PvE Tournament</div>
                </div>
              </button>

              <button
                onClick={() => { setGameMode('pvp'); setGameState('select'); playSynthSound('whistle', isMuted); }}
                className="group relative flex flex-col items-center gap-2.5 p-4 rounded-2xl bg-gradient-to-b from-[#0b0f19] to-[#01040a] border border-slate-800 hover:border-emerald-500 transition-all cursor-pointer active:scale-95 shadow-lg shadow-emerald-500/5 text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-950/40 flex items-center justify-center border border-emerald-900 group-hover:bg-emerald-900/30">
                  <Swords className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <div className="text-[11px] font-black tracking-[0.25em] text-emerald-200">LOCAL DUO</div>
                  <div className="text-[8px] text-slate-500 uppercase tracking-wider font-extrabold mt-0.5">1v1 Single Keyboard</div>
                </div>
              </button>
            </div>

            {/* Quick stats board banner */}
            <div className="w-full max-w-sm mt-4 p-3 rounded-xl bg-[#0b0f19] border border-slate-800/80 flex items-center justify-between text-left">
              <div className="flex items-center gap-2.5">
                <div className="w-1.5 h-7 bg-yellow-400 rounded-full" />
                <div>
                  <div className="text-[8px] text-zinc-400 uppercase font-black tracking-widest">SAVED CAREER STATUS</div>
                  <div className="text-xs font-black text-slate-100 uppercase tracking-tight">Active Tournament Engine</div>
                </div>
              </div>
              <div className="flex gap-4 text-center">
                <div>
                  <span className="block text-sm font-black text-slate-200">{statsPanel.matches}</span>
                  <span className="text-[7px] text-zinc-500 uppercase font-bold tracking-widest">Played</span>
                </div>
                <div>
                  <span className="block text-sm font-black text-slate-200">{statsPanel.trophies}</span>
                  <span className="text-[7px] text-zinc-500 uppercase font-bold tracking-widest">Cups Won</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* SELECT NATION & STYLE SCREEN */}
        {gameState === 'select' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-6 relative z-20"
          >
            {/* Header select */}
            <div className="col-span-12 flex justify-between items-center bg-[#020617] border border-slate-800 p-4 rounded-2xl mb-2">
              <div>
                <span className="text-[8px] tracking-[0.3em] text-[#a855f7] font-black uppercase block mb-0.5">SQUAD ROOM CUSTOMIZER</span>
                <h2 className="text-xl font-black italic tracking-tight text-white uppercase flex items-center gap-2">
                  <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" /> SELECT YOUR MANNEQUIN NATION
                </h2>
              </div>
              <button
                onClick={() => setGameState('menu')}
                className="px-3.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-[10px] text-slate-400 font-extrabold uppercase tracking-wider transition-all cursor-pointer"
              >
                &larr; BACK
              </button>
            </div>

            {/* List of National Teams - LEFT 7/12 */}
            <div className="md:col-span-7 bg-[#020617]/90 border border-slate-800 p-5 rounded-[2rem] space-y-4">
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5 border-b border-slate-800/80 pb-2">
                <ChevronRight className="w-3.5 h-3.5 text-yellow-400" /> CHOOSE ATHLETE COUNTRY:
              </span>
              <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
                {NATIONS.map(nat => (
                  <button
                    key={nat.id}
                    onClick={() => { setSelectedP1(nat.id); playSynthSound('kick', isMuted); }}
                    className={`p-3 rounded-xl border text-left transition-all relative flex items-center justify-between cursor-pointer ${
                      selectedP1 === nat.id 
                        ? 'bg-gradient-to-r from-sky-950 to-slate-900 border-sky-500 text-sky-200 ring-1 ring-sky-500' 
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{nat.flag}</span>
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-wider">{nat.name}</div>
                        <div className="text-[7px] text-slate-500 uppercase font-black font-mono">Specialized</div>
                      </div>
                    </div>
                    {selectedP1 === nat.id && (
                      <div className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                    )}
                  </button>
                ))}
              </div>

              {/* Skins selectors */}
              <div className="space-y-2 border-t border-slate-800/80 pt-4">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-400" /> CONFIGURE PHYSICAL SKIN ALLOY:
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {SKINS.map(sk => (
                    <button
                      key={sk.id}
                      onClick={() => { setP1Skin(sk.id); playSynthSound('kick', isMuted); }}
                      className={`text-center py-2.5 rounded-xl border text-[9px] font-black uppercase transition-all flex flex-col items-center gap-1 cursor-pointer ${
                        p1Skin === sk.id 
                          ? 'bg-gradient-to-b from-indigo-950 to-indigo-900 border-indigo-500 text-indigo-200' 
                          : 'bg-slate-900/50 hover:bg-slate-800 border-slate-800 text-slate-500'
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded-full bg-gradient-to-b ${sk.styleClass}`} style={{ boxShadow: `0 0 8px ${sk.glow}` }} />
                      <span>{sk.name.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* SELECTED TEAM DETAIL SHEET - RIGHT 5/12 */}
            <div className="md:col-span-5 flex flex-col justify-between gap-4">
              {/* Stat Card Display */}
              {(() => {
                const team = NATIONS.find(t => t.id === selectedP1) || NATIONS[0];
                const skin = SKINS.find(s => s.id === p1Skin) || SKINS[0];
                return (
                  <div className="p-5 rounded-[2rem] bg-gradient-to-b from-[#0b0f19] to-[#020617] border border-slate-800/80 flex-1 flex flex-col justify-between relative overflow-hidden">
                    <div className="space-y-4">
                      {/* Flag display header */}
                      <div className="flex items-center gap-3">
                        <span className="text-4xl px-2 py-1 bg-slate-900 border border-slate-800 rounded-xl">{team.flag}</span>
                        <div>
                          <div className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-widest">{skin.name} ALLOY</div>
                          <h3 className="text-xl font-black uppercase italic tracking-tight text-white mb-0.5">{team.name}</h3>
                        </div>
                      </div>

                      {/* Stat meters slider stack */}
                      <div className="space-y-2 pt-2 border-t border-slate-800/40">
                        {/* Speed */}
                        <div>
                          <div className="flex justify-between text-[8px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                            <span>SKELETAL RUN RATE</span>
                            <span>{team.stats.speed}/10</span>
                          </div>
                          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800 flex">
                            <div className="h-full bg-sky-500 rounded-full" style={{ width: `${team.stats.speed * 10}%` }} />
                          </div>
                        </div>
                        {/* Jump */}
                        <div>
                          <div className="flex justify-between text-[8px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                            <span>JOINT ELEVATION JUMP</span>
                            <span>{team.stats.jump}/10</span>
                          </div>
                          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${team.stats.jump * 10}%` }} />
                          </div>
                        </div>
                        {/* Kick */}
                        <div>
                          <div className="flex justify-between text-[8px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                            <span>KINETIC IMPACT STRENGTH</span>
                            <span>{team.stats.kick}/10</span>
                          </div>
                          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                            <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${team.stats.kick * 10}%` }} />
                          </div>
                        </div>
                      </div>

                      {/* Special Power Info */}
                      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 relative">
                        <span className="absolute -top-2 left-3 bg-[#eab308] text-slate-950 font-black tracking-widest text-[7px] px-1 py-0.5 rounded uppercase flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" /> SUPER DISCHARGE ACTIVE
                        </span>
                        <div className="text-[10px] text-white font-black uppercase mt-1 tracking-wider">{team.specialName}</div>
                        <p className="text-[8px] text-slate-400 font-semibold uppercase mt-1 tracking-wider leading-relaxed">
                          {team.specialDesc}
                        </p>
                      </div>
                    </div>

                    {/* NPC settings if PvE mode */}
                    {gameMode === 'pve' ? (
                      <div className="pt-4 border-t border-slate-800/40">
                        <div className="flex items-center justify-between bg-slate-950 p-2 border border-slate-800 rounded-xl">
                          <span className="text-[8px] text-slate-400 font-black uppercase tracking-wider ml-1">ROBOT DIFFICULTY:</span>
                          <div className="flex gap-1">
                            {(['easy', 'medium', 'hard'] as const).map(diff => (
                              <button
                                key={diff}
                                onClick={() => { setDifficulty(diff); playSynthSound('bounce', isMuted); }}
                                className={`px-2.5 py-1 text-[8px] font-black uppercase rounded-lg border transition-all cursor-pointer ${
                                  difficulty === diff 
                                    ? 'bg-sky-500 border-sky-400 text-white' 
                                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                                }`}
                              >
                                {diff}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* PVP Opposition Nation Selector in Selection Card */
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                        <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-widest">PLAYER 2 OPPONENT:</span>
                        <select
                          value={selectedP2}
                          onChange={(e) => { setSelectedP2(e.target.value); playSynthSound('kick', isMuted); }}
                          className="bg-slate-900 border border-slate-800 text-[9px] font-extrabold uppercase tracking-wide text-indigo-300 rounded px-2 py-1 max-w-[130px]"
                        >
                          {NATIONS.map(n => (
                            <option key={n.id} value={n.id}>{n.flag} {n.name}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Launch Action Pin */}
                    <button
                      onClick={() => {
                        if (gameMode === 'pve') {
                          setTournamentRound(1);
                          setGameState('bracket');
                        } else {
                          kickOffMatch();
                        }
                      }}
                      className="w-full py-4 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 tracking-[0.2em] font-black rounded-xl text-xs uppercase cursor-pointer text-center outline-none border-none mt-4 transition-all hover:shadow shadow-yellow-500/20 active:scale-95"
                    >
                      {gameMode === 'pve' ? 'ENTER BRACKET &rarr;' : 'START 1V1 MATCH! &rarr;'}
                    </button>
                  </div>
                );
              })()}
            </div>
          </motion.div>
        )}

        {/* TOURNAMENT BRACKET PLAYOFF VIEW */}
        {gameState === 'bracket' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-xl p-6 rounded-[2.5rem] bg-[#020617] border border-slate-800 shadow-2xl relative z-20 text-center space-y-6"
          >
            {/* Header Stage */}
            <div className="relative">
              <span className="text-[10px] text-sky-400 tracking-[0.25em] font-extrabold uppercase">
                {tournamentRound === 1 ? 'QUARTER-FINALS STAGE' : tournamentRound === 2 ? 'SEMI-FINALS PLAYOFF' : 'WORLD CUP FINALS SHOWDOWN'}
              </span>
              <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase mt-0.5">
                TOURNAMENT BRACKET
              </h2>
            </div>

            {/* Bracket Graphic representation */}
            <div className="space-y-4 pt-1">
              {/* Row 1 / 4 finals */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{NATIONS.find(t => t.id === selectedP1)?.flag}</span>
                  <span className="text-[10px] font-black uppercase text-slate-200">{selectedP1.toUpperCase()}</span>
                </div>
                <div className="text-[9px] font-extrabold text-indigo-400 uppercase tracking-widest bg-slate-950 px-2 py-0.5 rounded">
                  {tournamentRound > 1 ? 'Passed' : 'YOUR SQUAD'}
                </div>
                <div className="flex items-center gap-2 text-right">
                  <span className="text-[10px] font-black uppercase text-slate-400">{getOpponentForRound(1).name}</span>
                  <span className="text-xl">{getOpponentForRound(1).flag}</span>
                </div>
              </div>

              {/* Row 2 / Semi playoff */}
              <div className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                tournamentRound >= 2 ? 'bg-slate-900 border-slate-700' : 'bg-slate-950/45 border-slate-900/90 filter grayscale'
              }`}>
                <div className="flex items-center gap-2">
                  <span className="text-xl">🏆</span>
                  <span className="text-[10px] font-black uppercase text-slate-200">WINNER 1</span>
                </div>
                <div className="text-[8px] font-black uppercase px-2 py-0.5 rounded bg-amber-400 text-slate-950">
                  {tournamentRound > 2 ? 'Passed' : 'SEMI FINAL'}
                </div>
                <div className="flex items-center gap-2 text-right">
                  <span className="text-[10px] font-black uppercase text-slate-400">{getOpponentForRound(2).name}</span>
                  <span className="text-xl">{getOpponentForRound(2).flag}</span>
                </div>
              </div>

              {/* Row 3 / Grand Finale showdown */}
              <div className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                tournamentRound === 3 ? 'bg-indigo-950/40 border-indigo-500' : 'bg-slate-950/10 border-slate-900/40 filter opacity-50'
              }`}>
                <div className="flex items-center gap-2">
                  <span className="text-xl">🏆</span>
                  <span className="text-[10px] font-black uppercase text-slate-200">SEMI WINNER</span>
                </div>
                <div className="text-[8px] font-black tracking-[0.2em] uppercase text-[#a855f7]">
                  GRAND FINALE
                </div>
                <div className="flex items-center gap-2 text-right">
                  <span className="text-[10px] font-black uppercase text-slate-400">{getOpponentForRound(3).name}</span>
                  <span className="text-xl">{getOpponentForRound(3).flag}</span>
                </div>
              </div>
            </div>

            {/* Launch Active Match of round button */}
            <div className="pt-4 grid grid-cols-2 gap-4">
              <button
                onClick={handleMainMenuReset}
                className="py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:text-white rounded-xl text-[10px] font-extrabold uppercase tracking-widest text-slate-400 cursor-pointer text-center transition-all"
              >
                &larr; ABANDON RUN
              </button>
              <button
                onClick={kickOffMatch}
                className="py-3 bg-gradient-to-r from-sky-400 to-indigo-600 hover:from-sky-300 hover:to-indigo-500 text-white rounded-xl text-[10px] font-black tracking-widest uppercase cursor-pointer text-center transition-all shadow-md hover:shadow-sky-500/20 active:scale-95"
              >
                KICKOFF ARENA MATCH &rarr;
              </button>
            </div>
          </motion.div>
        )}

        {/* ACTIVE GAMEPLAY SCREEN CANVAS */}
        {gameState === 'playing' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex flex-col items-center bg-[#020617] p-4 rounded-[2.5rem] border border-slate-800/80 shadow-2xl overflow-hidden w-full max-w-4xl max-h-[92vh] relative z-20"
          >
            {/* TOP SUPERIOR HUD SCOREBOARD */}
            <div className="w-full flex justify-between items-center bg-[#0b0f19] border border-slate-800 px-6 py-2.5 rounded-2xl mb-4 text-white">
              {/* P1 Section */}
              <div className="flex items-center gap-3">
                <span className="text-2xl">{NATIONS.find(t => t.id === selectedP1)?.flag}</span>
                <div>
                  <div className="text-[9px] text-[#22c55e] font-black uppercase tracking-wider">HOME (P1)</div>
                  <div className="text-sm font-black uppercase tracking-tight italic text-slate-100">
                    {NATIONS.find(t => t.id === selectedP1)?.name}
                  </div>
                </div>
              </div>

              {/* Dynamic timer display and scoring */}
              <div className="flex items-center gap-6">
                <div className="text-2xl md:text-3xl font-black text-white italic bg-[#020617] px-4 py-1.5 rounded-xl border border-slate-800/80 tabular-nums">
                  {scoreP1} <span className="text-slate-600 font-normal">:</span> {scoreP2}
                </div>
                
                {/* Timer Countdown circle */}
                <div className="flex flex-col items-center text-center">
                  <span className="text-[8px] text-indigo-400 font-extrabold uppercase tracking-widest">TIMECORE</span>
                  <span className="text-sm font-black font-mono text-emerald-400 bg-slate-950/90 px-2 py-0.5 rounded border border-slate-900 mt-0.5 tabular-nums">
                    {matchTimer}S
                  </span>
                </div>
              </div>

              {/* P2/NPC Details */}
              <div className="flex items-center gap-3 text-right">
                <div>
                  <div className="text-[9px] text-sky-400 font-black uppercase tracking-wider">
                    {gameMode === 'pve' ? `ROBOT [${difficulty.toUpperCase()}]` : 'AWAY (P2)'}
                  </div>
                  <div className="text-sm font-black uppercase tracking-tight italic text-slate-100">
                    {gameMode === 'pve' 
                      ? getOpponentForRound(tournamentRound).name 
                      : NATIONS.find(t => t.id === selectedP2)?.name
                    }
                  </div>
                </div>
                <span className="text-2xl">
                  {gameMode === 'pve' 
                    ? getOpponentForRound(tournamentRound).flag 
                    : NATIONS.find(t => t.id === selectedP2)?.flag
                  }
                </span>
              </div>
            </div>

            {/* THE CORE GAMEPLAY WINDOW */}
            <div className="w-full h-full relative xl:max-h-[500px] flex items-center justify-center border border-slate-800/80 rounded-2xl overflow-hidden shadow-inner">
              <canvas ref={canvasRef} className="w-full h-full bg-[#090514] aspect-video max-h-[500px]" />

              {/* SUPER ULTIMATE ABILITY CHARGE BANNER */}
              <div className="absolute bottom-4 left-6 bg-slate-950/90 border border-slate-800 p-2.5 rounded-xl flex items-center gap-3 max-w-sm">
                <div className="text-[8px] text-slate-400 font-black tracking-widest uppercase rotate-180 [writing-mode:vertical-lr]">P1 POWER</div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[7px] text-indigo-300 font-black tracking-wider uppercase">
                    <span>CORE RECHARGE</span>
                    <span>Q / Shift EXPLO-SHOT</span>
                  </div>
                  <div className="w-24 h-2.5 bg-slate-900 border border-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 transition-all duration-300 duration-150" style={{ width: '100%' }} />
                  </div>
                </div>
              </div>

              {/* Standard active action alert overlay popup */}
              <AnimatePresence>
                {splashActive && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.82, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.82, y: 20 }}
                    className="absolute inset-0 bg-[#020617]/40 backdrop-blur-[1.5px] pointer-events-none flex items-center justify-center"
                  >
                    <div className="bg-yellow-400 border border-slate-950 text-slate-950 px-8 py-3 rounded-xl italic font-black text-sm md:text-xl uppercase tracking-wider relative shadow-2xl skew-x-12">
                      <div className="skew-x-[-12px] flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-slate-950 fill-slate-950" /> {splashText}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick in-game controller reference label */}
            <div className="w-full mt-3 flex justify-between items-center text-slate-500 font-semibold uppercase text-[8px] tracking-widest px-2">
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-slate-300 text-[9px]">A / D</span>
                <span>RUN</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-slate-300 text-[9px] ml-2">W</span>
                <span>FLOP JUMP</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-slate-300 text-[9px] ml-2">S / SPACE</span>
                <span>SWING KICK</span>
              </div>
              {gameMode === 'pvp' && (
                <div className="flex items-center gap-1.5 text-right">
                  <span>PLAYER 2:</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-slate-300 text-[9px]">J / L</span>
                  <span>MOVE</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-slate-300 text-[9px]">I</span>
                  <span>UP</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-slate-300 text-[9px]">K / ENTER</span>
                  <span>KICK</span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* STANDARD GAMEOVER BANNER SCREEN */}
        {gameState === 'gameover' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md p-6 rounded-[2.5rem] bg-[#020617] border border-slate-800 shadow-2xl relative z-20 text-center space-y-6"
          >
            <div>
              <span className="text-[9px] text-[#f43f5e] font-black tracking-[0.2em] uppercase block">MATCH TIMECORE EXPIRED</span>
              <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase mt-1">
                {scoreP1 > scoreP2 ? '🏆 YOU VICTORY!' : '💔 BETTER LUCK NEXT MATCH'}
              </h2>
            </div>

            <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 flex items-center justify-center gap-8 text-white">
              <div className="text-center">
                <span className="text-[9px] text-slate-500 uppercase font-black block mb-0.5">YOUR SQUAD</span>
                <span className="text-2xl font-black font-mono text-slate-300">{scoreP1}</span>
              </div>
              <span className="text-slate-600 font-extrabold font-mono text-xl">:</span>
              <div className="text-center">
                <span className="text-[9px] text-slate-500 uppercase font-black block mb-0.5">OPPONENTS</span>
                <span className="text-2xl font-black font-mono text-slate-300">{scoreP2}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleMainMenuReset}
                className="py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-[10px] font-extrabold uppercase tracking-widest cursor-pointer text-center transition-all"
              >
                &larr; MAIN MENU
              </button>
              <button
                onClick={kickOffMatch}
                className="py-3 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-black tracking-widest uppercase cursor-pointer text-center transition-all shadow-md active:scale-95"
              >
                REPLAY MATCH &rarr;
              </button>
            </div>
          </motion.div>
        )}

        {/* WORLD CUP TROPHY CELEBRATION SCREEN */}
        {gameState === 'victory' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md p-6 rounded-[2.5rem] bg-[#020617] border border-slate-800 shadow-2xl relative z-20 text-center space-y-6 flex flex-col items-center"
          >
            {/* Spinning trophy symbol */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-yellow-400/10 flex items-center justify-center animate-pulse border border-yellow-400/20">
                <Trophy className="w-10 h-10 text-yellow-400 animate-bounce" />
              </div>
              <Sparkles className="w-5 h-5 text-indigo-400 absolute top-0 -right-2 animate-pulse" />
            </div>

            <div>
              <span className="text-[9px] text-[#22c55e] font-black tracking-[0.25em] uppercase block">WORLD CLASS FINALE CHAMPION</span>
              <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase mt-1">
                LIFT THE GOLDEN CUP!
              </h2>
              <p className="text-[10px] text-slate-400 font-extrabold uppercase mt-2 select-none">
                Congratulations! Your floppy physical crash dummy squad has outperformed top nations to secure title glory.
              </p>
            </div>

            {/* Reset button */}
            <button
              onClick={handleMainMenuReset}
              className="w-full py-4 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 tracking-[0.2em] font-black rounded-xl text-xs uppercase cursor-pointer text-center transition-all shadow active:scale-95"
            >
              FINISH & GO TO SQUAD MENU
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
