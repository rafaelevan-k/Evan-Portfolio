"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { BookType } from "@/app/archive/page";
import { HERO_BOOKS, MAX_FRAME_DELTA, ROOM_OFFSET_Y, SHELF_WIDTH } from "./shelfLayout";

interface CameraControllerProps {
  selectedBook: BookType;
}

const OVERVIEW_FOV = 42;
const READING_FOV = 38;
const OVERVIEW_DISTANCE = 5.6;
// Shelf width plus breathing room that must stay in frame on narrow viewports
const FRAMED_WIDTH = SHELF_WIDTH + 1;

// Frame-rate independent smoothing: stays stable on long frames, unlike lerp(a, b, k * delta)
const DAMPING = 3;

export function CameraController({ selectedBook }: CameraControllerProps) {
  const lookAt = useRef(new THREE.Vector3(0, 0.55, -0.2));
  const targetPos = useRef(new THREE.Vector3());
  const targetLook = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    const camera = state.camera as THREE.PerspectiveCamera;
    const hero = HERO_BOOKS.find((book) => book.type === selectedBook);
    let targetFov = OVERVIEW_FOV;

    if (hero) {
      const bookWorldY = hero.position[1] + ROOM_OFFSET_Y;
      // The open book's spine ends up at the book's shelf X, right where the reader's fold appears
      targetPos.current.set(hero.position[0], bookWorldY, 2.7);
      targetLook.current.set(hero.position[0], bookWorldY, 0);
      targetFov = READING_FOV;
    } else {
      const halfFovTan = Math.tan(THREE.MathUtils.degToRad(OVERVIEW_FOV / 2));
      const fitDistance = FRAMED_WIDTH / 2 / (halfFovTan * state.viewport.aspect);
      const distance = Math.max(OVERVIEW_DISTANCE, fitDistance);
      targetPos.current.set(0.75, 0.7, distance);
      targetLook.current.set(0, 0.55, -0.2);
    }

    const isAnimating =
      camera.position.distanceTo(targetPos.current) > 0.002 ||
      lookAt.current.distanceTo(targetLook.current) > 0.002 ||
      Math.abs(camera.fov - targetFov) > 0.05;

    if (isAnimating) {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const alpha = reduceMotion ? 1 : 1 - Math.exp(-DAMPING * Math.min(delta, MAX_FRAME_DELTA));
      camera.position.lerp(targetPos.current, alpha);
      lookAt.current.lerp(targetLook.current, alpha);
      camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, alpha);
      state.invalidate();
    } else {
      // Snap to final values to sleep the renderer
      camera.position.copy(targetPos.current);
      lookAt.current.copy(targetLook.current);
      camera.fov = targetFov;
    }

    camera.lookAt(lookAt.current);
    camera.updateProjectionMatrix();
  });

  return null;
}
