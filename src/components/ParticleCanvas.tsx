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
  originX: number;
  originY: number;
  radius: number;
  vx: number;
  vy: number;
  alpha: number;
  baseAlpha: number;
  color: string;
  size: number;
  pulseSpeed: number;
  pulseOffset: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

export const ParticleCanvas: React.FC<ParticleCanvasProps> = ({
  theme = 'fire',
  isRunning = false,
  breathScale = 1.0
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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

    // Mouse Tracking with Inertia
    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      vx: 0,
      vy: 0,
      active: false,
      lastMoveTime: 0
    };

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - mouse.targetX;
      const dy = e.clientY - mouse.targetY;
      mouse.vx = dx * 0.2;
      mouse.vy = dy * 0.2;
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.active = true;
      mouse.lastMoveTime = Date.now();

      // Add gentle water ripples when mouse moves in rain/ocean mode
      if ((theme === 'rain' || theme === 'ocean') && Math.random() < 0.2) {
        addRipple(e.clientX, e.clientY);
      }
    };

    const ripples: Ripple[] = [];
    const addRipple = (x: number, y: number) => {
      const colors = {
        fire: 'rgba(251, 191, 36, 0.4)',
        night: 'rgba(165, 180, 252, 0.4)',
        rain: 'rgba(56, 189, 248, 0.4)',
        ocean: 'rgba(45, 212, 191, 0.4)',
        wind: 'rgba(74, 222, 128, 0.4)',
        neutral: 'rgba(148, 163, 184, 0.3)'
      };
      ripples.push({
        x,
        y,
        radius: 4,
        maxRadius: Math.random() * 60 + 50,
        alpha: 0.5,
        color: colors[theme] || colors.neutral
      });
    };

    const handleMouseDown = (e: MouseEvent) => {
      addRipple(e.clientX, e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);

    // Color Palette per Theme
    const getPalette = () => {
      switch (theme) {
        case 'fire':
          return {
            glowCenter: 'rgba(249, 115, 22, 0.18)',
            glowMid: 'rgba(245, 158, 11, 0.06)',
            particles: ['#fbbf24', '#f97316', '#ea580c', '#fdba74', '#fed7aa'],
            speedY: -0.8,
            speedXVar: 0.6
          };
        case 'night':
          return {
            glowCenter: 'rgba(99, 102, 241, 0.16)',
            glowMid: 'rgba(129, 140, 248, 0.05)',
            particles: ['#c7d2fe', '#818cf8', '#a5b4fc', '#e0e7ff', '#38bdf8'],
            speedY: -0.15,
            speedXVar: 0.3
          };
        case 'rain':
          return {
            glowCenter: 'rgba(14, 165, 233, 0.16)',
            glowMid: 'rgba(56, 189, 248, 0.05)',
            particles: ['#38bdf8', '#7dd3fc', '#0284c7', '#bae6fd', '#93c5fd'],
            speedY: 1.4,
            speedXVar: 0.2
          };
        case 'ocean':
          return {
            glowCenter: 'rgba(20, 184, 166, 0.16)',
            glowMid: 'rgba(45, 212, 191, 0.05)',
            particles: ['#2dd4bf', '#0d9488', '#5eead4', '#38bdf8', '#99f6e4'],
            speedY: -0.25,
            speedXVar: 0.7
          };
        case 'wind':
          return {
            glowCenter: 'rgba(34, 197, 94, 0.14)',
            glowMid: 'rgba(74, 222, 128, 0.05)',
            particles: ['#4ade80', '#22c55e', '#86efac', '#a7f3d0', '#fef08a'],
            speedY: -0.4,
            speedXVar: 1.1
          };
        default:
          return {
            glowCenter: 'rgba(56, 189, 248, 0.14)',
            glowMid: 'rgba(148, 163, 184, 0.04)',
            particles: ['#ffffff', '#94a3b8', '#cbd5e1', '#38bdf8'],
            speedY: -0.2,
            speedXVar: 0.4
          };
      }
    };

    // Initialize 60 Organic Zen Particles
    const palette = getPalette();
    const particleCount = 55;
    const particles: Particle[] = Array.from({ length: particleCount }, () => {
      const pColor = palette.particles[Math.floor(Math.random() * palette.particles.length)];
      const startX = Math.random() * width;
      const startY = Math.random() * height;
      return {
        x: startX,
        y: startY,
        originX: startX,
        originY: startY,
        radius: Math.random() * 2 + 1,
        size: Math.random() * 2 + 1,
        vx: (Math.random() - 0.5) * palette.speedXVar,
        vy: palette.speedY * (Math.random() * 0.8 + 0.6),
        alpha: Math.random() * 0.4 + 0.2,
        baseAlpha: Math.random() * 0.4 + 0.2,
        color: pColor,
        pulseSpeed: Math.random() * 0.03 + 0.01,
        pulseOffset: Math.random() * Math.PI * 2
      };
    });

    let time = 0;

    const render = () => {
      time += 0.02;
      const currentPalette = getPalette();

      // Smooth mouse easing
      mouse.x += (mouse.targetX - mouse.x) * 0.07;
      mouse.y += (mouse.targetY - mouse.y) * 0.07;

      ctx.clearRect(0, 0, width, height);

      // 1. Aurora / Nebula Ambient Pulsing Background Glow
      const bgPulse = Math.sin(time * 0.5) * 0.04 + (isRunning ? (breathScale - 1) * 0.15 : 0);
      const auraGrad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.45,
        20,
        width * 0.5,
        height * 0.45,
        Math.max(width, height) * 0.7
      );
      auraGrad.addColorStop(0, currentPalette.glowCenter);
      auraGrad.addColorStop(0.5, currentPalette.glowMid);
      auraGrad.addColorStop(1, 'rgba(7, 12, 24, 0)');

      ctx.fillStyle = auraGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Interactive Cursor Light Halo (Canvas 2D Radial, 0 artifacts)
      if (mouse.active) {
        const glowRadius = 300 * (1 + bgPulse);
        const mouseGrad = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          glowRadius
        );
        mouseGrad.addColorStop(0, currentPalette.glowCenter);
        mouseGrad.addColorStop(0.4, currentPalette.glowMid);
        mouseGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = mouseGrad;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Render Ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += 1.4;
        r.alpha *= 0.96;

        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = r.color.replace(/[\d.]+\)$/, `${r.alpha})`);
        ctx.lineWidth = 1.2;
        ctx.stroke();

        if (r.alpha < 0.01 || r.radius > r.maxRadius) {
          ripples.splice(i, 1);
        }
      }

      // 4. Subtle Constellation Links between close particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 85) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - dist / 85) * 0.06})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // 5. Update & Draw Ambient Floating Particles
      particles.forEach((p, idx) => {
        // Natural turbulence (Sine wave flow)
        const waveOffset = Math.sin(time + idx * 0.5) * 0.35;
        p.x += p.vx + waveOffset;
        p.y += p.vy;

        // Smooth breathing pulse of alpha
        const alphaPulse = Math.sin(time * p.pulseSpeed * 50 + p.pulseOffset) * 0.15;
        p.alpha = Math.max(0.1, Math.min(0.8, p.baseAlpha + alphaPulse));

        // Interactive Cursor Gravity & Fluid Wake
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 160;

          if (dist < maxDist) {
            const force = (maxDist - dist) / maxDist;
            const angle = Math.atan2(dy, dx);
            
            // Push away with soft circular vortex swirl
            const swirlAngle = angle + 0.3;
            p.x += Math.cos(swirlAngle) * force * 2.2;
            p.y += Math.sin(swirlAngle) * force * 2.2;
            p.alpha = Math.min(0.9, p.alpha + force * 0.4);
          }
        }

        // Boundary Wrap
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;

        // Draw glowing particle
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
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
  }, [theme, isRunning, breathScale]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 select-none"
    />
  );
};
