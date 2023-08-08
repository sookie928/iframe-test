import Model from '@components/Model';
import { useMachine } from '@xstate/react';
import { libMachine } from './libs/src/machines/apps/libMachine';
const SCENE_DATA = {
  idx: 22,
  dpr: [1, 2],
  frameloop: false,
  renderer: {
    performance: 'high-performance',
    color: '#ffffff',
    exposure: 1,
    toneMappingExposure: 1,
    toneMapping: 'ReinhardToneMapping',
  },
  camera: {
    fov: 50,
    near: 0.1,
    far: 100,
    position: [0, 0, 5],
    default: {
      eye: [0, 0, 7],
      correctionValue: {
        x: 0,
        y: 0,
        z: 0,
      },
    },
  },
  scene: {
    lights: {
      main: {
        intensity: 2.8,
        color: '#ffffff',
        position: [5, 0.5, 5],
      },
      sides: [
        {
          type: 'directional',
          name: 'side01',
          intensity: 2.8,
          color: '#ffffff',
          position: [5, -5, 5],
          shadow: {
            near: 0.1,
            far: 100,
            left: -100,
            right: 100,
            top: 100,
            bottom: -100,
            bias: 0.0001,
          },
        },
        {
          type: 'directional',
          name: 'side51',
          intensity: 2.8,
          color: 16777215,
          position: [-0.48796387835032934, 0, 0.4239126217737621],
          shadow: {
            near: 0.1,
            far: 100,
            left: -100,
            right: 100,
            top: 100,
            bottom: -100,
            bias: 0.0001,
          },
        },
      ],
    },
  },
  shadow: {
    position: [0, 0, 0],
    scale: [0, 0, 0],
  },
  light: {
    intensity: 2.8,
    color: '#ffffff',
    position: [500, 50, 500],
    shadow: {
      near: 0.1,
      far: 100,
      left: -100,
      right: 100,
      bias: 0.0001,
    },
  },
  background: {
    color1: '#1c1c1e',
    color2: '#1c1c1e',
    aspectCorrection: false,
    aspect: 1,
    offset: [0, 0],
    scale: [0.7, 0.7],
    smoother: [0, 0.95],
  },
  control: {
    name: 'OrbitControls',
    autoRotate: false,
    limitation: {
      is: true,
      angle: ['-Infinity', 'Infinity', '-Infinity', 'Infinity'],
      zoom: [0, 10],
      pan: [
        [-1, -1, -1],
        [1, 1, 1],
      ],
    },
  },
  defaultTransform: {
    position: [0, 0, 0],
    scale: 0.1,
  },
};

const MODEL_DATA = {
  idx: 22,
  textures: {},
  scale: 1,
  animation: {
    keyframe: {
      speed: 1,
    },
    shapekeys: {},
  },
  dynamics: {
    Lens: {
      meshes: ['lens_capsule', 'lens_cortex'],
    },
    'Suspensory Ligaments': {
      meshes: ['suspensory_ligaments'],
    },
    Sclera: {
      meshes: ['sclera'],
    },
    Retina: {
      meshes: ['retina'],
    },
    'Retinal Blood Vessels': {
      meshes: ['retinal_blood_vessels_blue', 'retinal_blood_vessels_red'],
    },
    cornea: {
      meshes: ['cornea'],
    },
    'Iris Ciliary Body': {
      meshes: ['iris_ciliary_body_half'],
    },
    'Ora Serrata': {
      meshes: ['ora_serrata'],
    },
  },
  hides: [],
  instances: [],
  alphas: [],
  dpi: [1280, 720],
  volume: 22.2,
  license: 'standard',
};
function App() {
  const [current, send] = useMachine(libMachine);

  return (
    <div className='w-screen h-screen'>
      <Model data={SCENE_DATA} modelData={MODEL_DATA} send={send} current={current} uri={'https://bluebeaker.blob.core.windows.net/public/3d/bt3000a.glb'} />
    </div>
  );
}

export default App;
