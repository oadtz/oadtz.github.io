import { useEffect, useRef } from "react";
import {
  ACESFilmicToneMapping,
  AmbientLight,
  BufferAttribute,
  BufferGeometry,
  Color,
  DirectionalLight,
  Group,
  IcosahedronGeometry,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshPhysicalMaterial,
  PerspectiveCamera,
  PMREMGenerator,
  Points,
  PointsMaterial,
  Scene,
  SphereGeometry,
  TorusGeometry,
  TorusKnotGeometry,
  Vector3,
  WebGLRenderer,
} from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

type SceneProps = { activeNode: string; paused: boolean };
const palette: Record<string, number> = {
  Water: 0xd2f65a,
  Markets: 0xa9cbff,
  Ledger: 0xc4a4ff,
  "AI Delivery": 0xffb583,
  Leadership: 0xefefe0,
};

export default function ThreeInfrastructureScene({
  activeNode,
  paused,
}: SceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(activeNode);
  const pausedRef = useRef(paused);
  const renderRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    activeRef.current = activeNode;
    renderRef.current?.();
  }, [activeNode]);
  useEffect(() => {
    pausedRef.current = paused;
    renderRef.current?.();
  }, [paused]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "low-power",
      });
    } catch {
      mount.classList.add("scene-unavailable");
      mount.textContent = "∞";
      return () => {
        mount.textContent = "";
        mount.classList.remove("scene-unavailable");
      };
    }
    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, window.innerWidth < 700 ? 1.3 : 1.75),
    );
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    mount.appendChild(renderer.domElement);
    const scene = new Scene();
    const camera = new PerspectiveCamera(
      37,
      mount.clientWidth / mount.clientHeight,
      0.1,
      40,
    );
    camera.position.set(0, 0, 9.3);
    const environment = new RoomEnvironment();
    const pmrem = new PMREMGenerator(renderer);
    const environmentMap = pmrem.fromScene(environment, 0.04);
    scene.environment = environmentMap.texture;
    environment.dispose();
    pmrem.dispose();
    scene.add(new AmbientLight(0xe8f6c9, 1.5));
    const key = new DirectionalLight(0xf6ffea, 4);
    key.position.set(2, 4, 5);
    const rim = new DirectionalLight(0xd2f65a, 3);
    rim.position.set(-4, 1, -2);
    scene.add(key, rim);
    const sculpture = new Group();
    sculpture.rotation.set(0.2, -0.25, -0.35);
    scene.add(sculpture);
    const chrome = new MeshPhysicalMaterial({
      color: 0xc9d1bc,
      metalness: 1,
      roughness: 0.22,
      clearcoat: 1,
      clearcoatRoughness: 0.14,
      envMapIntensity: 1.8,
    });
    const knot = new Mesh(
      new TorusKnotGeometry(1.25, 0.39, 180, 24, 2, 3),
      chrome,
    );
    sculpture.add(knot);
    const wireMaterial = new MeshPhysicalMaterial({
      color: 0xd2f65a,
      metalness: 0.4,
      roughness: 0.3,
      emissive: 0xd2f65a,
      emissiveIntensity: 0.17,
      wireframe: true,
      transparent: true,
      opacity: 0.2,
    });
    const shell = new Mesh(
      new TorusKnotGeometry(1.25, 0.43, 100, 12, 2, 3),
      wireMaterial,
    );
    sculpture.add(shell);
    const orbitGroup = new Group();
    scene.add(orbitGroup);
    const orbitMaterial = new LineBasicMaterial({
      color: 0xd2f65a,
      transparent: true,
      opacity: 0.3,
    });
    for (let i = 0; i < 3; i++) {
      const vertices = Array.from(
        { length: 161 },
        (_, n) =>
          new Vector3(
            Math.cos((n / 160) * Math.PI * 2) * (2.2 + i * 0.15),
            Math.sin((n / 160) * Math.PI * 2) * (2.2 + i * 0.15),
            0,
          ),
      );
      const orbit = new Line(
        new BufferGeometry().setFromPoints(vertices),
        orbitMaterial,
      );
      orbit.rotation.set(0.75 + i * 0.35, 0.35 + i * 0.65, -0.3);
      orbitGroup.add(orbit);
    }
    const satelliteMaterial = new MeshPhysicalMaterial({
      color: 0xd2f65a,
      roughness: 0.28,
      metalness: 0.55,
      emissive: 0xd2f65a,
      emissiveIntensity: 0.1,
    });
    const satellite = new Mesh(
      new IcosahedronGeometry(0.22, 2),
      satelliteMaterial,
    );
    scene.add(satellite);
    const smaller = new Mesh(new SphereGeometry(0.09, 16, 12), chrome);
    scene.add(smaller);
    const hoop = new Mesh(
      new TorusGeometry(2.76, 0.006, 6, 100),
      satelliteMaterial,
    );
    hoop.rotation.set(1.2, 0.6, -0.6);
    scene.add(hoop);
    const positions = new Float32Array(90 * 3);
    for (let i = 0; i < positions.length; i++)
      positions[i] = Math.sin(i * 93.7 + 12.3) * 3.8;
    const dustGeometry = new BufferGeometry();
    dustGeometry.setAttribute("position", new BufferAttribute(positions, 3));
    const dust = new Points(
      dustGeometry,
      new PointsMaterial({
        color: 0xb6c694,
        size: 0.016,
        transparent: true,
        opacity: 0.4,
      }),
    );
    scene.add(dust);
    let targetX = 0,
      targetY = 0,
      elapsed = 0,
      lastTime = 0,
      frame = 0;
    let visible = true,
      lost = false,
      disposed = false;
    const accent = new Color();
    const draw = () => {
      if (disposed || lost) return;
      accent.set(palette[activeRef.current] ?? palette.Water);
      satelliteMaterial.color.copy(accent);
      satelliteMaterial.emissive.copy(accent);
      wireMaterial.color.copy(accent);
      wireMaterial.emissive.copy(accent);
      orbitMaterial.color.copy(accent);
      const angle = elapsed * 0.22;
      satellite.position.set(
        Math.cos(angle + 0.3) * 2.35,
        Math.sin(angle + 0.3) * 1.3,
        Math.sin(angle) * 1.3,
      );
      smaller.position.set(
        Math.cos(angle + 3.8) * 2.6,
        Math.sin(angle + 3.8) * 1.8,
        -0.4,
      );
      renderer.render(scene, camera);
    };
    const animate = (time: number) => {
      frame = 0;
      if (
        disposed ||
        lost ||
        !visible ||
        document.hidden ||
        pausedRef.current
      ) {
        lastTime = 0;
        return;
      }
      const delta = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0;
      lastTime = time;
      elapsed += delta;
      knot.rotation.y = elapsed * 0.14;
      knot.rotation.z = Math.sin(elapsed * 0.2) * 0.09;
      shell.rotation.copy(knot.rotation);
      sculpture.rotation.y +=
        (targetX * 0.28 - 0.25 - sculpture.rotation.y) * 0.025;
      sculpture.rotation.x +=
        (targetY * 0.2 + 0.2 - sculpture.rotation.x) * 0.025;
      sculpture.position.y = Math.sin(elapsed * 0.65) * 0.08;
      orbitGroup.rotation.y = elapsed * 0.035;
      draw();
      frame = requestAnimationFrame(animate);
    };
    const wake = () => {
      draw();
      if (!frame && visible && !document.hidden && !pausedRef.current && !lost)
        frame = requestAnimationFrame(animate);
    };
    renderRef.current = wake;
    const pointerMove = (event: PointerEvent) => {
      if (pausedRef.current || event.pointerType === "touch") return;
      const bounds = mount.getBoundingClientRect();
      targetX = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      targetY = ((event.clientY - bounds.top) / bounds.height) * 2 - 1;
    };
    const pointerLeave = () => {
      targetX = 0;
      targetY = 0;
    };
    const resize = new ResizeObserver(() => {
      if (!mount.clientWidth || !mount.clientHeight) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.position.z = camera.aspect < 1 ? 10.5 : 9.3;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      wake();
    });
    resize.observe(mount);
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) wake();
    });
    visibility.observe(mount);
    const contextLost = (event: Event) => {
      event.preventDefault();
      lost = true;
      cancelAnimationFrame(frame);
      frame = 0;
    };
    const contextRestored = () => {
      lost = false;
      wake();
    };
    renderer.domElement.addEventListener("webglcontextlost", contextLost);
    renderer.domElement.addEventListener(
      "webglcontextrestored",
      contextRestored,
    );
    mount.addEventListener("pointermove", pointerMove);
    mount.addEventListener("pointerleave", pointerLeave);
    document.addEventListener("visibilitychange", wake);
    wake();
    return () => {
      disposed = true;
      renderRef.current = null;
      cancelAnimationFrame(frame);
      resize.disconnect();
      visibility.disconnect();
      mount.removeEventListener("pointermove", pointerMove);
      mount.removeEventListener("pointerleave", pointerLeave);
      document.removeEventListener("visibilitychange", wake);
      renderer.domElement.removeEventListener("webglcontextlost", contextLost);
      renderer.domElement.removeEventListener(
        "webglcontextrestored",
        contextRestored,
      );
      scene.traverse((object) => {
        const renderable = object as Mesh;
        renderable.geometry?.dispose();
        if (Array.isArray(renderable.material))
          renderable.material.forEach((material) => material.dispose());
        else renderable.material?.dispose();
      });
      environmentMap.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);
  return <div className="three-scene" ref={mountRef} aria-hidden="true" />;
}
