// Loads the VRM avatar and brings it to life: it breathes, shifts its weight,
// blinks at uneven intervals, follows the pointer with head and eyes, and now
// and then nods, waves or scratches his head.
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { VRMLoaderPlugin, VRMUtils, type VRM, type VRMHumanBoneName } from "@pixiv/three-vrm";

/** happy: just clicked. curious: hovering a link about him. still: reduced motion. */
export type Mood = { happy: boolean; curious: boolean; still: boolean };

const GESTURES = { nod: 1.4, wave: 2.6, scratch: 3 };
type Gesture = keyof typeof GESTURES;
const IDLE_GESTURES: Gesture[] = ["nod", "wave", "scratch"];
const CLICK_GESTURES: Gesture[] = ["wave", "nod", "scratch"];
const ease = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

export function createAvatar3D(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(26, 1, 0.05, 20);
  const light = new THREE.DirectionalLight("#ffffff", 2.1);
  light.position.set(-1, 1.5, 2).normalize();
  scene.add(light);

  // The eyes track this point, which sits between the avatar and the camera.
  const gaze = new THREE.Object3D();
  scene.add(gaze);

  let vrm: VRM | null = null;
  // Face meshes carrying the mouth and brow smile morphs, driven directly by name.
  const smileMeshes: THREE.Mesh[] = [];
  let disposed = false;
  let headHeight = 1.4;
  const bone = (name: VRMHumanBoneName) => vrm?.humanoid.getNormalizedBoneNode(name);
  const loader = new GLTFLoader();
  loader.register((parser) => new VRMLoaderPlugin(parser));
  loader.load("/avatar.vrm", (gltf) => {
    const loaded = gltf.userData.vrm as VRM;
    if (disposed) return VRMUtils.deepDispose(loaded.scene);
    VRMUtils.removeUnnecessaryVertices(gltf.scene);
    loaded.scene.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (mesh.morphTargetDictionary && "Fcl_MTH_Fun" in mesh.morphTargetDictionary) smileMeshes.push(mesh);
      // Skinned meshes are culled by their rest-pose bounds, which the pose can leave.
      object.frustumCulled = false;
      // The lenses are fairly opaque in the export; thin them so the eyes read clearly.
      const materials = (object as THREE.Mesh).material;
      for (const material of Array.isArray(materials) ? materials : materials ? [materials] : [])
        if (/Glasses.*Lens/.test(material.name)) material.opacity = 0.3;
    });
    vrm = loaded;
    headHeight = bone("head")?.getWorldPosition(new THREE.Vector3()).y ?? headHeight;
    if (loaded.lookAt) loaded.lookAt.target = gaze;
    scene.add(loaded.scene);
    play("wave"); // say hello on arrival
    frame();
  });

  // Scratch vectors for the arm solver.
  const shoulderAt = new THREE.Vector3();
  const elbowAt = new THREE.Vector3();
  const wristAt = new THREE.Vector3();
  const along = new THREE.Vector3();
  const pole = new THREE.Vector3();
  const parentTurn = new THREE.Quaternion();
  const anchorTurn = new THREE.Quaternion();
  const restTurn = new THREE.Quaternion();
  const reachTurn = new THREE.Quaternion();
  /**
   * Pose one arm: relaxed at the side when `weight` is 0, and with the wrist at
   * `target` (in the space of the `anchor` bone) when it is 1. `hint` says which
   * way the elbow points.
   */
  function reach(side: "left" | "right", weight: number, anchor: "head" | "chest", target: [number, number, number], hint: [number, number, number]) {
    const sign = side === "left" ? 1 : -1;
    const upper = bone(`${side}UpperArm`);
    const lower = bone(`${side}LowerArm`);
    const hand = bone(`${side}Hand`);
    const base = bone(anchor);
    if (!upper || !lower || !hand || !base) return;
    const rest = new THREE.Vector3(sign, 0, 0); // arms lie along X in the T-pose
    upper.rotation.set(0.1, 0, sign * -1.25);
    lower.rotation.set(0, sign * 0.25, sign * -0.1);
    if (weight <= 0) return;
    const upperLength = lower.position.length();
    const lowerLength = hand.position.length();
    upper.getWorldPosition(shoulderAt);
    base.getWorldQuaternion(anchorTurn);
    base.getWorldPosition(wristAt).add(along.set(...target).applyQuaternion(anchorTurn));
    // Two-bone IK: find the elbow on the circle where both bone lengths fit.
    along.subVectors(wristAt, shoulderAt);
    const distance = THREE.MathUtils.clamp(along.length(), Math.abs(upperLength - lowerLength) + 0.01, upperLength + lowerLength - 0.005);
    along.normalize();
    wristAt.copy(shoulderAt).addScaledVector(along, distance);
    const toElbow = (upperLength ** 2 - lowerLength ** 2 + distance ** 2) / (2 * distance);
    pole.set(...hint).applyQuaternion(anchorTurn);
    pole.addScaledVector(along, -pole.dot(along)).normalize();
    elbowAt.copy(shoulderAt).addScaledVector(along, toElbow).addScaledVector(pole, Math.sqrt(Math.max(0, upperLength ** 2 - toElbow ** 2)));
    // Turn each bone from its rest direction to its solved direction, then blend in.
    upper.parent!.getWorldQuaternion(parentTurn).invert();
    restTurn.copy(upper.quaternion);
    reachTurn.setFromUnitVectors(rest, along.subVectors(elbowAt, shoulderAt).normalize().applyQuaternion(parentTurn));
    upper.quaternion.copy(restTurn).slerp(reachTurn, weight);
    parentTurn.invert().multiply(upper.quaternion).invert();
    restTurn.copy(lower.quaternion);
    reachTurn.setFromUnitVectors(rest, along.subVectors(wristAt, elbowAt).normalize().applyQuaternion(parentTurn));
    lower.quaternion.copy(restTurn).slerp(reachTurn, weight);
  }

  const pose = { x: 0, y: 0, mood: { happy: false, curious: false, still: false } as Mood };
  const clock = new THREE.Clock();
  let happiness = 0;
  let curiosity = 0;
  let gesture: Gesture = "nod";
  let gestureStart = -Infinity;
  let nextIdleGesture = 9;
  let clicks = 0;
  const play = (next: Gesture) => {
    gesture = next;
    gestureStart = clock.elapsedTime;
    nextIdleGesture = gestureStart + 7 + Math.random() * 6;
  };
  let wasHappy = false;
  let nextBlink = 1.5;
  let blinkStart = -Infinity;

  function frame() {
    const delta = Math.min(clock.getDelta(), 0.1);
    const t = clock.elapsedTime;
    const { x, y, mood } = pose;
    const alive = mood.still ? 0 : 1;
    const toward = (value: number, target: number, rate: number) => value + (target - value) * Math.min(1, delta * rate);

    // --- Feelings
    happiness = mood.still ? Number(mood.happy) : toward(happiness, mood.happy ? 1 : 0, 10);
    curiosity = toward(curiosity, mood.curious ? 1 : 0, 6);
    // Each click plays the next gesture; left alone, he fidgets by himself.
    if (mood.happy && !wasHappy && alive) play(CLICK_GESTURES[clicks++ % CLICK_GESTURES.length]);
    else if (alive && vrm && t > nextIdleGesture) play(IDLE_GESTURES[Math.floor(Math.random() * IDLE_GESTURES.length)]);
    wasHappy = mood.happy;
    // Gesture envelope: ease in, hold, ease out. `u` is progress through it.
    const u = (t - gestureStart) / GESTURES[gesture];
    const amount = alive && u >= 0 && u <= 1 ? ease(clamp01(u / 0.2)) * ease(clamp01((1 - u) / 0.25)) : 0;
    const nod = gesture === "nod" ? amount * Math.sin(u * Math.PI * 4) : 0;
    const wave = gesture === "wave" ? amount : 0;
    const scratch = gesture === "scratch" ? amount : 0;
    // Blinks come at uneven intervals, sometimes in pairs.
    if (alive && t > nextBlink) {
      blinkStart = t;
      nextBlink = t + (Math.random() < 0.2 ? 0.3 : 2 + Math.random() * 4);
    }
    const blink = Math.sin(clamp01((t - blinkStart) / 0.16) * Math.PI);

    // --- Camera: a fixed bust framing.
    camera.position.set(0, headHeight + 0.01, 1.46);
    camera.lookAt(0, headHeight - 0.05, 0);

    if (vrm) {
      const breath = Math.sin(t * 1.7) * alive;
      const sway = Math.sin(t * 0.55) * alive;
      const drift = Math.sin(t * 0.83 + 1.3) * alive;
      const laugh = happiness * Math.sin(t * 17) * alive;
      // Weight shifts through the hips while the chest breathes and laughs.
      bone("hips")?.rotation.set(0, sway * 0.03, sway * 0.012);
      bone("spine")?.rotation.set(breath * 0.012, x * 0.1 - sway * 0.02, -sway * 0.01);
      bone("chest")?.rotation.set(breath * 0.015 + laugh * 0.012, 0, 0);
      // Head: follows the pointer, drifts a little, tilts when curious, tips back to laugh.
      bone("neck")?.rotation.set(y * 0.1 + drift * 0.012 + nod * 0.06, x * 0.22, curiosity * 0.05);
      bone("head")?.rotation.set(
        y * 0.14 - happiness * 0.1 + laugh * 0.015 + drift * 0.015 + nod * 0.14,
        x * 0.26 + Math.sin(t * 0.41) * 0.03 * alive,
        -x * 0.05 + curiosity * 0.1 + sway * 0.015 + wave * 0.06 + scratch * 0.1,
      );
      // Arms: relaxed at the sides, breathing with the shoulders. For a gesture
      // the hand is placed on the head by inverse kinematics, so it lands where
      // the head actually is, whichever way he is facing.
      bone("leftShoulder")?.rotation.set(0, 0, breath * 0.012);
      bone("rightShoulder")?.rotation.set(0, 0, -breath * 0.012);
      const fidget = Math.sin(t * 12);
      const swing = Math.sin(t * 9);
      // Wave: the left hand comes up beside the face and swings from the elbow.
      reach("left", wave, "chest", [0.15 + swing * 0.03, 0.27, 0.16], [0.4, -0.9, 0.2]);
      // Scratch: the right hand goes to the back of the head (x toward his left, y up, z forward).
      reach("right", scratch, "head", [-0.115 + fidget * 0.006, 0.14 + fidget * 0.012, -0.045], [-0.5, -0.5, 0.7]);
      bone("leftHand")?.rotation.set(0, 0, wave * swing * 0.3);
      bone("rightHand")?.rotation.set(0, 0, -scratch * (0.55 + fidget * 0.12));

      gaze.position.set(x * 1.4, headHeight - y * 0.8, 2);
      vrm.scene.position.y = breath * 0.003 + happiness * Math.abs(Math.sin(t * 9)) * 0.006 * alive;
      const face = vrm.expressionManager;
      face?.setValue("happy", happiness);
      face?.setValue("blink", happiness > 0.5 ? 0 : blink);
      // A resting smile that leaves the eyes open: it comes and goes, and warms
      // up during a gesture or when something has his interest.
      const smile = (1 - happiness) * Math.max(curiosity * 0.9, wave, scratch * 0.9, 0.35 + 0.2 * Math.sin(t * 0.23));
      for (const mesh of smileMeshes) {
        mesh.morphTargetInfluences![mesh.morphTargetDictionary!.Fcl_MTH_Fun] = smile;
        mesh.morphTargetInfluences![mesh.morphTargetDictionary!.Fcl_BRW_Fun] = smile * 0.6;
        // Lips part a little when he tilts his head back to look up.
        mesh.morphTargetInfluences![mesh.morphTargetDictionary!.Fcl_MTH_A] = (1 - happiness) * clamp01(-y) * 0.4;
      }
      vrm.update(delta);
    }
    renderer.render(scene, camera);
  }
  function render(x: number, y: number, mood: Mood) {
    Object.assign(pose, { x, y, mood });
    frame();
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
    disposed = true;
    if (vrm) VRMUtils.deepDispose(vrm.scene);
    renderer.dispose();
  }
  return { render, resize, dispose };
}
