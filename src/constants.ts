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
  }
];
