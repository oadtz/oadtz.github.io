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

/** `onReady` reports whether the model loaded, once, so the page can reveal it. */
export function createAvatar3D(canvas: HTMLCanvasElement, fullBody = false, onReady?: (loaded: boolean) => void) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  // A longer lens for the whole figure keeps the legs from stretching.
  const camera = new THREE.PerspectiveCamera(fullBody ? 20 : 26, 1, 0.05, 30);
  const light = new THREE.DirectionalLight("#ffffff", fullBody ? 2.5 : 2.1);
  light.position.set(-1, 1.5, 2).normalize();
  scene.add(light);
  if (fullBody) {
    // A soft cool rim from behind separates the dark hair from the card.
    const rim = new THREE.DirectionalLight("#bfe6ff", 0.6);
    rim.position.set(0.8, 1.4, -1.2).normalize();
    scene.add(rim);
  }

  // The eyes track this point, which sits between the avatar and the camera.
  const gaze = new THREE.Object3D();
  scene.add(gaze);

  let vrm: VRM | null = null;
  // Face meshes carrying the mouth and brow smile morphs, driven directly by name.
  const smileMeshes: THREE.Mesh[] = [];
  let disposed = false;
  let headHeight = 1.4;
  let hipsX = 0;
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
    hipsX = bone("hips")?.position.x ?? 0;
    if (loaded.lookAt) loaded.lookAt.target = gaze;
    scene.add(loaded.scene);
    play("wave"); // say hello on arrival
    frame();
    onReady?.(true);
  }, undefined, () => onReady?.(false));

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
  const fromWrist = new THREE.Vector3();
  const fromPole = new THREE.Vector3();
  type Anchor = "head" | "chest" | "hips";
  type Vec = [number, number, number];
  /** A wrist position and elbow direction, both in the space of an anchor bone. */
  type Hold = { anchor: Anchor; target: Vec; hint: Vec };
  const place = ({ anchor, target, hint }: Hold, wrist: THREE.Vector3, elbow: THREE.Vector3) => {
    const base = bone(anchor)!;
    base.getWorldQuaternion(anchorTurn);
    base.getWorldPosition(wrist).add(along.set(...target).applyQuaternion(anchorTurn));
    elbow.set(...hint).applyQuaternion(anchorTurn);
  };
  /**
   * Pose one arm: relaxed at the side (or holding `from`) when `weight` is 0, and
   * with the wrist at `target` (in the space of the `anchor` bone) when it is 1.
   * `hint` says which way the elbow points.
   */
  function reach(side: "left" | "right", weight: number, anchor: Anchor, target: Vec, hint: Vec, from?: Hold) {
    const sign = side === "left" ? 1 : -1;
    const upper = bone(`${side}UpperArm`);
    const lower = bone(`${side}LowerArm`);
    const hand = bone(`${side}Hand`);
    const base = bone(anchor);
    if (!upper || !lower || !hand || !base) return;
    const rest = new THREE.Vector3(sign, 0, 0); // arms lie along X in the T-pose
    upper.rotation.set(0.1, 0, sign * -1.36);
    lower.rotation.set(0, sign * 0.35, sign * -0.06);
    if (weight <= 0 && !from) return;
    const upperLength = lower.position.length();
    const lowerLength = hand.position.length();
    upper.getWorldPosition(shoulderAt);
    place({ anchor, target, hint }, wristAt, pole);
    if (from) {
      // Travel from the held pose, arcing forward and out so the hand clears
      // the body and face.
      place(from, fromWrist, fromPole);
      wristAt.lerpVectors(fromWrist, wristAt, weight);
      wristAt.z += Math.sin(Math.PI * weight) * 0.08;
      wristAt.x += Math.sin(Math.PI * weight) * 0.14 * sign;
      pole.lerpVectors(fromPole, pole, weight);
      weight = 1;
    }
    // Two-bone IK: find the elbow on the circle where both bone lengths fit.
    along.subVectors(wristAt, shoulderAt);
    const distance = THREE.MathUtils.clamp(along.length(), Math.abs(upperLength - lowerLength) + 0.01, upperLength + lowerLength - 0.005);
    along.normalize();
    wristAt.copy(shoulderAt).addScaledVector(along, distance);
    const toElbow = (upperLength ** 2 - lowerLength ** 2 + distance ** 2) / (2 * distance);
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

  /**
   * Bend a hand at the wrist so its fingers point along `direction` in world
   * space, keeping the forearm's roll so the sleeve cuff doesn't twist.
   */
  function aim(side: "left" | "right", direction: Vec, weight: number) {
    const hand = bone(`${side}Hand`);
    if (!hand || weight <= 0) return;
    hand.getWorldQuaternion(anchorTurn);
    along.set(side === "left" ? 1 : -1, 0, 0).applyQuaternion(anchorTurn);
    reachTurn.setFromUnitVectors(along, pole.set(...direction).normalize()).multiply(anchorTurn);
    hand.parent!.getWorldQuaternion(parentTurn).invert();
    hand.quaternion.slerp(parentTurn.multiply(reachTurn), weight);
  }

  const fingers = new THREE.Vector3();
  const palm = new THREE.Vector3();
  const thumb = new THREE.Vector3();
  const basis = new THREE.Matrix4();
  const rollTurn = new THREE.Quaternion();
  const waveFingers = new THREE.Vector3();
  const wavePalm = new THREE.Vector3();
  /**
   * Turn a hand so its fingers point along `fingerDir` with the palm facing
   * `palmDir` (both world space). The forearm takes the roll, as a real wrist
   * does, so the sleeve cuff doesn't twist.
   */
  function orient(side: "left" | "right", fingerDir: THREE.Vector3, palmDir: THREE.Vector3, weight: number) {
    const lower = bone(`${side}LowerArm`);
    const hand = bone(`${side}Hand`);
    if (!lower || !hand || weight <= 0) return;
    const sign = side === "left" ? 1 : -1;
    // Roll the forearm about its own axis until its palm side faces palmDir.
    lower.getWorldQuaternion(anchorTurn);
    along.set(sign, 0, 0).applyQuaternion(anchorTurn);
    pole.set(0, -1, 0).applyQuaternion(anchorTurn); // the palm faces down in the T-pose
    palm.copy(palmDir).addScaledVector(along, -palmDir.dot(along)).normalize();
    // ponytail: assumes palmDir isn't parallel to the forearm; fine for a wave.
    const angle = Math.atan2(along.dot(thumb.crossVectors(pole, palm)), pole.dot(palm));
    lower.quaternion.multiply(rollTurn.setFromAxisAngle(along.set(sign, 0, 0), angle * weight));
    // Then set the hand: rest axes are fingers ±X, palm -Y, thumb +Z.
    fingers.copy(fingerDir).normalize();
    palm.copy(palmDir).addScaledVector(fingers, -palmDir.dot(fingers)).normalize();
    thumb.crossVectors(palm, fingers).multiplyScalar(sign);
    basis.makeBasis(fingers.clone().multiplyScalar(sign), palm.clone().negate(), thumb);
    reachTurn.setFromRotationMatrix(basis);
    hand.parent!.getWorldQuaternion(parentTurn).invert();
    hand.quaternion.slerp(parentTurn.multiply(reachTurn), weight);
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

    // --- Camera: a fixed framing, either the bust or the whole figure.
    const stance = fullBody ? 1 : 0;
    if (fullBody) {
      // Fit soles to hair with a little room above and below.
      const middle = (headHeight + 0.26) / 2;
      camera.position.set(0, middle, (middle * 1.04 + 0.01) / Math.tan(THREE.MathUtils.degToRad(10)));
      camera.lookAt(0, middle, 0);
    } else {
      camera.position.set(0, headHeight + 0.01, 1.46);
      camera.lookAt(0, headHeight - 0.05, 0);
    }

    if (vrm) {
      const breath = Math.sin(t * 1.7) * alive;
      const sway = Math.sin(t * 0.55) * alive;
      const drift = Math.sin(t * 0.83 + 1.3) * alive;
      const laugh = happiness * Math.sin(t * 17) * alive;
      // Standing, he breathes deeper so the idle motion reads at full height.
      const lift = breath * (1 + stance * 1.4);
      // Weight shifts through the hips while the chest breathes and laughs.
      // Standing, he plants his feet about hip width apart, toes turned out,
      // with a little more weight on the right leg.
      // Standing, the pelvis holds still so the feet don't slide; the spine sways instead.
      const settle = stance;
      const hipSway = sway * (1 - stance);
      const hips = bone("hips");
      hips?.rotation.set(0, hipSway * 0.03, hipSway * 0.012 - settle * 0.05);
      if (hips) hips.position.x = hipsX - settle * 0.02;
      // The legs undo the pelvis tilt and shift so the feet stay planted.
      const plant = settle * 0.075;
      bone("leftUpperLeg")?.rotation.set(-stance * 0.15, stance * 0.12, plant + stance * 0.07);
      bone("leftLowerLeg")?.rotation.set(stance * 0.28, 0, 0);
      bone("leftFoot")?.rotation.set(-stance * 0.13, stance * 0.22, -stance * 0.095);
      bone("rightUpperLeg")?.rotation.set(0, -stance * 0.12, plant - stance * 0.07);
      bone("rightFoot")?.rotation.set(0, -stance * 0.2, stance * 0.045);
      // The spine leans back over the pelvis, so the shoulders stay level.
      bone("spine")?.rotation.set(lift * 0.012, x * 0.1 - sway * 0.02, -sway * 0.01 + settle * 0.03);
      bone("chest")?.rotation.set(lift * 0.015 + laugh * 0.012, 0, settle * 0.02);
      // Head: follows the pointer, drifts a little, tilts when curious, tips back to laugh.
      // Standing, he nods deeper so it reads at the smaller scale.
      const bow = nod * (1 + stance * 0.6);
      // Looking up bends further back than looking down, so a pointer above him reads clearly.
      const lookUp = clamp01(-y);
      bone("neck")?.rotation.set(y * 0.1 - lookUp * 0.14 + drift * 0.012 + bow * 0.06, x * 0.22, curiosity * 0.05);
      bone("head")?.rotation.set(
        y * 0.14 - lookUp * 0.16 - happiness * 0.1 + laugh * 0.015 + drift * 0.015 + bow * 0.14,
        x * 0.26 + Math.sin(t * 0.41) * 0.03 * alive,
        -x * 0.05 + curiosity * 0.1 + sway * 0.015 + wave * 0.06 + scratch * 0.1 + stance * 0.15,
      );
      // Standing, the chin drops a touch, which reads friendlier than a level stare.
      if (fullBody) bone("head")!.rotation.x += 0.12;
      // Arms: relaxed at the sides, breathing with the shoulders. For a gesture
      // the hand is placed on the head by inverse kinematics, so it lands where
      // the head actually is, whichever way he is facing.
      // Standing, the shoulders sit lower and rolled back.
      bone("leftShoulder")?.rotation.set(0, stance * 0.05, lift * 0.012 - stance * 0.14);
      bone("rightShoulder")?.rotation.set(0, -stance * 0.05, -lift * 0.012 + stance * 0.14);
      const fidget = Math.sin(t * 12);
      const swing = Math.sin(t * 9);
      // Standing, he folds his arms in a shallow X: the right forearm rides higher
      // and in front, the left tucks under it, elbows flared past the torso. A
      // gesture unfolds one arm from there.
      const foldLeft: Hold = { anchor: "chest", target: [-0.09, -0.01, 0.15], hint: [1, -0.55, -0.15] };
      const foldRight: Hold = { anchor: "chest", target: [0.09, 0.08, 0.22], hint: [-1, -0.55, -0.15] };
      // Wave: the left hand comes up beside the face and swings from the elbow.
      reach("left", wave, "chest", [0.21 + swing * 0.04, 0.27, 0.16], [0.4, -0.9, 0.2], fullBody ? foldLeft : undefined);
      // Scratch: the right hand goes to the back of the head (x toward his left, y up, z forward).
      reach("right", scratch, "head", [-0.115 + fidget * 0.006, 0.14 + fidget * 0.012, -0.045], [-0.5, -0.5, 0.7], fullBody ? foldRight : undefined);
      bone("leftHand")?.rotation.set(0, 0, 0);
      bone("rightHand")?.rotation.set(0, 0, -scratch * (0.55 + fidget * 0.12));
      // Waving, the open palm faces where he is looking, fingers up and leaning a
      // little outward, rocking side to side with the forearm.
      const tilt = 0.18 + swing * 0.26;
      orient("left", waveFingers.set(Math.sin(tilt), Math.cos(tilt), 0.1), wavePalm.set(x * 0.5, -y * 0.3, 1), wave);
      if (fullBody) {
        // Folded, the hands wrap around the upper arms with the fingers curled.
        // The left hand tucks under the right arm; the right hand grips the left
        // upper arm from above, fingers wrapping down behind it.
        aim("left", [-0.6, 0, -1], 1 - wave);
        aim("right", [0.8, -0.45, -0.7], 1 - scratch);
        for (const finger of ["Index", "Middle", "Ring", "Little"] as const)
          for (const joint of ["Proximal", "Intermediate", "Distal"] as const) {
            const curl = joint === "Distal" ? 0.7 : 1.1;
            bone(`left${finger}${joint}`)?.rotation.set(0, 0, -curl * (1 - wave));
            bone(`right${finger}${joint}`)?.rotation.set(0, 0, curl * (1 - scratch * 0.6));
          }
      }

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
