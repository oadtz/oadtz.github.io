// A clay / vinyl-toy style 3D bust: smooth sculpted forms, physical materials
// and studio lighting with soft shadows. Features are real geometry, placed on
// the head surface, so they hold up as the head turns.
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export type Mood = { happy: boolean; blink: boolean };

const smooth = THREE.MathUtils.smoothstep;

// ---- Head shape: a sphere with a tapered jaw and a slightly flat face.
// Cheeks stay full down to mouth level, then the jaw tapers to the chin.
const jaw = (y0: number) => smooth(-y0, 0.3, 1);
function deform(x0: number, y0: number, z0: number): [number, number, number] {
  const t = jaw(y0);
  return [x0 * 0.96 * (1 - 0.3 * t), y0 * (y0 < 0 ? 0.98 : 1.04), z0 * (z0 > 0 ? 0.93 : 1) * (1 - 0.1 * t)];
}
/** Front surface depth of the head at face position (x, y). */
function surfaceZ(x: number, y: number) {
  const y0 = y / (y < 0 ? 0.98 : 1.04);
  const t = jaw(y0);
  const x0 = x / (0.96 * (1 - 0.3 * t));
  return Math.sqrt(Math.max(0, 1 - x0 * x0 - y0 * y0)) * 0.93 * (1 - 0.1 * t);
}
const FORWARD = new THREE.Vector3(0, 0, 1);
/** Position and orientation for something sitting on the face at (x, y). */
function onFace(x: number, y: number, lift = 0, facing = 1) {
  const e = 0.01;
  const normal = new THREE.Vector3(
    -(surfaceZ(x + e, y) - surfaceZ(x - e, y)) / (2 * e),
    -(surfaceZ(x, y + e) - surfaceZ(x, y - e)) / (2 * e),
    1,
  ).normalize();
  const position = new THREE.Vector3(x, y, surfaceZ(x, y)).addScaledVector(normal, lift);
  // facing < 1 blends the orientation back toward straight ahead.
  const quaternion = new THREE.Quaternion().slerp(new THREE.Quaternion().setFromUnitVectors(FORWARD, normal), facing);
  return { position, quaternion };
}

export function createAvatar3D(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = environment;
  scene.environmentIntensity = 0.55;
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
  camera.position.set(0, -0.25, 7.7);
  camera.lookAt(0, -0.47, 0);

  // Studio lighting: warm key with soft shadows, plus cyan and pink rims.
  const key = new THREE.DirectionalLight("#fff1e0", 2.4);
  key.position.set(-2.5, 3.5, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = key.shadow.camera.bottom = -2.6;
  key.shadow.camera.right = key.shadow.camera.top = 2.6;
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 14;
  key.shadow.radius = 5;
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.03;
  const rimRight = new THREE.DirectionalLight("#6ee7ff", 3.2);
  rimRight.position.set(4.5, 2, -3.5);
  const rimLeft = new THREE.DirectionalLight("#ff9be0", 1.0);
  rimLeft.position.set(-4.5, 1.5, -3.5);
  scene.add(key, rimRight, rimLeft);

  const clay = (color: string, extra: THREE.MeshPhysicalMaterialParameters = {}) =>
    new THREE.MeshPhysicalMaterial({ color, roughness: 0.6, ...extra });
  const skin = clay("#f3bb95", { roughness: 0.62, sheen: 0.6, sheenColor: new THREE.Color("#ff9d85"), sheenRoughness: 0.5 });
  const hair = clay("#1d1e27", { roughness: 0.72, clearcoat: 0.12, clearcoatRoughness: 0.6 });
  const dark = clay("#1b1a22", { roughness: 0.35, clearcoat: 0.6 });
  const white = clay("#ffffff", { roughness: 0.2, clearcoat: 1 });
  const iris = clay("#6a3c22", { roughness: 0.2, clearcoat: 1 });
  const lip = clay("#b5625a", { roughness: 0.5 });
  const blazer = clay("#3d4662", { roughness: 0.85, sheen: 0.4, sheenColor: new THREE.Color("#aab4d6"), side: THREE.DoubleSide });
  const tee = clay("#202028", { roughness: 0.9, side: THREE.DoubleSide });

  const mesh = (geometry: THREE.BufferGeometry, material: THREE.Material, parent: THREE.Object3D) => {
    const m = new THREE.Mesh(geometry, material);
    m.castShadow = m.receiveShadow = true;
    parent.add(m);
    return m;
  };
  const blob = (parent: THREE.Object3D, material: THREE.Material, s: [number, number, number], p: [number, number, number], r: [number, number, number] = [0, 0, 0]) => {
    const m = mesh(new THREE.SphereGeometry(1, 32, 24), material, parent);
    m.scale.set(...s);
    m.position.set(...p);
    m.rotation.set(...r);
    return m;
  };

  const root = new THREE.Group();
  scene.add(root);

  // ---- Body: tee, open blazer with lapels, neck.
  const body = new THREE.Group();
  body.scale.set(0.88, 1, 0.56);
  root.add(body);
  const profile = new THREE.SplineCurve(
    [
      [0, -2.26],
      [0.85, -2.23],
      [1.17, -2.08],
      [1.25, -1.86],
      [1.16, -1.62],
      [0.84, -1.37],
      [0.46, -1.24],
    ].map(([r, y]) => new THREE.Vector2(r, y)),
  ).getPoints(28);
  const gap = 0.38;
  mesh(new THREE.LatheGeometry(profile.map((p) => new THREE.Vector2(p.x * 0.965, p.y)), 64), tee, body);
  mesh(new THREE.LatheGeometry(profile, 64, gap, Math.PI * 2 - gap * 2), blazer, body);
  const neck = mesh(new THREE.CylinderGeometry(0.33, 0.42, 0.5, 32), skin, root);
  neck.position.y = -1.1;

  // ---- Head (pivots at the base of the skull).
  const pivot = new THREE.Group();
  pivot.position.y = -0.95;
  root.add(pivot);
  const head = new THREE.Group();
  head.position.y = 0.8;
  pivot.add(head);

  const skull = new THREE.SphereGeometry(1, 72, 56);
  const pos = skull.attributes.position;
  for (let i = 0; i < pos.count; i++) pos.setXYZ(i, ...deform(pos.getX(i), pos.getY(i), pos.getZ(i)));
  skull.computeVertexNormals();
  mesh(skull, skin, head);
  for (const side of [-1, 1]) blob(head, skin, [0.11, 0.2, 0.14], [side * 0.98, -0.05, -0.02]);
  const place = <T extends THREE.Object3D>(object: T, x: number, y: number, lift = 0, facing = 1) => {
    const { position, quaternion } = onFace(x, y, lift, facing);
    object.position.copy(position);
    object.quaternion.copy(quaternion);
    head.add(object);
    return object;
  };
  place(blob(head, skin, [0.078, 0.066, 0.07], [0, 0, 0]), 0, -0.19, 0.03);

  // Eyes: glossy sclera, iris, pupil and catch-light, with a lash line on top.
  const eyes = [-1, 1].map((side) => {
    const eye = place(new THREE.Group(), side * 0.36, -0.03, -0.045, 0.5);
    blob(eye, white, [0.172, 0.19, 0.1], [0, 0, 0]);
    const look = new THREE.Group();
    eye.add(look);
    blob(look, iris, [0.132, 0.132, 0.036], [0, -0.015, 0.072]);
    blob(look, dark, [0.064, 0.064, 0.02], [0, -0.015, 0.096]);
    const light = clay("#ffffff", { emissive: new THREE.Color("#ffffff"), emissiveIntensity: 0.9 });
    blob(look, light, [0.03, 0.03, 0.01], [0.045, 0.05, 0.108]);
    blob(look, light, [0.013, 0.013, 0.006], [-0.04, -0.045, 0.106]);
    // Upper lid: the top cap of a slightly larger shell, in skin colour.
    const lid = mesh(new THREE.SphereGeometry(1, 32, 12, 0, Math.PI * 2, 0, 0.88), skin, eye);
    lid.scale.set(0.18, 0.198, 0.108);
    const lash = mesh(new THREE.TorusGeometry(0.139, 0.015, 8, 28, Math.PI), dark, eye);
    lash.rotation.x = Math.PI / 2;
    lash.scale.y = 0.6;
    lash.position.y = 0.125;
    // Closed, smiling eye shown instead when happy.
    const smile = place(new THREE.Group(), side * 0.36, -0.11, 0.02, 0.5);
    mesh(new THREE.TorusGeometry(0.13, 0.028, 8, 24, Math.PI), dark, smile);
    return { eye, look, smile };
  });
  const brows = [-1, 1].map((side) => {
    const brow = place(new THREE.Group(), side * 0.37, 0.34, 0.012);
    // A soft arch: the top slice of a ring, hung so its crest sits on the brow line.
    const arc = Math.PI * 0.4;
    const bar = mesh(new THREE.TorusGeometry(0.24, 0.036, 10, 24, arc), hair, brow);
    bar.rotation.z = Math.PI / 2 - arc / 2 - side * 0.06;
    bar.position.y = -0.24;
    return brow;
  });
  // Cheeks
  const blushMaterial = new THREE.MeshBasicMaterial({ color: "#ff8f8f", transparent: true, opacity: 0.36, depthWrite: false });
  for (const side of [-1, 1]) {
    const cheek = place(new THREE.Mesh(new THREE.CircleGeometry(0.14, 32), blushMaterial), side * 0.55, -0.24, 0.012);
    cheek.scale.y = 0.7;
  }
  // Mouth: a closed smile, swapped for an open laugh when happy.
  const smileMouth = place(new THREE.Group(), 0, -0.28, 0.004);
  const smileArc = mesh(new THREE.TorusGeometry(0.2, 0.026, 8, 28, Math.PI * 0.6), lip, smileMouth);
  smileArc.rotation.z = -Math.PI * 0.8;
  const laugh = place(new THREE.Group(), 0, -0.38, 0.012);
  const flatMaterial = (color: string) => new THREE.MeshStandardMaterial({ color, roughness: 0.5 });
  laugh.add(new THREE.Mesh(new THREE.CircleGeometry(0.19, 32, Math.PI, Math.PI), flatMaterial("#6e2129")));
  const teeth = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.05), flatMaterial("#ffffff"));
  teeth.position.set(0, -0.027, 0.003);
  const tongue = new THREE.Mesh(new THREE.CircleGeometry(0.09, 24), flatMaterial("#e87a80"));
  tongue.scale.y = 0.6;
  tongue.position.set(0, -0.125, 0.003);
  laugh.add(teeth, tongue);

  // ---- Hair: a cap plus sculpted clay volumes, short sides and a swept top.
  const cap = mesh(new THREE.SphereGeometry(1.05, 48, 32, 0, Math.PI * 2, 0, 1.4), hair, head);
  cap.scale.x = 0.97;
  cap.rotation.x = -0.62;
  blob(head, hair, [0.97, 0.5, 0.94], [0.02, 0.62, -0.08], [0, 0, 0.1]);
  blob(head, hair, [0.74, 0.55, 0.5], [0, 0.38, -0.6]);
  // Fringe: clumps drop below the top mass so the hairline is uneven.
  for (const [x, y, w, tilt] of [[-0.44, 0.6, 0.25, 0.5], [-0.17, 0.62, 0.27, 0.3], [0.12, 0.63, 0.26, 0.12], [0.4, 0.6, 0.24, -0.2]]) {
    const clump = place(blob(head, hair, [w, 0.16, 0.12], [0, 0, 0]), x, y, 0.075);
    clump.rotateZ(tilt);
  }
  // Sideburns tie the hair to the ears.
  for (const side of [-1, 1]) blob(head, hair, [0.04, 0.15, 0.1], [side * 0.935, 0.3, 0.14]);
  // A soft quiff rising to one side, merged into the top mass.
  blob(head, hair, [0.66, 0.3, 0.42], [0.1, 0.92, 0.4], [0.5, 0, 0.2]);

  // ---- Glasses: rounded frames with glossy lenses, bridge and arms.
  const lensMaterial = new THREE.MeshPhysicalMaterial({ color: "#dff4ff", transparent: true, opacity: 0.14, roughness: 0.05, clearcoat: 1, depthWrite: false });
  const frameShape = Array.from({ length: 48 }, (_, i) => {
    const a = (i / 48) * Math.PI * 2;
    const c = Math.cos(a);
    const s = Math.sin(a);
    return new THREE.Vector2(Math.sign(c) * Math.abs(c) ** 0.62 * 0.29, Math.sign(s) * Math.abs(s) ** 0.62 * 0.235);
  });
  const frameZ = surfaceZ(0.36, -0.01) + 0.11;
  for (const side of [-1, 1]) {
    const rim = new THREE.Group();
    rim.position.set(side * 0.37, -0.01, frameZ);
    rim.rotation.y = side * 0.3;
    head.add(rim);
    mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(frameShape.map((p) => new THREE.Vector3(p.x, p.y, 0)), true), 96, 0.028, 10, true), dark, rim).castShadow = false;
    rim.add(new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape(frameShape)), lensMaterial));
    const arm = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 0.65, 0.09, frameZ - 0.1),
      new THREE.Vector3(side * 0.88, 0.1, 0.5),
      new THREE.Vector3(side * 0.975, 0.08, 0.12),
      new THREE.Vector3(side * 1.0, 0.04, -0.02),
    ]);
    mesh(new THREE.TubeGeometry(arm, 24, 0.022, 8), dark, head).castShadow = false;
  }
  mesh(
    new THREE.TubeGeometry(
      new THREE.QuadraticBezierCurve3(new THREE.Vector3(-0.1, 0.08, frameZ + 0.01), new THREE.Vector3(0, 0.14, frameZ + 0.04), new THREE.Vector3(0.1, 0.08, frameZ + 0.01)),
      12,
      0.024,
      8,
    ),
    dark,
    head,
  ).castShadow = false;

  let happiness = 0;
  function render(x: number, y: number, bob: number, mood: Mood) {
    // Ease the expression so the laugh pops in rather than snapping.
    happiness += ((mood.happy ? 1 : 0) - happiness) * 0.25;
    pivot.rotation.set(y * 0.32 - happiness * 0.12, x * 0.62, -x * 0.07);
    neck.rotation.y = x * 0.25;
    body.rotation.y = x * 0.14;
    root.position.y = bob * 2 + happiness * 0.05;
    for (const { eye, look, smile } of eyes) {
      eye.visible = !mood.happy;
      smile.visible = mood.happy;
      eye.scale.y = mood.blink ? 0.08 : 1;
      look.position.set(x * 0.045, -y * 0.035, 0);
    }
    brows.forEach((brow, i) => (brow.position.y = onFace((i ? 1 : -1) * 0.37, 0.34 + happiness * 0.06, 0.012).position.y));
    smileMouth.visible = !mood.happy;
    laugh.visible = mood.happy;
    blushMaterial.opacity = 0.36 + happiness * 0.25;
    renderer.render(scene, camera);
  }
  function resize() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  function dispose() {
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        (Array.isArray(object.material) ? object.material : [object.material]).forEach((m) => m.dispose());
      }
    });
    environment.dispose();
    pmrem.dispose();
    renderer.dispose();
  }
  return { render, resize, dispose };
}
