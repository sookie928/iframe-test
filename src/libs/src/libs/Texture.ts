/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-useless-escape */
/* eslint-disable prefer-const */
/* eslint-disable no-var */
// @ts-nocheck

import * as THREE from 'three'

import {Source} from './Source.js'

let textureId = 0

class Texture extends THREE.EventDispatcher {
  wrapS: THREE.Wrapping
  wrapT: THREE.Wrapping
  flipY: boolean
  encoding: THREE.TextureEncoding

  constructor(
    image = Texture.DEFAULT_IMAGE,
    mapping = Texture.DEFAULT_MAPPING,
    wrapS = THREE.ClampToEdgeWrapping,
    wrapT = THREE.ClampToEdgeWrapping,
    magFilter = THREE.LinearFilter,
    minFilter = THREE.LinearMipmapLinearFilter,
    format = THREE.RGBAFormat,
    type = THREE.UnsignedByteType,
    anisotropy = Texture.DEFAULT_ANISOTROPY,
    encoding = THREE.LinearEncoding
  ) {
    super()

    this.isTexture = true

    Object.defineProperty(this, 'id', {value: textureId++})

    this.uuid = THREE.MathUtils.generateUUID()

    this.name = ''

    this.source = new Source(image)
    this.mipmaps = []

    this.mapping = mapping

    this.wrapS = wrapS
    this.wrapT = wrapT

    this.magFilter = magFilter
    this.minFilter = minFilter

    this.anisotropy = anisotropy

    this.format = format
    this.internalFormat = null
    this.type = type

    this.offset = new THREE.Vector2(0, 0)
    this.repeat = new THREE.Vector2(1, 1)
    this.center = new THREE.Vector2(0, 0)
    this.rotation = 0

    this.matrixAutoUpdate = true
    this.matrix = new THREE.Matrix3()

    this.generateMipmaps = true
    this.premultiplyAlpha = false
    this.flipY = true
    this.unpackAlignment = 4 // valid values: 1, 2, 4, 8 (see http://www.khronos.org/opengles/sdk/docs/man/xhtml/glPixelStorei.xml)

    // Values of encoding !== THREE.LinearEncoding only supported on map, envMap and emissiveMap.
    //
    // Also changing the encoding after already used by a Material will not automatically make the Material
    // update. You need to explicitly call Material.needsUpdate to trigger it to recompile.
    this.encoding = encoding

    this.userData = {}

    this.version = 0
    this.onUpdate = null

    this.isRenderTargetTexture = false // indicates whether a texture belongs to a render target or not
    this.needsPMREMUpdate = false // indicates whether this texture should be processed by PMREMGenerator or not (only relevant for render target textures)
  }

  get image() {
    return this.source.data
  }

  set image(value) {
    this.source.data = value
  }

  updateMatrix() {
    this.matrix.setUvTransform(
      this.offset.x,
      this.offset.y,
      this.repeat.x,
      this.repeat.y,
      this.rotation,
      this.center.x,
      this.center.y
    )
  }

  clone() {
    return new this.constructor().copy(this)
  }

  copy(source) {
    this.name = source.name

    this.source = source.source
    this.mipmaps = source.mipmaps.slice(0)

    this.mapping = source.mapping

    this.wrapS = source.wrapS
    this.wrapT = source.wrapT

    this.magFilter = source.magFilter
    this.minFilter = source.minFilter

    this.anisotropy = source.anisotropy

    this.format = source.format
    this.internalFormat = source.internalFormat
    this.type = source.type

    this.offset.copy(source.offset)
    this.repeat.copy(source.repeat)
    this.center.copy(source.center)
    this.rotation = source.rotation

    this.matrixAutoUpdate = source.matrixAutoUpdate
    this.matrix.copy(source.matrix)

    this.generateMipmaps = source.generateMipmaps
    this.premultiplyAlpha = source.premultiplyAlpha
    this.flipY = source.flipY
    this.unpackAlignment = source.unpackAlignment
    this.encoding = source.encoding

    this.userData = JSON.parse(JSON.stringify(source.userData))

    this.needsUpdate = true

    return this
  }

  toJSON(meta) {
    const isRootObject = meta === undefined || typeof meta === 'string'

    if (!isRootObject && meta.textures[this.uuid] !== undefined) {
      return meta.textures[this.uuid]
    }

    const output = {
      metadata: {
        version: 4.5,
        type: 'Texture',
        generator: 'Texture.toJSON'
      },

      uuid: this.uuid,
      name: this.name,

      image: this.source.toJSON(meta).uuid,

      mapping: this.mapping,

      repeat: [this.repeat.x, this.repeat.y],
      offset: [this.offset.x, this.offset.y],
      center: [this.center.x, this.center.y],
      rotation: this.rotation,

      wrap: [this.wrapS, this.wrapT],

      format: this.format,
      type: this.type,
      encoding: this.encoding,

      minFilter: this.minFilter,
      magFilter: this.magFilter,
      anisotropy: this.anisotropy,

      flipY: this.flipY,

      generateMipmaps: this.generateMipmaps,
      premultiplyAlpha: this.premultiplyAlpha,
      unpackAlignment: this.unpackAlignment
    }

    if (Object.keys(this.userData).length > 0) output.userData = this.userData

    if (!isRootObject) {
      meta.textures[this.uuid] = output
    }

    return output
  }

  dispose() {
    this.dispatchEvent({type: 'dispose'})
  }

  transformUv(uv) {
    if (this.mapping !== THREE.UVMapping) return uv

    uv.applyMatrix3(this.matrix)

    if (uv.x < 0 || uv.x > 1) {
      switch (this.wrapS) {
        case THREE.RepeatWrapping:
          uv.x = uv.x - Math.floor(uv.x)
          break

        case THREE.ClampToEdgeWrapping:
          uv.x = uv.x < 0 ? 0 : 1
          break

        case THREE.MirroredRepeatWrapping:
          if (Math.abs(Math.floor(uv.x) % 2) === 1) {
            uv.x = Math.ceil(uv.x) - uv.x
          } else {
            uv.x = uv.x - Math.floor(uv.x)
          }

          break
      }
    }

    if (uv.y < 0 || uv.y > 1) {
      switch (this.wrapT) {
        case THREE.RepeatWrapping:
          uv.y = uv.y - Math.floor(uv.y)
          break

        case THREE.ClampToEdgeWrapping:
          uv.y = uv.y < 0 ? 0 : 1
          break

        case THREE.MirroredRepeatWrapping:
          if (Math.abs(Math.floor(uv.y) % 2) === 1) {
            uv.y = Math.ceil(uv.y) - uv.y
          } else {
            uv.y = uv.y - Math.floor(uv.y)
          }

          break
      }
    }

    if (this.flipY) {
      uv.y = 1 - uv.y
    }

    return uv
  }

  set needsUpdate(value) {
    if (value === true) {
      this.version++
      this.source.needsUpdate = true
    }
  }
}

Texture.DEFAULT_IMAGE = null
Texture.DEFAULT_MAPPING = THREE.UVMapping
Texture.DEFAULT_ANISOTROPY = 1

export {Texture}
