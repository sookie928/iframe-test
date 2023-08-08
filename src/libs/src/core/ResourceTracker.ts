import * as THREE from 'three'

class ResourceTracker {
  name: string | null
  resources: Set<unknown>
  constructor(name: any) {
    this.name = name
    this.resources = new Set()
  }

  // get resources() {
  //   return this.resources;
  // }

  // set name(name) {
  //   this.name = name;
  // }

  // get name() {
  //   return this.name;
  // }

  track(resource: any) {
    if (!resource) {
      return resource
    }

    // handle children and when material is an array of materials or
    // uniform is array of textures
    if (Array.isArray(resource)) {
      resource.forEach((resource) => this.track(resource))
      return resource
    }

    if (resource.dispose || resource instanceof THREE.Object3D) {
      this.resources.add(resource)
    }
    if (resource instanceof THREE.Object3D || resource instanceof THREE.Mesh) {
      this.track((resource as THREE.Mesh).geometry)
      this.track((resource as THREE.Mesh).material)
      this.track(resource.children)
    } else if (resource instanceof THREE.Material) {
      // We have to check if there are any textures on the material
      for (const value of Object.values(resource)) {
        if (value instanceof THREE.Texture) {
          this.track(value)
        }
      }
      // We also have to check if any uniforms reference textures or arrays of textures
      if ((resource as any).uniforms) {
        for (const value of Object.values((resource as any).uniforms)) {
          if (value) {
            const uniformValue = (value as any).value
            if (
              uniformValue instanceof THREE.Texture ||
              Array.isArray(uniformValue)
            ) {
              this.track(uniformValue)
            }
          }
        }
      }
    }
    return resource
  }

  untrack(resource: any) {
    this.resources.delete(resource)
  }

  dispose() {
    for (const resource of this.resources) {
      if (resource instanceof THREE.Object3D) {
        if (resource.parent) {
          resource.parent.remove(resource)
        }
      }
      if ((resource as any).dispose) {
        ;(resource as any).dispose()
      }
    }
    this.resources.clear()
  }
}

/*
  async function loadFiles() {
    for (;;) {
      for (const url of fileURLs) {
        const resMgr = new ResourceTracker();
        const track = resMgr.track.bind(resMgr);
        const gltf = await loadGLTF(url);
        const root = track(gltf.scene);
        scene.add(root);

        // compute the box that contains all the stuff
        // from root and below
        const box = new THREE.Box3().setFromObject(root);

        const boxSize = box.getSize(new THREE.Vector3()).length();
        const boxCenter = box.getCenter(new THREE.Vector3());

        // set the camera to frame the box
        frameArea(boxSize * 1.1, boxSize, boxCenter, camera);

        await waitSeconds(2);
        renderer.render(scene, camera);

        resMgr.dispose();

        await waitSeconds(1);

      }
    }
  }
  loadFiles(); */

export {ResourceTracker}
