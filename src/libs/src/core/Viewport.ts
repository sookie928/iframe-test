import * as THREE from 'three'
import {Viewer, _DEFAULT_VIEW_CONFIG} from '../apps/Viewer'

import {OrbitControls} from '../libs/bluebeaker.lib'
import {Picker} from './Picker'

const geometry = new THREE.SphereGeometry(0.07, 10, 10)

const wireframe = new THREE.WireframeGeometry(geometry)

const TARGET_OBJECT = new THREE.LineSegments(wireframe)
// (TARGET_OBJECT.material as MeshBasicMaterial).vertexColors = true;
;(TARGET_OBJECT.material as THREE.MeshBasicMaterial).color = new THREE.Color(
  0xff0000
)
;(TARGET_OBJECT.material as THREE.Material).depthTest = false
;(TARGET_OBJECT.material as THREE.Material).opacity = 0.9
;(TARGET_OBJECT.material as THREE.Material).transparent = true
TARGET_OBJECT.visible = false

export class View {
  index: number
  viewer: Viewer
  viewData: typeof _DEFAULT_VIEW_CONFIG
  control: OrbitControls | null
  dom: HTMLDivElement
  picker: Picker | null
  controlHelper: THREE.LineSegments | null
  camera: THREE.PerspectiveCamera | THREE.OrthographicCamera | null
  target0: THREE.Vector3 | null
  position0: THREE.Vector3 | null
  zoom0: any

  constructor(
    viewer: Viewer,
    viewData: typeof _DEFAULT_VIEW_CONFIG,
    dom: HTMLDivElement,
    index: number
  ) {
    this.index = index
    this.viewer = viewer
    this.viewData = viewData
    this.control = null
    this.dom = dom
    this.picker = null
    this.controlHelper = null
    this.camera = null
    this.target0 = null
    this.position0 = null
  }

  init() {
    const {width: _width, height: _height} = this.viewer.options
    const windowWidth = _width
    const windowHeight = _height

    const width = Math.floor(windowWidth * _width)
    const height = Math.floor(windowHeight * _height)

    const aspect = _width / _height
    const camera =
      this.viewData.camera.type === 'Orthographic'
        ? new THREE.OrthographicCamera(
            width / -200,
            width / 200,
            height / 200,
            height / -200,
            1,
            200
          )
        : new THREE.PerspectiveCamera(
            // this.cameraData.fov, // field of view
            30,
            aspect, // aspect ratio
            this.viewer.data ? this.viewer.data.camera.near : 0.1, // near
            this.viewer.data ? this.viewer.data.camera.far : 1000 // far
          )
    // camera.position.fromArray(this.cameraData.eye)
    // camera.up.fromArray(this.cameraData.up)
    camera.lookAt(this.viewer.scene.position)
    camera.layers.enable(this.index + 1)
    this.camera = camera
    this.viewer.scene.add(this.camera)

    // controls
    if (this.viewData.control) {
      switch (this.viewData.control.type) {
        case 'OrbitControls': {
          const c: any = new OrbitControls(this.camera, this.dom)
          c.enablePan = true
          if (this.viewData.camera.type === 'Orthographic')
            c.enableRotate = false
          this.control = c

          /////
          this.controlHelper = TARGET_OBJECT
          this.viewer.scene.add(this.controlHelper)
          this.setControlLimit(undefined)
          // c.update();
          c.addEventListener('change', (e: any) => {
            this.controlHelper && this.controlHelper.position.copy(c.target)
            this.viewer.needsUpdate = true
          })
        }
      }
    }
  }

  setControlLimit(data: any) {
    const limitation = data || (this.viewData.control as any).limitation
    if (limitation.is) {
      if (this.control) {
        //  this.control.reset()
        this.control.minPolarAngle = eval(limitation.angle[0])
        this.control.maxPolarAngle = eval(limitation.angle[1])
        this.control.minAzimuthAngle = eval(limitation.angle[2])
        this.control.maxAzimuthAngle = eval(limitation.angle[3])
        this.control.minDistance = limitation.zoom[0]
        this.control.maxDistance = limitation.zoom[1]

        this.control.minPan.set(...limitation.pan[0])
        this.control.maxPan.set(...limitation.pan[1])

        this.target0 = this.control.target.clone()
        this.position0 = this.control.object.position.clone()
        this.zoom0 = this.control.object.zoom
      }
      ;(this.viewData.control as any).limitation = limitation
      this.viewer.needsUpdate = true
    }
  }

  private setPicker() {
    this.picker = new Picker(this.viewer, this)
    this.picker.init()
    this.activate()
  }

  setTransform(type: string, value: any) {
    if (this.control) {
      ;(this.control.object as any)[type].fromArray(value)
      this.viewer.needsUpdate = true
    }
  }

  refresh(dom: any) {
    if (this.control) {
      this.viewer.scene.remove(this.control as unknown as THREE.Object3D<Event>)
      this.control.dispose()
      this.control = null
    }
    this.dom = dom
    if (this.viewData.control) {
      switch (this.viewData.control.type) {
        case 'OrbitControls': {
          const c: any = new OrbitControls(this.camera, this.dom)
          c.enablePan = true
          if (this.viewData.camera.type === 'Orthographic')
            c.enableRotate = false
          this.control = c

          /////
          this.controlHelper = TARGET_OBJECT
          this.viewer.scene.add(this.controlHelper)
          this.setControlLimit(undefined)
          // c.update();
          c.addEventListener('change', () => {
            if (this.controlHelper) this.controlHelper.position.copy(c.target)
            this.viewer.needsUpdate = true
          })
        }
      }
    }
  }

  clear() {
    this.picker && this.picker.deactivate()
    //  this.control && this.control.reset()
  }

  switchTargetHelper(isOn: boolean) {
    if (this.controlHelper) {
      this.controlHelper.visible = isOn
    }
  }

  activate() {
    if (this.picker) this.picker.activate()
    else this.setPicker()
  }

  deactivate() {
    this.picker && this.picker.deactivate()
  }

  onDocumentMouseMove(event: any) {
    this.picker && this.picker.onDocumentMouseMove(event)
  }

  update() {
    const {scene, renderer, options} = this.viewer
    if (scene) {
      const windowWidth = options.width
      const windowHeight = options.height
      const left = Math.floor(windowWidth * this.viewData.left)
      const bottom = Math.floor(windowHeight * this.viewData.bottom) // error
      const width = Math.floor(windowWidth * this.viewData.width)
      const height = Math.floor(windowHeight * this.viewData.height)

      renderer.setViewport(left, bottom, width, height) // off setViewport
      renderer.setScissor(left, bottom, width, height)
      renderer.setScissorTest(true)
      // console.log('cam', this.camera, this.cameraData.type)
      if (this.camera) {
        if ((this.camera as THREE.PerspectiveCamera).isPerspectiveCamera)
          (this.camera as THREE.PerspectiveCamera).aspect = width / height
        this.camera.updateProjectionMatrix()
        renderer.render(scene, this.camera)
      }

      if (this.control) this.control.update()
    }
  }

  setCamera(
    cameraObj: {children: string | any[]} | undefined,
    data: {eye: any}
  ) {
    if (this.viewer.data && this.camera && this.control) {
      const camera =
        cameraObj && cameraObj.children.length > 0
          ? cameraObj.children[0]
          : this.camera
      const newQuaternion =
        cameraObj && cameraObj.children.length > 0
          ? camera.parent.quaternion.multiply(camera.quaternion)
          : camera.quaternion
      const newPosition =
        camera.parent && cameraObj && cameraObj.children.length > 0
          ? camera.parent.position
          : camera.position
      const newScale = camera.scale
      this.viewer.data.camera.default.quaternion = newQuaternion
      this.viewer.data.camera.default.scale = newScale

      if (data) {
        // this.data.camera.default.eye = data.eye;
        this.camera.position.fromArray(data.eye)
      } else {
        this.viewer.data.camera.default.eye = newPosition

        this.camera.position.copy(newPosition)
        this.camera.quaternion.copy(newQuaternion)
      }
      this.camera.scale.copy(newScale)
      // this.camera.fov = camera.fov

      const correctionValue =
        this.viewer.data && this.viewer.data.camera.default.correctionValue
          ? this.viewer.data.camera.default.correctionValue
          : {x: 0, y: 0, z: 0}
      Array.isArray(correctionValue)
        ? this.control.target.fromArray(correctionValue)
        : this.control.target.set(
            correctionValue.x,
            correctionValue.y,
            correctionValue.z
          )

      // this.control.update()
      this.viewer.needsUpdate = true
    }
  }

  setView(view: string) {
    const {data} = this.viewer
    if (data && this.camera && this.control) {
      const position = Array.isArray(data.camera.default.eye)
        ? {
            x: data.camera.default.eye[0],
            y: data.camera.default.eye[1],
            z: data.camera.default.eye[2]
          }
        : data.camera.default.eye
      if (this.camera && this.viewer.model) {
        if (view === 'Ant' || view === 'ant' || view === 'front') {
          this.camera.position.set(position.x, position.y, position.z)
        } else if (
          view === 'Post' ||
          view === 'post' ||
          view === 'perspective'
        ) {
          this.camera.position.set(position.x, position.y, -position.z)
        } else if (view === 'Lat' || view === 'lat' || view === 'side') {
          this.camera.position.set(
            this.viewer.model.position.x + position.z,
            this.viewer.model.position.y,
            this.viewer.model.position.z
          )
        } else if (view === 'Med' || view === 'med') {
          this.camera.position.set(
            this.viewer.model.position.x - position.z,
            this.viewer.model.position.y,
            this.viewer.model.position.z
          )
        } else if (view === 'Sup' || view === 'sup' || view === 'up') {
          this.camera.position.set(
            this.viewer.model.position.x,
            this.viewer.model.position.y + position.z,
            this.viewer.model.position.y
          )
        } else if (view === 'Inf' || view === 'inf') {
          this.camera.position.set(
            this.viewer.model.position.x,
            this.viewer.model.position.y - position.z,
            this.viewer.model.position.y
          )
        }
      }

      const correctionValue =
        this.viewer.data && this.viewer.data.camera.default.correctionValue
          ? this.viewer.data.camera.default.correctionValue
          : {x: 0, y: 0, z: 0}
      // this.camera.quaternion.copy(this.data.camera.default.quaternion)

      //\\  this.camera.position.applyQuaternion(this.viewer.model.quaternion)
      this.viewer.model
        ? this.control.target.set(
            this.viewer.model.position.x + correctionValue.x,
            this.viewer.model.position.y + correctionValue.y,
            this.viewer.model.position.z + correctionValue.z
          )
        : this.control.target.set(0, 0, 0)

      this.control.update()
    }
  }

  setSize() {
    const {options} = this.viewer
    const {left, bottom, width, height} = this.viewData
    if (this.dom) {
      // react?
      this.dom.style.position = 'absolute'
      this.dom.style.left = `${options.width * left}px`
      this.dom.style.bottom = `${options.height * bottom}px`
      this.dom.style.width = `${options.width * width}px`
      this.dom.style.height = `${options.height * height}px`
    }
  }

  updateAspectRatio() {
    // only for fullscreen view
    if (this.camera) {
      const camera = this.camera.isCamera
        ? this.camera
        : this.camera.children[0]

      const {options} = this.viewer

      const windowWidth = options.width
      const windowHeight = options.height
      const width = Math.floor(windowWidth * this.viewData.width)
      const height = Math.floor(windowHeight * this.viewData.height)

      if ((camera as THREE.PerspectiveCamera).isPerspectiveCamera) {
        ;(camera as THREE.PerspectiveCamera).aspect = width / height
      } else {
        const width = Math.floor(windowWidth * this.viewData.width)
        const height = Math.floor(windowHeight * this.viewData.height)

        ;(camera as THREE.OrthographicCamera).left = width / -200
        ;(camera as THREE.OrthographicCamera).right = width / 200
        ;(camera as THREE.OrthographicCamera).top = height / 200
        ;(camera as THREE.OrthographicCamera).bottom = height / -200
      }
      ;(
        camera as THREE.PerspectiveCamera | THREE.OrthographicCamera
      ).updateProjectionMatrix()
    }
  }
}
