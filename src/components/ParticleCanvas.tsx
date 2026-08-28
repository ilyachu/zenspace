import React, { useEffect, useRef } from 'react';

export type AmbientTheme = 'fire' | 'night' | 'rain' | 'ocean' | 'wind' | 'neutral';

interface ParticleCanvasProps {
  theme?: AmbientTheme;
  isRunning?: boolean;
  breathScale?: number;
}

interface Particle {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  baseSpeed: number;
  alpha: number;
  baseAlpha: number;
  color: string;
  twinkleSpeed: number;
  twinklePhase: number;
  swaySpeed: number;
  swayOffset: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
  speed: number;
}

const THEME_CONFIGS: Record<AmbientTheme, {
  glowCenter: string;
  glowMid: string;
  particles: string[];
  dirY: number;
  dirX: number;
  speedMultiplier: number;
  swayAmp: number;
}> = {
  fire: {
    glowCenter: 'rgba(249, 115, 22, 0.12)',
    glowMid: 'rgba(245, 158, 11, 0.04)',
    particles: ['#fbbf24', '#f97316', '#fdba74', '#fed7aa', '#fde68a'],
    dirY: -1,
    dirX: 0.1,
    speedMultiplier: 0.22,
    swayAmp: 0.35
  },
  night: {
    glowCenter: 'rgba(99, 102, 241, 0.10)',
    glowMid: 'rgba(129, 140, 248, 0.03)',
    particles: ['#c7d2fe', '#818cf8', '#a5b4fc', '#e0e7ff', '#38bdf8', '#ffffff'],
    dirY: -0.05,
    dirX: 0.02,
    speedMultiplier: 0.12,
    swayAmp: 0.18
  },
  rain: {
    glowCenter: 'rgba(14, 165, 233, 0.10)',
    glowMid: 'rgba(56, 189, 248, 0.03)',
    particles: ['#38bdf8', '#7dd3fc', '#bae6fd', '#93c5fd', '#67e8f9'],
    dirY: 0.65,
    dirX: 0.05,
    speedMultiplier: 0.35,
    swayAmp: 0.12
  },
  ocean: {
    glowCenter: 'rgba(20, 184, 166, 0.11)',
    glowMid: 'rgba(45, 212, 191, 0.03)',
    particles: ['#2dd4bf', '#5eead4', '#38bdf8', '#99f6e4', '#a7f3d0'],
    dirY: -0.15,
    dirX: 0.25,
    speedMultiplier: 0.18,
    swayAmp: 0.4
  },
  wind: {
    glowCenter: 'rgba(34, 197, 94, 0.10)',
    glowMid: 'rgba(74, 222, 128, 0.03)',
    particles: ['#4ade80', '#86efac', '#a7f3d0', '#fef08a', '#bbf7d0'],
    dirY: -0.18,
    dirX: 0.4,
    speedMultiplier: 0.25,
    swayAmp: 0.45
  },
  neutral: {
    glowCenter: 'rgba(56, 189, 248, 0.10)',
    glowMid: 'rgba(148, 163, 184, 0.03)',
    particles: ['#ffffff', '#94a3b8', '#cbd5e1', '#38bdf8'],
    dirY: -0.1,
    dirX: 0.05,
    speedMultiplier: 0.15,
    swayAmp: 0.2
  }
};

export const ParticleCanvas: React.FC<ParticleCanvasProps> = ({
  theme = 'fire',
  isRunning = false,
  breathScale = 1.0
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Store active props in ref to prevent tearing down the Canvas loop on state changes
  const propsRef = useRef({ theme, isRunning, breathScale });
  propsRef.current = { theme, isRunning, breathScale };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    // Mouse Tracking
    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      active: false
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.active = true;

      const currentTheme = propsRef.current.theme;
      if ((currentTheme === 'rain' || currentTheme === 'ocean') && Math.random() < 0.08) {
        addRipple(e.clientX, e.clientY, 35);
      }
    };

    const ripples: Ripple[] = [];
    const addRipple = (x: number, y: number, maxRadius = 70) => {
      const colors = {
        fire: 'rgba(251, 191, 36,',
        night: 'rgba(165, 180, 252,',
        rain: 'rgba(56, 189, 248,',
        ocean: 'rgba(45, 212, 191,',
        wind: 'rgba(74, 222, 128,',
        neutral: 'rgba(148, 163, 184,'
      };
      const c = colors[propsRef.current.theme] || colors.neutral;
      ripples.push({
        x,
        y,
        radius: 2,
        maxRadius,
        alpha: 0.35,
        color: c,
        speed: 0.6 + Math.random() * 0.4
      });
    };

    const handleMouseDown = (e: MouseEvent) => {
      addRipple(e.clientX, e.clientY, 85);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);

    // Create 48 Particles ONCE (persistent across all breath phases and theme switches)
    const initialCfg = THEME_CONFIGS[theme] || THEME_CONFIGS.fire;
    const particleCount = 48;
    const particles: Particle[] = Array.from({ length: particleCount }, () => {
      const color = initialCfg.particles[Math.floor(Math.random() * initialCfg.particles.length)];
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.6 + 0.8,
        vx: 0,
        vy: 0,
        baseSpeed: Math.random() * 0.4 + 0.6,
        alpha: Math.random() * 0.35 + 0.15,
        baseAlpha: Math.random() * 0.35 + 0.15,
        color,
        twinkleSpeed: Math.random() * 0.008 + 0.004,
        twinklePhase: Math.random() * Math.PI * 2,
        swaySpeed: Math.random() * 0.006 + 0.003,
        swayOffset: Math.random() * Math.PI * 2
      };
    });

    let time = 0;
    let smoothBreathScale = 1.0;

    const render = () => {
      time += 0.008;

      const currentProps = propsRef.current;
      const cfg = THEME_CONFIGS[currentProps.theme] || THEME_CONFIGS.neutral;

      // Smooth breath scale interpolation (no jumps or resets)
      smoothBreathScale += (currentProps.breathScale - smoothBreathScale) * 0.05;

      // Smooth mouse easing with viscous drag
      mouse.x += (mouse.targetX - mouse.x) * 0.04;
      mouse.y += (mouse.targetY - mouse.y) * 0.04;

      ctx.clearRect(0, 0, width, height);

      // 1. Slow Organic Nebula Background Aura
      const breathFactor = currentProps.isRunning ? (smoothBreathScale - 1) * 0.12 : 0;
      const auraPulse = Math.sin(time * 0.4) * 0.03 + breathFactor;
      
      const auraGrad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.5,
        20,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.75 * (1 + auraPulse)
      );
      auraGrad.addColorStop(0, cfg.glowCenter);
      auraGrad.addColorStop(0.55, cfg.glowMid);
      auraGrad.addColorStop(1, 'rgba(7, 12, 24, 0)');

      ctx.fillStyle = auraGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Soft Cursor Light Aura
      if (mouse.active) {
        const glowRadius = 240;
        const mouseGrad = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          glowRadius
        );
        mouseGrad.addColorStop(0, cfg.glowCenter);
        mouseGrad.addColorStop(0.5, cfg.glowMid);
        mouseGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = mouseGrad;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Render Ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += r.speed;
        r.alpha *= 0.985;

        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `${r.color} ${r.alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        if (r.alpha < 0.01 || r.radius > r.maxRadius) {
          ripples.splice(i, 1);
        }
      }

      // 4. Constellation Web
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 75) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - dist / 75) * 0.04})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // 5. Update & Draw Silky Floating Particles
      particles.forEach((p, idx) => {
        const flowAngle = Math.sin(p.x * 0.002 + time) + Math.cos(p.y * 0.002 + time * 0.7);
        const naturalSway = Math.sin(time * p.swaySpeed * 80 + p.swayOffset + idx) * cfg.swayAmp;

        const targetVx = (cfg.dirX + Math.cos(flowAngle) * 0.2 + naturalSway) * cfg.speedMultiplier * p.baseSpeed;
        const targetVy = (cfg.dirY + Math.sin(flowAngle) * 0.15) * cfg.speedMultiplier * p.baseSpeed;

        p.vx += (targetVx - p.vx) * 0.05;
        p.vy += (targetVy - p.vy) * 0.05;

        p.x += p.vx;
        p.y += p.vy;

        const twinkle = Math.sin(time * p.twinkleSpeed * 100 + p.twinklePhase) * 0.12;
        p.alpha = Math.max(0.08, Math.min(0.65, p.baseAlpha + twinkle));

        // Soft Mouse Deflection
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 130;

          if (dist < maxDist && dist > 1) {
            const force = Math.pow((maxDist - dist) / maxDist, 1.8) * 0.8;
            const angle = Math.atan2(dy, dx);
            const swirlAngle = angle + 0.25;
            p.x += Math.cos(swirlAngle) * force;
            p.y += Math.sin(swirlAngle) * force;
            p.alpha = Math.min(0.75, p.alpha + force * 0.2);
          }
        }

        // Boundary Wrap
        if (p.y < -15) p.y = height + 15;
        if (p.y > height + 15) p.y = -15;
        if (p.x < -15) p.x = width + 15;
        if (p.x > width + 15) p.x = -15;

        // Draw particle
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 5;
        ctx.fill();
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, []); // Run ONCE — no tearing down or re-initializing on breath scale updates!

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 select-none"
    />
  );
};
