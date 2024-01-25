// This component wraps children in a group with a click handler

import { useBounds } from '@react-three/drei';
import { ReactNode } from 'react';
import * as THREE from 'three';

// Clicking any object will refresh and fit bounds
function SelectToZoom({
  children,
  scene,
  rotation,
}: {
  children: ReactNode;
  scene: THREE.Group;
  rotation: [number, number, number];
}) {
  const api = useBounds();

  return (
    <group
      rotation={rotation}
      onClick={(e) => (e.stopPropagation(), e.delta <= 2 && api.refresh(scene.getObjectByName(e.object.name)).fit())}
      onPointerMissed={(e) => e.button === 0 && api.refresh().fit()}
    >
      {children}
    </group>
  );
}

export default SelectToZoom;
