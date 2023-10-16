import {
  Scene,
  PerspectiveCamera,
  Mesh,
  WebGLRenderer,
  ShaderMaterial,
  VideoTexture,
  GridHelper,
  SphereGeometry,
  BackSide,
} from "three";
import { VRButton } from "three/addons/webxr/VRButton.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const canvas = document.getElementById("root")!;

const renderer = new WebGLRenderer({
  antialias: true,
  canvas,
});
renderer.xr.enabled = true;
document.body.appendChild(VRButton.createButton(renderer));

const camera = new PerspectiveCamera(
  90,
  window.innerWidth / window.innerHeight,
  0.01,
  100
);
camera.position.z = 1;

new OrbitControls(camera, canvas);

const scene = new Scene();
scene.add(new GridHelper());

const geometry = new SphereGeometry(1, 1024, 512);
const video = document.createElement("video");
video.loop = true;
window.onclick = () => {
  window.onclick = undefined;
  const input = document.createElement("input");
  input.type = "file";
  input.onchange = () => {
    const file = input.files[0];
    if (file == null) {
      return;
    }
    video.src = URL.createObjectURL(file);
    video.play();
  };
  input.click();
};
const material = new ShaderMaterial({
  uniforms: {
    map: { value: new VideoTexture(video) },
  },
  vertexShader: `
  varying vec3 vUv;
  uniform sampler2D map;
  #define M_PI 3.14159

  vec2 worldToSpherical(vec3 flatCoord, float r) {
    return vec2(
        atan(flatCoord.x, flatCoord.z),
        acos(-flatCoord.y / r)
    );   
  }

  void main() {
    vUv = position; 

    float d = texture2D(map, vec2(0.5, 1.0) * worldToSpherical(position, 1.0) / vec2(M_PI, M_PI)).r;
    float depth = 6.0 - pow(d, 0.2) * 5.0;

    vec4 modelViewPosition = modelViewMatrix * vec4(position * vec3(depth), 1.0);
    gl_Position = projectionMatrix * modelViewPosition;
  }`,
  fragmentShader: `
  #define M_PI 3.14159
  varying vec3 vUv;
  uniform sampler2D map;

  vec2 worldToSpherical(vec3 flatCoord, float r) {
    return vec2(
        atan(flatCoord.x, flatCoord.z),
        acos(-flatCoord.y / r)
    );   
  }
 

  void main() {
    gl_FragColor = texture2D(map, vec2(0.5, 0.0) + vec2(0.5, 1.0) * worldToSpherical(vUv, 1.0) / vec2(M_PI, M_PI));
  }`,
});
material.side = BackSide;

const mesh = new Mesh(geometry, material);
mesh.position.y = 1.1;
mesh.scale.setScalar(0.55);
mesh.frustumCulled = false;
scene.add(mesh);

renderer.setSize(window.innerWidth, window.innerHeight);

window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

renderer.setAnimationLoop(() => renderer.render(scene, camera));
