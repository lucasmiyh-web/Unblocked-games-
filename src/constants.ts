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
  mathTopic: string;
  url?: string;
}

export const CATEGORIES = ['All', 'Arcade', 'Puzzle', 'Strategy', 'Action', 'Sports', 'Relaxing', 'Adventure'];

export const GAMES: Game[] = [
  {
    id: 'hextris',
    name: 'Hextris',
    category: 'Puzzle',
    description: 'An addictive puzzle game where you rotate a hexagon to match blocks.',
    icon: Layers,
    mathTopic: 'Rotational Geometry',
    url: 'https://hextris.io/'
  },
  {
    id: 'gd-1',
    name: 'Geometry Dash Lite',
    category: 'Action',
    description: 'Jump and fly through danger in this rhythm-based platformer.',
    icon: Zap,
    mathTopic: 'Velocity & Rhythm',
    url: 'https://geometrydashs.com/'
  },
  {
    id: '1v1-lol',
    name: '1v1.LOL',
    category: 'Action',
    description: 'Build and shoot in this competitive battle royale arena.',
    icon: Target,
    mathTopic: 'Spatial 3D Geometry',
    url: 'https://1v1-lol.github.io/'
  },
  {
    id: 'smash-karts',
    name: 'Smash Karts',
    category: 'Action',
    description: 'Battle with karts and weapons in a fast-paced arena.',
    icon: Car,
    mathTopic: 'Vector Collisions',
    url: 'https://smash-karts.github.io/'
  },
  {
    id: 'subway-surfers',
    name: 'Subway Surfers',
    category: 'Arcade',
    description: 'Run through the subway system and avoid obstacles.',
    icon: Activity,
    mathTopic: 'Kinematic Equations',
    url: 'https://subway-surfers.github.io/'
  },
  {
    id: 'retro-bowl',
    name: 'Retro Bowl',
    category: 'Sports',
    description: 'The perfect game for the armchair quarterback. Manage your team!',
    icon: Trophy,
    mathTopic: 'Statistical Management',
    url: 'https://retro-bowl.github.io/'
  },
  {
    id: 'slope',
    name: 'Slope',
    category: 'Action',
    description: 'Drive a ball down a steep slope and avoid obstacles.',
    icon: Activity,
    mathTopic: 'Angular Velocity',
    url: 'https://slopegame.online/'
  },
  {
    id: 'temple-run-2',
    name: 'Temple Run 2',
    category: 'Arcade',
    description: 'Run, jump, and slide to avoid dangerous traps and obstacles.',
    icon: Rocket,
    mathTopic: 'Obstacle Logic',
    url: 'https://temple-run-2.github.io/'
  },
  {
    id: 'moto-x3m',
    name: 'Moto X3M',
    category: 'Sports',
    description: 'Awesome bike racing with challenging levels and cool stunts.',
    icon: Zap,
    mathTopic: 'Torque & Trajectory',
    url: 'https://moto-x3m.github.io/'
  },
  {
    id: 'drift-hunters',
    name: 'Drift Hunters',
    category: 'Sports',
    description: 'A realistic drifting game with many cars and tracks.',
    icon: Car,
    mathTopic: 'Friction Coefficients',
    url: 'https://drift-hunters.github.io/'
  },
  {
    id: 'tunnel-rush',
    name: 'Tunnel Rush',
    category: 'Arcade',
    description: 'Race through tunnels at high speed, avoiding neon obstacles.',
    icon: Zap,
    mathTopic: 'Spatial Reflexes',
    url: 'https://tunnel-rush.github.io/'
  },
  {
    id: 'basketball-stars',
    name: 'Basketball Stars',
    category: 'Sports',
    description: 'Show your skills on the court and become a basketball legend.',
    icon: Volleyball,
    mathTopic: 'Physics & Projectiles',
    url: 'https://basketballstars.github.io/'
  },
  {
    id: '2048-cl',
    name: '2048',
    category: 'Puzzle',
    description: 'The original number puzzle. Merge tiles to reach 2048.',
    icon: Binary,
    mathTopic: 'Exponential Growth',
    url: 'https://play2048.co/'
  },
  {
    id: 'pacman-cl',
    name: 'Pac-Man',
    category: 'Arcade',
    description: 'The world-famous arcade classic. Eat pellets and avoid ghosts.',
    icon: Ghost,
    mathTopic: 'Heuristic Search',
    url: 'https://macek.github.io/google_pacman/'
  },
  {
    id: 'run-3',
    name: 'Run 3',
    category: 'Arcade',
    description: 'Run through a series of tunnels in space. Gravity is relative!',
    icon: Rocket,
    mathTopic: 'Axial Rotations',
    url: 'https://run-3.github.io/'
  },
  {
    id: 'paper-io-2',
    name: 'Paper.io 2',
    category: 'Strategy',
    description: 'Capture territory by drawing loops. Don\'t let others hit your tail!',
    icon: Globe,
    mathTopic: 'Area Coverage',
    url: 'https://paperio2.github.io/'
  },
  {
    id: 'hole-io',
    name: 'Hole.io',
    category: 'Strategy',
    description: 'Eat everything in the city as an ever-growing black hole.',
    icon: Target,
    mathTopic: 'Volume Scaling',
    url: 'https://hole-io.github.io/'
  },
  {
    id: 'agar-io',
    name: 'Agar.io',
    category: 'Strategy',
    description: 'Eat smaller cells and grow. Avoid being eaten by larger ones.',
    icon: Globe,
    mathTopic: 'Proportional Growth',
    url: 'https://agar-io.github.io/'
  },
  {
    id: 'slither-io',
    name: 'Slither.io',
    category: 'Strategy',
    description: 'Grow your snake and defeat other players in a massive arena.',
    icon: Activity,
    mathTopic: 'Pathfinding Logic',
    url: 'https://slither-io.github.io/'
  },
  {
    id: 'bitlife',
    name: 'BitLife',
    category: 'Relaxing',
    description: 'A complete life simulator. Make choices and see where you end up.',
    icon: Heart,
    mathTopic: 'Probability Life Path',
    url: 'https://bitlife.online/'
  },
  {
    id: 'worlds-hardest-game',
    name: 'World\'s Hardest Game',
    category: 'Puzzle',
    description: 'Can you finish the world\'s hardest game? Good luck!',
    icon: Shield,
    mathTopic: 'Coordination Theory',
    url: 'https://worlds-hardest-game.github.io/'
  },
  {
    id: 'crossy-road',
    name: 'Crossy Road',
    category: 'Arcade',
    description: 'Why did the chicken cross the road? Infinite hopping fun.',
    icon: Ghost,
    mathTopic: 'Safe Zone Prediction',
    url: 'https://crossy-road.github.io/'
  },
  {
    id: 'doodle-jump',
    name: 'Doodle Jump',
    category: 'Arcade',
    description: 'Jump as high as you can on platforms. Watch out for monsters!',
    icon: Rocket,
    mathTopic: 'Vertical Velocity',
    url: 'https://doodle-jump.github.io/'
  },
  {
    id: 'flappy-bird',
    name: 'Flappy Bird',
    category: 'Arcade',
    description: 'Flap your wings and avoid the pipes. The ultimate test of patience.',
    icon: Target,
    mathTopic: 'Impulse Physics',
    url: 'https://flappy-bird.github.io/'
  },
  {
    id: 'minesweeper-gh',
    name: 'Minesweeper',
    category: 'Strategy',
    description: 'Clear the board without triggering any mines.',
    icon: BarChart3,
    mathTopic: 'Probability Matrix',
    url: 'https://minesweeper-lite.github.io/'
  },
  {
    id: 'tetris',
    name: 'Tetris',
    category: 'Puzzle',
    description: 'The world\'s most famous puzzle game. Clear lines and score!',
    icon: Layers,
    mathTopic: 'Tessellation Strategy',
    url: 'https://tetris.github.io/'
  },
  {
    id: 'elastic-man',
    name: 'Elastic Man',
    category: 'Relaxing',
    description: 'Relax and pull on Morty\'s face. Satisfying physics!',
    icon: Smile,
    mathTopic: 'Vertex Deformation',
    url: 'https://elastic-man.github.io/'
  },
  {
    id: 'snow-rider-3d',
    name: 'Snow Rider 3D',
    category: 'Sports',
    description: 'Ride a sled and avoid obstacles to get the highest score.',
    icon: Truck,
    mathTopic: 'Inertia & Momentum',
    url: 'https://snow-rider-3d.github.io/'
  },
  {
    id: 'soccer-random',
    name: 'Soccer Random',
    category: 'Sports',
    description: 'Football with random physics. Hilarious and unpredictable!',
    icon: Volleyball,
    mathTopic: 'Chaotic Motion',
    url: 'https://soccer-random.github.io/'
  },
  {
    id: 'basketball-random',
    name: 'Basketball Random',
    category: 'Sports',
    description: 'Score hoops with crazy physics and weird characters.',
    icon: Volleyball,
    mathTopic: 'Unpredictable Arc',
    url: 'https://basketball-random.github.io/'
  },
  {
    id: 'fireboy-watergirl-1',
    name: 'Fireboy & Watergirl 1',
    category: 'Puzzle',
    description: 'Control two characters to solve puzzles in the Forest Temple.',
    icon: Flame,
    mathTopic: 'Cooperative Logic',
    url: 'https://fireboy-watergirl-1.github.io/'
  },
  {
    id: 'bob-the-robber-1',
    name: 'Bob the Robber',
    category: 'Strategy',
    description: 'Help Bob steal the treasures and avoid the guards.',
    icon: Ghost,
    mathTopic: 'Stealth Calculation',
    url: 'https://bob-the-robber-1.github.io/'
  },
  {
    id: 'funny-shooter-2',
    name: 'Funny Shooter 2',
    category: 'Action',
    description: 'Shoot funny-looking enemies in this colorful FPS.',
    icon: Target,
    mathTopic: 'Projectile Ballistics',
    url: 'https://funny-shooter-2.github.io/'
  },
  {
    id: 'shell-shockers',
    name: 'Shell Shockers',
    category: 'Action',
    description: 'The world\'s #1 egg-based shooter. Crack more eggs!',
    icon: Target,
    mathTopic: '3D Vector Aiming',
    url: 'https://shell-shockers.github.io/'
  },
  {
    id: 'little-alchemy',
    name: 'Little Alchemy',
    category: 'Puzzle',
    description: 'Combine elements to discover new items. Simple but addictive!',
    icon: Brain,
    mathTopic: 'Combinatorial Logic',
    url: 'https://little-alchemy.github.io/'
  },
  {
    id: 'cut-the-rope',
    name: 'Cut the Rope',
    category: 'Puzzle',
    description: 'Feed Om Nom candy by cutting ropes and using physics.',
    icon: Layers,
    mathTopic: 'Tension & Gravity',
    url: 'https://cuttherope.github.io/'
  },
  {
    id: 'rooftop-snipers',
    name: 'Rooftop Snipers',
    category: 'Action',
    description: 'Knock your opponent off the roof in this pixelated shooter.',
    icon: Target,
    mathTopic: 'Impulse & Reaction',
    url: 'https://rooftop-snipers.github.io/'
  },
  {
    id: 'getaway-shootout',
    name: 'Getaway Shootout',
    category: 'Action',
    description: 'Race to the getaway vehicle and blow up your friends!',
    icon: Target,
    mathTopic: 'Competitive Physics',
    url: 'https://getaway-shootout.github.io/'
  },
  {
    id: 'bloons-td-4',
    name: 'Bloons TD 4',
    category: 'Strategy',
    description: 'Defend your path from those pesky balloons with monkey towers.',
    icon: Shield,
    mathTopic: 'Resource Allocation',
    url: 'https://bloonstd4.github.io/'
  },
  {
    id: 'stack-game',
    name: 'Stack',
    category: 'Arcade',
    description: 'Stack the blocks as high as you can. Perfect timing needed.',
    icon: Layers,
    mathTopic: 'Vertical Alignment',
    url: 'https://stacker-game.github.io/'
  },
  {
    id: 'color-switch',
    name: 'Color Switch',
    category: 'Arcade',
    description: 'Match the ball\'s color with the obstacle to pass through.',
    icon: Palette,
    mathTopic: 'Symmetry & Timing',
    url: 'https://color-switch.github.io/'
  },
  {
    id: 'sonic-dash',
    name: 'Sonic Dash',
    category: 'Action',
    description: 'Run through stunning 3D environments with Sonic the Hedgehog.',
    icon: Zap,
    mathTopic: 'Continuous Motion',
    url: 'https://sonic-dash.github.io/'
  },
  {
    id: 'hill-climb-racing',
    name: 'Hill Climb Racing',
    category: 'Sports',
    description: 'Race uphill while managing fuel and car physics.',
    icon: Car,
    mathTopic: 'Friction & Torque',
    url: 'https://hill-climb-racing.github.io/'
  },
  {
    id: 'penalty-shooters-2',
    name: 'Penalty Shooters 2',
    category: 'Sports',
    description: 'Score goals and win the tournament in this penalty shootout.',
    icon: Volleyball,
    mathTopic: 'Angular Probability',
    url: 'https://penalty-shooters-2.github.io/'
  },
  {
    id: 'soccer-skills',
    name: 'Soccer Skills',
    category: 'Sports',
    description: 'A simple and fun soccer simulator with easy controls.',
    icon: Trophy,
    mathTopic: 'Movement Optimization',
    url: 'https://soccer-skills.github.io/'
  },
  {
    id: 'madalin-stunt-cars-2',
    name: 'Madalin Stunt Cars 2',
    category: 'Sports',
    description: 'Amazing stunt driving with high-end sports cars.',
    icon: Car,
    mathTopic: '3D Kinematics',
    url: 'https://madalin-stunt-cars-2.github.io/'
  },
  {
    id: 'bubble-shooter',
    name: 'Bubble Shooter',
    category: 'Puzzle',
    description: 'Shoot bubbles and match colors to clear the board.',
    icon: Target,
    mathTopic: 'Collision Reflection',
    url: 'https://bubble-shooter.github.io/'
  },
  {
    id: '8-ball-pool',
    name: '8 Ball Pool',
    category: 'Sports',
    description: 'The world\'s #1 pool game. Compete against others!',
    icon: Target,
    mathTopic: 'Reflection Angles',
    url: 'https://8-ball-pool.github.io/'
  },
  {
    id: 'snail-bob-1',
    name: 'Snail Bob',
    category: 'Puzzle',
    description: 'Help Snail Bob reach his house by solving physics puzzles.',
    icon: Puzzle,
    mathTopic: 'Sequential Planning',
    url: 'https://snail-bob-1.github.io/'
  },
  {
    id: 'wheely-1',
    name: 'Wheely',
    category: 'Puzzle',
    description: 'Join Wheely in his adventure and solve puzzles along the way.',
    icon: Car,
    mathTopic: 'Mechanical Logic',
    url: 'https://wheely-1.github.io/'
  },
  {
    id: 'adam-and-eve-1',
    name: 'Adam and Eve',
    category: 'Adventure',
    description: 'Help Adam find Eve in this classic point-and-click adventure.',
    icon: Map,
    mathTopic: 'Logical Sequencing',
    url: 'https://adam-and-eve-1.github.io/'
  },
  {
    id: 'trollface-quest-1',
    name: 'Trollface Quest',
    category: 'Puzzle',
    description: 'Think outside the box to solve these weird troll puzzles.',
    icon: Ghost,
    mathTopic: 'Intuition Analysis',
    url: 'https://trollface-quest-1.github.io/'
  },
  {
    id: 'fluid-simulation',
    name: 'Fluid Simulation',
    category: 'Relaxing',
    description: 'Play with beautiful fluid dynamics in your browser.',
    icon: Star,
    mathTopic: 'Navier-Stokes Flow',
    url: 'https://fluid-simulation.github.io/'
  },
  {
    id: 'blob-opera',
    name: 'Blob Opera',
    category: 'Relaxing',
    description: 'Create beautiful opera music with cute singing blobs.',
    icon: Music,
    mathTopic: 'Harmonic Synthesis',
    url: 'https://blob-opera.github.io/'
  },
  {
    id: 'cat-trap',
    name: 'Cat Trap',
    category: 'Puzzle',
    description: 'Trap the cat by blocking its path. Can you win?',
    icon: Ghost,
    mathTopic: 'Graph Connectivity',
    url: 'https://cat-trap.github.io/'
  },
  {
    id: 'pop-it',
    name: 'Pop It',
    category: 'Relaxing',
    description: 'The ultimate fidget toy simulation. Satisfying pops!',
    icon: Star,
    mathTopic: 'Taptic Feedback',
    url: 'https://pop-it.github.io/'
  },
  {
    id: 'sandspiel',
    name: 'Sandspiel',
    category: 'Relaxing',
    description: 'A falling sand physics sandbox. Experiment with elements.',
    icon: Palette,
    mathTopic: 'Cellular Automata',
    url: 'https://sandspiel.github.io/'
  },
  {
    id: 'townscaper',
    name: 'Townscaper',
    category: 'Relaxing',
    description: 'Build beautiful colorful towns on the ocean.',
    icon: Map,
    mathTopic: 'Procedural Generation',
    url: 'https://townscaper-web.github.io/'
  },
  {
    id: 'orbit-game',
    name: 'Orbit',
    category: 'Relaxing',
    description: 'Launch planets into orbit around black holes.',
    icon: Moon,
    mathTopic: 'Orbital Mechanics',
    url: 'https://orbit-game.github.io/'
  },
  {
    id: 'starry-night',
    name: 'Starry Night',
    category: 'Relaxing',
    description: 'Draw stars in the night sky and create constellations.',
    icon: Star,
    mathTopic: 'Constellation Mapping',
    url: 'https://starry-night.github.io/'
  },
  {
    id: 'solitaire',
    name: 'Solitaire',
    category: 'Puzzle',
    description: 'The classic card game. Sort them all out!',
    icon: Dices,
    mathTopic: 'Sorting Logic',
    url: 'https://solitaire-game.github.io/'
  },
  {
    id: 'mahjong',
    name: 'Mahjong',
    category: 'Puzzle',
    description: 'Match identical tiles to clear the board.',
    icon: Layers,
    mathTopic: 'Pattern Matching',
    url: 'https://mahjong-game.github.io/'
  },
  {
    id: 'sudoku',
    name: 'Sudoku',
    category: 'Puzzle',
    description: 'Fill the grid with numbers 1-9. Don\'t repeat!',
    icon: Binary,
    mathTopic: 'Constraint Satisfaction',
    url: 'https://sudoku-game.github.io/'
  }
];
