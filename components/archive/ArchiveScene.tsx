"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, BakeShadows, useTexture } from "@react-three/drei";
import { Suspense, useMemo, useEffect } from "react";
import * as THREE from "three";
import { Bookshelf } from "./Bookshelf";
import { RoomEnvironment } from "./RoomEnvironment";
import { CameraController } from "./CameraController";
import type { BookType } from "@/app/archive/page";

interface ArchiveSceneProps {
  selectedBook: BookType;
  setSelectedBook: (book: BookType) => void;
}

// Inner wrapper component to run inside the Suspense boundary so texture loading works
function ArchiveContent({ selectedBook, setSelectedBook }: ArchiveSceneProps) {
  // Load optimized WebP wood and floor textures
  const woodTexture = useTexture("/archive_wood_wall.webp");
  const floorTexture = useTexture("/archive_wood_floor.webp");

  // Configure texture wrap and repeating synchronously before materials are constructed
  woodTexture.wrapS = THREE.RepeatWrapping;
  woodTexture.wrapT = THREE.RepeatWrapping;
  woodTexture.repeat.set(4, 3);
  
  floorTexture.wrapS = THREE.RepeatWrapping;
  floorTexture.wrapT = THREE.RepeatWrapping;
  floorTexture.repeat.set(6, 6);

  // Construct shared MeshStandardMaterials for wood and floor to save draw calls
  const woodMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: woodTexture,
      color: "#8a5d43", // Warm medium-dark walnut/mahogany tint
      roughness: 0.65,
      metalness: 0.1,
    });
  }, [woodTexture]);

  const floorMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: floorTexture,
      color: "#a87f5e", // Warm teak/oak tint for floor planks
      roughness: 0.6,
      metalness: 0.05,
    });
  }, [floorTexture]);

  return (
    <group position={[0, -1, 0]}>
      <Bookshelf 
        selectedBook={selectedBook} 
        setSelectedBook={setSelectedBook} 
        woodMaterial={woodMaterial}
      />
      <RoomEnvironment 
        woodMaterial={woodMaterial}
        floorMaterial={floorMaterial}
      />
    </group>
  );
}

export default function ArchiveScene({ selectedBook, setSelectedBook }: ArchiveSceneProps) {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas 
        shadows 
        frameloop="demand"
        camera={{ position: [0, 1.5, 5], fov: 45 }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#F5F2EB"]} />
        
        {/* Strong Ambient Light to keep the room bright and prevent black shadows */}
        <ambientLight intensity={1.7} color="#fdfbf7" />
        
        {/* Soft daylight directional source casting subtle shadows from the window side (left-front) */}
        <directionalLight
          position={[-4, 5, 3]}
          intensity={2.2}
          color="#fbf8f0"
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-bias={-0.0005}
        >
          <orthographicCamera attach="shadow-camera" args={[-4, 4, 4, -2, 0.5, 15]} />
        </directionalLight>

        <Suspense fallback={null}>
          <CameraController selectedBook={selectedBook} />
          
          <ArchiveContent selectedBook={selectedBook} setSelectedBook={setSelectedBook} />
          
          {/* Subtle Environment reflections */}
          <Environment preset="city" environmentIntensity={0.05} />
          
          {/* Freeze shadows after initial render for massive performance gain */}
          <BakeShadows />
        </Suspense>
      </Canvas>
    </div>
  );
}
