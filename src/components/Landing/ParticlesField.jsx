import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Ambient particle background, styled after the react-bits "Particles" component
// (Particles-JS-CSS) with its exported parameters. Recreated as a THREE.Points cloud
// inside the page's existing canvas instead of adding the ogl-based component, so the
// landing page keeps a single WebGL context and gains no new dependency.
const PARTICLE_COUNT = 200;
const PARTICLE_SPREAD = 40;
const SPEED = 0.1;
const PARTICLE_COLORS = ['#8e8e8e', '#2f2f2fff', '#000000'];
const HOVER_FACTOR = 0.4;
const PARTICLE_BASE_SIZE = 100;
const SIZE_RANDOMNESS = 0.1;
// The reference component frames its cloud from a camera 76 units away; our camera
// sits at z=7 looking through the car toward the cloud's center. Scaling every
// reference-unit distance by (view distance / 76) reproduces the same on-screen spread.
const REFERENCE_CAMERA_DISTANCE = 40;
const CLOUD_CENTER_Z = -5;
const VIEW_DISTANCE = 7 - CLOUD_CENTER_Z;
const WORLD_SCALE = VIEW_DISTANCE / REFERENCE_CAMERA_DISTANCE;

const VERTEX_SHADER = /* glsl */ `
  attribute vec3 aColor;
  attribute vec4 aRandom;
  attribute float aSize;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uSizeFactor;
  uniform float uDriftAmp;
  varying vec3 vColor;

  void main() {
    vColor = aColor;
    vec3 p = position;
    // Gentle per-particle drift; phase and amplitude both come from per-particle seeds.
    p += vec3(
      sin(uTime + aRandom.x * 6.2831),
      cos(uTime + aRandom.y * 6.2831),
      sin(uTime + aRandom.z * 6.2831)
    ) * (aRandom.w * uDriftAmp);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = aSize * uPixelRatio * (uSizeFactor / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  varying vec3 vColor;

  void main() {
    // alphaParticles=false in the reference: solid discs, just antialiased at the rim.
    float d = length(gl_PointCoord - 0.5);
    float alpha = 1.0 - smoothstep(0.45, 0.5, d);
    if (alpha <= 0.001) discard;
    gl_FragColor = vec4(vColor, alpha);
  }
`;

const ParticlesField = () => {
  const groupRef = useRef();
  const materialRef = useRef();

  // moveParticlesOnHover — window-level tracking, same pattern as the car's parallax
  // (the canvas itself sits behind a pointer-events:none wrapper and gets no events).
  const pointerRef = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const onPointerMove = (e) => {
      pointerRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointerRef.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', onPointerMove);
  }, []);

  const { positions, colors, randoms, sizes } = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const col = new Float32Array(PARTICLE_COUNT * 3);
    const rnd = new Float32Array(PARTICLE_COUNT * 4);
    const siz = new Float32Array(PARTICLE_COUNT);
    const palette = PARTICLE_COLORS.map((c) => new THREE.Color(c));
    const dir = new THREE.Vector3();

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Uniform distribution inside a sphere (cbrt keeps density even, not center-heavy).
      const radius = Math.cbrt(Math.random()) * PARTICLE_SPREAD * WORLD_SCALE;
      dir.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1).normalize();
      pos[i * 3] = dir.x * radius;
      pos[i * 3 + 1] = dir.y * radius;
      pos[i * 3 + 2] = dir.z * radius;

      const color = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;

      rnd[i * 4] = Math.random();
      rnd[i * 4 + 1] = Math.random();
      rnd[i * 4 + 2] = Math.random();
      rnd[i * 4 + 3] = 0.4 + Math.random() * 0.6; // per-particle drift amplitude share

      // baseSize with sizeRandomness, normalized to roughly single-digit px on screen.
      const randomized = (PARTICLE_BASE_SIZE / 100) * (1 + SIZE_RANDOMNESS * (Math.random() - 0.5));
      siz[i] = Math.max(0.4, randomized);
    }
    return { positions: pos, colors: col, randoms: rnd, sizes: siz };
  }, []);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uPixelRatio: { value: 1 },
    uSizeFactor: { value: 24 },
    uDriftAmp: { value: 0.28 },
  }), []);

  useFrame((state, delta) => {
    if (!groupRef.current || !materialRef.current) return;

    const t = state.clock.elapsedTime;
    materialRef.current.uniforms.uTime.value = t * SPEED * 6; // speed: 0.1 → slow drift
    materialRef.current.uniforms.uPixelRatio.value = state.gl.getPixelRatio();

    // disableRotation: false — slow ambient tumble of the whole cloud.
    groupRef.current.rotation.x = Math.sin(t * 0.06) * 0.08;
    groupRef.current.rotation.z = Math.cos(t * 0.045) * 0.06;
    groupRef.current.rotation.y += delta * 0.015;

    // particleHoverFactor — the cloud eases toward the cursor, softly damped.
      const targetX = pointerRef.current.x * HOVER_FACTOR;
      const targetY = pointerRef.current.y * HOVER_FACTOR;
      groupRef.current.position.x = THREE.MathUtils.damp(groupRef.current.position.x, targetX, 3, delta);
      groupRef.current.position.y = THREE.MathUtils.damp(groupRef.current.position.y, targetY, 3, delta);
  });

  return (
    <group ref={groupRef} position={[0, 0.5, CLOUD_CENTER_Z]}>
      {/* renderOrder -1 + no depth write: always a backdrop, never over the car */}
      <points renderOrder={-1} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-aColor" args={[colors, 3]} />
          <bufferAttribute attach="attributes-aRandom" args={[randoms, 4]} />
          <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
        </bufferGeometry>
        <shaderMaterial
          ref={materialRef}
          vertexShader={VERTEX_SHADER}
          fragmentShader={FRAGMENT_SHADER}
          uniforms={uniforms}
          transparent
          depthWrite={false}
        />
      </points>
    </group>
  );
};

export default ParticlesField;
