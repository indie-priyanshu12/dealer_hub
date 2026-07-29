import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

// Target size of the car's longest dimension in Three.js world units.
// With camera at z=7 and fov=40, a value of ~5.5 fills roughly 70% of screen height nicely.
const TARGET_SIZE = 5.5;

// The car's resting pose for each of the 7 scroll-driven scenes (see ScrollOverlay.jsx
// for the matching text panels). scale is a multiplier on top of normalizedScale: the
// car grows for the "hero" beats (1, 3) and eases back for the reading-heavy scenes
// (2, 4) and the off-screen scenes (5, 6). Scene 7 stays modest (1.0) because its
// heading is centered — unlike scenes 1/3, there's no side of the screen for a bigger
// car to hide in without cutting through the text.
const SCENE_POSES = [
  { x: 2.3, y: -0.5, z: 0, rotY: -0.5, scale: 1.05 },             // 1: Hero
  { x: 6.0, y: -0.5, z: 0, rotY: -1.0, scale: 0.85 },             // 2: Brand
  { x: -2.8, y: -0.5, z: 0, rotY: -2.5, scale: 1.2 },             // 3: Featured
  { x: -2.4, y: -0.5, z: 0, rotY: -Math.PI, scale: 0.95 },        // 4: Why Choose Us
  { x: 0.3, y: -6.0, z: 0, rotY: -Math.PI * 1.25, scale: 0.8 },   // 5: Latest Arrivals
  { x: 0.3, y: -6.0, z: 0, rotY: -Math.PI * 1.5, scale: 0.8 },    // 6: Timeline
  { x: 0.3, y: -1.0, z: 0, rotY: Math.PI / 3, scale: 1.0 },       // 7: CTA
];

const SCENE_SPAN = 1 / SCENE_POSES.length;
// Fraction of each scene's own span spent easing into the next pose, timed to finish
// exactly at the scene boundary. The remaining fraction is a pure hold at that scene's
// resting pose, so text stays readable against a settled (not perpetually drifting) car.
const TRANSITION_FRACTION = 0.3;

function smoothstep(t) {
  const c = THREE.MathUtils.clamp(t, 0, 1);
  return c * c * (3 - 2 * c);
}

// Pure function of scroll progress (0..1) — deliberately NOT time-based. Lenis already
// smooths the raw scroll input, so deriving the car's pose directly from that value
// (rather than chasing it with a second, separate ease) keeps the two in perfect
// lockstep: scroll a pixel, the car moves by exactly the right amount, every time.
function getScenePose(scrollProgress) {
  const p = THREE.MathUtils.clamp(scrollProgress, 0, 1);
  const rawIndex = p / SCENE_SPAN;
  const sceneIndex = Math.min(SCENE_POSES.length - 1, Math.floor(rawIndex));
  const nextIndex = Math.min(SCENE_POSES.length - 1, sceneIndex + 1);

  const localT = rawIndex - sceneIndex; // 0..1 position within this scene's own span
  const holdEnd = 1 - TRANSITION_FRACTION;
  const blendT = localT <= holdEnd ? 0 : smoothstep((localT - holdEnd) / TRANSITION_FRACTION);

  const a = SCENE_POSES[sceneIndex];
  const b = SCENE_POSES[nextIndex];

  return {
    x: THREE.MathUtils.lerp(a.x, b.x, blendT),
    y: THREE.MathUtils.lerp(a.y, b.y, blendT),
    z: THREE.MathUtils.lerp(a.z, b.z, blendT),
    rotY: THREE.MathUtils.lerp(a.rotY, b.rotY, blendT),
    scale: THREE.MathUtils.lerp(a.scale, b.scale, blendT),
  };
}

// Ambient cursor-tilt parallax is the only thing left time-based, so it feels soft.
const PARALLAX_DAMP = 4;

const VehicleModel = ({ scrollProgressRef }) => {
  const { scene: rawScene } = useGLTF('/car_models/bmw_e34_stance_style.glb', 'https://www.gstatic.com/draco/versioned/decoders/1.5.5/');
  const positionRef = useRef();
  const rotationRef = useRef();

  // Clone the scene once so we NEVER mutate the shared cached GLB object.
  // This is the key fix for the HMR scale-accumulation bug.
  const scene = useMemo(() => rawScene.clone(true), [rawScene]);

  // Compute normalizedScale and yOffset from the RAW (scale=1) bounding box.
  // These values are computed once from the native model dimensions.
  const { normalizedScale, yOffset } = useMemo(() => {
    // Measure the model at scale 1 to get its native dimensions
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);

    const s = maxDim > 0 ? TARGET_SIZE / maxDim : 1;

    // The yOffset (in native units) needed so bottom of car sits at Y=0 when scaled.
    // After scaling, the bottom will be at: (box.min.y * s),
    // so we need to offset by -box.min.y * s to bring it to 0.
    const yOff = -box.min.y * s;

    return { normalizedScale: s, yOffset: yOff };
  }, [scene]);

  // Enable shadows
  React.useLayoutEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);

  useFrame((state, delta) => {
    if (!positionRef.current || !rotationRef.current) return;

    const pose = getScenePose(scrollProgressRef.current);

    // Position, rotation and scale are set DIRECTLY from scroll position — no damping,
    // no time-based easing. Any per-frame smoothing here would chase a target that
    // itself moves every frame while scrolling, and since the chase speed depends on
    // frame delta, that's exactly what reads as jitter under an uneven frame pace.
    // getScenePose() is already a smoothstep-eased curve over scroll position, so the
    // motion stays soft — it's just aligned to scroll pixels instead of wall-clock time.
    positionRef.current.position.set(pose.x, pose.y, pose.z);
    rotationRef.current.rotation.y = pose.rotY;
    rotationRef.current.scale.setScalar(pose.scale);

    // Subtle mouse parallax — ambient, so it keeps the lazier damp rate.
    const mouseX = (state.pointer.x * Math.PI) / 60;
    const mouseY = (state.pointer.y * Math.PI) / 60;
    rotationRef.current.rotation.x = THREE.MathUtils.damp(rotationRef.current.rotation.x, mouseY, PARALLAX_DAMP, delta);
    rotationRef.current.rotation.z = THREE.MathUtils.damp(rotationRef.current.rotation.z, -mouseX, PARALLAX_DAMP, delta);
  });

  return (
    // Outer group: handles XYZ translation (shadow follows)
    <group ref={positionRef}>
      {/* Inner group: handles rotation + scroll-driven scale (shadow stays flat on Y=0) */}
      <group ref={rotationRef}>
        <primitive
          object={scene}
          scale={normalizedScale}
          position={[0, yOffset, 0]}
        />
      </group>
      {/* Shadow is in the outer (translation) group but OUTSIDE rotation/scale, so it stays flat and constant */}
      <ContactShadows
        position={[0, 0, 0]}
        opacity={0.55}
        scale={12}
        blur={2.0}
        far={6}
        resolution={512}
      />
    </group>
  );
};

useGLTF.preload('/car_models/bmw_e34_stance_style.glb');

const CanvasBackground = ({ scrollProgressRef }) => {
  return (
    <Canvas
      camera={{ position: [0, 1.0, 7], fov: 40 }}
      style={{ width: '100%', height: '100vh', background: 'transparent' }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1 }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <directionalLight position={[-10, 10, -10]} intensity={0.5} />
        <Environment preset="city" blur={0.8} />
        <VehicleModel scrollProgressRef={scrollProgressRef} />
      </Suspense>
    </Canvas>
  );
};

export default CanvasBackground;
