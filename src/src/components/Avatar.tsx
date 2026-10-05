import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { createAvatar3D } from "./avatar3d";

const REVEAL_DURATION = 2400;

const sparks = [
  [12, 22, 120],
  [86, 18, 60],
  [78, 70, 140],
  [18, 64, 90],
  [50, 8, -60],
  [92, 46, -90],
];

/** The VRM avatar, framed as a bust, turning its head toward the pointer. */
export default function Avatar({
  paused,
  hint,
}: {
  paused: boolean;
  hint: string | null;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const happyTimer = useRef(0);
  const [happy, setHappy] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "failed">("loading");
  const [photoLoaded, setPhotoLoaded] = useState(false);
  const [photoHeld, setPhotoHeld] = useState(false);
  const [phase, setPhase] = useState<"photo" | "revealing" | "avatar">("photo");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pose = useRef({ x: 0, y: 0 });
  const moodRef = useRef({ happy: false, curious: false, still: paused, presented: false });
  const sceneRef = useRef<ReturnType<typeof createAvatar3D> | null>(null);
  const paint = () => {
    const { x, y } = pose.current;
    sceneRef.current?.render(x, y, moodRef.current);
  };

  // Count the portrait's reading time only while the hero is actually visible.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !photoLoaded || photoHeld) return;
    let visible = false;
    let timer = 0;
    const sync = () => {
      window.clearTimeout(timer);
      if (visible && !document.hidden) {
        timer = window.setTimeout(() => setPhotoHeld(true), 1100);
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    }, { threshold: 0.35 });
    observer.observe(stage);
    document.addEventListener("visibilitychange", sync);
    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [photoLoaded, photoHeld]);

  useEffect(() => {
    if (status !== "ready" || !photoHeld || phase === "avatar") return;
    const timer = window.setTimeout(() => {
      if (paused || phase === "revealing") {
        setPhase("avatar");
      } else {
        setPhase("revealing");
      }
    }, paused || phase === "photo" ? 0 : REVEAL_DURATION);
    return () => window.clearTimeout(timer);
  }, [status, photoHeld, phase, paused]);

  useEffect(() => {
    moodRef.current = { happy, curious: hint !== null, still: paused, presented: phase !== "photo" };
    // Reduced motion has no animation loop, so repaint the expression here.
    if (paused) paint();
  }, [happy, hint, paused, phase]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    const resize = new ResizeObserver(() => {
      sceneRef.current?.resize();
      paint();
    });
    // three.js loads on demand so the rest of the page isn't waiting on it.
    import("./avatar3d")
      .then(({ createAvatar3D }) => {
        if (cancelled) return;
        sceneRef.current = createAvatar3D(canvas, false, (loaded) => {
          if (!cancelled) setStatus(loaded ? "ready" : "failed");
        });
        sceneRef.current.resize();
        paint();
        resize.observe(canvas);
      })
      .catch(() => {
        // No WebGL: retain the real portrait.
        if (!cancelled) setStatus("failed");
      });
    return () => {
      cancelled = true;
      resize.disconnect();
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    stage.style.setProperty("--x", "0");
    stage.style.setProperty("--y", "0");
    pose.current = { x: 0, y: 0 };
    paint();
    if (paused) return;
    let x = 0,
      y = 0,
      targetX = 0,
      targetY = 0,
      lastPointer = -Infinity,
      last = 0,
      frame = 0,
      visible = true;
    const clamp = (value: number) => Math.max(-1, Math.min(1, value));
    const tick = (now: number) => {
      const delta = last ? Math.min((now - last) / 1000, 0.1) : 0;
      last = now;
      // Without a mouse (touch, or idle), the character looks around by itself.
      if (now - lastPointer > 2600) {
        const t = now / 1000;
        targetX = Math.sin(t * 0.55) * 0.5 + Math.sin(t * 1.3) * 0.12;
        targetY = Math.sin(t * 0.8) * 0.28;
      }
      const easing = 1 - Math.exp(-delta * 7);
      x += (targetX - x) * easing;
      y += (targetY - y) * easing;
      stage.style.setProperty("--x", x.toFixed(4));
      stage.style.setProperty("--y", y.toFixed(4));
      pose.current = { x, y };
      paint();
      frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      last = 0;
      if (visible && !document.hidden) frame = requestAnimationFrame(tick);
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const bounds = stage.getBoundingClientRect();
      targetX = clamp(
        (event.clientX - bounds.left - bounds.width / 2) /
          (window.innerWidth * 0.45),
      );
      targetY = clamp(
        (event.clientY - bounds.top - bounds.height * 0.4) /
          (window.innerHeight * 0.5),
      );
      lastPointer = performance.now();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    observer.observe(stage);
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("visibilitychange", sync);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("pointermove", move);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [paused]);

  useEffect(() => () => clearTimeout(happyTimer.current), []);

  const poke = () => {
    setHappy(true);
    clearTimeout(happyTimer.current);
    happyTimer.current = window.setTimeout(() => setHappy(false), 1500);
  };

  return (
    <div
      className="avatar-stage"
      ref={stageRef}
      data-happy={happy || undefined}
      data-status={status}
      data-phase={phase}
      style={{ "--reveal-duration": `${REVEAL_DURATION}ms` } as CSSProperties}
    >
      <div className="avatar-scene">
        <div className="avatar-halo" />
        <button
          className="avatar-figure"
          type="button"
          onClick={poke}
          disabled={phase !== "avatar"}
          aria-label={phase === "avatar" ? "Cartoon Thanapat. Click to say hi." : "Portrait of Thanapat Pirmphol"}
        >
          <canvas ref={canvasRef} aria-hidden="true" />
          <span className="avatar-portrait" aria-hidden="true">
            <img
              src="/profile-cutout.png"
              alt=""
              width="1254"
              height="1254"
              fetchPriority="high"
              onLoad={() => setPhotoLoaded(true)}
              onError={(event) => {
                // The original photo also provides a fallback if the cutout fails.
                if (!event.currentTarget.src.endsWith("/profile.jpg")) {
                  event.currentTarget.src = "/profile.jpg";
                } else {
                  setPhotoHeld(true);
                }
              }}
            />
          </span>
          <span className="avatar-transformation" aria-hidden="true" />
        </button>
        {sparks.map(([left, top, depth], index) => (
          <span
            className="avatar-spark"
            key={index}
            style={
              {
                left: `${left}%`,
                top: `${top}%`,
                "--z": `${depth}px`,
                animationDelay: `${index * -1.3}s`,
              } as CSSProperties
            }
          />
        ))}
      </div>
    </div>
  );
}
