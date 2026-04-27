"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import {
  skillsMenu,
  coreAndBackgend,
  frontendArchitecture,
  creativeAndMotion,
  designAndProductivity,
  softwareEngineering,
} from "@/configs/skills";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";

const childrenMap: Record<string, typeof coreAndBackgend> = {
  "Core & Backend": coreAndBackgend,
  "Front-end Architecture": frontendArchitecture,
  "Creative & Motion": creativeAndMotion,
  "Design & Productivity": designAndProductivity,
  "Software Engineering": softwareEngineering,
};

interface SkillItem {
  lable: string;
  src: string;
  alt: string;
}

interface SpherePoint {
  item: SkillItem;
  hasChildren: boolean;
  ox: number;
  oy: number;
  oz: number;
}

interface Projected {
  item: SkillItem;
  hasChildren: boolean;
  x: number;
  y: number;
  sz: number;
  sc: number;
  idx: number;
}

const imgCache: Record<string, HTMLImageElement> = {};

function loadImg(src: string): HTMLImageElement {
  if (imgCache[src]) return imgCache[src];
  const img = new Image();
  img.src = src;
  imgCache[src] = img;
  return img;
}

function makePoints(
  items: SkillItem[],
  hasChildrenFn: (item: SkillItem) => boolean,
): SpherePoint[] {
  return items.map((item, i) => {
    const phi = Math.acos(1 - (2 * (i + 0.5)) / items.length);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;
    return {
      item,
      hasChildren: hasChildrenFn(item),
      ox: Math.sin(phi) * Math.cos(theta),
      oy: Math.cos(phi),
      oz: Math.sin(phi) * Math.sin(theta),
    };
  });
}

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

type Quat = { w: number; x: number; y: number; z: number };

function qMul(a: Quat, b: Quat): Quat {
  return {
    w: a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z,
    x: a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
    y: a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x,
    z: a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w,
  };
}
function qNorm(q: Quat): Quat {
  const n = Math.sqrt(q.w * q.w + q.x * q.x + q.y * q.y + q.z * q.z) || 1;
  return { w: q.w / n, x: q.x / n, y: q.y / n, z: q.z / n };
}
function qFromAxis(ax: number, ay: number, az: number, angle: number): Quat {
  const s = Math.sin(angle * 0.5);
  return { w: Math.cos(angle * 0.5), x: ax * s, y: ay * s, z: az * s };
}
function qRotVec(q: Quat, px: number, py: number, pz: number) {
  // Optimised q*(0,p)*q†
  const tx = 2 * (q.y * pz - q.z * py);
  const ty = 2 * (q.z * px - q.x * pz);
  const tz = 2 * (q.x * py - q.y * px);
  return {
    sx: px + q.w * tx + q.y * tz - q.z * ty,
    sy: py + q.w * ty + q.z * tx - q.x * tz,
    sz: pz + q.w * tz + q.x * ty - q.y * tx,
  };
}

const INIT_QUAT: Quat = qNorm({
  w: Math.cos(0.1),
  x: Math.sin(0.1),
  y: 0,
  z: 0,
});

interface TagSphereProps {
  autoRotateSpeed?: number;
  onLeafClick?: (item: SkillItem) => void;
}

export default function page({
  autoRotateSpeed = 0.005,
  onLeafClick,
}: TagSphereProps) {
  const tNavMenu = useTranslations("NavMenu");
  const tSkills = useTranslations("Skills");
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const tickRef = useRef(0);
  const [canvasSize, setCanvasSize] = useState<{ x: number; y: number }>({
    x: 500,
    y: 500,
  });

  const levelRef = useRef(0);
  const pointsRef = useRef<SpherePoint[]>(
    makePoints(skillsMenu, (item) => !!childrenMap[item.lable]),
  );
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);

  const quatRef = useRef<Quat>({ ...INIT_QUAT });
  const velRef = useRef({ ax: 0, ay: 0 });
  const dragRef = useRef({ active: false, lastX: 0, lastY: 0, dist: 0 });
  const transRef = useRef({ active: false, zoom: 1, alpha: 1 });
  const hoveredIdxRef = useRef(-1);

  const [hoveredItem, setHoveredItem] = useState<SkillItem | null>(null);

  useEffect(() => {
    [...skillsMenu, ...Object.values(childrenMap).flat()].forEach((i) =>
      loadImg(i.src),
    );
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width;
      setCanvasSize({ x: w, y: w });
    });
    ro.observe(el);
    setCanvasSize({ x: el.offsetWidth, y: el.offsetWidth });
    return () => ro.disconnect();
  }, []);

  const CX = canvasSize.x / 2;
  const CY = canvasSize.y / 2;
  const R = CX * 0.65;

  const getR = () => R * transRef.current.zoom;

  const getMousePos = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const projectPoint = useCallback((px: number, py: number, pz: number) => {
    return qRotVec(quatRef.current, px, py, pz);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getProjected = useCallback((): Projected[] => {
    const Rv = getR();
    return pointsRef.current.map((p, idx) => {
      const { sx, sy, sz } = projectPoint(p.ox, p.oy, p.oz);
      const sc = (sz + 1.6) / 2.6;
      return {
        item: p.item,
        hasChildren: p.hasChildren,
        x: CX + sx * Rv,
        y: CY + sy * Rv,
        sz,
        sc,
        idx,
      };
    });
  }, [CX, CY, projectPoint]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvasSize.x, canvasSize.y);
    tickRef.current++;
    const tick = tickRef.current;
    const { alpha } = transRef.current;

    const projected = getProjected();
    const sorted = [...projected].sort((a, b) => a.sz - b.sz);

    const maxBase = Math.min(150, Math.max(50, canvasSize.x * 0.12));
    const iconSizeMap = new Map<number, number>();
    sorted.forEach(({ sc, idx }) => {
      iconSizeMap.set(idx, maxBase * (0.3 + sc * 0.7));
    });

    const pulse = 0.7 + Math.sin(tick * 0.04) * 0.3;
    const ballR = 7 * pulse;

    const Rv = getR();
    const auraRadius = Rv * 0.4;
    const auraGrd = ctx.createRadialGradient(CX, CY, 0, CX, CY, auraRadius);
    auraGrd.addColorStop(0, `rgba(153,101,21,${0.3 * pulse})`);
    auraGrd.addColorStop(0.5, `rgba(153,101,21,${0.1 * pulse})`);
    auraGrd.addColorStop(1, "rgba(153,101,21,0)");

    ctx.beginPath();
    ctx.arc(CX, CY, auraRadius, 0, Math.PI * 2);
    ctx.fillStyle = auraGrd;
    ctx.fill();

    const ballGrd = ctx.createRadialGradient(
      CX - ballR * 0.4,
      CY - ballR * 0.4,
      ballR * 0.05,
      CX,
      CY,
      ballR,
    );
    ballGrd.addColorStop(0, `rgba(255, 255, 200, ${0.75 * alpha})`);
    ballGrd.addColorStop(0.2, `rgba(255, 180, 50, ${0.6 * alpha})`);
    ballGrd.addColorStop(0.5, `rgba(153, 101, 21, ${0.6 * alpha})`);
    ballGrd.addColorStop(1, `rgba(40, 20, 0, ${0.8 * alpha})`);

    ctx.beginPath();
    ctx.arc(CX, CY, ballR, 0, Math.PI * 2);
    ctx.fillStyle = ballGrd;
    ctx.fill();

    const shineGrd = ctx.createRadialGradient(
      CX - ballR * 0.4,
      CY - ballR * 0.4,
      0,
      CX - ballR * 0.4,
      CY - ballR * 0.4,
      ballR * 0.6,
    );
    shineGrd.addColorStop(0, `rgba(153, 101, 21, ${0.4 * alpha})`);
    shineGrd.addColorStop(1, "rgba(153, 101, 21, 0)");
    ctx.beginPath();
    ctx.arc(CX - ballR * 0.4, CY - ballR * 0.4, ballR * 0.6, 0, Math.PI * 2);
    ctx.fillStyle = shineGrd;
    ctx.fill();

    sorted.forEach(({ x, y, sc, idx }) => {
      const nodePulse = 0.85 + Math.sin(tick * 0.03 + idx * 0.7) * 0.15;
      const iconCY = y;
      ctx.beginPath();
      ctx.moveTo(CX, CY);
      ctx.lineTo(x, iconCY);
      ctx.strokeStyle = `rgba(153,101,21,${(0.18 + sc * 0.28) * nodePulse * alpha})`;
      const pulse = 0.7 + Math.sin(tick * 0.04) * 0.3;
      ctx.lineWidth = 1.2 * pulse;
      ctx.setLineDash([3, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    sorted.forEach(({ item, hasChildren, x, y, sc, idx }) => {
      const isH = idx === hoveredIdxRef.current && hasChildren;
      const iconSize = iconSizeMap.get(idx) ?? 24;
      const a = (0.2 + sc * 0.8) * alpha;

      ctx.save();
      ctx.globalAlpha = a;

      const img = loadImg(item.src);
      if (img.complete && img.naturalWidth > 0) {
        if (isH) {
          ctx.shadowColor = "rgba(212,175,55,0.9)";
          ctx.shadowBlur = 16;
        }
        ctx.drawImage(img, x - iconSize / 2, y - iconSize, iconSize, iconSize);
        ctx.shadowBlur = 0;
      }

      const label = item.lable;
      const fs = 14;
      ctx.font = `${isH ? 600 : 500} ${fs}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";

      const labelY = y + 8;
      const maxWidth = 100;

      const words = label.split(" ");
      const lines = [];
      let currentLine = words[0];

      for (let i = 1; i < words.length; i++) {
        const testLine = currentLine + " " + words[i];
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth) {
          lines.push(currentLine);
          currentLine = words[i];
        } else {
          currentLine = testLine;
        }
      }
      lines.push(currentLine);

      ctx.shadowColor = "rgba(0,0,0,0.6)";
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 1;

      if (isH) {
        ctx.fillStyle = `rgba(255,183,0, 1)`;
      } else {
        ctx.fillStyle = `rgba(153,101,21,${1.2 * sc})`;
      }

      lines.forEach((line, i) => {
        ctx.fillText(line, x, labelY + i * (fs + 2));
      });

      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      ctx.restore();
    });
  }, [getProjected, canvasSize, CX, CY]);

  const hitTest = useCallback(
    (mx: number, my: number): number => {
      let best = -1,
        bestD = 9999;
      getProjected().forEach(({ x, y, sc, idx }) => {
        const maxBase = Math.min(150, Math.max(50, canvasSize.x * 0.12));
        const iconSize = maxBase * (0.3 + sc * 0.7);
        const centerY = y - iconSize / 2;
        const d = Math.hypot(mx - x, my - centerY);
        const hitRadius = 15 + sc * 25;
        if (d < hitRadius && d < bestD) {
          best = idx;
          bestD = d;
        }
      });
      return best;
    },
    [getProjected],
  );

  const startTransition = useCallback((dir: 1 | -1, onMid: () => void) => {
    if (transRef.current.active) return;
    transRef.current.active = true;
    const start = performance.now();

    function step(now: number) {
      const t = Math.min(1, (now - start) / 420);
      const e = easeInOut(t);
      if (t < 0.5) {
        transRef.current.zoom = dir > 0 ? 1 + e * 1.5 : 1 - e * 0.6;
        transRef.current.alpha = 1 - e * 2;
      } else {
        if (transRef.current.alpha > 0.01) {
          transRef.current.alpha = 0;
          onMid();
          transRef.current.zoom = dir > 0 ? 0.3 : 1.8;
        }
        const e2 = easeInOut((t - 0.5) * 2);
        transRef.current.alpha = e2;
        transRef.current.zoom = dir > 0 ? 0.3 + 0.7 * e2 : 1.8 - 0.8 * e2;
      }
      if (t >= 1) {
        transRef.current.zoom = 1;
        transRef.current.alpha = 1;
        transRef.current.active = false;
      } else requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }, []);

  function resetSphere() {
    quatRef.current = { ...INIT_QUAT };
    velRef.current = { ax: 0, ay: 0 };
    hoveredIdxRef.current = -1;
  }

  const navigateTo = useCallback(
    (item: SkillItem) => {
      if (transRef.current.active || levelRef.current > 0) return;
      const children = childrenMap[item.lable];
      if (!children) return;
      startTransition(1, () => {
        levelRef.current = 1;
        pointsRef.current = makePoints(children, () => false);
        resetSphere();
        setCurrentCategory(tSkills(`skills_category.${item.lable}`));
      });
    },
    [startTransition],
  );

  const navigateBack = useCallback(() => {
    if (transRef.current.active || levelRef.current === 0) return;
    startTransition(-1, () => {
      levelRef.current = 0;
      pointsRef.current = makePoints(
        skillsMenu,
        (item) => !!childrenMap[item.lable],
      );
      resetSphere();
      setCurrentCategory(null);
    });
  }, [startTransition]);

  useEffect(() => {
    if (!canvasRef.current) return;
    canvasRef.current.width = canvasSize.x;
    canvasRef.current.height = canvasSize.y;
  }, [canvasSize]);

  useEffect(() => {
    const loop = () => {
      if (!dragRef.current.active && !transRef.current.active) {
        quatRef.current = qNorm(
          qMul(qFromAxis(0, 1, 0, autoRotateSpeed), quatRef.current),
        );
        const { ax, ay } = velRef.current;
        const mag = Math.sqrt(ax * ax + ay * ay);
        if (mag > 0.00005) {
          quatRef.current = qNorm(
            qMul(qFromAxis(ax / mag, ay / mag, 0, mag), quatRef.current),
          );
          velRef.current = { ax: ax * 0.92, ay: ay * 0.92 };
        }
      }
      draw();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [draw, autoRotateSpeed]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (transRef.current.active) return;
    const { x: mx, y: my } = getMousePos(e.clientX, e.clientY);
    dragRef.current = { active: true, lastX: mx, lastY: my, dist: 0 };
    velRef.current = { ax: 0, ay: 0 };
  };

  function applyDrag(dx: number, dy: number) {
    const d = Math.sqrt(dx * dx + dy * dy);
    dragRef.current.dist += d;
    if (d < 0.01) return;
    const ax = -dy / d;
    const ay = dx / d;
    const angle = d * 0.005;
    quatRef.current = qNorm(qMul(qFromAxis(ax, ay, 0, angle), quatRef.current));
    velRef.current = { ax: ax * angle, ay: ay * angle };
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (transRef.current.active) return;
    const { x: mx, y: my } = getMousePos(e.clientX, e.clientY);
    if (dragRef.current.active) {
      applyDrag(mx - dragRef.current.lastX, my - dragRef.current.lastY);
      dragRef.current.lastX = mx;
      dragRef.current.lastY = my;
      hoveredIdxRef.current = -1;
      setHoveredItem(null);
    } else {
      const hit = hitTest(mx, my);
      if (hit !== hoveredIdxRef.current) {
        hoveredIdxRef.current = hit;
        setHoveredItem(hit >= 0 ? pointsRef.current[hit].item : null);
      }
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (transRef.current.active || dragRef.current.dist > 5) return;
    const { x: mx, y: my } = getMousePos(e.clientX, e.clientY);
    const hit = hitTest(mx, my);
    if (hit < 0) return;
    const point = pointsRef.current[hit];
    if (point.hasChildren) navigateTo(point.item);
    else onLeafClick?.(point.item);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    const { x: mx, y: my } = getMousePos(t.clientX, t.clientY);
    dragRef.current = { active: true, lastX: mx, lastY: my, dist: 0 };
    velRef.current = { ax: 0, ay: 0 };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const t = e.touches[0];
    const { x: mx, y: my } = getMousePos(t.clientX, t.clientY);
    applyDrag(mx - dragRef.current.lastX, my - dragRef.current.lastY);
    dragRef.current.lastX = mx;
    dragRef.current.lastY = my;
  };

  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(5px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, filter: "blur(5px)" }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      ref={wrapRef}
      className="user-select-none relative flex w-full flex-col items-center"
    >
      <motion.h2
        key={currentCategory || "root"}
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-shadow pointer-events-none m-[10px] mb-2 text-center font-bold italic"
      >
        {currentCategory ? currentCategory : tSkills("skills_menu")}
      </motion.h2>
      <AnimatePresence mode="popLayout">
        {currentCategory && (
          <motion.button
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.3 }}
            onClick={navigateBack}
            className="border-[rgba(153, 101, 21)] text-shadow mb-4 cursor-pointer rounded-[10px] border-[2px] px-[15px] py-[5px] font-bold backdrop-blur-[8px]"
          >
            ← {tNavMenu("back")}
          </motion.button>
        )}
      </AnimatePresence>
      <canvas
        ref={canvasRef}
        style={{
          cursor: hoveredItem ? "pointer" : "grab",
        }}
        className="block aspect-square w-full touch-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={() => {
          dragRef.current.active = false;
        }}
        onMouseLeave={() => {
          dragRef.current.active = false;
          setHoveredItem(null);
        }}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={(e) => {
          dragRef.current.active = false;
          if (dragRef.current.dist > 5) return;
          const t = e.changedTouches[0];
          const { x: mx, y: my } = getMousePos(t.clientX, t.clientY);
          const hit = hitTest(mx, my);
          if (hit >= 0) {
            const point = pointsRef.current[hit];
            if (point.hasChildren) navigateTo(point.item);
            else onLeafClick?.(point.item);
          }
        }}
      />
    </motion.div>
  );
}
