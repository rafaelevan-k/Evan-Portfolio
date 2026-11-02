"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, RoundedBox, Html } from "@react-three/drei";
import * as THREE from "three";
import type { BookType } from "@/app/archive/page";
import { archiveSerif } from "./archiveFont";
import { ARCHIVE_FONT, HERO_DEPTH, HERO_HEIGHT, HERO_WIDTH, PULL_OUT_Z, type HeroBook } from "./shelfLayout";

interface BookItemProps {
  book: HeroBook;
  hovered: boolean;
  selectedBook: BookType;
  setSelectedBook: (book: BookType) => void;
  onHoverChange: (book: HeroBook["type"] | null) => void;
  onBookOpened: () => void;
}

const GOLD = "#E5C158";
const DAMPING = 6;

// Opening timeline, in seconds: slide out, turn the cover to the camera, swing the cover open
const SLIDE_END = 0.85;
const TURN_START = 0.35;
const TURN_END = 0.9;
const OPEN_START = 0.85;
const OPEN_END = 1.45;
const READER_AT = 1.4;
const CLOSE_SPEED = 1.6;
const COVER_OPEN_ANGLE = -2.7;

function phase(time: number, start: number, end: number) {
  const x = THREE.MathUtils.clamp((time - start) / (end - start), 0, 1);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

export function BookItem({ book, hovered, selectedBook, setSelectedBook, onHoverChange, onBookOpened }: BookItemProps) {
  const groupRef = useRef<THREE.Group>(null);
  const coverRef = useRef<THREE.Group>(null);
  const goldMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  const timeRef = useRef(0);
  const hoverRef = useRef(0);
  const openedRef = useRef(false);

  const { type, title, position, color, yaw } = book;
  const isSelected = selectedBook === type;
  const isHighlighted = hovered && !selectedBook;
  const [baseX, baseY, baseZ] = position;

  useFrame((state, delta) => {
    const group = groupRef.current;
    const cover = coverRef.current;
    if (!group || !cover) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targetTime = isSelected ? OPEN_END : 0;
    const step = isSelected ? delta : -delta * CLOSE_SPEED;
    timeRef.current = reduceMotion ? targetTime : THREE.MathUtils.clamp(timeRef.current + step, 0, OPEN_END);

    const targetHover = isHighlighted ? 1 : 0;
    hoverRef.current = THREE.MathUtils.damp(hoverRef.current, targetHover, DAMPING, delta);

    const time = timeRef.current;
    const hover = hoverRef.current;
    const opening = phase(time, OPEN_START, OPEN_END);

    // The turned book's spine sits HERO_DEPTH / 2 left of its centre; shift so it lands on the shelf X as it opens
    group.position.x = baseX + (HERO_DEPTH / 2) * opening;
    group.position.z = baseZ + PULL_OUT_Z * phase(time, 0, SLIDE_END) + 0.14 * hover;
    group.rotation.x = -0.05 * hover;
    group.rotation.y = yaw + 0.06 * hover + (-Math.PI / 2 - yaw) * phase(time, TURN_START, TURN_END);
    cover.rotation.y = COVER_OPEN_ANGLE * opening;

    const targetEmissive = isHighlighted ? 1.2 : 0.35;
    const gold = goldMaterialRef.current;
    if (gold) gold.emissiveIntensity = THREE.MathUtils.damp(gold.emissiveIntensity, targetEmissive, DAMPING, delta);

    if (!isSelected) {
      openedRef.current = false;
    } else if (time >= READER_AT && !openedRef.current) {
      openedRef.current = true;
      onBookOpened();
    }

    const isAnimating =
      time !== targetTime ||
      Math.abs(hover - targetHover) > 0.001 ||
      (gold !== null && Math.abs(gold.emissiveIntensity - targetEmissive) > 0.01);

    if (isAnimating) state.invalidate();
  });

  return (
    <group
      ref={groupRef}
      position={[baseX, baseY, baseZ]}
      rotation={[0, yaw, 0]}
      onPointerOver={(e) => {
        e.stopPropagation();
        if (!selectedBook) {
          onHoverChange(type);
          document.body.style.cursor = "pointer";
        }
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onHoverChange(null);
        document.body.style.cursor = "auto";
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (!selectedBook) {
          setSelectedBook(type);
          onHoverChange(null);
          document.body.style.cursor = "auto";
        }
      }}
    >
      {/* 1. Spine (faces the viewer) */}
      <RoundedBox
        args={[HERO_WIDTH, HERO_HEIGHT, 0.02]}
        position={[0, 0, HERO_DEPTH / 2]}
        radius={0.005}
        smoothness={4}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={color} roughness={0.55} metalness={0.05} />
      </RoundedBox>

      {/* 2. Back Cover */}
      <RoundedBox
        args={[0.008, HERO_HEIGHT, HERO_DEPTH]}
        position={[-HERO_WIDTH / 2 + 0.004, 0, 0]}
        radius={0.004}
        smoothness={4}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={color} roughness={0.55} metalness={0.05} />
      </RoundedBox>

      {/* 3. Front Cover, hinged at the spine */}
      <group ref={coverRef} position={[HERO_WIDTH / 2 - 0.004, 0, HERO_DEPTH / 2]}>
        <RoundedBox
          args={[0.008, HERO_HEIGHT, HERO_DEPTH]}
          position={[0, 0, -HERO_DEPTH / 2]}
          radius={0.004}
          smoothness={4}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color={color} roughness={0.55} metalness={0.05} />
        </RoundedBox>
        {/* Endpaper, seen once the cover is open */}
        <mesh position={[-0.0045, 0, -HERO_DEPTH / 2]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[HERO_DEPTH - 0.02, HERO_HEIGHT - 0.02]} />
          <meshStandardMaterial color="#cfc3a6" roughness={0.9} />
        </mesh>
        <Text
          position={[0.0045, 0.08, -HERO_DEPTH / 2]}
          rotation={[0, Math.PI / 2, 0]}
          fontSize={0.038}
          maxWidth={HERO_DEPTH - 0.08}
          textAlign="center"
          color={GOLD}
          anchorX="center"
          anchorY="middle"
          font={ARCHIVE_FONT}
        >
          {title}
        </Text>
      </group>

      {/* 4. Inside Pages */}
      <mesh position={[0, 0, -0.01]} castShadow receiveShadow>
        <boxGeometry args={[HERO_WIDTH - 0.015, HERO_HEIGHT - 0.016, HERO_DEPTH - 0.02]} />
        <meshStandardMaterial color="#f6f0e2" roughness={0.9} metalness={0.0} />
      </mesh>

      {/* Title page, revealed under the cover */}
      <Text
        position={[(HERO_WIDTH - 0.015) / 2 + 0.0005, 0.08, -0.01]}
        rotation={[0, Math.PI / 2, 0]}
        fontSize={0.03}
        maxWidth={HERO_DEPTH - 0.1}
        textAlign="center"
        color="#3a2c18"
        anchorX="center"
        anchorY="middle"
        font={ARCHIVE_FONT}
      >
        {title}
      </Text>

      {/* 5. Spine gold bands and engraved title */}
      <group position={[0, 0, HERO_DEPTH / 2 + 0.011]}>
        <mesh position={[0, 0.265, 0]}>
          <boxGeometry args={[HERO_WIDTH - 0.03, 0.006, 0.002]} />
          <meshStandardMaterial ref={goldMaterialRef} color={GOLD} metalness={0.9} roughness={0.2} emissive="#7a5a10" emissiveIntensity={0.35} />
        </mesh>
        <Text
          position={[0, 0, 0.002]}
          rotation={[0, 0, -Math.PI / 2]}
          fontSize={0.052}
          color={GOLD}
          anchorX="center"
          anchorY="middle"
          font={ARCHIVE_FONT}
          letterSpacing={0.04}
        >
          {title}
        </Text>
        <mesh position={[0, -0.265, 0]}>
          <boxGeometry args={[HERO_WIDTH - 0.03, 0.006, 0.002]} />
          <meshStandardMaterial color={GOLD} metalness={0.9} roughness={0.2} emissive="#7a5a10" emissiveIntensity={0.35} />
        </mesh>
      </group>

      {/* 6. Hover Tooltip */}
      {isHighlighted && (
        <Html center distanceFactor={5.5} position={[0, HERO_HEIGHT / 2 + 0.08, HERO_DEPTH / 2]}>
          <div
            className={archiveSerif.className}
            style={{
              background: "rgba(24, 20, 14, 0.94)",
              border: "1px solid rgba(198, 167, 95, 0.45)",
              color: "#fcf8ed",
              padding: "6px 14px",
              borderRadius: "6px",
              fontSize: "13px",
              whiteSpace: "nowrap",
              boxShadow: "0 8px 20px rgba(0, 0, 0, 0.6)",
              pointerEvents: "none",
            }}
          >
            Open {title}
          </div>
        </Html>
      )}
    </group>
  );
}
