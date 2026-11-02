"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, Html, Lightformer, useTexture } from "@react-three/drei";
import { Suspense, useMemo } from "react";
import * as THREE from "three";
import { Bookshelf } from "./Bookshelf";
import { RoomEnvironment } from "./RoomEnvironment";
import { CameraController } from "./CameraController";
import { ROOM_OFFSET_Y } from "./shelfLayout";
import type { BookType } from "@/app/archive/page";

interface ArchiveSceneProps {
  selectedBook: BookType;
  setSelectedBook: (book: BookType) => void;
  onBookOpened: () => void;
}

// Inner wrapper component to run inside the Suspense boundary so texture loading works
function ArchiveContent({ selectedBook, setSelectedBook, onBookOpened }: ArchiveSceneProps) {
  // Load optimized WebP wood and floor textures
  const woodTexture = useTexture("/archive_wood_wall.webp");
  const floorTexture = useTexture("/archive_wood_floor.webp");

  // Configure texture wrap and repeating synchronously before materials are constructed
  woodTexture.wrapS = THREE.RepeatWrapping;
  woodTexture.wrapT = THREE.RepeatWrapping;
  woodTexture.repeat.set(2, 2);
  woodTexture.colorSpace = THREE.SRGBColorSpace;

  floorTexture.wrapS = THREE.RepeatWrapping;
  floorTexture.wrapT = THREE.RepeatWrapping;
  floorTexture.repeat.set(4, 4);
  floorTexture.colorSpace = THREE.SRGBColorSpace;

  // Construct shared MeshStandardMaterials for wood and floor to save draw calls
  const woodMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: woodTexture,
      color: "#f0d2b4", // Lifts the dark walnut texture so the shelf separates from the wall
      roughness: 0.55,
      metalness: 0.05,
    });
  }, [woodTexture]);

  const floorMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: floorTexture,
      color: "#b08a68", // Warm teak/oak tint for floor planks
      roughness: 0.6,
      metalness: 0.05,
    });
  }, [floorTexture]);

  return (
    <group position={[0, ROOM_OFFSET_Y, 0]}>
      <Bookshelf 
        selectedBook={selectedBook} 
        setSelectedBook={setSelectedBook}
        onBookOpened={onBookOpened}
        woodMaterial={woodMaterial}
      />
      <RoomEnvironment 
        woodMaterial={woodMaterial}
        floorMaterial={floorMaterial}
      />
    </group>
  );
}

export default function ArchiveScene({ selectedBook, setSelectedBook, onBookOpened }: ArchiveSceneProps) {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas 
        shadows="percentage"
        frameloop="demand"
        camera={{ position: [1.2, 1.1, 6.6], fov: 42 }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#141a17"]} />

        {/* Low fill so the lamp and shelf lights shape the room */}
        <ambientLight intensity={0.75} color="#d3ccbd" />

        {/* Cool dusk light from the window side (left-front), contrasting the warm lamps */}
        <directionalLight
          position={[-4.5, 5, 4]}
          intensity={1.7}
          color="#9db4dc"
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0005}
        >
          <orthographicCamera attach="shadow-camera" args={[-5, 5, 5, -3, 0.5, 15]} />
        </directionalLight>

        <Suspense
          fallback={
            <Html center>
              <p className="whitespace-nowrap text-sm text-white/60">Arranging the books...</p>
            </Html>
          }
        >
          <CameraController selectedBook={selectedBook} />

          <ArchiveContent selectedBook={selectedBook} setSelectedBook={setSelectedBook} onBookOpened={onBookOpened} />

          {/* Local reflections for brass and leather, rendered once without any network request */}
          <Environment resolution={64} frames={1} environmentIntensity={0.3}>
            <Lightformer form="rect" intensity={2} color="#ffc488" position={[-3, 2, 3]} scale={[3, 3, 1]} />
            <Lightformer form="rect" intensity={1.2} color="#9db4dc" position={[4, 3, 4]} scale={[4, 2, 1]} />
          </Environment>
        </Suspense>
      </Canvas>
    </div>
  );
}
