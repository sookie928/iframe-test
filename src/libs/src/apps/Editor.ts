import {ResourceTracker} from '../core/ResourceTracker'
import {OrbitControls, TransformControls} from '../libs/bluebeaker.lib'
import {DataType, OptionsType, Viewer} from './Viewer'
import * as THREE from 'three'

export class Editor extends Viewer {
  modelControl: TransformControls | null
  gridHelper: THREE.GridHelper | null
  constructor(
    container: HTMLDivElement,
    data: DataType,
    options: OptionsType,
    doms?: HTMLDivElement[],
    loadingCallback?: any
  ) {
    super(container, data, options, doms, loadingCallback)
    this.modelControl = null
    this.gridHelper = null
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

  addModelControl(mode: string) {
    // TODO : side views (ref.marker editor)
    if (this.mainView) {
      const t = new TransformControls(this.mainView.camera, this.container)
      t.setMode(mode)
      t.addEventListener('dragging-changed', (event) => {
        if (this.sideViews.length > 0) {
          for (let i = 0; i < this.sideViews.length; i++) {
            if (this.sideViews[i].control)
              (this.sideViews[i].control as OrbitControls).enabled =
                !event.value
          }
        }
        if (this.mainView)
          (this.mainView.control as OrbitControls).enabled = !event.value
      })
      t.addEventListener('change', (ttr) => {
        this.needsUpdate = true
      })
      //???
      this.scene.add(new ResourceTracker('transform').track(t))
      if (this.model) {
        t.attach(this.model)
        this.model.userData.control = t
      }
      this.modelControl = t
    }
  }

  switchModelControl(toggle: boolean) {
    if (this.modelControl) {
      this.modelControl.visible = toggle
      this.modelControl.enabled = toggle
      this.needsUpdate = true
    }
  }

  setEditorEnv() {
    if (this.scene && !this.gridHelper) {
      const gridHelper = new THREE.GridHelper(10, 10)
      this.gridHelper = gridHelper
      this.scene.add(this.gridHelper)
      //
    }
    if (this.model && !this.modelControl) {
      this.addModelControl('translate')
    }
  }

  switchViewTargetHelper(isOn: boolean) {
    // TODO: side Views
    if (this.mainView) {
      this.mainView.switchTargetHelper(isOn)
      this.needsUpdate = true
    }
  }

  clearEditorEnv() {
    if (this.scene && this.gridHelper) {
      this.scene.remove(this.gridHelper)
      this.gridHelper.dispose()
      this.gridHelper = null
    }
  }

  setComponentHelper(uuid: string | number, isVisible: any) {
    if (isVisible) {
      this.components[uuid].activateHelper()
    } else {
      this.components[uuid].deactivateHelper()
    }
  }

  clearScene(): void {
    if (this.modelControl) {
      this.modelControl.detach()
      this.modelControl.dispose()
      this.modelControl = null
    }

    super.clearScene()
  }
}
