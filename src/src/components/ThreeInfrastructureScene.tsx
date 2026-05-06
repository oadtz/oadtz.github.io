import { useEffect, useRef } from 'react';
import {
  AdditiveBlending,
  AmbientLight,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CatmullRomCurve3,
  Color,
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

    const ambient = new AmbientLight(0x8fb9ff, 0.82);
    scene.add(ambient);

    const key = new PointLight(0x59d8ff, 4.4, 18);
    key.position.set(-3, 4, 5);
    scene.add(key);

    const green = new PointLight(0x70f0b0, 2.4, 15);
    green.position.set(4, -2, 3);
    scene.add(green);

    const solar = new PointLight(0xffc66d, 1.6, 16);
    solar.position.set(-4.5, 2.8, 4.5);
    scene.add(solar);

    const lineMaterial = new LineBasicMaterial({
      color: 0x73e8ff,
      transparent: true,
      opacity: 0.14,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    const glowMaterial = new MeshBasicMaterial({
      color: 0x73f2c3,
      transparent: true,
      opacity: 0.2,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    const haloMaterial = new MeshBasicMaterial({
      color: 0x63d9ff,
      transparent: true,
      opacity: 0.07,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    const blockMaterial = new MeshPhysicalMaterial({
      color: 0x80ddff,
      roughness: 0.22,
      metalness: 0.05,
      transmission: 0.72,
      transparent: true,
      opacity: isCompact ? 0.08 : 0.12,
      thickness: 0.8,
    });

    const starCount = isCompact ? 72 : 168;
    const starGeometry = new BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    const starPalette = [new Color(0xf4fbf9), new Color(0xa7fff0), new Color(0x63d9ff), new Color(0xffd166)];
    const seeded = (seed: number) => {
      const value = Math.sin(seed * 12.9898) * 43758.5453;
      return value - Math.floor(value);
    };

    for (let index = 0; index < starCount; index += 1) {
      const x = (seeded(index + 1) - 0.5) * 8.6 + 0.8;
      const y = (seeded(index + 61) - 0.5) * 5.2 + 0.35;
      const z = -3.8 - seeded(index + 131) * 2.4;
      const color = starPalette[index % starPalette.length].clone().multiplyScalar(0.55 + seeded(index + 211) * 0.45);
      starPositions[index * 3] = x;
      starPositions[index * 3 + 1] = y;
      starPositions[index * 3 + 2] = z;
      starColors[index * 3] = color.r;
      starColors[index * 3 + 1] = color.g;
      starColors[index * 3 + 2] = color.b;
    }

    starGeometry.setAttribute('position', new BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new BufferAttribute(starColors, 3));
    const starMaterial = new PointsMaterial({
      size: isCompact ? 0.018 : 0.024,
      transparent: true,
      opacity: 0.48,
      vertexColors: true,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    const starField = new Points(starGeometry, starMaterial);
    root.add(starField);

    const orbitGroup = new Group();
    root.add(orbitGroup);

    const orbitMaterials = [0x63d9ff, 0x76f0b7, 0xffd166].map(
      (color, index) =>
        new MeshBasicMaterial({
          color,
          transparent: true,
          opacity: index === 2 ? 0.08 : 0.1,
          blending: AdditiveBlending,
          depthWrite: false,
        }),
    );
    const orbitScales = [1, 0.82, 1.16];
    orbitMaterials.forEach((material, index) => {
      const orbit = new Mesh(new TorusGeometry(2.55 * orbitScales[index], 0.004, 8, 180), material);
      orbit.rotation.set(Math.PI / (2.6 + index * 0.28), 0.18 + index * 0.42, -0.34 + index * 0.32);
      orbit.position.set(0.08, 0.08 - index * 0.04, -0.06);
      orbitGroup.add(orbit);
    });

    const nodeVisuals = nodePositions.map((position, index) => {
      const group = new Group();
      group.position.copy(position);

      const coreMaterial = glowMaterial.clone();
      coreMaterial.color.set(index % 2 === 0 ? 0x76f0b7 : 0x63d9ff);
      const core = new Mesh(new IcosahedronGeometry(0.17, 2), coreMaterial);
      const halo = new Mesh(new IcosahedronGeometry(0.36, 2), haloMaterial.clone());
      const ring = new Mesh(
        new TorusGeometry(0.34, 0.005, 12, 72),
        new MeshBasicMaterial({
          color: index === 1 || index === 4 ? 0xffd166 : 0x6fdcff,
          transparent: true,
          opacity: 0.2,
          blending: AdditiveBlending,
          depthWrite: false,
        }),
      );
      ring.rotation.x = Math.PI / 2.4;
      group.add(halo, core, ring);

      if (!isCompact && (index === 2 || index === 3)) {
        const block = new Mesh(new BoxGeometry(0.42, 0.42, 0.42), blockMaterial.clone());
        block.rotation.set(0.55, 0.76, 0.2);
        group.add(block);
      }

      root.add(group);
      return { group, core, halo, ring };
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
      size: isCompact ? 0.018 : 0.024,
      transparent: true,
      opacity: isCompact ? 0.32 : 0.42,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    const particles = new Points(particleGeometry, particleMaterial);
    root.add(particles);

    const grid = new GridHelper(9, 18, 0x224a57, 0x15313a);
    grid.position.y = -1.72;
    grid.rotation.x = 0.22;
    (grid.material as Material).transparent = true;
    (grid.material as Material).opacity = 0.055;
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

      frame += reduceMotion ? 0.0012 : 0.0065;
      const activeIndex = Math.max(0, ['Water', 'Markets', 'Ledger', 'AI Delivery', 'Leadership'].indexOf(activeNodeRef.current));

      starField.rotation.y += reduceMotion ? 0.00002 : 0.0001;
      starField.rotation.z = Math.sin(frame * 0.16) * 0.012;
      starMaterial.opacity = (reduceMotion ? 0.38 : 0.44) + Math.sin(frame * 0.5) * 0.035;

      orbitGroup.rotation.y += reduceMotion ? 0.00008 : 0.00035;
      orbitGroup.rotation.z = Math.sin(frame * 0.28) * 0.028;

      for (let index = 0; index < particleCount; index += 1) {
        particleProgress[index] = (particleProgress[index] + (reduceMotion ? 0.00014 : 0.0009)) % 1;
        const routeIndex = particleRoutes[index];
        const start = nodePositions[routeIndex];
        const end = nodePositions[routeIndex + 1];
        const t = particleProgress[index];
        const wave = Math.sin((t + index * 0.071) * Math.PI) * 0.24;
        const point = start.clone().lerp(end, t);
        particlePositions[index * 3] = point.x;
        particlePositions[index * 3 + 1] = point.y + wave;
        particlePositions[index * 3 + 2] = point.z + Math.cos(frame + index) * 0.12;
      }
      particleGeometry.attributes.position.needsUpdate = true;

      nodeVisuals.forEach(({ group, core, halo, ring }, index) => {
        const isActive = index === activeIndex;
        const scale = isActive ? 1.08 + Math.sin(frame * 1.1) * 0.018 : 0.92 + Math.sin(frame * 0.72 + index) * 0.01;
        group.scale.setScalar(scale);
        group.rotation.y += reduceMotion ? 0.0004 : 0.0017;
        group.rotation.z = Math.sin(frame * 0.42 + index) * 0.025;
        ring.rotation.y += reduceMotion ? 0.0005 : 0.0024;
        (core.material as MeshBasicMaterial).opacity = isActive ? 0.3 : 0.18;
        (halo.material as MeshBasicMaterial).opacity = isActive ? 0.12 : 0.06;
        (ring.material as MeshBasicMaterial).opacity = isActive ? 0.3 : 0.18;
      });

      root.rotation.y += ((pointer.x * 0.045) - root.rotation.y) * 0.022;
      root.rotation.x += ((-pointer.y * 0.024) - root.rotation.x) * 0.022;
      root.position.y = (isCompact ? -0.35 : 0.18) + Math.sin(frame * 0.32) * 0.04;
      renderer.render(scene, camera);
      raf = window.requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.cancelAnimationFrame(raf);
      mount.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      visibilityObserver.disconnect();
      root.traverse((object) => {
        const renderable = object as Mesh | Points | Line;
        renderable.geometry?.dispose();
        const material = renderable.material;
        if (Array.isArray(material)) {
          material.forEach((item) => item.dispose());
        } else {
          material?.dispose();
        }
      });
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div className="three-scene" ref={mountRef} aria-hidden="true" />;
}
