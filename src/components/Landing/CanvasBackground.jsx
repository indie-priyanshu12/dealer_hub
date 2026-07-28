import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

// Target size of the car's longest dimension in Three.js world units.
// With camera at z=7 and fov=40, a value of ~5.5 fills roughly 70% of screen height nicely.
const TARGET_SIZE = 5.5;

const VehicleModel = ({ scrollProgress }) => {
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

    // SCROLL ANIMATION - 7 scenes across 0..1
    let targetPosX = 2.0;
    let targetPosY = 0;
    let targetPosZ = 0;
    let targetRotationY = -0.5;

    // 7 scenes × 90vh each. Each scene = 1/7 ≈ 0.1428 of total scroll progress.

    // Scene 1 (0.000–0.143): Hero — Text Left, Car Right angled rear
    if (scrollProgress < 0.143) {
      targetPosX = 2.3;
      targetPosY = -0.5;
      targetPosZ = 0;
      targetRotationY = -0.5;
    }
    // Scene 2 (0.143–0.286): Brand — Car slides off right, clean text scene
    else if (scrollProgress < 0.286) {
      targetPosX = 6.0;
      targetPosY = -0.5;
      targetPosZ = 0;
      targetRotationY = -1.0;
    }
    // Scene 3 (0.286–0.429): Featured — Text Right, Car front-left
    else if (scrollProgress < 0.429) {
      targetPosX = -2.8;
      targetPosY = -0.5;
      targetPosZ = 0;
      targetRotationY = -2.5;
    }
    // Scene 4 (0.429–0.571): Why Choose Us — Text Right, Car Left side profile
    else if (scrollProgress < 0.571) {
      targetPosX = -2.4;
      targetPosY = -0.5;
      targetPosZ = 0;
      targetRotationY = -Math.PI;
    }
    // Scene 5 (0.571–0.714): Latest Arrivals — Car drops below camera
    else if (scrollProgress < 0.714) {
      targetPosX = 0.3;
      targetPosY = -6.0;
      targetPosZ = 0;
      targetRotationY = -Math.PI * 1.25;
    }
    // Scene 6 (0.714–0.857): Timeline — Car still hidden below
    else if (scrollProgress < 0.857) {
      targetPosX = 0.3;
      targetPosY = -6.0;
      targetPosZ = 0;
      targetRotationY = -Math.PI * 1.5;
    }
    // Scene 7 (0.857–1.000): CTA — Car rises to lower-center, text is top quarter
    else {
      targetPosX = 0.3;
      targetPosY = -1.0;
      targetPosZ = 0;
      targetRotationY = Math.PI / 3;
    }

    // Smooth interpolation for position (outer group)
    positionRef.current.position.x = THREE.MathUtils.damp(positionRef.current.position.x, targetPosX, 4, delta);
    positionRef.current.position.y = THREE.MathUtils.damp(positionRef.current.position.y, targetPosY, 4, delta);
    positionRef.current.position.z = THREE.MathUtils.damp(positionRef.current.position.z, targetPosZ, 4, delta);

    // Smooth interpolation for rotation (inner group — shadow stays flat)
    rotationRef.current.rotation.y = THREE.MathUtils.damp(rotationRef.current.rotation.y, targetRotationY, 4, delta);

    // Subtle mouse parallax
    const mouseX = (state.pointer.x * Math.PI) / 60;
    const mouseY = (state.pointer.y * Math.PI) / 60;
    rotationRef.current.rotation.x = THREE.MathUtils.damp(rotationRef.current.rotation.x, mouseY, 4, delta);
    rotationRef.current.rotation.z = THREE.MathUtils.damp(rotationRef.current.rotation.z, -mouseX, 4, delta);
  });

  return (
    // Outer group: handles XYZ translation (shadow follows)
    <group ref={positionRef}>
      {/* Inner group: handles rotation only (shadow stays flat on Y=0) */}
      <group ref={rotationRef}>
        <primitive
          object={scene}
          scale={normalizedScale}
          position={[0, yOffset, 0]}
        />
      </group>
      {/* Shadow is in the outer (translation) group but OUTSIDE rotation, so it stays flat */}
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

const CanvasBackground = ({ scrollProgress }) => {
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
        <VehicleModel scrollProgress={scrollProgress} />
      </Suspense>
    </Canvas>
  );
};

export default CanvasBackground;
