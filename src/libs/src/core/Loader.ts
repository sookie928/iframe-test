// /import Loading from '../assets/Loading.svg';
import * as THREE from 'three';
import { Viewer } from '../apps/Viewer';

import { DRACOLoader } from '../libs/DRACOLoader';
import { GLTFLoader } from '../libs/GLTFLoader';
import { KTX2Loader } from '../libs/KTX2Loader';
import { Texture } from '../libs/Texture';
import { TextureLoader } from '../libs/TextureLoader';
// import { getIce } from '../materials/SSSMaterial'
import { ResourceTracker } from './ResourceTracker';

const DRACO_LOADER = new DRACOLoader(undefined).setDecoderPath('/libs/draco_gltf/');
const KTX2_LOADER = new KTX2Loader(undefined).setTranscoderPath('/libs/basis/');
const dummy = new THREE.Object3D();
const textureManager = new THREE.LoadingManager();
const TEXTURE_LOADER = new TextureLoader(textureManager);
let FALLBACK: any;

export class BBLoader extends GLTFLoader {
  fallback: any;
  DRACOLoader: DRACOLoader;
  KTX2Loader: KTX2Loader;
  textureLoader: TextureLoader;
  viewer: Viewer;
  instances: any;
  intersects: any;
  origins: any;
  sss: any;
  fullCnt: number;
  renderedCnt: number;
  loadStatus: string;
  tracker: ResourceTracker;
  id: any;
  pickHelpers: any;
  abortCtrl: AbortController;
  constructor(manager: undefined, viewer: any, fallback = FALLBACK) {
    super(manager);
    this.id = null;
    this.pickHelpers = null;
    this.fallback = fallback;
    this.DRACOLoader = DRACO_LOADER;
    this.KTX2Loader = KTX2_LOADER;
    this.textureLoader = TEXTURE_LOADER;
    this.viewer = viewer;
    this.instances = [];
    this.intersects = [];
    this.origins = {};
    this.sss = {}; // textures

    this.fullCnt = 0;
    this.renderedCnt = 0;
    this.loadStatus = 'l';

    this.tracker = new ResourceTracker('loader');
    this.abortCtrl = new AbortController();
  }

  clear() {
    this.sss = {};
    this.loadStatus = 'l';
    this.fullCnt = 0;
    this.renderedCnt = 0;
    this.instances = [];
    this.intersects = [];
    this.origins = {};

    this.tracker && this.tracker.dispose();
    this.tracker = new ResourceTracker('loader');
  }

  init() {
    KTX2_LOADER.detectSupport(this.viewer.renderer);
    super.setDRACOLoader(DRACO_LOADER);
    super.setKTX2Loader(KTX2_LOADER);
    super.setAbortSignal(this.abortCtrl.signal);
  }

  abort() {
    this.abortCtrl && this.abortCtrl.abort();
  }

  async loadGLTF(
    url: any,
    data: {
      sss: { materials: { [x: string]: any }; objects: { [x: string]: any } };
      scale: any;
      textures: { [x: string]: any[]; all: any[] };
      dynamics: { [x: string]: any };
      instances: string | any[];
      hides: string | any[];
      alphas: string | any[];
      animation: { keyframe: { speed: any } };
    }
  ) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const target = this;
    target.loadStatus = 'progress';

    const onLoad = async function (scene: {
      scale: { set: (arg0: any, arg1: any, arg2: any) => void };
      position: { fromArray: (arg0: any) => void };
      traverse: (arg0: (child: any) => void) => void;
      children: { add: (arg0: any) => void }[];
      updateMatrix: () => void;
    }) {
      // target.model
      //   ? Array.isArray(target.model)
      //     ? target.model.add(scene)
      //     : (target.model = [target.model, scene])
      //   : (target.model = scene); // 복수 처리
      //target.model = scene;
      if (target.viewer.lights && target.viewer.lights.point) target.viewer.lights.point.setTransform('intensity', 0);

      // if (data.sss) {
      //   // sss
      //   // loadTexture
      //   for (const key in data.sss.materials) {
      //     const value = data.sss.materials[key]
      //     const skinOpt = await target.loadSkinTexture(
      //       value.albedo, // path
      //       value.normal,
      //       value.thickness,
      //     )
      //     const material = getIce(skinOpt)
      //     target.sss[key] = material
      //   }
      //   if (target.viewer.model) target.viewer.model.userData.isSSS = true
      //   if (target.viewer.lights && target.viewer.lights.point && target.viewer.data) target.viewer.lights.point.setTransform('intensity', target.viewer.data.light.intensity)

      // }
      if (target.viewer && target.viewer.data) {
        const { data: viewerData } = target.viewer;
        scene.scale.set(
          data.scale || viewerData.defaultTransform.scale,
          data.scale || viewerData.defaultTransform.scale,
          data.scale || viewerData.defaultTransform.scale
        );
        scene.position.fromArray(viewerData.defaultTransform.position);
      }

      scene.traverse(
        (child: {
          name: string;
          isMesh: any;
          geometry: { computeBoundsTree: () => void };
          castShadow: boolean;
          receiveShadow: boolean;
          parent: { name: any; type: string; isGroup: any };
          material: THREE.Material | THREE.MeshPhysicalMaterial | THREE.MeshStandardMaterial | THREE.ShaderMaterial;
          onAfterRender: any;
          visible: boolean;
          type: string;
          position: any;
          rotation: any;
          quaternion: any;
          scale: any;
        }) => {
          // if (child.layers) child.layers.set(layer);

          // TODO: reset
          if (child.name === 'Camera') {
            // TODO: from blender
            // target.viewer.setDefaultCamera(child)
          } else if (child.isMesh) {
            (child.material as any).toneMapped = false;
            (child.material as any).envMapIntensity =
              (target.viewer.data && target.viewer.data.env && target.viewer.data.env.intensity) || 1.5;

            // child.material.envMap = target.viewer.envMap
            // child.material.needsUpdate = true
            // check loading
            target.fullCnt++;
            // adjust raycaster
            // child.geometry.computeBoundsTree()

            if (
              target.viewer.data &&
              target.viewer.data.ior &&
              target.viewer.data.ior.name === (child.material as any).name
            ) {
              let test = child.material as THREE.MeshStandardMaterial;
              const i = target.viewer.data.ior;
              if (!(test as any).isMeshPhysicalMaterial) {
                test = new THREE.MeshPhysicalMaterial();
                THREE.MeshBasicMaterial.prototype.copy.call(test, child.material);
                test.name = child.material.name;
                test.map = (child.material as THREE.MeshPhysicalMaterial).map;
                test.normalMap = (child.material as THREE.MeshPhysicalMaterial).normalMap;
                test.roughnessMap = (child.material as THREE.MeshPhysicalMaterial).roughnessMap;
                test.metalnessMap = (child.material as THREE.MeshPhysicalMaterial).metalnessMap;
                test.envMap = (child.material as THREE.MeshPhysicalMaterial).envMap;
                test.envMapIntensity = (child.material as THREE.MeshPhysicalMaterial).envMapIntensity;
              }

              // for (const key in target.viewer.data.ior ) {
              //   (child.material as any)[key] = target.viewer.data.ior[key]
              //   child.material.needsUpdate = true
              // }
              // TODO: multiple ior
              if (i.clearcoatRoughness) (test as THREE.MeshPhysicalMaterial).clearcoatRoughness = i.clearcoatRoughness;

              if (i.transmission) (test as THREE.MeshPhysicalMaterial).transmission = i.transmission;

              if (i.color) test.color.setHex(i.color);

              if (i.attenuationColor) (test as THREE.MeshPhysicalMaterial).attenuationColor.setHex(i.attenuationColor);

              if (i.ior) (test as THREE.MeshPhysicalMaterial).ior = i.ior;

              if (i.clearcoat) (test as THREE.MeshPhysicalMaterial).clearcoat = i.clearcoat || i._clearcoat; // TODO : REMOVE

              if (i.roughness) test.roughness = i.roughness;

              if (i.thickness) (test as THREE.MeshPhysicalMaterial).thickness = i.thickness;

              child.material = test;
            } //  TODO : REMOVE
            else if (target.viewer.data && target.viewer.data.ior && !target.viewer.data.ior.isMaterial) {
              for (const key in target.viewer.data.ior) {
                const i = target.viewer.data.ior[key];
                if (i.name === (child.material as any).name) {
                  let test = child.material as THREE.MeshStandardMaterial;
                  if (!(test as any).isMeshPhysicalMaterial) {
                    test = new THREE.MeshPhysicalMaterial();
                    THREE.MeshBasicMaterial.prototype.copy.call(test, child.material);
                    test.name = child.material.name;
                    test.map = (child.material as THREE.MeshPhysicalMaterial).map;
                    test.normalMap = (child.material as THREE.MeshPhysicalMaterial).normalMap;
                    test.roughnessMap = (child.material as THREE.MeshPhysicalMaterial).roughnessMap;
                    test.metalnessMap = (child.material as THREE.MeshPhysicalMaterial).metalnessMap;
                    test.envMap = (child.material as THREE.MeshPhysicalMaterial).envMap;
                    test.envMapIntensity = (child.material as THREE.MeshPhysicalMaterial).envMapIntensity;
                  }

                  if (i.clearcoatRoughness)
                    (test as THREE.MeshPhysicalMaterial).clearcoatRoughness = i.clearcoatRoughness;

                  if (i.transmission) (test as THREE.MeshPhysicalMaterial).transmission = i.transmission;

                  if (i.color) test.color.setHex(i.color);

                  if (i.attenuationColor)
                    (test as THREE.MeshPhysicalMaterial).attenuationColor.setHex(i.attenuationColor);

                  if (i.ior) (test as THREE.MeshPhysicalMaterial).ior = i.ior;

                  if (i.clearcoat) (test as THREE.MeshPhysicalMaterial).clearcoat = i.clearcoat || i._clearcoat; // TODO : REMOVE

                  if (i.roughness) test.roughness = i.roughness;

                  if (i.thickness) (test as THREE.MeshPhysicalMaterial).thickness = i.thickness;

                  child.material = test;
                }
              }
            }

            if (target.viewer.data && target.viewer.data.shadow) {
              child.castShadow = false;
              child.receiveShadow = false;
            }

            let mat: any; // check loading
            if (data.sss) {
              for (const key in data.sss.objects) {
                /// sss
                // adjustMaterial from utils must be used
                const value = data.sss.objects[key];

                if (value.meshes.indexOf(child.name) > -1 || value.meshes.indexOf(child.parent.name) > -1) {
                  if (target.sss[value.material]) {
                    // TO BE FIXED
                    const newMat = target.sss[value.material];
                    newMat.roughnessMap = (child.material as THREE.MeshStandardMaterial).roughnessMap;
                    newMat.metalnessMap = (child.material as THREE.MeshStandardMaterial).metalnessMap;
                    newMat.aoMap = (child.material as THREE.MeshStandardMaterial).aoMap;
                    child.material = newMat;

                    child.material.needsUpdate = true;
                  }
                  // TODO : need to be used with tracker utils
                }
                mat = child.material;
              }
            }

            // check loading
            child.onAfterRender = (_: any, _1: any, _2: any, _3: any, curMat: any) => {
              target.id = setTimeout(function check() {
                if (target.fullCnt === target.renderedCnt) {
                  if (curMat === mat) target.loadStatus = 'fin';
                  clearTimeout(target.id);
                  // if (!target.viewer.onAnimation) {
                  //   target.viewer.onAnimation = true
                  //   target.viewer.intro && target.viewer.intro.play()
                  // }
                  child.onAfterRender = () => {
                    //
                  };
                } else {
                  target.renderedCnt++;
                  target.viewer.needsUpdate = true;
                  if (target.viewer.loadingCallback)
                    target.viewer.loadingCallback({
                      total: target.fullCnt,
                      loaded: target.renderedCnt,
                      type: 'render',
                    });
                  //
                  if (mat) target.id = setTimeout(check, 200);
                }
              }, 200);
            };
            // 마지막에 랜더되는애 체크될 매쉬 이름
            // child로 계속 lastRendered 변경
            // sss등 마직막으로 체크해야하할 메쉬 변경
            if (data.textures.all) {
              (child.material as any).envMap = target.viewer.scene.environment;
              (child.material as any).reflectivity = data.textures.all[0];
              (child.material as any).shininess = data.textures.all[1];
              (child.material as any).roughness = data.textures.all[2]; // small is shiny
            }

            if (data.textures[child.name]) {
              (child.material as any).envMap = target.viewer.scene.environment;
              (child.material as any).reflectivity = data.textures[child.name][0];
              (child.material as any).shininess = data.textures[child.name][1];
              (child.material as any).roughness = data.textures[child.name][2]; // small is shiny
            }

            for (const key in data.dynamics) {
              const value = data.dynamics[key];
              if (value.meshes) {
                if (value.meshes.indexOf(child.name) > -1 || value.meshes.indexOf(child.parent.name) > -1) {
                  //  child.raycast = meshBounds
                  target.intersects.push(child); // group일 경우에는?
                  // color
                  if (!target.origins[child.name]) {
                    target.origins[child.name] = {};
                    target.origins[child.name].color = (child.material as THREE.MeshStandardMaterial).color;
                    target.origins[child.name].emissive = (child.material as THREE.MeshStandardMaterial).emissive;
                  }
                }
              }
              if (value.transforms) {
                const mesh = new THREE.InstancedMesh(
                  child.geometry as any,
                  child.material as any,
                  value.transforms.length
                );
                mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

                if (
                  child.parent.type !== 'Group' &&
                  (value.meshes.indexOf(child.name) > -1 || value.meshes.indexOf(child.parent.name) > -1)
                ) {
                  mesh.name = key;
                  if (target.instances[key]) target.instances[key].mesh = mesh;
                  else target.instances[key] = { mesh, transforms: [] };
                } else if (child.parent.isGroup && data.instances.indexOf(child.parent.name) > -1) {
                  mesh.name = `${key}${child.name}`;
                  if (target.instances[key]) {
                    if (target.instances[key].mesh) {
                      target.instances[key].mesh.add(mesh);
                    } else {
                      target.instances[key].mesh = new THREE.Object3D().add(mesh);
                    }
                  } else {
                    target.instances[key] = {
                      mesh: new THREE.Object3D().add(mesh),
                      transforms: [],
                    };
                  }
                }
              }
            }

            if (data.hides.indexOf(child.name) > -1 || data.hides.indexOf(child.parent.name) > -1) {
              child.visible = false;
            }

            if (data.alphas.indexOf(child.name) > -1 || data.alphas.indexOf(child.parent.name) > -1) {
              (child.material as any).format = THREE.RGBAFormat;
              child.material.transparent = true;
              child.material.opacity = 0.5;
            }
          } else if (child.type === 'Object3D') {
            for (const key in data.dynamics) {
              const value = data.dynamics[key];
              if (value.transforms) {
                if (
                  child.parent.type !== 'Group' &&
                  (value.transforms.indexOf(child.name) > -1 || value.transforms.indexOf(child.parent.name) > -1)
                ) {
                  if (target.instances[key]) {
                    target.instances[key].transforms.push({
                      position: child.position,
                      rotation: child.rotation,
                      quaternion: child.quaternion,
                      scale: child.scale,
                    });
                  } else {
                    target.instances[key] = {
                      mesh: null,
                      transforms: [
                        {
                          position: child.position,
                          rotation: child.rotation,
                          quaternion: child.quaternion,
                          scale: child.scale,
                        },
                      ],
                    };
                  }
                }
              }
            }
          }
        }
      );

      /// Loading
      if (target.viewer.loadingCallback)
        target.viewer.loadingCallback({
          total: target.fullCnt,
          loaded: target.renderedCnt,
          type: 'render',
        });

      // add instancedMesh
      if (Object.keys(target.instances).length > 0) {
        for (const key in target.instances) {
          if (target.instances[key].mesh) {
            scene.children[1].add(target.instances[key].mesh); // TODO: target.model.add(...)
            target.intersects.push(target.instances[key].mesh);
          }
        }
      }

      // set Intersects /////////
      target.intersects.length > 0 && target.pickHelpers && (target.pickHelpers.intersects = target.intersects);
      Object.keys(target.origins).length > 0 && target.pickHelpers && (target.pickHelpers.origins = target.origins);

      for (const key in target.instances) {
        const instance = target.instances[key];
        const { transforms } = instance;

        for (let j = 0; j < transforms.length; j++) {
          dummy.position.copy(transforms[j].position);
          dummy.rotation.copy(transforms[j].rotation);
          dummy.scale.copy(transforms[j].scale);
          dummy.quaternion.copy(transforms[j].quaternion);
          dummy.updateMatrix();
          if (instance.mesh.isInstancedMesh) instance.mesh.setMatrixAt(j, dummy.matrix);
          else if (instance.mesh.type === 'Object3D') {
            for (let i = 0; i < instance.mesh.children.length; i++) {
              instance.mesh.children[i].setMatrixAt(j, dummy.matrix);
            }
          }
        }
      }

      // scene.scale.set(data.scale || target.viewer.data.defaultTransform.scale, data.scale || target.viewer.data.defaultTransform.scale, data.scale || target.viewer.data.defaultTransform.scale)
      // scene.position.set(target.viewer.data.defaultTransform.position[0], target.viewer.data.defaultTransform.position[1], target.viewer.data.defaultTransform.position[2])

      // shadow
      // const shadowIdx = target.scene.children.findIndex((c) => c.name === 'shadow')
      // if (shadowIdx > -1) target.scene.children[shadowIdx].position.y = target.data.defaultTransform.position[1] - 0.2
      scene.updateMatrix();

      target.viewer.scene.add(target.tracker.track(scene));

      /////////////////////////////////////////////////////
      // 3d model animation
      if (target.viewer.animations && target.viewer.animations.length > 0) {
        if (data.animation.keyframe) target.viewer.mixer.timeScale = data.animation.keyframe.speed;
        else target.viewer.mixer.timeScale = 1.0;

        target.viewer.animations.forEach((a) => {
          a.optimize();
          const c = target.viewer.mixer.clipAction(a);
          c.clampWhenFinished = true;
          c.loop = THREE.LoopOnce;
          //c.reset();
          if (a.name.includes('intro_animation')) {
            target.viewer.intro = c;
          } else {
            target.viewer.clips.push(c);
          }
        });
      }

      // TO BE DELETED
      target.viewer.needsUpdate = true;
    };

    target.abort();
    target.abortCtrl = new AbortController();
    target.setAbortSignal(target.abortCtrl.signal);

    const gltf = (await super.loadAsync(url, (e: any) => {
      if (this.viewer.loadingCallback)
        this.viewer.loadingCallback({
          total: e.total,
          loaded: e.loaded,
          type: 'download',
        });
    })) as {
      [key: string]: any;
      scene: THREE.Scene;
      scenes: THREE.Scene[];
      animations: THREE.AnimationClip[];
    };

    const mesh = (gltf.scene.children as any[]).filter((child: any) => child.userData.name !== 'Camera');
    // TODO: clean
    if (mesh.length > 1) {
      target.viewer.model = gltf.scene;
    } else {
      target.viewer.model = (gltf.scene.children as any[]).filter((child: any) => child.userData.name !== 'Camera')[0];
    }
    // gltf.scene.children.length > 1 ? gltf.scene.children[1] : gltf.scene.children[0]
    // target.viewer.setDefaultCamera(target.viewer.view.camera, target.viewer.data.camera.default);
    target.viewer.animations = gltf.animations;

    target.viewer.model && (await onLoad(target.viewer.model.parent || new THREE.Object3D().add(target.viewer.model)));
  }

  checkRendered(material: any, newMat: any) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const target = this;
    if (target.fullCnt === target.renderedCnt && material === newMat) {
      target.loadStatus = 'fin';
      // child.onAfterRender = () => {}
    }
  }

  async setModel(url: string, modelData: any) {
    this.tracker.name = (modelData && modelData.name) || 'model';
    return modelData && url && (await this.loadGLTF(url, modelData));
  }

  async loadSkinTexture(albedo: any, normal: any, thickness: any) {
    const map = (await this.textureLoader.loadAsync(albedo, () => {
      //
    })) as Texture;
    const normalMap = (await this.textureLoader.loadAsync(normal, () => {
      //
    })) as Texture;
    const thicknessMap = (await this.textureLoader.loadAsync(thickness, () => {
      //
    })) as Texture;

    const uniforms = THREE.UniformsUtils.clone(
      THREE.UniformsUtils.merge([
        THREE.ShaderLib.standard.uniforms,
        {
          thicknessMap: { value: thicknessMap },
          thicknessColor: { value: null },
          thicknessDistortion: { value: 0.53 },
          thicknessAmbient: { value: 0.01 },
          thicknessAttenuation: { value: 0.8 },
          thicknessPower: { value: 5.0 },
          thicknessScale: { value: 13.0 },
        },
      ])
    );

    // 변수 처리
    map.flipY = false;
    normalMap.flipY = false;
    thicknessMap.flipY = false;
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
    thicknessMap.wrapS = thicknessMap.wrapT = THREE.RepeatWrapping;
    map.encoding = THREE.sRGBEncoding;
    normalMap.encoding = THREE.sRGBEncoding;
    thicknessMap.encoding = THREE.sRGBEncoding;

    uniforms.map.value = map;
    uniforms.diffuse.value = new THREE.Vector3(0.925, 0.909, 0.835);
    uniforms.normalMap.value = normalMap;
    uniforms.thicknessMap.value = thicknessMap;
    uniforms.thicknessColor.value = new THREE.Vector3(0.494, 0.364, 0.365);
    uniforms.thicknessDistortion.value = 0.53;
    uniforms.thicknessAmbient.value = 0.01;
    uniforms.thicknessAttenuation.value = 0.8;
    uniforms.thicknessPower.value = 5.0;
    uniforms.thicknessScale.value = 13.0;

    return uniforms;
  }

  setSSSTexture() {
    // change sss texture
    // clear original texture
    // this.textures.dispose(id or name)
    // add sss texture to selected node
    // add sss texture to this.textures
  }

  setInstancedMesh() {
    // add instances
    // clear original mesh(geometry, material, texture)
    // add instances to this.instanced
  }
}
