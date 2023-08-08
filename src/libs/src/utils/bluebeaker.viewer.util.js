export function isRenderItem(obj) {
  return 'geometry' in obj && 'material' in obj
}

export function disposeMaterial(obj) {
  if (!isRenderItem(obj)) return

  // because obj.material can be a material or array of materials
  const materials = [].concat(obj.material)

  for (const material of materials) {
    material.dispose()
  }
}

export function disposeObject(
  obj,
  removeFromParent = true,
  destroyGeometry = true,
  destroyMaterial = true
) {
  if (!obj) return

  if (isRenderItem(obj)) {
    if (obj.geometry && destroyGeometry) obj.geometry.dispose()
    if (destroyMaterial) disposeMaterial(obj)
  }

  removeFromParent &&
    Promise.resolve().then(() => {
      // if we remove children in the same tick then we can't continue traversing,
      // so we defer to the next microtask
      obj.parent && obj.parent.remove(obj)
    })
}

export function disposeObjectTree(
  obj,
  disposeOptions = {
    removeFromParent: true,
    destroyGeometry: true,
    destroyMaterial: true
  }
) {
  obj.traverse((node) => {
    disposeObject(
      node,
      disposeOptions.removeFromParent,
      disposeOptions.destroyGeometry,
      disposeOptions.destroyMaterial
    )
  })
}

export function applyMaterial(obj, material, dispose = true) {
  if (!isRenderItem(obj)) return
  if (dispose && obj.material) disposeMaterial(obj)
  obj.material = material
}

export function isPerspectiveCamera(camera) {
  return !!camera.isPerspectiveCamera
}

export function isOrthographicCamera(camera) {
  return !!camera.isOrthographicCamera
}

// https://stackoverflow.com/a/9039885/1314762
export function isIOS() {
  return (
    [
      'iPad Simulator',
      'iPhone Simulator',
      'iPod Simulator',
      'iPad',
      'iPhone',
      'iPod'
    ].includes(navigator.platform) ||
    // iPad on iOS 13 detection
    (navigator.userAgent.includes('Mac') && 'ontouchend' in document)
  )
}
