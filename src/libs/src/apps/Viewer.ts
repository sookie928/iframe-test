import _ from 'lodash'
import * as THREE from 'three'
import {Component} from '../core/Component'
import {Content} from '../core/Content'
import {BBLoader} from '../core/Loader'
import {ResourceTracker} from '../core/ResourceTracker'
import {View} from '../core/Viewport'
import {GLTFExporter, WEBGL} from '../libs/bluebeaker.lib'

export const LIGHT_DUMMY = {
  type: 'directional',
  name: 'side01',
  intensity: 2.8,
  color: '#ffffff',
  position: [2, 0, 2],
  shadow: {
    near: 0.1,
    far: 100,
    left: -100,
    right: 100,
    top: 100,
    bottom: -100,
    bias: 0.0001
  }
}

export const DATA = {
  idx: 223,
  dpr: [1, 2],
  frameloop: false,
  renderer: {
    performance: 'high-performance',
    color: '#ffffff',
    exposure: 1,
    toneMappingExposure: 1,
    toneMapping: 'ReinhardToneMapping'
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
        z: 0
      }
    }
  },
  scene: {
    lights: {
      main: {
        intensity: 1,
        color: '#ffffff',
        position: [5, 0.5, 5]
      },
      sides: [
        // {
        //   type: 'directional',
        //   name: 'side01',
        //   intensity: 2.8,
        //   color: '#ffffff',
        //   position: [2, 0, 2],
        //   shadow: {
        //     near: 0.1,
        //     far: 100,
        //     left: -100,
        //     right: 100,
        //     top: 100,
        //     bottom: -100,
        //     bias: 0.0001,
        //   },
        // },
        // {
        //   type: 'directional',
        //   name: 'side02',
        //   intensity: 2.8,
        //   color: '#ffffff',
        //   position: [-2, 0, 2],
        //   shadow: {
        //     near: 0.1,
        //     far: 100,
        //     left: -100,
        //     right: 100,
        //     top: 100,
        //     bottom: -100,
        //     bias: 0.0001,
        //   },
        // },
        // {
        //   type: 'directional',
        //   name: 'side03',
        //   intensity: 2.8,
        //   color: '#ffffff',
        //   position: [2, 0, -2],
        //   shadow: {
        //     near: 0.1,
        //     far: 100,
        //     left: -100,
        //     right: 100,
        //     top: 100,
        //     bottom: -100,
        //     bias: 0.0001,
        //   },
        // },
        // {
        //   type: 'directional',
        //   name: 'side04',
        //   intensity: 2.8,
        //   color: '#ffffff',
        //   position: [2, 2, 0],
        //   shadow: {
        //     near: 0.1,
        //     far: 100,
        //     left: -100,
        //     right: 100,
        //     top: 100,
        //     bottom: -100,
        //     bias: 0.0001,
        //   },
        // },
      ]
    }
  },
  shadow: {
    position: {
      x: 0,
      y: -1.5,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1 //
    }
  },
  light: {
    // TODO: remove
    intensity: 2.8,
    color: '#ffffff',
    position: [500, 50, 500],
    shadow: {
      near: 0.1,
      far: 100,
      left: -100,
      right: 100,
      bias: 0.0001
    }
  },
  background: {
    color1: '0x979799',
    color2: '0x2e2d31',
    aspectCorrection: false,
    aspect: 1,
    offset: [0, 0],
    scale: [1.0, 1.0],
    smoother: [0, 0.95]
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
        [1, 1, 1]
      ]
    }
  },
  defaultTransform: {
    position: [0, 0, 0],
    scale: 0.1
  },
  env: {
    rotation: [0, 0, 0],
    map: 0
  },
  ior: {}
}

export const MODEL_DATA = {
  idx: 22,
  textures: {},
  scale: 1,
  license: 'standard',
  animation: {
    keyframe: {
      speed: 1
    },
    shapekeys: {}
  },
  dynamics: {
    Lens: {
      meshes: ['lens_capsule', 'lens_cortex']
    },
    'Suspensory Ligaments': {
      meshes: ['suspensory_ligaments']
    },
    Sclera: {
      meshes: ['sclera']
    },
    Retina: {
      meshes: ['retina']
    },
    'Retinal Blood Vessels': {
      meshes: ['retinal_blood_vessels_blue', 'retinal_blood_vessels_red']
    },
    cornea: {
      meshes: ['cornea']
    },
    'Iris Ciliary Body': {
      meshes: ['iris_ciliary_body_half']
    },
    'Ora Serrata': {
      meshes: ['ora_serrata']
    }
  },
  hides: [],
  instances: [],
  alphas: []
}

export type DataType = {
  [key: string]: any
}

export type ModelDataType = {
  [key: string]: any
}

export type OptionsType = {
  [key: string]: any
  width: number
  height: number
  performance: {
    current: number
    min: number
    max: number
    debounce: number
  }
}

const VIEW_MODE = {
  SINGLE: 0,
  MULTIPLE: 1
}

export const _DEFAULT_VIEW_CONFIG = {
  type: 'main',
  control: {
    type: 'OrbitControls',
    autoRotate: false,
    limitation: {
      is: true,
      angle: ['-Infinity', 'Infinity', '-Infinity', 'Infinity'],
      zoom: [0, 10],
      pan: [
        [0, 0, 0],
        [1, 1, 1]
      ]
    }
  },
  gizmo: [true, true, true],
  camera: {
    type: 'Perspective',
    size: [0, 0, 1.0, 1.0],
    eye: [0, 0, 4],
    up: [0, 1, 0],
    fov: 50
  },
  left: 0,
  top: 0,
  bottom: 0,
  width: 1,
  height: 1
}

export class Viewer {
  container: HTMLDivElement
  doms?: HTMLDivElement[] | null
  options: OptionsType
  _data: DataType | null
  data: DataType | null
  tracker: ResourceTracker
  renderer: THREE.WebGLRenderer
  loader: BBLoader | null
  scene: THREE.Scene
  mixer: THREE.AnimationMixer
  animations: THREE.AnimationClip[]
  intro: THREE.AnimationAction | null
  clips: THREE.AnimationAction[]
  clock: THREE.Clock
  background: any
  info: {
    memory: {
      geometries: any
      textures: any
    }
    render: {
      calls: any
      triangles: any
      points: any
      lines: any
      frame: any
    }
  }
  content: Content | null
  onAnimation: boolean
  model: THREE.Object3D | null
  lights: {
    [index: string]: any
    ambient: Component | null
    directLights: {
      [key: string]: Component
    } | null
    spotLights: {
      [key: string]: Component
    } | null
    point: Component | null
  }
  components: {
    [key: string]: Component
  }
  mainView: View | null
  sideViews: View[]
  viewMode: number
  needsUpdate: boolean
  initialized: boolean
  modelData: ModelDataType | null
  time: {startTime: any; endTime: any}
  loadingCallback: any
  isRunning: boolean

  constructor(
    container: HTMLDivElement,
    data: DataType,
    options: OptionsType,
    doms?: HTMLDivElement[],
    loadingCallback?: any
  ) {
    this.container = container
    this.doms = doms

    this.loadingCallback = loadingCallback
    this.background = null
    // default
    this.options = options
    this._data = data
    this.data = _.cloneDeep(data)
    this.modelData = null

    this.tracker = new ResourceTracker('viewer')
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true
    })
    this.loader = new BBLoader(undefined, this)
    this.info = {
      memory: this.renderer.info.memory,
      render: this.renderer.info.render
    }
    this.scene = new THREE.Scene()
    this.content = null
    this.time = {startTime: null, endTime: null}
    this.clock = new THREE.Clock()
    this.onAnimation = false

    // animation
    this.mixer = new THREE.AnimationMixer(this.scene)
    this.animations = []
    this.clips = []
    this.intro = null

    this.model = null

    this.lights = {
      ambient: null,
      directLights: {},
      spotLights: {},
      point: null
    }
    this.components = {}

    // viewport
    this.mainView = null
    this.sideViews = []
    this.viewMode = VIEW_MODE.SINGLE

    //render
    this.needsUpdate = false
    this.isRunning = false
    this.initialized = false
  }

  async init() {
    if (!WEBGL.isWebGLAvailable && !WEBGL.isWebGL2Available) {
      alert("This browser/device doesn't support WebGL.")
    } else {
      this.initRenderer()
      this.loader?.init()
      // this.mixer.addEventListener('finished', () => {
      //   if (target.clips.length === 0) {
      //     target.onAnimation = false
      //     target.setAnimationLoop(false)
      //     return
      //   }
      //   for (let i = 0; i < target.clips.length; i++) {
      //     const clip = target.clips[i]
      //     if (!clip.isRunning()) {
      //       target.onAnimation = false
      //       target.setAnimationLoop(false)
      //       return
      //     }
      //   }
      // })
      this.initView()
      await this.initContent()
      this.initialized = true
      this.needsUpdate = true
    }
  }

  private initRenderer() {
    ;(THREE.ColorManagement as any).enabled = true

    if (!this.renderer)
      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true
      })
    this.renderer.setClearColor(
      this.data && this.data.renderer.color
        ? this.data.renderer.color
        : 0xcccccc,
      1
    )
    this.renderer.setPixelRatio(window.devicePixelRatio) // TODO : along performance
    this.renderer.setSize(this.options.width, this.options.height)

    if (this.data && this.data.shadow) {
      // TODO: -> data.scene.lights.shadow
      this.renderer.shadowMap.enabled = true
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    }
    ;(this.renderer as any).useLegacyLights = false // todo type
    this.renderer.outputColorSpace = THREE.SRGBColorSpace

    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    // this.renderer.toneMapping = THREE.ReinhardToneMapping
    if (this.data && this.data.renderer.exposure > 0) {
      this.renderer.toneMappingExposure = this.data.renderer.toneMappingExposure
    }

    this.setAnimationLoop(true)
    this.isRunning = true
    this.container.appendChild(this.renderer.domElement)
  }

  private initView() {
    if (!this.initialized) {
      const view = new View(this, _DEFAULT_VIEW_CONFIG, this.container, 30)
      view.init()
      this.mainView = view
    }
    if (this.doms && this.data) {
      for (let ii = 0; ii < this.data.views.length; ii++) {
        const dom = this.doms[ii]
        const view = new View(this, this.data.views[ii], dom, ii)
        view.init()
        this.sideViews.push(view)
      }
    }

    if (this.mainView && this.mainView.camera && this.data)
      this.mainView.setCamera(this.mainView.camera, this.data.camera.default) /// TODO:---
    if (this.sideViews.length > 0) {
      for (let i = 0; i < this.sideViews.length; i++) {
        this.sideViews[i].setCamera(
          this.sideViews[i].camera as THREE.Camera,
          this.sideViews[i].viewData.camera
        )
      }
    }
  }

  private async initContent() {
    if (!this.content) this.content = new Content(this)
    return await this.content.init()
  }

  private setAnimationLoop(isRunning: boolean) {
    if (this.renderer) {
      if (!isRunning && this.isRunning) {
        this.renderer.setAnimationLoop(null)
      } else if (isRunning && !this.isRunning) {
        this.renderer.setAnimationLoop(this.animate.bind(this))
      }
    }
  }

  private animate() {
    const {mixer} = this
    const delta = this.clock.getDelta()
    if (this.onAnimation) {
      mixer.update(delta)
      this.needsUpdate = true
    }
    if (this.needsUpdate === true) {
      this.render()
    }
    this.needsUpdate = false
  }

  private render() {
    this.time.startTime = performance.now()
    this.content && this.content.update()

    // view

    if (this.sideViews && this.viewMode === VIEW_MODE.MULTIPLE) {
      for (let i = 0; i < this.sideViews.length; i++) {
        const view = this.sideViews[i]
        view.update()
      }
    } else if (this.viewMode === VIEW_MODE.SINGLE) {
      this.mainView && this.mainView.update()
    }

    this.time.endTime = performance.now()
    this.getInfo()
  }

  private getInfo() {
    if (this.renderer) {
      const {memory, render} = this.renderer.info
      this.info = {memory, render}
      return this.info
    }
    return {
      memory: null,
      render: null
    }
  }

  async start(url: any, modelData: any, data: any) {
    if (!this.initialized || !this.renderer) await this.init()
    else await this.changeEnvMap(data.env ? data.env.map : 0)
    if (!this.isRunning) {
      this.setAnimationLoop(true)
      this.isRunning = true
    }
    if (data) {
      await this.setModel(url, modelData, data)

      if (this.content)
        this.content.setTransform(
          'env',
          'rotation',
          data.env && data.env.rotation ? data.env.rotation : [0, 0, 0]
        ) // TODO: content
    }
    // clip

    this.needsUpdate = true
    console.log('Viewer@@@', this)
  }

  async setModel(url: string, modelData: ModelDataType, data: DataType) {
    if (!this.initialized) await this.init()
    else {

      this.data = data
      this.modelData = modelData
      if (this.model) {
        this.clearScene()
      }

      this.resetViewLimit()

      if (this.loader) await this.loader.setModel(url, modelData)

      this.resetContent()
    }
  }

  // TODO : abstract
  // obj = marker | camera | shadow | lights | sss
  // value = any
  // selected = int | string
  setTransform(obj: any, type: string, value: any, selected: Component) {
    switch (obj) {
      case 'camera':
        // TODO : redesign
        // type = position | scale | rotation | limits
        if (type === 'angle' || type === 'zoom' || type === 'pan') {
          // TODO: adjust values also for views
          if (this.data && this.data.control && this.mainView) {
            this.data.control.limitation[type] = value
            this.mainView.setControlLimit(this.data.control.limitation)
          }
        } else if (type === 'correctionValue') {
          //
          if (this.mainView && this.data && this.mainView.camera) {
            this.data.camera.default.correctionValue = value
            this.setDefaultCamera(
              this.mainView.camera,
              this.mainView.viewData.camera
            )
          }
        } else if (type === 'position') {
          // set default transform
          this.mainView && this.mainView.setTransform(type, value)
          // reset transforms for multiple views
          if (this.sideViews.length > 0) {
            for (let i = 0; i < this.sideViews.length; i++) {
              const view = this.sideViews[i]
              view.setTransform(type, value)
            }
          }
        }
        break
      default:
        selected.setTransform(type, value)
        break
    }
    this.needsUpdate = true
  }

  _setTransform(selected: any, type: any, value: any) {
    // TODO : simplify
    if (selected.isComponent) selected.setTransform(type, value)
    else {
      if (selected === 'shadow' && this.content) {
        // TODO: REMOVE
        this.content.shadow.setTransform(type, value)
      } else if (selected[type] !== undefined)
        Array.isArray(value)
          ? selected[type].fromArray(value)
          : selected[type].set
          ? selected[type].set(value.x, value.y, value.z)
          : (selected[type] = value)
      else
        Array.isArray(value)
          ? selected.fromArray(value)
          : selected.set(value.x, value.y, value.z)
    }
    this.needsUpdate = true
  }

  setDefaultCamera(camera: any, data: any) {
    // TODO : REMOVE
    // setDefaultCamera
    if (this.mainView) this.mainView.setCamera(camera, data)
    if (this.sideViews.length > 0) {
      for (let i = 0; i < this.sideViews.length; i++) {
        this.sideViews[i].setCamera(camera, this.sideViews[i].viewData.camera)
      }
    }
  }

  clearScene() {
    this.loader && this.loader.clear()
    this.mainView && this.mainView.clear()
    // animation
    this.intro = null
    this.clips = []
    this.animations = []
    this.onAnimation = false
    this.mixer = new THREE.AnimationMixer(this.scene)
    this.mixer.addEventListener('finished', () => {
      if (this.clips.length === 0) {
        this.onAnimation = false
        this.setAnimationLoop(false)

        return
      }
      for (let i = 0; i < this.clips.length; i++) {
        const clip = this.clips[i]
        if (!clip.isRunning()) {
          this.onAnimation = false
          this.setAnimationLoop(false)
          this.isRunning = false
          return
        }
      }
    })
    this.model = null
  }

  resetContent() {
    if (this.content) this.content.reset()
  }

  refreshView() {
    if (this.mainView) this.mainView.refresh(this.container)
    // TODO: sideViews
  }

  playClip(name: any) {
    const clip = _.find(this.animations, (o: any) => o.name === name)
    clip && this.mixer.clipAction(clip).reset().play()
    this.setAnimationLoop(true)
    this.isRunning = true
    this.onAnimation = true
  }

  playAllClips() {
    this.clips.forEach((c: {play: () => any}) => c.play())
  }

  setWireFrame(toggle: boolean) {
    if (this.model) {
      if (toggle) {
        this.model.traverse((m: any) => {
          if (m.isMesh) {
            m.material.wireframe = true
          }
        })
      } else {
        this.model.traverse((m: any) => {
          if (m.isMesh) {
            m.material.wireframe = false
          }
        })
      }
    }
    this.needsUpdate = true
  }

  resetViewLimit() {
    // refresh scenes
    //this.content.setContent(this)
    if (this.data && this.data.control) {
      if (this.mainView)
        this.mainView.setControlLimit(this.data.control.limitation)
      for (let i = 0; i < this.sideViews.length; i++) {
        const view = this.sideViews[i]
        view.setControlLimit(this.data.control.limitation)
      }
    }
  }

  center() {
    // TODO : sideVies
    if (this.mainView) this.mainView.setView('ant')
  }

  setView(position: any) {
    // TODO : sideVies
    if (this.viewMode === VIEW_MODE.SINGLE && this.mainView) {
      this.mainView.setView(position)
      this.needsUpdate = true
    }
  }

  removeObject(_arg0: any) {
    throw new Error('Method not implemented.')
  }
  deselect() {
    throw new Error('Method not implemented.')
  }

  release() {
    this.clearScene()
    this.renderer && this.renderer.setClearColor(0x000000, 0)
    this.setAnimationLoop(false)
    this.isRunning = false
  }

  onWindowResize(width: any, height: any) {
    this.options.width = width
    this.options.height = height
    this.updateAspectRatio()
    if (this.renderer) {
      this.renderer.setSize(this.options.width, this.options.height)
      this.renderer.domElement.style.width = `${this.options.width}px`
      this.renderer.domElement.style.height = `${this.options.height}px`
    }
    this.needsUpdate = true
    //  this.setMouseClickedPoint();
  }

  updateAspectRatio() {
    if (this.mainView && this.viewMode === VIEW_MODE.SINGLE) {
      this.mainView.updateAspectRatio()
    } else if (
      this.sideViews.length > 0 &&
      this.viewMode === VIEW_MODE.MULTIPLE
    ) {
      for (let i = 0; i < this.sideViews.length; i++) {
        this.sideViews[i].updateAspectRatio()
      }
    }
  }

  async changeEnvMap(num: number) {
    if (this.content) {
      return await this.content.changeEnvMap(num)
    } else return
  }

  abortLoading() {
    this.setAnimationLoop(false)
    this.isRunning = false
    // if (this.renderer) this.renderer.clear()
    if (this.loader) this.loader.abort()
    if (this.content) this.content.abort()
  }

  getData() {
    return this.data
  }

  onDocumentMouseMove(event: any) {
    // TODO: sideViews
    this.mainView &&
      this.mainView.picker &&
      this.mainView.picker.onDocumentMouseMove(event)
    this.needsUpdate = true
  }

  onDocumentMouseDown() {
    // TODO: sideViews
    this.mainView &&
      this.mainView.picker &&
      this.mainView.picker.onDocumentMouseDown()
  }

  onDocumentMouseUp() {
    // TODO: sideViews
    this.mainView &&
      this.mainView.picker &&
      this.mainView.picker.onDocumentMouseUp()
    this.needsUpdate = true
  }

  getClip() {
    return this.clips.length > 0 ? this.clips : []
  }

  getMixer() {
    return this.mixer
  }

  getTimeStamp() {
    if (this.clips.length > 0) {
      return this.clips[0].time
    }
    return null
  }

  getDuration() {
    if (this.clips.length > 0) {
      return this.clips[0].getClip().duration
    }
    return null
  }

  playAnimation(type: string) {
    if (type === 'intro' && this.intro) {
      this.intro.reset().play()
    } else if (type === 'clip' && this.clips.length > 0) {
      this.clips.forEach((animation) => {
        animation.clampWhenFinished = true
        animation.loop = THREE.LoopOnce
        animation.reset().play()
      })
    }
    this.setAnimationLoop(true)
    this.isRunning = true
    this.onAnimation = true
  }

  playAllAnimation(reset: any) {
    this.animations.forEach((animation: any) => {
      const clipAction = this.mixer.clipAction(animation)
      clipAction.clampWhenFinished = true
      clipAction.loop = THREE.LoopOnce

      if (reset) clipAction.reset().play()
      else clipAction.play()
    })
    // target.onAnimation = true
  }

  startAtAll(time: any) {
    if (this.clips.length > 0) {
      this.clips.forEach((c) => {
        c.reset().play()
        c.time = time
      })

      this.onAnimation = true
    }
  }

  startAt(time: any) {
    if (this.clips.length > 0) {
      const clip = _.find(this.animations, (o: any) => o.name === name)
      clip && this.mixer.clipAction(clip).reset().play()
      this.mixer.time = time
      this.setAnimationLoop(true)
      this.isRunning = true
      this.onAnimation = true
    }
  }

  pauseAnimation() {
    if (this.clips.length > 0) {
      this.clips[0].paused = true
    }
    if (this.clips.length > 0) {
      this.clips.forEach((c: {paused: boolean}) => {
        c.paused = true
      })
    }
    this.onAnimation = false
  }

  stopAllAnimation() {
    this.onAnimation = false
  }

  exportGLTF(input: any) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const target = this

    const gltfExporter = new GLTFExporter()

    const options = {
      trs: false,
      onlyVisible: true,
      binary: true,
      maxTextureSize: 4096
    }
    gltfExporter.parse(
      input,
      function (result: any) {
        if (result instanceof ArrayBuffer) {
          target.saveArrayBuffer(result, 'scene.glb')
        } else {
          const output = JSON.stringify(result, null, 2)
          console.log(output)
          target.saveString(output, 'scene.gltf')
        }
      },
      function (error: any) {
        console.log('An error happened during parsing', error)
      },
      options
    )
  }

  deallocate() {
    this.release()
    // this.renderer?.dispose()
    this.renderer?.forceContextLoss()
    if ((this.renderer as any).context) (this.renderer as any).context = null
    if (this.renderer) (this.renderer as any).domElement = null
    this.initialized = false
  }

  save(blob: Blob | MediaSource, filename: any) {
    const link = document.createElement('a')
    link.style.display = 'none'
    document.body.appendChild(link) // Firefox workaround, see #6594
    link.href = URL.createObjectURL(blob)
    link.download = filename
    link.click()

    // URL.revokeObjectURL( url ); breaks Firefox...
  }

  saveString(text: BlobPart, filename: any) {
    this.save(new Blob([text], {type: 'text/plain'}), filename)
  }

  saveArrayBuffer(buffer: BlobPart, filename: any) {
    this.save(new Blob([buffer], {type: 'application/octet-stream'}), filename)
  }

  // take screenshot
  // ref https://codepen.io/shivasaxena/pen/QEzrrv
  takeScreenshot() {
    if (this.content) this.content.shadow.shadowGroup.visible = false
    ;(this.scene.getObjectByName('background') as any).visible = false
    this.renderer && this.renderer.setClearColor(0x000000, 0)

    this.render()
    const imgType = 'image/png'
    const imgData = this.renderer
      ? this.renderer.domElement.toDataURL(imgType)
      : ''

    if (this.content) this.content.shadow.shadowGroup.visible = true
    ;(this.scene.getObjectByName('background') as any).visible = true
    this.render()
    return imgData
  }

  takeScreenshotBlob(cb: (blob: any) => void) {
    if (this.content) this.content.shadow.shadowGroup.visible = false
    ;(this.scene.getObjectByName('background') as any).visible = false
    this.renderer && this.renderer.setClearColor(0x000000, 0)

    this.render()
    if (this.renderer) {
      this.renderer.domElement.toBlob(cb)
    }
    if (this.content) this.content.shadow.shadowGroup.visible = true
    ;(this.scene.getObjectByName('background') as any).visible = true
    this.render()
  }
}
