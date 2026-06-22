"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, BakeShadows } from "@react-three/drei";
import { Suspense } from "react";
import { Bookshelf } from "./Bookshelf";
import { RoomEnvironment } from "./RoomEnvironment";
import { CameraController } from "./CameraController";
import type { BookType } from "@/app/archive/page";

interface ArchiveSceneProps {
  selectedBook: BookType;
  setSelectedBook: (book: BookType) => void;
}

export default function ArchiveScene({ selectedBook, setSelectedBook }: ArchiveSceneProps) {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas 
        shadows 
        camera={{ position: [0, 1.5, 5], fov: 45 }}
        dpr={[1, 1.5]}
        performance={{ min: 0.5 }}
        gl={{ antialias: false, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#F4F1EA"]} />
        
        {/* Soft Ambient Light */}
        <ambientLight intensity={1.2} color="#ffffff" />
        
        {/* Warm Lamp Light focal point */}
        <spotLight
          position={[0, 4, 3]}
          angle={0.8}
          penumbra={0.8}
          intensity={3}
          color="#ffeedd"
          castShadow
          shadow-mapSize={2048}
        />
        
        {/* Subtle cold window light from the side */}
        <directionalLight
          position={[-5, 3, 2]}
          intensity={1.5}
          color="#aaccff"
          castShadow
        />

        <Suspense fallback={null}>
          <CameraController selectedBook={selectedBook} />
          
          <group position={[0, -1, 0]}>
            <Bookshelf selectedBook={selectedBook} setSelectedBook={setSelectedBook} />
            <RoomEnvironment />
          </group>
          
          {/* Subtle Environment reflections */}
          <Environment preset="city" environmentIntensity={0.1} />
          
          {/* Freeze shadows after initial render for massive performance gain */}
          <BakeShadows />
        </Suspense>
      </Canvas>
    </div>
  );
}
