"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, RoundedBox, Html } from "@react-three/drei";
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
  const groupRef = useRef<THREE.Group>(null);
  const goldMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  const [hovered, setHovered] = useState(false);

  const isSelected = selectedBook === type;
  const isAnotherSelected = selectedBook !== null && !isSelected;

  // Book dimensions (Spine-out layout)
  const spineWidth = 0.11;
  const bookHeight = 0.62;
  const bookDepth = 0.45;

  // Base positions
  const baseX = position[0];
  const baseY = position[1];
  const baseZ = position[2];

  // Map default backward tilt and natural yaw variation per book type
  let defaultRotX = -0.22; // ~12 degrees tilted back
  let defaultRotY = 0;

  if (type === "awards") {
    defaultRotX = -0.26;
    defaultRotY = -0.04;
  } else if (type === "volunteer") {
    defaultRotX = -0.22;
    defaultRotY = 0.03;
  } else if (type === "certifications") {
    defaultRotX = -0.25;
    defaultRotY = -0.02;
  } else if (type === "cv") {
    defaultRotX = -0.19;
    defaultRotY = 0.02;
  }

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Target position and rotation values
    let targetX = baseX;
    let targetY = baseY;
    let targetZ = baseZ;
    let targetRotX = defaultRotX;
    let targetRotY = defaultRotY;
    let targetOpacity = 1.0;

    if (isSelected) {
      // Selected book slides forward out of cabinet and rotates 90 degrees to face cover-out
      targetX = 0;
      targetY = baseY;
      targetZ = baseZ + 1.25;
      targetRotX = 0; // stands perfectly vertical
      targetRotY = Math.PI / 2; // rotates to show cover flat to camera
    } else if (isAnotherSelected) {
      // Push back and fade out non-selected books
      targetZ = baseZ - 0.2;
      targetOpacity = 0.15;
    } else if (hovered) {
      // Hover: slide forward slightly and stand up slightly to catch light highlights
      targetZ = baseZ + 0.16;
      targetRotX = defaultRotX * 0.3; // nearly vertical
      targetRotY = defaultRotY + 0.05; // slight yaw tilt towards user
    }

    const dx = Math.abs(groupRef.current.position.x - targetX);
    const dy = Math.abs(groupRef.current.position.y - targetY);
    const dz = Math.abs(groupRef.current.position.z - targetZ);
    const drx = Math.abs(groupRef.current.rotation.x - targetRotX);
    const dry = Math.abs(groupRef.current.rotation.y - targetRotY);
    const targetEmissive = hovered && !selectedBook ? 1.2 : 0.2;
    const de = goldMaterialRef.current ? Math.abs(goldMaterialRef.current.emissiveIntensity - targetEmissive) : 0;

    const isAnimating = dx > 0.001 || dy > 0.001 || dz > 0.001 || drx > 0.001 || dry > 0.001 || de > 0.01;

    // Interpolate translation and rotation only when animating
    if (isAnimating) {
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 5 * delta);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 5 * delta);
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, 5 * delta);

      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 5 * delta);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 5 * delta);

      // Animate material opacities recursively
      groupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          const mat = child.material as THREE.MeshStandardMaterial;
          mat.opacity = THREE.MathUtils.lerp(mat.opacity ?? 1, targetOpacity, 5 * delta);
          mat.transparent = targetOpacity < 1.0;
        }
      });

      // Animate gold emissive glow on hover
      if (goldMaterialRef.current) {
        goldMaterialRef.current.emissiveIntensity = THREE.MathUtils.lerp(
          goldMaterialRef.current.emissiveIntensity,
          targetEmissive,
          6 * delta
        );
      }

      state.invalidate();
    } else {
      // Snap to target values to sleep rendering
      groupRef.current.position.x = targetX;
      groupRef.current.position.y = targetY;
      groupRef.current.position.z = targetZ;
      groupRef.current.rotation.x = targetRotX;
      groupRef.current.rotation.y = targetRotY;

      groupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          const mat = child.material as THREE.MeshStandardMaterial;
          mat.opacity = targetOpacity;
          mat.transparent = targetOpacity < 1.0;
        }
      });

      if (goldMaterialRef.current) {
        goldMaterialRef.current.emissiveIntensity = targetEmissive;
      }
    }
  });

  // Split title to fit elegantly on the narrow spine
  const formattedTitle = title.toUpperCase().replace(" & ", "\n& ");

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        if (!selectedBook) {
          setHovered(true);
          document.body.style.cursor = "pointer";
        }
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
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
      {/* 1. Spine (Faces the viewer directly, curved RoundedBox) */}
      <RoundedBox
        args={[spineWidth, bookHeight, 0.02]}
        position={[0, 0, bookDepth / 2]}
        radius={0.005}
        smoothness={4}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={color} roughness={0.75} metalness={0.05} />
      </RoundedBox>

      {/* 2. Left Cover */}
      <RoundedBox
        args={[0.008, bookHeight, bookDepth]}
        position={[-spineWidth / 2 + 0.004, 0, 0]}
        radius={0.004}
        smoothness={4}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={color} roughness={0.75} metalness={0.05} />
      </RoundedBox>

      {/* 3. Right Cover */}
      <RoundedBox
        args={[0.008, bookHeight, bookDepth]}
        position={[spineWidth / 2 - 0.004, 0, 0]}
        radius={0.004}
        smoothness={4}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={color} roughness={0.75} metalness={0.05} />
      </RoundedBox>

      {/* 4. Inside Pages (Recessed cream block visible from top/bottom/back) */}
      <mesh position={[0, 0, -0.01]} castShadow receiveShadow>
        <boxGeometry args={[spineWidth - 0.015, bookHeight - 0.016, bookDepth - 0.02]} />
        <meshStandardMaterial color="#f6f0e2" roughness={0.9} metalness={0.0} />
      </mesh>

      {/* 5. Elegant Spine Gold Details */}
      {/* Gold embossed lines and text */}
      <group position={[0, 0, bookDepth / 2 + 0.011]}>
        {/* Top Decorative Line */}
        <mesh position={[0, 0.18, 0]}>
          <boxGeometry args={[spineWidth - 0.04, 0.004, 0.002]} />
          <meshStandardMaterial
            ref={goldMaterialRef}
            color="#E5C158"
            metalness={0.9}
            roughness={0.15}
            emissive="#523b00"
            emissiveIntensity={0.2}
          />
        </mesh>

        {/* Spine name label removed - replaced by hover tooltip popup */}

        {/* Bottom Decorative Line */}
        <mesh position={[0, -0.18, 0]}>
          <boxGeometry args={[spineWidth - 0.04, 0.004, 0.002]} />
          <meshStandardMaterial
            color="#E5C158"
            metalness={0.9}
            roughness={0.15}
            emissive="#523b00"
            emissiveIntensity={0.2}
          />
        </mesh>
      </group>

      {/* 6. Subtle localized light glow inside the book on hover to highlight wood panel details */}
      {hovered && !selectedBook && (
        <pointLight 
          position={[0, 0, bookDepth / 2 + 0.3]} 
          distance={1.0} 
          intensity={1.5} 
          color="#ffd880" 
        />
      )}

      {/* 7. Hover Tooltip (Popup name label using drei Html) */}
      {hovered && !selectedBook && (
        <Html center distanceFactor={4} position={[0, bookHeight / 2 + 0.1, bookDepth / 2]}>
          <div 
            style={{
              background: "rgba(37, 20, 11, 0.92)",
              border: "1px solid rgba(198, 167, 95, 0.45)",
              color: "#fcf8ed",
              padding: "6px 14px",
              borderRadius: "6px",
              fontSize: "11px",
              fontFamily: "'Playfair Display', Georgia, serif",
              fontWeight: 600,
              whiteSpace: "nowrap",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              boxShadow: "0 8px 20px rgba(0, 0, 0, 0.6)",
              backdropFilter: "blur(6px)",
              pointerEvents: "none",
            }}
          >
            {title}
          </div>
        </Html>
      )}
    </group>
  );
}
