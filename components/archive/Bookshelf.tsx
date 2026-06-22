"use client";

import { useRef } from "react";
import * as THREE from "three";
import { BookItem } from "@/components/archive/BookItem";
import type { BookType } from "@/app/archive/page";

interface BookshelfProps {
  selectedBook: BookType;
  setSelectedBook: (book: BookType) => void;
}

export function Bookshelf({ selectedBook, setSelectedBook }: BookshelfProps) {
  const shelfMaterial = new THREE.MeshStandardMaterial({
    color: "#6F4E37", // Woody brown
    roughness: 0.85,
    metalness: 0.1,
  });

  return (
    <group>
      {/* The physical shelf base */}
      <mesh position={[0, 0, -0.2]} receiveShadow castShadow material={shelfMaterial}>
        <boxGeometry args={[4, 0.2, 0.8]} />
      </mesh>
      
      {/* Back panel */}
      <mesh position={[0, 0.6, -0.55]} receiveShadow material={shelfMaterial}>
        <boxGeometry args={[4, 1.4, 0.1]} />
      </mesh>

      {/* Side panels */}
      <mesh position={[-1.95, 0.6, -0.2]} receiveShadow castShadow material={shelfMaterial}>
        <boxGeometry args={[0.1, 1.4, 0.8]} />
      </mesh>
      <mesh position={[1.95, 0.6, -0.2]} receiveShadow castShadow material={shelfMaterial}>
        <boxGeometry args={[0.1, 1.4, 0.8]} />
      </mesh>

      {/* Books (Y = 0.5 sits them exactly on the shelf base) */}
      <BookItem 
        type="cv" 
        title="Curriculum Vitae" 
        position={[-1.2, 0.5, 0]} 
        color="#8B3A3A" 
        selectedBook={selectedBook} 
        setSelectedBook={setSelectedBook} 
      />
      
      <BookItem 
        type="certifications" 
        title="Certifications" 
        position={[-0.4, 0.5, 0]} 
        color="#3A5F8B" 
        selectedBook={selectedBook} 
        setSelectedBook={setSelectedBook} 
      />
      
      <BookItem 
        type="volunteer" 
        title="Volunteer & Organization" 
        position={[0.4, 0.5, 0]} 
        color="#8B7B3A" 
        selectedBook={selectedBook} 
        setSelectedBook={setSelectedBook} 
      />
      
      <BookItem 
        type="awards" 
        title="Awards" 
        position={[1.2, 0.5, 0]} 
        color="#3A8B5F" 
        selectedBook={selectedBook} 
        setSelectedBook={setSelectedBook} 
      />
    </group>
  );
}
