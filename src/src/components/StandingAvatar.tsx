import { useEffect, useRef } from "react";
import type { createAvatar3D } from "./avatar3d";

/** The VRM avatar standing full height. It is only built once scrolled near. */
export default function StandingAvatar({ paused }: { paused: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let scene: ReturnType<typeof createAvatar3D> | null = null;
    let requested = false;
    let cancelled = false;
    let near = false;
    let frame = 0;
    let x = 0;
    let y = 0;
    const mood = { happy: false, curious: false, still: paused };
    const tick = () => {
      scene?.render(x, y, mood);
      if (!paused) frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      if (near && !document.hidden) frame = requestAnimationFrame(tick);
    };
    const resize = new ResizeObserver(() => {
      scene?.resize();
      scene?.render(x, y, mood);
    });
    const observer = new IntersectionObserver(
      ([entry]) => {
        near = entry.isIntersecting;
        if (near && !requested) {
          requested = true;
          import("./avatar3d")
            .then(({ createAvatar3D }) => {
              if (cancelled) return;
              scene = createAvatar3D(canvas, true);
              resize.observe(canvas);
            })
            .catch(() => {
              // No WebGL: the card simply has no figure.
            });
        }
        sync();
      },
      { rootMargin: "400px" },
    );
    observer.observe(canvas);
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const bounds = canvas.getBoundingClientRect();
      const clamp = (value: number) => Math.max(-1, Math.min(1, value));
      x = clamp((event.clientX - bounds.left - bounds.width / 2) / (window.innerWidth * 0.45));
      y = clamp((event.clientY - bounds.top - bounds.height * 0.15) / (window.innerHeight * 0.5));
    };
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("visibilitychange", sync);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      resize.disconnect();
      window.removeEventListener("pointermove", move);
      document.removeEventListener("visibilitychange", sync);
      scene?.dispose();
    };
  }, [paused]);

  return <canvas className="contact-figure" ref={canvasRef} aria-hidden="true" />;
}
