import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls } from '@react-three/drei';

type ModelProps = {
  url: string;
};

const Model: React.FC<ModelProps> = ({ url }) => {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF(url);

  // Subtle idle rotation
  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime();
    group.current.rotation.y = Math.sin(t * 0.25) * 0.2;
  });

  return <primitive ref={group} object={scene} position={[0, -0.6, 0]} />;
};

export const GoldModelCanvas: React.FC<{ modelUrl: string }> = ({ modelUrl }) => {
  // Cursor-based rotation via OrbitControls with limited angles
  return (
    <Canvas camera={{ position: [0, 0.8, 2.2], fov: 45 }} style={{ width: '100%', height: '100%' }}>
      <ambientLight intensity={0.8} />
      <directionalLight intensity={0.9} position={[2, 3, 2]} />
      <Suspense fallback={null}>
        <Model url={modelUrl} />
        <OrbitControls enableZoom={false} maxPolarAngle={Math.PI / 2.1} minPolarAngle={Math.PI / 3.5} />
      </Suspense>
    </Canvas>
  );
};

export default GoldModelCanvas;


