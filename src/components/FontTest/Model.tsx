import { useThree } from '@react-three/fiber';
import { FC, useCallback, useEffect, useRef } from 'react';
import * as THREE from 'three';

const Model: FC<any> = ({ scene, ...props }) => {
  const ref = useRef<THREE.Group>();
  const { invalidate, viewport, mouse } = useThree();

  const handleRender = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();

      const x = (mouse.x * viewport.width) / 2;
      let windowWidth = viewport.width / 2;
      const goal = ((x % (2 * windowWidth)) - windowWidth) / windowWidth + Math.PI / 2;
      if (goal !== undefined && ref.current)
        ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, goal, 0.1);
      invalidate();
    },
    [ref, invalidate, mouse.x, viewport.width]
  );

  useEffect(() => {
    if (ref.current)
      ref.current.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh)
          ((obj as THREE.Mesh).material as THREE.MeshStandardMaterial).envMapIntensity = 0.7;
      });
  }, [scene]);

  useEffect(() => {
    document.addEventListener('mousemove', handleRender);

    return () => {
      document.removeEventListener('mousemove', handleRender);
    };
  }, [handleRender]);

  return <primitive ref={ref} object={scene} {...props} />;
};

export default Model;
