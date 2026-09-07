import { useEffect, useRef } from "react";
import {
  Color,
  Mesh,
  PerspectiveCamera,
  PlaneGeometry,
  Raycaster,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderer,
} from "three";

const vertexShader = `
  uniform float uTime;
  uniform vec2 uRipple;
  uniform float uRippleTime;
  varying vec3 vPosition;
  float heightAt(vec2 p) {
    float wave = sin(p.x * 2.3 + p.y * 1.8 + uTime * .55) * .055;
    wave += sin(p.x * -1.4 + p.y * 3.5 - uTime * .7) * .035;
    wave += sin(p.x * 5.1 + p.y * 2.1 + uTime * .85) * .018;
    float age = uTime - uRippleTime;
    float distanceToRipple = distance(p, uRipple);
    float front = distanceToRipple - age * 1.1;
    float envelope = exp(-front * front * 5.0) * exp(-age * .45);
    wave += sin(front * 15.0) * envelope * .13;
    return wave;
  }
  void main() {
    vec3 p = position;
    p.z = heightAt(p.xy);
    vPosition = p;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;
const fragmentShader = `
  uniform vec3 uDeep;
  uniform vec3 uLight;
  varying vec3 vPosition;
  void main() {
    vec3 normal = normalize(cross(dFdx(vPosition), dFdy(vPosition)));
    if (normal.z < 0.0) normal = -normal;
    vec3 light = normalize(vec3(-.4, 1.0, 1.7));
    vec3 view = normalize(vec3(0., -1.4, 2.1));
    float diffuse = max(dot(normal, light), 0.0);
    float fresnel = pow(1.0 - max(dot(normal, view), 0.0), 3.0);
    float specular = pow(max(dot(normal, normalize(light + view)), 0.0), 100.0);
    float ribbon = smoothstep(.93, .99, dot(reflect(-view, normal), light));
    vec3 color = mix(uDeep, uLight, diffuse * .43 + vPosition.z * 1.1);
    color = mix(color, vec3(.7, .85, .94), fresnel * .7);
    color += vec3(.72, .88, 1.0) * specular * .72;
    color += vec3(.5, .7, .83) * ribbon * .1;
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;
export default function WaterScene({ paused }: { paused: boolean }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(paused);
  const wakeRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    pausedRef.current = paused;
    wakeRef.current?.();
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
      mount.classList.add("water-fallback");
      mount.textContent = "Water";
      return () => {
        mount.textContent = "";
        mount.classList.remove("water-fallback");
      };
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);
    const scene = new Scene();
    const camera = new PerspectiveCamera(
      38,
      mount.clientWidth / mount.clientHeight,
      0.1,
      40,
    );
    camera.position.set(0, 3.4, 4.8);
    camera.lookAt(0, 0, 0);
    const material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uRipple: { value: new Vector2(0, 0) },
        uRippleTime: { value: -100 },
        uDeep: { value: new Color("#0b4a7b") },
        uLight: { value: new Color("#63b8d4") },
      },
    });
    const geometry = new PlaneGeometry(16, 5, 200, 90);
    const surface = new Mesh(geometry, material);
    surface.rotation.x = -Math.PI / 2;
    scene.add(surface);
    const raycaster = new Raycaster();
    const pointer = new Vector2();
    let frame = 0,
      lastTime = 0,
      elapsed = 0,
      visible = true,
      disposed = false,
      lost = false;
    const draw = () => {
      if (!lost && !disposed) renderer.render(scene, camera);
    };
    const animate = (time: number) => {
      frame = 0;
      if (
        disposed ||
        lost ||
        pausedRef.current ||
        !visible ||
        document.hidden
      ) {
        lastTime = 0;
        return;
      }
      elapsed += lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0;
      lastTime = time;
      material.uniforms.uTime.value = elapsed;
      draw();
      frame = requestAnimationFrame(animate);
    };
    const wake = () => {
      draw();
      if (!frame && !pausedRef.current && visible && !document.hidden && !lost)
        frame = requestAnimationFrame(animate);
    };
    wakeRef.current = wake;
    let lastRipple = -10;
    const ripple = (event: PointerEvent) => {
      if (
        pausedRef.current ||
        (event.type === "pointermove" && elapsed - lastRipple < 0.6)
      )
        return;
      const bounds = mount.getBoundingClientRect();
      pointer.set(
        ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
        (-(event.clientY - bounds.top) / bounds.height) * 2 + 1,
      );
      raycaster.setFromCamera(pointer, camera);
      const intersection = raycaster.intersectObject(surface)[0];
      if (!intersection) return;
      const local = surface.worldToLocal(intersection.point);
      material.uniforms.uRipple.value.set(local.x, local.y);
      material.uniforms.uRippleTime.value = elapsed;
      lastRipple = elapsed;
      wake();
    };
    const resize = new ResizeObserver(() => {
      if (!mount.clientWidth || !mount.clientHeight) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      wake();
    });
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) wake();
    });
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
    mount.addEventListener("pointermove", ripple, { passive: true });
    mount.addEventListener("pointerdown", ripple, { passive: true });
    document.addEventListener("visibilitychange", wake);
    resize.observe(mount);
    observer.observe(mount);
    wake();
    return () => {
      disposed = true;
      wakeRef.current = null;
      cancelAnimationFrame(frame);
      resize.disconnect();
      observer.disconnect();
      mount.removeEventListener("pointermove", ripple);
      mount.removeEventListener("pointerdown", ripple);
      document.removeEventListener("visibilitychange", wake);
      renderer.domElement.removeEventListener("webglcontextlost", contextLost);
      renderer.domElement.removeEventListener(
        "webglcontextrestored",
        contextRestored,
      );
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);
  return <div ref={mountRef} className="three-scene" aria-hidden="true" />;
}
