import React from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { RoundedBox, OrbitControls, Environment, Html, ContactShadows, Grid } from '@react-three/drei';
import { useEffect } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion';

// Helper: Normalize a value from [min, max] to [a, b]
function normalize(value, min, max, a, b) {
  if (max === min) return (a + b) / 2;
  return a + ((value - min) * (b - a)) / (max - min);
}

function Bar({ x, y1, y2, z, color, label }) {
  const height = Math.abs(y2 - y1);
  const y = Math.min(y1, y2) + height / 2; // center the bar between y1 and y2
  return (
    <group position={[x, y, z]}>
      <RoundedBox args={[1, 3+height, 0.8]} radius={0.2} smoothness={4} castShadow receiveShadow>
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.2} />
      </RoundedBox>
      <Html center position={[0, height / 4 , 0]}>{label}</Html>
    </group>
  );
}

function Axes({ size = 5 }) {
  const { scene } = useThree();
  useEffect(() => {
    const axes = new THREE.AxesHelper(size);
    scene.add(axes);
    return () => scene.remove(axes);
  }, [scene, size]);
  return null;
}

export default function SkillsTimeline3D({ data }) {
  // Chart layout constants (3D units)
  const wallWidth = 12; // X axis (skills)
  const wallHeight = 8; // Y axis (time)
  const barDepth = 0.8;
  const barWidth = 0.8;
  const barRadius = 0.2;
  const barYOffset = 0.0; // flush with wall

  // Map skills to X positions
  const nodeCount = data.skills.length;
  const minGap = 1.2;
  const maxGap = 3.0;
  const gap3D = nodeCount > 1 ? Math.max(minGap, Math.min(maxGap, (wallWidth - 2) / (nodeCount - 1))) : 2;
  const xOffset3D = -10; // left margin

  // Map time to Y positions
  const yMin3D = -wallHeight / 2 + 1; // bottom margin
  const yMax3D = wallHeight / 2 - 1; // top margin
  const timeMin = data.startTime;
  const timeMax = data.endTime;

  // Bars: place each segment at (x, y1, z=0), height = y2-y1
  const bars = data.segments.map((seg, i) => {
    const x = (seg.x || 0) * gap3D + xOffset3D;
    // Map y1 and y2 from SVG to 3D
    const y1 = normalize(seg.y1 || 0, 20, 600, yMin3D, yMax3D);
    const y2 = normalize(seg.y2 || 0, 20, 600, yMin3D, yMax3D);
    const z = 0;
    return (
      <Bar
        key={i}
        x={x}
        y1={y1}
        y2={y2}
        z={z}
        color={seg.color}
        label={seg.skill}
      />
    );
  });

  return (
    <div style={{ width: '100%', height: '900px', backgroundColor: 'white' }}>
      <Canvas camera={{ position: [0, 0, 10], fov: 80 }} shadows>
        {/* Key light for strong highlights */}
        <directionalLight position={[5,5,10]} intensity={1} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
        <ambientLight intensity={10} />
        {/* Vertical wall (plane) at Z=0 */}
        <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <boxGeometry args={[30,0, 30]} />
          <meshStandardMaterial color="rgb(16, 120, 255)" transparent opacity={0.8} />
        </mesh>
        {/* Bars */}
        {bars}
        <OrbitControls target={[0,0,0]} />
      </Canvas>
    </div>
  );
} 