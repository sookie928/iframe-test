import _ from 'lodash'
import * as THREE from 'three'
import {Viewer} from '../apps/Viewer'

import {OrbitControls, TransformControls} from '../libs/bluebeaker.lib'
import {ResourceTracker} from './ResourceTracker'

export class Component {
  isComponent: boolean
  viewer: Viewer
  data: any
  object: any
  name: string
  type: any
  uuid: string
  helper: any
  control: any
  tracker: ResourceTracker
  isActive: boolean
  init: () => void
  constructor(
    viewer: Viewer,
    object: any,
    withHelper:
      | boolean
      | THREE.DirectionalLightHelper
      | THREE.PointLightHelper
      | THREE.SpotLightHelper,
    name: string,
    data: any
  ) {
    this.isComponent = true
    this.viewer = viewer
    this.data = data
    this.object = object
    this.name = data.name || name
    this.type = data.type // TODO: support
    this.uuid = object.name
    this.helper = null
    this.control = null
    this.tracker = new ResourceTracker(data.name)
    this.isActive = false

    this.viewer.scene.add(this.tracker.track(object))

    this.viewer.needsUpdate = true

    this.init = () => {
      // object setting
      this.object.position.fromArray(data.position ? data.position : [0, 0, 0])
      if (this.object.shadow && data.shadow) {
        this.object.castShadow = false
        this.object.shadow.camera.near = data.shadow.near
        this.object.shadow.camera.far = data.shadow.near
        this.object.shadow.camera.left = data.shadow.left
        this.object.shadow.camera.right = data.shadow.right
        this.object.shadow.camera.top = data.shadow.top
        this.object.shadow.camera.bottom = data.shadow.bottom
        this.object.shadow.bias = data.shadow.bias
      }

      // helper setting
      if (withHelper) {
        // helper
        let helper
        switch (this.type) {
          case 'directional':
            helper = new THREE.DirectionalLightHelper(this.object, 1)
            break
          case 'spot':
            helper = new THREE.SpotLightHelper(this.object, 1)
            break
          case 'point':
            helper = new THREE.SpotLightHelper(this.object, 0xffffff)
            break
          default:
            break
        }
        if (helper) {
          this.helper = this.tracker.track(helper)
          this.deactivateHelper() // initial state
          this.viewer.scene.add(this.helper)

          this.helper.update()
        }
      }
    }
    this.init()
  }

  addHandler(event: any, cb: (arg0: any) => void) {
    // control setting
    if (this.viewer.mainView) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const target = this
      const t = new TransformControls(
        this.viewer.mainView.camera,
        this.viewer.container
      )
      t.castShadow = false
      t.receiveShadow = false
      this.viewer.scene.add(this.tracker.track(t))
      t.attach(this.object)
      this.control = t

      t.addEventListener('dragging-changed', (event) => {
        if (target.viewer.sideViews.length > 0) {
          for (let i = 0; i < target.viewer.sideViews.length; i++) {
            if (
              target.viewer.sideViews[i] &&
              target.viewer.sideViews[i].control
            )
              (target.viewer.sideViews[i].control as OrbitControls).enabled =
                !event.value
          }
        }
        if (target.viewer.mainView && target.viewer.mainView.control)
          target.viewer.mainView.control.enabled = !event.value
      })

      t.addEventListener(event, (_) => {
        // target.data
        target.data.position = Object.values(target.object.position)
        cb(target.data.position)
        // target.helper.update()
        target.viewer.needsUpdate = true
      })

      target.viewer.needsUpdate = true
    }
  }

  activateHelper() {
    this.isActive = true
    if (this.helper) this.helper.visible = true

    if (this.control) {
      this.control.visible = true
      this.control.enabled = true
    }
    this.viewer.needsUpdate = true
  }

  deactivateHelper() {
    this.isActive = false
    if (this.helper) this.helper.visible = false
    if (this.control) {
      //  console.log('ENVA 111LL', this)

      this.control.visible = false
      this.control.enabled = false
    }
    this.viewer.needsUpdate = true
  }

  dispose(type: string, dataAlso = true) {
    // TODO : DELETE
    if (type === 'camera') {
      //
    } else if (type === 'light') {
      this.viewer.scene.remove(this.object)

      this.object = null
      this.helper = null
      this.control = null
      if (this.viewer.lights.directLights) {
        //
      }
      if (this.type === 'directional' && this.viewer.lights.directLights) {
        delete this.viewer.lights.directLights[this.name]
        if (this.viewer.data) {
          const currIndex = _.findIndex(
            this.viewer.data.scene.lights.sides,
            (l: any) => l.name === this.name
          )
          if (dataAlso) this.viewer.data.scene.lights.sides.splice(currIndex, 1)
        }
      } else if (this.type === 'spot' && this.viewer.lights.spotLights) {
        delete this.viewer.lights.spotLights[this.name]
        if (this.viewer.data) {
          const currIndex = _.findIndex(
            this.viewer.data.scene.lights.sides,
            (l: any) => l.name === this.name
          )
          if (dataAlso) this.viewer.data.scene.lights.sides.splice(currIndex, 1)
        }
      } else if (this.viewer.lights[this.name] as any) {
        this.viewer.lights[this.name] = null
      }

      // this.viewer.data.scene.lights.s;
    }

    this.tracker.dispose()

    this.viewer.needsUpdate = true
  }

  update() {
    if (this.helper) this.helper.update()
  }

  setTransform(
    type: string | number,
    value: {x: any; y: any; z: any} | number
  ) {
    // TODO: enum
    // vec3 : scale, position : enum
    // int,float : intensity, brightness
    // string: color
    switch (type) {
      case 'position' || 'scale':
        // eslint-disable-next-line no-case-declarations
        const v = value as {x: any; y: any; z: unknown}
        Array.isArray(v)
          ? this.object[type].fromArray(v)
          : this.object[type].set(v.x, v.y, v.z)
        // this.data.
        break
      case 'color':
        if (this.object[type] && value) this.object[type].set(value)
        break
      default:
        this.object[type] = value
        break
    }
    if (this.helper) this.helper.update()
    this.viewer.needsUpdate = true
  }
}
