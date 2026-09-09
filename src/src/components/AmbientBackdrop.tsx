import { useEffect, useRef } from "react";

type Point = readonly [number, number, number];

/** A quiet drafting grid: perspective planes, viewfinder corners, and pixel marks. */
export default function AmbientBackdrop({ paused }: { paused: boolean }) {
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

    let width = 0;
    let height = 0;
    let frame = 0;
    let lastTime = 0;
    let time = 0;
    let pointerX = 0;
    let pointerY = 0;
    let targetX = 0;
    let targetY = 0;
    let scroll = window.scrollY;
    let disposed = false;

    const draw = () => {
      context.clearRect(0, 0, width, height);
      const compact = width < 700;
      const unit = Math.min(width * (compact ? 0.73 : 0.43), 580);
      const drift = Math.sin(time * 0.16);
      const scrollAngle = Math.tanh(scroll / 1800) * 0.065;

      const plane = (
        centerX: number,
        centerY: number,
        size: number,
        phase: number,
        opacity: number,
      ) => {
        const tilt = 0.52 + Math.sin(time * 0.09 + phase) * 0.045;
        const turn = -0.32 + pointerX * 0.035 + scrollAngle;
        const spin = -0.28 + Math.sin(time * 0.07 + phase) * 0.035;
        const project = ([x, y, z]: Point) => {
          const py = y * Math.cos(tilt) - z * Math.sin(tilt);
          const pz = y * Math.sin(tilt) + z * Math.cos(tilt);
          const px = x * Math.cos(turn) + pz * Math.sin(turn);
          const depth = -x * Math.sin(turn) + pz * Math.cos(turn);
          const perspective = 3.8 / (3.8 + depth);
          return [
            centerX +
              (px * Math.cos(spin) - py * Math.sin(spin)) * size * perspective,
            centerY +
              (px * Math.sin(spin) + py * Math.cos(spin)) * size * perspective,
          ];
        };
        const line = (
          from: Point,
          to: Point,
          alpha = opacity,
          weight = 0.8,
        ) => {
          const [ax, ay] = project(from);
          const [bx, by] = project(to);
          context.strokeStyle = `rgba(34,75,232,${alpha})`;
          context.lineWidth = weight;
          context.beginPath();
          context.moveTo(ax, ay);
          context.lineTo(bx, by);
          context.stroke();
        };

        // Receding grid cells connect the engineering and photography motifs.
        for (let i = -4; i <= 4; i++) {
          const value = i / 4;
          const fade = 1 - Math.abs(i) * 0.13;
          line([value, -0.65, 0], [value, 0.65, 0], opacity * fade);
          line([-1, value * 0.65, 0], [1, value * 0.65, 0], opacity * fade);
        }

        // A second focal plane moves independently, like a camera's framing guides.
        const depth = 0.32 + Math.sin(time * 0.13 + phase) * 0.065;
        for (const x of [-1, 1]) {
          for (const y of [-1, 1]) {
            const corner: Point = [x * 0.73, y * 0.47, depth];
            line(corner, [x * 0.49, y * 0.47, depth], opacity * 1.65, 1.2);
            line(corner, [x * 0.73, y * 0.27, depth], opacity * 1.65, 1.2);
          }
        }
        for (const point of [
          [-0.5, 0.325, 0],
          [0.75, -0.325, 0],
          [0.25, 0, 0],
        ] as const) {
          const [x, y] = project(point);
          context.fillStyle = `rgba(34,75,232,${opacity * 1.8})`;
          context.fillRect(x - 1.5, y - 1.5, 3, 3);
        }
      };

      plane(
        width * 0.98 + pointerX * 7,
        height * 0.31 + drift * 9 + pointerY * 5,
        unit,
        0,
        0.15,
      );
      plane(
        width * -0.025 - pointerX * 5,
        height * 0.84 - drift * 7,
        unit * 0.79,
        2.1,
        0.12,
      );
    };

    const animate = (stamp: number) => {
      frame = 0;
      if (disposed || pausedRef.current || document.hidden) return;
      const interval = width < 700 ? 50 : 1000 / 30;
      if (!lastTime || stamp - lastTime >= interval) {
        const delta = lastTime ? Math.min((stamp - lastTime) / 1000, 0.1) : 0;
        time += delta;
        lastTime = stamp;
        const easing = 1 - Math.exp(-delta * 2.5);
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
    <canvas ref={canvasRef} className="ambient-backdrop" aria-hidden="true" />
  );
}
