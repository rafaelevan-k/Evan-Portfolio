"use client";

import { RoundedBox, Text } from "@react-three/drei";
import { BookItem } from "@/components/archive/BookItem";
import type { BookType } from "@/app/archive/page";
import * as THREE from "three";

interface BookshelfProps {
  selectedBook: BookType;
  setSelectedBook: (book: BookType) => void;
  woodMaterial: THREE.Material;
}

// Brass indexing label for each shelf level (Shadows disabled)
function ShelfLabel({ text, position }: { text: string; position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Plate */}
      <RoundedBox
        args={[0.22, 0.03, 0.002]}
        position={[0, 0, 0]}
        radius={0.001}
        smoothness={2}
      >
        <meshStandardMaterial color="#c6a75f" metalness={0.9} roughness={0.15} />
      </RoundedBox>
      {/* Text on plate */}
      <Text
        position={[0, 0, 0.002]}
        fontSize={0.012}
        color="#2a1f0a"
        anchorX="center"
        anchorY="middle"
        font="https://cdn.jsdelivr.net/npm/@fontsource/playfair-display@5.0.21/files/playfair-display-latin-400-normal.woff"
      >
        {text}
      </Text>
    </group>
  );
}

// Built-in warm orange shelf lights helper component
function ShelfLight({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* LED Fixture Casing (Dark brown/black) */}
      <mesh position={[0, -0.005, 0]}>
        <boxGeometry args={[0.7, 0.01, 0.03]} />
        <meshStandardMaterial color="#1c120c" roughness={0.8} />
      </mesh>
      {/* Glowing LED Strip (Warm Orange Emissive) */}
      <mesh position={[0, -0.009, 0]}>
        <boxGeometry args={[0.66, 0.004, 0.015]} />
        <meshStandardMaterial color="#ffa855" emissive="#ff6a00" emissiveIntensity={6} />
      </mesh>
      {/* Warm Soft Orange Ambient Light Glow (Two point lights for linear wash, no castShadow for 60 FPS) */}
      <pointLight
        position={[-0.18, -0.08, -0.05]}
        intensity={1.8}
        distance={1.4}
        decay={1.8}
        color="#ff7a1a"
      />
      <pointLight
        position={[0.18, -0.08, -0.05]}
        intensity={1.8}
        distance={1.4}
        decay={1.8}
        color="#ff7a1a"
      />
    </group>
  );
}

export function Bookshelf({ selectedBook, setSelectedBook, woodMaterial }: BookshelfProps) {
  return (
    <group receiveShadow castShadow>
      {/* 1. Cabinet Base (sits on floor at local Y=0, using shared woodMaterial) */}
      <RoundedBox
        args={[0.88, 0.1, 0.5]}
        position={[0, 0.05, 0]}
        radius={0.01}
        smoothness={3}
        receiveShadow
        castShadow
        material={woodMaterial}
      />

      {/* 2. Side Panel Left (using shared woodMaterial) */}
      <RoundedBox
        args={[0.04, 3.1, 0.5]}
        position={[-0.42, 1.55, 0]}
        radius={0.01}
        smoothness={3}
        receiveShadow
        castShadow
        material={woodMaterial}
      />

      {/* 3. Side Panel Right (using shared woodMaterial) */}
      <RoundedBox
        args={[0.04, 3.1, 0.5]}
        position={[0.42, 1.55, 0]}
        radius={0.01}
        smoothness={3}
        receiveShadow
        castShadow
        material={woodMaterial}
      />

      {/* 4. Back Panel (using shared woodMaterial) */}
      <RoundedBox
        args={[0.88, 3.1, 0.04]}
        position={[0, 1.55, -0.23]}
        radius={0.01}
        smoothness={3}
        receiveShadow
        material={woodMaterial}
      />

      {/* 5. Inner Shelf 2 (Separating level 1 and 2, surface at Y=0.85, using shared woodMaterial) */}
      <RoundedBox
        args={[0.8, 0.04, 0.48]}
        position={[0, 0.83, 0.01]}
        radius={0.005}
        smoothness={3}
        receiveShadow
        castShadow
        material={woodMaterial}
      />

      {/* 6. Inner Shelf 3 (Separating level 2 and 3, surface at Y=1.60, using shared woodMaterial) */}
      <RoundedBox
        args={[0.8, 0.04, 0.48]}
        position={[0, 1.58, 0.01]}
        radius={0.005}
        smoothness={3}
        receiveShadow
        castShadow
        material={woodMaterial}
      />

      {/* 7. Inner Shelf 4 (Separating level 3 and 4, surface at Y=2.35, using shared woodMaterial) */}
      <RoundedBox
        args={[0.8, 0.04, 0.48]}
        position={[0, 2.33, 0.01]}
        radius={0.005}
        smoothness={3}
        receiveShadow
        castShadow
        material={woodMaterial}
      />

      {/* 8. Top Cabinet Cap (using shared woodMaterial) */}
      <RoundedBox
        args={[0.88, 0.04, 0.5]}
        position={[0, 3.08, 0]}
        radius={0.01}
        smoothness={3}
        receiveShadow
        castShadow
        material={woodMaterial}
      />

      {/* --- Cabinet Top Decor (Potted Plant & Stack of Books, shadows disabled for performance) --- */}
      <group position={[0, 3.1, 0]}>
        {/* Pot */}
        <mesh position={[-0.2, 0.05, 0.0]}>
          <cylinderGeometry args={[0.08, 0.06, 0.1, 16]} />
          <meshStandardMaterial color="#c36a4b" roughness={0.85} />
        </mesh>
        {/* Plant Leaves */}
        <RoundedBox args={[0.06, 0.22, 0.01]} position={[-0.2, 0.12, 0]} rotation={[0.4, 0, 0.6]} radius={0.002}>
          <meshStandardMaterial color="#2d4a2c" roughness={0.8} />
        </RoundedBox>
        <RoundedBox args={[0.06, 0.22, 0.01]} position={[-0.2, 0.12, 0]} rotation={[-0.4, 0, -0.6]} radius={0.002}>
          <meshStandardMaterial color="#2d4a2c" roughness={0.8} />
        </RoundedBox>
        <RoundedBox args={[0.06, 0.22, 0.01]} position={[-0.2, 0.13, 0]} rotation={[0, 0.5, 0.1]} radius={0.002}>
          <meshStandardMaterial color="#345432" roughness={0.8} />
        </RoundedBox>

        {/* Stack of Books */}
        {/* Bottom Book */}
        <RoundedBox args={[0.3, 0.045, 0.22]} position={[0.16, 0.0225, 0.02]} rotation={[0, 0.1, 0]} radius={0.003}>
          <meshStandardMaterial color="#203054" roughness={0.7} />
        </RoundedBox>
        {/* Top Book */}
        <RoundedBox args={[0.26, 0.04, 0.2]} position={[0.18, 0.065, 0.01]} rotation={[0, -0.2, 0]} radius={0.003}>
          <meshStandardMaterial color="#4f3824" roughness={0.7} />
        </RoundedBox>
      </group>

      {/* --- Shelf Index Labels (Brass Plate on Lips) --- */}
      <ShelfLabel text="CURRICULUM VITAE" position={[0, 0.05, 0.251]} />
      <ShelfLabel text="CERTIFICATIONS" position={[0, 0.83, 0.251]} />
      <ShelfLabel text="VOLUNTEER & ORG" position={[0, 1.58, 0.251]} />
      <ShelfLabel text="AWARDS" position={[0, 2.33, 0.251]} />

      {/* --- Built-in Warm Shelf Lights (Fitted under each shelf ceiling) --- */}
      <ShelfLight position={[0, 0.81, 0.18]} />       {/* Illuminates Level 1 (CV) */}
      <ShelfLight position={[0, 1.56, 0.18]} />       {/* Illuminates Level 2 (Certifications) */}
      <ShelfLight position={[0, 2.31, 0.18]} />       {/* Illuminates Level 3 (Volunteer) */}
      <ShelfLight position={[0, 3.06, 0.18]} />       {/* Illuminates Level 4 (Awards) */}

      {/* --- Books Placed Vertically (Y is adjusted based on shelf surfaces) --- */}
      
      {/* Level 1 (Bottom shelf): Curriculum Vitae */}
      <BookItem 
        type="cv" 
        title="Curriculum Vitae" 
        position={[0, 0.4, -0.05]} 
        color="#542020" // Deep Burgundy Leather
        selectedBook={selectedBook} 
        setSelectedBook={setSelectedBook} 
      />
      
      {/* Level 2: Certifications */}
      <BookItem 
        type="certifications" 
        title="Certifications" 
        position={[0, 1.15, -0.05]} 
        color="#203054" // Deep Indigo/Navy Leather
        selectedBook={selectedBook} 
        setSelectedBook={setSelectedBook} 
      />
      
      {/* Level 3: Volunteer & Organization */}
      <BookItem 
        type="volunteer" 
        title="Volunteer & Org" 
        position={[0, 1.9, -0.05]} 
        color="#4f3824" // Antique Dark Brown Leather
        selectedBook={selectedBook} 
        setSelectedBook={setSelectedBook} 
      />
      
      {/* Level 4 (Top shelf): Awards */}
      <BookItem 
        type="awards" 
        title="Awards" 
        position={[0, 2.65, -0.05]} 
        color="#1b3d2b" // Deep Forest Green Leather
        selectedBook={selectedBook} 
        setSelectedBook={setSelectedBook} 
      />
    </group>
  );
}
