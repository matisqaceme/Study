import { useRef, useState } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'

const COUNT_X = 176
const COUNT_Z = 92
const FIELD_W = 17
const FIELD_D = 9.5

// Ashima / Ian McEwan simplex noise (MIT), trimmed to 3D.
const NOISE_GLSL = /* glsl */ `
vec3 mod289(vec3 x){return x - floor(x * (1.0/289.0)) * 289.0;}
vec4 mod289(vec4 x){return x - floor(x * (1.0/289.0)) * 289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`

const VERTEX = /* glsl */ `
uniform float uTime;
uniform vec2 uMouse;
uniform float uPixelRatio;
uniform float uSize;
attribute float aRand;
varying float vElev;
varying float vRand;
varying float vDepth;
${NOISE_GLSL}
void main() {
  vec3 p = position;
  float t = uTime * 0.16;

  float n = snoise(vec3(p.x * 0.24, p.z * 0.30, t)) * 0.55;
  n += snoise(vec3(p.x * 0.85 + 31.4, p.z * 0.85, t * 1.7)) * 0.10;

  // Gentle swell under the cursor.
  vec2 m = vec2(uMouse.x * 6.5, -uMouse.y * 3.4);
  float d = distance(p.xz, m);
  n += smoothstep(2.6, 0.0, d) * 0.22;

  p.y += n;
  vElev = n;
  vRand = aRand;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
  // Clamp so near particles stay fine grains, never blobs.
  gl_PointSize = min(uSize * uPixelRatio / vDepth, 7.5 * uPixelRatio);
}
`

const FRAGMENT = /* glsl */ `
uniform float uTime;
uniform float uOpacity;
uniform vec3 uColorDeep;
uniform vec3 uColorGold;
uniform vec3 uColorPale;
varying float vElev;
varying float vRand;
varying float vDepth;
void main() {
  float r = length(gl_PointCoord - 0.5);
  float disc = smoothstep(0.5, 0.12, r);
  if (disc < 0.001) discard;

  float e = clamp(vElev * 1.1 + 0.5, 0.0, 1.0);
  float shimmer = 0.72 + 0.28 * sin(uTime * 0.85 + vRand * 6.2831853);

  vec3 col = mix(uColorDeep, uColorGold, e);
  col = mix(col, uColorPale, smoothstep(0.78, 1.0, e) * 0.65);

  float depthFade = smoothstep(11.0, 4.5, vDepth) * smoothstep(1.6, 3.0, vDepth);
  float alpha = disc * shimmer * mix(0.18, 0.8, e) * depthFade * uOpacity;
  gl_FragColor = vec4(col, alpha);
}
`

// This chunk is lazy-loaded and the scene is mounted once, so the
// geometry buffers, uniforms and scratch vectors can live at module
// scope as shared singletons.
function buildField() {
  const count = COUNT_X * COUNT_Z
  const positions = new Float32Array(count * 3)
  const rands = new Float32Array(count)
  let i = 0
  for (let ix = 0; ix < COUNT_X; ix += 1) {
    for (let iz = 0; iz < COUNT_Z; iz += 1) {
      positions[i * 3] =
        (ix / (COUNT_X - 1) - 0.5) * FIELD_W + (Math.random() - 0.5) * 0.05
      positions[i * 3 + 1] = 0
      positions[i * 3 + 2] =
        (iz / (COUNT_Z - 1) - 0.5) * FIELD_D + (Math.random() - 0.5) * 0.05
      rands[i] = Math.random()
      i += 1
    }
  }
  return { positions, rands }
}

const { positions, rands } = buildField()
const smoothMouse = new THREE.Vector2(0, 0)
const uniforms = {
  uTime: { value: 0 },
  uMouse: { value: new THREE.Vector2(0, 0) },
  uOpacity: { value: 0 },
  uPixelRatio: { value: 1 },
  uSize: { value: 46 },
  uColorDeep: { value: new THREE.Color('#67542f') },
  uColorGold: { value: new THREE.Color('#C9A86A') },
  uColorPale: { value: new THREE.Color('#F0E3C2') },
}

const fieldGeometry = new THREE.BufferGeometry()
fieldGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
fieldGeometry.setAttribute('aRand', new THREE.BufferAttribute(rands, 1))

const fieldMaterial = new THREE.ShaderMaterial({
  vertexShader: VERTEX,
  fragmentShader: FRAGMENT,
  uniforms,
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
})

function GoldField() {
  const group = useRef()

  useFrame((state, delta) => {
    const d = Math.min(delta, 1 / 30)
    uniforms.uTime.value += d
    uniforms.uPixelRatio.value = state.gl.getPixelRatio()

    smoothMouse.lerp(state.pointer, 1 - Math.exp(-2.5 * d))
    uniforms.uMouse.value.copy(smoothMouse)

    // Ease the canvas in once the first frames are flowing.
    uniforms.uOpacity.value +=
      (1 - uniforms.uOpacity.value) * (1 - Math.exp(-1.1 * d))

    if (group.current) {
      group.current.rotation.y =
        Math.sin(uniforms.uTime.value * 0.05) * 0.1
    }

    const k = 1 - Math.exp(-2 * d)
    state.camera.position.x += (smoothMouse.x * 0.35 - state.camera.position.x) * k
    state.camera.position.y +=
      (1.15 + smoothMouse.y * 0.18 - state.camera.position.y) * k
    state.camera.lookAt(0, -0.15, 0)
  })

  return (
    <group ref={group} position={[0, -0.78, 0]}>
      <points
        geometry={fieldGeometry}
        material={fieldMaterial}
        frustumCulled={false}
      />
    </group>
  )
}

export default function HeroScene({ active = true }) {
  const [dpr, setDpr] = useState(() =>
    Math.min(window.devicePixelRatio || 1, 1.75),
  )

  return (
    <Canvas
      className="hero-canvas"
      frameloop={active ? 'always' : 'never'}
      dpr={dpr}
      camera={{ fov: 42, position: [0, 1.15, 4.6], near: 0.1, far: 40 }}
      gl={{
        antialias: false,
        alpha: true,
        powerPreference: 'high-performance',
        stencil: false,
      }}
      eventSource={typeof document !== 'undefined' ? document.body : undefined}
      style={{ position: 'absolute', inset: 0 }}
    >
      {/* If frame rate dips, trade resolution for smoothness — never stutter. */}
      <PerformanceMonitor onDecline={() => setDpr(1)} />
      <GoldField />
    </Canvas>
  )
}
