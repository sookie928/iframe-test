import { Billboard, Image } from '@react-three/drei';
import { FC, useMemo } from 'react';
import * as THREE from 'three';

const ObjectToZoom: FC<{ scene: THREE.Group; data: any }> = ({ scene, data }) => {
  const objects = useMemo(() => {
    const res: any[] = [];
    if (data && data.data.categories) {
      data.data.categories.forEach((d: any) => {
        const r = scene.getObjectByName(d.position_name);
        if (r) r.name = d.position_name;
        if (r) res.push(r);
      });
    }
    return res;
  }, [data]);

  return (
    objects &&
    objects.map((o, i) => (
      <Billboard key={i} {...o} position={[o.position.x, o.position.y, o.position.z + 0.15]} follow>
        <Image name={o.name} url="/img/plus.webp" transparent scale={[0.3, 0.3]} />
      </Billboard>
    ))
  );
};

export default ObjectToZoom;
