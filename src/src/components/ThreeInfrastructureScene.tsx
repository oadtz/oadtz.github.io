import { useEffect, useRef } from 'react';
import {
  AmbientLight,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CatmullRomCurve3,
  GridHelper,
  Group,
  IcosahedronGeometry,
  Line,
  LineBasicMaterial,
  Material,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  PerspectiveCamera,
  PointLight,
  Points,
  PointsMaterial,
  Scene,
  SRGBColorSpace,
  TorusGeometry,
  Vector3,
  WebGLRenderer,
} from 'three';

type SceneProps = {
  activeNode: string;
};

const nodePositions = [
  new Vector3(-2.7, -0.45, 0),
  new Vector3(-1.2, 0.9, -0.35),
  new Vector3(0.45, 0.25, 0.25),
  new Vector3(1.65, 1.0, -0.25),
  new Vector3(2.55, -0.35, 0.15),
];

export default function ThreeInfrastructureScene({ activeNode }: SceneProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const activeNodeRef = useRef(activeNode);

  useEffect(() => {
    activeNodeRef.current = activeNode;
  }, [activeNode]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isCompact = window.innerWidth < 700;
    const scene = new Scene();
    const camera = new PerspectiveCamera(45, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(0, 0.2, 7.2);

    const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const root = new Group();
    root.position.x = isCompact ? 0.85 : 1.75;
    root.position.y = isCompact ? -0.35 : 0.18;
    root.scale.setScalar(isCompact ? 0.74 : 0.9);
    scene.add(root);

    const ambient = new AmbientLight(0x8fb9ff, 0.92);
    scene.add(ambient);

    const key = new PointLight(0x59d8ff, 5.2, 18);
    key.position.set(-3, 4, 5);
    scene.add(key);

    const green = new PointLight(0x70f0b0, 2.8, 15);
    green.position.set(4, -2, 3);
    scene.add(green);

    const solar = new PointLight(0xffc66d, 1.8, 16);
    solar.position.set(-4.5, 2.8, 4.5);
    scene.add(solar);

    const lineMaterial = new LineBasicMaterial({ color: 0x3ed9ff, transparent: true, opacity: 0.2 });
    const glowMaterial = new MeshBasicMaterial({ color: 0x73f2c3, transparent: true, opacity: 0.2 });
    const blockMaterial = new MeshPhysicalMaterial({
      color: 0x80ddff,
      roughness: 0.22,
      metalness: 0.05,
      transmission: 0.72,
      transparent: true,
      opacity: isCompact ? 0.11 : 0.18,
      thickness: 0.8,
    });

    const nodes = nodePositions.map((position, index) => {
      const group = new Group();
      group.position.copy(position);

      const core = new Mesh(new IcosahedronGeometry(0.18, 2), glowMaterial.clone());
      const ring = new Mesh(
        new TorusGeometry(0.31, 0.006, 12, 60),
        new MeshBasicMaterial({ color: 0x6fdcff, transparent: true, opacity: 0.27 }),
      );
      ring.rotation.x = Math.PI / 2.4;
      group.add(core, ring);

      if (!isCompact && (index === 2 || index === 3)) {
        const block = new Mesh(new BoxGeometry(0.42, 0.42, 0.42), blockMaterial.clone());
        block.rotation.set(0.55, 0.76, 0.2);
        group.add(block);
      }

      root.add(group);
      return group;
    });

    for (let index = 0; index < nodePositions.length - 1; index += 1) {
      const curve = new CatmullRomCurve3([
        nodePositions[index],
        nodePositions[index].clone().lerp(nodePositions[index + 1], 0.5).add(new Vector3(0, 0.35, 0.12)),
        nodePositions[index + 1],
      ]);
      const line = new Line(new BufferGeometry().setFromPoints(curve.getPoints(70)), lineMaterial);
      root.add(line);
    }

    const particleCount = isCompact ? 46 : 96;
    const particleGeometry = new BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleProgress = Array.from({ length: particleCount }, (_, index) => (index / particleCount) % 1);
    const particleRoutes = Array.from({ length: particleCount }, (_, index) => index % (nodePositions.length - 1));

    particleGeometry.setAttribute('position', new BufferAttribute(particlePositions, 3));
    const particleMaterial = new PointsMaterial({
      color: 0xa7fff0,
      size: isCompact ? 0.018 : 0.028,
      transparent: true,
      opacity: isCompact ? 0.38 : 0.5,
      depthWrite: false,
    });
    const particles = new Points(particleGeometry, particleMaterial);
    root.add(particles);

    const grid = new GridHelper(9, 18, 0x224a57, 0x15313a);
    grid.position.y = -1.72;
    grid.rotation.x = 0.22;
    (grid.material as Material).transparent = true;
    (grid.material as Material).opacity = 0.13;
    root.add(grid);

    const pointer = { x: 0, y: 0 };
    const handlePointerMove = (event: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      pointer.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    };

    const handleResize = () => {
      if (!mount.clientWidth || !mount.clientHeight) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };

    mount.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('resize', handleResize);

    let sceneIsVisible = true;
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      sceneIsVisible = entry.isIntersecting;
    });
    visibilityObserver.observe(mount);

    let frame = 0;
    let raf = 0;
    const animate = () => {
      if (!sceneIsVisible) {
        raf = window.requestAnimationFrame(animate);
        return;
      }

      frame += reduceMotion ? 0.002 : 0.01;
      const activeIndex = Math.max(0, ['Water', 'Markets', 'Ledger', 'AI Delivery', 'Leadership'].indexOf(activeNodeRef.current));

      for (let index = 0; index < particleCount; index += 1) {
        particleProgress[index] = (particleProgress[index] + (reduceMotion ? 0.0002 : 0.0015)) % 1;
        const routeIndex = particleRoutes[index];
        const start = nodePositions[routeIndex];
        const end = nodePositions[routeIndex + 1];
        const t = particleProgress[index];
        const wave = Math.sin((t + index * 0.071) * Math.PI) * 0.18;
        const point = start.clone().lerp(end, t);
        particlePositions[index * 3] = point.x;
        particlePositions[index * 3 + 1] = point.y + wave;
        particlePositions[index * 3 + 2] = point.z + Math.cos(frame + index) * 0.08;
      }
      particleGeometry.attributes.position.needsUpdate = true;

      nodes.forEach((node, index) => {
        const isActive = index === activeIndex;
        const scale = isActive ? 1.12 + Math.sin(frame * 1.4) * 0.02 : 0.92 + Math.sin(frame + index) * 0.012;
        node.scale.setScalar(scale);
        node.rotation.y += reduceMotion ? 0.0006 : 0.0028;
        node.rotation.z = Math.sin(frame * 0.55 + index) * 0.028;
      });

      root.rotation.y += ((pointer.x * 0.07) - root.rotation.y) * 0.028;
      root.rotation.x += ((-pointer.y * 0.035) - root.rotation.x) * 0.028;
      root.position.y = (isCompact ? -0.35 : 0.18) + Math.sin(frame * 0.42) * 0.045;
      renderer.render(scene, camera);
      raf = window.requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.cancelAnimationFrame(raf);
      mount.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      visibilityObserver.disconnect();
      renderer.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      lineMaterial.dispose();
      glowMaterial.dispose();
      blockMaterial.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div className="three-scene" ref={mountRef} aria-hidden="true" />;
}
