import Model from '@components/ZoomTest/Model';
import ObjectToZoom from '@components/ZoomTest/ObjectToZoom';
import SelectToZoom from '@components/ZoomTest/SelectToZoom';
import { Bounds, Environment, OrbitControls, useGLTF } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { FC, Suspense } from 'react';

const data = {
  error_message: '',
  is_successful: true,
  data: {
    place: {
      title: '도수치료실',
      json: '{"path":"https://medmapb2b.blob.core.windows.net/show/model/place/1/1.glb"}',
      department: '정형외과',
      create_date: '2023-04-10T13:18:36.423+00:00',
      description: '의료기기를 찾아보는 새로운 방법, 3D 쇼룸을 경험해보세요!',
      update_date: '2023-04-10T13:18:36.423+00:00',
    },
    categories: [
      {
        title: '관절치료 장비',
        position_name: 'Joint_therapy_equipment',
        thumb_image_url: 'https://medmapb2b.blob.core.windows.net/show/image/category/1/thumb.webp',
        idx: 1,
      },
      {
        thumb_image_url: 'https://medmapb2b.blob.core.windows.net/show/image/category/2/thumb.webp',
        idx: 2,
        title: '척추관절 장비',
        position_name: 'Spinal_joint_equipment',
      },
      {
        title: '촉수치료 장비',
        thumb_image_url: 'https://medmapb2b.blob.core.windows.net/show/image/category/3/thumb.webp',
        position_name: 'Trigger_point_therapy_equipment',
        idx: 3,
      },
      {
        thumb_image_url: 'https://medmapb2b.blob.core.windows.net/show/image/category/4/thumb.webp',
        idx: 4,
        position_name: 'Soft_tissue_therapy_equipment',
        title: '연부조직치료 장비',
      },
      {
        title: '심층열치료 장비',
        idx: 123,
        thumb_image_url: 'https://medmapb2b.blob.core.windows.net/show/image/category/123/thumb.webp',
        position_name: 'Deep_heat_therapy_equipment',
      },
    ],
  },
  error_code: 2000,
};

const Select: FC<object> = () => {
  const { scene } = useGLTF('https://bluebeaker.blob.core.windows.net/public/3d/1.glb', true);
  return (
    <div className="w-screen h-screen">
      <Canvas camera={{ position: [0, 20, 80], fov: 50 }} dpr={[1, 2]} color="transparent">
        <Suspense fallback={null}>
          <Environment preset="warehouse"/>
          <Bounds fit clip observe margin={1.2}>
            <SelectToZoom scene={scene} rotation={[0, Math.PI / 4, 0]}>
              <Model scene={scene} />
              <ObjectToZoom scene={scene} data={data} />
            </SelectToZoom>
          </Bounds>
        </Suspense>
        <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 1.75} />
      </Canvas>
    </div>
  );
};
export default Select;
useGLTF.preload('https://bluebeaker.blob.core.windows.net/public/3d/1.glb');
