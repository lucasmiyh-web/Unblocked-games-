import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  RotateCcw, 
  Settings, 
  Volume2, 
  VolumeX, 
  Trophy, 
  Music, 
  Flame, 
  Maximize2, 
  Wrench, 
  Trash2, 
  Coins, 
  Award, 
  Bookmark, 
  Sparkles, 
  Info,
  ChevronLeft,
  ChevronRight,
  Palette,
  Heart,
  Plus,
  Save,
  CheckCircle2
} from 'lucide-react';

// ==========================================
// TYPE DEFINITIONS
// ==========================================
interface Point {
  x: number;
  y: number;
}

type ElementType = 'block' | 'spike' | 'pad' | 'ring' | 'ship_portal' | 'cube_portal' | 'ball_portal' | 'coin';

interface LevelElement {
  x: number; // grid x position
  y: number; // grid y position (0 = floor)
  type: ElementType;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  decay: number;
  rot: number;
}

interface Checkpoint {
  worldX: number;
  y: number;
  vy: number;
  angle: number;
  vehicle: 'cube' | 'ship' | 'ball';
  gravity: number;
  percentage: number;
}

interface Achievement {
  id: string;
  name: string;
  desc: string;
  unlocked: boolean;
  reqValue: number;
  reqType: string;
}

// ==========================================
// LEVEL DESIGN & ASSETS
// ==========================================
const GRID_SIZE = 40;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;
const LEVEL_END_PERCENTAGE = 100;

// Hardcoded Level Blueprints (stored as Grid X, Y positions)
const LEVEL_1_MADNESS: LevelElement[] = [
  // Intro jumps
  { x: 10, y: 0, type: 'spike' },
  { x: 16, y: 0, type: 'spike' },
  { x: 22, y: 0, type: 'block' },
  { x: 23, y: 1, type: 'spike' },
  { x: 28, y: 0, type: 'spike' },
  { x: 29, y: 0, type: 'spike' }, // double spike
  
  // Staircase climbing
  { x: 35, y: 0, type: 'block' },
  { x: 36, y: 1, type: 'block' },
  { x: 37, y: 2, type: 'block' },
  { x: 39, y: 0, type: 'spike' },
  { x: 41, y: 0, type: 'block' },
  { x: 42, y: 0, type: 'block' },
  { x: 43, y: 1, type: 'spike' },

  // Coin 1
  { x: 46, y: 3, type: 'coin' },
  { x: 46, y: 2, type: 'block' },
  
  // High platforms
  { x: 50, y: 0, type: 'spike' },
  { x: 53, y: 2, type: 'block' },
  { x: 54, y: 2, type: 'block' },
  { x: 55, y: 2, type: 'block' },
  { x: 58, y: 0, type: 'spike' },
  { x: 61, y: 1, type: 'block' },
  { x: 62, y: 1, type: 'block' },
  { x: 62, y: 2, type: 'spike' },
  
  // Cube portal (just re-enforcing cube)
  { x: 66, y: 2, type: 'cube_portal' },
  { x: 70, y: 0, type: 'spike' },
  { x: 71, y: 0, type: 'spike' },
  { x: 72, y: 0, type: 'spike' }, // Triple spike!
  { x: 78, y: 1, type: 'block' },
  { x: 79, y: 1, type: 'block' },
  { x: 80, y: 2, type: 'block' },
  { x: 82, y: 0, type: 'spike' },
  { x: 88, y: 0, type: 'block' },
  { x: 92, y: 3, type: 'coin' },
  { x: 95, y: 0, type: 'spike' },

  // --- TRANSITION TO SHIP (Better level extensions!) ---
  { x: 100, y: 2, type: 'ship_portal' },
  // Flying through narrow passages
  { x: 106, y: 0, type: 'spike' },
  { x: 109, y: 7, type: 'spike' },
  { x: 112, y: 2, type: 'block' },
  { x: 113, y: 2, type: 'block' },
  { x: 115, y: 5, type: 'block' },
  { x: 116, y: 5, type: 'block' },
  { x: 120, y: 0, type: 'spike' },
  { x: 124, y: 7, type: 'spike' },
  { x: 125, y: 3, type: 'coin' }, // Secret Coin in flight!
  { x: 128, y: 1, type: 'spike' },
  { x: 132, y: 6, type: 'spike' },

  // --- TRANSITION BACK TO CUBE ---
  { x: 138, y: 2, type: 'cube_portal' },
  { x: 142, y: 0, type: 'spike' },
  { x: 146, y: 0, type: 'pad' }, // high jump pad!
  { x: 151, y: 4, type: 'block' },
  { x: 152, y: 4, type: 'block' },
  { x: 153, y: 4, type: 'spike' }, // spike on platform!
  { x: 154, y: 4, type: 'block' },
  { x: 158, y: 0, type: 'spike' },
  { x: 159, y: 0, type: 'spike' }, // double spike
  { x: 164, y: 0, type: 'pad' },
  { x: 168, y: 4, type: 'coin' }, // End Coin!
  { x: 172, y: 0, type: 'spike' },
  { x: 173, y: 0, type: 'spike' },
];

const LEVEL_2_BACK_ON_TRACK: LevelElement[] = [
  // Introducing jump pads!
  { x: 8, y: 0, type: 'pad' },
  { x: 12, y: 2, type: 'block' },
  { x: 13, y: 2, type: 'block' },
  { x: 15, y: 0, type: 'spike' },
  
  { x: 19, y: 0, type: 'pad' },
  { x: 23, y: 3, type: 'block' },
  { x: 24, y: 3, type: 'spike' },
  { x: 25, y: 3, type: 'block' },
  
  { x: 30, y: 0, type: 'spike' },
  { x: 31, y: 0, type: 'spike' },
  
  // Coin high up
  { x: 36, y: 5, type: 'coin' },
  { x: 35, y: 0, type: 'pad' },
  
  // Platforms and spikes
  { x: 42, y: 1, type: 'block' },
  { x: 43, y: 1, type: 'block' },
  { x: 44, y: 2, type: 'block' },
  { x: 45, y: 2, type: 'pad' },
  { x: 49, y: 5, type: 'block' },
  { x: 50, y: 5, type: 'block' },
  { x: 51, y: 5, type: 'spike' },
  { x: 52, y: 5, type: 'block' },

  // --- TRANSITION TO BALL (GRAVITY FLIP) ---
  { x: 57, y: 2, type: 'ball_portal' },
  { x: 62, y: 0, type: 'block' },
  { x: 65, y: 7, type: 'block' },
  { x: 68, y: 0, type: 'spike' },
  { x: 71, y: 7, type: 'spike' },
  { x: 74, y: 3, type: 'coin' }, // Gravity coin!
  { x: 77, y: 0, type: 'block' },
  { x: 80, y: 7, type: 'block' },
  { x: 83, y: 0, type: 'spike' },
  { x: 86, y: 7, type: 'spike' },

  // --- TRANSITION TO SHIP ---
  { x: 92, y: 3, type: 'ship_portal' },
  { x: 98, y: 1, type: 'spike' },
  { x: 101, y: 6, type: 'spike' },
  { x: 104, y: 2, type: 'block' },
  { x: 105, y: 5, type: 'block' },
  { x: 108, y: 0, type: 'spike' },
  { x: 112, y: 7, type: 'spike' },
  { x: 115, y: 3, type: 'coin' }, // Mid-air flying coin
  { x: 119, y: 2, type: 'spike' },
  { x: 122, y: 5, type: 'spike' },

  // --- TRANSITION BACK TO CUBE ---
  { x: 128, y: 2, type: 'cube_portal' },
  { x: 132, y: 0, type: 'pad' },
  { x: 136, y: 3, type: 'block' },
  { x: 137, y: 3, type: 'block' },
  { x: 140, y: 0, type: 'spike' },
  { x: 144, y: 0, type: 'pad' },
  { x: 148, y: 5, type: 'block' },
  { x: 149, y: 5, type: 'pad' }, // Pad on platform!
  { x: 153, y: 7, type: 'block' },
  { x: 157, y: 0, type: 'spike' },
  { x: 158, y: 0, type: 'spike' },
  { x: 162, y: 0, type: 'pad' },
  { x: 166, y: 4, type: 'coin' },
  { x: 170, y: 0, type: 'spike' },
  { x: 171, y: 0, type: 'spike' },
];

const LEVEL_3_POLARGEIST: LevelElement[] = [
  // Introduce jump rings (click in air to bounce!)
  { x: 8, y: 0, type: 'spike' },
  { x: 12, y: 1, type: 'block' },
  { x: 13, y: 2, type: 'ring' }, // mid-air ring
  { x: 17, y: 3, type: 'block' },
  { x: 21, y: 0, type: 'spike' },
  
  // Stairways
  { x: 25, y: 0, type: 'block' },
  { x: 26, y: 1, type: 'block' },
  { x: 27, y: 2, type: 'block' },
  { x: 28, y: 3, type: 'ring' },
  { x: 31, y: 5, type: 'block' },
  { x: 32, y: 5, type: 'block' },
  { x: 34, y: 0, type: 'spike' },
  
  // Ball portal intro! Gravity shifts on click!
  { x: 40, y: 2, type: 'ball_portal' },
  { x: 45, y: 0, type: 'block' }, // land on floor blocks
  { x: 48, y: 7, type: 'block' }, // land on ceiling blocks
  { x: 51, y: 0, type: 'spike' },
  { x: 54, y: 7, type: 'spike' },
  { x: 56, y: 3, type: 'coin' },
  { x: 59, y: 0, type: 'block' },
  { x: 62, y: 7, type: 'block' },
  
  // Shift to Ship portal
  { x: 68, y: 3, type: 'ship_portal' },
  { x: 73, y: 1, type: 'spike' },
  { x: 74, y: 1, type: 'spike' },
  { x: 77, y: 6, type: 'spike' },
  { x: 81, y: 3, type: 'coin' },
  { x: 85, y: 2, type: 'block' },
  
  // Return to Cube run
  { x: 88, y: 2, type: 'cube_portal' },
  { x: 91, y: 0, type: 'spike' },
  { x: 92, y: 0, type: 'spike' },
  { x: 95, y: 0, type: 'pad' },

  // --- NEW POLARGEIST EXTENSIONS ---
  // Mid-air ring chain!
  { x: 101, y: 3, type: 'ring' },
  { x: 105, y: 4, type: 'ring' },
  { x: 109, y: 5, type: 'ring' },
  { x: 113, y: 2, type: 'block' },
  { x: 114, y: 2, type: 'block' },
  { x: 115, y: 2, type: 'spike' }, // spike on platform!
  { x: 116, y: 2, type: 'block' },
  { x: 120, y: 0, type: 'spike' },
  { x: 121, y: 0, type: 'spike' }, // double spike!

  // Ball portal part 2 (Tighter shifting)
  { x: 126, y: 3, type: 'ball_portal' },
  { x: 130, y: 0, type: 'block' },
  { x: 132, y: 7, type: 'block' },
  { x: 134, y: 0, type: 'spike' },
  { x: 136, y: 7, type: 'spike' },
  { x: 138, y: 2, type: 'coin' }, // Ball gravity coin!
  { x: 141, y: 0, type: 'block' },
  { x: 143, y: 7, type: 'block' },

  // Ship Portal Part 2 (Narrow cavern)
  { x: 148, y: 3, type: 'ship_portal' },
  { x: 153, y: 2, type: 'block' },
  { x: 154, y: 2, type: 'block' },
  { x: 154, y: 5, type: 'block' }, // narrow gap!
  { x: 155, y: 5, type: 'block' },
  { x: 159, y: 0, type: 'spike' },
  { x: 161, y: 7, type: 'spike' },
  { x: 164, y: 4, type: 'coin' },

  // Final Cube Speed Run
  { x: 169, y: 2, type: 'cube_portal' },
  { x: 173, y: 0, type: 'pad' },
  { x: 177, y: 3, type: 'ring' },
  { x: 181, y: 0, type: 'spike' },
  { x: 182, y: 0, type: 'spike' },
  { x: 183, y: 0, type: 'spike' }, // Triple spike at the very end!
];

export default function GeometryDash() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Game Play State
  const [activeTab, setActiveTab] = useState<'play' | 'editor' | 'shop' | 'stats'>('play');
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [isPracticeMode, setIsPracticeMode] = useState<boolean>(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(0.6); // 0.6x default slower speed!
  const [showJumpGuides, setShowJumpGuides] = useState<boolean>(true); // Guide arcs over spikes!
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [hasCrashed, setHasCrashed] = useState<boolean>(false);
  const [levelCompleted, setLevelCompleted] = useState<boolean>(false);
  
  // Shop & Skins States
  const [stars, setStars] = useState<number>(0);
  const [orbs, setOrbs] = useState<number>(0);
  const [secretCoins, setSecretCoins] = useState<number>(0);
  const [selectedSkin, setSelectedSkin] = useState<string>('classic');
  const [primaryColor, setPrimaryColor] = useState<string>('#10b981'); // neon emerald
  const [secondaryColor, setSecondaryColor] = useState<string>('#fbbf24'); // neon yellow
  const [glowColor, setGlowColor] = useState<string>('#06b6d4'); // cyber cyan
  const [selectedTrail, setSelectedTrail] = useState<string>('neon'); // neon, sparkle, fire, rainbow

  // Unlocked item storage (backed by localStorage)
  const [unlockedSkins, setUnlockedSkins] = useState<string[]>(['classic', 'happy', 'skull']);
  const [unlockedTrails, setUnlockedTrails] = useState<string[]>(['neon']);

  // Statistics
  const [totalJumps, setTotalJumps] = useState<number>(0);
  const [totalAttempts, setTotalAttempts] = useState<number>(0);
  const [bestProgress, setBestProgress] = useState<{ [key: number]: number }>({ 1: 0, 2: 0, 3: 0, 99: 0 }); // 99 is custom level
  
  // Editor States
  const [editorElements, setEditorElements] = useState<LevelElement[]>([]);
  const [selectedTool, setSelectedTool] = useState<ElementType>('block');
  const [editorScrollX, setEditorScrollX] = useState<number>(0);
  const [editorStartVehicle, setEditorStartVehicle] = useState<'cube' | 'ship' | 'ball'>('cube');
  const [editorSavedMessage, setEditorSavedMessage] = useState<boolean>(false);

  // Audio Ref
  const audioCtxRef = useRef<AudioContext | null>(null);
  const synthIntervalRef = useRef<any>(null);

  // Internal Game Simulation Engine values
  const sim = useRef({
    player: {
      worldX: 100,
      y: 0, // 0 is ground
      vy: 0,
      width: 32,
      height: 32,
      angle: 0,
      isGrounded: true,
      vehicle: 'cube' as 'cube' | 'ship' | 'ball',
      gravity: 0.75, // positive pulled down
      jumpStrength: -11.5,
      flyThrust: -0.85,
      isHoldingJump: false,
      lastJumpPressedTime: 0,
      canGravityShift: true,
      trail: [] as Point[],
    },
    cameraX: 0,
    speed: 6.2, // horizontal speed
    levelWidth: 4000, // level length in pixels
    particles: [] as Particle[],
    checkpoints: [] as Checkpoint[],
    shake: 0,
    beatTick: 0,
    bgPulse: 0,
    activeElements: [] as LevelElement[],
    collectedCoinsThisRun: [] as number[], // indices of collected coins
  });

  // ==========================================
  // LOCAL STORAGE LOAD/SAVE
  // ==========================================
  useEffect(() => {
    // Load Stats & Shop
    const savedStars = localStorage.getItem('gd_stars');
    const savedOrbs = localStorage.getItem('gd_orbs');
    const savedCoins = localStorage.getItem('gd_coins');
    const savedSkin = localStorage.getItem('gd_skin');
    const savedPriCol = localStorage.getItem('gd_pri_col');
    const savedSecCol = localStorage.getItem('gd_sec_col');
    const savedGlowCol = localStorage.getItem('gd_glow_col');
    const savedTrail = localStorage.getItem('gd_trail');
    const savedUnlockedSkins = localStorage.getItem('gd_unlocked_skins');
    const savedUnlockedTrails = localStorage.getItem('gd_unlocked_trails');
    const savedJumps = localStorage.getItem('gd_jumps');
    const savedAttempts = localStorage.getItem('gd_attempts');
    const savedBest = localStorage.getItem('gd_best_progress');
    const savedEditor = localStorage.getItem('gd_custom_level');
    const savedSpeed = localStorage.getItem('gd_speed_mult');

    if (savedStars) setStars(parseInt(savedStars, 10));
    if (savedOrbs) setOrbs(parseInt(savedOrbs, 10));
    if (savedCoins) setSecretCoins(parseInt(savedCoins, 10));
    if (savedSkin) setSelectedSkin(savedSkin);
    if (savedPriCol) setPrimaryColor(savedPriCol);
    if (savedSecCol) setSecondaryColor(savedSecCol);
    if (savedGlowCol) setGlowColor(savedGlowCol);
    if (savedTrail) setSelectedTrail(savedTrail);
    if (savedUnlockedSkins) setUnlockedSkins(JSON.parse(savedUnlockedSkins));
    if (savedUnlockedTrails) setUnlockedTrails(JSON.parse(savedUnlockedTrails));
    if (savedJumps) setTotalJumps(parseInt(savedJumps, 10));
    if (savedAttempts) setTotalAttempts(parseInt(savedAttempts, 10));
    if (savedBest) setBestProgress(JSON.parse(savedBest));
    if (savedEditor) setEditorElements(JSON.parse(savedEditor));
    if (savedSpeed) setSpeedMultiplier(parseFloat(savedSpeed));
  }, []);

  const saveToLocal = (key: string, value: any) => {
    localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
  };

  // ==========================================
  // AUDIO SYNTHESIZER
  // ==========================================
  const startSynthMusic = () => {
    if (isMuted) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Clear old sequencer
      if (synthIntervalRef.current) clearInterval(synthIntervalRef.current);

      let step = 0;
      const bpm = 135;
      const stepDuration = 60 / bpm / 2; // eighth notes

      synthIntervalRef.current = setInterval(() => {
        if (!isPlaying || hasCrashed || levelCompleted) return;
        
        sim.current.beatTick = step;
        sim.current.bgPulse = 1.0; // pulse neon on grid beat

        // Synth Bassline loop
        const bassNotes = [55, 55, 65.4, 65.4, 58.2, 58.2, 73.4, 73.4];
        const currentNote = bassNotes[Math.floor(step / 4) % bassNotes.length];

        // Drum kicks
        if (step % 4 === 0) {
          playKick(ctx);
        } else if (step % 4 === 2) {
          playHihat(ctx);
        }

        // Bass synthesizer pulse
        if (step % 2 === 0) {
          playBass(ctx, currentNote, stepDuration * 0.8);
        }

        // Mid-Melody chord arpeggios
        if (step % 8 >= 4 && Math.random() > 0.4) {
          const arpeggios = [currentNote * 1.5, currentNote * 2, currentNote * 2.5];
          playArp(ctx, arpeggios[step % arpeggios.length], stepDuration * 0.4);
        }

        step = (step + 1) % 16;
      }, stepDuration * 1000);

    } catch (e) {
      console.warn("Web Audio Init failed or blocked by autoplay constraints:", e);
    }
  };

  const stopSynthMusic = () => {
    if (synthIntervalRef.current) {
      clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = null;
    }
  };

  const playKick = (ctx: AudioContext) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    
    gain.gain.setValueAtTime(0.6, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  };

  const playHihat = (ctx: AudioContext) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(10000, ctx.currentTime);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  };

  const playBass = (ctx: AudioContext, freq: number, duration: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  };

  const playArp = (ctx: AudioContext, freq: number, duration: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  };

  const playSoundEffect = (type: 'jump' | 'crash' | 'pad' | 'ring' | 'coin' | 'portal') => {
    if (isMuted) return;
    try {
      const ctx = audioCtxRef.current || new (window.AudioContext || (window as any).webkitAudioContext)();
      if (!audioCtxRef.current) audioCtxRef.current = ctx;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'jump') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'crash') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(40, ctx.currentTime + 0.45);
        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
        osc.start();
        osc.stop(ctx.currentTime + 0.45);
      } else if (type === 'pad') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === 'ring') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1500, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
        osc.start();
        osc.stop(ctx.currentTime + 0.18);
      } else if (type === 'coin') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(987.77, ctx.currentTime); // B5
        osc.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.08); // E6
        gain.gain.setValueAtTime(0.35, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'portal') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(400, ctx.currentTime + 0.35);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch (e) {
      console.warn("Sound effect error:", e);
    }
  };

  // ==========================================
  // LEVEL PARSER & GENERATION
  // ==========================================
  const getLevelElements = (): LevelElement[] => {
    if (selectedLevel === 1) return LEVEL_1_MADNESS;
    if (selectedLevel === 2) return LEVEL_2_BACK_ON_TRACK;
    if (selectedLevel === 3) return LEVEL_3_POLARGEIST;
    return editorElements; // Custom levels
  };

  const getStartingVehicle = (): 'cube' | 'ship' | 'ball' => {
    if (selectedLevel === 99) return editorStartVehicle;
    return 'cube';
  };

  // ==========================================
  // INITIALIZE / RESET RUN
  // ==========================================
  const initGame = (fromCheckpoints = false) => {
    const s = sim.current;

    setHasCrashed(false);
    setLevelCompleted(false);

    // Dynamically scale parameters based on the speed multiplier state
    s.speed = 6.2 * speedMultiplier;
    s.player.jumpStrength = -11.5 * speedMultiplier;
    s.player.flyThrust = -0.85 * speedMultiplier;

    // Filter current elements for performance
    const elements = getLevelElements();
    s.activeElements = elements;

    // Get furthest element to determine level width
    let maxX = 100;
    elements.forEach(el => {
      if (el.x > maxX) maxX = el.x;
    });
    s.levelWidth = (maxX + 15) * GRID_SIZE;

    // Restore from checkpoint if practice mode has checkpoints saved
    if (isPracticeMode && fromCheckpoints && s.checkpoints.length > 0) {
      const latest = s.checkpoints[s.checkpoints.length - 1];
      s.player.worldX = latest.worldX;
      s.player.y = latest.y;
      s.player.vy = latest.vy;
      s.player.angle = latest.angle;
      s.player.vehicle = latest.vehicle;
      if (latest.vehicle === 'cube') {
        s.player.gravity = 0.75 * speedMultiplier * speedMultiplier;
      } else if (latest.vehicle === 'ship') {
        s.player.gravity = 0.45 * speedMultiplier * speedMultiplier;
      } else if (latest.vehicle === 'ball') {
        s.player.gravity = 0.65 * speedMultiplier * speedMultiplier;
      }
      s.player.trail = [];
      setProgressPercent(latest.percentage);
    } else {
      // Full Start over
      s.player.worldX = 100;
      s.player.y = 0;
      s.player.vy = 0;
      s.player.angle = 0;
      const startVehicle = getStartingVehicle();
      s.player.vehicle = startVehicle;
      if (startVehicle === 'cube') {
        s.player.gravity = 0.75 * speedMultiplier * speedMultiplier;
      } else if (startVehicle === 'ship') {
        s.player.gravity = 0.45 * speedMultiplier * speedMultiplier;
      } else if (startVehicle === 'ball') {
        s.player.gravity = 0.65 * speedMultiplier * speedMultiplier;
      }
      s.player.trail = [];
      s.collectedCoinsThisRun = [];
      setProgressPercent(0);
      if (!isPracticeMode) {
        s.checkpoints = [];
      }
    }

    s.cameraX = 0;
    s.player.isHoldingJump = false;
    s.player.canGravityShift = true;
    s.particles = [];

    // Increment attempts count
    if (!fromCheckpoints) {
      const attemptsInc = totalAttempts + 1;
      setTotalAttempts(attemptsInc);
      saveToLocal('gd_attempts', attemptsInc);
    }

    startSynthMusic();
  };

  // ==========================================
  // PARTICLE GENERATOR
  // ==========================================
  const createExplosion = (x: number, y: number, color: string, count = 25) => {
    const s = sim.current;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 8;
      s.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 3 + Math.random() * 4,
        alpha: 1.0,
        decay: 0.02 + Math.random() * 0.03,
        rot: Math.random() * Math.PI
      });
    }
  };

  const createTrailParticles = (x: number, y: number, color: string) => {
    const s = sim.current;
    let size = 3;
    let decay = 0.04;
    let vx = -2 - Math.random() * 2;
    let vy = -0.5 + Math.random() * 1.0;

    if (selectedTrail === 'fire') {
      color = Math.random() > 0.5 ? '#f97316' : '#ef4444';
      vy = -1 - Math.random() * 2;
    } else if (selectedTrail === 'rainbow') {
      const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7'];
      color = colors[Math.floor(Math.random() * colors.length)];
    }

    s.particles.push({
      x,
      y,
      vx,
      vy,
      color,
      size: size + Math.random() * 3,
      alpha: 0.8,
      decay,
      rot: Math.random() * Math.PI
    });
  };

  // ==========================================
  // KEYBOARD CONTROLLER JUMPS
  // ==========================================
  const handleJumpPress = () => {
    const s = sim.current;
    s.player.isHoldingJump = true;
    s.player.lastJumpPressedTime = Date.now();

    if (hasCrashed || levelCompleted) return;

    if (s.player.vehicle === 'cube') {
      if (s.player.isGrounded) {
        s.player.vy = s.player.jumpStrength;
        s.player.isGrounded = false;
        playSoundEffect('jump');
        setTotalJumps(j => {
          const next = j + 1;
          saveToLocal('gd_jumps', next);
          return next;
        });
      }
    } else if (s.player.vehicle === 'ball') {
      if (s.player.canGravityShift) {
        // Toggle gravity
        s.player.gravity = -s.player.gravity;
        s.player.isGrounded = false;
        s.player.canGravityShift = false; // must touch ground to shift again
        playSoundEffect('jump');
        setTotalJumps(j => {
          const next = j + 1;
          saveToLocal('gd_jumps', next);
          return next;
        });
      }
    }
  };

  const handleJumpRelease = () => {
    const s = sim.current;
    s.player.isHoldingJump = false;
  };

  // Keyboard Event Hooks
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeTab !== 'play') return;
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        if (!isPlaying) {
          setIsPlaying(true);
          initGame();
        } else {
          handleJumpPress();
        }
      }
      if (e.code === 'KeyZ') {
        // Practice Checkpoint
        if (isPlaying && isPracticeMode && !hasCrashed) {
          placeCheckpoint();
        }
      }
      if (e.code === 'KeyX') {
        // Remove Checkpoint
        if (isPlaying && isPracticeMode) {
          removeLastCheckpoint();
        }
      }
      if (e.code === 'KeyR') {
        // Force restart
        initGame();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        handleJumpRelease();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPlaying, isPracticeMode, hasCrashed, activeTab, selectedLevel, editorElements, editorStartVehicle]);

  // ==========================================
  // PRACTICE CHECKPOINTS
  // ==========================================
  const placeCheckpoint = () => {
    const s = sim.current;
    s.checkpoints.push({
      worldX: s.player.worldX,
      y: s.player.y,
      vy: s.player.vy,
      angle: s.player.angle,
      vehicle: s.player.vehicle,
      gravity: s.player.gravity,
      percentage: progressPercent
    });
    playSoundEffect('ring');
  };

  const removeLastCheckpoint = () => {
    const s = sim.current;
    if (s.checkpoints.length > 0) {
      s.checkpoints.pop();
      playSoundEffect('jump');
    }
  };

  // ==========================================
  // PHYSICS SIMULATION ENGINE & COLLISION
  // ==========================================
  const handleCollisionAndCrash = () => {
    const s = sim.current;
    s.shake = 15;
    setHasCrashed(true);
    playSoundEffect('crash');
    createExplosion(s.player.worldX - s.cameraX, CANVAS_HEIGHT - 60 - s.player.y, primaryColor, 40);

    // Orbs awarded dynamically for effort percentage
    const earnedOrbs = Math.floor(progressPercent / 10);
    if (earnedOrbs > 0) {
      setOrbs(prev => {
        const next = prev + earnedOrbs;
        saveToLocal('gd_orbs', next);
        return next;
      });
    }

    // Save best progress
    const prevBest = bestProgress[selectedLevel] || 0;
    if (progressPercent > prevBest) {
      setBestProgress(prev => {
        const next = { ...prev, [selectedLevel]: Math.round(progressPercent) };
        saveToLocal('gd_best_progress', next);
        return next;
      });
      // Award Stars for beating high score
      if (progressPercent === 100 && prevBest < 100) {
        const starsAward = selectedLevel === 1 ? 3 : selectedLevel === 2 ? 6 : selectedLevel === 3 ? 10 : 2;
        setStars(s => {
          const next = s + starsAward;
          saveToLocal('gd_stars', next);
          return next;
        });
      }
    }

    // Stop synthesizer pump
    stopSynthMusic();

    // Auto Restart after 1 second if practicing or general loop handles it
    setTimeout(() => {
      if (isPracticeMode && s.checkpoints.length > 0) {
        initGame(true); // respawn from latest checkpoint
      } else {
        initGame(false); // start from beginning
      }
    }, 1000);
  };

  const updateVisuals = () => {
    const s = sim.current;

    // Pulse reduction
    if (s.bgPulse > 0) s.bgPulse -= 0.05;
    if (s.shake > 0) s.shake -= 0.6;

    // Particles simulation
    s.particles = s.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;
      p.rot += 0.02;
      return p.alpha > 0;
    });
  };

  const gameLoop = () => {
    const s = sim.current;

    if (!isPlaying || hasCrashed || levelCompleted) {
      // Just update particles when crashed so screen looks organic
      updateVisuals();
      drawGame();
      return;
    }

    // 1. HORIZONTAL SCROLLING
    s.player.worldX += s.speed;
    s.cameraX = s.player.worldX - 180; // lock camera offset

    // Limit check for completion
    const percent = Math.min(100, (s.player.worldX / s.levelWidth) * 100);
    setProgressPercent(percent);

    if (percent >= LEVEL_END_PERCENTAGE) {
      // WIN LEVEL!
      setLevelCompleted(true);
      playSoundEffect('coin');
      createExplosion(s.player.worldX - s.cameraX, CANVAS_HEIGHT - 60 - s.player.y, '#f59e0b', 80);
      stopSynthMusic();

      const prevBest = bestProgress[selectedLevel] || 0;
      if (prevBest < 100) {
        const starsAward = selectedLevel === 1 ? 5 : selectedLevel === 2 ? 8 : selectedLevel === 3 ? 12 : 3;
        setStars(s => {
          const next = s + starsAward;
          saveToLocal('gd_stars', next);
          return next;
        });
      }

      setBestProgress(prev => {
        const next = { ...prev, [selectedLevel]: 100 };
        saveToLocal('gd_best_progress', next);
        return next;
      });

      // Award coin count persistent
      if (s.collectedCoinsThisRun.length > 0) {
        setSecretCoins(c => {
          const next = c + s.collectedCoinsThisRun.length;
          saveToLocal('gd_coins', next);
          return next;
        });
      }

      return;
    }

    // 2. VERTICAL VEHICLE DYNAMICS
    const playerFloorLimit = 0;
    const playerCeilingLimit = 280;

    if (s.player.vehicle === 'cube') {
      // Apply regular gravity down (scaled quadratically!)
      s.player.vy += 0.62 * speedMultiplier * speedMultiplier; // Gravity
      s.player.y -= s.player.vy; // Subtract vy since positive is up in physics coordinate system

      // Floor constraints
      if (s.player.y <= playerFloorLimit) {
        s.player.y = playerFloorLimit;
        s.player.vy = 0;
        s.player.isGrounded = true;

        // Auto jump buffer if holding Space
        if (s.player.isHoldingJump) {
          s.player.vy = s.player.jumpStrength;
          s.player.isGrounded = false;
          playSoundEffect('jump');
        }

        // Snap rotation angle to 90 degrees
        const currentAngleDeg = (s.player.angle * 180) / Math.PI;
        const snappedDeg = Math.round(currentAngleDeg / 90) * 90;
        s.player.angle = (snappedDeg * Math.PI) / 180;
      } else {
        // Rotate while in mid-air (scaled linearly)
        s.player.isGrounded = false;
        s.player.angle += 0.09 * speedMultiplier;
      }

    } else if (s.player.vehicle === 'ship') {
      // Rocket thrusting
      if (s.player.isHoldingJump) {
        s.player.vy += s.player.flyThrust; // lift up
      } else {
        s.player.vy += 0.42 * speedMultiplier * speedMultiplier; // drop down (scaled quadratically!)
      }

      // Cap rocket speeds (scaled linearly!)
      s.player.vy = Math.max(-6 * speedMultiplier, Math.min(6 * speedMultiplier, s.player.vy));
      s.player.y -= s.player.vy;

      // Restrain bounds
      if (s.player.y <= playerFloorLimit) {
        s.player.y = playerFloorLimit;
        s.player.vy = 0;
      }
      if (s.player.y >= playerCeilingLimit) {
        s.player.y = playerCeilingLimit;
        s.player.vy = 0;
      }

      // Rotate according to rocket velocity
      s.player.angle = -s.player.vy * (0.08 / speedMultiplier);

    } else if (s.player.vehicle === 'ball') {
      // Flip mode mechanics
      const activeGravity = s.player.gravity; // can be positive or negative
      s.player.vy += activeGravity;
      s.player.y -= s.player.vy;

      // Ball handles both top ceiling AND bottom floor collisions
      if (s.player.y <= playerFloorLimit) {
        s.player.y = playerFloorLimit;
        s.player.vy = 0;
        s.player.isGrounded = true;
        s.player.canGravityShift = true;
        // Roll continuous rotation (scaled linearly)
        s.player.angle += 0.12 * speedMultiplier;
      } else if (s.player.y >= playerCeilingLimit) {
        s.player.y = playerCeilingLimit;
        s.player.vy = 0;
        s.player.isGrounded = true;
        s.player.canGravityShift = true;
        s.player.angle += 0.12 * speedMultiplier;
      } else {
        s.player.isGrounded = false;
        s.player.angle += 0.08 * speedMultiplier;
      }
    }

    // 3. COLLISION BOX CALCULATION
    const px = s.player.worldX;
    const py = CANVAS_HEIGHT - 60 - s.player.y - s.player.height; // Canvas Y coordinates
    const pWidth = s.player.width;
    const pHeight = s.player.height;

    // Spawn trail particles
    if (Math.random() > 0.15) {
      createTrailParticles(px - s.cameraX + 8, py + pHeight - 4, primaryColor);
    }

    // 4. GRID ELEMENTS INTERSECTION LOOP
    let onPlatformBlock = false;

    // We only process blocks nearby for fast efficiency
    s.activeElements.forEach((el, index) => {
      const elX = el.x * GRID_SIZE;
      const elY = CANVAS_HEIGHT - 60 - el.y * GRID_SIZE - GRID_SIZE; // Canvas coordinate system

      // Simple bounding boxes check
      const intersects = (
        px + pWidth > elX &&
        px < elX + GRID_SIZE &&
        py + pHeight > elY &&
        py < elY + GRID_SIZE
      );

      if (!intersects) return;

      if (el.type === 'block') {
        // Is it landing on top? Or hitting the front side (crash)?
        // Calculate overlap depths
        const overlapX = Math.min(px + pWidth - elX, elX + GRID_SIZE - px);
        const overlapY = Math.min(py + pHeight - elY, elY + GRID_SIZE - py);

        // Highly forgiving landing: if player bottom is within 12px of block top and falling/flat,
        // force top-landing collision to prevent annoying side corner clip deaths!
        const isLandingOnTop = (py + pHeight - elY <= 12) && (s.player.vy >= -1);

        if (overlapX > overlapY || isLandingOnTop) {
          // Top or Bottom landing block collision
          if (py + pHeight / 2 < elY + GRID_SIZE / 2 || isLandingOnTop) {
            // Standing on top of the block
            s.player.y = CANVAS_HEIGHT - 60 - elY - s.player.height;
            s.player.vy = 0;
            s.player.isGrounded = true;
            onPlatformBlock = true;

            if (s.player.vehicle === 'cube' && s.player.isHoldingJump) {
              s.player.vy = s.player.jumpStrength;
              s.player.isGrounded = false;
              playSoundEffect('jump');
            }
            if (s.player.vehicle === 'ball') {
              s.player.canGravityShift = true;
            }
          } else {
            // Hitting under the block (Ceiling collision)
            s.player.y = CANVAS_HEIGHT - 60 - elY - GRID_SIZE;
            s.player.vy = 0;
          }
        } else {
          // Hit side of block = CRASH DEATH
          handleCollisionAndCrash();
        }

      } else if (el.type === 'spike') {
        // Spike collision is strict: slightly smaller triangle frame
        // Making it slightly more forgiving (11px padding) so casual play feels highly satisfying!
        const spikePadding = 11;
        const spikeIntersects = (
          px + pWidth - spikePadding > elX &&
          px + spikePadding < elX + GRID_SIZE &&
          py + pHeight > elY + spikePadding &&
          py < elY + GRID_SIZE
        );

        if (spikeIntersects) {
          handleCollisionAndCrash();
        }

      } else if (el.type === 'pad') {
        // Bounce Pad
        s.player.vy = s.player.jumpStrength * 1.45; // Super high leap!
        s.player.isGrounded = false;
        playSoundEffect('pad');
        createExplosion(elX - s.cameraX + GRID_SIZE/2, elY + GRID_SIZE/2, '#eab308', 8);

      } else if (el.type === 'ring') {
        // Jump Ring / Orb: Click in air to mid-air jump
        if (s.player.isHoldingJump && Date.now() - s.player.lastJumpPressedTime < 150) {
          s.player.vy = s.player.jumpStrength * 0.95;
          s.player.isGrounded = false;
          s.player.isHoldingJump = false; // consume press
          playSoundEffect('ring');
          createExplosion(elX - s.cameraX + GRID_SIZE/2, elY + GRID_SIZE/2, '#3b82f6', 12);
        }

      } else if (el.type === 'ship_portal') {
        if (s.player.vehicle !== 'ship') {
          s.player.vehicle = 'ship';
          s.player.gravity = 0.45 * speedMultiplier * speedMultiplier; // scaled!
          playSoundEffect('portal');
          createExplosion(elX - s.cameraX + GRID_SIZE/2, elY + GRID_SIZE/2, '#a855f7', 15);
        }

      } else if (el.type === 'cube_portal') {
        if (s.player.vehicle !== 'cube') {
          s.player.vehicle = 'cube';
          s.player.gravity = 0.75 * speedMultiplier * speedMultiplier; // scaled!
          playSoundEffect('portal');
          createExplosion(elX - s.cameraX + GRID_SIZE/2, elY + GRID_SIZE/2, '#06b6d4', 15);
        }

      } else if (el.type === 'ball_portal') {
        if (s.player.vehicle !== 'ball') {
          s.player.vehicle = 'ball';
          s.player.gravity = 0.65 * speedMultiplier * speedMultiplier; // scaled!
          playSoundEffect('portal');
          createExplosion(elX - s.cameraX + GRID_SIZE/2, elY + GRID_SIZE/2, '#f59e0b', 15);
        }

      } else if (el.type === 'coin') {
        if (!s.collectedCoinsThisRun.includes(index)) {
          s.collectedCoinsThisRun.push(index);
          playSoundEffect('coin');
          createExplosion(elX - s.cameraX + GRID_SIZE/2, elY + GRID_SIZE/2, '#fbbf24', 16);
        }
      }
    });

    if (onPlatformBlock) {
      s.player.isGrounded = true;
    }

    // Background scrolling visuals & general loop
    updateVisuals();
    drawGame();
  };

  // Run core loop continuously with strict 60 FPS target cap to fix high-refresh-rate monitor speeds
  useEffect(() => {
    let frameId: number;
    let lastTime = performance.now();
    const fpsInterval = 1000 / 60; // strictly 60 frames per second

    const loop = (timestamp: number) => {
      frameId = requestAnimationFrame(loop);
      const elapsed = timestamp - lastTime;
      
      if (elapsed >= fpsInterval) {
        // Adjust lastTime and run a physics / logic step
        lastTime = timestamp - (elapsed % fpsInterval);
        gameLoop();
      }
    };
    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying, selectedLevel, hasCrashed, levelCompleted, isPracticeMode, isMuted, primaryColor, secondaryColor, glowColor, selectedSkin, selectedTrail, speedMultiplier]);

  // ==========================================
  // CANVAS RENDERING GRAPHICS
  // ==========================================
  const drawGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const s = sim.current;
    const playerX = s.player.worldX - s.cameraX;
    const playerY = CANVAS_HEIGHT - 60 - s.player.y - s.player.height;

    ctx.save();

    // 1. Screen Shake translation matrix
    if (s.shake > 0) {
      const dx = (Math.random() - 0.5) * s.shake;
      const dy = (Math.random() - 0.5) * s.shake;
      ctx.translate(dx, dy);
    }

    // 2. BACKGROUND GRADIENT & GRID
    const pulseStrength = s.bgPulse * 0.15;
    const baseGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    
    // Choose gradient based on selected level
    if (selectedLevel === 1) {
      baseGradient.addColorStop(0, `rgba(15, 12, 30, 1)`); // Cyber Indigo
      baseGradient.addColorStop(1, `rgba(3, 2, 8, 1)`);
    } else if (selectedLevel === 2) {
      baseGradient.addColorStop(0, `rgba(28, 5, 15, 1)`); // Crimson Wine
      baseGradient.addColorStop(1, `rgba(4, 1, 3, 1)`);
    } else if (selectedLevel === 3) {
      baseGradient.addColorStop(0, `rgba(5, 25, 25, 1)`); // Ocean Blue-green
      baseGradient.addColorStop(1, `rgba(1, 4, 6, 1)`);
    } else {
      baseGradient.addColorStop(0, `rgba(18, 10, 36, 1)`); // Custom
      baseGradient.addColorStop(1, `rgba(5, 2, 10, 1)`);
    }
    
    ctx.fillStyle = baseGradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Glow background pulse beat
    ctx.fillStyle = `rgba(139, 92, 246, ${pulseStrength})`;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Neon Parallax Mountains/Triangles in the background
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    const bgOffset = -(s.cameraX * 0.2) % 400;
    for (let i = -1; i < 4; i++) {
      const bx = i * 400 + bgOffset;
      ctx.moveTo(bx, CANVAS_HEIGHT - 60);
      ctx.lineTo(bx + 200, 150);
      ctx.lineTo(bx + 400, CANVAS_HEIGHT - 60);
    }
    ctx.stroke();

    // Horizontal & Vertical background alignment grid
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.04 + pulseStrength * 0.25})`;
    ctx.lineWidth = 1;
    const gridOffset = -s.cameraX % GRID_SIZE;
    ctx.beginPath();
    for (let x = gridOffset; x < CANVAS_WIDTH; x += GRID_SIZE) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT - 60);
    }
    for (let y = 0; y < CANVAS_HEIGHT - 60; y += GRID_SIZE) {
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
    }
    ctx.stroke();

    // 3. DRAW LEVEL ASSETS & PORTALS
    s.activeElements.forEach((el, index) => {
      const elX = el.x * GRID_SIZE - s.cameraX;
      const elY = CANVAS_HEIGHT - 60 - el.y * GRID_SIZE - GRID_SIZE;

      // Cull drawing of objects out of visible screen for performance
      if (elX + GRID_SIZE < -50 || elX > CANVAS_WIDTH + 50) return;

      if (el.type === 'block') {
        // Neon Block
        ctx.save();
        ctx.fillStyle = '#1e1b4b'; // deep navy fill
        ctx.strokeStyle = glowColor; // active skin cyber theme border glow
        ctx.lineWidth = 2.5;
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 8;
        
        ctx.beginPath();
        ctx.roundRect(elX + 2, elY + 2, GRID_SIZE - 4, GRID_SIZE - 4, 4);
        ctx.fill();
        ctx.stroke();

        // Inner design markings
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(elX + 6, elY + 6);
        ctx.lineTo(elX + GRID_SIZE - 6, elY + GRID_SIZE - 6);
        ctx.moveTo(elX + GRID_SIZE - 6, elY + 6);
        ctx.lineTo(elX + 6, elY + GRID_SIZE - 6);
        ctx.stroke();
        ctx.restore();

      } else if (el.type === 'spike') {
        // Draw a beautiful, helpful neon trajectory arc over spikes to guide the player if enabled
        if (showJumpGuides) {
          ctx.save();
          ctx.strokeStyle = 'rgba(52, 211, 153, 0.45)'; // Soft glowing emerald
          ctx.lineWidth = 2.5;
          ctx.setLineDash([4, 6]);
          ctx.beginPath();
          const startX = elX - GRID_SIZE * 1.2;
          const endX = elX + GRID_SIZE * 2.2;
          const peakY = elY - 22;
          ctx.moveTo(startX, elY + GRID_SIZE - 2);
          ctx.quadraticCurveTo(elX + GRID_SIZE / 2, peakY, endX, elY + GRID_SIZE - 2);
          ctx.stroke();

          // Optional tiny "UP" arrow above the jump start point to signal where to jump
          ctx.fillStyle = 'rgba(52, 211, 153, 0.7)';
          ctx.font = '8px monospace';
          ctx.fillText('▲ TAP', startX - 8, elY + GRID_SIZE - 8);
          ctx.restore();
        }

        // Sharp deadly spike
        ctx.save();
        ctx.fillStyle = '#ef4444'; // Red hot spike
        ctx.strokeStyle = '#fca5a5';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 10;

        ctx.beginPath();
        ctx.moveTo(elX + 4, elY + GRID_SIZE - 2);
        ctx.lineTo(elX + GRID_SIZE/2, elY + 4);
        ctx.lineTo(elX + GRID_SIZE - 4, elY + GRID_SIZE - 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();

      } else if (el.type === 'pad') {
        // Bounce Pad layout
        ctx.save();
        ctx.fillStyle = '#eab308'; // Amber
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#eab308';
        ctx.shadowBlur = 8;

        ctx.beginPath();
        ctx.arc(elX + GRID_SIZE/2, elY + GRID_SIZE - 3, GRID_SIZE/2 - 4, Math.PI, 0, false);
        ctx.fill();
        ctx.stroke();

        // Arrow indicator
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(elX + GRID_SIZE/2, elY + GRID_SIZE - 12);
        ctx.lineTo(elX + GRID_SIZE/2 - 6, elY + GRID_SIZE - 6);
        ctx.lineTo(elX + GRID_SIZE/2 + 6, elY + GRID_SIZE - 6);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

      } else if (el.type === 'ring') {
        // Jump Ring mid-air bubble
        ctx.save();
        ctx.fillStyle = 'rgba(59, 130, 246, 0.25)'; // Clear blue orb
        ctx.strokeStyle = '#60a5fa';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#3b82f6';
        ctx.shadowBlur = 12;

        const pulse = 1.0 + 0.1 * Math.sin(Date.now() / 150);

        ctx.beginPath();
        ctx.arc(elX + GRID_SIZE/2, elY + GRID_SIZE/2, (GRID_SIZE/2.5) * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Inner core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(elX + GRID_SIZE/2, elY + GRID_SIZE/2, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

      } else if (el.type === 'ship_portal') {
        // Purple Ship warp portal ring
        ctx.save();
        ctx.fillStyle = 'rgba(168, 85, 247, 0.1)';
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 4.5;
        ctx.shadowColor = '#a855f7';
        ctx.shadowBlur = 15;

        // Draw portal pill shape frame
        ctx.beginPath();
        ctx.roundRect(elX + 5, elY - GRID_SIZE, GRID_SIZE - 10, GRID_SIZE * 3, 20);
        ctx.fill();
        ctx.stroke();

        // Swirl lines inside
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(elX + GRID_SIZE/2, elY - GRID_SIZE + 10);
        ctx.lineTo(elX + GRID_SIZE/2, elY + GRID_SIZE * 2 - 10);
        ctx.stroke();

        // Text inside portal
        ctx.fillStyle = '#e9d5ff';
        ctx.font = '900 8px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText("SHIP", elX + GRID_SIZE/2, elY + GRID_SIZE/2);
        ctx.restore();

      } else if (el.type === 'cube_portal') {
        // Cyan Cube warp portal ring
        ctx.save();
        ctx.fillStyle = 'rgba(6, 182, 212, 0.1)';
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 4.5;
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 15;

        ctx.beginPath();
        ctx.roundRect(elX + 5, elY - GRID_SIZE, GRID_SIZE - 10, GRID_SIZE * 3, 20);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(elX + GRID_SIZE/2, elY - GRID_SIZE + 10);
        ctx.lineTo(elX + GRID_SIZE/2, elY + GRID_SIZE * 2 - 10);
        ctx.stroke();

        ctx.fillStyle = '#cffafe';
        ctx.font = '900 8px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText("CUBE", elX + GRID_SIZE/2, elY + GRID_SIZE/2);
        ctx.restore();

      } else if (el.type === 'ball_portal') {
        // Orange Ball warp portal ring
        ctx.save();
        ctx.fillStyle = 'rgba(245, 158, 11, 0.1)';
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 4.5;
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 15;

        ctx.beginPath();
        ctx.roundRect(elX + 5, elY - GRID_SIZE, GRID_SIZE - 10, GRID_SIZE * 3, 20);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(elX + GRID_SIZE/2, elY - GRID_SIZE + 10);
        ctx.lineTo(elX + GRID_SIZE/2, elY + GRID_SIZE * 2 - 10);
        ctx.stroke();

        ctx.fillStyle = '#fef3c7';
        ctx.font = '900 8px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText("BALL", elX + GRID_SIZE/2, elY + GRID_SIZE/2);
        ctx.restore();

      } else if (el.type === 'coin') {
        // Secret Golden Coin
        if (s.collectedCoinsThisRun.includes(index)) return; // Don't draw if collected

        ctx.save();
        ctx.fillStyle = '#fbbf24'; // Gold
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 14;

        const coinPulse = 1.0 + 0.08 * Math.sin(Date.now() / 100);

        ctx.beginPath();
        ctx.arc(elX + GRID_SIZE/2, elY + GRID_SIZE/2, 13 * coinPulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Inner circle with currency mark
        ctx.fillStyle = '#9a3412';
        ctx.font = '900 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText("G", elX + GRID_SIZE/2, elY + GRID_SIZE/2);
        ctx.restore();
      }
    });

    // 4. DRAW PRACTICE CHECKPOINTS
    s.checkpoints.forEach(cp => {
      const cpx = cp.worldX - s.cameraX;
      const cpy = CANVAS_HEIGHT - 60 - cp.y - 16;
      ctx.save();
      ctx.fillStyle = '#22c55e'; // Green practice checkpoint diamond
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = '#22c55e';
      ctx.shadowBlur = 8;
      
      ctx.beginPath();
      ctx.moveTo(cpx, cpy - 10);
      ctx.lineTo(cpx + 8, cpy);
      ctx.lineTo(cpx, cpy + 10);
      ctx.lineTo(cpx - 8, cpy);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });

    // 5. DRAW SYSTEM LEVEL PLATFORM FLOOR & CEILING WALLS
    ctx.save();
    // Solid Ground
    ctx.fillStyle = '#0f172a'; // dark slate
    ctx.fillRect(0, CANVAS_HEIGHT - 60, CANVAS_WIDTH, 60);

    // Neon Floor border Line
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 4;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(0, CANVAS_HEIGHT - 60);
    ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT - 60);
    ctx.stroke();
    ctx.restore();

    // 6. DRAW REAL-TIME DYNAMIC PARTICLES
    s.particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 6;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    });

    // 7. DRAW PLAYER AVATAR CUBE / VEHICLE
    if (!hasCrashed) {
      ctx.save();
      // Translate to player center pivot for clean rotation dynamics
      ctx.translate(playerX + s.player.width/2, playerY + s.player.height/2);
      ctx.rotate(s.player.angle);

      // Cyber Neon Shadow Glow
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 16;

      if (s.player.vehicle === 'cube') {
        // Draw customized skins based on unlocked shop parameters
        ctx.fillStyle = primaryColor;
        ctx.strokeStyle = secondaryColor;
        ctx.lineWidth = 3.5;

        // Core base shape
        ctx.beginPath();
        ctx.roundRect(-s.player.width/2, -s.player.height/2, s.player.width, s.player.height, 4);
        ctx.fill();
        ctx.stroke();

        // Custom Skin Face designs
        ctx.fillStyle = secondaryColor;
        if (selectedSkin === 'happy') {
          // Happy Face
          ctx.beginPath();
          ctx.arc(-8, -4, 3.5, 0, Math.PI * 2);
          ctx.arc(8, -4, 3.5, 0, Math.PI * 2);
          ctx.fill();
          // Smile arc
          ctx.strokeStyle = secondaryColor;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(0, 3, 7, 0, Math.PI);
          ctx.stroke();
        } else if (selectedSkin === 'skull') {
          // Skull face
          ctx.beginPath();
          // Angry eyes
          ctx.moveTo(-11, -8); ctx.lineTo(-4, -5);
          ctx.moveTo(11, -8); ctx.lineTo(4, -5);
          ctx.strokeStyle = secondaryColor;
          ctx.lineWidth = 3;
          ctx.stroke();

          ctx.fillStyle = secondaryColor;
          ctx.fillRect(-8, -4, 4, 4);
          ctx.fillRect(4, -4, 4, 4);
          // Teeth lines
          ctx.fillRect(-6, 4, 2, 6);
          ctx.fillRect(-2, 4, 2, 6);
          ctx.fillRect(2, 4, 2, 6);
          ctx.fillRect(4, 4, 2, 6);
        } else {
          // Classic geometric skin lines
          ctx.strokeStyle = secondaryColor;
          ctx.lineWidth = 2;
          ctx.strokeRect(-10, -10, 20, 20);
          
          ctx.fillStyle = secondaryColor;
          ctx.fillRect(-5, -5, 10, 10);
        }

      } else if (s.player.vehicle === 'ship') {
        // Futuristic rocket vehicle outline
        ctx.fillStyle = primaryColor;
        ctx.strokeStyle = secondaryColor;
        ctx.lineWidth = 2.5;

        ctx.beginPath();
        ctx.moveTo(-s.player.width/2, 2);
        ctx.lineTo(s.player.width/2 - 4, -4);
        ctx.lineTo(s.player.width/2 + 6, 2); // pointer tip
        ctx.lineTo(s.player.width/2 - 4, 8);
        ctx.lineTo(-s.player.width/2, 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Thruster flame or visual indicator
        ctx.fillStyle = '#ef4444'; // Orange fire jet thrust
        if (s.player.isHoldingJump) {
          ctx.beginPath();
          ctx.moveTo(-s.player.width/2 - 2, -2);
          ctx.lineTo(-s.player.width/2 - 16, 2);
          ctx.lineTo(-s.player.width/2 - 2, 6);
          ctx.closePath();
          ctx.fill();
        }

        // Helmet/Visor inside rocket ship
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(3, 0, 5, 0, Math.PI * 2);
        ctx.fill();

      } else if (s.player.vehicle === 'ball') {
        // High rolling mechanical disc gravity ball
        ctx.fillStyle = primaryColor;
        ctx.strokeStyle = secondaryColor;
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.arc(0, 0, s.player.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Spokes / design to show spinning motion
        ctx.strokeStyle = secondaryColor;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-s.player.width/2 + 2, 0); ctx.lineTo(s.player.width/2 - 2, 0);
        ctx.moveTo(0, -s.player.height/2 + 2); ctx.lineTo(0, s.player.height/2 - 2);
        ctx.stroke();

        ctx.fillStyle = secondaryColor;
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    ctx.restore();
  };

  // ==========================================
  // LEVEL EDITOR GRID SECTIONS
  // ==========================================
  const handleEditorGridClick = (gridX: number, gridY: number) => {
    // Toggle element at grid coordinates
    const existingIndex = editorElements.findIndex(el => el.x === gridX && el.y === gridY);
    if (existingIndex !== -1) {
      // Remove element
      const copy = [...editorElements];
      copy.splice(existingIndex, 1);
      setEditorElements(copy);
    } else {
      // Add element
      const newElement: LevelElement = {
        x: gridX,
        y: gridY,
        type: selectedTool
      };
      setEditorElements([...editorElements, newElement]);
    }
  };

  const handleClearEditor = () => {
    if (window.confirm("Are you sure you want to delete all elements in your custom level?")) {
      setEditorElements([]);
      saveToLocal('gd_custom_level', []);
    }
  };

  const handleSaveEditor = () => {
    saveToLocal('gd_custom_level', editorElements);
    setEditorSavedMessage(true);
    setTimeout(() => setEditorSavedMessage(false), 2500);
  };

  const handleTestEditorLevel = () => {
    if (editorElements.length === 0) {
      alert("Add some blocks/spikes to your custom board first!");
      return;
    }
    setSelectedLevel(99); // custom level id trigger
    setActiveTab('play');
    setIsPlaying(true);
    setTimeout(() => initGame(), 80);
  };

  // ==========================================
  // CUSTOMIZATION SHOP PRICINGS
  // ==========================================
  const handleBuySkin = (skinId: string, cost: number) => {
    if (unlockedSkins.includes(skinId)) {
      setSelectedSkin(skinId);
      saveToLocal('gd_skin', skinId);
      return;
    }

    if (orbs >= cost) {
      const updatedSkins = [...unlockedSkins, skinId];
      setOrbs(prev => {
        const next = prev - cost;
        saveToLocal('gd_orbs', next);
        return next;
      });
      setUnlockedSkins(updatedSkins);
      saveToLocal('gd_unlocked_skins', updatedSkins);
      setSelectedSkin(skinId);
      saveToLocal('gd_skin', skinId);
      playSoundEffect('coin');
    } else {
      alert("Not enough Mana Orbs! Complete levels or advance further to collect Orbs.");
    }
  };

  const handleBuyTrail = (trailId: string, cost: number) => {
    if (unlockedTrails.includes(trailId)) {
      setSelectedTrail(trailId);
      saveToLocal('gd_trail', trailId);
      return;
    }

    if (orbs >= cost) {
      const updatedTrails = [...unlockedTrails, trailId];
      setOrbs(prev => {
        const next = prev - cost;
        saveToLocal('gd_orbs', next);
        return next;
      });
      setUnlockedTrails(updatedTrails);
      saveToLocal('gd_unlocked_trails', updatedTrails);
      setSelectedTrail(trailId);
      saveToLocal('gd_trail', trailId);
      playSoundEffect('coin');
    } else {
      alert("Not enough Mana Orbs!");
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 font-sans text-white select-none">
      
      {/* HEADER HUD NAV PANEL */}
      <header className="px-6 py-4 bg-slate-900 border-b border-white/5 flex items-center justify-between shadow-lg shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-purple-600 to-indigo-500 rounded-xl shadow-md border border-purple-400/20 animate-pulse">
            <Flame className="w-5 h-5 text-yellow-300 fill-yellow-300" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-wider uppercase bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
              Neon Dash Creator
            </h1>
            <p className="text-[9px] font-black tracking-widest text-slate-500 uppercase">Geometry Arcade Core v2.2</p>
          </div>
        </div>

        {/* STATS CHIPS BAR */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 rounded-xl">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-spin" />
            <span className="text-[11px] font-black text-yellow-300 tracking-wider leading-none">{stars} STARS</span>
          </div>

          <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-xl">
            <Award className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-[11px] font-black text-purple-300 tracking-wider leading-none">{orbs} ORBS</span>
          </div>

          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-black text-amber-300 tracking-wider leading-none">{secretCoins} COINS</span>
          </div>

          <button 
            onClick={() => {
              setIsMuted(!isMuted);
              playSoundEffect('jump');
            }}
            className="p-2 bg-slate-800 hover:bg-slate-700 active:scale-95 transition-all border border-white/5 rounded-xl"
            title="Toggle Synthesizer Sound"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400 animate-bounce" />}
          </button>
        </div>
      </header>

      {/* VIEW TABS SELECTOR */}
      <div className="flex bg-slate-900/60 border-b border-white/5 px-6 gap-2 py-2 shrink-0">
        <button 
          onClick={() => {
            setActiveTab('play');
            playSoundEffect('jump');
          }}
          className={`px-4 py-2 text-xs font-black tracking-widest uppercase rounded-xl transition-all flex items-center gap-2 ${activeTab === 'play' ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 shadow-md font-extrabold' : 'hover:bg-slate-800 text-slate-400'}`}
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          PLAY CHALLENGE
        </button>

        <button 
          onClick={() => {
            setActiveTab('editor');
            playSoundEffect('jump');
          }}
          className={`px-4 py-2 text-xs font-black tracking-widest uppercase rounded-xl transition-all flex items-center gap-2 ${activeTab === 'editor' ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md font-extrabold' : 'hover:bg-slate-800 text-slate-400'}`}
        >
          <Wrench className="w-3.5 h-3.5" />
          LEVEL CREATOR
        </button>

        <button 
          onClick={() => {
            setActiveTab('shop');
            playSoundEffect('jump');
          }}
          className={`px-4 py-2 text-xs font-black tracking-widest uppercase rounded-xl transition-all flex items-center gap-2 ${activeTab === 'shop' ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md font-extrabold' : 'hover:bg-slate-800 text-slate-400'}`}
        >
          <Palette className="w-3.5 h-3.5" />
          SKINS & GLOW
        </button>

        <button 
          onClick={() => {
            setActiveTab('stats');
            playSoundEffect('jump');
          }}
          className={`px-4 py-2 text-xs font-black tracking-widest uppercase rounded-xl transition-all flex items-center gap-2 ${activeTab === 'stats' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md font-extrabold' : 'hover:bg-slate-800 text-slate-400'}`}
        >
          <Trophy className="w-3.5 h-3.5" />
          DASHBOARD
        </button>
      </div>

      {/* CORE DISPLAY WINDOW */}
      <main className="flex-1 p-6 flex flex-col justify-center items-center overflow-y-auto">
        
        {/* ==========================================
            TAB 1: PLAY LEVEL SCREEN
            ========================================== */}
        {activeTab === 'play' && (
          <div className="w-full max-w-4xl flex flex-col items-center gap-6 animate-fadeIn">
            
            {/* STAGE LEVEL SELECTOR CARDS */}
            {!isPlaying && (
              <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1, 2, 3, 99].map(num => {
                  let name = `Stereo Madness`;
                  let starsDesc = `3 Stars`;
                  let diff = "Easy";
                  let diffColor = "text-emerald-400";
                  let bgGlow = "hover:shadow-emerald-500/10 hover:border-emerald-500/40";
                  
                  if (num === 2) {
                    name = `Back On Track`;
                    starsDesc = `6 Stars`;
                    diff = "Normal";
                    diffColor = "text-yellow-400";
                    bgGlow = "hover:shadow-yellow-500/10 hover:border-yellow-500/40";
                  } else if (num === 3) {
                    name = `Polargeist`;
                    starsDesc = `10 Stars`;
                    diff = "Hard";
                    diffColor = "text-pink-500";
                    bgGlow = "hover:shadow-pink-500/10 hover:border-pink-500/40";
                  } else if (num === 99) {
                    name = `Custom Sandbox`;
                    starsDesc = `Infinite Play`;
                    diff = "Sandbox";
                    diffColor = "text-purple-400";
                    bgGlow = "hover:shadow-purple-500/10 hover:border-purple-500/40";
                  }

                  const bestScore = bestProgress[num] || 0;

                  return (
                    <button
                      key={num}
                      onClick={() => {
                        setSelectedLevel(num);
                        playSoundEffect('jump');
                      }}
                      className={`relative flex flex-col justify-between p-5 rounded-2xl bg-slate-900 border transition-all text-left ${selectedLevel === num ? 'border-emerald-500 bg-slate-800/40 shadow-xl shadow-emerald-500/10' : 'border-white/5'} ${bgGlow}`}
                    >
                      {bestScore === 100 && (
                        <div className="absolute top-3 right-3 bg-emerald-500/20 border border-emerald-500 text-emerald-400 px-1.5 py-0.5 rounded text-[8px] font-black uppercase">
                          100% DONE
                        </div>
                      )}
                      
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase text-slate-500">LEVEL 0{num === 99 ? '?' : num}</span>
                        <h3 className="text-sm font-black uppercase tracking-wide">{name}</h3>
                        <p className={`text-[10px] font-extrabold uppercase ${diffColor}`}>{diff} • {starsDesc}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/5 w-full">
                        <div className="flex justify-between items-center text-[9px] font-black uppercase text-slate-400">
                          <span>BEST RUN:</span>
                          <span className="text-emerald-400 font-black">{bestScore}%</span>
                        </div>
                        <div className="w-full h-1 bg-slate-950 rounded-full mt-1 overflow-hidden">
                          <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${bestScore}%` }} />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* SPEED CALIBRATION & GUIDANCE PANEL */}
            {!isPlaying && (
              <div className="w-full bg-slate-900/60 border border-white/5 p-4 rounded-2xl flex flex-col xl:flex-row items-center justify-between gap-4">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full xl:w-auto">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">CALIBRATE GAME SPEED</span>
                    <span className="text-xs text-slate-400">Current horizontal speed: <strong className="text-emerald-400 font-mono">{(6.2 * speedMultiplier).toFixed(1)} px/f</strong></span>
                  </div>
                  
                  {/* Jump guides switch */}
                  <div className="flex items-center gap-2 bg-slate-950 border border-white/5 px-3 py-1.5 rounded-xl">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">VISUAL JUMP GUIDES:</span>
                    <button
                      onClick={() => {
                        setShowJumpGuides(!showJumpGuides);
                        playSoundEffect('jump');
                      }}
                      className={`px-2 py-1 rounded-lg text-[9px] font-black transition-all border ${showJumpGuides ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-slate-900 border-white/5 text-slate-500'}`}
                    >
                      {showJumpGuides ? "ENABLED (▲ TAP)" : "DISABLED"}
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {[
                    { val: 0.4, label: "0.4x Super Slow" },
                    { val: 0.6, label: "0.6x Casual" },
                    { val: 0.8, label: "0.8x Relaxed" },
                    { val: 1.0, label: "1.0x Normal" },
                    { val: 1.2, label: "1.2x Hardcore" }
                  ].map(opt => (
                    <button
                      key={opt.val}
                      onClick={() => {
                        setSpeedMultiplier(opt.val);
                        saveToLocal('gd_speed_mult', opt.val);
                        playSoundEffect('jump');
                      }}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${speedMultiplier === opt.val ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold shadow-md shadow-emerald-500/10' : 'bg-slate-950 border-white/5 text-slate-400 hover:text-white hover:border-white/10'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* INTERACTIVE GAMEPLAY BOX */}
            <div className="relative w-full aspect-video max-w-3xl bg-slate-950 rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex flex-col">
              
              {/* TOP PERFORMANCE PROGRESS BAR HUD */}
              {isPlaying && (
                <div className="absolute top-4 left-6 right-6 z-20 flex justify-between items-center gap-6">
                  <div className="flex-1 flex items-center gap-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                      {selectedLevel === 99 ? 'CUSTOM SANDBOX' : selectedLevel === 1 ? 'STEREO MADNESS' : selectedLevel === 2 ? 'BACK ON TRACK' : 'POLARGEIST'}
                    </span>
                    <div className="flex-1 h-2 bg-slate-900/80 rounded-full overflow-hidden border border-white/10 p-0.5 flex items-center">
                      <div 
                        className="h-full rounded-full transition-all duration-75 bg-gradient-to-r from-emerald-500 to-cyan-400"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-black text-emerald-400 font-mono tracking-widest leading-none">
                      {Math.round(progressPercent)}%
                    </span>
                  </div>

                  {/* Mode state badge */}
                  <div className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider ${isPracticeMode ? 'bg-green-500/15 border border-green-500/30 text-green-400' : 'bg-red-500/15 border border-red-500/30 text-red-400'}`}>
                    {isPracticeMode ? 'PRACTICE MODE' : 'NORMAL MODE'}
                  </div>
                </div>
              )}

              {/* RETRO CANVAS RENDERING FRAME */}
              <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                onClick={handleJumpPress}
                onMouseDown={handleJumpPress}
                onMouseUp={handleJumpRelease}
                onTouchStart={(e) => {
                  e.preventDefault();
                  handleJumpPress();
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  handleJumpRelease();
                }}
                className="w-full h-full cursor-pointer bg-slate-950"
              />

              {/* OVERLAYS SYSTEM */}
              {!isPlaying && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col justify-center items-center p-6 text-center z-30">
                  <div className="relative group">
                    <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-200"></div>
                    <button
                      onClick={() => {
                        setIsPlaying(true);
                        initGame();
                      }}
                      className="relative px-8 py-4 bg-emerald-500 text-slate-950 hover:bg-emerald-400 rounded-full text-sm font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 active:scale-95 shadow-xl"
                    >
                      <Play className="w-5 h-5 fill-current" />
                      START GAME
                    </button>
                  </div>

                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-6">
                    PRESS <span className="px-1.5 py-0.5 bg-slate-900 border border-white/10 rounded text-slate-300">SPACEBAR</span> OR CLICK MOUSE TO JUMP / ACTIVATE PORTALS
                  </p>

                  <div className="mt-8 flex gap-3">
                    <button
                      onClick={() => {
                        setIsPracticeMode(!isPracticeMode);
                        playSoundEffect('jump');
                      }}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${isPracticeMode ? 'bg-green-500/15 border-green-500/40 text-green-400' : 'bg-slate-900 border-white/5 text-slate-400 hover:text-white'}`}
                    >
                      {isPracticeMode ? '🟢 PRACTICE ACTIVE' : '🔴 PRACTICE MODE OFF'}
                    </button>
                  </div>
                </div>
              )}

              {/* DEATH CRASH POPUP */}
              {isPlaying && hasCrashed && (
                <div className="absolute inset-0 flex flex-col justify-center items-center bg-red-950/20 backdrop-blur-xs text-center z-30 animate-pulse">
                  <h2 className="text-3xl font-black text-red-500 uppercase tracking-widest drop-shadow-lg">CRASH!</h2>
                  <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest mt-1">RESPAWNING IN REGENERATOR...</p>
                </div>
              )}

              {/* LEVEL COMPLETED CELEBRATION */}
              {levelCompleted && (
                <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col justify-center items-center p-6 text-center z-30 animate-scaleIn">
                  <div className="w-16 h-16 bg-yellow-500/20 border border-yellow-500 text-yellow-400 rounded-2xl flex items-center justify-center mb-4">
                    <Award className="w-8 h-8 animate-bounce" />
                  </div>
                  
                  <h2 className="text-2xl font-black text-yellow-400 uppercase tracking-widest">LEVEL COMPLETE!</h2>
                  <p className="text-slate-400 text-xs mt-2 max-w-sm">
                    Spectacular dash performance! You completed the stage, collecting orbs and achieving perfect dimensional resonance.
                  </p>

                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={() => initGame(false)}
                      className="px-6 py-3 bg-yellow-500 text-slate-950 hover:bg-yellow-400 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      PLAY AGAIN
                    </button>
                    <button
                      onClick={() => setIsPlaying(false)}
                      className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-black uppercase tracking-wider border border-white/5"
                    >
                      EXIT TO STAGE SELECT
                    </button>
                  </div>
                </div>
              )}

              {/* PRACTICE MODE HUD ASSISTANCE CONTROLS */}
              {isPlaying && isPracticeMode && (
                <div className="absolute bottom-4 left-6 right-6 z-20 flex justify-between items-center bg-slate-900/60 backdrop-blur-md border border-white/5 px-4 py-2 rounded-2xl">
                  <span className="text-[9px] font-black text-slate-400 uppercase">PRACTICE COMMANDS:</span>
                  <div className="flex gap-2">
                    <button
                      onClick={placeCheckpoint}
                      className="px-3 py-1 bg-green-500/20 border border-green-500 text-green-300 rounded text-[9px] font-black uppercase hover:bg-green-500/35 flex items-center gap-1.5"
                    >
                      <Plus className="w-3 h-3" />
                      [Z] ADD CHECKPOINT
                    </button>
                    <button
                      onClick={removeLastCheckpoint}
                      className="px-3 py-1 bg-red-500/20 border border-red-500 text-red-300 rounded text-[9px] font-black uppercase hover:bg-red-500/35 flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3 h-3" />
                      [X] DELETE LAST
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* KEYBOARD SHORTCUT DIAGRAMS */}
            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 text-center mt-2">
              <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">MOVEMENT</h4>
                <p className="text-xs text-slate-300">Spacebar, Up Arrow, or Left Click to jump/fly/shift</p>
              </div>
              <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">PRACTICE RESCUES</h4>
                <p className="text-xs text-slate-300">Z places a Checkpoint • X deletes latest checkpoint</p>
              </div>
              <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">VEHICLE LOGIC</h4>
                <p className="text-xs text-slate-300">Cube leaps • Ship flies on hold • Ball reverses gravity</p>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 2: CUSTOM LEVEL EDITOR / CREATOR
            ========================================== */}
        {activeTab === 'editor' && (
          <div className="w-full max-w-4xl flex flex-col gap-6 animate-fadeIn">
            <div className="bg-slate-900 p-6 rounded-3xl border border-white/5 shadow-xl flex flex-col gap-5">
              
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <h2 className="text-base font-black uppercase tracking-wide">SANDBOX STAGE DESIGNER</h2>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Draw obstacles on the grid below, test-play, and share!</p>
                </div>

                <div className="flex gap-2.5">
                  <button
                    onClick={handleClearEditor}
                    className="px-4 py-2 bg-slate-950 border border-white/10 hover:bg-slate-900 text-red-400 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    CLEAR GRID
                  </button>
                  <button
                    onClick={handleSaveEditor}
                    className="px-4 py-2 bg-slate-950 border border-white/10 hover:bg-slate-900 text-emerald-400 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {editorSavedMessage ? 'SAVED TO LOCAL!' : 'SAVE STAGE'}
                  </button>
                  <button
                    onClick={handleTestEditorLevel}
                    className="px-5 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-md flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    TEST PLAY
                  </button>
                </div>
              </div>

              {/* ASSETS SELECTION TOOLBOX */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-white/10 flex flex-wrap items-center gap-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">SELECT BLOCK TYPE:</span>
                
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'block', name: 'Solid block', color: 'border-cyan-400' },
                    { id: 'spike', name: 'Spike (Deadly)', color: 'border-red-500' },
                    { id: 'pad', name: 'Jump Pad', color: 'border-yellow-400' },
                    { id: 'ring', name: 'Jump Ring', color: 'border-blue-400' },
                    { id: 'ship_portal', name: 'Ship Portal', color: 'border-purple-400' },
                    { id: 'cube_portal', name: 'Cube Portal', color: 'border-cyan-400' },
                    { id: 'ball_portal', name: 'Ball Portal', color: 'border-amber-400' },
                    { id: 'coin', name: 'Secret Coin', color: 'border-yellow-500' },
                  ].map(tool => (
                    <button
                      key={tool.id}
                      onClick={() => {
                        setSelectedTool(tool.id as ElementType);
                        playSoundEffect('jump');
                      }}
                      className={`px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${selectedTool === tool.id ? 'bg-slate-800 border-white text-white' : 'bg-slate-900 border-white/5 text-slate-500 hover:text-slate-300'}`}
                    >
                      <span className={`w-2 h-2 rounded-full border-2 ${tool.color}`} />
                      {tool.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* EDITOR LEVEL PROPERTIES */}
              <div className="flex flex-wrap gap-4 items-center p-3 bg-slate-950/50 rounded-xl">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">STARTING VEHICLE:</span>
                <div className="flex gap-1">
                  {['cube', 'ship', 'ball'].map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setEditorStartVehicle(type as any);
                        playSoundEffect('jump');
                      }}
                      className={`px-2.5 py-1 text-[9px] font-black uppercase rounded-md border transition-all ${editorStartVehicle === type ? 'bg-purple-500/20 border-purple-400 text-purple-300' : 'bg-slate-900 border-white/5 text-slate-400'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* SCROLLABLE GRID BOX */}
              <div className="relative">
                {/* Horizontal Scrolling Bar controller */}
                <div className="flex justify-between items-center mb-2 px-1">
                  <div className="flex gap-1.5 items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase">GRID VIEWER TIMELINE:</span>
                    <span className="text-[10px] font-bold text-slate-500">Showing blocks {editorScrollX} to {editorScrollX + 20}</span>
                  </div>
                  
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => {
                        setEditorScrollX(prev => Math.max(0, prev - 5));
                        playSoundEffect('jump');
                      }}
                      className="p-1.5 bg-slate-950 hover:bg-slate-850 rounded-lg border border-white/5 text-slate-400 hover:text-white"
                      disabled={editorScrollX === 0}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setEditorScrollX(prev => prev + 5);
                        playSoundEffect('jump');
                      }}
                      className="p-1.5 bg-slate-950 hover:bg-slate-850 rounded-lg border border-white/5 text-slate-400 hover:text-white"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* THE GRID CANVAS TABLE */}
                <div className="w-full bg-slate-950 p-4 rounded-2xl border border-white/10 overflow-x-auto">
                  <div className="flex flex-col gap-1 min-w-[650px]">
                    {/* Rows from Y=7 to Y=0 (bottom) */}
                    {Array.from({ length: 8 }, (_, idx) => 7 - idx).map(gridY => {
                      return (
                        <div key={gridY} className="flex gap-1">
                          {/* Row Label */}
                          <div className="w-8 flex items-center justify-center text-[10px] font-bold text-slate-600 uppercase">
                            Y{gridY}
                          </div>

                          {/* Grid Cells */}
                          {Array.from({ length: 20 }, (_, idx) => idx + editorScrollX).map(gridX => {
                            const matchingElement = editorElements.find(el => el.x === gridX && el.y === gridY);
                            
                            // Visuals based on placed item
                            let cellColor = "bg-slate-900 hover:bg-slate-850";
                            let cellText = "";
                            let cellTextColor = "text-white";

                            if (matchingElement) {
                              if (matchingElement.type === 'block') {
                                cellColor = "bg-cyan-500/20 border-cyan-400/40";
                                cellText = "BLK";
                                cellTextColor = "text-cyan-300";
                              } else if (matchingElement.type === 'spike') {
                                cellColor = "bg-red-500/20 border-red-400/40";
                                cellText = "SPK";
                                cellTextColor = "text-red-300";
                              } else if (matchingElement.type === 'pad') {
                                cellColor = "bg-yellow-500/20 border-yellow-400/40";
                                cellText = "PAD";
                                cellTextColor = "text-yellow-300";
                              } else if (matchingElement.type === 'ring') {
                                cellColor = "bg-blue-500/20 border-blue-400/40";
                                cellText = "RNG";
                                cellTextColor = "text-blue-300";
                              } else if (matchingElement.type === 'ship_portal') {
                                cellColor = "bg-purple-500/20 border-purple-400/40";
                                cellText = "SHP";
                                cellTextColor = "text-purple-300";
                              } else if (matchingElement.type === 'cube_portal') {
                                cellColor = "bg-cyan-500/20 border-cyan-400/40";
                                cellText = "CUB";
                                cellTextColor = "text-cyan-300";
                              } else if (matchingElement.type === 'ball_portal') {
                                cellColor = "bg-amber-500/20 border-amber-400/40";
                                cellText = "BAL";
                                cellTextColor = "text-amber-300";
                              } else if (matchingElement.type === 'coin') {
                                cellColor = "bg-amber-500/20 border-yellow-400/40";
                                cellText = "COI";
                                cellTextColor = "text-yellow-400";
                              }
                            }

                            return (
                              <button
                                key={gridX}
                                onClick={() => handleEditorGridClick(gridX, gridY)}
                                className={`flex-1 aspect-square max-w-[32px] rounded-md border border-white/5 flex items-center justify-center text-[8px] font-black transition-all ${cellColor}`}
                                title={`Coordinate: X:${gridX}, Y:${gridY}`}
                              >
                                <span className={cellTextColor}>{cellText}</span>
                              </button>
                            );
                          })}
                        </div>
                      );
                    })}

                    {/* X axis index markings */}
                    <div className="flex gap-1 mt-1.5">
                      <div className="w-8" />
                      {Array.from({ length: 20 }, (_, idx) => idx + editorScrollX).map(gridX => (
                        <div key={gridX} className="flex-1 max-w-[32px] text-center text-[9px] font-bold text-slate-600">
                          {gridX}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 3: CUSTOMIZATION SHOP
            ========================================== */}
        {activeTab === 'shop' && (
          <div className="w-full max-w-4xl flex flex-col gap-6 animate-fadeIn">
            <div className="bg-slate-900 p-6 rounded-3xl border border-white/5 shadow-xl flex flex-col gap-6">
              
              <div>
                <h2 className="text-base font-black uppercase tracking-wide">AVATAR COSTUME & THEME GARAGE</h2>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Unlock premium cube skins, trails, and custom neon cyber-glow colors!</p>
              </div>

              {/* CUBE SKIN STYLES */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase text-purple-400 tracking-wider">1. CUSTOM SKIN CARDS</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { id: 'classic', name: 'Geometric Neo', desc: 'Classic geometrical symmetry outline.', cost: 0 },
                    { id: 'happy', name: 'Happy Smiley', desc: 'Smiling cute cube helper avatar.', cost: 50 },
                    { id: 'skull', name: 'Cyber Skull', desc: 'Edgy skull pattern teeth lining.', cost: 120 },
                  ].map(skin => {
                    const isUnlocked = unlockedSkins.includes(skin.id);
                    const isActive = selectedSkin === skin.id;

                    return (
                      <div 
                        key={skin.id}
                        className={`p-4 rounded-2xl border bg-slate-950 flex flex-col justify-between items-start gap-4 transition-all ${isActive ? 'border-pink-500 bg-pink-500/5' : 'border-white/5'}`}
                      >
                        <div className="space-y-1">
                          <h5 className="text-xs font-black uppercase tracking-wide">{skin.name}</h5>
                          <p className="text-[10px] text-slate-500">{skin.desc}</p>
                        </div>

                        <div className="w-full flex justify-between items-center mt-2 pt-2 border-t border-white/5">
                          <span className="text-[9px] font-black uppercase text-slate-400">
                            {isUnlocked ? 'UNLOCKED' : `${skin.cost} ORBS`}
                          </span>
                          <button
                            onClick={() => handleBuySkin(skin.id, skin.cost)}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${isActive ? 'bg-pink-500 text-white' : (isUnlocked ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-purple-600 hover:bg-purple-500 text-white')}`}
                          >
                            {isActive ? 'ACTIVE SKIN' : (isUnlocked ? 'SELECT' : 'BUY SKIN')}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* TRAIL EFFECTS */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase text-cyan-400 tracking-wider">2. PARTICLES & TRAIL GENERATORS</h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  {[
                    { id: 'neon', name: 'Solid Neon', cost: 0 },
                    { id: 'sparkle', name: 'Sparks Glow', cost: 40 },
                    { id: 'fire', name: 'Flame Burn', cost: 80 },
                    { id: 'rainbow', name: 'Rainbow Prism', cost: 150 },
                  ].map(trail => {
                    const isUnlocked = unlockedTrails.includes(trail.id);
                    const isActive = selectedTrail === trail.id;

                    return (
                      <div 
                        key={trail.id}
                        className={`p-4 rounded-2xl border bg-slate-950 flex flex-col justify-between items-start gap-3 transition-all ${isActive ? 'border-cyan-500' : 'border-white/5'}`}
                      >
                        <h5 className="text-[11px] font-black uppercase tracking-wide">{trail.name}</h5>
                        
                        <div className="w-full flex justify-between items-center pt-2 border-t border-white/5">
                          <span className="text-[9px] font-black uppercase text-slate-400">
                            {isUnlocked ? 'UNLOCKED' : `${trail.cost} ORBS`}
                          </span>
                          <button
                            onClick={() => handleBuyTrail(trail.id, trail.cost)}
                            className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${isActive ? 'bg-cyan-500 text-slate-950 font-bold' : (isUnlocked ? 'bg-slate-800 text-slate-300' : 'bg-purple-600 text-white')}`}
                          >
                            {isActive ? 'ACTIVE' : (isUnlocked ? 'SELECT' : 'BUY')}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* COLOR CODES */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase text-emerald-400 tracking-wider">3. CUSTOM NEON HEX PALETTE</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-4 bg-slate-950 rounded-2xl border border-white/5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Primary Color</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="color" 
                        value={primaryColor} 
                        onChange={(e) => {
                          setPrimaryColor(e.target.value);
                          saveToLocal('gd_pri_col', e.target.value);
                        }}
                        className="w-8 h-8 rounded border-none bg-transparent cursor-pointer"
                      />
                      <span className="text-xs font-mono">{primaryColor.toUpperCase()}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Secondary Color</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="color" 
                        value={secondaryColor} 
                        onChange={(e) => {
                          setSecondaryColor(e.target.value);
                          saveToLocal('gd_sec_col', e.target.value);
                        }}
                        className="w-8 h-8 rounded border-none bg-transparent cursor-pointer"
                      />
                      <span className="text-xs font-mono">{secondaryColor.toUpperCase()}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Neon Border Glow</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="color" 
                        value={glowColor} 
                        onChange={(e) => {
                          setGlowColor(e.target.value);
                          saveToLocal('gd_glow_col', e.target.value);
                        }}
                        className="w-8 h-8 rounded border-none bg-transparent cursor-pointer"
                      />
                      <span className="text-xs font-mono">{glowColor.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==========================================
            TAB 4: STATS & ACHIEVEMENTS DASHBOARD
            ========================================== */}
        {activeTab === 'stats' && (
          <div className="w-full max-w-4xl flex flex-col gap-6 animate-fadeIn">
            <div className="bg-slate-900 p-6 rounded-3xl border border-white/5 shadow-xl flex flex-col gap-6">
              
              <div>
                <h2 className="text-base font-black uppercase tracking-wide">PLAYER LIFETIME RECORD</h2>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Review your arcade high-scores, attempts, and dimensional completion accomplishments.</p>
              </div>

              {/* STATS COUNT GRID */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-950 rounded-2xl border border-white/5 text-center">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">TOTAL JUMPS</span>
                  <p className="text-2xl font-black text-emerald-400 mt-1 font-mono">{totalJumps}</p>
                </div>
                <div className="p-4 bg-slate-950 rounded-2xl border border-white/5 text-center">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">TOTAL ATTEMPTS</span>
                  <p className="text-2xl font-black text-pink-500 mt-1 font-mono">{totalAttempts}</p>
                </div>
                <div className="p-4 bg-slate-950 rounded-2xl border border-white/5 text-center">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">STARS EARNED</span>
                  <p className="text-2xl font-black text-yellow-400 mt-1 font-mono">{stars}</p>
                </div>
                <div className="p-4 bg-slate-950 rounded-2xl border border-white/5 text-center">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">COINS COLLECTED</span>
                  <p className="text-2xl font-black text-amber-500 mt-1 font-mono">{secretCoins}</p>
                </div>
              </div>

              {/* SYSTEM ACHIEVEMENTS CHECKS */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase text-blue-400 tracking-wider">ACHIEVEMENTS SYSTEM</h4>
                
                <div className="space-y-2">
                  {[
                    { name: 'First Ignition', desc: 'Jump 10 times on platform modules.', unlocked: totalJumps >= 10 },
                    { name: 'Spike Jammer', desc: 'Attempt stages at least 15 times.', unlocked: totalAttempts >= 15 },
                    { name: 'Wealthy Collector', desc: 'Amass 100 or more Mana Orbs.', unlocked: orbs >= 100 },
                    { name: 'Madness Exterminated', desc: 'Complete Level 1 Stereo Madness at 100%.', unlocked: (bestProgress[1] || 0) >= 100 },
                    { name: 'Golden Vault', desc: 'Acquire at least 3 Secret Golden Coins.', unlocked: secretCoins >= 3 }
                  ].map((ach, idx) => {
                    return (
                      <div 
                        key={idx}
                        className={`p-3.5 rounded-xl border flex justify-between items-center ${ach.unlocked ? 'bg-emerald-500/5 border-emerald-500/20 text-white' : 'bg-slate-950 border-white/5 text-slate-500'}`}
                      >
                        <div className="space-y-0.5">
                          <h5 className="text-[11px] font-black uppercase tracking-wide">{ach.name}</h5>
                          <p className="text-[10px] text-slate-500">{ach.desc}</p>
                        </div>

                        {ach.unlocked ? (
                          <div className="flex items-center gap-1.5 text-[9px] font-black text-emerald-400 uppercase bg-emerald-500/10 px-2 py-1 rounded">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            UNLOCKED
                          </div>
                        ) : (
                          <div className="text-[9px] font-black text-slate-600 uppercase bg-slate-900 px-2 py-1 rounded">
                            LOCKED
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}
