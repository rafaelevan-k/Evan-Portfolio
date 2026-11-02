"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox, Text } from "@react-three/drei";
import { BookItem } from "@/components/archive/BookItem";
import type { BookType } from "@/app/archive/page";
import * as THREE from "three";
import {
  ARCHIVE_FONT,
  HERO_BOOKS,
  HERO_DEPTH,
  LEVEL_CLEAR_HEIGHT,
  PULL_OUT_Z,
  SHELF_DEPTH,
  SHELF_HEIGHT,
  SHELF_SURFACES,
  SHELF_WIDTH,
  UPRIGHT_X,
  buildFillerBooks,
  type BoxInstance,
  type HeroBook,
} from "./shelfLayout";

interface BookshelfProps {
  selectedBook: BookType;
  setSelectedBook: (book: BookType) => void;
  onBookOpened: () => void;
  woodMaterial: THREE.Material;
}

// Brass indexing plate on the shelf lip, directly under the book it names
function ShelfLabel({ text, position }: { text: string; position: [number, number, number] }) {
  return (
    <group position={position}>
      <RoundedBox args={[0.42, 0.034, 0.004]} radius={0.001} smoothness={2}>
        <meshStandardMaterial color="#c6a75f" metalness={0.85} roughness={0.3} />
      </RoundedBox>
      <Text
        position={[0, 0, 0.003]}
        fontSize={0.021}
        color="#2a1f0a"
        anchorX="center"
        anchorY="middle"
        font={ARCHIVE_FONT}
      >
        {text}
      </Text>
    </group>
  );
}

// Warm strip light fitted under the board above a level
function ShelfLight({ y }: { y: number }) {
  return (
    <group position={[0, y, 0.18]}>
      {[-1.2, 0, 1.2].map((x) => (
        <mesh key={x} position={[x, -0.006, 0]}>
          <boxGeometry args={[1.02, 0.006, 0.014]} />
          <meshStandardMaterial color="#ffd9a8" emissive="#ffb066" emissiveIntensity={3} />
        </mesh>
      ))}
      {/* Two point lights per level give a linear wash without per-book lights */}
      {[-0.9, 0.9].map((x) => (
        <pointLight key={x} position={[x, -0.1, -0.02]} intensity={1.3} distance={1.7} decay={1.7} color="#ffbe80" />
      ))}
    </group>
  );
}

// One always-mounted light follows the active book: changing the light count would recompile every shader
function BookLight({ hovered, selected }: { hovered: HeroBook | undefined; selected: HeroBook | undefined }) {
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state, delta) => {
    const light = lightRef.current;
    if (!light) return;

    if (selected) {
      light.position.set(selected.position[0] + HERO_DEPTH / 2, selected.position[1] + 0.15, selected.position[2] + PULL_OUT_Z + 0.65);
    } else if (hovered) {
      light.position.set(hovered.position[0], hovered.position[1], hovered.position[2] + HERO_DEPTH / 2 + 0.35);
    }

    const target = selected ? 1.4 : hovered ? 0.5 : 0;
    if (Math.abs(light.intensity - target) > 0.01) {
      light.intensity = THREE.MathUtils.damp(light.intensity, target, 6, delta);
      state.invalidate();
    } else {
      light.intensity = target;
    }
  });

  return <pointLight ref={lightRef} intensity={0} distance={1.6} color="#ffd880" />;
}

function InstancedBoxes({ items, castShadow, children }: { items: BoxInstance[]; castShadow?: boolean; children: React.ReactNode }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    items.forEach((item, index) => {
      dummy.position.set(...item.position);
      dummy.rotation.set(0, 0, item.rotationZ);
      dummy.scale.set(...item.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
      if (item.color) mesh.setColorAt(index, color.set(item.color));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [items]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, items.length]} castShadow={castShadow} receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      {children}
    </instancedMesh>
  );
}

// Muted books that make the shelf feel lived in; instanced so they cost three draw calls
function FillerBooks() {
  const books = useMemo(() => buildFillerBooks(), []);

  return (
    <>
      <InstancedBoxes items={books.covers} castShadow>
        <meshStandardMaterial roughness={0.8} metalness={0.02} />
      </InstancedBoxes>
      <InstancedBoxes items={books.pages}>
        <meshStandardMaterial color="#c9bea6" roughness={0.95} />
      </InstancedBoxes>
      <InstancedBoxes items={books.bands}>
        <meshStandardMaterial color="#a88f4f" metalness={0.8} roughness={0.4} />
      </InstancedBoxes>
    </>
  );
}

export function Bookshelf({ selectedBook, setSelectedBook, onBookOpened, woodMaterial }: BookshelfProps) {
  const [hoveredType, setHoveredType] = useState<HeroBook["type"] | null>(null);
  const hoveredBook = HERO_BOOKS.find((book) => book.type === hoveredType);
  const activeBook = HERO_BOOKS.find((book) => book.type === selectedBook);

  return (
    <group>
      {/* Plinth */}
      <RoundedBox args={[SHELF_WIDTH + 0.04, 0.1, SHELF_DEPTH]} position={[0, 0.05, 0]} radius={0.01} smoothness={3} receiveShadow castShadow material={woodMaterial} />

      {/* Side panels */}
      {[-1, 1].map((side) => (
        <RoundedBox
          key={side}
          args={[0.04, SHELF_HEIGHT, SHELF_DEPTH]}
          position={[(side * SHELF_WIDTH) / 2, SHELF_HEIGHT / 2, 0]}
          radius={0.01}
          smoothness={3}
          receiveShadow
          castShadow
          material={woodMaterial}
        />
      ))}

      {/* Back panel */}
      <RoundedBox args={[SHELF_WIDTH, SHELF_HEIGHT, 0.04]} position={[0, SHELF_HEIGHT / 2, -0.23]} radius={0.01} smoothness={3} receiveShadow material={woodMaterial} />

      {/* Uprights splitting the shelf into three bays */}
      {UPRIGHT_X.map((x) => (
        <mesh key={x} position={[x, 1.58, 0.01]} receiveShadow castShadow material={woodMaterial}>
          <boxGeometry args={[0.03, 2.96, 0.48]} />
        </mesh>
      ))}

      {/* Shelf boards (the bottom level stands on the plinth) */}
      {SHELF_SURFACES.slice(1).map((surface) => (
        <RoundedBox
          key={surface}
          args={[SHELF_WIDTH - 0.04, 0.04, 0.48]}
          position={[0, surface - 0.02, 0.01]}
          radius={0.005}
          smoothness={3}
          receiveShadow
          castShadow
          material={woodMaterial}
        />
      ))}

      {/* Top cap */}
      <RoundedBox args={[SHELF_WIDTH + 0.08, 0.05, SHELF_DEPTH + 0.03]} position={[0, SHELF_HEIGHT - 0.015, 0.01]} radius={0.01} smoothness={3} receiveShadow castShadow material={woodMaterial} />

      {/* --- Cabinet Top Decor (shadows disabled for performance) --- */}
      <group position={[0, SHELF_HEIGHT + 0.01, 0]}>
        <group position={[-1.1, 0, 0]}>
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.08, 0.06, 0.1, 16]} />
            <meshStandardMaterial color="#8d4f3a" roughness={0.85} />
          </mesh>
          <RoundedBox args={[0.06, 0.26, 0.01]} position={[-0.05, 0.2, 0]} rotation={[0.3, 0, 0.5]} radius={0.002}>
            <meshStandardMaterial color="#3d5c3a" roughness={0.8} />
          </RoundedBox>
          <RoundedBox args={[0.06, 0.26, 0.01]} position={[0.05, 0.2, 0]} rotation={[-0.3, 0, -0.5]} radius={0.002}>
            <meshStandardMaterial color="#3d5c3a" roughness={0.8} />
          </RoundedBox>
          <RoundedBox args={[0.06, 0.3, 0.01]} position={[0, 0.23, 0]} rotation={[0, 0.5, 0.05]} radius={0.002}>
            <meshStandardMaterial color="#4a6e45" roughness={0.8} />
          </RoundedBox>
        </group>
        <RoundedBox args={[0.34, 0.05, 0.24]} position={[1, 0.025, 0.02]} rotation={[0, 0.1, 0]} radius={0.003}>
          <meshStandardMaterial color="#203054" roughness={0.7} />
        </RoundedBox>
        <RoundedBox args={[0.28, 0.04, 0.2]} position={[1.02, 0.07, 0.01]} rotation={[0, -0.2, 0]} radius={0.003}>
          <meshStandardMaterial color="#4f3824" roughness={0.7} />
        </RoundedBox>
      </group>

      {SHELF_SURFACES.map((surface) => (
        <ShelfLight key={surface} y={surface + LEVEL_CLEAR_HEIGHT} />
      ))}

      <FillerBooks />

      {HERO_BOOKS.map((book) => (
        <group key={book.type}>
          <ShelfLabel
            text={book.title}
            position={[book.position[0], book.level === 0 ? 0.05 : SHELF_SURFACES[book.level] - 0.02, SHELF_DEPTH / 2 + 0.012]}
          />
          <BookItem
            book={book}
            hovered={hoveredType === book.type}
            selectedBook={selectedBook}
            setSelectedBook={setSelectedBook}
            onHoverChange={setHoveredType}
            onBookOpened={onBookOpened}
          />
        </group>
      ))}

      <BookLight hovered={hoveredBook} selected={activeBook} />
    </group>
  );
}
