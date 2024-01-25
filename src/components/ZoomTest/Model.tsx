import { FC, useEffect, useRef } from 'react';
import * as THREE from 'three';

const Model: FC<any> = ({ scene, ...props }) => {
  const ref = useRef<THREE.Group>();

  useEffect(() => {
    if (ref.current)
      ref.current.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh)
          ((obj as THREE.Mesh).material as THREE.MeshStandardMaterial).envMapIntensity = 0.7
      });
  }, [scene]);
  return <primitive ref={ref} object={scene} {...props} />;
};

export default Model;
