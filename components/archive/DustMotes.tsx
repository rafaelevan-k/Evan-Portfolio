"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { BookType } from "@/app/archive/page";
import { getDustSprite } from "./proceduralTextures";
import { seededRandom } from "./shelfLayout";

const MOTE_COUNT = 150;
// Share of motes gathered around the lamp, where the light makes them visible
const LAMP_SHARE = 0.55;
const LAMP_X = -2.75;
const DRIFT_FPS = 30;

// Motes stop drifting on devices that can't keep up, since they are only atmosphere
const SLOW_FRAME_SECONDS = 0.06;
const SLOW_FRAMES_TO_STOP = 24;
// A longer gap is a backgrounded tab returning, not a slow device
const BACKGROUND_GAP_SECONDS = 1;

export function DustMotes({ selectedBook }: { selectedBook: BookType }) {
  const pointsRef = useRef<THREE.Points>(null);
  const slowFramesRef = useRef(0);
  const [isDrifting, setIsDrifting] = useState(true);
  const invalidate = useThree((state) => state.invalidate);

  const { base, phases, positions, colors } = useMemo(() => {
    const random = seededRandom(5521);
    const base = new Float32Array(MOTE_COUNT * 3);
    const phases = new Float32Array(MOTE_COUNT);
    const colors = new Float32Array(MOTE_COUNT * 3);

    for (let i = 0; i < MOTE_COUNT; i++) {
      const nearLamp = i < MOTE_COUNT * LAMP_SHARE;
      base[i * 3] = nearLamp ? LAMP_X + (random() - 0.5) * 2.6 : (random() - 0.5) * 6;
      base[i * 3 + 1] = 0.25 + random() * 2.9;
      base[i * 3 + 2] = 0.4 + random() * 2;
      phases[i] = random() * Math.PI * 2;

      const brightness = 0.25 + random() * 0.75;
      colors[i * 3] = brightness;
      colors[i * 3 + 1] = brightness * 0.85;
      colors[i * 3 + 2] = brightness * 0.62;
    }
    return { base, phases, positions: base.slice(), colors };
  }, []);

  // The scene renders on demand, so the drift requests its own frames at a capped rate
  useEffect(() => {
    if (selectedBook || !isDrifting) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const interval = window.setInterval(() => invalidate(), 1000 / DRIFT_FPS);
    return () => window.clearInterval(interval);
  }, [selectedBook, isDrifting, invalidate]);

  useFrame((state, delta) => {
    const points = pointsRef.current;
    if (!points) return;

    if (delta < BACKGROUND_GAP_SECONDS) {
      slowFramesRef.current = delta > SLOW_FRAME_SECONDS ? slowFramesRef.current + 1 : 0;
      if (slowFramesRef.current >= SLOW_FRAMES_TO_STOP) setIsDrifting(false);
    }

    const time = state.clock.elapsedTime;
    const attribute = points.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < MOTE_COUNT; i++) {
      const phase = phases[i];
      attribute.setXYZ(
        i,
        base[i * 3] + Math.sin(time * 0.13 + phase) * 0.16,
        base[i * 3 + 1] + Math.sin(time * 0.09 + phase * 2) * 0.12,
        base[i * 3 + 2] + Math.cos(time * 0.11 + phase) * 0.1,
      );
    }
    attribute.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={getDustSprite()}
        size={0.028}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.55}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
