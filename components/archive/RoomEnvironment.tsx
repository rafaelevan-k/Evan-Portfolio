"use client";

import { ContactShadows, RoundedBox, Text } from "@react-three/drei";
import * as THREE from "three";

interface RoomEnvironmentProps {
  woodMaterial: THREE.Material;
  floorMaterial: THREE.Material;
}

export function RoomEnvironment({ woodMaterial, floorMaterial }: RoomEnvironmentProps) {
  return (
    <>
      {/* Wooden Floor Planks (using shared floorMaterial) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-1.5, -0.1, 2]} receiveShadow material={floorMaterial}>
        <planeGeometry args={[18, 6]} />
      </mesh>

      {/* Walnut Wall Panel (using shared woodMaterial) */}
      <mesh position={[-1.5, 2.9, -1]} receiveShadow material={woodMaterial}>
        <planeGeometry args={[18, 6]} />
      </mesh>

      {/* Cozy Jute/Woven Rug under the bookshelf cabinet */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.095, 0.2]} receiveShadow>
        <planeGeometry args={[2.8, 2.0]} />
        <meshStandardMaterial color="#a38260" roughness={0.95} />
      </mesh>

      {/* Antique Storage Trunk / Chest on the left side of the cabinet */}
      <group position={[-1.1, -0.1, 0.2]} rotation={[0, 0.25, 0]}>
        {/* Trunk Body (using shared woodMaterial) */}
        <RoundedBox args={[0.55, 0.38, 0.38]} position={[0, 0.19, 0]} radius={0.008} smoothness={3} receiveShadow castShadow material={woodMaterial} />
        
        {/* Left Metal Band (Shadows disabled) */}
        <mesh position={[-0.15, 0.19, 0]}>
          <boxGeometry args={[0.02, 0.39, 0.39]} />
          <meshStandardMaterial color="#a6894b" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Right Metal Band (Shadows disabled) */}
        <mesh position={[0.15, 0.19, 0]}>
          <boxGeometry args={[0.02, 0.39, 0.39]} />
          <meshStandardMaterial color="#a6894b" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Decorative stack of 2 books on top of the trunk (Shadows disabled) */}
        <group position={[0, 0.38, 0]}>
          {/* Bottom Book */}
          <RoundedBox args={[0.3, 0.05, 0.22]} position={[0.02, 0.025, -0.02]} rotation={[0, 0.1, 0]} radius={0.003}>
            <meshStandardMaterial color="#4f1e1e" roughness={0.7} />
          </RoundedBox>
          {/* Top Book */}
          <RoundedBox args={[0.26, 0.045, 0.2]} position={[0.0, 0.07, -0.01]} rotation={[0, -0.15, 0]} radius={0.003}>
            <meshStandardMaterial color="#1a3d24" roughness={0.7} />
          </RoundedBox>
        </group>
      </group>

      {/* 3D Framed Poster on the Back Wall (Shadows disabled, using shared woodMaterial) */}
      <group position={[1.3, 1.75, -0.98]}>
        {/* Poster Frame (Walnut wood) */}
        <RoundedBox args={[1.05, 1.35, 0.02]} position={[0, 0, 0]} radius={0.006} smoothness={3} material={woodMaterial} />

        {/* Poster Paper Background */}
        <mesh position={[0, 0, 0.012]}>
          <planeGeometry args={[0.97, 1.27]} />
          <meshStandardMaterial color="#fcfaf2" roughness={0.9} />
        </mesh>

        {/* Title: THE ARCHIVE */}
        <Text
          position={[0, 0.32, 0.015]}
          fontSize={0.082}
          color="#2a1e08"
          anchorX="center"
          anchorY="middle"
          font="https://cdn.jsdelivr.net/npm/@fontsource/playfair-display@5.0.21/files/playfair-display-latin-400-normal.woff"
          letterSpacing={0.12}
        >
          THE ARCHIVE
        </Text>

        {/* Thin Gold Separator Line */}
        <mesh position={[0, 0.12, 0.015]}>
          <boxGeometry args={[0.65, 0.005, 0.001]} />
          <meshStandardMaterial color="#a6894b" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Subtitle: A collection of my journey */}
        <Text
          position={[0, -0.16, 0.015]}
          fontSize={0.064}
          color="#5a4c3e"
          anchorX="center"
          anchorY="middle"
          maxWidth={0.85}
          textAlign="center"
          font="https://cdn.jsdelivr.net/npm/@fontsource/playfair-display@5.0.21/files/playfair-display-latin-400-normal.woff"
          letterSpacing={0.06}
          lineHeight={1.4}
        >
          {"A COLLECTION OF\nMY JOURNEY"}
        </Text>
      </group>

      {/* Standing Floor Lamp on the right side of the room (Shadows disabled, lamp bulb pointLight removed for performance) */}
      <group position={[2.5, -0.1, 1]}>
        {/* Lamp Base (on the floor) */}
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.3, 0.35, 0.1, 32]} />
          <meshStandardMaterial color="#1e1b18" roughness={0.8} metalness={0.2} />
        </mesh>
        {/* Lamp Stem (polished antique brass) */}
        <mesh position={[0, 1.55, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 3, 16]} />
          <meshStandardMaterial color="#b59a57" roughness={0.2} metalness={0.9} />
        </mesh>
        {/* Lamp Shade (Dark fabric outside, gold inside) */}
        <mesh position={[0, 3.2, 0]}>
          <coneGeometry args={[0.5, 0.7, 32]} />
          <meshStandardMaterial color="#1c1613" roughness={0.8} metalness={0.1} />
        </mesh>
      </group>

      {/* Ground Reflection/Shadow for objects */}
      <ContactShadows position={[0, -0.09, 0]} opacity={0.7} scale={15} blur={2.5} far={4} frames={1} resolution={512} />
    </>
  );
}
