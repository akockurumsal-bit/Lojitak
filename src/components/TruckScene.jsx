import React, { Suspense, useEffect, useMemo, memo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Float, ContactShadows, Html, Box } from '@react-three/drei';
import * as THREE from 'three';

const CargoBoxes = memo(({ cargoPool }) => {
  const boxes = useMemo(() => {
    const cols = 7; 
    const rows = 3; 
    const depth = 3; 
    const totalBoxes = cols * rows * depth; 

    let colorArray = [];
    if (cargoPool && cargoPool.length > 0) {
      cargoPool.forEach(item => {
        const count = Math.floor((item.percentage / 100) * totalBoxes);
        for (let i = 0; i < count; i++) colorArray.push(item.color);
      });
    }

    const boxArray = [];
    const boxSize = 0.16;
    const spacing = 0.17;

    let count = 0;
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        for (let z = 0; z < depth; z++) {
          if (count >= colorArray.length) break;
          const px = x * spacing;
          const py = y * spacing + (boxSize / 2);
          const pz = (z - (depth - 1) / 2) * spacing;

          boxArray.push(
            <Box key={count} args={[boxSize, boxSize, boxSize]} position={[px, py, pz]}>
              <meshStandardMaterial
                color={colorArray[count]}
                emissive={colorArray[count]}
                emissiveIntensity={1.2}
                transparent
                opacity={0.8}
              />
            </Box>
          );
          count++;
        }
      }
    }
    return boxArray;
  }, [cargoPool]);

  return <group position={[-0.35, -0.2, 0]}>{boxes}</group>;
});

const TruckModel = memo(({ cargoPool = [] }) => {
  const { scene } = useGLTF('/Meshy_AI_Blue_Semi_Truck_on_th_0502095613_texture.glb', true);

  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child.isMesh) {
          const oldMat = child.material;
          child.material = new THREE.MeshStandardMaterial({
            color: new THREE.Color('#001020'),
            emissive: new THREE.Color('#00F0FF'),
            emissiveIntensity: 0.6,
            wireframe: true,
            transparent: true,
            opacity: 0.1,
            depthWrite: false,
            side: THREE.DoubleSide
          });
          if (oldMat) oldMat.dispose();
        }
      });
    }
    return () => {
      if (scene) {
        scene.traverse((child) => {
          if (child.isMesh) child.material.dispose();
        });
      }
    };
  }, [scene]);

  if (!scene) return null;

  return (
    <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
      <group position={[0, -1, 0]} scale={1.5}>
        <primitive object={scene} />
        <CargoBoxes cargoPool={cargoPool} />
      </group>
    </Float>
  );
});

const Loader = () => (
  <Html center>
    <div className="flex flex-col items-center justify-center pointer-events-none">
      <div className="w-12 h-12 border-4 border-neon-blue border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(0,240,255,0.4)]"></div>
      <div className="mt-4 text-neon-blue font-mono text-[10px] tracking-[0.3em] uppercase animate-pulse">ANALİZ EDİLİYOR</div>
    </div>
  </Html>
);

const TruckScene = memo(({ cargoPool = [] }) => {
  return (
    <div className="w-full h-full min-h-[350px] relative z-10">
      <Canvas 
        camera={{ position: [5, 3, 7], fov: 45 }}
        gl={{ 
          antialias: true, 
          powerPreference: "high-performance",
          alpha: true 
        }}
        dpr={[1, 2]} // Performance optimization for high-res screens
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />
        <pointLight position={[-5, -2, -5]} intensity={20} color="#FF5F1F" />
        <pointLight position={[5, 5, 5]} intensity={30} color="#00F0FF" />

        <Suspense fallback={<Loader />}>
          <TruckModel cargoPool={cargoPool} />
          <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={10} blur={2} far={4} color="#00F0FF" />
        </Suspense>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 2}
          autoRotate
          autoRotateSpeed={1}
        />
      </Canvas>
    </div>
  );
});

export default TruckScene;

useGLTF.preload('/Meshy_AI_Blue_Semi_Truck_on_th_0502095613_texture.glb');
