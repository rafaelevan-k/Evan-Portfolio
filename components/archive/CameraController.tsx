"use client";

import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { BookType } from "@/app/archive/page";

interface CameraControllerProps {
  selectedBook: BookType;
}

export function CameraController({ selectedBook }: CameraControllerProps) {
  const { camera } = useThree();
  const vec = new THREE.Vector3();
  const targetLookAt = new THREE.Vector3(0, 0, 0);

  useFrame((state, delta) => {
    if (!selectedBook) {
      // Idle Breathing Animation
      const t = state.clock.elapsedTime;
      const breatheX = Math.sin(t / 2) * 0.1;
      const breatheY = Math.cos(t / 3) * 0.1;
      
      // Base camera position
      vec.set(breatheX, 1.5 + breatheY, 5);
      camera.position.lerp(vec, 2 * delta);

      // Look at center
      targetLookAt.set(0, 0, 0);
      const currentLookAt = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).add(camera.position);
      currentLookAt.lerp(targetLookAt, 2 * delta);
      camera.lookAt(currentLookAt);

      // Slight FOV adjustment
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.fov = THREE.MathUtils.lerp(camera.fov, 45, 2 * delta);
        camera.updateProjectionMatrix();
      }
    } else {
      // When a book is selected, the camera centers and slightly zooms in
      vec.set(0, 1.5, 4.5);
      camera.position.lerp(vec, 3 * delta);

      targetLookAt.set(0, 1.5, 0);
      const currentLookAt = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).add(camera.position);
      currentLookAt.lerp(targetLookAt, 4 * delta);
      camera.lookAt(currentLookAt);

      if (camera instanceof THREE.PerspectiveCamera) {
        camera.fov = THREE.MathUtils.lerp(camera.fov, 40, 3 * delta);
        camera.updateProjectionMatrix();
      }
    }
  });

  return null;
}
