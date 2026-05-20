import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Volume2, VolumeX, RotateCcw } from 'lucide-react';

interface Particle {
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

interface FlameParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
}

export default function BasketballStars() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem('basketball_highscore') || '0', 10);
    } catch {
      return 0;
    }
  });
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isSwish, setIsSwish] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [alertText, setAlertText] = useState<'SWISH!' | 'FIRE!' | 'DOUBLE!' | 'PERFECT!' | null>(null);

  // Audio synthesis triggers
  const audioCtxRef = useRef<AudioContext | null>(null);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  const playSound = (type: 'bounce' | 'rim' | 'swish' | 'cheer' | 'buzzer') => {
    if (!soundEnabled) return;
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx || ctx.state === 'suspended') {
      // Try to resume if suspended
      ctx?.resume();
    }

    try {
      if (type === 'bounce') {
        const osc = ctx!.createOscillator();
        const gain = ctx!.createGain();
        osc.connect(gain);
        gain.connect(ctx!.destination);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, ctx!.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, ctx!.currentTime + 0.15);

        gain.gain.setValueAtTime(0.3, ctx!.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx!.currentTime + 0.15);

        osc.start();
        osc.stop(ctx!.currentTime + 0.15);
      } else if (type === 'rim') {
        // Metallic clank high frequency + low echo
        const osc1 = ctx!.createOscillator();
        const osc2 = ctx!.createOscillator();
        const gain = ctx!.createGain();

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx!.destination);

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(880, ctx!.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(400, ctx!.currentTime + 0.1);

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(650, ctx!.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(100, ctx!.currentTime + 0.2);

        gain.gain.setValueAtTime(0.4, ctx!.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx!.currentTime + 0.2);

        osc1.start();
        osc2.start();
        osc1.stop(ctx!.currentTime + 0.2);
        osc2.stop(ctx!.currentTime + 0.2);
      } else if (type === 'swish') {
        // High frequency filtered noise / friction swipe
        const bufferSize = ctx!.sampleRate * 0.25; // 0.25 seconds
        const buffer = ctx!.createBuffer(1, bufferSize, ctx!.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx!.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx!.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1200, ctx!.currentTime);
        filter.frequency.exponentialRampToValueAtTime(400, ctx!.currentTime + 0.2);
        filter.Q.setValueAtTime(3, ctx!.currentTime);

        const gain = ctx!.createGain();
        gain.gain.setValueAtTime(0, ctx!.currentTime);
        gain.gain.linearRampToValueAtTime(0.5, ctx!.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx!.currentTime + 0.25);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx!.destination);

        noise.start();
        noise.stop(ctx!.currentTime + 0.25);
      } else if (type === 'cheer') {
        // Celebratory synthesized arcade chords
        const notes = [261.63, 329.63, 392.00, 523.25]; // C major chord triad
        notes.forEach((freq, idx) => {
          const osc = ctx!.createOscillator();
          const gain = ctx!.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, ctx!.currentTime + idx * 0.03);
          osc.connect(gain);
          gain.connect(ctx!.destination);

          gain.gain.setValueAtTime(0, ctx!.currentTime);
          gain.gain.linearRampToValueAtTime(0.12, ctx!.currentTime + idx * 0.03 + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx!.currentTime + idx * 0.03 + 0.5);

          osc.start(ctx!.currentTime + idx * 0.03);
          osc.stop(ctx!.currentTime + idx * 0.03 + 0.52);
        });
      } else if (type === 'buzzer') {
        const osc = ctx!.createOscillator();
        const gain = ctx!.createGain();
        osc.connect(gain);
        gain.connect(ctx!.destination);

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(90, ctx!.currentTime);
        osc.frequency.linearRampToValueAtTime(80, ctx!.currentTime + 0.8);

        gain.gain.setValueAtTime(0.3, ctx!.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, ctx!.currentTime + 0.8);

        osc.start();
        osc.stop(ctx!.currentTime + 0.8);
      }
    } catch (e) {
      console.warn('Audio synthesis failed (interacted state check):', e);
    }
  };

  // Start game sequence
  const startGame = () => {
    initAudio();
    setScore(0);
    setStreak(0);
    setTimeLeft(60);
    setGameState('playing');
  };

  // Timer hook
  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameState('gameover');
          playSound('buzzer');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  // Game Engine & Physics Hook
  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const canvasWidth = 800;
    const canvasHeight = 500;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Physics constants
    const gravity = 0.35;
    const friction = 0.992;
    const bounceLoss = 0.72; // bounce on ground
    const backboardElasticity = 0.65;
    const rimElasticity = 0.6;

    // Interactive Court Objects configurations
    // Hoop and rim definitions
    const backboard = {
      x: 710,
      y: 100,
      width: 12,
      height: 90
    };

    const hoopY = 160;
    const rimLeft = 645;
    const rimRight = 700;
    const rimRadius = 4; // structural collision circle radius
    const rimCenterY = hoopY;

    // Moving hoop parameters (for higher scoring stages)
    let hoopDir = 1;
    let hoopOffset = { x: 0, y: 0 };
    let currentHoopX = rimLeft;

    // Interactive net physics points (spring mesh net)
    interface NetNode {
      x: number;
      y: number;
      ox: number; // original relative x
      oy: number; // original relative y
      vx: number;
      vy: number;
    }

    const netNodes: NetNode[][] = [];
    const netRows = 5;
    const netCols = 5;

    for (let r = 0; r < netRows; r++) {
      const row: NetNode[] = [];
      const distPercent = r / (netRows - 1);
      const width = (rimRight - rimLeft) * (1 - distPercent * 0.32);
      const leftBound = rimLeft + (rimRight - rimLeft) * (distPercent * 0.16);

      for (let c = 0; c < netCols; c++) {
        const xVal = leftBound + (width * c) / (netCols - 1);
        const yVal = hoopY + r * 14;
        row.push({
          x: xVal,
          y: yVal,
          ox: xVal,
          oy: yVal,
          vx: 0,
          vy: 0
        });
      }
      netNodes.push(row);
    }

    // Ball state management
    let ball = {
      x: 180,
      y: 350,
      vx: 0,
      vy: 0,
      radius: 17,
      angle: 0,
      va: 0, // angular velocity
      onGround: false,
      isAirborne: false,
      isHeld: false,
      touchedBackboardOrRim: false,
      scoredThisShot: false,
      lastY: 350,
      spotProgress: 0
    };

    // Rack / Shoot Spots
    // We dynamically move the spawn spot of the player when they score
    const spawnSpots = [
      { x: 160, y: 340, text: 'LEFT COURT' },
      { x: 260, y: 360, text: 'MID RANGE' },
      { x: 120, y: 310, text: 'FAR CENTER' },
      { x: 320, y: 390, text: 'CLOSE RANGE' },
      { x: 100, y: 280, text: '3-POINT ZONE' }
    ];
    let currentSpotIndex = 0;

    const resetBallState = (delay = 1000) => {
      setTimeout(() => {
        // Determine spot based on score streak or achievements
        currentSpotIndex = (currentSpotIndex + 1) % spawnSpots.length;
        const targetSpot = spawnSpots[currentSpotIndex];

        ball.x = targetSpot.x;
        ball.y = targetSpot.y;
        ball.vx = 0;
        ball.vy = 0;
        ball.va = 0;
        ball.angle = 0;
        ball.isAirborne = false;
        ball.isHeld = false;
        ball.touchedBackboardOrRim = false;
        ball.scoredThisShot = false;
      }, delay);
    };

    // Interactive Drag to Throw variables
    let dragStart = { x: 0, y: 0 };
    let dragCurrent = { x: 0, y: 0 };

    // FX and juicy visual collections
    let particles: Particle[] = [];
    let fireParticles: FlameParticle[] = [];
    let screenShake = 0;
    let hoopBounceY = 0; // shaking displacement on score / rim bang

    const createExplosion = (x: number, y: number, color: string, count = 20) => {
      for (let i = 0; i < count; i++) {
        const speed = Math.random() * 5 + 2;
        const angle = Math.random() * Math.PI * 2;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1,
          color,
          size: Math.random() * 4 + 2,
          alpha: 1,
          life: 0,
          maxLife: 40 + Math.random() * 20
        });
      }
    };

    const runAimTrajectory = () => {
      if (!ball.isHeld) return [];
      const trajPoints = [];
      const powerMultiplier = 0.082;
      const t_vx = (dragStart.x - dragCurrent.x) * powerMultiplier;
      const t_vy = (dragStart.y - dragCurrent.y) * powerMultiplier;

      let tempX = ball.x;
      let tempY = ball.y;
      let tempVy = t_vy;
      const trajectorySteps = 30;

      for (let i = 0; i < trajectorySteps; i++) {
        tempX += t_vx;
        tempVy += gravity;
        tempY += tempVy;
        if (tempX > canvasWidth || tempY > canvasHeight || tempX < 0) break;
        trajPoints.push({ x: tempX, y: tempY });
      }
      return trajPoints;
    };

    // Mouse & Touch interactions
    const getClampedMousePos = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;
      // Convert to virtual system canvas coordinate space
      return {
        x: (clientX / rect.width) * canvasWidth,
        y: (clientY / rect.height) * canvasHeight
      };
    };

    const getClampedTouchPos = (e: TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (!e.touches[0]) return null;
      const clientX = e.touches[0].clientX - rect.left;
      const clientY = e.touches[0].clientY - rect.top;
      return {
        x: (clientX / rect.width) * canvasWidth,
        y: (clientY / rect.height) * canvasHeight
      };
    };

    const onStartDrag = (localX: number, localY: number) => {
      if (ball.isAirborne) return;
      const dx = localX - ball.x;
      const dy = localY - ball.y;
      // Relax boundary checks to make it highly receptive
      if (Math.hypot(dx, dy) < 45) {
        ball.isHeld = true;
        dragStart = { x: ball.x, y: ball.y };
        dragCurrent = { x: localX, y: localY };
      }
    };

    const onMoveDrag = (localX: number, localY: number) => {
      if (ball.isHeld) {
        // Prevent extremely long drags past virtual screen
        const maxDragDist = 180;
        const dx = localX - dragStart.x;
        const dy = localY - dragStart.y;
        const dist = Math.hypot(dx, dy);

        if (dist > maxDragDist) {
          const ratio = maxDragDist / dist;
          dragCurrent = {
            x: dragStart.x + dx * ratio,
            y: dragStart.y + dy * ratio
          };
        } else {
          dragCurrent = { x: localX, y: localY };
        }
      }
    };

    const onReleaseDrag = () => {
      if (ball.isHeld) {
        ball.isHeld = false;
        const powerMultiplier = 0.082;
        const throwVx = (dragStart.x - dragCurrent.x) * powerMultiplier;
        const throwVy = (dragStart.y - dragCurrent.y) * powerMultiplier;

        // Require minimum momentum to prevent accidental dropping
        if (Math.hypot(throwVx, throwVy) > 1.2) {
          ball.vx = throwVx;
          ball.vy = throwVy;
          ball.isAirborne = true;
          ball.va = throwVx * 0.05; // ball spin matches its throw speed!
        }
      }
    };

    // Setup interactive event listeners
    const handleMouseDown = (e: MouseEvent) => {
      initAudio();
      const pos = getClampedMousePos(e);
      onStartDrag(pos.x, pos.y);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const pos = getClampedMousePos(e);
      onMoveDrag(pos.x, pos.y);
    };

    const handleMouseUp = () => {
      onReleaseDrag();
    };

    const handleTouchStart = (e: TouchEvent) => {
      initAudio();
      const pos = getClampedTouchPos(e);
      if (pos) onStartDrag(pos.x, pos.y);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const pos = getClampedTouchPos(e);
      if (pos) onMoveDrag(pos.x, pos.y);
    };

    const handleTouchEnd = () => {
      onReleaseDrag();
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    canvas.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);


    // Dynamic Hoop Motion logic
    // Increases difficulty with higher score ranges
    const applyHoopMovement = () => {
      if (score >= 40) {
        hoopOffset.y = Math.sin(Date.now() / 350) * 15;
      }
      if (score >= 80) {
        hoopOffset.x = Math.sin(Date.now() / 500) * 25;
      }
    };

    // Engine Main loop
    const tick = () => {
      animId = requestAnimationFrame(tick);

      // Apply dynamic movements to hoop
      applyHoopMovement();

      // Clear Canvas styled beautifully with arcade aesthetics
      ctx.fillStyle = '#0b0f19';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Apply shake and camera offset if active
      ctx.save();
      if (screenShake > 0.1) {
        const sx = (Math.random() - 0.5) * screenShake;
        const sy = (Math.random() - 0.5) * screenShake;
        ctx.translate(sx, sy);
        screenShake *= 0.88; // decay
      }

      // Draw shiny background graphics: digital cyber aesthetic grid
      ctx.strokeStyle = '#13192b';
      ctx.lineWidth = 1.5;
      for (let cy = 0; cy < canvasHeight; cy += 40) {
        ctx.beginPath();
        ctx.moveTo(0, cy);
        ctx.lineTo(canvasWidth, cy);
        ctx.stroke();
      }
      for (let cx = 0; cx < canvasWidth; cx += 40) {
        ctx.beginPath();
        ctx.moveTo(cx, 0);
        ctx.lineTo(cx, canvasHeight);
        ctx.stroke();
      }

      // Draw dynamic court lines
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.1)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      // Three-point arc
      ctx.arc(0, canvasHeight, 350, -Math.PI / 2, 0);
      ctx.stroke();

      // Paint keys/zones
      ctx.fillStyle = 'rgba(7, 89, 133, 0.05)';
      ctx.fillRect(0, canvasHeight - 120, 150, 120);

      // Rim back / Backboard poles before the ball layer
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 6;
      ctx.beginPath();
      // Backboard support pole
      ctx.moveTo(760, canvasHeight);
      ctx.lineTo(760, backboard.y + backboard.height + 20);
      ctx.lineTo(backboard.x + backboard.width, backboard.y + backboard.height / 2 + 10);
      ctx.stroke();

      // Draw Backboard glass glow outline
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#0EA5E9';
      ctx.strokeStyle = '#0EA5E9';
      ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
      ctx.lineWidth = 3;
      const bX = backboard.x + hoopOffset.x;
      const bY = backboard.y + hoopOffset.y;
      ctx.fillRect(bX, bY, backboard.width, backboard.height + 10);
      ctx.strokeRect(bX, bY, backboard.width, backboard.height + 10);

      const rLeft = rimLeft + hoopOffset.x;
      const rRight = rimRight + hoopOffset.x;
      const rY = hoopY + hoopOffset.y + hoopBounceY;

      // Render the trajectory prediction curve if user is aiming
      if (ball.isHeld) {
        const points = runAimTrajectory();
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.55)';
        ctx.lineWidth = 3.5;
        ctx.setLineDash([5, 8]);
        ctx.beginPath();
        points.forEach((pt, i) => {
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.stroke();
        ctx.setLineDash([]); // clear dash

        // Draw aiming ring under ball
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#e11d48';
        ctx.beginPath();
        ctx.arc(dragStart.x, dragStart.y, ball.radius * 1.5, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(225, 29, 72, 0.4)';
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Physics processing on ball
      if (ball.isAirborne) {
        ball.vy += gravity;
        ball.vx *= friction;
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Apply dynamic basketball spinning angle
        ball.angle += ball.va;
        ball.va *= 0.99; // rotary coefficient dampening

        // Wall collisions
        if (ball.x - ball.radius < 0) {
          ball.x = ball.radius;
          ball.vx = -ball.vx * bounceLoss;
          ball.va *= -1;
          playSound('bounce');
        }

        // Floor collision
        if (ball.y + ball.radius > canvasHeight - 30) {
          ball.y = canvasHeight - 30 - ball.radius;
          ball.vy = -ball.vy * bounceLoss;
          ball.vx *= 0.85; // roll friction
          ball.va = ball.vx * 0.1;
          if (Math.abs(ball.vy) > 1.2) {
            playSound('bounce');
            screenShake = Math.max(screenShake, Math.min(6, Math.abs(ball.vy) * 0.45));
          } else {
            // Once the ball slows down, reset back to hands for the next attempt
            ball.vy = 0;
            resetBallState(1100);
          }
        }

        // --- STAGE 1: COLLISION WITH BACKBOARD ---
        const bXOffset = backboard.x + hoopOffset.x;
        const bYOffset = backboard.y + hoopOffset.y;
        if (
          ball.x + ball.radius > bXOffset &&
          ball.x - ball.radius < bXOffset + backboard.width &&
          ball.y + ball.radius > bYOffset &&
          ball.y - ball.radius < bYOffset + backboard.height + 15
        ) {
          // Determine side of collision
          if (ball.x < bXOffset) {
            ball.x = bXOffset - ball.radius;
            ball.vx = -Math.abs(ball.vx) * backboardElasticity;
          } else {
            ball.x = bXOffset + backboard.width + ball.radius;
            ball.vx = Math.abs(ball.vx) * backboardElasticity;
          }
          ball.touchedBackboardOrRim = true;
          ball.va += ball.vy * 0.05; // redirect torque rotational impulse
          playSound('rim');
          screenShake = Math.max(screenShake, 3);
          hoopBounceY = 8; // push hoop down a brief instant
        }

        // --- STAGE 2: COLLISION WITH RIM LOOPS (Elastic Circle-Circle Physics) ---
        // Rim can bounce left point and right point
        const rimPoints = [
          { x: rLeft, y: rY },
          { x: rRight, y: rY }
        ];

        rimPoints.forEach(pt => {
          const dx = ball.x - pt.x;
          const dy = ball.y - pt.y;
          const dist = Math.hypot(dx, dy);
          if (dist < ball.radius + rimRadius) {
            // Circle collision normal resolution
            const nx = dx / dist;
            const ny = dy / dist;

            // Push ball out of intersection
            ball.x = pt.x + nx * (ball.radius + rimRadius);
            ball.y = pt.y + ny * (ball.radius + rimRadius);

            // Calculate relative elastic velocity projections
            const dotProduct = ball.vx * nx + ball.vy * ny;
            ball.vx = (ball.vx - 2 * dotProduct * nx) * rimElasticity;
            ball.vy = (ball.vy - 2 * dotProduct * ny) * rimElasticity;

            // Apply slight torque
            ball.va += (nx * ball.vy - ny * ball.vx) * 0.08;

            ball.touchedBackboardOrRim = true;
            playSound('rim');
            screenShake = Math.max(screenShake, 4.2);
            hoopBounceY = 6;
          }
        });

        // --- STAGE 3: BASKET NET SCORE DETECTION ---
        // Detect ball passing through the cylinder inside correct bound coordinates
        if (!ball.scoredThisShot && ball.vy > 0 && ball.lastY < rY && ball.y >= rY) {
          if (ball.x > rLeft && ball.x < rRight) {
            // Scored a proper point!
            ball.scoredThisShot = true;
            
            // Check if it's a magnificent Swish score
            const isCleanSwish = !ball.touchedBackboardOrRim;

            // Apply screen reactions
            screenShake = Math.max(screenShake, isCleanSwish ? 10 : 6);
            hoopBounceY = 16; // drop down on hoop weight load

            // Confetti and score trigger
            createExplosion((rLeft + rRight) / 2, rY + 15, isCleanSwish ? '#10B981' : '#F59E0B', 32);
            playSound('swish');
            playSound('cheer');

            // Streak computations
            setStreak(prev => {
              const nextStreak = prev + 1;
              let ptGained = 10;
              let note: typeof alertText = 'SWISH!';

              if (isCleanSwish) {
                ptGained += 15;
                note = 'SWISH!';
              }

              if (nextStreak >= 3) {
                ptGained += 20;
                note = 'FIRE!';
              }

              setScore(s => s + ptGained);
              setAlertText(note);
              setTimeout(() => setAlertText(null), 1500);

              return nextStreak;
            });

            // Ripple forces to the interactive net strings
            netNodes.forEach((row, ri) => {
              row.forEach(node => {
                const force = (netRows - ri) * 1.8;
                node.vx += (Math.random() - 0.5) * 8;
                node.vy += force + Math.random() * 4;
              });
            });

            // Re-allocate ball rack spot
            resetBallState(1400);
          }
        }
      }

      ball.lastY = ball.y;

      // Net Strings physics simulation
      for (let r = 0; r < netRows; r++) {
        for (let c = 0; c < netCols; c++) {
          const node = netNodes[r][c];

          // Compute anchor references
          const ancPerc = c / (netCols - 1);
          const width = (rRight - rLeft) * (1 - (r / (netRows - 1)) * 0.32);
          const leftBound = rLeft + (rRight - rLeft) * ((r / (netRows - 1)) * 0.16);
          const targetAnchorX = leftBound + width * ancPerc;
          const targetAnchorY = hoopY + r * 14 + hoopOffset.y + hoopBounceY;

          if (r === 0) {
            // Anchor row is snapped directly to moving rim coordinates
            node.x = targetAnchorX;
            node.y = targetAnchorY;
          } else {
            // Physics nodes pulled by gravity & spring back to target configurations
            node.vy += 0.22; // local net weight
            node.vx += (node.ox - node.x) * 0.081; // structure memory

            // Pull node to correct grid position
            const parent = netNodes[r - 1][c];
            const dx = node.x - parent.x;
            const dy = node.y - parent.y;
            const len = Math.hypot(dx, dy);
            const targetLength = 11;
            if (len > 0.1) {
              const diff = targetLength - len;
              const px = (dx / len) * diff * 0.45;
              const py = (dy / len) * diff * 0.45;
              node.vx += px;
              node.vy += py;
            }

            // Ball overlap pushing net outwards
            if (ball.isAirborne) {
              const bNetDx = node.x - ball.x;
              const bNetDy = node.y - ball.y;
              const bNetDist = Math.hypot(bNetDx, bNetDy);
              if (bNetDist < ball.radius) {
                const diff = ball.radius - bNetDist;
                node.vx += (bNetDx / bNetDist) * diff * 0.8;
                node.vy += (bNetDy / bNetDist) * diff * 0.8;
              }
            }

            // Friction drag on thread
            node.vx *= 0.85;
            node.vy *= 0.85;

            node.x += node.vx;
            node.y += node.vy;
          }
        }
      }

      // Restore hoop bounce vibration
      hoopBounceY *= 0.83;

      // Generate colorful custom flame tail when user scores streaks: visual 🔥 state
      if (streak >= 3 && ball.isAirborne && !ball.onGround) {
        for (let fi = 0; fi < 3; fi++) {
          fireParticles.push({
            x: ball.x + (Math.random() - 0.5) * ball.radius,
            y: ball.y + (Math.random() - 0.5) * ball.radius,
            vx: -ball.vx * 0.2 + (Math.random() - 0.5) * 2,
            vy: -ball.vy * 0.2 - Math.random() * 2,
            size: Math.random() * 10 + 5,
            alpha: 1.0,
            color: Math.random() > 0.4 ? '#ef4444' : '#f97316'
          });
        }
      }

      // Draw active flame trails
      fireParticles.forEach((fp, index) => {
        fp.x += fp.vx;
        fp.y += fp.vy;
        fp.size *= 0.94;
        fp.alpha -= 0.04;
        if (fp.alpha <= 0 || fp.size < 1) {
          fireParticles.splice(index, 1);
        } else {
          ctx.save();
          ctx.globalAlpha = fp.alpha;
          ctx.fillStyle = fp.color;
          ctx.shadowBlur = fp.size;
          ctx.shadowColor = fp.color;
          ctx.beginPath();
          ctx.arc(fp.x, fp.y, fp.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });

      // Render standard particle bursts
      particles.forEach((p, index) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.04; // gravity bias
        p.alpha = 1 - p.life / p.maxLife;
        p.life++;

        if (p.life >= p.maxLife) {
          particles.splice(index, 1);
        } else {
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.fillRect(p.x, p.y, p.size, p.size);
          ctx.restore();
        }
      });

      // Draw the beautiful basket net mesh strings
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2.2;
      for (let r = 0; r < netRows; r++) {
        // Draw horizontal ring threads
        ctx.beginPath();
        for (let c = 0; c < netCols; c++) {
          const node = netNodes[r][c];
          if (c === 0) ctx.moveTo(node.x, node.y);
          else ctx.lineTo(node.x, node.y);
        }
        ctx.stroke();
      }

      // Draw vertical net threads
      ctx.strokeStyle = '#cbd5e1';
      for (let c = 0; c < netCols; c++) {
        ctx.beginPath();
        for (let r = 0; r < netRows; r++) {
          const node = netNodes[r][c];
          if (r === 0) ctx.moveTo(node.x, node.y);
          else ctx.lineTo(node.x, node.y);
        }
        ctx.stroke();
      }

      // Draw the rim metal hoops after the net strings
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 5.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(rLeft, rY);
      ctx.lineTo(rRight, rY);
      ctx.stroke();

      // Rim front loops metallic gloss
      ctx.strokeStyle = '#ea580c';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(rLeft + 2, rY + 1.5);
      ctx.lineTo(rRight - 2, rY + 1.5);
      ctx.stroke();

      // Render the glowing Orange Basketball
      ctx.save();
      // Translate to center sphere
      ctx.translate(ball.x, ball.y);
      ctx.rotate(ball.angle);

      // Sphere base coloring
      const gradient = ctx.createRadialGradient(-5, -5, 2, 0, 0, ball.radius);
      gradient.addColorStop(0, '#fdba74'); // highlight sheen Warm Orange
      gradient.addColorStop(0.7, '#f97316'); // main core base
      gradient.addColorStop(1, '#c2410c'); // darker boundary shadow

      ctx.fillStyle = gradient;
      ctx.shadowBlur = streak >= 3 ? 24 : 6;
      ctx.shadowColor = streak >= 3 ? '#ef4444' : '#ea580c';

      ctx.beginPath();
      // Outer border circle
      ctx.arc(0, 0, ball.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw curved seam lines on basketball (essential for 3D realism!)
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.72)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      // Mid horizontal rib
      ctx.moveTo(-ball.radius, 0);
      ctx.lineTo(ball.radius, 0);
      // Mid vertical rib
      ctx.moveTo(0, -ball.radius);
      ctx.lineTo(0, ball.radius);
      // Standard curved ribs
      ctx.arc(-ball.radius, 0, ball.radius * 0.9, -Math.PI / 3, Math.PI / 3);
      ctx.arc(ball.radius, 0, ball.radius * 0.9, Math.PI * 0.65, Math.PI * 1.35);
      ctx.stroke();

      ctx.restore();

      // Floor ground shadow
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.beginPath();
      const shadowW = ball.radius * (1 + (canvasHeight - 30 - ball.y) / 100);
      ctx.ellipse(ball.x, canvasHeight - 25, shadowW, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Floor border platform drawing
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, canvasHeight - 20, canvasWidth, 20);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, canvasHeight - 12, canvasWidth, 12);

      // Spot indicator on arcade screen
      const currentSpot = spawnSpots[currentSpotIndex];
      ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.beginPath();
      ctx.ellipse(currentSpot.x, canvasHeight - 25, 25, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#0ea5e9';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(currentSpot.text, currentSpot.x, canvasHeight - 38);

      ctx.restore();
    };

    tick();

    // Resize Observer to match coordinate responsiveness
    const resizeHandler = () => {
      const parent = containerRef.current;
      if (parent && canvas) {
        // Keeps aspect coordinates consistent
        const rect = parent.getBoundingClientRect();
        canvas.style.width = '100%';
        canvas.style.height = '100%';
      }
    };

    window.addEventListener('resize', resizeHandler);
    resizeHandler();

    // Cleanups
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resizeHandler);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [gameState, score]);

  // Sync and save local highscore milestones
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      try {
        localStorage.setItem('basketball_highscore', score.toString());
      } catch (err) {
        console.warn('Could not save highscore to storage:', err);
      }
    }
  }, [score, highScore]);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full bg-[#0a0f1d] flex flex-col items-center justify-center relative font-mono select-none overflow-hidden"
    >
      {/* Game Header HUD overlay */}
      <div className="absolute top-4 left-6 right-6 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex gap-6">
          <div className="bg-slate-950/80 backdrop-blur-md px-4 py-2 border border-sky-500/20 rounded-xl leading-none">
            <span className="text-[10px] text-sky-400 font-black block tracking-widest uppercase mb-1">SCORE</span>
            <span className="text-2xl text-white font-black italic">{score}</span>
          </div>
          <div className="bg-slate-950/80 backdrop-blur-md px-4 py-2 border border-sky-500/20 rounded-xl leading-none">
            <span className="text-[10px] text-sky-400 font-black block tracking-widest uppercase mb-1">STREAK</span>
            <span className="text-2xl text-rose-500 font-black flex items-center gap-1 leading-none italic">
              {streak}
              {streak >= 3 && <motion.span animate={{ scale: [1, 1.25, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="text-amber-500 text-sm">🔥</motion.span>}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-slate-950/80 backdrop-blur-md px-4 py-2 border border-sky-500/20 rounded-xl leading-none flex flex-col items-center">
            <span className="text-[10px] text-sky-400 font-black tracking-widest uppercase mb-1">TIME LEFT</span>
            <span className={`text-2xl font-black italic ${timeLeft < 15 ? 'text-rose-500 animate-pulse' : 'text-emerald-400'}`}>
              {timeLeft}s
            </span>
          </div>

          <div className="bg-slate-950/80 backdrop-blur-md px-4 py-2 border border-sky-500/20 rounded-xl leading-none hidden md:flex flex-col items-end">
            <span className="text-[10px] text-sky-400 font-black tracking-widest uppercase mb-2">TOP RECORD</span>
            <span className="text-md text-amber-400 font-black italic flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-500 inline-block" /> {highScore}
            </span>
          </div>

          {/* Interactive Volume Toggle (pointer-events-auto to bypass pointer-events-none parent) */}
          <button 
            onClick={() => setSoundEnabled(prev => !prev)}
            className="pointer-events-auto p-3.5 bg-slate-950/80 border border-sky-500/20 rounded-xl hover:bg-sky-500/10 transition-all text-sky-400/80 hover:text-sky-300"
            title="Toggle SFX Synth"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main viewport canvas */}
      <canvas 
        ref={canvasRef} 
        style={{ width: '100%', height: '100%', display: 'block' }}
        className="w-full h-full cursor-crosshair relative z-0" 
      />

      {/* Floating Perfect/Consecutive Streak alerts */}
      <AnimatePresence>
        {alertText && (
          <motion.div
            initial={{ scale: 0.3, opacity: 0, y: 100 }}
            animate={{ scale: 1.3, opacity: 1, y: 20 }}
            exit={{ scale: 1.5, opacity: 0, y: -80 }}
            transition={{ type: 'spring', damping: 10 }}
            className={`absolute z-20 top-28 font-black text-4xl tracking-tighter uppercase px-6 py-2 rounded-2xl italic shadow-2xl ${
              alertText === 'SWISH!' ? 'text-emerald-400 bg-emerald-950/90 border border-emerald-400/30' :
              alertText === 'FIRE!' ? 'text-amber-500 bg-red-950/90 border border-red-500/30 font-black tracking-widest animate-bounce' :
              'text-rose-400 bg-slate-950/95 border border-rose-500/30'
            }`}
          >
            {alertText}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlays for idle / gameover */}
      {gameState === 'idle' && (
        <div className="absolute inset-0 bg-slate-980/95 backdrop-blur-md flex items-center justify-center p-8 z-30 font-mono">
          <div className="max-w-md w-full bg-slate-950/85 border border-sky-500/25 p-8 rounded-[2rem] text-center shadow-[0_0_50px_rgba(14,165,233,0.15)] relative">
            <div className="w-20 h-20 bg-sky-500/10 rounded-3xl border border-sky-500/30 flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-10 h-10 text-sky-500 animate-pulse" />
            </div>

            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-emerald-300 to-sky-500 mb-2 uppercase tracking-tighter italic">
              BASKETBALL STARS
            </h2>
            <div className="text-[10px] text-sky-500 font-extrabold tracking-[0.2em] mb-6 uppercase">
              HIGH FIDELITY COURT SIMULATION
            </div>

            <p className="text-slate-400 text-xs font-medium leading-relaxed mb-8 uppercase tracking-wider">
              Drag back or throw the ball from the glow spots to release high trajectory arcs. Master rim bounces and streak consecutive swishes for colossal multipliers!
            </p>

            <button
              onClick={startGame}
              className="w-full py-4 bg-sky-600 hover:bg-sky-500 text-white font-black uppercase rounded-2xl transition-all tracking-[0.1em] shadow-[0_4px_24px_rgba(14,165,233,0.3)] active:scale-95 border border-sky-400/20"
            >
              INITIALIZE WARMUP
            </button>
          </div>
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="absolute inset-0 bg-slate-980/95 backdrop-blur-md flex items-center justify-center p-8 z-30 font-mono">
          <div className="max-w-md w-full bg-slate-950/85 border border-rose-500/20 p-8 rounded-[2rem] text-center shadow-[0_0_50px_rgba(244,63,94,0.1)]">
            <h2 className="text-4xl font-black text-rose-500 mb-2 uppercase tracking-tight italic">
              SESSION TIMEOUT
            </h2>
            <div className="text-[10px] text-rose-400 font-extrabold tracking-[0.2em] mb-8 uppercase">
              ARCADE STAGE SHUTDOWN
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                <div className="text-[9px] text-slate-500 font-black tracking-widest uppercase mb-1">TOTAL POINTS</div>
                <div className="text-2xl text-white font-black italic">{score}</div>
              </div>
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                <div className="text-[9px] text-slate-500 font-black tracking-widest uppercase mb-1">ALL-TIME BEST</div>
                <div className="text-2xl text-amber-400 font-black italic">{highScore}</div>
              </div>
            </div>

            <button
              onClick={startGame}
              className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white font-black uppercase rounded-2xl transition-all tracking-[0.1em] shadow-[0_4px_24px_rgba(225,29,72,0.3)] active:scale-95 border border-rose-400/20 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              RE-ENGAGE SYSTEM
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
