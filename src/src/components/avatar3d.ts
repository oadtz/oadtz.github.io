// Loads the VRM avatar and drives it: the head and eyes follow the pointer,
// expressions come from the model's own presets, and hair moves on spring bones.
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { VRMLoaderPlugin, VRMUtils, type VRM } from "@pixiv/three-vrm";

export type Mood = { happy: boolean; blink: boolean };

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
  let disposed = false;
  let headHeight = 1.4;
  const loader = new GLTFLoader();
  loader.register((parser) => new VRMLoaderPlugin(parser));
  loader.load("/avatar.vrm", (gltf) => {
    const loaded = gltf.userData.vrm as VRM;
    if (disposed) return VRMUtils.deepDispose(loaded.scene);
    VRMUtils.removeUnnecessaryVertices(gltf.scene);
    // Skinned meshes are culled by their rest-pose bounds, which the pose can leave.
    loaded.scene.traverse((object) => {
      object.frustumCulled = false;
      // The lenses are fairly opaque in the export; thin them so the eyes read clearly.
      const materials = (object as THREE.Mesh).material;
      for (const material of Array.isArray(materials) ? materials : materials ? [materials] : [])
        if (/Glasses.*Lens/.test(material.name)) material.opacity = 0.3;
    });
    // Relax the arms out of the T-pose.
    const bone = (name: Parameters<VRM["humanoid"]["getNormalizedBoneNode"]>[0]) => loaded.humanoid.getNormalizedBoneNode(name);
    for (const [side, sign] of [["left", -1], ["right", 1]] as const) {
      bone(`${side}UpperArm`)?.rotation.set(0.1, 0, sign * 1.25);
      bone(`${side}LowerArm`)?.rotation.set(0, sign * -0.25, sign * 0.1);
    }
    loaded.humanoid.update();
    loaded.scene.updateMatrixWorld(true);
    headHeight = bone("head")?.getWorldPosition(new THREE.Vector3()).y ?? headHeight;
    if (loaded.lookAt) loaded.lookAt.target = gaze;
    scene.add(loaded.scene);
    vrm = loaded;
    frame();
  });

  const pose = { x: 0, y: 0, bob: 0, mood: { happy: false, blink: false } as Mood };
  const clock = new THREE.Clock();
  let happiness = 0;
  function frame() {
    // Bust framing: head and shoulders.
    camera.position.set(0, headHeight + 0.02, 1.32);
    camera.lookAt(0, headHeight - 0.04, 0);
    const delta = Math.min(clock.getDelta(), 0.1);
    if (vrm) {
      const { x, y, bob, mood } = pose;
      happiness += ((mood.happy ? 1 : 0) - happiness) * Math.min(1, delta * 12);
      const node = (name: "neck" | "head" | "spine") => vrm!.humanoid.getNormalizedBoneNode(name);
      node("spine")?.rotation.set(0, x * 0.1, 0);
      node("neck")?.rotation.set(y * 0.1, x * 0.22, 0);
      node("head")?.rotation.set(y * 0.14 - happiness * 0.08, x * 0.26, -x * 0.05);
      gaze.position.set(x * 1.4, headHeight - y * 0.8, 2);
      vrm.scene.position.y = bob * 0.25;
      vrm.expressionManager?.setValue("happy", happiness);
      vrm.expressionManager?.setValue("blink", mood.blink && !mood.happy ? 1 : 0);
      vrm.update(delta);
    }
    renderer.render(scene, camera);
  }
  function render(x: number, y: number, bob: number, mood: Mood) {
    Object.assign(pose, { x, y, bob, mood });
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
