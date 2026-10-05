// Loads the VRM avatar and brings it to life: it breathes, shifts its weight,
// blinks at uneven intervals, follows the pointer with head and eyes, and now
// and then nods, waves or scratches his head.
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { VRMLoaderPlugin, VRMUtils, type VRM, type VRMHumanBoneName } from "@pixiv/three-vrm";

/** happy: just clicked. curious: hovering a link about him. still: reduced motion. */
export type Mood = { happy: boolean; curious: boolean; still: boolean; presented?: boolean };

const GESTURES = { nod: 1.4, wave: 2.6, scratch: 3 };
type Gesture = keyof typeof GESTURES;
const IDLE_GESTURES: Gesture[] = ["nod", "wave", "scratch"];
const CLICK_GESTURES: Gesture[] = ["wave", "nod", "scratch"];
const ease = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
/** Seconds the standing figure takes to get up from the floor. */
const ENTRANCE = 5.1;

/** `onReady` reports whether the model loaded, once, so the page can reveal it. */
export function createAvatar3D(canvas: HTMLCanvasElement, fullBody = false, onReady?: (loaded: boolean) => void) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  // Phones are commonly 3x; capping lower leaves the line art visibly soft there.
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 3));
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
  let hipsY = 0;
  let hipsZ = 0;
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
    hipsY = bone("hips")?.position.y ?? 0;
    hipsZ = bone("hips")?.position.z ?? 0;
    if (loaded.lookAt) loaded.lookAt.target = gaze;
    scene.add(loaded.scene);
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
  const rest = new THREE.Vector3();
  const standLeft = new THREE.Vector3();
  const standRight = new THREE.Vector3();
  type Anchor = "head" | "chest" | "hips" | "world";
  type Vec = [number, number, number];
  /** A wrist position and elbow direction, both in the space of an anchor bone. */
  type Hold = { anchor: Anchor; target: Vec; hint: Vec };
  const place = ({ anchor, target, hint }: Hold, wrist: THREE.Vector3, elbow: THREE.Vector3) => {
    if (anchor === "world") return void (wrist.set(...target), elbow.set(...hint));
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
    if (!upper || !lower || !hand || (anchor !== "world" && !bone(anchor))) return;
    upper.rotation.set(0.1, 0, sign * -1.36);
    lower.rotation.set(0, sign * 0.35, sign * -0.06);
    if (weight <= 0 && !from) return;
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
    solve(upper, lower, hand, weight);
  }

  /**
   * Two-bone IK for an arm or a leg. Expects `shoulderAt` (the root joint),
   * `wristAt` (where the end joint should go) and `pole` (which way the middle
   * joint points), all in world space; blends in by `weight`.
   */
  function solve(upper: THREE.Object3D, lower: THREE.Object3D, end: THREE.Object3D, weight: number) {
    const upperLength = lower.position.length();
    const lowerLength = end.position.length();
    // Find the middle joint on the circle where both bone lengths fit.
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
    reachTurn.setFromUnitVectors(rest.copy(lower.position).normalize(), along.subVectors(elbowAt, shoulderAt).normalize().applyQuaternion(parentTurn));
    upper.quaternion.copy(restTurn).slerp(reachTurn, weight);
    parentTurn.invert().multiply(upper.quaternion).invert();
    restTurn.copy(lower.quaternion);
    reachTurn.setFromUnitVectors(rest.copy(end.position).normalize(), along.subVectors(wristAt, elbowAt).normalize().applyQuaternion(parentTurn));
    lower.quaternion.copy(restTurn).slerp(reachTurn, weight);
  }

  /** Put an ankle at `ankle` with the knee pointing along `knee` (world space). */
  function stride(side: "left" | "right", ankle: THREE.Vector3, knee: THREE.Vector3, weight: number) {
    const upper = bone(`${side}UpperLeg`);
    const lower = bone(`${side}LowerLeg`);
    const foot = bone(`${side}Foot`);
    if (!upper || !lower || !foot) return;
    upper.getWorldPosition(shoulderAt);
    wristAt.copy(ankle);
    pole.copy(knee);
    solve(upper, lower, foot, weight);
  }

  const footTurn = new THREE.Euler(0, 0, 0, "YXZ");
  /**
   * Hold a foot at a world pitch (toes down) and yaw, whatever the leg is doing.
   * `straight` instead keeps the ankle straight: the toes point the way the
   * front of the shin faces, as the knee bends, with the foot a little relaxed.
   */
  function footing(side: "left" | "right", pitch: number, yaw: number, straight: number, weight: number) {
    const foot = bone(`${side}Foot`);
    const lower = bone(`${side}LowerLeg`);
    if (!foot || !lower) return;
    reachTurn.setFromEuler(footTurn.set(pitch, yaw, 0));
    if (straight > 0) {
      lower.getWorldPosition(elbowAt);
      along.subVectors(elbowAt, lower.parent!.getWorldPosition(shoulderAt)).normalize(); // thigh
      pole.subVectors(foot.getWorldPosition(wristAt), elbowAt).normalize(); // shin
      along.addScaledVector(pole, 0.25 - along.dot(pole)).normalize(); // toes
      pole.negate().addScaledVector(along, pole.dot(along)).normalize(); // up the shin
      restTurn.setFromRotationMatrix(basis.makeBasis(rest.crossVectors(pole, along), pole, along));
      reachTurn.slerp(restTurn, straight);
    }
    foot.parent!.getWorldQuaternion(parentTurn).invert();
    foot.quaternion.slerp(parentTurn.multiply(reachTurn), weight);
  }

  /**
   * Key poses of the standing figure's entrance, as [seconds, channels]. He sits
   * cross-legged looking at his lap, looks up, leans in and plants his left hand
   * on the floor, uncrosses his right leg and plants that foot where it will
   * stand, comes up onto his left knee, pushes off the right knee, steps the
   * left foot through and straightens. `hips`, `left` and `right` are the
   * standing pelvis and ankles, so the planted foot never slides and the last
   * key lands exactly on the stance.
   *
   * Channels: 0-2 pelvis position, 3 pelvis pitch, 4 spine lean, 5 head drop,
   * 6-8 left ankle, 9-11 right ankle, 12-14 left knee direction, 15-17 right
   * knee direction, 18-19 left and right foot pitch (toes down), 20-21 their
   * yaw, 22-23 weight of the left and right hand resting on its own leg, 24 how
   * far down the shin they rest (0 is the knee), 25 weight of the left hand on
   * the floor, 26 spine tilt toward that hand, 27 weight of the leg solver (0
   * hands over to the standing pose), 28-29 how far the left and right ankle
   * are simply held straight instead of at that pitch and yaw.
   */
  function entranceKeys(hips: THREE.Vector3, left: THREE.Vector3, right: THREE.Vector3): [number, number[]][] {
    const seatZ = right.z - 0.4;
    const kneelZ = right.z - 0.367;
    const key = (pelvis: Vec, pitch: number, lean: number, head: number, leftAnkle: Vec, rightAnkle: Vec, leftKnee: Vec, rightKnee: Vec, feet: number[], hands: number[], tilt: number, legs: number, straight = [0, 0]) => [
      ...pelvis, pitch, lean, head, ...leftAnkle, ...rightAnkle, ...leftKnee, ...rightKnee, ...feet, ...hands, tilt, legs, ...straight,
    ];
    const stance: Vec = [right.x, right.y, right.z];
    // Slumped, knees a little off the floor, shins crossed, toes pointing forward.
    const seated = (head: number, lean: number) =>
      key([0, 0.16, seatZ], -0.2, lean, head, [-0.14, 0.07, seatZ + 0.27], [0.12, 0.09, seatZ + 0.33], [1, 0.28, 0.2], [-1, 0.28, 0.2], [0.25, 0.25, 0.1, -0.1], [1, 1, 0.45, 0], 0.04, 1, [1, 1]);
    const leanIn = key([0.02, 0.16, seatZ - 0.03], -0.1, 0.95, 0.2, [-0.14, 0.07, seatZ + 0.27], [0.12, 0.09, seatZ + 0.33], [1, 0.28, 0.2], [-1, 0.4, 0.2], [0.25, 0.25, 0.1, -0.1], [0, 1, 0.45, 1], 0.14, 1, [1, 1]);
    const uncross = key([0.04, 0.17, seatZ + 0.02], -0.05, 0.8, 0.25, [-0.08, 0.07, seatZ + 0.22], stance, [1, 0.3, 0.2], [-0.2, 1, 0.3], [0.25, 0, 0.1, -0.2], [0, 1, 0, 1], 0.17, 1, [1, 0]);
    const kneel = key([-0.07, 0.5, kneelZ], 0.1, 0.55, 0.1, [0.1, 0.12, kneelZ - 0.45], stance, [0, 0, 1], [-0.25, 1, 0.5], [1.2, 0, 0.1, -0.2], [0, 1, 0, 0], 0, 1);
    const push = key([-0.06, 0.8, kneelZ * 0.45], 0.12, 0.6, 0, [left.x + 0.02, left.y + 0.09, kneelZ * 0.9], stance, [0, 0, 1], [-0.4, 0.3, 1], [0.5, 0, 0.2, -0.2], [0, 0.9, 0, 0], 0, 1);
    // The left foot lands heel first a little short of where it will stand.
    const step = key([hips.x - 0.03, hips.y - 0.06, hips.z - 0.05], 0.05, 0.3, 0, [left.x, left.y + 0.05, left.z - 0.1], stance, [0, 0, 1], [-0.2, 0, 1], [-0.15, 0, 0.2, -0.2], [0, 0.15, 0, 0], 0, 1);
    const stand = (lean: number, legs: number) =>
      key([hips.x, hips.y, hips.z], 0, lean, 0, [left.x, left.y, left.z], stance, [0, 0, 1], [0, 0, 1], [0, 0, 0.2, -0.2], [0, 0, 0, 0], 0, legs);
    // Unhurried: slow up to the knee, a beat there, a steady push, then settle.
    // prettier-ignore
    return [
      [0, seated(0.3, 0.5)], [0.35, seated(0.3, 0.5)], [0.85, seated(-0.05, 0.42)], [1.15, seated(-0.05, 0.42)],
      [1.55, leanIn], [2.15, uncross], [2.85, kneel], [3.1, kneel], [3.7, push], [4.05, step],
      [4.45, stand(-0.04, 1)], [4.8, stand(0, 0)], [ENTRANCE, stand(0, 0)],
    ];
  }
  /** The entrance pose at `time`, on a Catmull-Rom curve through the keys so nothing stops dead between them. */
  function entrancePose(keys: [number, number[]][], time: number) {
    let i = 0;
    while (i < keys.length - 2 && time >= keys[i + 1][0]) i++;
    const at = (k: number) => keys[Math.min(keys.length - 1, Math.max(0, k))][1];
    const u = clamp01((time - keys[i][0]) / (keys[i + 1][0] - keys[i][0]));
    return at(i).map((p1, c) => {
      const [p0, p2, p3] = [at(i - 1)[c], at(i + 1)[c], at(i + 2)[c]];
      return 0.5 * (2 * p1 + (p2 - p0) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u * u + (3 * p1 - p0 - 3 * p2 + p3) * u * u * u);
    });
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
  // The standing figure enters sitting cross-legged on the floor, gets up,
  // then folds his arms. Seconds of entrance played so far; it only advances
  // while frames are drawn, so it waits until he is on screen. The pose keys
  // run until ENTRANCE; the arms start folding just before.
  let entrance = fullBody ? 0 : Infinity;
  // The portrait reveal owns this clock: loading behind the photo must not
  // consume the opening pose. Keep the arms folded while turning to the camera.
  let portraitTime = 0;
  let nextBlink = 1.5;
  let blinkStart = -Infinity;

  function frame() {
    const delta = Math.min(clock.getDelta(), 0.1);
    const t = clock.elapsedTime;
    const { mood } = pose;
    const alive = mood.still ? 0 : 1;
    if (vrm) entrance = alive ? entrance + delta : Infinity;
    // Entering, he looks at the camera; once up, he eases into following the pointer.
    if (!fullBody && vrm && mood.presented) portraitTime = alive ? portraitTime + delta : Infinity;
    const portraitTurn = ease(clamp01((portraitTime - 0.7) / 1.7));
    const portraitYaw = fullBody ? 0 : -0.38 + portraitTurn * 0.26;
    const follow = fullBody
      ? ease(clamp01((entrance - ENTRANCE) / 0.8))
      : ease(clamp01((portraitTime - 4.4) / 0.8));
    const x = pose.x * follow;
    const y = pose.y * follow;
    const fold = fullBody
      ? ease(clamp01((entrance - 4.45) / 0.9))
      : 1 - ease(clamp01((portraitTime - 3) / 1.4));
    const toward = (value: number, target: number, rate: number) => value + (target - value) * Math.min(1, delta * rate);

    // --- Feelings
    happiness = mood.still ? Number(mood.happy) : toward(happiness, mood.happy ? 1 : 0, 10);
    curiosity = toward(curiosity, mood.curious ? 1 : 0, 6);
    // Each click plays the next gesture; left alone, he fidgets by himself.
    if (mood.happy && !wasHappy && alive) play(CLICK_GESTURES[clicks++ % CLICK_GESTURES.length]);
    else if (alive && vrm && (fullBody ? fold >= 1 : portraitTime > 7) && t > nextIdleGesture) play(IDLE_GESTURES[Math.floor(Math.random() * IDLE_GESTURES.length)]);
    wasHappy = mood.happy;
    // Gesture envelope: ease in, hold, ease out. `u` is progress through it.
    const u = (t - gestureStart) / GESTURES[gesture];
    const amount = alive && u >= 0 && u <= 1 ? ease(clamp01(u / 0.2)) * ease(clamp01((1 - u) / 0.25)) : 0;
    const nod = gesture === "nod" && amount ? amount * Math.sin(u * Math.PI * 4) : 0;
    const wave = gesture === "wave" ? amount : 0;
    const scratch = gesture === "scratch" ? amount : 0;
    // Blinks come at uneven intervals, sometimes in pairs.
    if (alive && t > nextBlink) {
      blinkStart = t;
      nextBlink = t + (Math.random() < 0.2 ? 0.3 : 2 + Math.random() * 4);
    }
    // Entering, he blinks once as he lifts his head and then holds the viewer's eye.
    if (entrance < 2) nextBlink = Math.max(nextBlink, t + 1);
    const blink = entrance < 2 ? Math.sin(clamp01((entrance - 0.45) / 0.18) * Math.PI) : Math.sin(clamp01((t - blinkStart) / 0.16) * Math.PI);

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
      hips?.rotation.set(0, portraitYaw + hipSway * 0.03, hipSway * 0.012 - settle * 0.05);
      if (hips) hips.position.x = hipsX - settle * 0.02;
      // The legs undo the pelvis tilt and shift so the feet stay planted.
      const plant = settle * 0.075;
      bone("leftUpperLeg")?.rotation.set(-stance * 0.15, stance * 0.12, plant + stance * 0.07);
      bone("leftLowerLeg")?.rotation.set(stance * 0.28, 0, 0);
      bone("leftFoot")?.rotation.set(-stance * 0.13, stance * 0.22, -stance * 0.095);
      bone("rightUpperLeg")?.rotation.set(0, -stance * 0.12, plant - stance * 0.07);
      bone("rightLowerLeg")?.rotation.set(0, 0, 0);
      bone("rightFoot")?.rotation.set(0, -stance * 0.2, stance * 0.045);
      // The spine leans back over the pelvis, so the shoulders stay level.
      bone("spine")?.rotation.set(lift * 0.012, x * 0.1 - sway * 0.02, -sway * 0.01 + settle * 0.03);
      bone("chest")?.rotation.set(lift * 0.015 + laugh * 0.012, 0, settle * 0.02);
      hips?.position.setY(hipsY).setZ(hipsZ);
      // Entrance: the keyed pose drives the pelvis, legs and lean until he stands.
      const intro = hips && entrance < ENTRANCE ? entrancePose(entranceKeys(hips.position, bone("leftFoot")!.getWorldPosition(standLeft), bone("rightFoot")!.getWorldPosition(standRight)), entrance) : null;
      if (intro && hips) {
        const legs = clamp01(intro[27]);
        hips.position.set(intro[0], intro[1], intro[2]);
        hips.rotation.x = intro[3];
        bone("spine")!.rotation.x += intro[4] * 0.6;
        bone("spine")!.rotation.z -= intro[26];
        bone("chest")!.rotation.x += intro[4] * 0.4;
        stride("left", fromWrist.set(intro[6], intro[7], intro[8]), fromPole.set(intro[12], intro[13], intro[14]), legs);
        stride("right", fromWrist.set(intro[9], intro[10], intro[11]), fromPole.set(intro[15], intro[16], intro[17]), legs);
        footing("left", intro[18], intro[20], clamp01(intro[28]), legs);
        footing("right", intro[19], intro[21], clamp01(intro[29]), legs);
      }
      // Head: follows the pointer, drifts a little, tilts when curious, tips back to laugh.
      // Standing, he nods deeper so it reads at the smaller scale.
      const bow = nod * (1 + stance * 0.6);
      // Looking up bends further back than looking down, so a pointer above him reads clearly.
      const lookUp = clamp01(-y);
      bone("neck")?.rotation.set(y * 0.1 - lookUp * 0.14 + drift * 0.012 + bow * 0.06, x * 0.22, curiosity * 0.05);
      bone("head")?.rotation.set(
        y * 0.14 - lookUp * 0.16 - happiness * 0.1 + laugh * 0.015 + drift * 0.015 + bow * 0.14,
        x * 0.26 + Math.sin(t * 0.41) * 0.03 * alive - portraitYaw * (0.5 + portraitTurn * 0.5),
        -x * 0.05 + curiosity * 0.1 + sway * 0.015 + wave * 0.06 + scratch * 0.1 + stance * 0.15,
      );
      // Standing, the chin drops a touch, which reads friendlier than a level stare.
      // Sitting or rising, the head lifts against the lean to keep him looking out.
      if (fullBody) bone("head")!.rotation.x += 0.12 + (intro ? intro[5] - (intro[3] + intro[4]) * 0.85 : 0);
      // Arms: relaxed at the sides, breathing with the shoulders. For a gesture
      // the hand is placed on the head by inverse kinematics, so it lands where
      // the head actually is, whichever way he is facing.
      // Standing, the shoulders sit lower and rolled back.
      bone("leftShoulder")?.rotation.set(0, stance * 0.05, lift * 0.012 - stance * 0.14);
      bone("rightShoulder")?.rotation.set(0, -stance * 0.05, -lift * 0.012 + stance * 0.14);
      const fidget = Math.sin(t * 12);
      const swing = Math.sin(t * 9);
      // At rest, he folds his arms in a shallow X: the right forearm rides higher
      // and in front, the left tucks under it, elbows flared past the torso. A
      // gesture unfolds one arm from there.
      const foldLeft: Hold = { anchor: "chest", target: [-0.09, -0.03, 0.17], hint: [1, -0.55, -0.15] };
      const foldRight: Hold = { anchor: "chest", target: [0.08, 0.06, 0.24], hint: [-1, -0.55, -0.15] };
      if (intro && fold <= 0) {
        // Entrance: each hand rests on its own shin, then the left plants on the
        // floor beside him and the right pushes off the raised knee.
        for (const side of ["left", "right"] as const) {
          const along = side === "left" ? intro[24] * 1.3 : intro[24];
          bone(`${side}LowerLeg`)!.getWorldPosition(fromWrist).lerp(bone(`${side}Foot`)!.getWorldPosition(fromPole), along);
          fromWrist.y += 0.08;
          let weight = clamp01(intro[side === "left" ? 22 : 23]);
          if (side === "left") {
            const floor = clamp01(intro[25]);
            fromWrist.lerp(fromPole.set(0.33, 0.05, standRight.z - 0.3), floor / Math.max(0.001, floor + weight));
            weight = Math.max(weight, floor);
          }
          // A free arm hangs straight down from the shoulder however far he leans.
          const sign = side === "left" ? 1 : -1;
          bone(`${side}UpperArm`)!.getWorldPosition(fromPole);
          fromWrist.lerpVectors(fromPole.set(fromPole.x + sign * 0.07, fromPole.y - 0.43, fromPole.z + 0.05), fromWrist, weight);
          reach(side, Math.max(weight, clamp01((intro[3] + intro[4]) * 3)), "world", [fromWrist.x, fromWrist.y, fromWrist.z + 0.02], [sign, -0.3, -0.5]);
        }
      } else if (fullBody ? fold < 1 : fold > 0) {
        reach("left", fold, foldLeft.anchor, foldLeft.target, foldLeft.hint);
        reach("right", fold, foldRight.anchor, foldRight.target, foldRight.hint);
      } else {
      // Wave: the left hand comes up beside the face and swings from the elbow.
      reach("left", wave, "chest", [0.21 + swing * 0.04, 0.27, 0.16], [0.4, -0.9, 0.2], fullBody ? foldLeft : undefined);
      // Scratch: the right hand goes to the back of the head (x toward his left, y up, z forward).
      reach("right", scratch, "head", [-0.115 + fidget * 0.006, 0.14 + fidget * 0.012, -0.045], [-0.5, -0.5, 0.7], fullBody ? foldRight : undefined);
      }
      bone("leftHand")?.rotation.set(0, 0, 0);
      bone("rightHand")?.rotation.set(0, 0, -scratch * (0.55 + fidget * 0.12));
      // Waving, the open palm faces where he is looking, fingers up and leaning a
      // little outward, rocking side to side with the forearm.
      const tilt = 0.18 + swing * 0.26;
      orient("left", waveFingers.set(Math.sin(tilt), Math.cos(tilt), 0.1), wavePalm.set(x * 0.5, -y * 0.3, 1), wave);
      if (intro && fold <= 0) {
        // Entrance: palms lie flat on whatever they rest on, fingers draped forward.
        const floor = clamp01(intro[25]);
        orient("left", waveFingers.set(-0.5 + floor, -0.2, 0.8), wavePalm.set(0, -1, 0.1), Math.max(clamp01(intro[22]), floor));
        orient("right", waveFingers.set(0.5 - 0.3 * (1 - intro[24] / 0.45), -0.35, 0.8), wavePalm.set(0, -1, -0.2), clamp01(intro[23]));
      }
      {
        // Folded, the hands wrap around the upper arms with the fingers curled.
        // The left hand tucks under the right arm; the right hand grips the left
        // upper arm from above, fingers wrapping down behind it.
        aim("left", [-0.6, 0, -1], (1 - wave) * fold);
        aim("right", [0.8, -0.45, -0.7], (1 - scratch) * fold);
        for (const finger of ["Index", "Middle", "Ring", "Little"] as const)
          for (const joint of ["Proximal", "Intermediate", "Distal"] as const) {
            const curl = joint === "Distal" ? 0.7 : 1.1;
            // Resting on a leg, the fingers curl loosely.
            bone(`left${finger}${joint}`)?.rotation.set(0, 0, -curl * (1 - wave) * Math.max(fold, intro ? clamp01(intro[22]) * 0.35 : 0));
            bone(`right${finger}${joint}`)?.rotation.set(0, 0, curl * (1 - scratch * 0.6) * Math.max(fold, intro ? clamp01(intro[23]) * 0.35 : 0));
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
