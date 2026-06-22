"use client";

import { ContactShadows, Sparkles } from "@react-three/drei";
import * as THREE from "three";

export function RoomEnvironment() {
  return (
    <>
      {/* Floor Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#E8E4D9" roughness={0.8} metalness={0.1} />
      </mesh>

      {/* Back Wall Plane */}
      <mesh position={[0, 5, -1]} receiveShadow>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color="#F4F1EA" roughness={1} />
      </mesh>
      
      {/* Side Wall (Left - where window light comes from) */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-5, 5, 0]} receiveShadow>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color="#F4F1EA" roughness={1} />
      </mesh>

      {/* Simple Window Frame Graphic on Left Wall */}
      <group position={[-4.9, 3, 2]} rotation={[0, Math.PI / 2, 0]}>
        <mesh receiveShadow castShadow position={[0, 0, 0]}>
          <boxGeometry args={[2, 3, 0.1]} />
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </mesh>
        {/* Window Pane (Dark glass) */}
        <mesh position={[0, 0, 0.06]}>
          <planeGeometry args={[1.8, 2.8]} />
          <meshStandardMaterial color="#1a2b3c" roughness={0.1} metalness={0.8} />
        </mesh>
      </group>

      {/* Standing Floor Lamp on the right side of the room */}
      <group position={[2.5, -0.1, 1]}>
        {/* Lamp Base (on the floor) */}
        <mesh receiveShadow castShadow position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.4, 0.5, 0.1, 32]} />
          <meshStandardMaterial color="#333333" roughness={0.7} />
        </mesh>
        {/* Lamp Stem (tall standing) */}
        <mesh receiveShadow castShadow position={[0, 1.55, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 3, 16]} />
          <meshStandardMaterial color="#A88B4B" roughness={0.3} metalness={0.8} />
        </mesh>
        {/* Lamp Shade */}
        <mesh receiveShadow castShadow position={[0, 3.2, 0]}>
          <coneGeometry args={[0.6, 0.8, 32]} />
          <meshStandardMaterial color="#f5f5dc" roughness={0.9} />
        </mesh>
        {/* The warm bulb glow (Point light) */}
        <pointLight position={[0, 3.0, 0]} intensity={1.5} color="#ffeedd" distance={8} castShadow />
      </group>

      {/* Ground Reflection/Shadow for objects */}
      <ContactShadows 
        position={[0, -0.09, 0]} 
        opacity={0.6} 
        scale={15} 
        blur={2.5} 
        far={4} 
        frames={1}
        resolution={512}
      />

      {/* Floating Dust Particles */}
      <Sparkles 
        count={50} 
        scale={10} 
        size={2} 
        speed={0.2} 
        opacity={0.1} 
        color="#ffffff" 
        position={[0, 2, 2]} 
      />
    </>
  );
}
