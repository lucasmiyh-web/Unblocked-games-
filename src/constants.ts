import { 
  Calculator, 
  Triangle, 
  Activity, 
  Brain, 
  BarChart3, 
  Binary, 
  Gamepad2, 
  Ghost, 
  Zap, 
  Target, 
  Rocket, 
  Shield, 
  Sword, 
  Coffee,
  Car,
  Compass,
  Crown,
  Dices,
  Flame,
  Globe,
  Heart,
  Key,
  Layers,
  Map,
  Moon,
  Music,
  Palette,
  Pizza,
  Puzzle,
  Star,
  Trophy,
  Truck,
  Wifi,
  Volleyball,
  Smile
} from 'lucide-react';

export interface Game {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: any;
  systemCore: string;
  isInternal?: boolean;
  url?: string;
}

export const CATEGORIES = ['All', 'Arcade', 'Survival', 'Strategy', 'Precision', 'Favorites'];

export const GAMES: Game[] = [
  {
    id: 'geometrydash',
    name: 'Geometry Dash',
    category: 'Precision',
    description: 'Jump, fly, and flip your way through dangerous passages and spiky obstacles in a rhythmic neon world.',
    icon: Triangle,
    systemCore: 'Rhythmic Matrix v2.0',
    isInternal: true
  },
  {
    id: 'hyperslither',
    name: 'HyperSlither.IO',
    category: 'Survival',
    description: 'A massive energy survival arena. Consume or be consumed. Steer with precision to dominate the grid.',
    icon: Activity,
    systemCore: 'Kinetic Logic v4.2',
    isInternal: true
  },
  {
    id: 'cyberstack',
    name: 'Cyber Stack',
    category: 'Precision',
    description: 'Build the tower to the stars. One mistiming and the structural integrity collapses. How high can you go?',
    icon: Layers,
    systemCore: 'Gravity Alignment v1.0',
    isInternal: true
  },
  {
    id: 'neonrunner',
    name: 'Neon Runner',
    category: 'Arcade',
    description: 'Jump, duck, and slide through the digital void. The speed increases as the grid destabilizes.',
    icon: Zap,
    systemCore: 'Reflex Calibration v9.1',
    isInternal: true
  },
  {
    id: 'retrosnake',
    name: 'Retro Snake',
    category: 'Arcade',
    description: 'A classic reconstructed for the modern era. Collect the bit-packets without colliding with the firewall.',
    icon: Binary,
    systemCore: 'Bitwise Navigation v0.8',
    isInternal: true
  },
  {
    id: 'stardefender',
    name: 'Star Defender',
    category: 'Arcade',
    description: 'Protect the sector from rogue asteroids. Rapid reactive pulses required for survival.',
    icon: Rocket,
    systemCore: 'Orbital Defense v3.5',
    isInternal: true
  },
  {
    id: 'memorymatrix',
    name: 'Memory Matrix',
    category: 'Strategy',
    description: 'The grid flashes. Your cognitive capacity is tested. Replicate the sequence or phase out.',
    icon: Brain,
    systemCore: 'Neural Resonance v7.1',
    isInternal: true
  },
  {
    id: 'gravitycube',
    name: 'Gravity Cube',
    category: 'Strategy',
    description: 'Pivot the reality to navigate the cube. Avoid the static zones and reach the exit node.',
    icon: Dices,
    systemCore: 'Geometric Calculus v2.0',
    isInternal: true
  },
  {
    id: 'voidshot',
    name: 'Void Shot',
    category: 'Arcade',
    description: 'Precision firing at incoming data streams. Do not let the packets breach the core.',
    icon: Target,
    systemCore: 'Ballistic Logic v1.2',
    isInternal: true
  },
  {
    id: 'bitshift',
    name: 'Bit Shift',
    category: 'Strategy',
    description: 'Slide the blocks to align the code blocks. Optimize the pathway for data flow.',
    icon: Layers,
    systemCore: 'Memory Optimization v2.0',
    isInternal: true
  },
  {
    id: 'ghostprotocol',
    name: 'Ghost Protocol',
    category: 'Survival',
    description: 'Navigate through a haunted mainframe. Use your pulse to repel the shadow processes.',
    icon: Ghost,
    systemCore: 'Invisibility Cloak v0.5',
    isInternal: true
  },
  {
    id: 'voltracing',
    name: 'Volt Racing',
    category: 'Arcade',
    description: 'High speed racing on electric circuits. Watch out for surges and power drops.',
    icon: Car,
    systemCore: 'Velocity Driver v4.4',
    isInternal: true
  },
  {
    id: 'cryptoclimb',
    name: 'Crypto Climb',
    category: 'Precision',
    description: 'Climb the volatile blocks of the blockchain. Don’t get stuck in a fork.',
    icon: Triangle,
    systemCore: 'Ledger Ascension v8.1',
    isInternal: true
  },
  {
    id: 'pizzaldriver',
    name: 'Pizza Driver',
    category: 'Arcade',
    description: 'Deliver data-pizzas across the digital city before the TTL expires.',
    icon: Pizza,
    systemCore: 'Packet Delivery v6.2',
    isInternal: true
  },
  {
    id: 'musicmatch',
    name: 'Music Match',
    category: 'Strategy',
    description: 'Synchronize the frequencies to clear the bandwidth. Keep the rhythm alive.',
    icon: Music,
    systemCore: 'Harmonic Sync v1.8',
    isInternal: true
  },
  {
    id: 'worldweaver',
    name: 'World Weaver',
    category: 'Strategy',
    description: 'Expand your node network across the globe. Connect the regions and dominate the web.',
    icon: Globe,
    systemCore: 'Network Topology v3.2',
    isInternal: true
  },
  {
    id: 'hearthacker',
    name: 'Heart Hacker',
    category: 'Survival',
    description: 'Keep the virtual heart beating by preventing malware intrusions.',
    icon: Heart,
    systemCore: 'Vitality Guard v2.2',
    isInternal: true
  },
  {
    id: 'compasshunt',
    name: 'Compass Hunt',
    category: 'Strategy',
    description: 'Find the hidden nodes in the vast data desert using your triangulation tools.',
    icon: Compass,
    systemCore: 'Navigation Matrix v0.9',
    isInternal: true
  },
  {
    id: 'flameguard',
    name: 'Flame Guard',
    category: 'Survival',
    description: 'Protect the central flame from the freezing winds of the digital winter.',
    icon: Flame,
    systemCore: 'Thermal Regulation v1.1',
    isInternal: true
  },
  {
    id: 'keymaster',
    name: 'Key Master',
    category: 'Strategy',
    description: 'Solve the cryptographic locks to access the higher tier servers.',
    icon: Key,
    systemCore: 'Decryption Engine v9.0',
    isInternal: true
  },
  {
    id: 'palettepop',
    name: 'Palette Pop',
    category: 'Arcade',
    description: 'Match the colors and pop the pixels. A vibrant challenge for your visual sensors.',
    icon: Palette,
    systemCore: 'Color Synthesis v4.0',
    isInternal: true
  },
  {
    id: 'puzzlepath',
    name: 'Puzzle Path',
    category: 'Strategy',
    description: 'Map the route through the rotating platform segments.',
    icon: Puzzle,
    systemCore: 'Logical Routing v2.1',
    isInternal: true
  },
  {
    id: 'smileyswipe',
    name: 'Smiley Swipe',
    category: 'Arcade',
    description: 'Catch the positive packets and avoid the negative ones. Keep the system happy.',
    icon: Smile,
    systemCore: 'Sentiment Analysis v0.7',
    isInternal: true
  },
  {
    id: 'trucktrek',
    name: 'Truck Trek',
    category: 'Arcade',
    description: 'Haul heavy data loads across the backbone cables. Beware of line noise.',
    icon: Truck,
    systemCore: 'Transport Protocol v5.5',
    isInternal: true
  },
  {
    id: 'wifidrop',
    name: 'Wifi Drop',
    category: 'Arcade',
    description: 'Connect the falling signals to the routers. Don’t miss a single packet.',
    icon: Wifi,
    systemCore: 'Signal Processing v3.3',
    isInternal: true
  },
  {
    id: 'basketballstars',
    name: 'Basketball Stars',
    category: 'Arcade',
    description: 'Throw epic shots from dynamic spots on the court, unlock wild flame streaks, and master the perfect swish!',
    icon: Volleyball,
    systemCore: '3D Physics Engine v1.0',
    isInternal: true
  },
  {
    id: 'starcatcher',
    name: 'Star Catcher',
    category: 'Arcade',
    description: 'Collect drifting fragments of destroyed constellations.',
    icon: Star,
    systemCore: 'Orbital Collection v8.8',
    isInternal: true
  },
  {
    id: 'trophyrun',
    name: 'Trophy Run',
    category: 'Precision',
    description: 'Race for the gold through the obstacle-rich testing grounds.',
    icon: Trophy,
    systemCore: 'Championship Driver v1.0',
    isInternal: true
  },
  {
    id: 'swordspin',
    name: 'Sword Spin',
    category: 'Survival',
    description: 'Deflect incoming viruses with your digital blade.',
    icon: Sword,
    systemCore: 'Blade Logic v2.5',
    isInternal: true
  },
  {
    id: 'shieldburst',
    name: 'Shield Burst',
    category: 'Survival',
    description: 'Hold the defense against waves of orbital debris.',
    icon: Shield,
    systemCore: 'Impact Mitigation v4.4',
    isInternal: true
  },
  {
    id: 'binarybreak',
    name: 'Binary Break',
    category: 'Arcade',
    description: 'Break through the layers of binary code to reaches the data core.',
    icon: Binary,
    systemCore: 'Brute Force v0.10',
    isInternal: true
  },
  {
    id: 'coffeecup',
    name: 'Coffee Cup',
    category: 'Arcade',
    description: 'Catch the falling caffeine drops to keep the developer awake.',
    icon: Coffee,
    systemCore: 'Vigilance Booster v7.7',
    isInternal: true
  },
  {
    id: 'crownhunt',
    name: 'Crown Hunt',
    category: 'Strategy',
    description: 'Navigate the labyrinth to find the golden crown node.',
    icon: Crown,
    systemCore: 'Royalty Navigation v3.3',
    isInternal: true
  },
  {
    id: 'dicegame',
    name: 'Dice Game',
    category: 'Strategy',
    description: 'Roll the dice and calculate your next move in the quantum board game.',
    icon: Dices,
    systemCore: 'Probability Matrix v2.2',
    isInternal: true
  },
  {
    id: 'ghosttrail',
    name: 'Ghost Trail',
    category: 'Arcade',
    description: 'Leave a trail that traps the enemy ghosts without trapping yourself.',
    icon: Ghost,
    systemCore: 'Thermal Trapping v8.1',
    isInternal: true
  },
  {
    id: 'rocketleap',
    name: 'Rocket Leap',
    category: 'Precision',
    description: 'Leap from asteroid to asteroid with timed rocket bursts.',
    icon: Rocket,
    systemCore: 'Propulsion Timing v5.5',
    isInternal: true
  },
  {
    id: 'brainburn',
    name: 'Brain Burn',
    category: 'Strategy',
    description: 'Solve the complex mathematical equations under pressure.',
    icon: Brain,
    systemCore: 'Logic Overload v9.9',
    isInternal: true
  },
  {
    id: 'targetstrike',
    name: 'Target Strike',
    category: 'Precision',
    description: 'Hit the moving bullseyes with high speed data pulses.',
    icon: Target,
    systemCore: 'Precision Aiming v4.2',
    isInternal: true
  },
  {
    id: 'zappulse',
    name: 'Zap Pulse',
    category: 'Arcade',
    description: 'Discharge electrical pulses at exactly the right moment to chain power.',
    icon: Zap,
    systemCore: 'Electrical Chain v6.6',
    isInternal: true
  },
  {
    id: 'flameout',
    name: 'Flame Out',
    category: 'Arcade',
    description: 'Extinguish the overheating cores before they meltdown.',
    icon: Flame,
    systemCore: 'Emergency Coolant v0.9',
    isInternal: true
  }
];
