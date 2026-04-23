"use client";

import { useEffect, useRef, useCallback } from "react";
import emitter from "@/lib/emitter";
import { CONSTANTS } from "@/configs/constants";

const COLORS = ["#D4AF37", "#DAA520", "#ffeaa0", "#f0d890"];

const ELDER_FUTHARK = [
  "ᚠ",
  "ᚢ",
  "ᚦ",
  "ᚨ",
  "ᚱ",
  "ᚲ",
  "ᚷ",
  "ᚹ",
  "ᚺ",
  "ᚾ",
  "ᛁ",
  "ᛃ",
  "ᛇ",
  "ᛈ",
  "ᛉ",
  "ᛊ",
  "ᛏ",
  "ᛒ",
  "ᛖ",
  "ᛗ",
  "ᛚ",
  "ᛜ",
  "ᛞ",
  "ᛟ",
];

function randomRune() {
  return ELDER_FUTHARK[Math.floor(Math.random() * ELDER_FUTHARK.length)];
}

interface RippleWave {
  radius: number;
  alpha: number;
  expanding?: boolean;
  x?: number;
  y?: number;
}

interface CursorParticle {
  kind: "cursor";
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  fadeAlpha: number;
  rune: string;
  angle: number;
  rotSpeed: number;
}

interface RuneColumn {
  x: number;
  y: number;
  speed: number;
  fontSize: number;
  runes: string[];
  length: number;
  mutateTimer: number;
  color: string;
  bottomY: number;
  topY: number;
}

type Particle = CursorParticle;

function drawRune(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  angle: number,
  color: string,
  alpha: number,
  rune: string,
) {
  ctx.save();
  ctx.globalAlpha = Math.max(0, alpha);
  ctx.shadowColor = "rgba(150, 100, 0, 0.6)";
  ctx.shadowBlur = 4;
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = color;
  ctx.font = `${Math.round(size)}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(rune, 0, 0);
  ctx.restore();
}

interface CanvasDustProps {
  spawnRadius?: number;
  magnetForce?: number;
  spawnRate?: number;
  quantity?: number;
  columnCount?: number;
}

export default function CanvasDust({
  spawnRadius = 150,
  magnetForce = 7,
  spawnRate = 16,
  quantity = 1,
  columnCount = 10,
}: CanvasDustProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });
  const hasMouseRef = useRef(false);
  const isMobileRef = useRef(false);
  const mobileMenuOpenRef = useRef(false);
  const particlesRef = useRef<Particle[]>([]);
  const columnsRef = useRef<RuneColumn[]>([]);
  const rafRef = useRef<number>(0);
  const lastSpawnRef = useRef<number>(0);
  const navRectRef = useRef<DOMRect | null>(null);
  const navFadeRef = useRef<number>(0);
  const ripplesRef = useRef<RippleWave[]>([]);
  const rippleTimerRef = useRef<number>(0);

  const spawnCursor = useCallback(() => {
    if (!hasMouseRef.current) return;
    const { x, y } = mouseRef.current;
    for (let i = 0; i < quantity; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = spawnRadius * (0.4 + Math.random() * 0.6);
      particlesRef.current.push({
        kind: "cursor",
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: 8 + Math.random() * 8,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha: 0.6 + Math.random() * 0.4,
        fadeAlpha: 1,
        rune: randomRune(),
        angle: 0,
        rotSpeed: 0,
      });
    }
  }, [spawnRadius, quantity]);

  const rebuildColumns = useCallback(
    (rect: DOMRect) => {
      navRectRef.current = rect;
      navFadeRef.current = 0;

      if (isMobileRef.current && !mobileMenuOpenRef.current) {
        columnsRef.current = [];
        return;
      }

      const fontSize = 13;
      const padding = 8;
      const cols: RuneColumn[] = [];

      for (let i = 0; i < columnCount; i++) {
        const x =
          rect.left +
          padding +
          (i / (columnCount - 1)) * (rect.width - padding * 2);
        const length = 1 + Math.floor(Math.random() * 2);
        const runes = Array.from({ length }, () => randomRune());
        const speed = 0.2 + Math.random() * 0.8;
        const topY = rect.top;

        cols.push({
          x,
          y:
            topY + Math.random() * (rect.bottom - rect.top + length * fontSize),
          speed,
          fontSize,
          runes,
          length,
          mutateTimer: 0,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          bottomY: rect.bottom + length * fontSize,
          topY,
        });
      }

      columnsRef.current = cols;
    },
    [columnCount],
  );

  const clearColumns = useCallback(() => {
    columnsRef.current = [];
    navRectRef.current = null;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    isMobileRef.current = window.innerWidth < CONSTANTS.MOBILE_BREAKPOINT;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const wasMobile = isMobileRef.current;
      isMobileRef.current = window.innerWidth < CONSTANTS.MOBILE_BREAKPOINT;

      if (!wasMobile && isMobileRef.current) {
        clearColumns();
      }
    };
    resize();
    window.addEventListener("resize", resize);

    const onMouseMove = (e: MouseEvent) => {
      hasMouseRef.current = true;
      mouseRef.current = { x: e.clientX, y: e.clientY, active: true };
    };
    const onLeave = () => {
      mouseRef.current.active = false;
    };

    const onClick = (e: MouseEvent) => {
      if (hasMouseRef.current) {
        const { x, y } = mouseRef.current;
        particlesRef.current.forEach((p) => {
          const dx = p.x - x;
          const dy = p.y - y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = 200 / (dist * 0.1 + 1);
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        });
      }

      const rx = hasMouseRef.current ? mouseRef.current.x : e.clientX;
      const ry = hasMouseRef.current ? mouseRef.current.y : e.clientY;
      ripplesRef.current.push({
        radius: 0,
        alpha: 0.8,
        expanding: true,
        x: rx,
        y: ry,
      });
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("click", onClick);

    const onNavActive = ({ rect }: { rect: DOMRect }) => rebuildColumns(rect);
    emitter.on("nav:active", onNavActive);

    const onMobileMenuOpen = ({ isOpen }: { isOpen: boolean }) => {
      mobileMenuOpenRef.current = isOpen;
      if (!isOpen) {
        clearColumns();
      }
    };

    emitter.on("mobile:menu:open", onMobileMenuOpen);

    const loop = (ts: number) => {
      rafRef.current = requestAnimationFrame(loop);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const { x: mx, y: my, active } = mouseRef.current;

      if (
        hasMouseRef.current &&
        active &&
        ts - lastSpawnRef.current > 1000 / spawnRate
      ) {
        spawnCursor();
        lastSpawnRef.current = ts;
      }

      navFadeRef.current = Math.min(1, navFadeRef.current + 0.02);

      const showColumns = !isMobileRef.current || mobileMenuOpenRef.current;

      if (showColumns) {
        for (const col of columnsRef.current) {
          col.y += col.speed;

          if (col.y > col.bottomY) {
            col.y = col.topY + Math.random() * 5;
            col.color = COLORS[Math.floor(Math.random() * COLORS.length)];
          }

          col.mutateTimer++;
          if (col.mutateTimer > 8) {
            col.mutateTimer = 0;
            const idx = Math.floor(Math.random() * col.runes.length);
            col.runes[idx] = randomRune();
          }

          for (let j = 0; j < col.runes.length; j++) {
            const ry = col.y - j * col.fontSize;
            const distToBottom = Math.max(
              0,
              1 - (col.bottomY - col.y) / (col.fontSize * col.length * 2),
            );
            const bottomFade = 1 - distToBottom;
            const tailAlpha =
              (1 - j / col.runes.length) *
              0.85 *
              navFadeRef.current *
              bottomFade;

            ctx.globalAlpha = Math.max(0, tailAlpha);
            ctx.fillStyle = col.color;
            ctx.font = `${col.fontSize}px serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(col.runes[j], col.x, ry);
          }
        }
      }

      ctx.globalAlpha = 1;

      if (hasMouseRef.current) {
        const particles = particlesRef.current;
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.angle += p.rotSpeed;

          const dx = mx - p.x;
          const dy = my - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;

          if (dist < 5) {
            particles.splice(i, 1);
            continue;
          }

          const acc = magnetForce / (dist * 0.3);
          p.vx += (dx / dist) * acc;
          p.vy += (dy / dist) * acc;
          p.vx *= 0.82;
          p.vy *= 0.82;

          const maxSpeed = 40;
          const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
          if (spd > maxSpeed) {
            p.vx = (p.vx / spd) * maxSpeed;
            p.vy = (p.vy / spd) * maxSpeed;
          }

          p.x += p.vx;
          p.y += p.vy;

          if (dist > spawnRadius * 1.2) {
            p.fadeAlpha -= 0.015;
            if (p.fadeAlpha <= 0) {
              particles.splice(i, 1);
              continue;
            }
          } else {
            p.fadeAlpha = Math.min(p.fadeAlpha + 0.05, 1);
          }

          const proximityAlpha = Math.min(1, dist / 20);
          drawRune(
            ctx,
            p.x,
            p.y,
            p.size,
            p.angle,
            p.color,
            p.alpha * p.fadeAlpha * proximityAlpha,
            p.rune,
          );
        }

        // if (active && ts - rippleTimerRef.current > 600) {
        //   ripplesRef.current.push({ radius: 100, alpha: 0.4 });
        //   rippleTimerRef.current = ts;
        // }
      }

      // for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
      //   const w = ripplesRef.current[i];
      //   if (w.expanding) {
      //     w.radius += 13;
      //     w.alpha -= 0.04;
      //   } else {
      //     w.radius -= 2;
      //     w.alpha -= 0.012;
      //   }

      //   if (w.radius <= 0 || w.alpha <= 0) {
      //     ripplesRef.current.splice(i, 1);
      //     continue;
      //   }

      //   for (let ring = 0; ring < 3; ring++) {
      //     const ringRadius = w.radius - ring * 5;
      //     if (ringRadius <= 0) continue;

      //     const rx = w.expanding ? w.x! : mx;
      //     const ry = w.expanding ? w.y! : my;

      //     ctx.beginPath();
      //     ctx.arc(rx, ry, ringRadius, 0, Math.PI * 2);
      //     ctx.strokeStyle = `rgba(255, 255, 255, ${w.alpha * (1 - ring * 0.3)})`;
      //     ctx.globalAlpha = 1;
      //     ctx.lineWidth = 1.5 - ring * 0.3;
      //     ctx.stroke();
      //   }
      // }

      ctx.globalAlpha = 1;
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("click", onClick);
      emitter.off("nav:active", onNavActive);
      emitter.off("mobile:menu:open", onMobileMenuOpen);
    };
  }, [spawnRate, magnetForce, spawnCursor, rebuildColumns, clearColumns]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50"
    />
  );
}
