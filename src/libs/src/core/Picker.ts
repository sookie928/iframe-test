import * as THREE from 'three'

// TODO : pick for Ortho
// TODO : pick for Instances

class Picker {
  viewer: any
  clock: any
  options: any
  time: {start: number; end: number}
  renderer: any
  scene: any
  camera: any
  dom: any
  raycaster: THREE.Raycaster
  origVec: THREE.Vector3
  dirVec: THREE.Vector3
  mouse: THREE.Vector2
  pickedObject: any
  pickedObjectSavedColor: number
  pickPosition: {x: number; y: number}
  onMultiSelect: boolean
  clickedObject: any
  clickedObjectSavedColor: number
  isRunning: boolean
  object3ds: any
  data: any
  origins: any
  constructor(viewer: any, view: any) {
    this.viewer = viewer
    this.clock = viewer.clock
    this.options = viewer.options
    this.time = {start: 0, end: 0}
    this.renderer = viewer.renderer
    this.scene = viewer.scene
    this.camera = view.camera
    this.dom = view.dom
    this.raycaster = new THREE.Raycaster()
    this.origVec = new THREE.Vector3()
    this.dirVec = new THREE.Vector3()
    this.mouse = new THREE.Vector2(1, 1)
    this.pickedObject = null
    this.pickedObjectSavedColor = 0
    this.pickPosition = {x: 0, y: 0}
    this.onMultiSelect = false
    this.clickedObject = null
    this.clickedObjectSavedColor = 0
    this.isRunning = true
  }

  // set pickPosition(position = { x: 0, y: 0 }) {
  //   this.pickPosition = position;
  // }
  // get pickPosition() {
  //   return this.pickPosition;
  // }
  activate() {
    this.isRunning = true
  }

  deactivate() {
    // this.isRunning = false
    this.isRunning = true
  }

  init() {
    const raycaster = this.raycaster || new THREE.Raycaster()
    raycaster.set(this.origVec, this.dirVec)
    ;(raycaster as any).firstHitOnly = true
    raycaster.layers.enableAll()

    this.clearPickPosition()
  } //

  pick() {
    // restore the color if there is a picked object
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const target = this
    if (!this.clickedObject) {
      if (target.pickedObject) {
        target.pickedObject.material.emissive &&
          target.pickedObject.material.emissive.setHex(
            target.pickedObjectSavedColor
          )
        target.pickedObject = undefined
      }

      // cast a ray through the frustum
      target.raycaster.setFromCamera(target.mouse, target.camera)
      // get the list of objects the ray intersected

      const intersectedObjects = target.viewer.model
        ? target.raycaster.intersectObjects(target.viewer.model.children)
        : [] // need to be fixed
      if (intersectedObjects.length) {
        // pick the first object. It's the closest one
        target.pickedObject = intersectedObjects[0].object
        // save its color
        target.pickedObjectSavedColor =
          (target.pickedObject.material.emissive &&
            target.pickedObject.material.emissive.getHex()) ||
          target.pickedObjectSavedColor // -> edges
        // set its emissive color to flashing red/yellow
        target.pickedObject.material.emissive &&
          target.pickedObject.material.emissive.setHex(0xffff00)
      }
    }
  }

  click() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const target = this
    target.clickedObject = !target.clickedObject
    target.pick()
  }

  clear() {
    // clear intersects
  }

  onDocumentMouseDown() {
    this.time.start = new Date().getTime()
  }

  onDocumentMouseUp() {
    // prevent duplicated event: orbit mouse moving > mouseup into intersect
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const target = this
    target.time.end = new Date().getTime()
    if (target.time.end - target.time.start > 500) return //
    target.click()
  }

  multiSelect() {
    this.onMultiSelect = !this.onMultiSelect

    return this.onMultiSelect
  }

  selectPart(key: any) {
    // object3ds
    const color = 0xffffff

    if (this.object3ds.selectedObjects.indexOf(key) > -1) {
      // already selected object
      this.unselectPart(key)
    } else {
      if (!this.onMultiSelect) {
        if (this.object3ds.currentObject.length > 0)
          this.unselectPart(this.object3ds.currentObject)
      }

      const value = this.data.dynamics[key]

      for (let i = 0; i < value.meshes.length; i++) {
        const object = this.scene.getObjectByName(value.meshes[i])
        if (object) {
          if (object.isMesh) {
            object.material.emissive = new THREE.Color(color)
          } else if (object.isGroup) {
            this.scene
              .getObjectByName(value.meshes[i])
              .traverse(function (child: any) {
                if (child.isMesh) {
                  child.material.emissive = new THREE.Color(color)
                }
              })
          }
        }
      }

      this.object3ds.selectedObjects.push(key)
      this.object3ds.currentObject = key
    }
  }

  unselectPart(key: any) {
    for (let i = 0; i < this.object3ds.selectedObjects.length; i++) {
      if (this.object3ds.selectedObjects[i] === key) {
        this.object3ds.selectedObjects.splice(i, 1)
        i--
      }
    }

    const value = this.data.dynamics[key]

    for (let i = 0; i < value.meshes.length; i++) {
      const object = this.scene.getObjectByName(value.meshes[i])
      if (object) {
        if (object.isMesh) {
          object.material.emissive = this.origins[object.name].emissive
        } else if (object.isGroup) {
          // eslint-disable-next-line @typescript-eslint/no-this-alias
          const target = this
          this.scene
            .getObjectByName(value.meshes[i])
            .traverse(function (child: any) {
              if (child.isMesh) {
                child.material.emissive = target.origins[child.name].emissive
              }
            })
        }
      }
    }
  }

  unselectPartAll() {
    this.object3ds = {currentObject: '', selectedObjects: []}

    for (const key in this.data.dynamics) {
      const value = this.data.dynamics[key]

      for (let i = 0; i < value.meshes.length; i++) {
        const object = this.scene.getObjectByName(value.meshes[i])
        if (object) {
          if (object.isMesh) {
            object.material.emissive = this.origins[object.name].emissive
          } else if (object.isGroup) {
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            const target = this
            this.scene
              .getObjectByName(value.meshes[i])
              .traverse(function (child: any) {
                if (child.isMesh) {
                  child.material.emissive = target.origins[child.name].emissive
                }
              })
          }
        }
      }
    }
  }

  getCanvasRelativePosition(event: any) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const target = this
    const rect = target.dom.getBoundingClientRect()
    return {
      x: ((event.clientX - rect.left) * target.dom.width) / rect.width,
      y: ((event.clientY - rect.top) * target.dom.height) / rect.height
    }
  }

  onDocumentMouseMove(event: any) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const target = this

    if (target.isRunning) {
      const rect = this.dom.getBoundingClientRect()
      // TODO: do not use options for multiple views

      const pos = {
        x: ((event.clientX - rect.left) * this.options.width) / rect.width,
        y: ((event.clientY - rect.top) * this.options.height) / rect.height
      }
      ///
      // const pos = target.getCanvasRelativePosition(event)
      const posX = (pos.x / this.options.width) * 2 - 1
      const posY = (pos.y / this.options.height) * -2 + 1 // note we flip Y
      this.mouse.set(posX, posY)

      target.pick()
    }
  }

  clearPickPosition() {
    // unlike the mouse which always has a position
    // if the user stops touching the screen we want
    // to stop picking. For now we just pick a value
    // unlikely to pick something
    this.mouse && this.mouse.set(-100000, 100000)
  }
}

export {Picker}
