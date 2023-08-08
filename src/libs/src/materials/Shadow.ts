import * as THREE from 'three'

import {HorizontalBlurShader} from './HorizontalBlurShader'
import {VerticalBlurShader} from './VerticalBlurShader'

const PLANE_WIDTH = 6.5
const PLANE_HEIGHT = 6.5
const CAMERA_HEIGHT = 0.3
const BLUR = 1.5

export const makeShadow = (
  viewer: any,
  scene: any,
  renderer: {
    setRenderTarget: (arg0: THREE.WebGLRenderTarget | null) => void
    render: (
      arg0: THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>,
      arg1: THREE.OrthographicCamera
    ) => void
    getClearAlpha: () => any
    setClearAlpha: (arg0: number) => void
  },
  config: {
    position: any
    scale: any
  }
) => {
  // the container, if you need to move the plane just move this
  const shadowGroup: any = new THREE.Group()
  shadowGroup.position.y = (config.position && config.position.y) || -1.2
  if (config.scale) {
    if (Array.isArray(config.scale)) shadowGroup.scale.fromArray(config.scale)
    else shadowGroup.scale.set(config.scale.x, config.scale.y, config.scale.z)
  } else shadowGroup.scale.set(5, 5, 5)

  shadowGroup.name = 'shadow'
  scene.add(shadowGroup)

  // the render target that will show the shadows in the plane texture
  const renderTarget = new THREE.WebGLRenderTarget(512, 512)
  renderTarget.texture.generateMipmaps = false

  // the render target that we will use to blur the first render target
  const renderTargetBlur = new THREE.WebGLRenderTarget(512, 512)
  renderTargetBlur.texture.generateMipmaps = false

  // make a plane and make it face up
  const planeGeometry = new THREE.PlaneGeometry(
    PLANE_WIDTH,
    PLANE_HEIGHT
  ).rotateX(Math.PI / 2)
  const planeMaterial = new THREE.MeshBasicMaterial({
    map: renderTarget.texture,
    opacity: 1,
    transparent: true,
    depthWrite: false
  })
  const plane = new THREE.Mesh(planeGeometry, planeMaterial)
  // make sure it's rendered after the fillPlane
  plane.renderOrder = 1
  shadowGroup.add(plane)

  // the y from the texture is flipped!
  plane.scale.y = -1

  // the plane onto which to blur the texture
  const blurPlane = new THREE.Mesh(planeGeometry)
  blurPlane.visible = false
  shadowGroup.add(blurPlane)

  // the plane with the color of the ground
  const fillPlaneMaterial = new THREE.MeshBasicMaterial({
    color: '#ffffff',
    opacity: 0,
    transparent: true,
    depthWrite: false
  })
  const fillPlane = new THREE.Mesh(planeGeometry, fillPlaneMaterial)
  fillPlane.rotateX(Math.PI)
  shadowGroup.add(fillPlane)

  // the camera to render the depth material from
  const shadowCamera = new THREE.OrthographicCamera(
    -PLANE_WIDTH / 2,
    PLANE_WIDTH / 2,
    PLANE_HEIGHT / 2,
    -PLANE_HEIGHT / 2,
    0,
    CAMERA_HEIGHT
  )

  // TODO: specify layers
  shadowCamera.layers.enableAll()

  shadowCamera.rotation.x = Math.PI / 2 // get the camera to look up
  shadowGroup.add(shadowCamera)

  // like MeshDepthMaterial, but goes from black to transparent
  const depthMaterial = new THREE.MeshDepthMaterial()
  depthMaterial.userData.darkness = {value: 10}
  depthMaterial.onBeforeCompile = function (shader) {
    shader.uniforms.darkness = depthMaterial.userData.darkness
    shader.fragmentShader = /* glsl */ `
      uniform float darkness;
      ${shader.fragmentShader.replace(
        'gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );',
        'gl_FragColor = vec4( vec3( 0.0 ), ( 1.0 - fragCoordZ ) * darkness );'
      )}
    `
  }

  depthMaterial.depthTest = false
  depthMaterial.depthWrite = false

  const horizontalBlurMaterial = new THREE.ShaderMaterial(HorizontalBlurShader)
  horizontalBlurMaterial.depthTest = false

  const verticalBlurMaterial = new THREE.ShaderMaterial(VerticalBlurShader)
  verticalBlurMaterial.depthTest = false

  function resetShadow(newConfig: any) {
    if (newConfig.position) {
      Array.isArray(shadowGroup.position)
        ? shadowGroup.position.fromArray(newConfig.position)
        : shadowGroup.position.set(newConfig.x, newConfig.y, newConfig.z)
    } else if (!newConfig.position) shadowGroup.position.set(0, -1.2, 0)
    if (newConfig.scale) {
      if (Array.isArray(newConfig.scale))
        shadowGroup.scale.fromArray(newConfig.scale)
      else
        shadowGroup.scale.set(
          newConfig.scale.x,
          newConfig.scale.y,
          newConfig.scale.z
        )
    } else shadowGroup.scale.set(5, 5, 5)
    update()
  }

  function blurShadow(amount: number) {
    blurPlane.visible = true

    // blur horizontally and draw in the renderTargetBlur
    blurPlane.material = horizontalBlurMaterial
    ;(blurPlane.material as any).uniforms.tDiffuse.value = renderTarget.texture
    horizontalBlurMaterial.uniforms.h.value = (amount * 1) / 256

    renderer.setRenderTarget(renderTargetBlur)
    renderer.render(blurPlane, shadowCamera)

    // blur vertically and draw in the main renderTarget
    blurPlane.material = verticalBlurMaterial
    ;(blurPlane.material as any).uniforms.tDiffuse.value =
      renderTargetBlur.texture
    verticalBlurMaterial.uniforms.v.value = (amount * 1) / 256

    renderer.setRenderTarget(renderTarget)
    renderer.render(blurPlane, shadowCamera)

    blurPlane.visible = false
  }

  function update() {
    // remove the background
    const initialBackground = scene.background
    scene.background = null

    // force the depthMaterial to everything
    //  cameraHelper.visible = false

    // TODO : use Component class
    if (viewer.clippingControls) {
      viewer.clippingControls.planeHelpers.forEach((ph: {visible: boolean}) => {
        ph.visible = false
      })
    }
    if (viewer.gridHelper) {
      viewer.gridHelper.visible = false
    }

    scene.overrideMaterial = depthMaterial

    // set renderer clear alpha
    const initialClearAlpha = renderer.getClearAlpha()
    renderer.setClearAlpha(0)

    // render to the render target to get the depths
    renderer.setRenderTarget(renderTarget)
    renderer.render(scene, shadowCamera)

    // and reset the override material
    scene.overrideMaterial = null
    //cameraHelper.visible = true

    if (viewer.clippingControls) {
      viewer.clippingControls.planeHelpers.forEach((ph: {visible: boolean}) => {
        ph.visible = true
      })
    }
    if (viewer.gridHelper) {
      viewer.gridHelper.visible = true
    }

    blurShadow(BLUR)

    // a second pass to reduce the artifacts
    // (0.4 is the minimum blur amout so that the artifacts are gone)
    blurShadow(BLUR * 0.4)

    // reset and render the normal scene
    renderer.setRenderTarget(null)
    renderer.setClearAlpha(initialClearAlpha)
    scene.background = initialBackground
  }

  function setTransform(
    type: string | number,
    value: {x: any; y: any; z: any}
  ) {
    viewer.data.shadow[type] = value
    Array.isArray(value)
      ? shadowGroup[type].fromArray(value)
      : shadowGroup[type].set(value.x, value.y, value.z)
    update()
  }

  return {resetShadow, shadowGroup, update, setTransform}
}

// -> class
