'use client';

import { cursorConfig } from '@/config/Cursor';
import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  born: number;
  text: string;
  hue: number;
}

/**
 * Decorative canvas overlay: tokens stream off the pointer and fade out.
 * Pointer-events are disabled so it never intercepts clicks. Skipped on
 * touch devices and when the user prefers reduced motion.
 */
export default function TokenTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!cursorConfig.enabled) return;
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(hover: none)').matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const particles: Particle[] = [];
    let last = { x: -1e9, y: -1e9 };
    let tokenIndex = 0;
    let hueSeed = 0;
    let raf = 0;
    let dpr = 1;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const dx = e.clientX - last.x;
      const dy = e.clientY - last.y;
      if (Math.hypot(dx, dy) < cursorConfig.spawnDistance) return;
      last = { x: e.clientX, y: e.clientY };

      const speed = Math.min(1, Math.hypot(dx, dy) / 80);
      hueSeed = (hueSeed + 137.508) % 360;
      particles.push({
        x: e.clientX + 12,
        y: e.clientY + 14,
        // Drift away from the travel direction, slightly downward
        vx: -dx * 0.02 + (Math.random() - 0.5) * 0.3,
        vy: -dy * 0.02 + 0.25 + Math.random() * 0.2 * speed,
        born: performance.now(),
        text: cursorConfig.tokens[tokenIndex++ % cursorConfig.tokens.length],
        hue: hueSeed,
      });
      if (particles.length > cursorConfig.maxParticles) particles.shift();
    };

    const isDark = () => document.documentElement.classList.contains('dark');

    const draw = (now: number) => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.font =
        '11px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
      ctx.textBaseline = 'middle';
      const light = isDark() ? 62 : 42;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        const age = (now - p.born) / cursorConfig.lifetimeMs;
        if (age >= 1) {
          particles.splice(i, 1);
          continue;
        }
        p.x += p.vx;
        p.y += p.vy;
        const alpha = (1 - age) * 0.9;
        const rise = age * 6;
        ctx.fillStyle = `hsl(${p.hue.toFixed(0)} 70% ${light}% / ${alpha})`;
        ctx.fillText(p.text, p.x, p.y - rise);
      }
      raf = window.requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onMove, { passive: true });
    raf = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  if (!cursorConfig.enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[60]"
    />
  );
}
