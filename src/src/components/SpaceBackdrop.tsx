import { useEffect, useRef } from "react";

const seed = (index: number) => {
  const value = Math.sin(index * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
};
const stars = Array.from({ length: 190 }, (_, index) => ({
  x: seed(index * 7 + 1),
  y: seed(index * 7 + 2),
  depth: seed(index * 7 + 3),
  radius: 0.35 + seed(index * 7 + 4) * 0.9,
  phase: seed(index * 7 + 5) * Math.PI * 2,
}));

/** Slow stellar parallax, with no interface elements or information to follow. */
export default function SpaceBackdrop({ paused }: { paused: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(paused);
  const syncRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    pausedRef.current = paused;
    syncRef.current?.();
  }, [paused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    let width = 0,
      height = 0,
      frame = 0,
      lastTime = 0,
      time = 0;
    let pointerX = 0,
      pointerY = 0,
      targetX = 0,
      targetY = 0;
    let scroll = window.scrollY;
    let disposed = false;
    let starColor = "142, 92, 58";

    const draw = () => {
      context.clearRect(0, 0, width, height);
      const count = width < 700 ? 80 : stars.length;
      for (let index = 0; index < count; index++) {
        const star = stars[index];
        const depth = 0.25 + star.depth * 0.75;
        const driftX = Math.sin(time * 0.025 + star.phase) * 9 * depth;
        const driftY = Math.cos(time * 0.018 + star.phase) * 6 * depth;
        const x = star.x * width + driftX + pointerX * depth * 10;
        const y =
          star.y * height +
          driftY +
          pointerY * depth * 7 -
          Math.tanh(scroll / 2200) * depth * 18;
        const alpha =
          (0.14 + depth * 0.36) *
          (0.9 + Math.sin(time * 0.3 + star.phase) * 0.1);
        const radius = star.radius * (0.6 + depth * 0.5);

        // A few soft stellar halos add depth; most stars remain tiny points.
        if (index % 23 === 0) {
          const glow = context.createRadialGradient(x, y, 0, x, y, radius * 7);
          glow.addColorStop(0, `rgba(${starColor},${alpha * 0.3})`);
          glow.addColorStop(1, `rgba(${starColor},0)`);
          context.fillStyle = glow;
          context.beginPath();
          context.arc(x, y, radius * 7, 0, Math.PI * 2);
          context.fill();
        }
        context.fillStyle = `rgba(${starColor},${alpha})`;
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
        if (index % 47 === 0) {
          context.strokeStyle = `rgba(${starColor},${alpha * 0.45})`;
          context.lineWidth = 0.55;
          context.beginPath();
          context.moveTo(x - 3.5, y);
          context.lineTo(x + 3.5, y);
          context.moveTo(x, y - 3.5);
          context.lineTo(x, y + 3.5);
          context.stroke();
        }
      }
    };
    const animate = (stamp: number) => {
      frame = 0;
      if (disposed || pausedRef.current || document.hidden) return;
      if (!lastTime || stamp - lastTime >= (width < 700 ? 50 : 1000 / 30)) {
        const delta = lastTime ? Math.min((stamp - lastTime) / 1000, 0.1) : 0;
        time += delta;
        lastTime = stamp;
        const easing = 1 - Math.exp(-delta * 2);
        pointerX += (targetX - pointerX) * easing;
        pointerY += (targetY - pointerY) * easing;
        draw();
      }
      frame = requestAnimationFrame(animate);
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
      if (!disposed && !pausedRef.current && !document.hidden)
        frame = requestAnimationFrame(animate);
    };
    syncRef.current = sync;
    const resize = new ResizeObserver(() => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      starColor =
        getComputedStyle(canvas).getPropertyValue("--cosmic-star").trim() ||
        starColor;
      draw();
    });
    const move = (event: PointerEvent) => {
      if (pausedRef.current || event.pointerType !== "mouse") return;
      targetX = Math.max(
        -1,
        Math.min(1, (event.clientX / Math.max(width, 1)) * 2 - 1),
      );
      targetY = Math.max(
        -1,
        Math.min(1, (event.clientY / Math.max(height, 1)) * 2 - 1),
      );
    };
    const leave = () => {
      targetX = 0;
      targetY = 0;
    };
    const onScroll = () => {
      if (!pausedRef.current) scroll = window.scrollY;
    };
    resize.observe(canvas);
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => {
      disposed = true;
      syncRef.current = null;
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return (
    <div className="space-backdrop" aria-hidden="true">
      <div className="solar-system">
        <div className="solar-orbit solar-orbit-outer" />
        <div className="solar-orbit solar-orbit-inner">
          <span className="orbiting-planet" />
        </div>
        <div className="solar-disc" />
      </div>
      <canvas ref={canvasRef} className="space-stars" />
    </div>
  );
}
