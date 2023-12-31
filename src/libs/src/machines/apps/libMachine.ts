import _ from 'lodash';
import * as THREE from 'three';
import { actions, assign, createMachine, spawn } from 'xstate';
const { sendTo } = actions;

import { Editor } from '../../apps/Editor';
import { DataType, LIGHT_DUMMY, ModelDataType, OptionsType } from '../../apps/Viewer';
import { Component } from '../../core/Component';
import { mixerMachine } from '../components/mixerMachine';

interface IContext {
  viewer: Editor | null;
  url?: string;
  data?: any;
  modelData?: any;
  selected?: Component | THREE.Object3D | THREE.Mesh;
  lights?: any;
  iors?: any;
  animations?: any[];
  mixerRef?: any;
}

export const libMachine = createMachine(
  {
    predictableActionArguments: true,
    tsTypes: {} as import('./libMachine.typegen').Typegen0,
    schema: {
      context: {} as IContext,
      events: {} as
        | { type: 'START'; url: string; data: DataType; modelData: ModelDataType }
        | {
            type: 'INIT';
            container: HTMLDivElement;
            data: DataType;
            options: OptionsType;
            doms: HTMLDivElement[] | undefined;
            loadingCallback: any;
          }
        | { type: 'DISPOSE' }
        | { type: 'END' }
        | { type: 'EDIT' }
        | { type: 'CORRECT' }
        | { type: 'LIGHT' }
        | { type: 'SHADOW' }
        | { type: 'IOR' }
        | { type: 'LIMIT' }
        | { type: 'ENV' }
        | { type: 'ANIMATION' }
        | { type: 'MOVE.CORRECT'; value: number[] }
        | { type: 'TRANSFORM.SHADOW'; value: number[]; prop: string }
        | { type: 'TRANSFORM.LIMIT'; value: number[] | boolean; prop: string }
        | { type: 'TRANSFORM.ENV'; value: number[] | number; prop: string }
        | { type: 'CHANGE.ENV'; value: number }
        | { type: 'SELECT.LIGHT'; value: any }
        | { type: 'DELETE.LIGHT'; value: any; handleCallback: any }
        | { type: 'TRANSFORM.LIGHT'; value: any; prop: string }
        | { type: 'GET.LIGHT'; handleCallback?: any }
        | { type: 'ADD.LIGHT'; value: any; handleCallback: any }
        | { type: 'TOGGLE.MODEL' }
        | { type: 'SELECT.IOR'; value: any }
        | { type: 'TRANSFORM.IOR'; value: any; prop: string }
        | { type: 'GET.IOR'; value: any; prop: string }
        | { type: 'GET.ANIME'; value: any; prop: string }
        | { type: 'PLAY.ANIME'; value: any; prop: string }
        | { type: 'PLAY.ALL'; value: any; prop: string }
        | { type: 'PLAY.AT'; value: any; prop: string }
        | { type: 'SET.MIXER'; value: any }
        | { type: 'STOP.ALL' },
    },
    initial: 'off',
    context: {
      viewer: null,
    },
    exit: 'offViewer',
    states: {
      off: {
        on: {
          INIT: {
            target: 'initializing',
            actions: 'initViewer',
          },
        },
      },
      initializing: {
        invoke: {
          src: async (ctx: IContext) => await (ctx.viewer as Editor).init(),
          onDone: {
            target: 'idle',
          },
          onError: {
            target: 'sleep',
          },
        },
      },
      loading: {
        invoke: {
          src: async ({ viewer, url, data, modelData }) => await (viewer as Editor).start(url, modelData, data),
          onDone: {
            target: 'show',
          },
          onError: {
            target: 'sleep',
          },
        },
      },

      idle: {
        on: {
          START: {
            target: 'loading',
            actions: 'setData',
          },
          EDIT: {
            target: 'editing',
            //actions: ''
          },
        },
      },
      show: {
        entry: 'getAnimation',
        on: {
          START: {
            target: 'loading',
            actions: 'setData',
          },
          'SET.MIXER': {
            actions: ['setMixerActor', 'setMixerEvent', 'setMixerDuration'],
          },
          'PLAY.ANIME': {
            actions: ['playAnimation'],
          },
          'PLAY.ALL': {
            actions: ['sendToStart', 'playAllAnimation'],
          },
          'PLAY.AT': {
            actions: ['sendToStart', 'playAtAnimation'],
          },
          'STOP.ALL': {
            actions: ['sendToPause', 'stopAnimation'],
          },
        },
      },
      editing: {
        initial: 'correction',
        entry: 'initEnv',
        states: {
          correction: {
            entry: 'setCorrection',
            exit: 'leaveCorrection',
            on: {
              'MOVE.CORRECT': {
                actions: 'moveTarget',
              },
            },
          },
          light: {
            entry: ['setLight'],
            exit: 'clearLight',
            on: {
              'GET.LIGHT': {
                actions: 'getLight',
              },
              'SELECT.LIGHT': {
                actions: ['selectLight', 'activateSelectLight'],
              },
              'DELETE.LIGHT': {
                actions: ['deleteLight', 'getLight'],
              },
              'TRANSFORM.LIGHT': {
                actions: 'transformLight',
              },
              'ADD.LIGHT': {
                actions: ['addLight', 'getLight'],
              },
            },
          },
          shadow: {
            entry: 'setShadow',
            on: {
              'TRANSFORM.SHADOW': {
                actions: 'transformShadow',
              },
            },
          },
          ior: {
            entry: 'setIOR',
            exit: 'clearIOR',
            on: {
              // 'GET.IOR': {
              //   actions: 'getLight',
              // },
              'SELECT.IOR': {
                actions: ['selectIOR'],
              },
              'TRANSFORM.IOR': {
                actions: ['transformIOR'],
              },
            },
          },
          limit: {
            entry: 'setLimit',
            on: {
              'TRANSFORM.LIMIT': {
                actions: 'transformLimit',
              },
            },
          },
          env: {
            entry: 'setEnv',
            on: {
              'CHANGE.ENV': {
                actions: 'changeEnv',
              },
              'TRANSFORM.ENV': {
                actions: 'transformEnv',
              },
            },
          },
          animation: {
            entry: 'getAnimation',
            on: {
              'PLAY.ANIME': {
                actions: ['playAnimation'],
              },
              'PLAY.ALL': {
                actions: [() => console.log('hdhfashfhsfh'), 'sendToStart', 'playAllAnimation'],
              },
              'PLAY.AT': {
                actions: ['playAtAnimation'],
              },
            },
          },
        },
        on: {
          CORRECT: 'editing.correction',
          LIGHT: 'editing.light',
          SHADOW: 'editing.shadow',
          IOR: 'editing.ior',
          LIMIT: 'editing.limit',
          ENV: 'editing.env',
          ANIMATION: 'editing.animation',
          START: {
            target: 'loading',
            actions: 'setData',
          },
          END: {
            target: 'idle',
          },
          'TOGGLE.MODEL': {
            actions: 'toggleModel',
          },
        },
      },
      // animation: {
      //   states: {
      //     ing: {},
      //     end: {
      //       entry: 'idle',
      //     },
      //   },
      // },
      sleep: {
        entry: () => {
          console.log('sleep!!!!');
        },
        on: {
          START: {
            target: 'loading',
            actions: ['setData'],
          },
        },
      },
    },
    on: {
      DISPOSE: {
        target: 'sleep',
        actions: 'offViewer',
      },
    },
  },
  {
    actions: {
      setMixerActor: assign({
        mixerRef: (ctx, evt) => spawn(mixerMachine(ctx.viewer as Editor, evt.value.ref)),
      }),
      setMixerEvent: (ctx, evt) => {
        if (ctx.viewer && ctx.animations && ctx.viewer.mixer) {
          ctx.viewer.mixer.addEventListener('finished', (e: any) => {
            evt.value.callback(e);
            //  ctx.viewer?.mixer.setTime(0)
            ctx.viewer?.pauseAnimation();
          });
        }
      },
      setMixerDuration: sendTo((ctx) => ctx.mixerRef, { type: 'GET.DURATION' }),
      playAtAnimation: (ctx, evt) => {
        if (ctx.viewer && ctx.animations && ctx.mixerRef) {
          ctx.viewer.startAtAll(evt.value); // TODO: USE MIXER SET TIME
        }
      },
      playAnimation: (ctx, evt) => {
        if (ctx.viewer && ctx.animations && ctx.animations[evt.value]) {
          ctx.viewer.playClip(ctx.animations[evt.value].name);
        }
      },
      stopAnimation: (ctx) => {
        if (ctx.viewer && ctx.animations && ctx.viewer.mixer) {
          ctx.viewer?.pauseAnimation();
        }
      },
      sendToPause: sendTo((ctx) => ctx.mixerRef, { type: 'PAUSE' }),
      sendToStart: sendTo((ctx) => ctx.mixerRef, { type: 'START' }),
      playAllAnimation: (ctx) => {
        if (ctx.viewer && ctx.animations) {
          ctx.viewer.playAnimation('clip');
        }
      },
      getAnimation: assign((ctx) => {
        if (ctx.viewer) return { ...ctx, animations: ctx.viewer.animations };
        return { ...ctx, animations: [] };
      }),
      toggleModel: (ctx) => {
        if (ctx.viewer) ctx.viewer.switchModelControl(!(ctx.viewer.modelControl as any).visible);
      },
      moveTarget: (ctx, evt) => {
        if (ctx.viewer && ctx.viewer.data) {
          ctx.viewer.data.camera.default.correctionValue = {
            x: evt.value[0],
            y: evt.value[1],
            z: evt.value[2],
          };
          // TODO : simple
          ctx.viewer._setTransform(ctx.viewer.mainView?.control?.target, 'position', {
            x: evt.value[0],
            y: evt.value[1],
            z: evt.value[2],
          });
          ctx.viewer.mainView?.control?.update();
        }
      },
      initEnv: () => {
        //  if (ctx.viewer) ctx.viewer.setEditorEnv()
      },
      setCorrection: (ctx) => {
        if (ctx.viewer) ctx.viewer.switchViewTargetHelper(true);
      },
      leaveCorrection: (ctx) => {
        if (ctx.viewer) ctx.viewer.switchViewTargetHelper(false);
      },
      getLight: assign((ctx, evt) => {
        if (ctx.viewer) {
          const lights = ctx.viewer.lights;
          const newList = [];
          for (const light in lights) {
            if (light === 'ambient') {
              newList.push(lights[light]);
            } else if (light === 'directLights' || light === 'spotLights') {
              for (const dirLight in lights[light]) {
                const l = lights[light] as { [key: string]: any };
                if (l) {
                  newList.push(l[dirLight]);
                  if (l[dirLight] && !l[dirLight].control && evt.handleCallback) {
                    l[dirLight].addHandler('change', evt.handleCallback);
                    l[dirLight].deactivateHelper();
                  }
                }
              }
            }
          }
          return {
            ...ctx,
            lights: newList,
          };
        }
        return {
          ...ctx,
        };
      }),
      clearLight: assign((ctx) => {
        ctx.lights.forEach((l: Component) => {
          if (l.deactivateHelper) l.deactivateHelper();
        });
        return {
          ...ctx,
          lights: [],
          selected: undefined,
        };
      }),
      addLight: (ctx) => {
        const { viewer } = ctx;
        if (viewer && viewer.data && viewer.content) {
          const newData = { ...LIGHT_DUMMY }; // TODO : CONSTANT
          newData.name = `side${ctx.lights.length}`;
          newData.type = 'spot'; // todo => viewer
          viewer.content.addLight('spot', newData);
          viewer.data.scene.lights.sides.push(newData); // TODO: in Viewer
        }
      },
      deleteLight: assign((ctx) => {
        const { viewer, selected } = ctx;
        if (viewer && viewer.data && selected) {
          (selected as Component).dispose('light', true);
        }
        return {
          ...ctx,
          selected: undefined,
        };
      }),
      setLight: (ctx) => {
        if (ctx.viewer) {
          //
        }
      },
      selectLight: assign((ctx, evt) => {
        return {
          ...ctx,
          selected: evt.value,
        };
      }),
      activateSelectLight: (ctx) => {
        if (ctx.viewer && ctx.selected) {
          (ctx.selected as Component).activateHelper();
          ctx.lights.forEach((l: Component) => {
            if (l.deactivateHelper && l !== ctx.selected) {
              l.deactivateHelper();
            }
          });
        }
      },
      transformLight: (ctx, evt) => {
        if (ctx.viewer && ctx.selected && ctx.viewer.data) {
          if (ctx.selected.name === 'ambient') {
            ctx.viewer.data.scene.lights.main[evt.prop] = evt.value;
            (ctx.selected as Component).setTransform(evt.prop, evt.value);
          } else {
            const l: { [key: string]: any } = _.find(
              ctx.viewer.data.scene.lights.sides,
              (s) => s.name === (ctx.selected as Component).name
            );
            if (l) {
              l[evt.prop] = evt.value;
              (ctx.selected as Component).setTransform(evt.prop, evt.value);
            }
          }
        }
      },
      transformShadow: (ctx, evt) => {
        if (ctx.viewer && ctx.viewer.data) {
          ctx.viewer.data.shadow[evt.prop] = {
            x: evt.value[0],
            y: evt.value[1],
            z: evt.value[2],
          };
          ctx.viewer._setTransform('shadow', evt.prop, {
            x: evt.value[0],
            y: evt.value[1],
            z: evt.value[2],
          });
        }
      },
      setShadow: () => {
        //   ctx.viewer
      },
      setIOR: assign((ctx) => {
        //    ctx.viewer
        const newList: THREE.Object3D<Event>[] = [];
        if (ctx.viewer && ctx.viewer.model) {
          ctx.viewer.model.traverse((obj: any) => {
            if ((obj as THREE.Mesh).isMesh && ((obj as THREE.Mesh).material as any).isMeshPhysicalMaterial) {
              newList.push(obj);
            }
          });
        }
        return {
          ...ctx,
          iors: newList,
        };
      }),
      clearIOR: assign((ctx) => {
        return {
          ...ctx,
          ior: [],
          selected: undefined,
        };
      }),
      transformIOR: (ctx, evt) => {
        if (ctx.viewer && ctx.selected && ctx.viewer.data) {
          if (!ctx.viewer.data.ior || ctx.viewer.data.ior.isMaterial) ctx.viewer.data.ior = {};
          // const i = ctx.viewer.data.ior[((ctx.selected as THREE.Mesh).material as THREE.Material).name];
          if (!ctx.viewer.data.ior[((ctx.selected as THREE.Mesh).material as THREE.Material).name])
            ctx.viewer.data.ior[((ctx.selected as THREE.Mesh).material as THREE.Material).name] = {
              name: ((ctx.selected as THREE.Mesh).material as THREE.Material).name,
            };
          ctx.viewer.data.ior[((ctx.selected as THREE.Mesh).material as THREE.Material).name][evt.prop] = evt.value;

          //
          if (((ctx.selected as THREE.Mesh).material as any)[evt.prop].isColor) {
            ((ctx.selected as THREE.Mesh).material as any)[evt.prop].set(evt.value);
          } else {
            ((ctx.selected as THREE.Mesh).material as any)[evt.prop] = evt.value;
          }
          ((ctx.selected as THREE.Mesh).material as THREE.Material).needsUpdate = true;
          ctx.viewer.needsUpdate = true;
          // TODO : viewer
        }
      },
      selectIOR: assign((ctx, evt) => {
        return {
          ...ctx,
          selected: evt.value,
        };
      }),
      transformLimit: (ctx, evt) => {
        if (ctx.viewer && ctx.viewer.data) {
          switch (evt.prop) {
            case 'check':
              // eslint-disable-next-line no-case-declarations
              const newValue = Array.isArray(evt.value)
                ? evt.value
                : ['-Infinity', 'Infinity', '-Infinity', 'Infinity'];
              ctx.viewer.data.control.limitation.angle = newValue;
              ctx.viewer.resetViewLimit();
              break;
            case 'azimut': {
              const newValue = [...ctx.viewer.data.control.limitation.angle];
              if ((evt.value as number[] | string[])[1] === 'Infinity')
                (evt.value as number[] | string[])[1] = THREE.MathUtils.radToDeg(3.14);
              if ((evt.value as number[] | string[])[0] === '-Infinity')
                (evt.value as number[] | string[])[0] = THREE.MathUtils.radToDeg(-3.14);
              const angle = [
                THREE.MathUtils.degToRad((evt.value as number[])[0]),
                THREE.MathUtils.degToRad((evt.value as number[])[1]),
              ]; // TODO: REACT
              newValue.splice(2, 2, ...angle);
              ctx.viewer.data.control.limitation.angle = newValue;
              ctx.viewer.resetViewLimit();
              break;
            }
            case 'polar': {
              const newValue = [...ctx.viewer.data.control.limitation.angle];
              if ((evt.value as number[] | string[])[1] === 'Infinity')
                (evt.value as number[] | string[])[1] = THREE.MathUtils.radToDeg(3.14);
              if ((evt.value as number[] | string[])[0] === '-Infinity')
                (evt.value as number[] | string[])[0] = THREE.MathUtils.radToDeg(-3.14);
              const angle = [
                THREE.MathUtils.degToRad((evt.value as number[])[0]),
                THREE.MathUtils.degToRad((evt.value as number[])[1]),
              ];
              newValue.splice(0, 2, ...angle);
              ctx.viewer.data.control.limitation.angle = newValue;
              ctx.viewer.resetViewLimit();
              break;
            }
            case 'zoom':
              ctx.viewer.data.control.limitation.zoom = evt.value;
              ctx.viewer.resetViewLimit();
              break;
            case 'pan': {
              const value = evt.value as number[];
              const newValue = [
                [-value[0], -value[1], -value[2]],
                [value[0], value[1], value[2]],
              ];
              ctx.viewer.data.control.limitation.pan = newValue;
              ctx.viewer.resetViewLimit();
              break;
            }
          }
        }
      },
      setLimit: () => {
        // ctx.viewer
      },
      transformEnv: (ctx, evt) => {
        if (ctx.viewer && ctx.viewer.data && ctx.viewer.data.env) {
          switch (evt.prop) {
            case 'rotation': {
              const rotation = [
                THREE.MathUtils.degToRad((evt.value as number[])[0]),
                THREE.MathUtils.degToRad((evt.value as number[])[1]),
                THREE.MathUtils.degToRad((evt.value as number[])[2]),
              ];
              ctx.viewer.data.env.rotation = rotation;
              ctx.viewer._setTransform(ctx.viewer.content?.cubeCamera, 'rotation', rotation);
              break;
            }
            case 'intensity': {
              ctx.viewer.data.env.intensity = evt.value;
              ctx.viewer.model?.traverse((obj: any) => {
                // TODO : abstract
                if ((obj as THREE.Mesh).isMesh) {
                  if (ctx.viewer) ctx.viewer._setTransform((obj as THREE.Mesh).material, 'envMapIntensity', evt.value);
                }
              });
              break;
            }
            default:
              break;
          }
        }
      },
      changeEnv: (ctx, evt) => {
        if (ctx.viewer && ctx.viewer.data && ctx.viewer.data.env) {
          ctx.viewer.data.env.map = evt.value;
          ctx.viewer.changeEnvMap(evt.value);
        }
      },
      setEnv: () => {
        //ctx.viewer
      },
      initViewer: assign((_, { container, data, options, doms, loadingCallback }) => ({
        viewer: new Editor(container, data, options, doms, loadingCallback),
      })),
      setData: assign((ctx, { data, modelData, url }) => ({
        ...ctx,
        url,
        data,
        modelData,
      })),
      offViewer: (ctx) => {
        const { viewer } = ctx;
        if (viewer) {
          viewer.abortLoading();
          viewer.deallocate();
        }
      },
    },
    guards: {
      /* ... */
    },
    services: {},
  }
);
