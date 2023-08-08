import * as THREE from 'three';
import { DATA, Viewer } from '../apps/Viewer';

import { RGBELoader } from '../libs/RGBELoader';
import { createBackground } from '../materials/createBackground';
import { makeShadow } from '../materials/Shadow';
import { Component } from './Component';
import { ResourceTracker } from './ResourceTracker';

const ENV_MAP = 'https://bluebeaker.blob.core.windows.net/public/3d/studio010.hdr';
const ENV_MAP2 = 'https://bluebeaker.blob.core.windows.net/public/3d/venice_sunset_2k.hdr';
const ENV_MAP3 = 'https://bluebeaker.blob.core.windows.net/public/3d/photo_studio_01_2k.hdr';

export class Content {
  viewer: Viewer;
  time: number;
  tracker: ResourceTracker;
  abortCtrl = AbortController.prototype;
  shadow: any;
  virtualScene: THREE.Scene | null;
  cubeCamera: THREE.CubeCamera | null;
  virtualSphere: THREE.Mesh | null;
  envMap: any;
  constructor(viewer: Viewer) {
    this.viewer = viewer;
    this.time = 0;
    this.tracker = new ResourceTracker('content');
    this.abortCtrl = new AbortController();
    this.shadow = null;
    this.virtualScene = null;
    this.cubeCamera = null;
    this.virtualSphere = null;
  }

  async init() {
    await this.initScene();

    this.initLights();

    return true;
  }

  private async initScene() {
    // background
    const background = createBackground(DATA.background); // TODO
    this.viewer.scene.add(background); // TODO : addObject
    this.viewer.background = background;

    if (!this.shadow)
      this.shadow = makeShadow(
        this.viewer,
        this.viewer.scene,
        this.viewer.renderer as THREE.WebGLRenderer,
        this.viewer.data?.shadow
      );
    else this.shadow.update();

    return await this.setEnvMap();
  }

  private initLights() {
    // light // addLights
    const { data, lights } = this.viewer;

    if (data && data.scene.lights) {
      // ambientLight
      this.addLight('ambient', data.scene.lights.main);
      // directionalLight
      if (data.scene.lights.sides.length > 0) {
        for (let i = 0; i < data.scene.lights.sides.length; i++) {
          const light = data.scene.lights.sides[i];
          this.addLight(light.type, data.scene.lights.sides[i]);
        }
      }
      this.addLight('point', {
        color: data.light.color,
        position: [0, 0, -1],
        intensity: data.light.intensity,
        name: 'point',
      });

      if (lights.point) lights.point.setTransform('intensity', 0);
    }
  }

  addLight(
    type: string,
    data: {
      color: THREE.ColorRepresentation | undefined;
      intensity: number | undefined;
      name: string | number;
      position: any;
      shadow?: {
        near: any;
        far: any;
        left: any;
        right: any;
        top: any;
        bottom: any;
        bias: number;
      };
    }
  ) {
    const { lights } = this.viewer;
    let light: any;
    if (lights && lights.directLights && lights.spotLights)
      switch (type) {
        case 'ambient':
          light = new THREE.AmbientLight(data.color);
          lights.ambient = new Component(this.viewer, light, false, type, data);
          return lights.ambient;
        case 'directional': {
          light = new THREE.DirectionalLight(data.color, data.intensity);
          lights.directLights[data.name] = new Component(this.viewer, light, true, type, data);
          return lights.directLights[data.name];
        }
        case 'spot': {
          light = new THREE.SpotLight(data.color, data.intensity);
          lights.spotLights[data.name] = new Component(this.viewer, light, true, type, data);
          return lights.spotLights[data.name];
        }
        case 'point': {
          light = new THREE.PointLight(data.color, data.intensity);
          lights.point = new Component(this.viewer, light, true, type, data);
          break;
        }
        default:
          break;
      }

    if (light && light.shadow) {
      // TODO
    }
  }

  async setEnvMap(path = ENV_MAP) {
    const { renderer } = this.viewer;
    const generator = new THREE.PMREMGenerator(renderer);
    generator.compileEquirectangularShader();

    THREE.DefaultLoadingManager.onLoad = function () {
      generator.dispose();
    };

    // TODO:-> BBLoader
    this.abortCtrl = new AbortController();
    const loader = (new RGBELoader(undefined) as any).setAbortSignal(this.abortCtrl.signal);
    const hdrmap = await loader.loadAsync(path);
    const target = generator.fromEquirectangular(hdrmap);
    target.texture.magFilter = THREE.LinearFilter;
    target.texture.needsUpdate = true;

    // for sphere
    const tex = new THREE.WebGLCubeRenderTarget(1024, {
      format: THREE.RGBAFormat,
      generateMipmaps: true,
     // encoding: THREE.sRGBEncoding,
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
      type: THREE.HalfFloatType,
    }).fromEquirectangularTexture(this.viewer.renderer, hdrmap);

    const envMap = new THREE.WebGLCubeRenderTarget(1024, {
      format: THREE.RGBAFormat,
      generateMipmaps: true,
     // encoding: THREE.sRGBEncoding,
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
      type: THREE.HalfFloatType,
    });

    // tex.texture.needsUpdate = true;
    const cubeCamera = new THREE.CubeCamera(1, 1000, envMap);

    const sphere = new THREE.SphereGeometry(100, 100, 100);
    const sphereMesh = new THREE.Mesh(
      sphere,
      new THREE.MeshBasicMaterial({ side: THREE.BackSide, envMap: tex.texture })
    );
    hdrmap.dispose();

    const virtualScene = new THREE.Scene();

    this.virtualScene = virtualScene;
    this.virtualSphere = sphereMesh;
    this.cubeCamera = cubeCamera;

    virtualScene.add(cubeCamera);
    virtualScene.add(sphereMesh);
console.log()
    //  this.viewer.virtualScene.add(cubeCamera)
    this.envMap = (target as any).texture; //
    this.viewer.scene.environment = cubeCamera.renderTarget.texture;
    // this.viewer.scene.background = cubeCamera.renderTarget.texture ////
    return true;
  }

  async changeEnvMap(num: number) {
    let path = ENV_MAP;
    const { renderer } = this.viewer;
    switch (num) {
      case 0:
        path = ENV_MAP;
        break;
      case 1:
        path = ENV_MAP2;
        break;
      case 2:
        path = ENV_MAP3;
        break;
      default:
        path = ENV_MAP;
        break;
    }

    const generator = new THREE.PMREMGenerator(renderer);
    generator.compileEquirectangularShader();

    THREE.DefaultLoadingManager.onLoad = function () {
      generator.dispose();
    };

    // TODO:-> BBLoader

    this.abortCtrl = new AbortController();
    const loader = (new RGBELoader(undefined) as any).setAbortSignal(this.abortCtrl.signal);
    const hdrmap = await loader.loadAsync(path);

    const target = generator.fromEquirectangular(hdrmap);

    // for sphere
    const tex = new THREE.WebGLCubeRenderTarget(1024, {
      format: THREE.RGBAFormat,
      generateMipmaps: true,
      encoding: THREE.sRGBEncoding,
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
    }).fromEquirectangularTexture(this.viewer.renderer, hdrmap);

    if (this.virtualSphere) (this.virtualSphere.material as THREE.MeshBasicMaterial).envMap = tex.texture;

    hdrmap.dispose();

    this.envMap = (target as any).texture; ///
    if (this.cubeCamera) {
      this.viewer.scene.environment = this.cubeCamera.renderTarget.texture;
      // this.viewer.scene.background = this.cubeCamera.renderTarget.texture ////
    }
    this.viewer.needsUpdate = true;

    return true;
  }

  setTransform(obj: string, type: string, value: any) {
    switch (obj) {
      case 'env':
        if (this.cubeCamera) {
          Array.isArray(value)
            ? (this.cubeCamera as any)[type].fromArray(value)
            : (this.cubeCamera as any)[type].set(value.x, value.y, value.z);
        }
    }
  }

  abort() {
    this.abortCtrl && this.abortCtrl.abort();
  }

  clearContent() {
    this.tracker.dispose();
    this.tracker = new ResourceTracker('simpleContent');
  }

  reset() {
    // resetShadow
    if (this.shadow) this.shadow.resetShadow(this.viewer.data?.shadow);
    if (this.viewer.lights && this.viewer.lights.ambient) {
      if (this.viewer.data?.scene.lights.main) {
        for (const key in this.viewer.data.scene.lights.main) {
          if (key !== 'shadow') {
            // TODO SHADOW
            this.viewer.lights.ambient.setTransform(key, this.viewer.data.scene.lights.main[key]);
          }
        }
      }
    }
    if (this.viewer.lights && this.viewer.lights.directLights && this.viewer.lights.spotLights && this.viewer.data) {
      if (this.viewer.data.scene.lights.sides.length > 0) {
        if (
          this.viewer.data.scene.lights.sides.length <
          Object.keys(this.viewer.lights.directLights).length + Object.keys(this.viewer.lights.spotLights).length
        ) {
          const exists = [
            ...Object.keys(this.viewer.lights.directLights),
            ...Object.keys(this.viewer.lights.spotLights),
          ];
          for (let i = 0; i < exists.length; i++) {
            const data = this.viewer.data.scene.lights.sides[i];
            if (!data && this.viewer.lights.directLights[exists[i]]) {
              this.viewer.lights.directLights[exists[i]].dispose('light', false);
            } else if (!data && this.viewer.lights.spotLights[exists[i]]) {
              this.viewer.lights.spotLights[exists[i]].dispose('light', false);
            }
          }
        }
        const viewerLights = [
          ...Object.values(this.viewer.lights.directLights),
          ...Object.values(this.viewer.lights.spotLights),
        ];
        for (let i = 0; i < this.viewer.data.scene.lights.sides.length; i++) {
          const data = this.viewer.data.scene.lights.sides[i];
          const light: any = viewerLights[i];
          if (light) {
            for (const key in data) {
              if (key !== 'shadow') {
                // TODO SHADOW
                light.setTransform(key, data[key]);
              }
            }
          } else {
            this.addLight('directional', this.viewer.data.scene.lights.sides[i]);
          }
        }
      }
    }

    if (this.viewer.model && this.viewer.data && this.shadow)
      this.shadow.setTransform('position', this.viewer.data.shadow.position);
  }

  update() {
    this.shadow && this.shadow.update();
    this.virtualScene &&
      this.cubeCamera &&
      this.viewer.renderer &&
      this.cubeCamera.update(this.viewer.renderer, this.virtualScene);

    const { lights } = this.viewer;
    // light
    if (lights.ambient) lights.ambient.update();
    if (lights.point) lights.point.update();

    for (const key in lights.directLights) {
      lights.directLights[key] && lights.directLights[key].update();
    }
    for (const key in lights.spotLights) {
      lights.spotLights[key] && lights.spotLights[key].update();
    }
  }

  setVisibleShadow(isVisible: boolean) {
    if (this.shadow) this.shadow.visible = isVisible;
  }
}
