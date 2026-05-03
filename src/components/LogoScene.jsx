import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Stage, Float, Center } from '@react-three/drei';

function Model({ url }) {
  const { scene } = useGLTF(url);
  const modelRef = useRef();

  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.y += 0.01;
    }
  });

  return (
    <Center top>
      <primitive ref={modelRef} object={scene} scale={2.5} rotation={[0.2, -0.5, 0]} />
    </Center>
  );
}

const LogoScene = () => {
  return (
    <div className="w-16 h-16 flex-shrink-0 -ml-2 -mt-2">
      <Canvas 
        dpr={[1, 2]} 
        camera={{ position: [0, 0, 4], fov: 40 }} 
        gl={{ 
          alpha: true, 
          powerPreference: "low-power",
          antialias: false 
        }}
      >
        <Suspense fallback={null}>
          <Float speed={3} rotationIntensity={0.6} floatIntensity={0.6}>
            <Stage environment="city" intensity={0.6} contactShadow={false} adjustCamera={false}>
              <Model url="/lojitak.glb" />
            </Stage>
          </Float>
        </Suspense>
      </Canvas>
    </div>
  );
};

export default LogoScene;
