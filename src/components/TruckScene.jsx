import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Float } from '@react-three/drei';
import * as THREE from 'three';

// --- WebGL Temizliği ---
function SceneCleanup() {
  const { gl, scene } = useThree();
  useEffect(() => {
    return () => { try { gl.dispose(); scene.clear(); } catch(e){} };
  }, [gl, scene]);
  return null;
}

// --- Holografik Malzeme Renkleri ---
const HOLO_COLOR = '#00D4FF';
const HOLO_EMISSIVE = '#00A8CC';
const BOX_FILLED_COLOR = '#1E3A5F';
const BOX_USER_COLOR = '#00F0FF';

// --- Tek Kargo Kutusu ---
function CargoBox({ position, color, delay = 0, scale = 1 }) {
  const meshRef = useRef();
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime() * 0.8 + delay) * 0.015;
    }
  });
  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <boxGeometry args={[0.26, 0.26, 0.30]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={color === BOX_USER_COLOR ? 1.2 : 0.4}
        transparent
        opacity={color === BOX_USER_COLOR ? 0.95 : 0.75}
        roughness={0.2}
        metalness={0.9}
      />
    </mesh>
  );
}

// --- Holografik Tır Doresi (Prosedürel) ---
function TruckBody() {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color: HOLO_COLOR,
    emissive: HOLO_EMISSIVE,
    emissiveIntensity: 0.4,
    transparent: true,
    opacity: 0.12,
    side: THREE.DoubleSide,
    depthWrite: false,
    wireframe: false,
  }), []);

  const edgeMat = useMemo(() => new THREE.LineBasicMaterial({
    color: HOLO_COLOR,
    transparent: true,
    opacity: 0.7,
  }), []);

  // Dorse boyutları
  const W = 1.1, H = 1.0, D = 3.2;

  const boxGeo = useMemo(() => new THREE.BoxGeometry(W, H, D), []);
  const edgesGeo = useMemo(() => new THREE.EdgesGeometry(boxGeo), [boxGeo]);

  // Kabin boyutları
  const CW = 1.0, CH = 0.85, CD = 0.8;
  const cabinGeo = useMemo(() => new THREE.BoxGeometry(CW, CH, CD), []);
  const cabinEdgesGeo = useMemo(() => new THREE.EdgesGeometry(cabinGeo), [cabinGeo]);

  return (
    <group>
      {/* --- DORSE --- */}
      <mesh geometry={boxGeo} material={mat} position={[0, 0, 0]} />
      <lineSegments geometry={edgesGeo} material={edgeMat} position={[0, 0, 0]} />

      {/* Dorse Çatı Detay */}
      <lineSegments position={[0, H / 2, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(W - 0.05, 0.02, D - 0.05)]} />
        <lineBasicMaterial color={HOLO_COLOR} transparent opacity={0.4} />
      </lineSegments>

      {/* --- KABİN --- */}
      <mesh geometry={cabinGeo} material={mat} position={[0, -(H - CH) / 2, D / 2 + CD / 2]} />
      <lineSegments geometry={cabinEdgesGeo} material={edgeMat} position={[0, -(H - CH) / 2, D / 2 + CD / 2]} />

      {/* Kabin Ön Cam */}
      <mesh position={[0, -(H - CH) / 2 + 0.1, D / 2 + CD + 0.01]}>
        <planeGeometry args={[CW - 0.25, CH - 0.25]} />
        <meshStandardMaterial color="#00F0FF" emissive="#00F0FF" emissiveIntensity={0.3} transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>

      {/* --- TEKERLEKLER (4 Adet) --- */}
      {[
        [-W / 2 - 0.05, -H / 2 - 0.12, -D / 2 + 0.5],
        [W / 2 + 0.05, -H / 2 - 0.12, -D / 2 + 0.5],
        [-W / 2 - 0.05, -H / 2 - 0.12, D / 2 - 0.5],
        [W / 2 + 0.05, -H / 2 - 0.12, D / 2 - 0.5],
        [-W / 2 - 0.05, -H / 2 - 0.12, 0],
        [W / 2 + 0.05, -H / 2 - 0.12, 0],
      ].map((pos, i) => (
        <mesh key={i} position={pos} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.15, 0.15, 0.12, 12]} />
          <meshStandardMaterial color={HOLO_COLOR} emissive={HOLO_EMISSIVE} emissiveIntensity={0.3} transparent opacity={0.5} />
        </mesh>
      ))}

      {/* Zemin Gölge Halkası */}
      <mesh position={[0, -H / 2 - 0.28, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.3, 1.6, 32]} />
        <meshBasicMaterial color={HOLO_COLOR} transparent opacity={0.05} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// --- Kargo Kutuları Sistemi ---
function CargoSystem({ cargoPool }) {
  const boxes = useMemo(() => {
    const items = [];
    const rows = 3, cols = 3, layers = 7;
    const totalSlots = rows * cols * layers;
    let currentSlot = 0;

    const safePool = (cargoPool && cargoPool.length > 0)
      ? cargoPool
      : [{ percentage: 50, color: BOX_FILLED_COLOR }];

    safePool.forEach(cargo => {
      if (!cargo || cargo.percentage <= 0) return;
      const count = Math.max(1, Math.floor((cargo.percentage / 100) * totalSlots));

      for (let i = 0; i < count && currentSlot < totalSlots; i++) {
        const layer = Math.floor(currentSlot / (rows * cols));
        const row = Math.floor((currentSlot % (rows * cols)) / cols);
        const col = currentSlot % cols;

        items.push({
          position: [
            (col - 1) * 0.30,
            (row * 0.30) - 0.36,
            (layer * 0.33) - 1.1,
          ],
          color: cargo.color || BOX_FILLED_COLOR,
          delay: (currentSlot * 0.3) % (Math.PI * 2),
        });
        currentSlot++;
      }
    });
    return items;
  }, [cargoPool]);

  return (
    <group>
      {boxes.map((b, i) => (
        <CargoBox key={i} position={b.position} color={b.color} delay={b.delay} />
      ))}
    </group>
  );
}

// --- Izgara Zemini ---
function GridFloor() {
  return (
    <gridHelper args={[10, 20, HOLO_COLOR, '#0A2A3A']} position={[0, -0.85, 0]}>
      <lineBasicMaterial color={HOLO_COLOR} transparent opacity={0.12} />
    </gridHelper>
  );
}

// --- Ana Sahne ---
function TruckScene3D({ cargoPool }) {
  const groupRef = useRef();
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.15) * 0.3 - 0.5;
    }
  });

  return (
    <group ref={groupRef}>
      <TruckBody />
      <CargoSystem cargoPool={cargoPool} />
    </group>
  );
}

// --- Export ---
export default function TruckScene({ cargoPool = [] }) {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: '400px', background: 'transparent' }}>
      <Canvas
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'default',
          preserveDrawingBuffer: false,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
        <PerspectiveCamera makeDefault position={[4.5, 2.5, 6]} fov={38} />
        <SceneCleanup />

        {/* Aydınlatma */}
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 8, 5]} intensity={2} color="#00D4FF" />
        <pointLight position={[-5, 3, -3]} intensity={1.5} color="#0066FF" />
        <pointLight position={[0, -2, 0]} intensity={0.5} color="#00F0FF" />

        <GridFloor />

        <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.3}>
          <TruckScene3D cargoPool={cargoPool} />
        </Float>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2.2}
          autoRotate={false}
        />
      </Canvas>
    </div>
  );
}
