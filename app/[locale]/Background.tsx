"use client";
import { useEffect, useRef, useState } from "react";
import { Application, Assets, PlaneGeometry, Texture, Mesh } from "pixi.js";
import emitter from "@/lib/emitter";
import { motion } from "motion/react";

let globalApp: Application | null = null;
let initPromise: Promise<void> | null = null;

const initGlobalPixi = async () => {
  if (globalApp) return;
  const app = new Application();
  globalApp = app;
  await app.init({
    resizeTo: window,
    backgroundAlpha: 0,
    antialias: true,
    resolution: 1,
  });
  app.canvas.style.width = "100%";
  app.canvas.style.height = "100%";
  app.canvas.style.position = "absolute";
  app.canvas.style.top = "0";
  app.canvas.style.left = "0";

  const [textureLeft, textureTree] = await Promise.all([
    Assets.load<Texture>("/background/gold left.png"),
    Assets.load<Texture>("/background/gold tree.png"),
  ]);

  const createWavyMesh = (texture: Texture, isTree: boolean) => {
    const geometry = new PlaneGeometry({
      width: texture.width,
      height: texture.height,
      verticesX: 10,
      verticesY: 20,
    });
    const mesh = new Mesh({ geometry, texture });
    mesh.alpha = 0.9;
    app.stage.addChild(mesh);
    return {
      mesh,
      geometry,
      originalPositions: new Float32Array(
        geometry.getAttribute("aPosition").buffer.data,
      ),
      isTree,
    };
  };

  const objects = [
    createWavyMesh(textureLeft, false),
    createWavyMesh(textureTree, true),
  ];

  const resizeHandler = () => {
    const minWidth = 400;
    const maxWidth = 1920;
    const sw = app.screen.width;
    const sh = app.screen.height;
    const breakpoint = 768;

    const clampedWidth = Math.max(minWidth, Math.min(maxWidth, sw));
    const t = (clampedWidth - minWidth) / (maxWidth - minWidth);
    const finalScale = 0.5 + (0.95 - 0.5) * t;

    objects[0].mesh.scale.set(finalScale);
    objects[1].mesh.scale.set(finalScale);
    objects[0].mesh.pivot.set(0, 0);
    objects[0].mesh.x = 0;
    objects[0].mesh.y = 0;

    if (sw < breakpoint) {
      objects[1].mesh.pivot.set(textureTree.width / 2, textureTree.height);
      objects[1].mesh.x = sw / 2;
      objects[1].mesh.y = sh;
    } else {
      objects[1].mesh.pivot.set(textureTree.width, textureTree.height);
      objects[1].mesh.x = sw;
      objects[1].mesh.y = sh;
    }
  };

  resizeHandler();
  app.renderer.on("resize", resizeHandler);

  let time = 0;
  app.ticker.add((ticker) => {
    time += ticker.deltaTime * 0.03;
    objects.forEach(({ geometry, originalPositions, isTree }) => {
      const positionAttribute = geometry.getAttribute("aPosition");
      const data = positionAttribute.buffer.data;
      const texHeight = isTree ? textureTree.height : textureLeft.height;
      const centerPoint = isTree ? 0.6 : 0.4;

      for (let i = 0; i < data.length; i += 2) {
        const yRel = originalPositions[i + 1] / texHeight;
        const distFromCenter = Math.abs(yRel - centerPoint);
        const shouldWave = isTree ? yRel < centerPoint : yRel > centerPoint;

        if (distFromCenter > 0.05 && shouldWave) {
          const wave = Math.sin(time * 0.6 + yRel * 5) * (20 * distFromCenter);
          data[i] = originalPositions[i] + wave;
        } else {
          data[i] = originalPositions[i];
        }
      }
      positionAttribute.buffer.update();
    });
  });
};

export default function Background() {
  const [scaleBack, setScaleBack] = useState<boolean>(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!initPromise) {
      initPromise = initGlobalPixi();
    }

    initPromise.then(() => {
      if (
        canvasRef.current &&
        globalApp &&
        !canvasRef.current.contains(globalApp.canvas)
      ) {
        canvasRef.current.appendChild(globalApp.canvas);
      }
      emitter.emit("loading:end");
    });

    const onMobileMenuOpen = ({ isOpen }: { isOpen: boolean }) => {
      setScaleBack(isOpen);
    };

    emitter.on("mobile:menu:open", onMobileMenuOpen);

    return () => {
      emitter.off("mobile:menu:open", onMobileMenuOpen);
      // DO NOT destroy the app. Just remove canvas from DOM if it's there.
      if (
        canvasRef.current &&
        globalApp &&
        canvasRef.current.contains(globalApp.canvas)
      ) {
        canvasRef.current.removeChild(globalApp.canvas);
      }
    };
  }, []);

  return (
    <motion.div
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 -z-10 h-screen w-screen overflow-hidden"
      animate={{
        scale: scaleBack ? 1.1 : 1,
      }}
      transition={{
        duration: 0.2,
        ease: "linear",
      }}
    ></motion.div>
  );
}
