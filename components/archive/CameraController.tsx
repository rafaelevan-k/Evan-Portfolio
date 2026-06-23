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
    // Determine target position, lookAt, and FOV
    const targetPos = new THREE.Vector3();
    const targetLook = new THREE.Vector3();
    let targetFov = 42;

    if (!selectedBook) {
      targetPos.set(1.4, 0.9, 4.4);
      targetLook.set(-0.15, 0.55, 0);
      targetFov = 42;
    } else {
      let bookWorldY = 0.55;
      if (selectedBook === "awards") bookWorldY = 1.65;
      else if (selectedBook === "volunteer") bookWorldY = 0.9;
      else if (selectedBook === "certifications") bookWorldY = 0.15;
      else if (selectedBook === "cv") bookWorldY = -0.6;

      targetPos.set(0, bookWorldY, 2.7);
      targetLook.set(0, bookWorldY, 0);
      targetFov = 38;
    }

    const posDiff = camera.position.distanceTo(targetPos);
    
    // Check direction convergence to lookAt targets
    const currentDir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const targetDir = new THREE.Vector3().subVectors(targetLook, camera.position).normalize();
    const dirDiff = currentDir.distanceTo(targetDir);

    const fovDiff = camera instanceof THREE.PerspectiveCamera ? Math.abs(camera.fov - targetFov) : 0;

    const isAnimating = posDiff > 0.002 || dirDiff > 0.002 || fovDiff > 0.05;

    if (isAnimating) {
      // Lerp camera position
      camera.position.lerp(targetPos, 3 * delta);

      // Lerp camera lookAt
      const currentLookAt = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).add(camera.position);
      currentLookAt.lerp(targetLook, 3.5 * delta);
      camera.lookAt(currentLookAt);

      // Lerp FOV
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, 3 * delta);
        camera.updateProjectionMatrix();
      }

      state.invalidate();
    } else {
      // Snap to final values to sleep the renderer
      camera.position.copy(targetPos);
      camera.lookAt(targetLook);
      if (camera instanceof THREE.PerspectiveCamera && camera.fov !== targetFov) {
        camera.fov = targetFov;
        camera.updateProjectionMatrix();
      }
    }
  });

  return null;
}
