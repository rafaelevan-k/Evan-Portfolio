"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import type { BookType } from "@/app/archive/page";

interface BookItemProps {
  type: NonNullable<BookType>;
  title: string;
  position: [number, number, number];
  color: string;
  selectedBook: BookType;
  setSelectedBook: (book: BookType) => void;
}

export function BookItem({ type, title, position, color, selectedBook, setSelectedBook }: BookItemProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const isSelected = selectedBook === type;
  const isAnotherSelected = selectedBook !== null && !isSelected;

  // Book dimensions
  const width = 0.6;
  const height = 0.8;
  const depth = 0.15;

  // Base positions
  const baseX = position[0];
  const baseY = position[1];
  const baseZ = position[2];

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Target values
    let targetX = baseX;
    let targetY = baseY;
    let targetZ = baseZ;
    let targetRotX = 0;
    let targetRotY = 0;
    let targetOpacity = 1;

    if (isSelected) {
      // Book flies to the center of the camera to be "opened"
      targetX = 0;
      targetY = 2; // Center of view relative to shelf
      targetZ = baseZ + 3.5; // Close to camera
      targetRotX = 0; // Flat facing camera
      targetRotY = 0; // Flat facing camera
    } else if (isAnotherSelected) {
      // Fade out or push back other books
      targetZ = baseZ - 0.2;
      targetOpacity = 0.3;
    } else if (hovered) {
      // Hover effect: magnetic pull forward and slight tilt
      targetZ = baseZ + 0.2;
      targetRotX = -0.05;
      targetRotY = 0.05;
    }

    // Smoothly interpolate position and rotation
    meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetX, 5 * delta);
    meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, 5 * delta);
    meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, targetZ, 5 * delta);
    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetRotX, 5 * delta);
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetRotY, 5 * delta);

    // Update material opacity
    const material = meshRef.current.material as THREE.MeshStandardMaterial;
    if (material) {
      material.opacity = THREE.MathUtils.lerp(material.opacity || 1, targetOpacity, 5 * delta);
      material.transparent = true;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      castShadow
      receiveShadow
      onPointerOver={() => {
        if (!selectedBook) {
          setHovered(true);
          document.body.style.cursor = "pointer";
        }
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (!selectedBook) {
          setSelectedBook(type);
          setHovered(false);
          document.body.style.cursor = "auto";
        }
      }}
    >
      {/* Book Geometry */}
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial 
        color={hovered && !selectedBook ? new THREE.Color(color).lerp(new THREE.Color(0xffffff), 0.2) : color} 
        roughness={0.4} 
        metalness={0.1} 
      />

      {/* Spine Text */}
      <Text
        position={[0, 0, depth / 2 + 0.01]} // Just outside the front face
        fontSize={0.06}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        maxWidth={width - 0.1}
        textAlign="center"
      >
        {title}
      </Text>
      
      {/* Glow effect on hover */}
      {hovered && !selectedBook && (
        <pointLight position={[0, 0, 0.5]} distance={1.5} intensity={0.5} color={color} />
      )}
    </mesh>
  );
}
