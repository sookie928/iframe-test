import Back from '@components/FontTest/Back';
import Model from '@components/FontTest/Model';
import { Bounds, ContactShadows, Environment, OrbitControls, useGLTF } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { FC, Suspense } from 'react';

// const data = {
//   error_message: '',
//   is_successful: true,
//   data: {
//     place: {
//       title: '도수치료실',
//       json: '{"path":"https://medmapb2b.blob.core.windows.net/show/model/place/1/1.glb"}',
//       department: '정형외과',
//       create_date: '2023-04-10T13:18:36.423+00:00',
//       description: '의료기기를 찾아보는 새로운 방법, 3D 쇼룸을 경험해보세요!',
//       update_date: '2023-04-10T13:18:36.423+00:00',
//     },
//     categories: [
//       {
//         title: '관절치료 장비',
//         position_name: 'Joint_therapy_equipment',
//         thumb_image_url: 'https://medmapb2b.blob.core.windows.net/show/image/category/1/thumb.webp',
//         idx: 1,
//       },
//       {
//         thumb_image_url: 'https://medmapb2b.blob.core.windows.net/show/image/category/2/thumb.webp',
//         idx: 2,
//         title: '척추관절 장비',
//         position_name: 'Spinal_joint_equipment',
//       },
//       {
//         title: '촉수치료 장비',
//         thumb_image_url: 'https://medmapb2b.blob.core.windows.net/show/image/category/3/thumb.webp',
//         position_name: 'Trigger_point_therapy_equipment',
//         idx: 3,
//       },
//       {
//         thumb_image_url: 'https://medmapb2b.blob.core.windows.net/show/image/category/4/thumb.webp',
//         idx: 4,
//         position_name: 'Soft_tissue_therapy_equipment',
//         title: '연부조직치료 장비',
//       },
//       {
//         title: '심층열치료 장비',
//         idx: 123,
//         thumb_image_url: 'https://medmapb2b.blob.core.windows.net/show/image/category/123/thumb.webp',
//         position_name: 'Deep_heat_therapy_equipment',
//       },
//     ],
//   },
//   error_code: 2000,
// };

const Font: FC<object> = () => {
  const { scene } = useGLTF('https://bluebeaker.blob.core.windows.net/public/3d/1.glb', true);

  return (
    <div className="w-screen h-screen relative font-pretendard">
      <Canvas
        className="absolute h-full left-[10%] z-[999]"
        camera={{ position: [0, 40, 80], fov: 30 }}
        dpr={[1, 2]}
        color="transparent"
      >
        <Suspense fallback={null}>
          <Environment files="./img/photo_studio_01_2k.hdr" />
          <Bounds fit clip observe margin={1.2}>
            <Model scene={scene} rotation={[0, Math.PI / 4, 0]} />
          </Bounds>
        </Suspense>
        <ambientLight intensity={0.55} />

        <ContactShadows
          position-y={-0.15}
          scale={[3.5, 3.5]}
          far={1}
          opacity={0.5}
          blur={1}
          rotation={[0, 0, 0]}
          color={'black'}
        />
        <ContactShadows
          position-y={0}
          up={[0, 1, 0]}
          far={10}
          // rotation-y={isFlip ? -0.3 : 0}
          scale={[3.5, 3.5]}
          opacity={0.3}
          blur={1}
          color={'black'}
        />
        <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 1.75} />
      </Canvas>
      <div className="w-full h-full absolute inset-0 flex items-center justify-center">
        <Back />
      </div>
    </div>
  );
};
export default Font;
useGLTF.preload('https://bluebeaker.blob.core.windows.net/public/3d/1.glb');
