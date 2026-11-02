"use client";

import { ContactShadows, RoundedBox, Text } from "@react-three/drei";
import * as THREE from "three";
import { getPaintBump, getRugTexture } from "./proceduralTextures";
import { ARCHIVE_FONT } from "./shelfLayout";

interface RoomEnvironmentProps {
  woodMaterial: THREE.Material;
  floorMaterial: THREE.Material;
}

const WALL_COLOR = "#2c4136";
const TRIM_COLOR = "#263a30";
const WALL_Z = -0.26;
const ROOM_HALF_WIDTH = 6;
const ROOM_HEIGHT = 4.2;
const ROOM_DEPTH = 10;
const BATTEN_X = [-5.4, -4.2, -3, 3, 4.2, 5.4];

function Trim({ args, position }: { args: [number, number, number]; position: [number, number, number] }) {
  return (
    <mesh position={position} receiveShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial color={TRIM_COLOR} roughness={0.7} />
    </mesh>
  );
}

export function RoomEnvironment({ woodMaterial, floorMaterial }: RoomEnvironmentProps) {
  return (
    <>
      {/* Floor planks */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, WALL_Z + ROOM_DEPTH / 2]} receiveShadow material={floorMaterial}>
        <planeGeometry args={[ROOM_HALF_WIDTH * 2, ROOM_DEPTH]} />
      </mesh>

      {/* Painted walls and ceiling, so the room never ends inside the frame */}
      <mesh position={[0, ROOM_HEIGHT / 2, WALL_Z]} receiveShadow>
        <planeGeometry args={[ROOM_HALF_WIDTH * 2, ROOM_HEIGHT]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.8} bumpMap={getPaintBump()} bumpScale={0.15} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * ROOM_HALF_WIDTH, ROOM_HEIGHT / 2, WALL_Z + ROOM_DEPTH / 2]} rotation={[0, -side * Math.PI / 2, 0]}>
          <planeGeometry args={[ROOM_DEPTH, ROOM_HEIGHT]} />
          <meshStandardMaterial color={WALL_COLOR} roughness={0.85} />
        </mesh>
      ))}
      <mesh position={[0, ROOM_HEIGHT, WALL_Z + ROOM_DEPTH / 2]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[ROOM_HALF_WIDTH * 2, ROOM_DEPTH]} />
        <meshStandardMaterial color="#1b241f" roughness={0.9} />
      </mesh>

      {/* Wall panelling: baseboard, dado rail, crown, and battens */}
      <Trim args={[ROOM_HALF_WIDTH * 2, 0.2, 0.03]} position={[0, 0.1, WALL_Z + 0.015]} />
      <Trim args={[ROOM_HALF_WIDTH * 2, 0.05, 0.03]} position={[0, 1.1, WALL_Z + 0.015]} />
      <Trim args={[ROOM_HALF_WIDTH * 2, 0.12, 0.04]} position={[0, ROOM_HEIGHT - 0.06, WALL_Z + 0.02]} />
      {BATTEN_X.map((x) => (
        <Trim key={x} args={[0.05, ROOM_HEIGHT, 0.02]} position={[x, ROOM_HEIGHT / 2, WALL_Z + 0.01]} />
      ))}

      {/* Woven wool rug */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 1.65]} receiveShadow>
        <planeGeometry args={[4.6, 2.3]} />
        <meshStandardMaterial map={getRugTexture()} roughness={0.97} />
      </mesh>

      {/* Antique storage trunk below the poster */}
      <group position={[2.75, 0, 0.35]} rotation={[0, -0.18, 0]}>
        <RoundedBox args={[0.85, 0.5, 0.5]} position={[0, 0.25, 0]} radius={0.012} smoothness={3} receiveShadow castShadow material={woodMaterial} />
        {[-0.26, 0.26].map((x) => (
          <mesh key={x} position={[x, 0.25, 0]}>
            <boxGeometry args={[0.025, 0.51, 0.51]} />
            <meshStandardMaterial color="#a6894b" metalness={0.8} roughness={0.3} />
          </mesh>
        ))}
        <RoundedBox args={[0.34, 0.05, 0.24]} position={[0.02, 0.525, -0.02]} rotation={[0, 0.1, 0]} radius={0.003} castShadow>
          <meshStandardMaterial color="#4f1e1e" roughness={0.7} />
        </RoundedBox>
        <RoundedBox args={[0.28, 0.045, 0.2]} position={[0, 0.572, -0.01]} rotation={[0, -0.15, 0]} radius={0.003} castShadow>
          <meshStandardMaterial color="#1a3d24" roughness={0.7} />
        </RoundedBox>
      </group>

      {/* Framed poster on the back wall */}
      <group position={[2.75, 1.9, WALL_Z + 0.02]}>
        <RoundedBox args={[1.05, 1.35, 0.03]} radius={0.006} smoothness={3} castShadow material={woodMaterial} />
        <mesh position={[0, 0, 0.017]}>
          <planeGeometry args={[0.97, 1.27]} />
          <meshStandardMaterial color="#e9e2cf" roughness={0.9} />
        </mesh>
        <Text position={[0, 0.2, 0.02]} fontSize={0.082} color="#2a1e08" anchorX="center" anchorY="middle" font={ARCHIVE_FONT} letterSpacing={0.1}>
          THE ARCHIVE
        </Text>
        <mesh position={[0, 0.06, 0.02]}>
          <boxGeometry args={[0.6, 0.004, 0.001]} />
          <meshStandardMaterial color="#8b7238" metalness={0.6} roughness={0.4} />
        </mesh>
        <Text
          position={[0, -0.1, 0.02]}
          fontSize={0.064}
          color="#5a4c3e"
          anchorX="center"
          anchorY="middle"
          maxWidth={0.85}
          textAlign="center"
          font={ARCHIVE_FONT}
          lineHeight={1.4}
        >
          {"A collection of\nmy journey"}
        </Text>
      </group>

      {/* Standing floor lamp: the warm key light for the room */}
      <group position={[-2.75, 0, 0.55]}>
        <mesh position={[0, 0.025, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.23, 0.05, 32]} />
          <meshStandardMaterial color="#6d5a2f" roughness={0.35} metalness={0.8} />
        </mesh>
        <mesh position={[0, 1.05, 0]} castShadow>
          <cylinderGeometry args={[0.014, 0.014, 2.05, 16]} />
          <meshStandardMaterial color="#b59a57" roughness={0.3} metalness={0.85} />
        </mesh>
        <mesh position={[0, 2.2, 0]}>
          <cylinderGeometry args={[0.2, 0.36, 0.42, 32, 1, true]} />
          <meshStandardMaterial color="#f1d6aa" emissive="#ffb56b" emissiveIntensity={1.5} roughness={0.8} side={THREE.DoubleSide} />
        </mesh>
        <pointLight position={[0, 2.1, 0.15]} intensity={10} distance={8} decay={1.6} color="#ffc488" />
      </group>

      <ContactShadows position={[0, 0.008, 0]} opacity={0.55} scale={14} blur={2.5} far={3} frames={1} resolution={512} />
    </>
  );
}
