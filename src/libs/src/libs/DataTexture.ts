/* eslint-disable no-useless-escape */
/* eslint-disable prefer-const */
/* eslint-disable no-var */
// @ts-nocheck
import * as THREE from 'three'

import {Texture} from './Texture'

class DataTexture extends THREE.Texture {
  constructor(
    data = null,
    width = 1,
    height = 1,
    format,
    type,
    mapping,
    wrapS,
    wrapT,
    magFilter = THREE.NearestFilter,
    minFilter = THREE.NearestFilter,
    anisotropy,
    encoding
  ) {
    super(
      null,
      mapping,
      wrapS,
      wrapT,
      magFilter,
      minFilter,
      format,
      type,
      anisotropy,
      encoding
    )

    this.isDataTexture = true

    this.image = {data: data, width: width, height: height}

    this.generateMipmaps = false
    this.flipY = false
    this.unpackAlignment = 1
  }
}

export {DataTexture}
