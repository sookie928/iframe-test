/* eslint-disable no-useless-escape */
/* eslint-disable prefer-const */
/* eslint-disable no-var */
// @ts-nocheck
//===============================================================================================================================================================================
// import all
import {
  AnimationClip,
  Bone,
  Box3,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  ClampToEdgeWrapping,
  Color,
  CompressedTexture,
  CylinderGeometry,
  DataTextureLoader,
  DefaultLoadingManager,
  DirectionalLight,
  DoubleSide,
  EquirectangularReflectionMapping,
  Euler,
  EventDispatcher,
  FileLoader,
  Float32BufferAttribute,
  FloatType,
  FrontSide,
  Group,
  HalfFloatType,
  ImageBitmapLoader,
  InstancedBufferAttribute,
  InterleavedBuffer,
  InterleavedBufferAttribute,
  Interpolant,
  InterpolateDiscrete,
  InterpolateLinear,
  Line,
  LinearEncoding,
  LinearFilter,
  LinearMipmapLinearFilter,
  LinearMipmapNearestFilter,
  LineBasicMaterial,
  LineLoop,
  LineSegments,
  Loader,
  LoaderUtils,
  Material,
  MathUtils,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  MirroredRepeatWrapping,
  MOUSE,
  NearestFilter,
  NearestMipmapLinearFilter,
  NearestMipmapNearestFilter,
  NumberKeyframeTrack,
  Object3D,
  OctahedronGeometry,
  OrthographicCamera,
  PerspectiveCamera,
  Plane,
  PlaneGeometry,
  PointLight,
  Points,
  PointsMaterial,
  PropertyBinding,
  Quaternion,
  QuaternionKeyframeTrack,
  Raycaster,
  RepeatWrapping,
  RGB_ETC1_Format,
  RGB_ETC2_Format,
  RGB_PVRTC_4BPPV1_Format,
  RGB_S3TC_DXT1_Format,
  RGBA_ASTC_4x4_Format,
  RGBA_BPTC_Format,
  RGBA_ETC2_EAC_Format,
  RGBA_PVRTC_4BPPV1_Format,
  RGBA_S3TC_DXT5_Format,
  RGBAFormat,
  Skeleton,
  SkinnedMesh,
  Sphere,
  SphereGeometry,
  Spherical,
  SpotLight,
  sRGBEncoding,
  Texture,
  TextureLoader,
  TorusGeometry,
  TOUCH,
  TriangleFanDrawMode,
  TriangleStripDrawMode,
  UnsignedByteType,
  Vector2,
  Vector3,
  VectorKeyframeTrack
} from 'three'

import {WorkerPool} from '../utils/WorkerPool.js'
import {toHalfFloat} from './DataUtils'

//===============================================================================================================================================================================
// GLTFExporter
class GLTFExporter {
  constructor() {
    this.pluginCallbacks = []

    this.register(function (writer) {
      return new GLTFLightExtension(writer)
    })

    this.register(function (writer) {
      return new GLTFMaterialsUnlitExtension(writer)
    })

    this.register(function (writer) {
      return new GLTFMaterialsTransmissionExtension(writer)
    })

    this.register(function (writer) {
      return new GLTFMaterialsVolumeExtension(writer)
    })

    this.register(function (writer) {
      return new GLTFMaterialsClearcoatExtension(writer)
    })

    this.register(function (writer) {
      return new GLTFMaterialsIridescenceExtension(writer)
    })
  }

  register(callback) {
    if (this.pluginCallbacks.indexOf(callback) === -1) {
      this.pluginCallbacks.push(callback)
    }

    return this
  }

  unregister(callback) {
    if (this.pluginCallbacks.indexOf(callback) !== -1) {
      this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(callback), 1)
    }

    return this
  }

  /**
   * Parse scenes and generate GLTF output
   * @param  {Scene or [THREE.Scenes]} input   Scene or Array of THREE.Scenes
   * @param  {Function} onDone  Callback on completed
   * @param  {Function} onError  Callback on errors
   * @param  {Object} options options
   */
  parse(input, onDone, onError, options) {
    const writer = new GLTFWriter()
    const plugins = []

    for (let i = 0, il = this.pluginCallbacks.length; i < il; i++) {
      plugins.push(this.pluginCallbacks[i](writer))
    }

    writer.setPlugins(plugins)
    writer.write(input, onDone, options).catch(onError)
  }

  parseAsync(input, options) {
    const scope = this

    return new Promise(function (resolve, reject) {
      scope.parse(input, resolve, reject, options)
    })
  }
}

//------------------------------------------------------------------------------
// Constants
//------------------------------------------------------------------------------

const WEBGL_CONSTANTS = {
  POINTS: 0x0000,
  LINES: 0x0001,
  LINE_LOOP: 0x0002,
  LINE_STRIP: 0x0003,
  TRIANGLES: 0x0004,
  TRIANGLE_STRIP: 0x0005,
  TRIANGLE_FAN: 0x0006,

  UNSIGNED_BYTE: 0x1401,
  UNSIGNED_SHORT: 0x1403,
  FLOAT: 0x1406,
  UNSIGNED_INT: 0x1405,
  ARRAY_BUFFER: 0x8892,
  ELEMENT_ARRAY_BUFFER: 0x8893,

  NEAREST: 0x2600,
  LINEAR: 0x2601,
  NEAREST_MIPMAP_NEAREST: 0x2700,
  LINEAR_MIPMAP_NEAREST: 0x2701,
  NEAREST_MIPMAP_LINEAR: 0x2702,
  LINEAR_MIPMAP_LINEAR: 0x2703,

  CLAMP_TO_EDGE: 33071,
  MIRRORED_REPEAT: 33648,
  REPEAT: 10497
}

const THREE_TO_WEBGL = {}

THREE_TO_WEBGL[NearestFilter] = WEBGL_CONSTANTS.NEAREST
THREE_TO_WEBGL[NearestMipmapNearestFilter] =
  WEBGL_CONSTANTS.NEAREST_MIPMAP_NEAREST
THREE_TO_WEBGL[NearestMipmapLinearFilter] =
  WEBGL_CONSTANTS.NEAREST_MIPMAP_LINEAR
THREE_TO_WEBGL[LinearFilter] = WEBGL_CONSTANTS.LINEAR
THREE_TO_WEBGL[LinearMipmapNearestFilter] =
  WEBGL_CONSTANTS.LINEAR_MIPMAP_NEAREST
THREE_TO_WEBGL[LinearMipmapLinearFilter] = WEBGL_CONSTANTS.LINEAR_MIPMAP_LINEAR

THREE_TO_WEBGL[ClampToEdgeWrapping] = WEBGL_CONSTANTS.CLAMP_TO_EDGE
THREE_TO_WEBGL[RepeatWrapping] = WEBGL_CONSTANTS.REPEAT
THREE_TO_WEBGL[MirroredRepeatWrapping] = WEBGL_CONSTANTS.MIRRORED_REPEAT

const PATH_PROPERTIES = {
  scale: 'scale',
  position: 'translation',
  quaternion: 'rotation',
  morphTargetInfluences: 'weights'
}

// GLB constants
// https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#glb-file-format-specification

const GLB_HEADER_BYTES = 12
const GLB_HEADER_MAGIC = 0x46546c67
const GLB_VERSION = 2

const GLB_CHUNK_PREFIX_BYTES = 8
const GLB_CHUNK_TYPE_JSON = 0x4e4f534a
const GLB_CHUNK_TYPE_BIN = 0x004e4942

//------------------------------------------------------------------------------
// Utility functions
//------------------------------------------------------------------------------

/**
 * Compare two arrays
 * @param  {Array} array1 Array 1 to compare
 * @param  {Array} array2 Array 2 to compare
 * @return {Boolean}        Returns true if both arrays are equal
 */
function equalArray(array1, array2) {
  return (
    array1.length === array2.length &&
    array1.every(function (element, index) {
      return element === array2[index]
    })
  )
}

/**
 * Converts a string to an ArrayBuffer.
 * @param  {string} text
 * @return {ArrayBuffer}
 */
function stringToArrayBuffer(text) {
  return new TextEncoder().encode(text).buffer
}

/**
 * Is identity matrix
 *
 * @param {Matrix4} matrix
 * @returns {Boolean} Returns true, if parameter is identity matrix
 */
function isIdentityMatrix(matrix) {
  return equalArray(
    matrix.elements,
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
  )
}

/**
 * Get the min and max vectors from the given attribute
 * @param  {BufferAttribute} attribute Attribute to find the min/max in range from start to start + count
 * @param  {Integer} start
 * @param  {Integer} count
 * @return {Object} Object containing the `min` and `max` values (As an array of attribute.itemSize components)
 */
function getMinMax(attribute, start, count) {
  const output = {
    min: new Array(attribute.itemSize).fill(Number.POSITIVE_INFINITY),
    max: new Array(attribute.itemSize).fill(Number.NEGATIVE_INFINITY)
  }

  for (let i = start; i < start + count; i++) {
    for (let a = 0; a < attribute.itemSize; a++) {
      let value

      if (attribute.itemSize > 4) {
        // no support for interleaved data for itemSize > 4

        value = attribute.array[i * attribute.itemSize + a]
      } else {
        if (a === 0) value = attribute.getX(i)
        else if (a === 1) value = attribute.getY(i)
        else if (a === 2) value = attribute.getZ(i)
        else if (a === 3) value = attribute.getW(i)

        if (attribute.normalized === true) {
          value = MathUtils.normalize(value, attribute.array)
        }
      }

      output.min[a] = Math.min(output.min[a], value)
      output.max[a] = Math.max(output.max[a], value)
    }
  }

  return output
}

/**
 * Get the required size + padding for a buffer, rounded to the next 4-byte boundary.
 * https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#data-alignment
 *
 * @param {Integer} bufferSize The size the original buffer.
 * @returns {Integer} new buffer size with required padding.
 *
 */
function getPaddedBufferSize(bufferSize) {
  return Math.ceil(bufferSize / 4) * 4
}

/**
 * Returns a buffer aligned to 4-byte boundary.
 *
 * @param {ArrayBuffer} arrayBuffer Buffer to pad
 * @param {Integer} paddingByte (Optional)
 * @returns {ArrayBuffer} The same buffer if it's already aligned to 4-byte boundary or a new buffer
 */
function getPaddedArrayBuffer(arrayBuffer, paddingByte = 0) {
  const paddedLength = getPaddedBufferSize(arrayBuffer.byteLength)

  if (paddedLength !== arrayBuffer.byteLength) {
    const array = new Uint8Array(paddedLength)
    array.set(new Uint8Array(arrayBuffer))

    if (paddingByte !== 0) {
      for (let i = arrayBuffer.byteLength; i < paddedLength; i++) {
        array[i] = paddingByte
      }
    }

    return array.buffer
  }

  return arrayBuffer
}

function getCanvas() {
  if (
    typeof document === 'undefined' &&
    typeof OffscreenCanvas !== 'undefined'
  ) {
    return new OffscreenCanvas(1, 1)
  }

  return document.createElement('canvas')
}

function getToBlobPromise(canvas, mimeType) {
  if (canvas.toBlob !== undefined) {
    return new Promise((resolve) => canvas.toBlob(resolve, mimeType))
  }

  let quality

  // Blink's implementation of convertToBlob seems to default to a quality level of 100%
  // Use the Blink default quality levels of toBlob instead so that file sizes are comparable.
  if (mimeType === 'image/jpeg') {
    quality = 0.92
  } else if (mimeType === 'image/webp') {
    quality = 0.8
  }

  return canvas.convertToBlob({
    type: mimeType,
    quality: quality
  })
}

/**
 * Writer
 */
class GLTFWriter {
  constructor() {
    this.plugins = []

    this.options = {}
    this.pending = []
    this.buffers = []

    this.byteOffset = 0
    this.buffers = []
    this.nodeMap = new Map()
    this.skins = []
    this.extensionsUsed = {}

    this.uids = new Map()
    this.uid = 0

    this.json = {
      asset: {
        version: '2.0',
        generator: 'THREE.GLTFExporter'
      }
    }

    this.cache = {
      meshes: new Map(),
      attributes: new Map(),
      attributesNormalized: new Map(),
      materials: new Map(),
      textures: new Map(),
      images: new Map()
    }
  }

  setPlugins(plugins) {
    this.plugins = plugins
  }

  /**
   * Parse scenes and generate GLTF output
   * @param  {Scene or [THREE.Scenes]} input   Scene or Array of THREE.Scenes
   * @param  {Function} onDone  Callback on completed
   * @param  {Object} options options
   */
  async write(input, onDone, options = {}) {
    this.options = Object.assign(
      {
        // default options
        binary: false,
        trs: false,
        onlyVisible: true,
        maxTextureSize: Infinity,
        animations: [],
        includeCustomExtensions: false
      },
      options
    )

    if (this.options.animations.length > 0) {
      // Only TRS properties, and not matrices, may be targeted by animation.
      this.options.trs = true
    }

    this.processInput(input)

    await Promise.all(this.pending)

    const writer = this
    const buffers = writer.buffers
    const json = writer.json
    options = writer.options
    const extensionsUsed = writer.extensionsUsed

    // Merge buffers.
    const blob = new Blob(buffers, {type: 'application/octet-stream'})

    // Declare extensions.
    const extensionsUsedList = Object.keys(extensionsUsed)

    if (extensionsUsedList.length > 0) json.extensionsUsed = extensionsUsedList

    // Update bytelength of the single buffer.
    if (json.buffers && json.buffers.length > 0)
      json.buffers[0].byteLength = blob.size

    if (options.binary === true) {
      // https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#glb-file-format-specification

      const reader = new FileReader()
      reader.readAsArrayBuffer(blob)
      reader.onloadend = function () {
        // Binary chunk.
        const binaryChunk = getPaddedArrayBuffer(reader.result)
        const binaryChunkPrefix = new DataView(
          new ArrayBuffer(GLB_CHUNK_PREFIX_BYTES)
        )
        binaryChunkPrefix.setUint32(0, binaryChunk.byteLength, true)
        binaryChunkPrefix.setUint32(4, GLB_CHUNK_TYPE_BIN, true)

        // JSON chunk.
        const jsonChunk = getPaddedArrayBuffer(
          stringToArrayBuffer(JSON.stringify(json)),
          0x20
        )
        const jsonChunkPrefix = new DataView(
          new ArrayBuffer(GLB_CHUNK_PREFIX_BYTES)
        )
        jsonChunkPrefix.setUint32(0, jsonChunk.byteLength, true)
        jsonChunkPrefix.setUint32(4, GLB_CHUNK_TYPE_JSON, true)

        // GLB header.
        const header = new ArrayBuffer(GLB_HEADER_BYTES)
        const headerView = new DataView(header)
        headerView.setUint32(0, GLB_HEADER_MAGIC, true)
        headerView.setUint32(4, GLB_VERSION, true)
        const totalByteLength =
          GLB_HEADER_BYTES +
          jsonChunkPrefix.byteLength +
          jsonChunk.byteLength +
          binaryChunkPrefix.byteLength +
          binaryChunk.byteLength
        headerView.setUint32(8, totalByteLength, true)

        const glbBlob = new Blob(
          [header, jsonChunkPrefix, jsonChunk, binaryChunkPrefix, binaryChunk],
          {type: 'application/octet-stream'}
        )

        const glbReader = new FileReader()
        glbReader.readAsArrayBuffer(glbBlob)
        glbReader.onloadend = function () {
          onDone(glbReader.result)
        }
      }
    } else {
      if (json.buffers && json.buffers.length > 0) {
        const reader = new FileReader()
        reader.readAsDataURL(blob)
        reader.onloadend = function () {
          const base64data = reader.result
          json.buffers[0].uri = base64data
          onDone(json)
        }
      } else {
        onDone(json)
      }
    }
  }

  /**
   * Serializes a userData.
   *
   * @param {THREE.Object3D|THREE.Material} object
   * @param {Object} objectDef
   */
  serializeUserData(object, objectDef) {
    if (Object.keys(object.userData).length === 0) return

    const options = this.options
    const extensionsUsed = this.extensionsUsed

    try {
      const json = JSON.parse(JSON.stringify(object.userData))

      if (options.includeCustomExtensions && json.gltfExtensions) {
        if (objectDef.extensions === undefined) objectDef.extensions = {}

        for (const extensionName in json.gltfExtensions) {
          objectDef.extensions[extensionName] =
            json.gltfExtensions[extensionName]
          extensionsUsed[extensionName] = true
        }

        delete json.gltfExtensions
      }

      if (Object.keys(json).length > 0) objectDef.extras = json
    } catch (error) {
      console.warn(
        "THREE.GLTFExporter: userData of '" +
          object.name +
          "' " +
          "won't be serialized because of JSON.stringify error - " +
          error.message
      )
    }
  }

  /**
   * Returns ids for buffer attributes.
   * @param  {Object} object
   * @return {Integer}
   */
  getUID(attribute, isRelativeCopy = false) {
    if (this.uids.has(attribute) === false) {
      const uids = new Map()

      uids.set(true, this.uid++)
      uids.set(false, this.uid++)

      this.uids.set(attribute, uids)
    }

    const uids = this.uids.get(attribute)

    return uids.get(isRelativeCopy)
  }

  /**
   * Checks if normal attribute values are normalized.
   *
   * @param {BufferAttribute} normal
   * @returns {Boolean}
   */
  isNormalizedNormalAttribute(normal) {
    const cache = this.cache

    if (cache.attributesNormalized.has(normal)) return false

    const v = new Vector3()

    for (let i = 0, il = normal.count; i < il; i++) {
      // 0.0005 is from glTF-validator
      if (Math.abs(v.fromBufferAttribute(normal, i).length() - 1.0) > 0.0005)
        return false
    }

    return true
  }

  /**
   * Creates normalized normal buffer attribute.
   *
   * @param {BufferAttribute} normal
   * @returns {BufferAttribute}
   *
   */
  createNormalizedNormalAttribute(normal) {
    const cache = this.cache

    if (cache.attributesNormalized.has(normal))
      return cache.attributesNormalized.get(normal)

    const attribute = normal.clone()
    const v = new Vector3()

    for (let i = 0, il = attribute.count; i < il; i++) {
      v.fromBufferAttribute(attribute, i)

      if (v.x === 0 && v.y === 0 && v.z === 0) {
        // if values can't be normalized set (1, 0, 0)
        v.setX(1.0)
      } else {
        v.normalize()
      }

      attribute.setXYZ(i, v.x, v.y, v.z)
    }

    cache.attributesNormalized.set(normal, attribute)

    return attribute
  }

  /**
   * Applies a texture transform, if present, to the map definition. Requires
   * the KHR_texture_transform extension.
   *
   * @param {Object} mapDef
   * @param {THREE.Texture} texture
   */
  applyTextureTransform(mapDef, texture) {
    let didTransform = false
    const transformDef = {}

    if (texture.offset.x !== 0 || texture.offset.y !== 0) {
      transformDef.offset = texture.offset.toArray()
      didTransform = true
    }

    if (texture.rotation !== 0) {
      transformDef.rotation = texture.rotation
      didTransform = true
    }

    if (texture.repeat.x !== 1 || texture.repeat.y !== 1) {
      transformDef.scale = texture.repeat.toArray()
      didTransform = true
    }

    if (didTransform) {
      mapDef.extensions = mapDef.extensions || {}
      mapDef.extensions['KHR_texture_transform'] = transformDef
      this.extensionsUsed['KHR_texture_transform'] = true
    }
  }

  buildMetalRoughTexture(metalnessMap, roughnessMap) {
    if (metalnessMap === roughnessMap) return metalnessMap

    function getEncodingConversion(map) {
      if (map.encoding === sRGBEncoding) {
        return function SRGBToLinear(c) {
          return c < 0.04045
            ? c * 0.0773993808
            : Math.pow(c * 0.9478672986 + 0.0521327014, 2.4)
        }
      }

      return function LinearToLinear(c) {
        return c
      }
    }

    console.warn(
      'THREE.GLTFExporter: Merged metalnessMap and roughnessMap textures.'
    )

    const metalness = metalnessMap?.image
    const roughness = roughnessMap?.image

    const width = Math.max(metalness?.width || 0, roughness?.width || 0)
    const height = Math.max(metalness?.height || 0, roughness?.height || 0)

    const canvas = getCanvas()
    canvas.width = width
    canvas.height = height

    const context = canvas.getContext('2d')
    context.fillStyle = '#00ffff'
    context.fillRect(0, 0, width, height)

    const composite = context.getImageData(0, 0, width, height)

    if (metalness) {
      context.drawImage(metalness, 0, 0, width, height)

      const convert = getEncodingConversion(metalnessMap)
      const data = context.getImageData(0, 0, width, height).data

      for (let i = 2; i < data.length; i += 4) {
        composite.data[i] = convert(data[i] / 256) * 256
      }
    }

    if (roughness) {
      context.drawImage(roughness, 0, 0, width, height)

      const convert = getEncodingConversion(roughnessMap)
      const data = context.getImageData(0, 0, width, height).data

      for (let i = 1; i < data.length; i += 4) {
        composite.data[i] = convert(data[i] / 256) * 256
      }
    }

    context.putImageData(composite, 0, 0)

    //

    const reference = metalnessMap || roughnessMap

    const texture = reference.clone()

    texture.source = new Source(canvas)
    texture.encoding = LinearEncoding

    return texture
  }

  /**
   * Process a buffer to append to the default one.
   * @param  {ArrayBuffer} buffer
   * @return {Integer}
   */
  processBuffer(buffer) {
    const json = this.json
    const buffers = this.buffers

    if (!json.buffers) json.buffers = [{byteLength: 0}]

    // All buffers are merged before export.
    buffers.push(buffer)

    return 0
  }

  /**
   * Process and generate a BufferView
   * @param  {BufferAttribute} attribute
   * @param  {number} componentType
   * @param  {number} start
   * @param  {number} count
   * @param  {number} target (Optional) Target usage of the BufferView
   * @return {Object}
   */
  processBufferView(attribute, componentType, start, count, target) {
    const json = this.json

    if (!json.bufferViews) json.bufferViews = []

    // Create a new dataview and dump the attribute's array into it

    let componentSize

    if (componentType === WEBGL_CONSTANTS.UNSIGNED_BYTE) {
      componentSize = 1
    } else if (componentType === WEBGL_CONSTANTS.UNSIGNED_SHORT) {
      componentSize = 2
    } else {
      componentSize = 4
    }

    const byteLength = getPaddedBufferSize(
      count * attribute.itemSize * componentSize
    )
    const dataView = new DataView(new ArrayBuffer(byteLength))
    let offset = 0

    for (let i = start; i < start + count; i++) {
      for (let a = 0; a < attribute.itemSize; a++) {
        let value

        if (attribute.itemSize > 4) {
          // no support for interleaved data for itemSize > 4

          value = attribute.array[i * attribute.itemSize + a]
        } else {
          if (a === 0) value = attribute.getX(i)
          else if (a === 1) value = attribute.getY(i)
          else if (a === 2) value = attribute.getZ(i)
          else if (a === 3) value = attribute.getW(i)

          if (attribute.normalized === true) {
            value = MathUtils.normalize(value, attribute.array)
          }
        }

        if (componentType === WEBGL_CONSTANTS.FLOAT) {
          dataView.setFloat32(offset, value, true)
        } else if (componentType === WEBGL_CONSTANTS.UNSIGNED_INT) {
          dataView.setUint32(offset, value, true)
        } else if (componentType === WEBGL_CONSTANTS.UNSIGNED_SHORT) {
          dataView.setUint16(offset, value, true)
        } else if (componentType === WEBGL_CONSTANTS.UNSIGNED_BYTE) {
          dataView.setUint8(offset, value)
        }

        offset += componentSize
      }
    }

    const bufferViewDef = {
      buffer: this.processBuffer(dataView.buffer),
      byteOffset: this.byteOffset,
      byteLength: byteLength
    }

    if (target !== undefined) bufferViewDef.target = target

    if (target === WEBGL_CONSTANTS.ARRAY_BUFFER) {
      // Only define byteStride for vertex attributes.
      bufferViewDef.byteStride = attribute.itemSize * componentSize
    }

    this.byteOffset += byteLength

    json.bufferViews.push(bufferViewDef)

    // @TODO Merge bufferViews where possible.
    const output = {
      id: json.bufferViews.length - 1,
      byteLength: 0
    }

    return output
  }

  /**
   * Process and generate a BufferView from an image Blob.
   * @param {Blob} blob
   * @return {Promise<Integer>}
   */
  processBufferViewImage(blob) {
    const writer = this
    const json = writer.json

    if (!json.bufferViews) json.bufferViews = []

    return new Promise(function (resolve) {
      const reader = new FileReader()
      reader.readAsArrayBuffer(blob)
      reader.onloadend = function () {
        const buffer = getPaddedArrayBuffer(reader.result)

        const bufferViewDef = {
          buffer: writer.processBuffer(buffer),
          byteOffset: writer.byteOffset,
          byteLength: buffer.byteLength
        }

        writer.byteOffset += buffer.byteLength
        resolve(json.bufferViews.push(bufferViewDef) - 1)
      }
    })
  }

  /**
   * Process attribute to generate an accessor
   * @param  {BufferAttribute} attribute Attribute to process
   * @param  {THREE.BufferGeometry} geometry (Optional) Geometry used for truncated draw range
   * @param  {Integer} start (Optional)
   * @param  {Integer} count (Optional)
   * @return {Integer|null} Index of the processed accessor on the "accessors" array
   */
  processAccessor(attribute, geometry, start, count) {
    const json = this.json

    const types = {
      1: 'SCALAR',
      2: 'VEC2',
      3: 'VEC3',
      4: 'VEC4',
      16: 'MAT4'
    }

    let componentType

    // Detect the component type of the attribute array (float, uint or ushort)
    if (attribute.array.constructor === Float32Array) {
      componentType = WEBGL_CONSTANTS.FLOAT
    } else if (attribute.array.constructor === Uint32Array) {
      componentType = WEBGL_CONSTANTS.UNSIGNED_INT
    } else if (attribute.array.constructor === Uint16Array) {
      componentType = WEBGL_CONSTANTS.UNSIGNED_SHORT
    } else if (attribute.array.constructor === Uint8Array) {
      componentType = WEBGL_CONSTANTS.UNSIGNED_BYTE
    } else {
      throw new Error(
        'THREE.GLTFExporter: Unsupported bufferAttribute component type.'
      )
    }

    if (start === undefined) start = 0
    if (count === undefined) count = attribute.count

    // Skip creating an accessor if the attribute doesn't have data to export
    if (count === 0) return null

    const minMax = getMinMax(attribute, start, count)
    let bufferViewTarget

    // If geometry isn't provided, don't infer the target usage of the bufferView. For
    // animation samplers, target must not be set.
    if (geometry !== undefined) {
      bufferViewTarget =
        attribute === geometry.index
          ? WEBGL_CONSTANTS.ELEMENT_ARRAY_BUFFER
          : WEBGL_CONSTANTS.ARRAY_BUFFER
    }

    const bufferView = this.processBufferView(
      attribute,
      componentType,
      start,
      count,
      bufferViewTarget
    )

    const accessorDef = {
      bufferView: bufferView.id,
      byteOffset: bufferView.byteOffset,
      componentType: componentType,
      count: count,
      max: minMax.max,
      min: minMax.min,
      type: types[attribute.itemSize]
    }

    if (attribute.normalized === true) accessorDef.normalized = true
    if (!json.accessors) json.accessors = []

    return json.accessors.push(accessorDef) - 1
  }

  /**
   * Process image
   * @param  {Image} image to process
   * @param  {Integer} format of the image (RGBAFormat)
   * @param  {Boolean} flipY before writing out the image
   * @param  {String} mimeType export format
   * @return {Integer}     Index of the processed texture in the "images" array
   */
  processImage(image, format, flipY, mimeType = 'image/png') {
    if (image !== null) {
      const writer = this
      const cache = writer.cache
      const json = writer.json
      const options = writer.options
      const pending = writer.pending

      if (!cache.images.has(image)) cache.images.set(image, {})

      const cachedImages = cache.images.get(image)

      const key = mimeType + ':flipY/' + flipY.toString()

      if (cachedImages[key] !== undefined) return cachedImages[key]

      if (!json.images) json.images = []

      const imageDef = {mimeType: mimeType}

      const canvas = getCanvas()

      canvas.width = Math.min(image.width, options.maxTextureSize)
      canvas.height = Math.min(image.height, options.maxTextureSize)

      const ctx = canvas.getContext('2d')

      if (flipY === true) {
        ctx.translate(0, canvas.height)
        ctx.scale(1, -1)
      }

      if (image.data !== undefined) {
        // THREE.DataTexture

        if (format !== RGBAFormat) {
          console.error('GLTFExporter: Only RGBAFormat is supported.')
        }

        if (
          image.width > options.maxTextureSize ||
          image.height > options.maxTextureSize
        ) {
          console.warn(
            'GLTFExporter: Image size is bigger than maxTextureSize',
            image
          )
        }

        const data = new Uint8ClampedArray(image.height * image.width * 4)

        for (let i = 0; i < data.length; i += 4) {
          data[i + 0] = image.data[i + 0]
          data[i + 1] = image.data[i + 1]
          data[i + 2] = image.data[i + 2]
          data[i + 3] = image.data[i + 3]
        }

        ctx.putImageData(new ImageData(data, image.width, image.height), 0, 0)
      } else {
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
      }

      if (options.binary === true) {
        pending.push(
          getToBlobPromise(canvas, mimeType)
            .then((blob) => writer.processBufferViewImage(blob))
            .then((bufferViewIndex) => {
              imageDef.bufferView = bufferViewIndex
            })
        )
      } else {
        if (canvas.toDataURL !== undefined) {
          imageDef.uri = canvas.toDataURL(mimeType)
        } else {
          pending.push(
            getToBlobPromise(canvas, mimeType)
              .then((blob) => new FileReader().readAsDataURL(blob))
              .then((dataURL) => {
                imageDef.uri = dataURL
              })
          )
        }
      }

      const index = json.images.push(imageDef) - 1
      cachedImages[key] = index
      return index
    } else {
      throw new Error(
        'THREE.GLTFExporter: No valid image data found. Unable to process texture.'
      )
    }
  }

  /**
   * Process sampler
   * @param  {Texture} map Texture to process
   * @return {Integer}     Index of the processed texture in the "samplers" array
   */
  processSampler(map) {
    const json = this.json

    if (!json.samplers) json.samplers = []

    const samplerDef = {
      magFilter: THREE_TO_WEBGL[map.magFilter],
      minFilter: THREE_TO_WEBGL[map.minFilter],
      wrapS: THREE_TO_WEBGL[map.wrapS],
      wrapT: THREE_TO_WEBGL[map.wrapT]
    }

    return json.samplers.push(samplerDef) - 1
  }

  /**
   * Process texture
   * @param  {Texture} map Map to process
   * @return {Integer} Index of the processed texture in the "textures" array
   */
  processTexture(map) {
    const cache = this.cache
    const json = this.json

    if (cache.textures.has(map)) return cache.textures.get(map)

    if (!json.textures) json.textures = []

    let mimeType = map.userData.mimeType

    if (mimeType === 'image/webp') mimeType = 'image/png'

    const textureDef = {
      sampler: this.processSampler(map),
      source: this.processImage(map.image, map.format, map.flipY, mimeType)
    }

    if (map.name) textureDef.name = map.name

    this._invokeAll(function (ext) {
      ext.writeTexture && ext.writeTexture(map, textureDef)
    })

    const index = json.textures.push(textureDef) - 1
    cache.textures.set(map, index)
    return index
  }

  /**
   * Process material
   * @param  {THREE.Material} material Material to process
   * @return {Integer|null} Index of the processed material in the "materials" array
   */
  processMaterial(material) {
    const cache = this.cache
    const json = this.json

    if (cache.materials.has(material)) return cache.materials.get(material)

    if (material.isShaderMaterial) {
      console.warn('GLTFExporter: THREE.ShaderMaterial not supported.')
      return null
    }

    if (!json.materials) json.materials = []

    // @QUESTION Should we avoid including any attribute that has the default value?
    const materialDef = {pbrMetallicRoughness: {}}

    if (
      material.isMeshStandardMaterial !== true &&
      material.isMeshBasicMaterial !== true
    ) {
      console.warn(
        'GLTFExporter: Use MeshStandardMaterial or MeshBasicMaterial for best results.'
      )
    }

    // pbrMetallicRoughness.baseColorFactor
    const color = material.color.toArray().concat([material.opacity])

    if (!equalArray(color, [1, 1, 1, 1])) {
      materialDef.pbrMetallicRoughness.baseColorFactor = color
    }

    if (material.isMeshStandardMaterial) {
      materialDef.pbrMetallicRoughness.metallicFactor = material.metalness
      materialDef.pbrMetallicRoughness.roughnessFactor = material.roughness
    } else {
      materialDef.pbrMetallicRoughness.metallicFactor = 0.5
      materialDef.pbrMetallicRoughness.roughnessFactor = 0.5
    }

    // pbrMetallicRoughness.metallicRoughnessTexture
    if (material.metalnessMap || material.roughnessMap) {
      const metalRoughTexture = this.buildMetalRoughTexture(
        material.metalnessMap,
        material.roughnessMap
      )

      const metalRoughMapDef = {index: this.processTexture(metalRoughTexture)}
      this.applyTextureTransform(metalRoughMapDef, metalRoughTexture)
      materialDef.pbrMetallicRoughness.metallicRoughnessTexture =
        metalRoughMapDef
    }

    // pbrMetallicRoughness.baseColorTexture or pbrSpecularGlossiness diffuseTexture
    if (material.map) {
      const baseColorMapDef = {index: this.processTexture(material.map)}
      this.applyTextureTransform(baseColorMapDef, material.map)
      materialDef.pbrMetallicRoughness.baseColorTexture = baseColorMapDef
    }

    if (material.emissive) {
      // note: emissive components are limited to stay within the 0 - 1 range to accommodate glTF spec. see #21849 and #22000.
      const emissive = material.emissive
        .clone()
        .multiplyScalar(material.emissiveIntensity)
      const maxEmissiveComponent = Math.max(emissive.r, emissive.g, emissive.b)

      if (maxEmissiveComponent > 1) {
        emissive.multiplyScalar(1 / maxEmissiveComponent)

        console.warn(
          'THREE.GLTFExporter: Some emissive components exceed 1; emissive has been limited'
        )
      }

      if (maxEmissiveComponent > 0) {
        materialDef.emissiveFactor = emissive.toArray()
      }

      // emissiveTexture
      if (material.emissiveMap) {
        const emissiveMapDef = {
          index: this.processTexture(material.emissiveMap)
        }
        this.applyTextureTransform(emissiveMapDef, material.emissiveMap)
        materialDef.emissiveTexture = emissiveMapDef
      }
    }

    // normalTexture
    if (material.normalMap) {
      const normalMapDef = {index: this.processTexture(material.normalMap)}

      if (material.normalScale && material.normalScale.x !== 1) {
        // glTF normal scale is univariate. Ignore `y`, which may be flipped.
        // Context: https://github.com/mrdoob/three.js/issues/11438#issuecomment-507003995
        normalMapDef.scale = material.normalScale.x
      }

      this.applyTextureTransform(normalMapDef, material.normalMap)
      materialDef.normalTexture = normalMapDef
    }

    // occlusionTexture
    if (material.aoMap) {
      const occlusionMapDef = {
        index: this.processTexture(material.aoMap),
        texCoord: 1
      }

      if (material.aoMapIntensity !== 1.0) {
        occlusionMapDef.strength = material.aoMapIntensity
      }

      this.applyTextureTransform(occlusionMapDef, material.aoMap)
      materialDef.occlusionTexture = occlusionMapDef
    }

    // alphaMode
    if (material.transparent) {
      materialDef.alphaMode = 'BLEND'
    } else {
      if (material.alphaTest > 0.0) {
        materialDef.alphaMode = 'MASK'
        materialDef.alphaCutoff = material.alphaTest
      }
    }

    // doubleSided
    if (material.side === DoubleSide) materialDef.doubleSided = true
    if (material.name !== '') materialDef.name = material.name

    this.serializeUserData(material, materialDef)

    this._invokeAll(function (ext) {
      ext.writeMaterial && ext.writeMaterial(material, materialDef)
    })

    const index = json.materials.push(materialDef) - 1
    cache.materials.set(material, index)
    return index
  }

  /**
   * Process mesh
   * @param  {THREE.Mesh} mesh Mesh to process
   * @return {Integer|null} Index of the processed mesh in the "meshes" array
   */
  processMesh(mesh) {
    const cache = this.cache
    const json = this.json

    const meshCacheKeyParts = [mesh.geometry.uuid]

    if (Array.isArray(mesh.material)) {
      for (let i = 0, l = mesh.material.length; i < l; i++) {
        meshCacheKeyParts.push(mesh.material[i].uuid)
      }
    } else {
      meshCacheKeyParts.push(mesh.material.uuid)
    }

    const meshCacheKey = meshCacheKeyParts.join(':')

    if (cache.meshes.has(meshCacheKey)) return cache.meshes.get(meshCacheKey)

    const geometry = mesh.geometry

    let mode

    // Use the correct mode
    if (mesh.isLineSegments) {
      mode = WEBGL_CONSTANTS.LINES
    } else if (mesh.isLineLoop) {
      mode = WEBGL_CONSTANTS.LINE_LOOP
    } else if (mesh.isLine) {
      mode = WEBGL_CONSTANTS.LINE_STRIP
    } else if (mesh.isPoints) {
      mode = WEBGL_CONSTANTS.POINTS
    } else {
      mode = mesh.material.wireframe
        ? WEBGL_CONSTANTS.LINES
        : WEBGL_CONSTANTS.TRIANGLES
    }

    const meshDef = {}
    const attributes = {}
    const primitives = []
    const targets = []

    // Conversion between attributes names in threejs and gltf spec
    const nameConversion = {
      uv: 'TEXCOORD_0',
      uv2: 'TEXCOORD_1',
      color: 'COLOR_0',
      skinWeight: 'WEIGHTS_0',
      skinIndex: 'JOINTS_0'
    }

    const originalNormal = geometry.getAttribute('normal')

    if (
      originalNormal !== undefined &&
      !this.isNormalizedNormalAttribute(originalNormal)
    ) {
      console.warn(
        'THREE.GLTFExporter: Creating normalized normal attribute from the non-normalized one.'
      )

      geometry.setAttribute(
        'normal',
        this.createNormalizedNormalAttribute(originalNormal)
      )
    }

    // @QUESTION Detect if .vertexColors = true?
    // For every attribute create an accessor
    let modifiedAttribute = null

    for (let attributeName in geometry.attributes) {
      // Ignore morph target attributes, which are exported later.
      if (attributeName.slice(0, 5) === 'morph') continue

      const attribute = geometry.attributes[attributeName]
      attributeName =
        nameConversion[attributeName] || attributeName.toUpperCase()

      // Prefix all geometry attributes except the ones specifically
      // listed in the spec; non-spec attributes are considered custom.
      const validVertexAttributes =
        /^(POSITION|NORMAL|TANGENT|TEXCOORD_\d+|COLOR_\d+|JOINTS_\d+|WEIGHTS_\d+)$/

      if (!validVertexAttributes.test(attributeName))
        attributeName = '_' + attributeName

      if (cache.attributes.has(this.getUID(attribute))) {
        attributes[attributeName] = cache.attributes.get(this.getUID(attribute))
        continue
      }

      // JOINTS_0 must be UNSIGNED_BYTE or UNSIGNED_SHORT.
      modifiedAttribute = null
      const array = attribute.array

      if (
        attributeName === 'JOINTS_0' &&
        !(array instanceof Uint16Array) &&
        !(array instanceof Uint8Array)
      ) {
        console.warn(
          'GLTFExporter: Attribute "skinIndex" converted to type UNSIGNED_SHORT.'
        )
        modifiedAttribute = new BufferAttribute(
          new Uint16Array(array),
          attribute.itemSize,
          attribute.normalized
        )
      }

      const accessor = this.processAccessor(
        modifiedAttribute || attribute,
        geometry
      )

      if (accessor !== null) {
        attributes[attributeName] = accessor
        cache.attributes.set(this.getUID(attribute), accessor)
      }
    }

    if (originalNormal !== undefined)
      geometry.setAttribute('normal', originalNormal)

    // Skip if no exportable attributes found
    if (Object.keys(attributes).length === 0) return null

    // Morph targets
    if (
      mesh.morphTargetInfluences !== undefined &&
      mesh.morphTargetInfluences.length > 0
    ) {
      const weights = []
      const targetNames = []
      const reverseDictionary = {}

      if (mesh.morphTargetDictionary !== undefined) {
        for (const key in mesh.morphTargetDictionary) {
          reverseDictionary[mesh.morphTargetDictionary[key]] = key
        }
      }

      for (let i = 0; i < mesh.morphTargetInfluences.length; ++i) {
        const target = {}
        let warned = false

        for (const attributeName in geometry.morphAttributes) {
          // glTF 2.0 morph supports only POSITION/NORMAL/TANGENT.
          // Three.js doesn't support TANGENT yet.

          if (attributeName !== 'position' && attributeName !== 'normal') {
            if (!warned) {
              console.warn(
                'GLTFExporter: Only POSITION and NORMAL morph are supported.'
              )
              warned = true
            }

            continue
          }

          const attribute = geometry.morphAttributes[attributeName][i]
          const gltfAttributeName = attributeName.toUpperCase()

          // Three.js morph attribute has absolute values while the one of glTF has relative values.
          //
          // glTF 2.0 Specification:
          // https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#morph-targets

          const baseAttribute = geometry.attributes[attributeName]

          if (cache.attributes.has(this.getUID(attribute, true))) {
            target[gltfAttributeName] = cache.attributes.get(
              this.getUID(attribute, true)
            )
            continue
          }

          // Clones attribute not to override
          const relativeAttribute = attribute.clone()

          if (!geometry.morphTargetsRelative) {
            for (let j = 0, jl = attribute.count; j < jl; j++) {
              for (let a = 0; a < attribute.itemSize; a++) {
                if (a === 0)
                  relativeAttribute.setX(
                    j,
                    attribute.getX(j) - baseAttribute.getX(j)
                  )
                if (a === 1)
                  relativeAttribute.setY(
                    j,
                    attribute.getY(j) - baseAttribute.getY(j)
                  )
                if (a === 2)
                  relativeAttribute.setZ(
                    j,
                    attribute.getZ(j) - baseAttribute.getZ(j)
                  )
                if (a === 3)
                  relativeAttribute.setW(
                    j,
                    attribute.getW(j) - baseAttribute.getW(j)
                  )
              }
            }
          }

          target[gltfAttributeName] = this.processAccessor(
            relativeAttribute,
            geometry
          )
          cache.attributes.set(
            this.getUID(baseAttribute, true),
            target[gltfAttributeName]
          )
        }

        targets.push(target)

        weights.push(mesh.morphTargetInfluences[i])

        if (mesh.morphTargetDictionary !== undefined)
          targetNames.push(reverseDictionary[i])
      }

      meshDef.weights = weights

      if (targetNames.length > 0) {
        meshDef.extras = {}
        meshDef.extras.targetNames = targetNames
      }
    }

    const isMultiMaterial = Array.isArray(mesh.material)

    if (isMultiMaterial && geometry.groups.length === 0) return null

    const materials = isMultiMaterial ? mesh.material : [mesh.material]
    const groups = isMultiMaterial
      ? geometry.groups
      : [{materialIndex: 0, start: undefined, count: undefined}]

    for (let i = 0, il = groups.length; i < il; i++) {
      const primitive = {
        mode: mode,
        attributes: attributes
      }

      this.serializeUserData(geometry, primitive)

      if (targets.length > 0) primitive.targets = targets

      if (geometry.index !== null) {
        let cacheKey = this.getUID(geometry.index)

        if (groups[i].start !== undefined || groups[i].count !== undefined) {
          cacheKey += ':' + groups[i].start + ':' + groups[i].count
        }

        if (cache.attributes.has(cacheKey)) {
          primitive.indices = cache.attributes.get(cacheKey)
        } else {
          primitive.indices = this.processAccessor(
            geometry.index,
            geometry,
            groups[i].start,
            groups[i].count
          )
          cache.attributes.set(cacheKey, primitive.indices)
        }

        if (primitive.indices === null) delete primitive.indices
      }

      const material = this.processMaterial(materials[groups[i].materialIndex])

      if (material !== null) primitive.material = material

      primitives.push(primitive)
    }

    meshDef.primitives = primitives

    if (!json.meshes) json.meshes = []

    this._invokeAll(function (ext) {
      ext.writeMesh && ext.writeMesh(mesh, meshDef)
    })

    const index = json.meshes.push(meshDef) - 1
    cache.meshes.set(meshCacheKey, index)
    return index
  }

  /**
   * Process camera
   * @param  {THREE.Camera} camera Camera to process
   * @return {Integer}      Index of the processed mesh in the "camera" array
   */
  processCamera(camera) {
    const json = this.json

    if (!json.cameras) json.cameras = []

    const isOrtho = camera.isOrthographicCamera

    const cameraDef = {
      type: isOrtho ? 'orthographic' : 'perspective'
    }

    if (isOrtho) {
      cameraDef.orthographic = {
        xmag: camera.right * 2,
        ymag: camera.top * 2,
        zfar: camera.far <= 0 ? 0.001 : camera.far,
        znear: camera.near < 0 ? 0 : camera.near
      }
    } else {
      cameraDef.perspective = {
        aspectRatio: camera.aspect,
        yfov: MathUtils.degToRad(camera.fov),
        zfar: camera.far <= 0 ? 0.001 : camera.far,
        znear: camera.near < 0 ? 0 : camera.near
      }
    }

    // Question: Is saving "type" as name intentional?
    if (camera.name !== '') cameraDef.name = camera.type

    return json.cameras.push(cameraDef) - 1
  }

  /**
   * Creates glTF animation entry from AnimationClip object.
   *
   * Status:
   * - Only properties listed in PATH_PROPERTIES may be animated.
   *
   * @param {THREE.AnimationClip} clip
   * @param {THREE.Object3D} root
   * @return {number|null}
   */
  processAnimation(clip, root) {
    const json = this.json
    const nodeMap = this.nodeMap

    if (!json.animations) json.animations = []

    clip = GLTFExporter.Utils.mergeMorphTargetTracks(clip.clone(), root)

    const tracks = clip.tracks
    const channels = []
    const samplers = []

    for (let i = 0; i < tracks.length; ++i) {
      const track = tracks[i]
      const trackBinding = PropertyBinding.parseTrackName(track.name)
      let trackNode = PropertyBinding.findNode(root, trackBinding.nodeName)
      const trackProperty = PATH_PROPERTIES[trackBinding.propertyName]

      if (trackBinding.objectName === 'bones') {
        if (trackNode.isSkinnedMesh === true) {
          trackNode = trackNode.skeleton.getBoneByName(trackBinding.objectIndex)
        } else {
          trackNode = undefined
        }
      }

      if (!trackNode || !trackProperty) {
        console.warn(
          'THREE.GLTFExporter: Could not export animation track "%s".',
          track.name
        )
        return null
      }

      const inputItemSize = 1
      let outputItemSize = track.values.length / track.times.length

      if (trackProperty === PATH_PROPERTIES.morphTargetInfluences) {
        outputItemSize /= trackNode.morphTargetInfluences.length
      }

      let interpolation

      // @TODO export CubicInterpolant(InterpolateSmooth) as CUBICSPLINE

      // Detecting glTF cubic spline interpolant by checking factory method's special property
      // GLTFCubicSplineInterpolant is a custom interpolant and track doesn't return
      // valid value from .getInterpolation().
      if (
        track.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline ===
        true
      ) {
        interpolation = 'CUBICSPLINE'

        // itemSize of CUBICSPLINE keyframe is 9
        // (VEC3 * 3: inTangent, splineVertex, and outTangent)
        // but needs to be stored as VEC3 so dividing by 3 here.
        outputItemSize /= 3
      } else if (track.getInterpolation() === InterpolateDiscrete) {
        interpolation = 'STEP'
      } else {
        interpolation = 'LINEAR'
      }

      samplers.push({
        input: this.processAccessor(
          new BufferAttribute(track.times, inputItemSize)
        ),
        output: this.processAccessor(
          new BufferAttribute(track.values, outputItemSize)
        ),
        interpolation: interpolation
      })

      channels.push({
        sampler: samplers.length - 1,
        target: {
          node: nodeMap.get(trackNode),
          path: trackProperty
        }
      })
    }

    json.animations.push({
      name: clip.name || 'clip_' + json.animations.length,
      samplers: samplers,
      channels: channels
    })

    return json.animations.length - 1
  }

  /**
   * @param {THREE.Object3D} object
   * @return {number|null}
   */
  processSkin(object) {
    const json = this.json
    const nodeMap = this.nodeMap

    const node = json.nodes[nodeMap.get(object)]

    const skeleton = object.skeleton

    if (skeleton === undefined) return null

    const rootJoint = object.skeleton.bones[0]

    if (rootJoint === undefined) return null

    const joints = []
    const inverseBindMatrices = new Float32Array(skeleton.bones.length * 16)
    const temporaryBoneInverse = new Matrix4()

    for (let i = 0; i < skeleton.bones.length; ++i) {
      joints.push(nodeMap.get(skeleton.bones[i]))
      temporaryBoneInverse.copy(skeleton.boneInverses[i])
      temporaryBoneInverse
        .multiply(object.bindMatrix)
        .toArray(inverseBindMatrices, i * 16)
    }

    if (json.skins === undefined) json.skins = []

    json.skins.push({
      inverseBindMatrices: this.processAccessor(
        new BufferAttribute(inverseBindMatrices, 16)
      ),
      joints: joints,
      skeleton: nodeMap.get(rootJoint)
    })

    const skinIndex = (node.skin = json.skins.length - 1)

    return skinIndex
  }

  /**
   * Process Object3D node
   * @param  {THREE.Object3D} node Object3D to processNode
   * @return {Integer} Index of the node in the nodes list
   */
  processNode(object) {
    const json = this.json
    const options = this.options
    const nodeMap = this.nodeMap

    if (!json.nodes) json.nodes = []

    const nodeDef = {}

    if (options.trs) {
      const rotation = object.quaternion.toArray()
      const position = object.position.toArray()
      const scale = object.scale.toArray()

      if (!equalArray(rotation, [0, 0, 0, 1])) {
        nodeDef.rotation = rotation
      }

      if (!equalArray(position, [0, 0, 0])) {
        nodeDef.translation = position
      }

      if (!equalArray(scale, [1, 1, 1])) {
        nodeDef.scale = scale
      }
    } else {
      if (object.matrixAutoUpdate) {
        object.updateMatrix()
      }

      if (isIdentityMatrix(object.matrix) === false) {
        nodeDef.matrix = object.matrix.elements
      }
    }

    // We don't export empty strings name because it represents no-name in Three.js.
    if (object.name !== '') nodeDef.name = String(object.name)

    this.serializeUserData(object, nodeDef)

    if (object.isMesh || object.isLine || object.isPoints) {
      const meshIndex = this.processMesh(object)

      if (meshIndex !== null) nodeDef.mesh = meshIndex
    } else if (object.isCamera) {
      nodeDef.camera = this.processCamera(object)
    }

    if (object.isSkinnedMesh) this.skins.push(object)

    if (object.children.length > 0) {
      const children = []

      for (let i = 0, l = object.children.length; i < l; i++) {
        const child = object.children[i]

        if (child.visible || options.onlyVisible === false) {
          const nodeIndex = this.processNode(child)

          if (nodeIndex !== null) children.push(nodeIndex)
        }
      }

      if (children.length > 0) nodeDef.children = children
    }

    this._invokeAll(function (ext) {
      ext.writeNode && ext.writeNode(object, nodeDef)
    })

    const nodeIndex = json.nodes.push(nodeDef) - 1
    nodeMap.set(object, nodeIndex)
    return nodeIndex
  }

  /**
   * Process Scene
   * @param  {Scene} node Scene to process
   */
  processScene(scene) {
    const json = this.json
    const options = this.options

    if (!json.scenes) {
      json.scenes = []
      json.scene = 0
    }

    const sceneDef = {}

    if (scene.name !== '') sceneDef.name = scene.name

    json.scenes.push(sceneDef)

    const nodes = []

    for (let i = 0, l = scene.children.length; i < l; i++) {
      const child = scene.children[i]

      if (child.visible || options.onlyVisible === false) {
        const nodeIndex = this.processNode(child)

        if (nodeIndex !== null) nodes.push(nodeIndex)
      }
    }

    if (nodes.length > 0) sceneDef.nodes = nodes

    this.serializeUserData(scene, sceneDef)
  }

  /**
   * Creates a Scene to hold a list of objects and parse it
   * @param  {Array} objects List of objects to process
   */
  processObjects(objects) {
    const scene = new Scene()
    scene.name = 'AuxScene'

    for (let i = 0; i < objects.length; i++) {
      // We push directly to children instead of calling `add` to prevent
      // modify the .parent and break its original scene and hierarchy
      scene.children.push(objects[i])
    }

    this.processScene(scene)
  }

  /**
   * @param {THREE.Object3D|Array<THREE.Object3D>} input
   */
  processInput(input) {
    const options = this.options

    input = input instanceof Array ? input : [input]

    this._invokeAll(function (ext) {
      ext.beforeParse && ext.beforeParse(input)
    })

    const objectsWithoutScene = []

    for (let i = 0; i < input.length; i++) {
      if (input[i] instanceof Scene) {
        this.processScene(input[i])
      } else {
        objectsWithoutScene.push(input[i])
      }
    }

    if (objectsWithoutScene.length > 0) this.processObjects(objectsWithoutScene)

    for (let i = 0; i < this.skins.length; ++i) {
      this.processSkin(this.skins[i])
    }

    for (let i = 0; i < options.animations.length; ++i) {
      this.processAnimation(options.animations[i], input[0])
    }

    this._invokeAll(function (ext) {
      ext.afterParse && ext.afterParse(input)
    })
  }

  _invokeAll(func) {
    for (let i = 0, il = this.plugins.length; i < il; i++) {
      func(this.plugins[i])
    }
  }
}

/**
 * Punctual Lights Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_lights_punctual
 */
class GLTFLightExtension {
  constructor(writer) {
    this.writer = writer
    this.name = 'KHR_lights_punctual'
  }

  writeNode(light, nodeDef) {
    if (!light.isLight) return

    if (
      !light.isDirectionalLight &&
      !light.isPointLight &&
      !light.isSpotLight
    ) {
      console.warn(
        'THREE.GLTFExporter: Only directional, point, and spot lights are supported.',
        light
      )
      return
    }

    const writer = this.writer
    const json = writer.json
    const extensionsUsed = writer.extensionsUsed

    const lightDef = {}

    if (light.name) lightDef.name = light.name

    lightDef.color = light.color.toArray()

    lightDef.intensity = light.intensity

    if (light.isDirectionalLight) {
      lightDef.type = 'directional'
    } else if (light.isPointLight) {
      lightDef.type = 'point'

      if (light.distance > 0) lightDef.range = light.distance
    } else if (light.isSpotLight) {
      lightDef.type = 'spot'

      if (light.distance > 0) lightDef.range = light.distance

      lightDef.spot = {}
      lightDef.spot.innerConeAngle = (light.penumbra - 1.0) * light.angle * -1.0
      lightDef.spot.outerConeAngle = light.angle
    }

    if (light.decay !== undefined && light.decay !== 2) {
      console.warn(
        'THREE.GLTFExporter: Light decay may be lost. glTF is physically-based, ' +
          'and expects light.decay=2.'
      )
    }

    if (
      light.target &&
      (light.target.parent !== light ||
        light.target.position.x !== 0 ||
        light.target.position.y !== 0 ||
        light.target.position.z !== -1)
    ) {
      console.warn(
        'THREE.GLTFExporter: Light direction may be lost. For best results, ' +
          'make light.target a child of the light with position 0,0,-1.'
      )
    }

    if (!extensionsUsed[this.name]) {
      json.extensions = json.extensions || {}
      json.extensions[this.name] = {lights: []}
      extensionsUsed[this.name] = true
    }

    const lights = json.extensions[this.name].lights
    lights.push(lightDef)

    nodeDef.extensions = nodeDef.extensions || {}
    nodeDef.extensions[this.name] = {light: lights.length - 1}
  }
}

/**
 * Unlit Materials Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_unlit
 */
// class GLTFMaterialsUnlitExtension {

//   constructor(writer) {

//     this.writer = writer;
//     this.name = 'KHR_materials_unlit';

//   }

//   writeMaterial(material, materialDef) {

//     if (!material.isMeshBasicMaterial) return;

//     const writer = this.writer;
//     const extensionsUsed = writer.extensionsUsed;

//     materialDef.extensions = materialDef.extensions || {};
//     materialDef.extensions[this.name] = {};

//     extensionsUsed[this.name] = true;

//     materialDef.pbrMetallicRoughness.metallicFactor = 0.0;
//     materialDef.pbrMetallicRoughness.roughnessFactor = 0.9;

//   }

// }

/**
 * Clearcoat Materials Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_clearcoat
 */
class GLTFMaterialsClearcoatExtension {
  constructor(writer) {
    this.writer = writer
    this.name = 'KHR_materials_clearcoat'
  }

  writeMaterial(material, materialDef) {
    if (!material.isMeshPhysicalMaterial) return

    const writer = this.writer
    const extensionsUsed = writer.extensionsUsed

    const extensionDef = {}

    extensionDef.clearcoatFactor = material.clearcoat

    if (material.clearcoatMap) {
      const clearcoatMapDef = {
        index: writer.processTexture(material.clearcoatMap)
      }
      writer.applyTextureTransform(clearcoatMapDef, material.clearcoatMap)
      extensionDef.clearcoatTexture = clearcoatMapDef
    }

    extensionDef.clearcoatRoughnessFactor = material.clearcoatRoughness

    if (material.clearcoatRoughnessMap) {
      const clearcoatRoughnessMapDef = {
        index: writer.processTexture(material.clearcoatRoughnessMap)
      }
      writer.applyTextureTransform(
        clearcoatRoughnessMapDef,
        material.clearcoatRoughnessMap
      )
      extensionDef.clearcoatRoughnessTexture = clearcoatRoughnessMapDef
    }

    if (material.clearcoatNormalMap) {
      const clearcoatNormalMapDef = {
        index: writer.processTexture(material.clearcoatNormalMap)
      }
      writer.applyTextureTransform(
        clearcoatNormalMapDef,
        material.clearcoatNormalMap
      )
      extensionDef.clearcoatNormalTexture = clearcoatNormalMapDef
    }

    materialDef.extensions = materialDef.extensions || {}
    materialDef.extensions[this.name] = extensionDef

    extensionsUsed[this.name] = true
  }
}

/**
 * Iridescence Materials Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_iridescence
 */
class GLTFMaterialsIridescenceExtension {
  constructor(writer) {
    this.writer = writer
    this.name = 'KHR_materials_iridescence'
  }

  writeMaterial(material, materialDef) {
    if (!material.isMeshPhysicalMaterial) return

    const writer = this.writer
    const extensionsUsed = writer.extensionsUsed

    const extensionDef = {}

    extensionDef.iridescenceFactor = material.iridescence

    if (material.iridescenceMap) {
      const iridescenceMapDef = {
        index: writer.processTexture(material.iridescenceMap)
      }
      writer.applyTextureTransform(iridescenceMapDef, material.iridescenceMap)
      extensionDef.iridescenceTexture = iridescenceMapDef
    }

    extensionDef.iridescenceIor = material.iridescenceIOR
    extensionDef.iridescenceThicknessMinimum =
      material.iridescenceThicknessRange[0]
    extensionDef.iridescenceThicknessMaximum =
      material.iridescenceThicknessRange[1]

    if (material.iridescenceThicknessMap) {
      const iridescenceThicknessMapDef = {
        index: writer.processTexture(material.iridescenceThicknessMap)
      }
      writer.applyTextureTransform(
        iridescenceThicknessMapDef,
        material.iridescenceThicknessMap
      )
      extensionDef.iridescenceThicknessTexture = iridescenceThicknessMapDef
    }

    materialDef.extensions = materialDef.extensions || {}
    materialDef.extensions[this.name] = extensionDef

    extensionsUsed[this.name] = true
  }
}

/**
 * Transmission Materials Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_transmission
 */
class GLTFMaterialsTransmissionExtension {
  constructor(writer) {
    this.writer = writer
    this.name = 'KHR_materials_transmission'
  }

  writeMaterial(material, materialDef) {
    if (!material.isMeshPhysicalMaterial || material.transmission === 0) return

    const writer = this.writer
    const extensionsUsed = writer.extensionsUsed

    const extensionDef = {}

    extensionDef.transmissionFactor = material.transmission

    if (material.transmissionMap) {
      const transmissionMapDef = {
        index: writer.processTexture(material.transmissionMap)
      }
      writer.applyTextureTransform(transmissionMapDef, material.transmissionMap)
      extensionDef.transmissionTexture = transmissionMapDef
    }

    materialDef.extensions = materialDef.extensions || {}
    materialDef.extensions[this.name] = extensionDef

    extensionsUsed[this.name] = true
  }
}

/**
 * Materials Volume Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_volume
 */
// class GLTFMaterialsVolumeExtension {

//   constructor(writer) {

//     this.writer = writer;
//     this.name = 'KHR_materials_volume';

//   }

//   writeMaterial(material, materialDef) {

//     if (!material.isMeshPhysicalMaterial || material.transmission === 0) return;

//     const writer = this.writer;
//     const extensionsUsed = writer.extensionsUsed;

//     const extensionDef = {};

//     extensionDef.thicknessFactor = material.thickness;

//     if (material.thicknessMap) {

//       const thicknessMapDef = { index: writer.processTexture(material.thicknessMap) };
//       writer.applyTextureTransform(thicknessMapDef, material.thicknessMap);
//       extensionDef.thicknessTexture = thicknessMapDef;

//     }

//     extensionDef.attenuationDistance = material.attenuationDistance;
//     extensionDef.attenuationColor = material.attenuationColor.toArray();

//     materialDef.extensions = materialDef.extensions || {};
//     materialDef.extensions[this.name] = extensionDef;

//     extensionsUsed[this.name] = true;

//   }

// }

/**
 * Static utility functions
 */
GLTFExporter.Utils = {
  insertKeyframe: function (track, time) {
    const tolerance = 0.001 // 1ms
    const valueSize = track.getValueSize()

    const times = new track.TimeBufferType(track.times.length + 1)
    const values = new track.ValueBufferType(track.values.length + valueSize)
    const interpolant = track.createInterpolant(
      new track.ValueBufferType(valueSize)
    )

    let index

    if (track.times.length === 0) {
      times[0] = time

      for (let i = 0; i < valueSize; i++) {
        values[i] = 0
      }

      index = 0
    } else if (time < track.times[0]) {
      if (Math.abs(track.times[0] - time) < tolerance) return 0

      times[0] = time
      times.set(track.times, 1)

      values.set(interpolant.evaluate(time), 0)
      values.set(track.values, valueSize)

      index = 0
    } else if (time > track.times[track.times.length - 1]) {
      if (Math.abs(track.times[track.times.length - 1] - time) < tolerance) {
        return track.times.length - 1
      }

      times[times.length - 1] = time
      times.set(track.times, 0)

      values.set(track.values, 0)
      values.set(interpolant.evaluate(time), track.values.length)

      index = times.length - 1
    } else {
      for (let i = 0; i < track.times.length; i++) {
        if (Math.abs(track.times[i] - time) < tolerance) return i

        if (track.times[i] < time && track.times[i + 1] > time) {
          times.set(track.times.slice(0, i + 1), 0)
          times[i + 1] = time
          times.set(track.times.slice(i + 1), i + 2)

          values.set(track.values.slice(0, (i + 1) * valueSize), 0)
          values.set(interpolant.evaluate(time), (i + 1) * valueSize)
          values.set(
            track.values.slice((i + 1) * valueSize),
            (i + 2) * valueSize
          )

          index = i + 1

          break
        }
      }
    }

    track.times = times
    track.values = values

    return index
  },

  mergeMorphTargetTracks: function (clip, root) {
    const tracks = []
    const mergedTracks = {}
    const sourceTracks = clip.tracks

    for (let i = 0; i < sourceTracks.length; ++i) {
      let sourceTrack = sourceTracks[i]
      const sourceTrackBinding = PropertyBinding.parseTrackName(
        sourceTrack.name
      )
      const sourceTrackNode = PropertyBinding.findNode(
        root,
        sourceTrackBinding.nodeName
      )

      if (
        sourceTrackBinding.propertyName !== 'morphTargetInfluences' ||
        sourceTrackBinding.propertyIndex === undefined
      ) {
        // Tracks that don't affect morph targets, or that affect all morph targets together, can be left as-is.
        tracks.push(sourceTrack)
        continue
      }

      if (
        sourceTrack.createInterpolant !==
          sourceTrack.InterpolantFactoryMethodDiscrete &&
        sourceTrack.createInterpolant !==
          sourceTrack.InterpolantFactoryMethodLinear
      ) {
        if (
          sourceTrack.createInterpolant
            .isInterpolantFactoryMethodGLTFCubicSpline
        ) {
          // This should never happen, because glTF morph target animations
          // affect all targets already.
          throw new Error(
            'THREE.GLTFExporter: Cannot merge tracks with glTF CUBICSPLINE interpolation.'
          )
        }

        console.warn(
          'THREE.GLTFExporter: Morph target interpolation mode not yet supported. Using LINEAR instead.'
        )

        sourceTrack = sourceTrack.clone()
        sourceTrack.setInterpolation(InterpolateLinear)
      }

      const targetCount = sourceTrackNode.morphTargetInfluences.length
      const targetIndex =
        sourceTrackNode.morphTargetDictionary[sourceTrackBinding.propertyIndex]

      if (targetIndex === undefined) {
        throw new Error(
          'THREE.GLTFExporter: Morph target name not found: ' +
            sourceTrackBinding.propertyIndex
        )
      }

      let mergedTrack

      // If this is the first time we've seen this object, create a new
      // track to store merged keyframe data for each morph target.
      if (mergedTracks[sourceTrackNode.uuid] === undefined) {
        mergedTrack = sourceTrack.clone()

        const values = new mergedTrack.ValueBufferType(
          targetCount * mergedTrack.times.length
        )

        for (let j = 0; j < mergedTrack.times.length; j++) {
          values[j * targetCount + targetIndex] = mergedTrack.values[j]
        }

        // We need to take into consideration the intended target node
        // of our original un-merged morphTarget animation.
        mergedTrack.name =
          (sourceTrackBinding.nodeName || '') + '.morphTargetInfluences'
        mergedTrack.values = values

        mergedTracks[sourceTrackNode.uuid] = mergedTrack
        tracks.push(mergedTrack)

        continue
      }

      const sourceInterpolant = sourceTrack.createInterpolant(
        new sourceTrack.ValueBufferType(1)
      )

      mergedTrack = mergedTracks[sourceTrackNode.uuid]

      // For every existing keyframe of the merged track, write a (possibly
      // interpolated) value from the source track.
      for (let j = 0; j < mergedTrack.times.length; j++) {
        mergedTrack.values[j * targetCount + targetIndex] =
          sourceInterpolant.evaluate(mergedTrack.times[j])
      }

      // For every existing keyframe of the source track, write a (possibly
      // new) keyframe to the merged track. Values from the previous loop may
      // be written again, but keyframes are de-duplicated.
      for (let j = 0; j < sourceTrack.times.length; j++) {
        const keyframeIndex = this.insertKeyframe(
          mergedTrack,
          sourceTrack.times[j]
        )
        mergedTrack.values[keyframeIndex * targetCount + targetIndex] =
          sourceTrack.values[j]
      }
    }

    clip.tracks = tracks

    return clip
  }
}
//===============================================================================================================================================================================
// WebGL

class WEBGL {
  static isWebGLAvailable() {
    try {
      const canvas = document.createElement('canvas')
      return !!(
        window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      )
    } catch (e) {
      return false
    }
  }

  static isWebGL2Available() {
    try {
      const canvas = document.createElement('canvas')
      return !!(window.WebGL2RenderingContext && canvas.getContext('webgl2'))
    } catch (e) {
      return false
    }
  }

  static getWebGLErrorMessage() {
    return this.getErrorMessage(1)
  }

  static getWebGL2ErrorMessage() {
    return this.getErrorMessage(2)
  }

  static getErrorMessage(version) {
    const names = {
      1: 'WebGL',
      2: 'WebGL 2'
    }

    const contexts = {
      1: window.WebGLRenderingContext,
      2: window.WebGL2RenderingContext
    }

    let message =
      'Your $0 does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#000">$1</a>'

    const element = document.createElement('div')
    element.id = 'webglmessage'
    element.style.fontFamily = 'monospace'
    element.style.fontSize = '13px'
    element.style.fontWeight = 'normal'
    element.style.textAlign = 'center'
    element.style.background = '#fff'
    element.style.color = '#000'
    element.style.padding = '1.5em'
    element.style.width = '400px'
    element.style.margin = '5em auto 0'

    if (contexts[version]) {
      message = message.replace('$0', 'graphics card')
    } else {
      message = message.replace('$0', 'browser')
    }

    message = message.replace('$1', names[version])

    element.innerHTML = message

    return element
  }
}
/**
 * Loader for KTX 2.0 GPU Texture containers.
 *
 * KTX 2.0 is a container format for various GPU texture formats. The loader
 * supports Basis Universal GPU textures, which can be quickly transcoded to
 * a wide variety of GPU texture compression formats. While KTX 2.0 also allows
 * other hardware-specific formats, this loader does not yet parse them.
 *
 * References:
 * - KTX: http://github.khronos.org/KTX-Specification/
 * - DFD: https://www.khronos.org/registry/DataFormat/specs/1.3/dataformat.1.3.html#basicdescriptor
 */

const KTX2TransferSRGB = 2
const KTX2_ALPHA_PREMULTIPLIED = 1
const _taskCache = new WeakMap()

let _activeLoaders = 0

class KTX2Loader extends Loader {
  constructor(manager) {
    super(manager)

    this.transcoderPath = ''
    this.transcoderBinary = null
    this.transcoderPending = null

    this.workerPool = new WorkerPool()
    this.workerSourceURL = ''
    this.workerConfig = null

    if (typeof MSC_TRANSCODER !== 'undefined') {
      console.warn(
        'THREE.KTX2Loader: Please update to latest "basis_transcoder".' +
          ' "msc_basis_transcoder" is no longer supported in three.js r125+.'
      )
    }
  }

  setTranscoderPath(path) {
    this.transcoderPath = path

    return this
  }

  setWorkerLimit(num) {
    this.workerPool.setWorkerLimit(num)

    return this
  }

  detectSupport(renderer) {
    this.workerConfig = {
      astcSupported: renderer.extensions.has('WEBGL_compressed_texture_astc'),
      etc1Supported: renderer.extensions.has('WEBGL_compressed_texture_etc1'),
      etc2Supported: renderer.extensions.has('WEBGL_compressed_texture_etc'),
      dxtSupported: renderer.extensions.has('WEBGL_compressed_texture_s3tc'),
      bptcSupported: renderer.extensions.has('EXT_texture_compression_bptc'),
      pvrtcSupported:
        renderer.extensions.has('WEBGL_compressed_texture_pvrtc') ||
        renderer.extensions.has('WEBKIT_WEBGL_compressed_texture_pvrtc')
    }

    if (renderer.capabilities.isWebGL2) {
      // https://github.com/mrdoob/three.js/pull/22928
      this.workerConfig.etc1Supported = false
    }

    return this
  }

  init() {
    if (!this.transcoderPending) {
      // Load transcoder wrapper.
      const jsLoader = new FileLoader(this.manager)
      jsLoader.setPath(this.transcoderPath)
      jsLoader.setWithCredentials(this.withCredentials)
      const jsContent = jsLoader.loadAsync('basis_transcoder.js')

      // Load transcoder WASM binary.
      const binaryLoader = new FileLoader(this.manager)
      binaryLoader.setPath(this.transcoderPath)
      binaryLoader.setResponseType('arraybuffer')
      binaryLoader.setWithCredentials(this.withCredentials)
      const binaryContent = binaryLoader.loadAsync('basis_transcoder.wasm')

      this.transcoderPending = Promise.all([jsContent, binaryContent]).then(
        ([jsContent, binaryContent]) => {
          const fn = KTX2Loader.BasisWorker.toString()

          const body = [
            '/* constants */',
            'let _EngineFormat = ' + JSON.stringify(KTX2Loader.EngineFormat),
            'let _TranscoderFormat = ' +
              JSON.stringify(KTX2Loader.TranscoderFormat),
            'let _BasisFormat = ' + JSON.stringify(KTX2Loader.BasisFormat),
            '/* basis_transcoder.js */',
            jsContent,
            '/* worker */',
            fn.substring(fn.indexOf('{') + 1, fn.lastIndexOf('}'))
          ].join('\n')

          this.workerSourceURL = URL.createObjectURL(new Blob([body]))
          this.transcoderBinary = binaryContent

          this.workerPool.setWorkerCreator(() => {
            const worker = new Worker(this.workerSourceURL)
            const transcoderBinary = this.transcoderBinary.slice(0)

            worker.postMessage(
              {type: 'init', config: this.workerConfig, transcoderBinary},
              [transcoderBinary]
            )

            return worker
          })
        }
      )

      if (_activeLoaders > 0) {
        // Each instance loads a transcoder and allocates workers, increasing network and memory cost.

        console.warn(
          'THREE.KTX2Loader: Multiple active KTX2 loaders may cause performance issues.' +
            ' Use a single KTX2Loader instance, or call .dispose() on old instances.'
        )
      }

      _activeLoaders++
    }

    return this.transcoderPending
  }

  load(url, onLoad, onProgress, onError) {
    if (this.workerConfig === null) {
      throw new Error(
        'THREE.KTX2Loader: Missing initialization with `.detectSupport( renderer )`.'
      )
    }

    const loader = new FileLoader(this.manager)

    loader.setResponseType('arraybuffer')
    loader.setWithCredentials(this.withCredentials)

    const texture = new CompressedTexture()

    loader.load(
      url,
      (buffer) => {
        // Check for an existing task using this buffer. A transferred buffer cannot be transferred
        // again from this thread.
        if (_taskCache.has(buffer)) {
          const cachedTask = _taskCache.get(buffer)

          return cachedTask.promise.then(onLoad).catch(onError)
        }

        this._createTexture([buffer])
          .then(function (_texture) {
            texture.copy(_texture)
            texture.needsUpdate = true

            if (onLoad) onLoad(texture)
          })
          .catch(onError)
      },
      onProgress,
      onError
    )

    return texture
  }

  _createTextureFrom(transcodeResult) {
    const {
      mipmaps,
      width,
      height,
      format,
      type,
      error,
      dfdTransferFn,
      dfdFlags
    } = transcodeResult

    if (type === 'error') return Promise.reject(error)

    const texture = new CompressedTexture(
      mipmaps,
      width,
      height,
      format,
      UnsignedByteType
    )
    texture.minFilter =
      mipmaps.length === 1 ? LinearFilter : LinearMipmapLinearFilter
    texture.magFilter = LinearFilter
    texture.generateMipmaps = false
    texture.needsUpdate = true
    texture.encoding =
      dfdTransferFn === KTX2TransferSRGB ? sRGBEncoding : LinearEncoding
    texture.premultiplyAlpha = !!(dfdFlags & KTX2_ALPHA_PREMULTIPLIED)

    return texture
  }

  /**
   * @param {ArrayBuffer[]} buffers
   * @param {object?} config
   * @return {Promise<CompressedTexture>}
   */
  _createTexture(buffers, config = {}) {
    const taskConfig = config
    const texturePending = this.init()
      .then(() => {
        return this.workerPool.postMessage(
          {type: 'transcode', buffers, taskConfig: taskConfig},
          buffers
        )
      })
      .then((e) => this._createTextureFrom(e.data))

    // Cache the task result.
    _taskCache.set(buffers[0], {promise: texturePending})

    return texturePending
  }

  dispose() {
    this.workerPool.dispose()
    if (this.workerSourceURL) URL.revokeObjectURL(this.workerSourceURL)

    _activeLoaders--

    return this
  }
}

/* CONSTANTS */

KTX2Loader.BasisFormat = {
  ETC1S: 0,
  UASTC_4x4: 1
}

KTX2Loader.TranscoderFormat = {
  ETC1: 0,
  ETC2: 1,
  BC1: 2,
  BC3: 3,
  BC4: 4,
  BC5: 5,
  BC7_M6_OPAQUE_ONLY: 6,
  BC7_M5: 7,
  PVRTC1_4_RGB: 8,
  PVRTC1_4_RGBA: 9,
  ASTC_4x4: 10,
  ATC_RGB: 11,
  ATC_RGBA_INTERPOLATED_ALPHA: 12,
  RGBA32: 13,
  RGB565: 14,
  BGR565: 15,
  RGBA4444: 16
}

KTX2Loader.EngineFormat = {
  RGBAFormat: RGBAFormat,
  RGBA_ASTC_4x4_Format: RGBA_ASTC_4x4_Format,
  RGBA_BPTC_Format: RGBA_BPTC_Format,
  RGBA_ETC2_EAC_Format: RGBA_ETC2_EAC_Format,
  RGBA_PVRTC_4BPPV1_Format: RGBA_PVRTC_4BPPV1_Format,
  RGBA_S3TC_DXT5_Format: RGBA_S3TC_DXT5_Format,
  RGB_ETC1_Format: RGB_ETC1_Format,
  RGB_ETC2_Format: RGB_ETC2_Format,
  RGB_PVRTC_4BPPV1_Format: RGB_PVRTC_4BPPV1_Format,
  RGB_S3TC_DXT1_Format: RGB_S3TC_DXT1_Format
}

/* WEB WORKER */

KTX2Loader.BasisWorker = function () {
  let config
  let transcoderPending
  let BasisModule

  const EngineFormat = _EngineFormat // eslint-disable-line no-undef
  const TranscoderFormat = _TranscoderFormat // eslint-disable-line no-undef
  const BasisFormat = _BasisFormat // eslint-disable-line no-undef

  self.addEventListener('message', function (e) {
    const message = e.data

    switch (message.type) {
      case 'init':
        config = message.config
        init(message.transcoderBinary)
        break

      case 'transcode':
        transcoderPending.then(() => {
          try {
            const {
              width,
              height,
              hasAlpha,
              mipmaps,
              format,
              dfdTransferFn,
              dfdFlags
            } = transcode(message.buffers[0])

            const buffers = []

            for (let i = 0; i < mipmaps.length; ++i) {
              buffers.push(mipmaps[i].data.buffer)
            }

            self.postMessage(
              {
                type: 'transcode',
                id: message.id,
                width,
                height,
                hasAlpha,
                mipmaps,
                format,
                dfdTransferFn,
                dfdFlags
              },
              buffers
            )
          } catch (error) {
            console.error(error)

            self.postMessage({
              type: 'error',
              id: message.id,
              error: error.message
            })
          }
        })
        break
    }
  })

  function init(wasmBinary) {
    transcoderPending = new Promise((resolve) => {
      BasisModule = {wasmBinary, onRuntimeInitialized: resolve}
      BASIS(BasisModule) // eslint-disable-line no-undef
    }).then(() => {
      BasisModule.initializeBasis()

      if (BasisModule.KTX2File === undefined) {
        console.warn(
          'THREE.KTX2Loader: Please update Basis Universal transcoder.'
        )
      }
    })
  }

  function transcode(buffer) {
    const ktx2File = new BasisModule.KTX2File(new Uint8Array(buffer))

    function cleanup() {
      ktx2File.close()
      ktx2File.delete()
    }

    if (!ktx2File.isValid()) {
      cleanup()
      throw new Error('THREE.KTX2Loader:	Invalid or unsupported .ktx2 file')
    }

    const basisFormat = ktx2File.isUASTC()
      ? BasisFormat.UASTC_4x4
      : BasisFormat.ETC1S
    const width = ktx2File.getWidth()
    const height = ktx2File.getHeight()
    const levels = ktx2File.getLevels()
    const hasAlpha = ktx2File.getHasAlpha()
    const dfdTransferFn = ktx2File.getDFDTransferFunc()
    const dfdFlags = ktx2File.getDFDFlags()

    const {transcoderFormat, engineFormat} = getTranscoderFormat(
      basisFormat,
      width,
      height,
      hasAlpha
    )

    if (!width || !height || !levels) {
      cleanup()
      throw new Error('THREE.KTX2Loader:	Invalid texture')
    }

    if (!ktx2File.startTranscoding()) {
      cleanup()
      throw new Error('THREE.KTX2Loader: .startTranscoding failed')
    }

    const mipmaps = []

    for (let mip = 0; mip < levels; mip++) {
      const levelInfo = ktx2File.getImageLevelInfo(mip, 0, 0)
      const mipWidth = levelInfo.origWidth
      const mipHeight = levelInfo.origHeight
      const dst = new Uint8Array(
        ktx2File.getImageTranscodedSizeInBytes(mip, 0, 0, transcoderFormat)
      )

      const status = ktx2File.transcodeImage(
        dst,
        mip,
        0,
        0,
        transcoderFormat,
        0,
        -1,
        -1
      )

      if (!status) {
        cleanup()
        throw new Error('THREE.KTX2Loader: .transcodeImage failed.')
      }

      mipmaps.push({data: dst, width: mipWidth, height: mipHeight})
    }

    cleanup()

    return {
      width,
      height,
      hasAlpha,
      mipmaps,
      format: engineFormat,
      dfdTransferFn,
      dfdFlags
    }
  }

  //

  // Optimal choice of a transcoder target format depends on the Basis format (ETC1S or UASTC),
  // device capabilities, and texture dimensions. The list below ranks the formats separately
  // for ETC1S and UASTC.
  //
  // In some cases, transcoding UASTC to RGBA32 might be preferred for higher quality (at
  // significant memory cost) compared to ETC1/2, BC1/3, and PVRTC. The transcoder currently
  // chooses RGBA32 only as a last resort and does not expose that option to the caller.
  const FORMAT_OPTIONS = [
    {
      if: 'astcSupported',
      basisFormat: [BasisFormat.UASTC_4x4],
      transcoderFormat: [TranscoderFormat.ASTC_4x4, TranscoderFormat.ASTC_4x4],
      engineFormat: [
        EngineFormat.RGBA_ASTC_4x4_Format,
        EngineFormat.RGBA_ASTC_4x4_Format
      ],
      priorityETC1S: Infinity,
      priorityUASTC: 1,
      needsPowerOfTwo: false
    },
    {
      if: 'bptcSupported',
      basisFormat: [BasisFormat.ETC1S, BasisFormat.UASTC_4x4],
      transcoderFormat: [TranscoderFormat.BC7_M5, TranscoderFormat.BC7_M5],
      engineFormat: [
        EngineFormat.RGBA_BPTC_Format,
        EngineFormat.RGBA_BPTC_Format
      ],
      priorityETC1S: 3,
      priorityUASTC: 2,
      needsPowerOfTwo: false
    },
    {
      if: 'dxtSupported',
      basisFormat: [BasisFormat.ETC1S, BasisFormat.UASTC_4x4],
      transcoderFormat: [TranscoderFormat.BC1, TranscoderFormat.BC3],
      engineFormat: [
        EngineFormat.RGB_S3TC_DXT1_Format,
        EngineFormat.RGBA_S3TC_DXT5_Format
      ],
      priorityETC1S: 4,
      priorityUASTC: 5,
      needsPowerOfTwo: false
    },
    {
      if: 'etc2Supported',
      basisFormat: [BasisFormat.ETC1S, BasisFormat.UASTC_4x4],
      transcoderFormat: [TranscoderFormat.ETC1, TranscoderFormat.ETC2],
      engineFormat: [
        EngineFormat.RGB_ETC2_Format,
        EngineFormat.RGBA_ETC2_EAC_Format
      ],
      priorityETC1S: 1,
      priorityUASTC: 3,
      needsPowerOfTwo: false
    },
    {
      if: 'etc1Supported',
      basisFormat: [BasisFormat.ETC1S, BasisFormat.UASTC_4x4],
      transcoderFormat: [TranscoderFormat.ETC1],
      engineFormat: [EngineFormat.RGB_ETC1_Format],
      priorityETC1S: 2,
      priorityUASTC: 4,
      needsPowerOfTwo: false
    },
    {
      if: 'pvrtcSupported',
      basisFormat: [BasisFormat.ETC1S, BasisFormat.UASTC_4x4],
      transcoderFormat: [
        TranscoderFormat.PVRTC1_4_RGB,
        TranscoderFormat.PVRTC1_4_RGBA
      ],
      engineFormat: [
        EngineFormat.RGB_PVRTC_4BPPV1_Format,
        EngineFormat.RGBA_PVRTC_4BPPV1_Format
      ],
      priorityETC1S: 5,
      priorityUASTC: 6,
      needsPowerOfTwo: true
    }
  ]

  const ETC1S_OPTIONS = FORMAT_OPTIONS.sort(function (a, b) {
    return a.priorityETC1S - b.priorityETC1S
  })
  const UASTC_OPTIONS = FORMAT_OPTIONS.sort(function (a, b) {
    return a.priorityUASTC - b.priorityUASTC
  })

  function getTranscoderFormat(basisFormat, width, height, hasAlpha) {
    let transcoderFormat
    let engineFormat

    const options =
      basisFormat === BasisFormat.ETC1S ? ETC1S_OPTIONS : UASTC_OPTIONS

    for (let i = 0; i < options.length; i++) {
      const opt = options[i]

      if (!config[opt.if]) continue
      if (!opt.basisFormat.includes(basisFormat)) continue
      if (hasAlpha && opt.transcoderFormat.length < 2) continue
      if (opt.needsPowerOfTwo && !(isPowerOfTwo(width) && isPowerOfTwo(height)))
        continue

      transcoderFormat = opt.transcoderFormat[hasAlpha ? 1 : 0]
      engineFormat = opt.engineFormat[hasAlpha ? 1 : 0]

      return {transcoderFormat, engineFormat}
    }

    console.warn(
      'THREE.KTX2Loader: No suitable compressed texture format found. Decoding to RGBA32.'
    )

    transcoderFormat = TranscoderFormat.RGBA32
    engineFormat = EngineFormat.RGBAFormat

    return {transcoderFormat, engineFormat}
  }

  function isPowerOfTwo(value) {
    if (value <= 2) return true

    return (value & (value - 1)) === 0 && value !== 0
  }
}
//===============================================================================================================================================================================
// GLTFLoader

class GLTFLoader extends Loader {
  constructor(manager) {
    super(manager)

    this.dracoLoader = null
    this.ktx2Loader = null
    this.meshoptDecoder = null

    this.pluginCallbacks = []

    this.register(function (parser) {
      return new GLTFMaterialsClearcoatExtension(parser)
    })

    this.register(function (parser) {
      return new GLTFTextureBasisUExtension(parser)
    })

    this.register(function (parser) {
      return new GLTFTextureWebPExtension(parser)
    })

    this.register(function (parser) {
      return new GLTFMaterialsSheenExtension(parser)
    })

    this.register(function (parser) {
      return new GLTFMaterialsTransmissionExtension(parser)
    })

    this.register(function (parser) {
      return new GLTFMaterialsVolumeExtension(parser)
    })

    this.register(function (parser) {
      return new GLTFMaterialsIorExtension(parser)
    })

    this.register(function (parser) {
      return new GLTFMaterialsEmissiveStrengthExtension(parser)
    })

    this.register(function (parser) {
      return new GLTFMaterialsSpecularExtension(parser)
    })

    this.register(function (parser) {
      return new GLTFMaterialsIridescenceExtension(parser)
    })

    this.register(function (parser) {
      return new GLTFLightsExtension(parser)
    })

    this.register(function (parser) {
      return new GLTFMeshoptCompression(parser)
    })

    this.register(function (parser) {
      return new GLTFMeshGpuInstancing(parser)
    })
  }

  load(url, onLoad, onProgress, onError) {
    const scope = this

    let resourcePath

    if (this.resourcePath !== '') {
      resourcePath = this.resourcePath
    } else if (this.path !== '') {
      resourcePath = this.path
    } else {
      resourcePath = LoaderUtils.extractUrlBase(url)
    }

    // Tells the LoadingManager to track an extra item, which resolves after
    // the model is fully loaded. This means the count of items loaded will
    // be incorrect, but ensures manager.onLoad() does not fire early.
    this.manager.itemStart(url)

    const _onError = function (e) {
      if (onError) {
        onError(e)
      } else {
        console.error(e)
      }

      scope.manager.itemError(url)
      scope.manager.itemEnd(url)
    }

    const loader = new FileLoader(this.manager)

    loader.setPath(this.path)
    loader.setResponseType('arraybuffer')
    loader.setRequestHeader(this.requestHeader)
    loader.setWithCredentials(this.withCredentials)

    loader.load(
      url,
      function (data) {
        try {
          scope.parse(
            data,
            resourcePath,
            function (gltf) {
              onLoad(gltf)

              scope.manager.itemEnd(url)
            },
            _onError
          )
        } catch (e) {
          _onError(e)
        }
      },
      onProgress,
      _onError
    )
  }

  setDRACOLoader(dracoLoader) {
    this.dracoLoader = dracoLoader
    return this
  }

  setDDSLoader() {
    throw new Error(
      'THREE.GLTFLoader: "MSFT_texture_dds" no longer supported. Please update to "KHR_texture_basisu".'
    )
  }

  setKTX2Loader(ktx2Loader) {
    this.ktx2Loader = ktx2Loader
    return this
  }

  setMeshoptDecoder(meshoptDecoder) {
    this.meshoptDecoder = meshoptDecoder
    return this
  }

  register(callback) {
    if (this.pluginCallbacks.indexOf(callback) === -1) {
      this.pluginCallbacks.push(callback)
    }

    return this
  }

  unregister(callback) {
    if (this.pluginCallbacks.indexOf(callback) !== -1) {
      this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(callback), 1)
    }

    return this
  }

  parse(data, path, onLoad, onError) {
    let json
    const extensions = {}
    const plugins = {}

    if (typeof data === 'string') {
      json = JSON.parse(data)
    } else if (data instanceof ArrayBuffer) {
      const magic = LoaderUtils.decodeText(new Uint8Array(data, 0, 4))

      if (magic === BINARY_EXTENSION_HEADER_MAGIC) {
        try {
          extensions[EXTENSIONS.KHR_BINARY_GLTF] = new GLTFBinaryExtension(data)
        } catch (error) {
          if (onError) onError(error)
          return
        }

        json = JSON.parse(extensions[EXTENSIONS.KHR_BINARY_GLTF].content)
      } else {
        json = JSON.parse(LoaderUtils.decodeText(new Uint8Array(data)))
      }
    } else {
      json = data
    }

    if (json.asset === undefined || json.asset.version[0] < 2) {
      if (onError)
        onError(
          new Error(
            'THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported.'
          )
        )
      return
    }

    const parser = new GLTFParser(json, {
      path: path || this.resourcePath || '',
      crossOrigin: this.crossOrigin,
      requestHeader: this.requestHeader,
      manager: this.manager,
      ktx2Loader: this.ktx2Loader,
      meshoptDecoder: this.meshoptDecoder
    })

    parser.fileLoader.setRequestHeader(this.requestHeader)

    for (let i = 0; i < this.pluginCallbacks.length; i++) {
      const plugin = this.pluginCallbacks[i](parser)
      plugins[plugin.name] = plugin

      // Workaround to avoid determining as unknown extension
      // in addUnknownExtensionsToUserData().
      // Remove this workaround if we move all the existing
      // extension handlers to plugin system
      extensions[plugin.name] = true
    }

    if (json.extensionsUsed) {
      for (let i = 0; i < json.extensionsUsed.length; ++i) {
        const extensionName = json.extensionsUsed[i]
        const extensionsRequired = json.extensionsRequired || []

        switch (extensionName) {
          case EXTENSIONS.KHR_MATERIALS_UNLIT:
            extensions[extensionName] = new GLTFMaterialsUnlitExtension()
            break

          case EXTENSIONS.KHR_DRACO_MESH_COMPRESSION:
            extensions[extensionName] = new GLTFDracoMeshCompressionExtension(
              json,
              this.dracoLoader
            )
            break

          case EXTENSIONS.KHR_TEXTURE_TRANSFORM:
            extensions[extensionName] = new GLTFTextureTransformExtension()
            break

          case EXTENSIONS.KHR_MESH_QUANTIZATION:
            extensions[extensionName] = new GLTFMeshQuantizationExtension()
            break

          default:
            if (
              extensionsRequired.indexOf(extensionName) >= 0 &&
              plugins[extensionName] === undefined
            ) {
              console.warn(
                'THREE.GLTFLoader: Unknown extension "' + extensionName + '".'
              )
            }
        }
      }
    }

    parser.setExtensions(extensions)
    parser.setPlugins(plugins)
    parser.parse(onLoad, onError)
  }

  parseAsync(data, path) {
    const scope = this

    return new Promise(function (resolve, reject) {
      scope.parse(data, path, resolve, reject)
    })
  }
}

/* GLTFREGISTRY */

function GLTFRegistry() {
  let objects = {}

  return {
    get: function (key) {
      return objects[key]
    },

    add: function (key, object) {
      objects[key] = object
    },

    remove: function (key) {
      delete objects[key]
    },

    removeAll: function () {
      objects = {}
    }
  }
}

/*********************************/
/********** EXTENSIONS ***********/
/*********************************/

const EXTENSIONS = {
  KHR_BINARY_GLTF: 'KHR_binary_glTF',
  KHR_DRACO_MESH_COMPRESSION: 'KHR_draco_mesh_compression',
  KHR_LIGHTS_PUNCTUAL: 'KHR_lights_punctual',
  KHR_MATERIALS_CLEARCOAT: 'KHR_materials_clearcoat',
  KHR_MATERIALS_IOR: 'KHR_materials_ior',
  KHR_MATERIALS_SHEEN: 'KHR_materials_sheen',
  KHR_MATERIALS_SPECULAR: 'KHR_materials_specular',
  KHR_MATERIALS_TRANSMISSION: 'KHR_materials_transmission',
  KHR_MATERIALS_IRIDESCENCE: 'KHR_materials_iridescence',
  KHR_MATERIALS_UNLIT: 'KHR_materials_unlit',
  KHR_MATERIALS_VOLUME: 'KHR_materials_volume',
  KHR_TEXTURE_BASISU: 'KHR_texture_basisu',
  KHR_TEXTURE_TRANSFORM: 'KHR_texture_transform',
  KHR_MESH_QUANTIZATION: 'KHR_mesh_quantization',
  KHR_MATERIALS_EMISSIVE_STRENGTH: 'KHR_materials_emissive_strength',
  EXT_TEXTURE_WEBP: 'EXT_texture_webp',
  EXT_MESHOPT_COMPRESSION: 'EXT_meshopt_compression',
  EXT_MESH_GPU_INSTANCING: 'EXT_mesh_gpu_instancing'
}

/**
 * Punctual Lights Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_lights_punctual
 */
class GLTFLightsExtension {
  constructor(parser) {
    this.parser = parser
    this.name = EXTENSIONS.KHR_LIGHTS_PUNCTUAL

    // Object3D instance caches
    this.cache = {refs: {}, uses: {}}
  }

  _markDefs() {
    const parser = this.parser
    const nodeDefs = this.parser.json.nodes || []

    for (
      let nodeIndex = 0, nodeLength = nodeDefs.length;
      nodeIndex < nodeLength;
      nodeIndex++
    ) {
      const nodeDef = nodeDefs[nodeIndex]

      if (
        nodeDef.extensions &&
        nodeDef.extensions[this.name] &&
        nodeDef.extensions[this.name].light !== undefined
      ) {
        parser._addNodeRef(this.cache, nodeDef.extensions[this.name].light)
      }
    }
  }

  _loadLight(lightIndex) {
    const parser = this.parser
    const cacheKey = 'light:' + lightIndex
    let dependency = parser.cache.get(cacheKey)

    if (dependency) return dependency

    const json = parser.json
    const extensions = (json.extensions && json.extensions[this.name]) || {}
    const lightDefs = extensions.lights || []
    const lightDef = lightDefs[lightIndex]
    let lightNode

    const color = new Color(0xffffff)

    if (lightDef.color !== undefined) color.fromArray(lightDef.color)

    const range = lightDef.range !== undefined ? lightDef.range : 0

    switch (lightDef.type) {
      case 'directional':
        lightNode = new DirectionalLight(color)
        lightNode.target.position.set(0, 0, -1)
        lightNode.add(lightNode.target)
        break

      case 'point':
        lightNode = new PointLight(color)
        lightNode.distance = range
        break

      case 'spot':
        lightNode = new SpotLight(color)
        lightNode.distance = range
        // Handle spotlight properties.
        lightDef.spot = lightDef.spot || {}
        lightDef.spot.innerConeAngle =
          lightDef.spot.innerConeAngle !== undefined
            ? lightDef.spot.innerConeAngle
            : 0
        lightDef.spot.outerConeAngle =
          lightDef.spot.outerConeAngle !== undefined
            ? lightDef.spot.outerConeAngle
            : Math.PI / 4.0
        lightNode.angle = lightDef.spot.outerConeAngle
        lightNode.penumbra =
          1.0 - lightDef.spot.innerConeAngle / lightDef.spot.outerConeAngle
        lightNode.target.position.set(0, 0, -1)
        lightNode.add(lightNode.target)
        break

      default:
        throw new Error(
          'THREE.GLTFLoader: Unexpected light type: ' + lightDef.type
        )
    }

    // Some lights (e.g. spot) default to a position other than the origin. Reset the position
    // here, because node-level parsing will only override position if explicitly specified.
    lightNode.position.set(0, 0, 0)

    lightNode.decay = 2

    assignExtrasToUserData(lightNode, lightDef)

    if (lightDef.intensity !== undefined)
      lightNode.intensity = lightDef.intensity

    lightNode.name = parser.createUniqueName(
      lightDef.name || 'light_' + lightIndex
    )

    dependency = Promise.resolve(lightNode)

    parser.cache.add(cacheKey, dependency)

    return dependency
  }

  getDependency(type, index) {
    if (type !== 'light') return

    return this._loadLight(index)
  }

  createNodeAttachment(nodeIndex) {
    const self = this
    const parser = this.parser
    const json = parser.json
    const nodeDef = json.nodes[nodeIndex]
    const lightDef = (nodeDef.extensions && nodeDef.extensions[this.name]) || {}
    const lightIndex = lightDef.light

    if (lightIndex === undefined) return null

    return this._loadLight(lightIndex).then(function (light) {
      return parser._getNodeRef(self.cache, lightIndex, light)
    })
  }
}

/**
 * Unlit Materials Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_unlit
 */
class GLTFMaterialsUnlitExtension {
  constructor() {
    this.name = EXTENSIONS.KHR_MATERIALS_UNLIT
  }

  getMaterialType() {
    return MeshBasicMaterial
  }

  extendParams(materialParams, materialDef, parser) {
    const pending = []

    materialParams.color = new Color(1.0, 1.0, 1.0)
    materialParams.opacity = 1.0

    const metallicRoughness = materialDef.pbrMetallicRoughness

    if (metallicRoughness) {
      if (Array.isArray(metallicRoughness.baseColorFactor)) {
        const array = metallicRoughness.baseColorFactor

        materialParams.color.fromArray(array)
        materialParams.opacity = array[3]
      }

      if (metallicRoughness.baseColorTexture !== undefined) {
        pending.push(
          parser.assignTexture(
            materialParams,
            'map',
            metallicRoughness.baseColorTexture,
            sRGBEncoding
          )
        )
      }
    }

    return Promise.all(pending)
  }
}

/**
 * Materials Emissive Strength Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/blob/5768b3ce0ef32bc39cdf1bef10b948586635ead3/extensions/2.0/Khronos/KHR_materials_emissive_strength/README.md
 */
class GLTFMaterialsEmissiveStrengthExtension {
  constructor(parser) {
    this.parser = parser
    this.name = EXTENSIONS.KHR_MATERIALS_EMISSIVE_STRENGTH
  }

  extendMaterialParams(materialIndex, materialParams) {
    const parser = this.parser
    const materialDef = parser.json.materials[materialIndex]

    if (!materialDef.extensions || !materialDef.extensions[this.name]) {
      return Promise.resolve()
    }

    const emissiveStrength = materialDef.extensions[this.name].emissiveStrength

    if (emissiveStrength !== undefined) {
      materialParams.emissiveIntensity = emissiveStrength
    }

    return Promise.resolve()
  }
}

/**
 * Clearcoat Materials Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_clearcoat
 */
// class GLTFMaterialsClearcoatExtension {

//   constructor(parser) {

//     this.parser = parser;
//     this.name = EXTENSIONS.KHR_MATERIALS_CLEARCOAT;

//   }

//   getMaterialType(materialIndex) {

//     const parser = this.parser;
//     const materialDef = parser.json.materials[materialIndex];

//     if (!materialDef.extensions || !materialDef.extensions[this.name]) return null;

//     return MeshPhysicalMaterial;

//   }

//   extendMaterialParams(materialIndex, materialParams) {

//     const parser = this.parser;
//     const materialDef = parser.json.materials[materialIndex];

//     if (!materialDef.extensions || !materialDef.extensions[this.name]) {

//       return Promise.resolve();

//     }

//     const pending = [];

//     const extension = materialDef.extensions[this.name];

//     if (extension.clearcoatFactor !== undefined) {

//       materialParams.clearcoat = extension.clearcoatFactor;

//     }

//     if (extension.clearcoatTexture !== undefined) {

//       pending.push(parser.assignTexture(materialParams, 'clearcoatMap', extension.clearcoatTexture));

//     }

//     if (extension.clearcoatRoughnessFactor !== undefined) {

//       materialParams.clearcoatRoughness = extension.clearcoatRoughnessFactor;

//     }

//     if (extension.clearcoatRoughnessTexture !== undefined) {

//       pending.push(parser.assignTexture(materialParams, 'clearcoatRoughnessMap', extension.clearcoatRoughnessTexture));

//     }

//     if (extension.clearcoatNormalTexture !== undefined) {

//       pending.push(parser.assignTexture(materialParams, 'clearcoatNormalMap', extension.clearcoatNormalTexture));

//       if (extension.clearcoatNormalTexture.scale !== undefined) {

//         const scale = extension.clearcoatNormalTexture.scale;

//         materialParams.clearcoatNormalScale = new Vector2(scale, scale);

//       }

//     }

//     return Promise.all(pending);

//   }

// }

/**
 * Iridescence Materials Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_iridescence
 */
// class GLTFMaterialsIridescenceExtension {

//   constructor(parser) {

//     this.parser = parser;
//     this.name = EXTENSIONS.KHR_MATERIALS_IRIDESCENCE;

//   }

//   getMaterialType(materialIndex) {

//     const parser = this.parser;
//     const materialDef = parser.json.materials[materialIndex];

//     if (!materialDef.extensions || !materialDef.extensions[this.name]) return null;

//     return MeshPhysicalMaterial;

//   }

//   extendMaterialParams(materialIndex, materialParams) {

//     const parser = this.parser;
//     const materialDef = parser.json.materials[materialIndex];

//     if (!materialDef.extensions || !materialDef.extensions[this.name]) {

//       return Promise.resolve();

//     }

//     const pending = [];

//     const extension = materialDef.extensions[this.name];

//     if (extension.iridescenceFactor !== undefined) {

//       materialParams.iridescence = extension.iridescenceFactor;

//     }

//     if (extension.iridescenceTexture !== undefined) {

//       pending.push(parser.assignTexture(materialParams, 'iridescenceMap', extension.iridescenceTexture));

//     }

//     if (extension.iridescenceIor !== undefined) {

//       materialParams.iridescenceIOR = extension.iridescenceIor;

//     }

//     if (materialParams.iridescenceThicknessRange === undefined) {

//       materialParams.iridescenceThicknessRange = [100, 400];

//     }

//     if (extension.iridescenceThicknessMinimum !== undefined) {

//       materialParams.iridescenceThicknessRange[0] = extension.iridescenceThicknessMinimum;

//     }

//     if (extension.iridescenceThicknessMaximum !== undefined) {

//       materialParams.iridescenceThicknessRange[1] = extension.iridescenceThicknessMaximum;

//     }

//     if (extension.iridescenceThicknessTexture !== undefined) {

//       pending.push(parser.assignTexture(materialParams, 'iridescenceThicknessMap', extension.iridescenceThicknessTexture));

//     }

//     return Promise.all(pending);

//   }

// }

/**
 * Sheen Materials Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Khronos/KHR_materials_sheen
 */
class GLTFMaterialsSheenExtension {
  constructor(parser) {
    this.parser = parser
    this.name = EXTENSIONS.KHR_MATERIALS_SHEEN
  }

  getMaterialType(materialIndex) {
    const parser = this.parser
    const materialDef = parser.json.materials[materialIndex]

    if (!materialDef.extensions || !materialDef.extensions[this.name])
      return null

    return MeshPhysicalMaterial
  }

  extendMaterialParams(materialIndex, materialParams) {
    const parser = this.parser
    const materialDef = parser.json.materials[materialIndex]

    if (!materialDef.extensions || !materialDef.extensions[this.name]) {
      return Promise.resolve()
    }

    const pending = []

    materialParams.sheenColor = new Color(0, 0, 0)
    materialParams.sheenRoughness = 0
    materialParams.sheen = 1

    const extension = materialDef.extensions[this.name]

    if (extension.sheenColorFactor !== undefined) {
      materialParams.sheenColor.fromArray(extension.sheenColorFactor)
    }

    if (extension.sheenRoughnessFactor !== undefined) {
      materialParams.sheenRoughness = extension.sheenRoughnessFactor
    }

    if (extension.sheenColorTexture !== undefined) {
      pending.push(
        parser.assignTexture(
          materialParams,
          'sheenColorMap',
          extension.sheenColorTexture,
          sRGBEncoding
        )
      )
    }

    if (extension.sheenRoughnessTexture !== undefined) {
      pending.push(
        parser.assignTexture(
          materialParams,
          'sheenRoughnessMap',
          extension.sheenRoughnessTexture
        )
      )
    }

    return Promise.all(pending)
  }
}

/**
 * Transmission Materials Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_transmission
 * Draft: https://github.com/KhronosGroup/glTF/pull/1698
 */
// class GLTFMaterialsTransmissionExtension {

//   constructor(parser) {

//     this.parser = parser;
//     this.name = EXTENSIONS.KHR_MATERIALS_TRANSMISSION;

//   }

//   getMaterialType(materialIndex) {

//     const parser = this.parser;
//     const materialDef = parser.json.materials[materialIndex];

//     if (!materialDef.extensions || !materialDef.extensions[this.name]) return null;

//     return MeshPhysicalMaterial;

//   }

//   extendMaterialParams(materialIndex, materialParams) {

//     const parser = this.parser;
//     const materialDef = parser.json.materials[materialIndex];

//     if (!materialDef.extensions || !materialDef.extensions[this.name]) {

//       return Promise.resolve();

//     }

//     const pending = [];

//     const extension = materialDef.extensions[this.name];

//     if (extension.transmissionFactor !== undefined) {

//       materialParams.transmission = extension.transmissionFactor;

//     }

//     if (extension.transmissionTexture !== undefined) {

//       pending.push(parser.assignTexture(materialParams, 'transmissionMap', extension.transmissionTexture));

//     }

//     return Promise.all(pending);

//   }

// }

/**
 * Materials Volume Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_volume
 */
class GLTFMaterialsVolumeExtension {
  constructor(parser) {
    this.parser = parser
    this.name = EXTENSIONS.KHR_MATERIALS_VOLUME
  }

  getMaterialType(materialIndex) {
    const parser = this.parser
    const materialDef = parser.json.materials[materialIndex]

    if (!materialDef.extensions || !materialDef.extensions[this.name])
      return null

    return MeshPhysicalMaterial
  }

  extendMaterialParams(materialIndex, materialParams) {
    const parser = this.parser
    const materialDef = parser.json.materials[materialIndex]

    if (!materialDef.extensions || !materialDef.extensions[this.name]) {
      return Promise.resolve()
    }

    const pending = []

    const extension = materialDef.extensions[this.name]

    materialParams.thickness =
      extension.thicknessFactor !== undefined ? extension.thicknessFactor : 0

    if (extension.thicknessTexture !== undefined) {
      pending.push(
        parser.assignTexture(
          materialParams,
          'thicknessMap',
          extension.thicknessTexture
        )
      )
    }

    materialParams.attenuationDistance =
      extension.attenuationDistance || Infinity

    const colorArray = extension.attenuationColor || [1, 1, 1]
    materialParams.attenuationColor = new Color(
      colorArray[0],
      colorArray[1],
      colorArray[2]
    )

    return Promise.all(pending)
  }
}

/**
 * Materials ior Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_ior
 */
class GLTFMaterialsIorExtension {
  constructor(parser) {
    this.parser = parser
    this.name = EXTENSIONS.KHR_MATERIALS_IOR
  }

  getMaterialType(materialIndex) {
    const parser = this.parser
    const materialDef = parser.json.materials[materialIndex]

    if (!materialDef.extensions || !materialDef.extensions[this.name])
      return null

    return MeshPhysicalMaterial
  }

  extendMaterialParams(materialIndex, materialParams) {
    const parser = this.parser
    const materialDef = parser.json.materials[materialIndex]

    if (!materialDef.extensions || !materialDef.extensions[this.name]) {
      return Promise.resolve()
    }

    const extension = materialDef.extensions[this.name]

    materialParams.ior = extension.ior !== undefined ? extension.ior : 1.5

    return Promise.resolve()
  }
}

/**
 * Materials specular Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_specular
 */
class GLTFMaterialsSpecularExtension {
  constructor(parser) {
    this.parser = parser
    this.name = EXTENSIONS.KHR_MATERIALS_SPECULAR
  }

  getMaterialType(materialIndex) {
    const parser = this.parser
    const materialDef = parser.json.materials[materialIndex]

    if (!materialDef.extensions || !materialDef.extensions[this.name])
      return null

    return MeshPhysicalMaterial
  }

  extendMaterialParams(materialIndex, materialParams) {
    const parser = this.parser
    const materialDef = parser.json.materials[materialIndex]

    if (!materialDef.extensions || !materialDef.extensions[this.name]) {
      return Promise.resolve()
    }

    const pending = []

    const extension = materialDef.extensions[this.name]

    materialParams.specularIntensity =
      extension.specularFactor !== undefined ? extension.specularFactor : 1.0

    if (extension.specularTexture !== undefined) {
      pending.push(
        parser.assignTexture(
          materialParams,
          'specularIntensityMap',
          extension.specularTexture
        )
      )
    }

    const colorArray = extension.specularColorFactor || [1, 1, 1]
    materialParams.specularColor = new Color(
      colorArray[0],
      colorArray[1],
      colorArray[2]
    )

    if (extension.specularColorTexture !== undefined) {
      pending.push(
        parser.assignTexture(
          materialParams,
          'specularColorMap',
          extension.specularColorTexture,
          sRGBEncoding
        )
      )
    }

    return Promise.all(pending)
  }
}

/**
 * BasisU Texture Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_texture_basisu
 */
class GLTFTextureBasisUExtension {
  constructor(parser) {
    this.parser = parser
    this.name = EXTENSIONS.KHR_TEXTURE_BASISU
  }

  loadTexture(textureIndex) {
    const parser = this.parser
    const json = parser.json

    const textureDef = json.textures[textureIndex]

    if (!textureDef.extensions || !textureDef.extensions[this.name]) {
      return null
    }

    const extension = textureDef.extensions[this.name]
    const loader = parser.options.ktx2Loader

    if (!loader) {
      if (
        json.extensionsRequired &&
        json.extensionsRequired.indexOf(this.name) >= 0
      ) {
        throw new Error(
          'THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures'
        )
      } else {
        // Assumes that the extension is optional and that a fallback texture is present
        return null
      }
    }

    return parser.loadTextureImage(textureIndex, extension.source, loader)
  }
}

/**
 * WebP Texture Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Vendor/EXT_texture_webp
 */
class GLTFTextureWebPExtension {
  constructor(parser) {
    this.parser = parser
    this.name = EXTENSIONS.EXT_TEXTURE_WEBP
    this.isSupported = null
  }

  loadTexture(textureIndex) {
    const name = this.name
    const parser = this.parser
    const json = parser.json

    const textureDef = json.textures[textureIndex]

    if (!textureDef.extensions || !textureDef.extensions[name]) {
      return null
    }

    const extension = textureDef.extensions[name]
    const source = json.images[extension.source]

    let loader = parser.textureLoader
    if (source.uri) {
      const handler = parser.options.manager.getHandler(source.uri)
      if (handler !== null) loader = handler
    }

    return this.detectSupport().then(function (isSupported) {
      if (isSupported)
        return parser.loadTextureImage(textureIndex, extension.source, loader)

      if (
        json.extensionsRequired &&
        json.extensionsRequired.indexOf(name) >= 0
      ) {
        throw new Error(
          'THREE.GLTFLoader: WebP required by asset but unsupported.'
        )
      }

      // Fall back to PNG or JPEG.
      return parser.loadTexture(textureIndex)
    })
  }

  detectSupport() {
    if (!this.isSupported) {
      this.isSupported = new Promise(function (resolve) {
        const image = new Image()

        // Lossy test image. Support for lossy images doesn't guarantee support for all
        // WebP images, unfortunately.
        image.src =
          'data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA'

        image.onload = image.onerror = function () {
          resolve(image.height === 1)
        }
      })
    }

    return this.isSupported
  }
}

/**
 * meshopt BufferView Compression Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Vendor/EXT_meshopt_compression
 */
class GLTFMeshoptCompression {
  constructor(parser) {
    this.name = EXTENSIONS.EXT_MESHOPT_COMPRESSION
    this.parser = parser
  }

  loadBufferView(index) {
    const json = this.parser.json
    const bufferView = json.bufferViews[index]

    if (bufferView.extensions && bufferView.extensions[this.name]) {
      const extensionDef = bufferView.extensions[this.name]

      const buffer = this.parser.getDependency('buffer', extensionDef.buffer)
      const decoder = this.parser.options.meshoptDecoder

      if (!decoder || !decoder.supported) {
        if (
          json.extensionsRequired &&
          json.extensionsRequired.indexOf(this.name) >= 0
        ) {
          throw new Error(
            'THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files'
          )
        } else {
          // Assumes that the extension is optional and that fallback buffer data is present
          return null
        }
      }

      return buffer.then(function (res) {
        const byteOffset = extensionDef.byteOffset || 0
        const byteLength = extensionDef.byteLength || 0

        const count = extensionDef.count
        const stride = extensionDef.byteStride

        const source = new Uint8Array(res, byteOffset, byteLength)

        if (decoder.decodeGltfBufferAsync) {
          return decoder
            .decodeGltfBufferAsync(
              count,
              stride,
              source,
              extensionDef.mode,
              extensionDef.filter
            )
            .then(function (res) {
              return res.buffer
            })
        } else {
          // Support for MeshoptDecoder 0.18 or earlier, without decodeGltfBufferAsync
          return decoder.ready.then(function () {
            const result = new ArrayBuffer(count * stride)
            decoder.decodeGltfBuffer(
              new Uint8Array(result),
              count,
              stride,
              source,
              extensionDef.mode,
              extensionDef.filter
            )
            return result
          })
        }
      })
    } else {
      return null
    }
  }
}

/**
 * GPU Instancing Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Vendor/EXT_mesh_gpu_instancing
 *
 */
class GLTFMeshGpuInstancing {
  constructor(parser) {
    this.name = EXTENSIONS.EXT_MESH_GPU_INSTANCING
    this.parser = parser
  }

  createNodeMesh(nodeIndex) {
    const json = this.parser.json
    const nodeDef = json.nodes[nodeIndex]

    if (
      !nodeDef.extensions ||
      !nodeDef.extensions[this.name] ||
      nodeDef.mesh === undefined
    ) {
      return null
    }

    const meshDef = json.meshes[nodeDef.mesh]

    // No Points or Lines + Instancing support yet

    for (const primitive of meshDef.primitives) {
      if (
        primitive.mode !== WEBGL_CONSTANTS.TRIANGLES &&
        primitive.mode !== WEBGL_CONSTANTS.TRIANGLE_STRIP &&
        primitive.mode !== WEBGL_CONSTANTS.TRIANGLE_FAN &&
        primitive.mode !== undefined
      ) {
        return null
      }
    }

    const extensionDef = nodeDef.extensions[this.name]
    const attributesDef = extensionDef.attributes

    // @TODO: Can we support InstancedMesh + SkinnedMesh?

    const pending = []
    const attributes = {}

    for (const key in attributesDef) {
      pending.push(
        this.parser
          .getDependency('accessor', attributesDef[key])
          .then((accessor) => {
            attributes[key] = accessor
            return attributes[key]
          })
      )
    }

    if (pending.length < 1) {
      return null
    }

    pending.push(this.parser.createNodeMesh(nodeIndex))

    return Promise.all(pending).then((results) => {
      const nodeObject = results.pop()
      const meshes = nodeObject.isGroup ? nodeObject.children : [nodeObject]
      const count = results[0].count // All attribute counts should be same
      const instancedMeshes = []

      for (const mesh of meshes) {
        // Temporal variables
        const m = new Matrix4()
        const p = new Vector3()
        const q = new Quaternion()
        const s = new Vector3(1, 1, 1)

        const instancedMesh = new InstancedMesh(
          mesh.geometry,
          mesh.material,
          count
        )

        for (let i = 0; i < count; i++) {
          if (attributes.TRANSLATION) {
            p.fromBufferAttribute(attributes.TRANSLATION, i)
          }

          if (attributes.ROTATION) {
            q.fromBufferAttribute(attributes.ROTATION, i)
          }

          if (attributes.SCALE) {
            s.fromBufferAttribute(attributes.SCALE, i)
          }

          instancedMesh.setMatrixAt(i, m.compose(p, q, s))
        }

        // Add instance attributes to the geometry, excluding TRS.
        for (const attributeName in attributes) {
          if (
            attributeName !== 'TRANSLATION' &&
            attributeName !== 'ROTATION' &&
            attributeName !== 'SCALE'
          ) {
            mesh.geometry.setAttribute(attributeName, attributes[attributeName])
          }
        }

        // Just in case
        Object3D.prototype.copy.call(instancedMesh, mesh)

        // https://github.com/mrdoob/three.js/issues/18334
        instancedMesh.frustumCulled = false
        this.parser.assignFinalMaterial(instancedMesh)

        instancedMeshes.push(instancedMesh)
      }

      if (nodeObject.isGroup) {
        nodeObject.clear()

        nodeObject.add(...instancedMeshes)

        return nodeObject
      }

      return instancedMeshes[0]
    })
  }
}

/* BINARY EXTENSION */
const BINARY_EXTENSION_HEADER_MAGIC = 'glTF'
const BINARY_EXTENSION_HEADER_LENGTH = 12
const BINARY_EXTENSION_CHUNK_TYPES = {JSON: 0x4e4f534a, BIN: 0x004e4942}

class GLTFBinaryExtension {
  constructor(data) {
    this.name = EXTENSIONS.KHR_BINARY_GLTF
    this.content = null
    this.body = null

    const headerView = new DataView(data, 0, BINARY_EXTENSION_HEADER_LENGTH)

    this.header = {
      magic: LoaderUtils.decodeText(new Uint8Array(data.slice(0, 4))),
      version: headerView.getUint32(4, true),
      length: headerView.getUint32(8, true)
    }

    if (this.header.magic !== BINARY_EXTENSION_HEADER_MAGIC) {
      throw new Error('THREE.GLTFLoader: Unsupported glTF-Binary header.')
    } else if (this.header.version < 2.0) {
      throw new Error('THREE.GLTFLoader: Legacy binary file detected.')
    }

    const chunkContentsLength =
      this.header.length - BINARY_EXTENSION_HEADER_LENGTH
    const chunkView = new DataView(data, BINARY_EXTENSION_HEADER_LENGTH)
    let chunkIndex = 0

    while (chunkIndex < chunkContentsLength) {
      const chunkLength = chunkView.getUint32(chunkIndex, true)
      chunkIndex += 4

      const chunkType = chunkView.getUint32(chunkIndex, true)
      chunkIndex += 4

      if (chunkType === BINARY_EXTENSION_CHUNK_TYPES.JSON) {
        const contentArray = new Uint8Array(
          data,
          BINARY_EXTENSION_HEADER_LENGTH + chunkIndex,
          chunkLength
        )
        this.content = LoaderUtils.decodeText(contentArray)
      } else if (chunkType === BINARY_EXTENSION_CHUNK_TYPES.BIN) {
        const byteOffset = BINARY_EXTENSION_HEADER_LENGTH + chunkIndex
        this.body = data.slice(byteOffset, byteOffset + chunkLength)
      }

      // Clients must ignore chunks with unknown types.

      chunkIndex += chunkLength
    }

    if (this.content === null) {
      throw new Error('THREE.GLTFLoader: JSON content not found.')
    }
  }
}

/**
 * DRACO Mesh Compression Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_draco_mesh_compression
 */
class GLTFDracoMeshCompressionExtension {
  constructor(json, dracoLoader) {
    if (!dracoLoader) {
      throw new Error('THREE.GLTFLoader: No DRACOLoader instance provided.')
    }

    this.name = EXTENSIONS.KHR_DRACO_MESH_COMPRESSION
    this.json = json
    this.dracoLoader = dracoLoader
    this.dracoLoader.preload()
  }

  decodePrimitive(primitive, parser) {
    const json = this.json
    const dracoLoader = this.dracoLoader
    const bufferViewIndex = primitive.extensions[this.name].bufferView
    const gltfAttributeMap = primitive.extensions[this.name].attributes
    const threeAttributeMap = {}
    const attributeNormalizedMap = {}
    const attributeTypeMap = {}

    for (const attributeName in gltfAttributeMap) {
      const threeAttributeName =
        ATTRIBUTES[attributeName] || attributeName.toLowerCase()

      threeAttributeMap[threeAttributeName] = gltfAttributeMap[attributeName]
    }

    for (const attributeName in primitive.attributes) {
      const threeAttributeName =
        ATTRIBUTES[attributeName] || attributeName.toLowerCase()

      if (gltfAttributeMap[attributeName] !== undefined) {
        const accessorDef = json.accessors[primitive.attributes[attributeName]]
        const componentType = WEBGL_COMPONENT_TYPES[accessorDef.componentType]

        attributeTypeMap[threeAttributeName] = componentType.name
        attributeNormalizedMap[threeAttributeName] =
          accessorDef.normalized === true
      }
    }

    return parser
      .getDependency('bufferView', bufferViewIndex)
      .then(function (bufferView) {
        return new Promise(function (resolve) {
          dracoLoader.decodeDracoFile(
            bufferView,
            function (geometry) {
              for (const attributeName in geometry.attributes) {
                const attribute = geometry.attributes[attributeName]
                const normalized = attributeNormalizedMap[attributeName]

                if (normalized !== undefined) attribute.normalized = normalized
              }

              resolve(geometry)
            },
            threeAttributeMap,
            attributeTypeMap
          )
        })
      })
  }
}

/**
 * Texture Transform Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_texture_transform
 */
class GLTFTextureTransformExtension {
  constructor() {
    this.name = EXTENSIONS.KHR_TEXTURE_TRANSFORM
  }

  extendTexture(texture, transform) {
    if (transform.texCoord !== undefined) {
      console.warn(
        'THREE.GLTFLoader: Custom UV sets in "' +
          this.name +
          '" extension not yet supported.'
      )
    }

    if (
      transform.offset === undefined &&
      transform.rotation === undefined &&
      transform.scale === undefined
    ) {
      // See https://github.com/mrdoob/three.js/issues/21819.
      return texture
    }

    texture = texture.clone()

    if (transform.offset !== undefined) {
      texture.offset.fromArray(transform.offset)
    }

    if (transform.rotation !== undefined) {
      texture.rotation = transform.rotation
    }

    if (transform.scale !== undefined) {
      texture.repeat.fromArray(transform.scale)
    }

    texture.needsUpdate = true

    return texture
  }
}

/**
 * Mesh Quantization Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_mesh_quantization
 */
class GLTFMeshQuantizationExtension {
  constructor() {
    this.name = EXTENSIONS.KHR_MESH_QUANTIZATION
  }
}

/*********************************/
/********** INTERPOLATION ********/
/*********************************/

// Spline Interpolation
// Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#appendix-c-spline-interpolation
class GLTFCubicSplineInterpolant extends Interpolant {
  constructor(parameterPositions, sampleValues, sampleSize, resultBuffer) {
    super(parameterPositions, sampleValues, sampleSize, resultBuffer)
  }

  copySampleValue_(index) {
    // Copies a sample value to the result buffer. See description of glTF
    // CUBICSPLINE values layout in interpolate_() function below.

    const result = this.resultBuffer,
      values = this.sampleValues,
      valueSize = this.valueSize,
      offset = index * valueSize * 3 + valueSize

    for (let i = 0; i !== valueSize; i++) {
      result[i] = values[offset + i]
    }

    return result
  }

  interpolate_(i1, t0, t, t1) {
    const result = this.resultBuffer
    const values = this.sampleValues
    const stride = this.valueSize

    const stride2 = stride * 2
    const stride3 = stride * 3

    const td = t1 - t0

    const p = (t - t0) / td
    const pp = p * p
    const ppp = pp * p

    const offset1 = i1 * stride3
    const offset0 = offset1 - stride3

    const s2 = -2 * ppp + 3 * pp
    const s3 = ppp - pp
    const s0 = 1 - s2
    const s1 = s3 - pp + p

    // Layout of keyframe output values for CUBICSPLINE animations:
    //   [ inTangent_1, splineVertex_1, outTangent_1, inTangent_2, splineVertex_2, ... ]
    for (let i = 0; i !== stride; i++) {
      const p0 = values[offset0 + i + stride] // splineVertex_k
      const m0 = values[offset0 + i + stride2] * td // outTangent_k * (t_k+1 - t_k)
      const p1 = values[offset1 + i + stride] // splineVertex_k+1
      const m1 = values[offset1 + i] * td // inTangent_k+1 * (t_k+1 - t_k)

      result[i] = s0 * p0 + s1 * m0 + s2 * p1 + s3 * m1
    }

    return result
  }
}

const _q = new Quaternion()

class GLTFCubicSplineQuaternionInterpolant extends GLTFCubicSplineInterpolant {
  interpolate_(i1, t0, t, t1) {
    const result = super.interpolate_(i1, t0, t, t1)

    _q.fromArray(result).normalize().toArray(result)

    return result
  }
}

/*********************************/
/********** INTERNALS ************/
/*********************************/

/* CONSTANTS */

// const WEBGL_CONSTANTS = {
//   FLOAT: 5126,
//   //FLOAT_MAT2: 35674,
//   FLOAT_MAT3: 35675,
//   FLOAT_MAT4: 35676,
//   FLOAT_VEC2: 35664,
//   FLOAT_VEC3: 35665,
//   FLOAT_VEC4: 35666,
//   LINEAR: 9729,
//   REPEAT: 10497,
//   SAMPLER_2D: 35678,
//   POINTS: 0,
//   LINES: 1,
//   LINE_LOOP: 2,
//   LINE_STRIP: 3,
//   TRIANGLES: 4,
//   TRIANGLE_STRIP: 5,
//   TRIANGLE_FAN: 6,
//   UNSIGNED_BYTE: 5121,
//   UNSIGNED_SHORT: 5123
// };

const WEBGL_COMPONENT_TYPES = {
  5120: Int8Array,
  5121: Uint8Array,
  5122: Int16Array,
  5123: Uint16Array,
  5125: Uint32Array,
  5126: Float32Array
}

const WEBGL_FILTERS = {
  9728: NearestFilter,
  9729: LinearFilter,
  9984: NearestMipmapNearestFilter,
  9985: LinearMipmapNearestFilter,
  9986: NearestMipmapLinearFilter,
  9987: LinearMipmapLinearFilter
}

const WEBGL_WRAPPINGS = {
  33071: ClampToEdgeWrapping,
  33648: MirroredRepeatWrapping,
  10497: RepeatWrapping
}

const WEBGL_TYPE_SIZES = {
  SCALAR: 1,
  VEC2: 2,
  VEC3: 3,
  VEC4: 4,
  MAT2: 4,
  MAT3: 9,
  MAT4: 16
}

const ATTRIBUTES = {
  POSITION: 'position',
  NORMAL: 'normal',
  TANGENT: 'tangent',
  TEXCOORD_0: 'uv',
  TEXCOORD_1: 'uv2',
  COLOR_0: 'color',
  WEIGHTS_0: 'skinWeight',
  JOINTS_0: 'skinIndex'
}

// const PATH_PROPERTIES = {
//   scale: 'scale',
//   translation: 'position',
//   rotation: 'quaternion',
//   weights: 'morphTargetInfluences'
// };

const INTERPOLATION = {
  CUBICSPLINE: undefined, // We use a custom interpolant (GLTFCubicSplineInterpolation) for CUBICSPLINE tracks. Each
  // keyframe track will be initialized with a default interpolation type, then modified.
  LINEAR: InterpolateLinear,
  STEP: InterpolateDiscrete
}

const ALPHA_MODES = {
  OPAQUE: 'OPAQUE',
  MASK: 'MASK',
  BLEND: 'BLEND'
}

/**
 * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#default-material
 */
function createDefaultMaterial(cache) {
  if (cache['DefaultMaterial'] === undefined) {
    cache['DefaultMaterial'] = new MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x000000,
      metalness: 1,
      roughness: 1,
      transparent: false,
      depthTest: true,
      side: FrontSide
    })
  }

  return cache['DefaultMaterial']
}

function addUnknownExtensionsToUserData(knownExtensions, object, objectDef) {
  // Add unknown glTF extensions to an object's userData.

  for (const name in objectDef.extensions) {
    if (knownExtensions[name] === undefined) {
      object.userData.gltfExtensions = object.userData.gltfExtensions || {}
      object.userData.gltfExtensions[name] = objectDef.extensions[name]
    }
  }
}

/**
 * @param {Object3D|Material|BufferGeometry} object
 * @param {GLTF.definition} gltfDef
 */
function assignExtrasToUserData(object, gltfDef) {
  if (gltfDef.extras !== undefined) {
    if (typeof gltfDef.extras === 'object') {
      Object.assign(object.userData, gltfDef.extras)
    } else {
      console.warn(
        'THREE.GLTFLoader: Ignoring primitive type .extras, ' + gltfDef.extras
      )
    }
  }
}

/**
 * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#morph-targets
 *
 * @param {BufferGeometry} geometry
 * @param {Array<GLTF.Target>} targets
 * @param {GLTFParser} parser
 * @return {Promise<BufferGeometry>}
 */
function addMorphTargets(geometry, targets, parser) {
  let hasMorphPosition = false
  let hasMorphNormal = false
  let hasMorphColor = false

  for (let i = 0, il = targets.length; i < il; i++) {
    const target = targets[i]

    if (target.POSITION !== undefined) hasMorphPosition = true
    if (target.NORMAL !== undefined) hasMorphNormal = true
    if (target.COLOR_0 !== undefined) hasMorphColor = true

    if (hasMorphPosition && hasMorphNormal && hasMorphColor) break
  }

  if (!hasMorphPosition && !hasMorphNormal && !hasMorphColor)
    return Promise.resolve(geometry)

  const pendingPositionAccessors = []
  const pendingNormalAccessors = []
  const pendingColorAccessors = []

  for (let i = 0, il = targets.length; i < il; i++) {
    const target = targets[i]

    if (hasMorphPosition) {
      const pendingAccessor =
        target.POSITION !== undefined
          ? parser.getDependency('accessor', target.POSITION)
          : geometry.attributes.position

      pendingPositionAccessors.push(pendingAccessor)
    }

    if (hasMorphNormal) {
      const pendingAccessor =
        target.NORMAL !== undefined
          ? parser.getDependency('accessor', target.NORMAL)
          : geometry.attributes.normal

      pendingNormalAccessors.push(pendingAccessor)
    }

    if (hasMorphColor) {
      const pendingAccessor =
        target.COLOR_0 !== undefined
          ? parser.getDependency('accessor', target.COLOR_0)
          : geometry.attributes.color

      pendingColorAccessors.push(pendingAccessor)
    }
  }

  return Promise.all([
    Promise.all(pendingPositionAccessors),
    Promise.all(pendingNormalAccessors),
    Promise.all(pendingColorAccessors)
  ]).then(function (accessors) {
    const morphPositions = accessors[0]
    const morphNormals = accessors[1]
    const morphColors = accessors[2]

    if (hasMorphPosition) geometry.morphAttributes.position = morphPositions
    if (hasMorphNormal) geometry.morphAttributes.normal = morphNormals
    if (hasMorphColor) geometry.morphAttributes.color = morphColors
    geometry.morphTargetsRelative = true

    return geometry
  })
}

/**
 * @param {Mesh} mesh
 * @param {GLTF.Mesh} meshDef
 */
function updateMorphTargets(mesh, meshDef) {
  mesh.updateMorphTargets()

  if (meshDef.weights !== undefined) {
    for (let i = 0, il = meshDef.weights.length; i < il; i++) {
      mesh.morphTargetInfluences[i] = meshDef.weights[i]
    }
  }

  // .extras has user-defined data, so check that .extras.targetNames is an array.
  if (meshDef.extras && Array.isArray(meshDef.extras.targetNames)) {
    const targetNames = meshDef.extras.targetNames

    if (mesh.morphTargetInfluences.length === targetNames.length) {
      mesh.morphTargetDictionary = {}

      for (let i = 0, il = targetNames.length; i < il; i++) {
        mesh.morphTargetDictionary[targetNames[i]] = i
      }
    } else {
      console.warn(
        'THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.'
      )
    }
  }
}

function createPrimitiveKey(primitiveDef) {
  const dracoExtension =
    primitiveDef.extensions &&
    primitiveDef.extensions[EXTENSIONS.KHR_DRACO_MESH_COMPRESSION]
  let geometryKey

  if (dracoExtension) {
    geometryKey =
      'draco:' +
      dracoExtension.bufferView +
      ':' +
      dracoExtension.indices +
      ':' +
      createAttributesKey(dracoExtension.attributes)
  } else {
    geometryKey =
      primitiveDef.indices +
      ':' +
      createAttributesKey(primitiveDef.attributes) +
      ':' +
      primitiveDef.mode
  }

  return geometryKey
}

function createAttributesKey(attributes) {
  let attributesKey = ''

  const keys = Object.keys(attributes).sort()

  for (let i = 0, il = keys.length; i < il; i++) {
    attributesKey += keys[i] + ':' + attributes[keys[i]] + ';'
  }

  return attributesKey
}

function getNormalizedComponentScale(constructor) {
  // Reference:
  // https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_mesh_quantization#encoding-quantized-data

  switch (constructor) {
    case Int8Array:
      return 1 / 127

    case Uint8Array:
      return 1 / 255

    case Int16Array:
      return 1 / 32767

    case Uint16Array:
      return 1 / 65535

    default:
      throw new Error(
        'THREE.GLTFLoader: Unsupported normalized accessor component type.'
      )
  }
}

function getImageURIMimeType(uri) {
  if (
    uri.search(/\.jpe?g($|\?)/i) > 0 ||
    uri.search(/^data\:image\/jpeg/) === 0
  )
    return 'image/jpeg'
  if (uri.search(/\.webp($|\?)/i) > 0 || uri.search(/^data\:image\/webp/) === 0)
    return 'image/webp'

  return 'image/png'
}

/* GLTF PARSER */

class GLTFParser {
  constructor(json = {}, options = {}) {
    this.json = json
    this.extensions = {}
    this.plugins = {}
    this.options = options

    // loader object cache
    this.cache = new GLTFRegistry()

    // associations between Three.js objects and glTF elements
    this.associations = new Map()

    // BufferGeometry caching
    this.primitiveCache = {}

    // Object3D instance caches
    this.meshCache = {refs: {}, uses: {}}
    this.cameraCache = {refs: {}, uses: {}}
    this.lightCache = {refs: {}, uses: {}}

    this.sourceCache = {}
    this.textureCache = {}

    // Track node names, to ensure no duplicates
    this.nodeNamesUsed = {}

    // Use an ImageBitmapLoader if imageBitmaps are supported. Moves much of the
    // expensive work of uploading a texture to the GPU off the main thread.

    let isSafari = false
    let isFirefox = false
    let firefoxVersion = -1

    if (typeof navigator !== 'undefined') {
      isSafari =
        /^((?!chrome|android).)*safari/i.test(navigator.userAgent) === true
      isFirefox = navigator.userAgent.indexOf('Firefox') > -1
      firefoxVersion = isFirefox
        ? navigator.userAgent.match(/Firefox\/([0-9]+)\./)[1]
        : -1
    }

    if (
      typeof createImageBitmap === 'undefined' ||
      isSafari ||
      (isFirefox && firefoxVersion < 98)
    ) {
      this.textureLoader = new TextureLoader(this.options.manager)
    } else {
      this.textureLoader = new ImageBitmapLoader(this.options.manager)
    }

    this.textureLoader.setCrossOrigin(this.options.crossOrigin)
    this.textureLoader.setRequestHeader(this.options.requestHeader)

    this.fileLoader = new FileLoader(this.options.manager)
    this.fileLoader.setResponseType('arraybuffer')

    if (this.options.crossOrigin === 'use-credentials') {
      this.fileLoader.setWithCredentials(true)
    }
  }

  setExtensions(extensions) {
    this.extensions = extensions
  }

  setPlugins(plugins) {
    this.plugins = plugins
  }

  parse(onLoad, onError) {
    const parser = this
    const json = this.json
    const extensions = this.extensions

    // Clear the loader cache
    this.cache.removeAll()

    // Mark the special nodes/meshes in json for efficient parse
    this._invokeAll(function (ext) {
      return ext._markDefs && ext._markDefs()
    })

    Promise.all(
      this._invokeAll(function (ext) {
        return ext.beforeRoot && ext.beforeRoot()
      })
    )
      .then(function () {
        return Promise.all([
          parser.getDependencies('scene'),
          parser.getDependencies('animation'),
          parser.getDependencies('camera')
        ])
      })
      .then(function (dependencies) {
        const result = {
          scene: dependencies[0][json.scene || 0],
          scenes: dependencies[0],
          animations: dependencies[1],
          cameras: dependencies[2],
          asset: json.asset,
          parser: parser,
          userData: {}
        }

        addUnknownExtensionsToUserData(extensions, result, json)

        assignExtrasToUserData(result, json)

        Promise.all(
          parser._invokeAll(function (ext) {
            return ext.afterRoot && ext.afterRoot(result)
          })
        ).then(function () {
          onLoad(result)
        })
      })
      .catch(onError)
  }

  /**
   * Marks the special nodes/meshes in json for efficient parse.
   */
  _markDefs() {
    const nodeDefs = this.json.nodes || []
    const skinDefs = this.json.skins || []
    const meshDefs = this.json.meshes || []

    // Nothing in the node definition indicates whether it is a Bone or an
    // Object3D. Use the skins' joint references to mark bones.
    for (
      let skinIndex = 0, skinLength = skinDefs.length;
      skinIndex < skinLength;
      skinIndex++
    ) {
      const joints = skinDefs[skinIndex].joints

      for (let i = 0, il = joints.length; i < il; i++) {
        nodeDefs[joints[i]].isBone = true
      }
    }

    // Iterate over all nodes, marking references to shared resources,
    // as well as skeleton joints.
    for (
      let nodeIndex = 0, nodeLength = nodeDefs.length;
      nodeIndex < nodeLength;
      nodeIndex++
    ) {
      const nodeDef = nodeDefs[nodeIndex]

      if (nodeDef.mesh !== undefined) {
        this._addNodeRef(this.meshCache, nodeDef.mesh)

        // Nothing in the mesh definition indicates whether it is
        // a SkinnedMesh or Mesh. Use the node's mesh reference
        // to mark SkinnedMesh if node has skin.
        if (nodeDef.skin !== undefined) {
          meshDefs[nodeDef.mesh].isSkinnedMesh = true
        }
      }

      if (nodeDef.camera !== undefined) {
        this._addNodeRef(this.cameraCache, nodeDef.camera)
      }
    }
  }

  /**
   * Counts references to shared node / Object3D resources. These resources
   * can be reused, or "instantiated", at multiple nodes in the scene
   * hierarchy. Mesh, Camera, and Light instances are instantiated and must
   * be marked. Non-scenegraph resources (like Materials, Geometries, and
   * Textures) can be reused directly and are not marked here.
   *
   * Example: CesiumMilkTruck sample model reuses "Wheel" meshes.
   */
  _addNodeRef(cache, index) {
    if (index === undefined) return

    if (cache.refs[index] === undefined) {
      cache.refs[index] = cache.uses[index] = 0
    }

    cache.refs[index]++
  }

  /** Returns a reference to a shared resource, cloning it if necessary. */
  _getNodeRef(cache, index, object) {
    if (cache.refs[index] <= 1) return object

    const ref = object.clone()

    // Propagates mappings to the cloned object, prevents mappings on the
    // original object from being lost.
    const updateMappings = (original, clone) => {
      const mappings = this.associations.get(original)
      if (mappings != null) {
        this.associations.set(clone, mappings)
      }

      for (const [i, child] of original.children.entries()) {
        updateMappings(child, clone.children[i])
      }
    }

    updateMappings(object, ref)

    ref.name += '_instance_' + cache.uses[index]++

    return ref
  }

  _invokeOne(func) {
    const extensions = Object.values(this.plugins)
    extensions.push(this)

    for (let i = 0; i < extensions.length; i++) {
      const result = func(extensions[i])

      if (result) return result
    }

    return null
  }

  _invokeAll(func) {
    const extensions = Object.values(this.plugins)
    extensions.unshift(this)

    const pending = []

    for (let i = 0; i < extensions.length; i++) {
      const result = func(extensions[i])

      if (result) pending.push(result)
    }

    return pending
  }

  /**
   * Requests the specified dependency asynchronously, with caching.
   * @param {string} type
   * @param {number} index
   * @return {Promise<Object3D|Material|THREE.Texture|AnimationClip|ArrayBuffer|Object>}
   */
  getDependency(type, index) {
    const cacheKey = type + ':' + index
    let dependency = this.cache.get(cacheKey)

    if (!dependency) {
      switch (type) {
        case 'scene':
          dependency = this.loadScene(index)
          break

        case 'node':
          dependency = this.loadNode(index)
          break

        case 'mesh':
          dependency = this._invokeOne(function (ext) {
            return ext.loadMesh && ext.loadMesh(index)
          })
          break

        case 'accessor':
          dependency = this.loadAccessor(index)
          break

        case 'bufferView':
          dependency = this._invokeOne(function (ext) {
            return ext.loadBufferView && ext.loadBufferView(index)
          })
          break

        case 'buffer':
          dependency = this.loadBuffer(index)
          break

        case 'material':
          dependency = this._invokeOne(function (ext) {
            return ext.loadMaterial && ext.loadMaterial(index)
          })
          break

        case 'texture':
          dependency = this._invokeOne(function (ext) {
            return ext.loadTexture && ext.loadTexture(index)
          })
          break

        case 'skin':
          dependency = this.loadSkin(index)
          break

        case 'animation':
          dependency = this._invokeOne(function (ext) {
            return ext.loadAnimation && ext.loadAnimation(index)
          })
          break

        case 'camera':
          dependency = this.loadCamera(index)
          break

        default:
          dependency = this._invokeOne(function (ext) {
            return (
              ext != this && ext.getDependency && ext.getDependency(type, index)
            )
          })

          if (!dependency) {
            throw new Error('Unknown type: ' + type)
          }

          break
      }

      this.cache.add(cacheKey, dependency)
    }

    return dependency
  }

  /**
   * Requests all dependencies of the specified type asynchronously, with caching.
   * @param {string} type
   * @return {Promise<Array<Object>>}
   */
  getDependencies(type) {
    let dependencies = this.cache.get(type)

    if (!dependencies) {
      const parser = this
      const defs = this.json[type + (type === 'mesh' ? 'es' : 's')] || []

      dependencies = Promise.all(
        defs.map(function (def, index) {
          return parser.getDependency(type, index)
        })
      )

      this.cache.add(type, dependencies)
    }

    return dependencies
  }

  /**
   * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#buffers-and-buffer-views
   * @param {number} bufferIndex
   * @return {Promise<ArrayBuffer>}
   */
  loadBuffer(bufferIndex) {
    const bufferDef = this.json.buffers[bufferIndex]
    const loader = this.fileLoader

    if (bufferDef.type && bufferDef.type !== 'arraybuffer') {
      throw new Error(
        'THREE.GLTFLoader: ' + bufferDef.type + ' buffer type is not supported.'
      )
    }

    // If present, GLB container is required to be the first buffer.
    if (bufferDef.uri === undefined && bufferIndex === 0) {
      return Promise.resolve(this.extensions[EXTENSIONS.KHR_BINARY_GLTF].body)
    }

    const options = this.options

    return new Promise(function (resolve, reject) {
      loader.load(
        LoaderUtils.resolveURL(bufferDef.uri, options.path),
        resolve,
        undefined,
        function () {
          reject(
            new Error(
              'THREE.GLTFLoader: Failed to load buffer "' + bufferDef.uri + '".'
            )
          )
        }
      )
    })
  }

  /**
   * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#buffers-and-buffer-views
   * @param {number} bufferViewIndex
   * @return {Promise<ArrayBuffer>}
   */
  loadBufferView(bufferViewIndex) {
    const bufferViewDef = this.json.bufferViews[bufferViewIndex]

    return this.getDependency('buffer', bufferViewDef.buffer).then(function (
      buffer
    ) {
      const byteLength = bufferViewDef.byteLength || 0
      const byteOffset = bufferViewDef.byteOffset || 0
      return buffer.slice(byteOffset, byteOffset + byteLength)
    })
  }

  /**
   * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#accessors
   * @param {number} accessorIndex
   * @return {Promise<BufferAttribute|InterleavedBufferAttribute>}
   */
  loadAccessor(accessorIndex) {
    const parser = this
    const json = this.json

    const accessorDef = this.json.accessors[accessorIndex]

    if (
      accessorDef.bufferView === undefined &&
      accessorDef.sparse === undefined
    ) {
      const itemSize = WEBGL_TYPE_SIZES[accessorDef.type]
      const TypedArray = WEBGL_COMPONENT_TYPES[accessorDef.componentType]
      const normalized = accessorDef.normalized === true

      const array = new TypedArray(accessorDef.count * itemSize)
      return Promise.resolve(new BufferAttribute(array, itemSize, normalized))
    }

    const pendingBufferViews = []

    if (accessorDef.bufferView !== undefined) {
      pendingBufferViews.push(
        this.getDependency('bufferView', accessorDef.bufferView)
      )
    } else {
      pendingBufferViews.push(null)
    }

    if (accessorDef.sparse !== undefined) {
      pendingBufferViews.push(
        this.getDependency('bufferView', accessorDef.sparse.indices.bufferView)
      )
      pendingBufferViews.push(
        this.getDependency('bufferView', accessorDef.sparse.values.bufferView)
      )
    }

    return Promise.all(pendingBufferViews).then(function (bufferViews) {
      const bufferView = bufferViews[0]

      const itemSize = WEBGL_TYPE_SIZES[accessorDef.type]
      const TypedArray = WEBGL_COMPONENT_TYPES[accessorDef.componentType]

      // For VEC3: itemSize is 3, elementBytes is 4, itemBytes is 12.
      const elementBytes = TypedArray.BYTES_PER_ELEMENT
      const itemBytes = elementBytes * itemSize
      const byteOffset = accessorDef.byteOffset || 0
      const byteStride =
        accessorDef.bufferView !== undefined
          ? json.bufferViews[accessorDef.bufferView].byteStride
          : undefined
      const normalized = accessorDef.normalized === true
      let array, bufferAttribute

      // The buffer is not interleaved if the stride is the item size in bytes.
      if (byteStride && byteStride !== itemBytes) {
        // Each "slice" of the buffer, as defined by 'count' elements of 'byteStride' bytes, gets its own InterleavedBuffer
        // This makes sure that IBA.count reflects accessor.count properly
        const ibSlice = Math.floor(byteOffset / byteStride)
        const ibCacheKey =
          'InterleavedBuffer:' +
          accessorDef.bufferView +
          ':' +
          accessorDef.componentType +
          ':' +
          ibSlice +
          ':' +
          accessorDef.count
        let ib = parser.cache.get(ibCacheKey)

        if (!ib) {
          array = new TypedArray(
            bufferView,
            ibSlice * byteStride,
            (accessorDef.count * byteStride) / elementBytes
          )

          // Integer parameters to IB/IBA are in array elements, not bytes.
          ib = new InterleavedBuffer(array, byteStride / elementBytes)

          parser.cache.add(ibCacheKey, ib)
        }

        bufferAttribute = new InterleavedBufferAttribute(
          ib,
          itemSize,
          (byteOffset % byteStride) / elementBytes,
          normalized
        )
      } else {
        if (bufferView === null) {
          array = new TypedArray(accessorDef.count * itemSize)
        } else {
          array = new TypedArray(
            bufferView,
            byteOffset,
            accessorDef.count * itemSize
          )
        }

        bufferAttribute = new BufferAttribute(array, itemSize, normalized)
      }

      // https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#sparse-accessors
      if (accessorDef.sparse !== undefined) {
        const itemSizeIndices = WEBGL_TYPE_SIZES.SCALAR
        const TypedArrayIndices =
          WEBGL_COMPONENT_TYPES[accessorDef.sparse.indices.componentType]

        const byteOffsetIndices = accessorDef.sparse.indices.byteOffset || 0
        const byteOffsetValues = accessorDef.sparse.values.byteOffset || 0

        const sparseIndices = new TypedArrayIndices(
          bufferViews[1],
          byteOffsetIndices,
          accessorDef.sparse.count * itemSizeIndices
        )
        const sparseValues = new TypedArray(
          bufferViews[2],
          byteOffsetValues,
          accessorDef.sparse.count * itemSize
        )

        if (bufferView !== null) {
          // Avoid modifying the original ArrayBuffer, if the bufferView wasn't initialized with zeroes.
          bufferAttribute = new BufferAttribute(
            bufferAttribute.array.slice(),
            bufferAttribute.itemSize,
            bufferAttribute.normalized
          )
        }

        for (let i = 0, il = sparseIndices.length; i < il; i++) {
          const index = sparseIndices[i]

          bufferAttribute.setX(index, sparseValues[i * itemSize])
          if (itemSize >= 2)
            bufferAttribute.setY(index, sparseValues[i * itemSize + 1])
          if (itemSize >= 3)
            bufferAttribute.setZ(index, sparseValues[i * itemSize + 2])
          if (itemSize >= 4)
            bufferAttribute.setW(index, sparseValues[i * itemSize + 3])
          if (itemSize >= 5)
            throw new Error(
              'THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.'
            )
        }
      }

      return bufferAttribute
    })
  }

  /**
   * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#textures
   * @param {number} textureIndex
   * @return {Promise<THREE.Texture|null>}
   */
  loadTexture(textureIndex) {
    const json = this.json
    const options = this.options
    const textureDef = json.textures[textureIndex]
    const sourceIndex = textureDef.source
    const sourceDef = json.images[sourceIndex]

    let loader = this.textureLoader

    if (sourceDef.uri) {
      const handler = options.manager.getHandler(sourceDef.uri)
      if (handler !== null) loader = handler
    }

    return this.loadTextureImage(textureIndex, sourceIndex, loader)
  }

  loadTextureImage(textureIndex, sourceIndex, loader) {
    const parser = this
    const json = this.json

    const textureDef = json.textures[textureIndex]
    const sourceDef = json.images[sourceIndex]

    const cacheKey =
      (sourceDef.uri || sourceDef.bufferView) + ':' + textureDef.sampler

    if (this.textureCache[cacheKey]) {
      // See https://github.com/mrdoob/three.js/issues/21559.
      return this.textureCache[cacheKey]
    }

    const promise = this.loadImageSource(sourceIndex, loader)
      .then(function (texture) {
        texture.flipY = false

        texture.name = textureDef.name || sourceDef.name || ''

        const samplers = json.samplers || {}
        const sampler = samplers[textureDef.sampler] || {}

        texture.magFilter = WEBGL_FILTERS[sampler.magFilter] || LinearFilter
        texture.minFilter =
          WEBGL_FILTERS[sampler.minFilter] || LinearMipmapLinearFilter
        texture.wrapS = WEBGL_WRAPPINGS[sampler.wrapS] || RepeatWrapping
        texture.wrapT = WEBGL_WRAPPINGS[sampler.wrapT] || RepeatWrapping

        parser.associations.set(texture, {textures: textureIndex})

        return texture
      })
      .catch(function () {
        return null
      })

    this.textureCache[cacheKey] = promise

    return promise
  }

  loadImageSource(sourceIndex, loader) {
    const parser = this
    const json = this.json
    const options = this.options

    if (this.sourceCache[sourceIndex] !== undefined) {
      return this.sourceCache[sourceIndex].then((texture) => texture.clone())
    }

    const sourceDef = json.images[sourceIndex]

    const URL = self.URL || self.webkitURL

    let sourceURI = sourceDef.uri || ''
    let isObjectURL = false

    if (sourceDef.bufferView !== undefined) {
      // Load binary image data from bufferView, if provided.

      sourceURI = parser
        .getDependency('bufferView', sourceDef.bufferView)
        .then(function (bufferView) {
          isObjectURL = true
          const blob = new Blob([bufferView], {type: sourceDef.mimeType})
          sourceURI = URL.createObjectURL(blob)
          return sourceURI
        })
    } else if (sourceDef.uri === undefined) {
      throw new Error(
        'THREE.GLTFLoader: Image ' +
          sourceIndex +
          ' is missing URI and bufferView'
      )
    }

    const promise = Promise.resolve(sourceURI)
      .then(function (sourceURI) {
        return new Promise(function (resolve, reject) {
          let onLoad = resolve

          if (loader.isImageBitmapLoader === true) {
            onLoad = function (imageBitmap) {
              const texture = new Texture(imageBitmap)
              texture.needsUpdate = true

              resolve(texture)
            }
          }

          loader.load(
            LoaderUtils.resolveURL(sourceURI, options.path),
            onLoad,
            undefined,
            reject
          )
        })
      })
      .then(function (texture) {
        // Clean up resources and configure Texture.

        if (isObjectURL === true) {
          URL.revokeObjectURL(sourceURI)
        }

        texture.userData.mimeType =
          sourceDef.mimeType || getImageURIMimeType(sourceDef.uri)

        return texture
      })
      .catch(function (error) {
        console.error("THREE.GLTFLoader: Couldn't load texture", sourceURI)
        throw error
      })

    this.sourceCache[sourceIndex] = promise
    return promise
  }

  /**
   * Asynchronously assigns a texture to the given material parameters.
   * @param {Object} materialParams
   * @param {string} mapName
   * @param {Object} mapDef
   * @return {Promise<Texture>}
   */
  assignTexture(materialParams, mapName, mapDef, encoding) {
    const parser = this

    return this.getDependency('texture', mapDef.index).then(function (texture) {
      if (!texture) return null

      // Materials sample aoMap from UV set 1 and other maps from UV set 0 - this can't be configured
      // However, we will copy UV set 0 to UV set 1 on demand for aoMap
      if (
        mapDef.texCoord !== undefined &&
        mapDef.texCoord != 0 &&
        !(mapName === 'aoMap' && mapDef.texCoord == 1)
      ) {
        console.warn(
          'THREE.GLTFLoader: Custom UV set ' +
            mapDef.texCoord +
            ' for texture ' +
            mapName +
            ' not yet supported.'
        )
      }

      if (parser.extensions[EXTENSIONS.KHR_TEXTURE_TRANSFORM]) {
        const transform =
          mapDef.extensions !== undefined
            ? mapDef.extensions[EXTENSIONS.KHR_TEXTURE_TRANSFORM]
            : undefined

        if (transform) {
          const gltfReference = parser.associations.get(texture)
          texture = parser.extensions[
            EXTENSIONS.KHR_TEXTURE_TRANSFORM
          ].extendTexture(texture, transform)
          parser.associations.set(texture, gltfReference)
        }
      }

      if (encoding !== undefined) {
        texture.encoding = encoding
      }

      materialParams[mapName] = texture

      return texture
    })
  }

  /**
   * Assigns final material to a Mesh, Line, or Points instance. The instance
   * already has a material (generated from the glTF material options alone)
   * but reuse of the same glTF material may require multiple threejs materials
   * to accommodate different primitive types, defines, etc. New materials will
   * be created if necessary, and reused from a cache.
   * @param  {Object3D} mesh Mesh, Line, or Points instance.
   */
  assignFinalMaterial(mesh) {
    const geometry = mesh.geometry
    let material = mesh.material

    const useDerivativeTangents = geometry.attributes.tangent === undefined
    const useVertexColors = geometry.attributes.color !== undefined
    const useFlatShading = geometry.attributes.normal === undefined

    if (mesh.isPoints) {
      const cacheKey = 'PointsMaterial:' + material.uuid

      let pointsMaterial = this.cache.get(cacheKey)

      if (!pointsMaterial) {
        pointsMaterial = new PointsMaterial()
        Material.prototype.copy.call(pointsMaterial, material)
        pointsMaterial.color.copy(material.color)
        pointsMaterial.map = material.map
        pointsMaterial.sizeAttenuation = false // glTF spec says points should be 1px

        this.cache.add(cacheKey, pointsMaterial)
      }

      material = pointsMaterial
    } else if (mesh.isLine) {
      const cacheKey = 'LineBasicMaterial:' + material.uuid

      let lineMaterial = this.cache.get(cacheKey)

      if (!lineMaterial) {
        lineMaterial = new LineBasicMaterial()
        Material.prototype.copy.call(lineMaterial, material)
        lineMaterial.color.copy(material.color)

        this.cache.add(cacheKey, lineMaterial)
      }

      material = lineMaterial
    }

    // Clone the material if it will be modified
    if (useDerivativeTangents || useVertexColors || useFlatShading) {
      let cacheKey = 'ClonedMaterial:' + material.uuid + ':'

      if (useDerivativeTangents) cacheKey += 'derivative-tangents:'
      if (useVertexColors) cacheKey += 'vertex-colors:'
      if (useFlatShading) cacheKey += 'flat-shading:'

      let cachedMaterial = this.cache.get(cacheKey)

      if (!cachedMaterial) {
        cachedMaterial = material.clone()

        if (useVertexColors) cachedMaterial.vertexColors = true
        if (useFlatShading) cachedMaterial.flatShading = true

        if (useDerivativeTangents) {
          // https://github.com/mrdoob/three.js/issues/11438#issuecomment-507003995
          if (cachedMaterial.normalScale) cachedMaterial.normalScale.y *= -1
          if (cachedMaterial.clearcoatNormalScale)
            cachedMaterial.clearcoatNormalScale.y *= -1
        }

        this.cache.add(cacheKey, cachedMaterial)

        this.associations.set(cachedMaterial, this.associations.get(material))
      }

      material = cachedMaterial
    }

    // workarounds for mesh and geometry

    if (
      material.aoMap &&
      geometry.attributes.uv2 === undefined &&
      geometry.attributes.uv !== undefined
    ) {
      geometry.setAttribute('uv2', geometry.attributes.uv)
    }

    mesh.material = material
  }

  getMaterialType(/* materialIndex */) {
    return MeshStandardMaterial
  }

  /**
   * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#materials
   * @param {number} materialIndex
   * @return {Promise<Material>}
   */
  loadMaterial(materialIndex) {
    const parser = this
    const json = this.json
    const extensions = this.extensions
    const materialDef = json.materials[materialIndex]

    let materialType
    const materialParams = {}
    const materialExtensions = materialDef.extensions || {}

    const pending = []

    if (materialExtensions[EXTENSIONS.KHR_MATERIALS_UNLIT]) {
      const kmuExtension = extensions[EXTENSIONS.KHR_MATERIALS_UNLIT]
      materialType = kmuExtension.getMaterialType()
      pending.push(
        kmuExtension.extendParams(materialParams, materialDef, parser)
      )
    } else {
      // Specification:
      // https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#metallic-roughness-material

      const metallicRoughness = materialDef.pbrMetallicRoughness || {}

      materialParams.color = new Color(1.0, 1.0, 1.0)
      materialParams.opacity = 1.0

      if (Array.isArray(metallicRoughness.baseColorFactor)) {
        const array = metallicRoughness.baseColorFactor

        materialParams.color.fromArray(array)
        materialParams.opacity = array[3]
      }

      if (metallicRoughness.baseColorTexture !== undefined) {
        pending.push(
          parser.assignTexture(
            materialParams,
            'map',
            metallicRoughness.baseColorTexture,
            sRGBEncoding
          )
        )
      }

      materialParams.metalness =
        metallicRoughness.metallicFactor !== undefined
          ? metallicRoughness.metallicFactor
          : 1.0
      materialParams.roughness =
        metallicRoughness.roughnessFactor !== undefined
          ? metallicRoughness.roughnessFactor
          : 1.0

      if (metallicRoughness.metallicRoughnessTexture !== undefined) {
        pending.push(
          parser.assignTexture(
            materialParams,
            'metalnessMap',
            metallicRoughness.metallicRoughnessTexture
          )
        )
        pending.push(
          parser.assignTexture(
            materialParams,
            'roughnessMap',
            metallicRoughness.metallicRoughnessTexture
          )
        )
      }

      materialType = this._invokeOne(function (ext) {
        return ext.getMaterialType && ext.getMaterialType(materialIndex)
      })

      pending.push(
        Promise.all(
          this._invokeAll(function (ext) {
            return (
              ext.extendMaterialParams &&
              ext.extendMaterialParams(materialIndex, materialParams)
            )
          })
        )
      )
    }

    if (materialDef.doubleSided === true) {
      materialParams.side = DoubleSide
    }

    const alphaMode = materialDef.alphaMode || ALPHA_MODES.OPAQUE

    if (alphaMode === ALPHA_MODES.BLEND) {
      materialParams.transparent = true

      // See: https://github.com/mrdoob/three.js/issues/17706
      materialParams.depthWrite = false
    } else {
      materialParams.transparent = false

      if (alphaMode === ALPHA_MODES.MASK) {
        materialParams.alphaTest =
          materialDef.alphaCutoff !== undefined ? materialDef.alphaCutoff : 0.5
      }
    }

    if (
      materialDef.normalTexture !== undefined &&
      materialType !== MeshBasicMaterial
    ) {
      pending.push(
        parser.assignTexture(
          materialParams,
          'normalMap',
          materialDef.normalTexture
        )
      )

      materialParams.normalScale = new Vector2(1, 1)

      if (materialDef.normalTexture.scale !== undefined) {
        const scale = materialDef.normalTexture.scale

        materialParams.normalScale.set(scale, scale)
      }
    }

    if (
      materialDef.occlusionTexture !== undefined &&
      materialType !== MeshBasicMaterial
    ) {
      pending.push(
        parser.assignTexture(
          materialParams,
          'aoMap',
          materialDef.occlusionTexture
        )
      )

      if (materialDef.occlusionTexture.strength !== undefined) {
        materialParams.aoMapIntensity = materialDef.occlusionTexture.strength
      }
    }

    if (
      materialDef.emissiveFactor !== undefined &&
      materialType !== MeshBasicMaterial
    ) {
      materialParams.emissive = new Color().fromArray(
        materialDef.emissiveFactor
      )
    }

    if (
      materialDef.emissiveTexture !== undefined &&
      materialType !== MeshBasicMaterial
    ) {
      pending.push(
        parser.assignTexture(
          materialParams,
          'emissiveMap',
          materialDef.emissiveTexture,
          sRGBEncoding
        )
      )
    }

    return Promise.all(pending).then(function () {
      const material = new materialType(materialParams)

      if (materialDef.name) material.name = materialDef.name

      assignExtrasToUserData(material, materialDef)

      parser.associations.set(material, {materials: materialIndex})

      if (materialDef.extensions)
        addUnknownExtensionsToUserData(extensions, material, materialDef)

      return material
    })
  }

  /** When Object3D instances are targeted by animation, they need unique names. */
  createUniqueName(originalName) {
    const sanitizedName = PropertyBinding.sanitizeNodeName(originalName || '')

    let name = sanitizedName

    for (let i = 1; this.nodeNamesUsed[name]; ++i) {
      name = sanitizedName + '_' + i
    }

    this.nodeNamesUsed[name] = true

    return name
  }

  /**
   * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#geometry
   *
   * Creates BufferGeometries from primitives.
   *
   * @param {Array<GLTF.Primitive>} primitives
   * @return {Promise<Array<BufferGeometry>>}
   */
  loadGeometries(primitives) {
    const parser = this
    const extensions = this.extensions
    const cache = this.primitiveCache

    function createDracoPrimitive(primitive) {
      return extensions[EXTENSIONS.KHR_DRACO_MESH_COMPRESSION]
        .decodePrimitive(primitive, parser)
        .then(function (geometry) {
          return addPrimitiveAttributes(geometry, primitive, parser)
        })
    }

    const pending = []

    for (let i = 0, il = primitives.length; i < il; i++) {
      const primitive = primitives[i]
      const cacheKey = createPrimitiveKey(primitive)

      // See if we've already created this geometry
      const cached = cache[cacheKey]

      if (cached) {
        // Use the cached geometry if it exists
        pending.push(cached.promise)
      } else {
        let geometryPromise

        if (
          primitive.extensions &&
          primitive.extensions[EXTENSIONS.KHR_DRACO_MESH_COMPRESSION]
        ) {
          // Use DRACO geometry if available
          geometryPromise = createDracoPrimitive(primitive)
        } else {
          // Otherwise create a new geometry
          geometryPromise = addPrimitiveAttributes(
            new BufferGeometry(),
            primitive,
            parser
          )
        }

        // Cache this geometry
        cache[cacheKey] = {primitive: primitive, promise: geometryPromise}

        pending.push(geometryPromise)
      }
    }

    return Promise.all(pending)
  }

  /**
   * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#meshes
   * @param {number} meshIndex
   * @return {Promise<Group|Mesh|SkinnedMesh>}
   */
  loadMesh(meshIndex) {
    const parser = this
    const json = this.json
    const extensions = this.extensions

    const meshDef = json.meshes[meshIndex]
    const primitives = meshDef.primitives

    const pending = []

    for (let i = 0, il = primitives.length; i < il; i++) {
      const material =
        primitives[i].material === undefined
          ? createDefaultMaterial(this.cache)
          : this.getDependency('material', primitives[i].material)

      pending.push(material)
    }

    pending.push(parser.loadGeometries(primitives))

    return Promise.all(pending).then(function (results) {
      const materials = results.slice(0, results.length - 1)
      const geometries = results[results.length - 1]

      const meshes = []

      for (let i = 0, il = geometries.length; i < il; i++) {
        const geometry = geometries[i]
        const primitive = primitives[i]

        // 1. create Mesh

        let mesh

        const material = materials[i]

        if (
          primitive.mode === WEBGL_CONSTANTS.TRIANGLES ||
          primitive.mode === WEBGL_CONSTANTS.TRIANGLE_STRIP ||
          primitive.mode === WEBGL_CONSTANTS.TRIANGLE_FAN ||
          primitive.mode === undefined
        ) {
          // .isSkinnedMesh isn't in glTF spec. See ._markDefs()
          mesh =
            meshDef.isSkinnedMesh === true
              ? new SkinnedMesh(geometry, material)
              : new Mesh(geometry, material)

          if (
            mesh.isSkinnedMesh === true &&
            !mesh.geometry.attributes.skinWeight.normalized
          ) {
            // we normalize floating point skin weight array to fix malformed assets (see #15319)
            // it's important to skip this for non-float32 data since normalizeSkinWeights assumes non-normalized inputs
            mesh.normalizeSkinWeights()
          }

          if (primitive.mode === WEBGL_CONSTANTS.TRIANGLE_STRIP) {
            mesh.geometry = toTrianglesDrawMode(
              mesh.geometry,
              TriangleStripDrawMode
            )
          } else if (primitive.mode === WEBGL_CONSTANTS.TRIANGLE_FAN) {
            mesh.geometry = toTrianglesDrawMode(
              mesh.geometry,
              TriangleFanDrawMode
            )
          }
        } else if (primitive.mode === WEBGL_CONSTANTS.LINES) {
          mesh = new LineSegments(geometry, material)
        } else if (primitive.mode === WEBGL_CONSTANTS.LINE_STRIP) {
          mesh = new Line(geometry, material)
        } else if (primitive.mode === WEBGL_CONSTANTS.LINE_LOOP) {
          mesh = new LineLoop(geometry, material)
        } else if (primitive.mode === WEBGL_CONSTANTS.POINTS) {
          mesh = new Points(geometry, material)
        } else {
          throw new Error(
            'THREE.GLTFLoader: Primitive mode unsupported: ' + primitive.mode
          )
        }

        if (Object.keys(mesh.geometry.morphAttributes).length > 0) {
          updateMorphTargets(mesh, meshDef)
        }

        mesh.name = parser.createUniqueName(meshDef.name || 'mesh_' + meshIndex)

        assignExtrasToUserData(mesh, meshDef)

        if (primitive.extensions)
          addUnknownExtensionsToUserData(extensions, mesh, primitive)

        parser.assignFinalMaterial(mesh)

        meshes.push(mesh)
      }

      for (let i = 0, il = meshes.length; i < il; i++) {
        parser.associations.set(meshes[i], {
          meshes: meshIndex,
          primitives: i
        })
      }

      if (meshes.length === 1) {
        return meshes[0]
      }

      const group = new Group()

      parser.associations.set(group, {meshes: meshIndex})

      for (let i = 0, il = meshes.length; i < il; i++) {
        group.add(meshes[i])
      }

      return group
    })
  }

  /**
   * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#cameras
   * @param {number} cameraIndex
   * @return {Promise<THREE.Camera>}
   */
  loadCamera(cameraIndex) {
    let camera
    const cameraDef = this.json.cameras[cameraIndex]
    const params = cameraDef[cameraDef.type]

    if (!params) {
      console.warn('THREE.GLTFLoader: Missing camera parameters.')
      return
    }

    if (cameraDef.type === 'perspective') {
      camera = new PerspectiveCamera(
        MathUtils.radToDeg(params.yfov),
        params.aspectRatio || 1,
        params.znear || 1,
        params.zfar || 2e6
      )
    } else if (cameraDef.type === 'orthographic') {
      camera = new OrthographicCamera(
        -params.xmag,
        params.xmag,
        params.ymag,
        -params.ymag,
        params.znear,
        params.zfar
      )
    }

    if (cameraDef.name) camera.name = this.createUniqueName(cameraDef.name)

    assignExtrasToUserData(camera, cameraDef)

    return Promise.resolve(camera)
  }

  /**
   * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#skins
   * @param {number} skinIndex
   * @return {Promise<Skeleton>}
   */
  loadSkin(skinIndex) {
    const skinDef = this.json.skins[skinIndex]

    const pending = []

    for (let i = 0, il = skinDef.joints.length; i < il; i++) {
      pending.push(this.getDependency('node', skinDef.joints[i]))
    }

    if (skinDef.inverseBindMatrices !== undefined) {
      pending.push(this.getDependency('accessor', skinDef.inverseBindMatrices))
    } else {
      pending.push(null)
    }

    return Promise.all(pending).then(function (results) {
      const inverseBindMatrices = results.pop()
      const jointNodes = results

      const bones = []
      const boneInverses = []

      for (let i = 0, il = jointNodes.length; i < il; i++) {
        const jointNode = jointNodes[i]

        if (jointNode) {
          bones.push(jointNode)

          const mat = new Matrix4()

          if (inverseBindMatrices !== null) {
            mat.fromArray(inverseBindMatrices.array, i * 16)
          }

          boneInverses.push(mat)
        } else {
          console.warn(
            'THREE.GLTFLoader: Joint "%s" could not be found.',
            skinDef.joints[i]
          )
        }
      }

      return new Skeleton(bones, boneInverses)
    })
  }

  /**
   * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#animations
   * @param {number} animationIndex
   * @return {Promise<AnimationClip>}
   */
  loadAnimation(animationIndex) {
    const json = this.json

    const animationDef = json.animations[animationIndex]

    const pendingNodes = []
    const pendingInputAccessors = []
    const pendingOutputAccessors = []
    const pendingSamplers = []
    const pendingTargets = []

    for (let i = 0, il = animationDef.channels.length; i < il; i++) {
      const channel = animationDef.channels[i]
      const sampler = animationDef.samplers[channel.sampler]
      const target = channel.target
      const name = target.node
      const input =
        animationDef.parameters !== undefined
          ? animationDef.parameters[sampler.input]
          : sampler.input
      const output =
        animationDef.parameters !== undefined
          ? animationDef.parameters[sampler.output]
          : sampler.output

      pendingNodes.push(this.getDependency('node', name))
      pendingInputAccessors.push(this.getDependency('accessor', input))
      pendingOutputAccessors.push(this.getDependency('accessor', output))
      pendingSamplers.push(sampler)
      pendingTargets.push(target)
    }

    return Promise.all([
      Promise.all(pendingNodes),
      Promise.all(pendingInputAccessors),
      Promise.all(pendingOutputAccessors),
      Promise.all(pendingSamplers),
      Promise.all(pendingTargets)
    ]).then(function (dependencies) {
      const nodes = dependencies[0]
      const inputAccessors = dependencies[1]
      const outputAccessors = dependencies[2]
      const samplers = dependencies[3]
      const targets = dependencies[4]

      const tracks = []

      for (let i = 0, il = nodes.length; i < il; i++) {
        const node = nodes[i]
        const inputAccessor = inputAccessors[i]
        const outputAccessor = outputAccessors[i]
        const sampler = samplers[i]
        const target = targets[i]

        if (node === undefined) continue

        node.updateMatrix()

        let TypedKeyframeTrack

        switch (PATH_PROPERTIES[target.path]) {
          case PATH_PROPERTIES.weights:
            TypedKeyframeTrack = NumberKeyframeTrack
            break

          case PATH_PROPERTIES.rotation:
            TypedKeyframeTrack = QuaternionKeyframeTrack
            break

          case PATH_PROPERTIES.position:
          case PATH_PROPERTIES.scale:
          default:
            TypedKeyframeTrack = VectorKeyframeTrack
            break
        }

        const targetName = node.name ? node.name : node.uuid

        const interpolation =
          sampler.interpolation !== undefined
            ? INTERPOLATION[sampler.interpolation]
            : InterpolateLinear

        const targetNames = []

        if (PATH_PROPERTIES[target.path] === PATH_PROPERTIES.weights) {
          node.traverse(function (object) {
            if (object.morphTargetInfluences) {
              targetNames.push(object.name ? object.name : object.uuid)
            }
          })
        } else {
          targetNames.push(targetName)
        }

        let outputArray = outputAccessor.array

        if (outputAccessor.normalized) {
          const scale = getNormalizedComponentScale(outputArray.constructor)
          const scaled = new Float32Array(outputArray.length)

          for (let j = 0, jl = outputArray.length; j < jl; j++) {
            scaled[j] = outputArray[j] * scale
          }

          outputArray = scaled
        }

        for (let j = 0, jl = targetNames.length; j < jl; j++) {
          const track = new TypedKeyframeTrack(
            targetNames[j] + '.' + PATH_PROPERTIES[target.path],
            inputAccessor.array,
            outputArray,
            interpolation
          )

          // Override interpolation with custom factory method.
          if (sampler.interpolation === 'CUBICSPLINE') {
            track.createInterpolant =
              function InterpolantFactoryMethodGLTFCubicSpline(result) {
                // A CUBICSPLINE keyframe in glTF has three output values for each input value,
                // representing inTangent, splineVertex, and outTangent. As a result, track.getValueSize()
                // must be divided by three to get the interpolant's sampleSize argument.

                const interpolantType =
                  this instanceof QuaternionKeyframeTrack
                    ? GLTFCubicSplineQuaternionInterpolant
                    : GLTFCubicSplineInterpolant

                return new interpolantType(
                  this.times,
                  this.values,
                  this.getValueSize() / 3,
                  result
                )
              }

            // Mark as CUBICSPLINE. `track.getInterpolation()` doesn't support custom interpolants.
            track.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline =
              true
          }

          tracks.push(track)
        }
      }

      const name = animationDef.name
        ? animationDef.name
        : 'animation_' + animationIndex

      return new AnimationClip(name, undefined, tracks)
    })
  }

  createNodeMesh(nodeIndex) {
    const json = this.json
    const parser = this
    const nodeDef = json.nodes[nodeIndex]

    if (nodeDef.mesh === undefined) return null

    return parser.getDependency('mesh', nodeDef.mesh).then(function (mesh) {
      const node = parser._getNodeRef(parser.meshCache, nodeDef.mesh, mesh)

      // if weights are provided on the node, override weights on the mesh.
      if (nodeDef.weights !== undefined) {
        node.traverse(function (o) {
          if (!o.isMesh) return

          for (let i = 0, il = nodeDef.weights.length; i < il; i++) {
            o.morphTargetInfluences[i] = nodeDef.weights[i]
          }
        })
      }

      return node
    })
  }

  /**
   * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#nodes-and-hierarchy
   * @param {number} nodeIndex
   * @return {Promise<Object3D>}
   */
  loadNode(nodeIndex) {
    const json = this.json
    const extensions = this.extensions
    const parser = this

    const nodeDef = json.nodes[nodeIndex]

    // reserve node's name before its dependencies, so the root has the intended name.
    const nodeName = nodeDef.name ? parser.createUniqueName(nodeDef.name) : ''

    return (function () {
      const pending = []

      const meshPromise = parser._invokeOne(function (ext) {
        return ext.createNodeMesh && ext.createNodeMesh(nodeIndex)
      })

      if (meshPromise) {
        pending.push(meshPromise)
      }

      if (nodeDef.camera !== undefined) {
        pending.push(
          parser
            .getDependency('camera', nodeDef.camera)
            .then(function (camera) {
              return parser._getNodeRef(
                parser.cameraCache,
                nodeDef.camera,
                camera
              )
            })
        )
      }

      parser
        ._invokeAll(function (ext) {
          return ext.createNodeAttachment && ext.createNodeAttachment(nodeIndex)
        })
        .forEach(function (promise) {
          pending.push(promise)
        })

      return Promise.all(pending)
    })().then(function (objects) {
      let node

      // .isBone isn't in glTF spec. See ._markDefs
      if (nodeDef.isBone === true) {
        node = new Bone()
      } else if (objects.length > 1) {
        node = new Group()
      } else if (objects.length === 1) {
        node = objects[0]
      } else {
        node = new Object3D()
      }

      if (node !== objects[0]) {
        for (let i = 0, il = objects.length; i < il; i++) {
          node.add(objects[i])
        }
      }

      if (nodeDef.name) {
        node.userData.name = nodeDef.name
        node.name = nodeName
      }

      assignExtrasToUserData(node, nodeDef)

      if (nodeDef.extensions)
        addUnknownExtensionsToUserData(extensions, node, nodeDef)

      if (nodeDef.matrix !== undefined) {
        const matrix = new Matrix4()
        matrix.fromArray(nodeDef.matrix)
        node.applyMatrix4(matrix)
      } else {
        if (nodeDef.translation !== undefined) {
          node.position.fromArray(nodeDef.translation)
        }

        if (nodeDef.rotation !== undefined) {
          node.quaternion.fromArray(nodeDef.rotation)
        }

        if (nodeDef.scale !== undefined) {
          node.scale.fromArray(nodeDef.scale)
        }
      }

      if (!parser.associations.has(node)) {
        parser.associations.set(node, {})
      }

      parser.associations.get(node).nodes = nodeIndex

      return node
    })
  }

  /**
   * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#scenes
   * @param {number} sceneIndex
   * @return {Promise<Group>}
   */
  loadScene(sceneIndex) {
    const json = this.json
    const extensions = this.extensions
    const sceneDef = this.json.scenes[sceneIndex]
    const parser = this

    // Loader returns Group, not Scene.
    // See: https://github.com/mrdoob/three.js/issues/18342#issuecomment-578981172
    const scene = new Group()
    if (sceneDef.name) scene.name = parser.createUniqueName(sceneDef.name)

    assignExtrasToUserData(scene, sceneDef)

    if (sceneDef.extensions)
      addUnknownExtensionsToUserData(extensions, scene, sceneDef)

    const nodeIds = sceneDef.nodes || []

    const pending = []

    for (let i = 0, il = nodeIds.length; i < il; i++) {
      pending.push(buildNodeHierarchy(nodeIds[i], scene, json, parser))
    }

    return Promise.all(pending).then(function () {
      // Removes dangling associations, associations that reference a node that
      // didn't make it into the scene.
      const reduceAssociations = (node) => {
        const reducedAssociations = new Map()

        for (const [key, value] of parser.associations) {
          if (key instanceof Material || key instanceof Texture) {
            reducedAssociations.set(key, value)
          }
        }

        node.traverse((node) => {
          const mappings = parser.associations.get(node)

          if (mappings != null) {
            reducedAssociations.set(node, mappings)
          }
        })

        return reducedAssociations
      }

      parser.associations = reduceAssociations(scene)

      return scene
    })
  }
}

function buildNodeHierarchy(nodeId, parentObject, json, parser) {
  const nodeDef = json.nodes[nodeId]

  return parser
    .getDependency('node', nodeId)
    .then(function (node) {
      if (nodeDef.skin === undefined) return node

      // build skeleton here as well

      return parser
        .getDependency('skin', nodeDef.skin)
        .then(function (skeleton) {
          node.traverse(function (mesh) {
            if (!mesh.isSkinnedMesh) return

            mesh.bind(skeleton, mesh.matrixWorld)
          })

          return node
        })
    })
    .then(function (node) {
      // build node hierachy

      parentObject.add(node)

      const pending = []

      if (nodeDef.children) {
        const children = nodeDef.children

        for (let i = 0, il = children.length; i < il; i++) {
          const child = children[i]
          pending.push(buildNodeHierarchy(child, node, json, parser))
        }
      }

      return Promise.all(pending)
    })
}

/**
 * @param {BufferGeometry} geometry
 * @param {GLTF.Primitive} primitiveDef
 * @param {GLTFParser} parser
 */
function computeBounds(geometry, primitiveDef, parser) {
  const attributes = primitiveDef.attributes

  const box = new Box3()

  if (attributes.POSITION !== undefined) {
    const accessor = parser.json.accessors[attributes.POSITION]

    const min = accessor.min
    const max = accessor.max

    // glTF requires 'min' and 'max', but VRM (which extends glTF) currently ignores that requirement.

    if (min !== undefined && max !== undefined) {
      box.set(
        new Vector3(min[0], min[1], min[2]),
        new Vector3(max[0], max[1], max[2])
      )

      if (accessor.normalized) {
        const boxScale = getNormalizedComponentScale(
          WEBGL_COMPONENT_TYPES[accessor.componentType]
        )
        box.min.multiplyScalar(boxScale)
        box.max.multiplyScalar(boxScale)
      }
    } else {
      console.warn(
        'THREE.GLTFLoader: Missing min/max properties for accessor POSITION.'
      )

      return
    }
  } else {
    return
  }

  const targets = primitiveDef.targets

  if (targets !== undefined) {
    const maxDisplacement = new Vector3()
    const vector = new Vector3()

    for (let i = 0, il = targets.length; i < il; i++) {
      const target = targets[i]

      if (target.POSITION !== undefined) {
        const accessor = parser.json.accessors[target.POSITION]
        const min = accessor.min
        const max = accessor.max

        // glTF requires 'min' and 'max', but VRM (which extends glTF) currently ignores that requirement.

        if (min !== undefined && max !== undefined) {
          // we need to get max of absolute components because target weight is [-1,1]
          vector.setX(Math.max(Math.abs(min[0]), Math.abs(max[0])))
          vector.setY(Math.max(Math.abs(min[1]), Math.abs(max[1])))
          vector.setZ(Math.max(Math.abs(min[2]), Math.abs(max[2])))

          if (accessor.normalized) {
            const boxScale = getNormalizedComponentScale(
              WEBGL_COMPONENT_TYPES[accessor.componentType]
            )
            vector.multiplyScalar(boxScale)
          }

          // Note: this assumes that the sum of all weights is at most 1. This isn't quite correct - it's more conservative
          // to assume that each target can have a max weight of 1. However, for some use cases - notably, when morph targets
          // are used to implement key-frame animations and as such only two are active at a time - this results in very large
          // boxes. So for now we make a box that's sometimes a touch too small but is hopefully mostly of reasonable size.
          maxDisplacement.max(vector)
        } else {
          console.warn(
            'THREE.GLTFLoader: Missing min/max properties for accessor POSITION.'
          )
        }
      }
    }

    // As per comment above this box isn't conservative, but has a reasonable size for a very large number of morph targets.
    box.expandByVector(maxDisplacement)
  }

  geometry.boundingBox = box

  const sphere = new Sphere()

  box.getCenter(sphere.center)
  sphere.radius = box.min.distanceTo(box.max) / 2

  geometry.boundingSphere = sphere
}

/**
 * @param {BufferGeometry} geometry
 * @param {GLTF.Primitive} primitiveDef
 * @param {GLTFParser} parser
 * @return {Promise<BufferGeometry>}
 */
function addPrimitiveAttributes(geometry, primitiveDef, parser) {
  const attributes = primitiveDef.attributes

  const pending = []

  function assignAttributeAccessor(accessorIndex, attributeName) {
    return parser
      .getDependency('accessor', accessorIndex)
      .then(function (accessor) {
        geometry.setAttribute(attributeName, accessor)
      })
  }

  for (const gltfAttributeName in attributes) {
    const threeAttributeName =
      ATTRIBUTES[gltfAttributeName] || gltfAttributeName.toLowerCase()

    // Skip attributes already provided by e.g. Draco extension.
    if (threeAttributeName in geometry.attributes) continue

    pending.push(
      assignAttributeAccessor(attributes[gltfAttributeName], threeAttributeName)
    )
  }

  if (primitiveDef.indices !== undefined && !geometry.index) {
    const accessor = parser
      .getDependency('accessor', primitiveDef.indices)
      .then(function (accessor) {
        geometry.setIndex(accessor)
      })

    pending.push(accessor)
  }

  assignExtrasToUserData(geometry, primitiveDef)

  computeBounds(geometry, primitiveDef, parser)

  return Promise.all(pending).then(function () {
    return primitiveDef.targets !== undefined
      ? addMorphTargets(geometry, primitiveDef.targets, parser)
      : geometry
  })
}

/**
 * @param {BufferGeometry} geometry
 * @param {Number} drawMode
 * @return {BufferGeometry}
 */
function toTrianglesDrawMode(geometry, drawMode) {
  let index = geometry.getIndex()

  // generate index if not present

  if (index === null) {
    const indices = []

    const position = geometry.getAttribute('position')

    if (position !== undefined) {
      for (let i = 0; i < position.count; i++) {
        indices.push(i)
      }

      geometry.setIndex(indices)
      index = geometry.getIndex()
    } else {
      console.error(
        'THREE.GLTFLoader.toTrianglesDrawMode(): Undefined position attribute. Processing not possible.'
      )
      return geometry
    }
  }

  //

  const numberOfTriangles = index.count - 2
  const newIndices = []

  if (drawMode === TriangleFanDrawMode) {
    // gl.TRIANGLE_FAN

    for (let i = 1; i <= numberOfTriangles; i++) {
      newIndices.push(index.getX(0))
      newIndices.push(index.getX(i))
      newIndices.push(index.getX(i + 1))
    }
  } else {
    // gl.TRIANGLE_STRIP

    for (let i = 0; i < numberOfTriangles; i++) {
      if (i % 2 === 0) {
        newIndices.push(index.getX(i))
        newIndices.push(index.getX(i + 1))
        newIndices.push(index.getX(i + 2))
      } else {
        newIndices.push(index.getX(i + 2))
        newIndices.push(index.getX(i + 1))
        newIndices.push(index.getX(i))
      }
    }
  }

  if (newIndices.length / 3 !== numberOfTriangles) {
    console.error(
      'THREE.GLTFLoader.toTrianglesDrawMode(): Unable to generate correct amount of triangles.'
    )
  }

  // build final geometry

  const newGeometry = geometry.clone()
  newGeometry.setIndex(newIndices)

  return newGeometry
}

// /**
//  * @param {BufferGeometry} geometry
//  * @param {Number} drawMode
//  * @return {BufferGeometry}
//  */
// function toTrianglesDrawMode(geometry, drawMode) {
//   let index = geometry.getIndex();

//   // generate index if not present

//   if (index === null) {
//     const indices = [];

//     const position = geometry.getAttribute('position');

//     if (position !== undefined) {
//       for (let i = 0; i < position.count; i++) {
//         indices.push(i);
//       }

//       geometry.setIndex(indices);
//       index = geometry.getIndex();
//     } else {
//       console.error('THREE.GLTFLoader.toTrianglesDrawMode(): Undefined position attribute. Processing not possible.');
//       return geometry;
//     }
//   }

//   //

//   const numberOfTriangles = index.count - 2;
//   const newIndices = [];

//   if (drawMode === TriangleFanDrawMode) {
//     // gl.TRIANGLE_FAN

//     for (let i = 1; i <= numberOfTriangles; i++) {
//       newIndices.push(index.getX(0));
//       newIndices.push(index.getX(i));
//       newIndices.push(index.getX(i + 1));
//     }
//   } else {
//     // gl.TRIANGLE_STRIP

//     for (let i = 0; i < numberOfTriangles; i++) {
//       if (i % 2 === 0) {
//         newIndices.push(index.getX(i));
//         newIndices.push(index.getX(i + 1));
//         newIndices.push(index.getX(i + 2));
//       } else {
//         newIndices.push(index.getX(i + 2));
//         newIndices.push(index.getX(i + 1));
//         newIndices.push(index.getX(i));
//       }
//     }
//   }

//   if (newIndices.length / 3 !== numberOfTriangles) {
//     console.error('THREE.GLTFLoader.toTrianglesDrawMode(): Unable to generate correct amount of triangles.');
//   }

//   // build final geometry

//   const newGeometry = geometry.clone();
//   newGeometry.setIndex(newIndices);

//   return newGeometry;
// }

//===============================================================================================================================================================================
// DracoLoader

class DRACOLoader extends Loader {
  constructor(manager) {
    super(manager)

    this.decoderPath = ''
    this.decoderConfig = {}
    this.decoderBinary = null
    this.decoderPending = null

    this.workerLimit = 4
    this.workerPool = []
    this.workerNextTaskID = 1
    this.workerSourceURL = ''

    this.defaultAttributeIDs = {
      position: 'POSITION',
      normal: 'NORMAL',
      color: 'COLOR',
      uv: 'TEX_COORD'
    }
    this.defaultAttributeTypes = {
      position: 'Float32Array',
      normal: 'Float32Array',
      color: 'Float32Array',
      uv: 'Float32Array'
    }
  }

  setDecoderPath(path) {
    this.decoderPath = path

    return this
  }

  setDecoderConfig(config) {
    this.decoderConfig = config

    return this
  }

  setWorkerLimit(workerLimit) {
    this.workerLimit = workerLimit

    return this
  }

  load(url, onLoad, onProgress, onError) {
    const loader = new FileLoader(this.manager)

    loader.setPath(this.path)
    loader.setResponseType('arraybuffer')
    loader.setRequestHeader(this.requestHeader)
    loader.setWithCredentials(this.withCredentials)

    loader.load(
      url,
      (buffer) => {
        const taskConfig = {
          attributeIDs: this.defaultAttributeIDs,
          attributeTypes: this.defaultAttributeTypes,
          useUniqueIDs: false
        }

        this.decodeGeometry(buffer, taskConfig).then(onLoad).catch(onError)
      },
      onProgress,
      onError
    )
  }

  /** @deprecated Kept for backward-compatibility with previous DRACOLoader versions. */
  decodeDracoFile(buffer, callback, attributeIDs, attributeTypes) {
    const taskConfig = {
      attributeIDs: attributeIDs || this.defaultAttributeIDs,
      attributeTypes: attributeTypes || this.defaultAttributeTypes,
      useUniqueIDs: !!attributeIDs
    }

    this.decodeGeometry(buffer, taskConfig).then(callback)
  }

  decodeGeometry(buffer, taskConfig) {
    // TODO: For backward-compatibility, support 'attributeTypes' objects containing
    // references (rather than names) to typed array constructors. These must be
    // serialized before sending them to the worker.
    for (const attribute in taskConfig.attributeTypes) {
      const type = taskConfig.attributeTypes[attribute]

      if (type.BYTES_PER_ELEMENT !== undefined) {
        taskConfig.attributeTypes[attribute] = type.name
      }
    }

    //

    const taskKey = JSON.stringify(taskConfig)

    // Check for an existing task using this buffer. A transferred buffer cannot be transferred
    // again from this thread.
    if (_taskCache.has(buffer)) {
      const cachedTask = _taskCache.get(buffer)

      if (cachedTask.key === taskKey) {
        return cachedTask.promise
      } else if (buffer.byteLength === 0) {
        // Technically, it would be possible to wait for the previous task to complete,
        // transfer the buffer back, and decode again with the second configuration. That
        // is complex, and I don't know of any reason to decode a Draco buffer twice in
        // different ways, so this is left unimplemented.
        throw new Error(
          'THREE.DRACOLoader: Unable to re-decode a buffer with different ' +
            'settings. Buffer has already been transferred.'
        )
      }
    }

    //

    let worker
    const taskID = this.workerNextTaskID++
    const taskCost = buffer.byteLength

    // Obtain a worker and assign a task, and construct a geometry instance
    // when the task completes.
    const geometryPending = this._getWorker(taskID, taskCost)
      .then((_worker) => {
        worker = _worker

        return new Promise((resolve, reject) => {
          worker._callbacks[taskID] = {resolve, reject}

          worker.postMessage({type: 'decode', id: taskID, taskConfig, buffer}, [
            buffer
          ])

          // this.debug();
        })
      })
      .then((message) => this._createGeometry(message.geometry))

    // Remove task from the task list.
    // Note: replaced '.finally()' with '.catch().then()' block - iOS 11 support (#19416)
    geometryPending
      .catch(() => true)
      .then(() => {
        if (worker && taskID) {
          this._releaseTask(worker, taskID)

          // this.debug();
        }
      })

    // Cache the task result.
    _taskCache.set(buffer, {
      key: taskKey,
      promise: geometryPending
    })

    return geometryPending
  }

  _createGeometry(geometryData) {
    const geometry = new BufferGeometry()

    if (geometryData.index) {
      geometry.setIndex(new BufferAttribute(geometryData.index.array, 1))
    }

    for (let i = 0; i < geometryData.attributes.length; i++) {
      const attribute = geometryData.attributes[i]
      const name = attribute.name
      const array = attribute.array
      const itemSize = attribute.itemSize

      geometry.setAttribute(name, new BufferAttribute(array, itemSize))
    }

    return geometry
  }

  _loadLibrary(url, responseType) {
    const loader = new FileLoader(this.manager)
    loader.setPath(this.decoderPath)
    loader.setResponseType(responseType)
    loader.setWithCredentials(this.withCredentials)

    return new Promise((resolve, reject) => {
      loader.load(url, resolve, undefined, reject)
    })
  }

  preload() {
    this._initDecoder()

    return this
  }

  _initDecoder() {
    if (this.decoderPending) return this.decoderPending

    const useJS =
      typeof WebAssembly !== 'object' || this.decoderConfig.type === 'js'
    const librariesPending = []

    if (useJS) {
      librariesPending.push(this._loadLibrary('draco_decoder.js', 'text'))
    } else {
      librariesPending.push(this._loadLibrary('draco_wasm_wrapper.js', 'text'))
      librariesPending.push(
        this._loadLibrary('draco_decoder.wasm', 'arraybuffer')
      )
    }

    this.decoderPending = Promise.all(librariesPending).then((libraries) => {
      const jsContent = libraries[0]

      if (!useJS) {
        this.decoderConfig.wasmBinary = libraries[1]
      }

      const fn = DRACOWorker.toString()

      const body = [
        '/* draco decoder */',
        jsContent,
        '',
        '/* worker */',
        fn.substring(fn.indexOf('{') + 1, fn.lastIndexOf('}'))
      ].join('\n')

      this.workerSourceURL = URL.createObjectURL(new Blob([body]))
    })

    return this.decoderPending
  }

  _getWorker(taskID, taskCost) {
    return this._initDecoder().then(() => {
      if (this.workerPool.length < this.workerLimit) {
        const worker = new Worker(this.workerSourceURL)

        worker._callbacks = {}
        worker._taskCosts = {}
        worker._taskLoad = 0

        worker.postMessage({type: 'init', decoderConfig: this.decoderConfig})

        worker.onmessage = function (e) {
          const message = e.data

          switch (message.type) {
            case 'decode':
              worker._callbacks[message.id].resolve(message)
              break

            case 'error':
              worker._callbacks[message.id].reject(message)
              break

            default:
              console.error(
                'THREE.DRACOLoader: Unexpected message, "' + message.type + '"'
              )
          }
        }

        this.workerPool.push(worker)
      } else {
        this.workerPool.sort(function (a, b) {
          return a._taskLoad > b._taskLoad ? -1 : 1
        })
      }

      const worker = this.workerPool[this.workerPool.length - 1]
      worker._taskCosts[taskID] = taskCost
      worker._taskLoad += taskCost
      return worker
    })
  }

  _releaseTask(worker, taskID) {
    worker._taskLoad -= worker._taskCosts[taskID]
    delete worker._callbacks[taskID]
    delete worker._taskCosts[taskID]
  }

  debug() {
    console.log(
      'Task load: ',
      this.workerPool.map((worker) => worker._taskLoad)
    )
  }

  dispose() {
    for (let i = 0; i < this.workerPool.length; ++i) {
      this.workerPool[i].terminate()
    }

    this.workerPool.length = 0

    return this
  }
}

/* WEB WORKER */

function DRACOWorker() {
  let decoderConfig
  let decoderPending

  onmessage = function (e) {
    const message = e.data

    switch (message.type) {
      case 'init':
        decoderConfig = message.decoderConfig
        decoderPending = new Promise(function (resolve /*, reject*/) {
          decoderConfig.onModuleLoaded = function (draco) {
            // Module is Promise-like. Wrap before resolving to avoid loop.
            resolve({draco: draco})
          }

          DracoDecoderModule(decoderConfig) // eslint-disable-line no-undef
        })
        break

      case 'decode':
        const buffer = message.buffer
        const taskConfig = message.taskConfig
        decoderPending.then((module) => {
          const draco = module.draco
          const decoder = new draco.Decoder()
          const decoderBuffer = new draco.DecoderBuffer()
          decoderBuffer.Init(new Int8Array(buffer), buffer.byteLength)

          try {
            const geometry = decodeGeometry(
              draco,
              decoder,
              decoderBuffer,
              taskConfig
            )

            const buffers = geometry.attributes.map((attr) => attr.array.buffer)

            if (geometry.index) buffers.push(geometry.index.array.buffer)

            self.postMessage(
              {type: 'decode', id: message.id, geometry},
              buffers
            )
          } catch (error) {
            console.error(error)

            self.postMessage({
              type: 'error',
              id: message.id,
              error: error.message
            })
          } finally {
            draco.destroy(decoderBuffer)
            draco.destroy(decoder)
          }
        })
        break
    }
  }

  function decodeGeometry(draco, decoder, decoderBuffer, taskConfig) {
    const attributeIDs = taskConfig.attributeIDs
    const attributeTypes = taskConfig.attributeTypes

    let dracoGeometry
    let decodingStatus

    const geometryType = decoder.GetEncodedGeometryType(decoderBuffer)

    if (geometryType === draco.TRIANGULAR_MESH) {
      dracoGeometry = new draco.Mesh()
      decodingStatus = decoder.DecodeBufferToMesh(decoderBuffer, dracoGeometry)
    } else if (geometryType === draco.POINT_CLOUD) {
      dracoGeometry = new draco.PointCloud()
      decodingStatus = decoder.DecodeBufferToPointCloud(
        decoderBuffer,
        dracoGeometry
      )
    } else {
      throw new Error('THREE.DRACOLoader: Unexpected geometry type.')
    }

    if (!decodingStatus.ok() || dracoGeometry.ptr === 0) {
      throw new Error(
        'THREE.DRACOLoader: Decoding failed: ' + decodingStatus.error_msg()
      )
    }

    const geometry = {index: null, attributes: []}

    // Gather all vertex attributes.
    for (const attributeName in attributeIDs) {
      const attributeType = self[attributeTypes[attributeName]]

      let attribute
      let attributeID

      // A Draco file may be created with default vertex attributes, whose attribute IDs
      // are mapped 1:1 from their semantic name (POSITION, NORMAL, ...). Alternatively,
      // a Draco file may contain a custom set of attributes, identified by known unique
      // IDs. glTF files always do the latter, and `.drc` files typically do the former.
      if (taskConfig.useUniqueIDs) {
        attributeID = attributeIDs[attributeName]
        attribute = decoder.GetAttributeByUniqueId(dracoGeometry, attributeID)
      } else {
        attributeID = decoder.GetAttributeId(
          dracoGeometry,
          draco[attributeIDs[attributeName]]
        )

        if (attributeID === -1) continue

        attribute = decoder.GetAttribute(dracoGeometry, attributeID)
      }

      geometry.attributes.push(
        decodeAttribute(
          draco,
          decoder,
          dracoGeometry,
          attributeName,
          attributeType,
          attribute
        )
      )
    }

    // Add index.
    if (geometryType === draco.TRIANGULAR_MESH) {
      geometry.index = decodeIndex(draco, decoder, dracoGeometry)
    }

    draco.destroy(dracoGeometry)

    return geometry
  }

  function decodeIndex(draco, decoder, dracoGeometry) {
    const numFaces = dracoGeometry.num_faces()
    const numIndices = numFaces * 3
    const byteLength = numIndices * 4

    const ptr = draco._malloc(byteLength)
    decoder.GetTrianglesUInt32Array(dracoGeometry, byteLength, ptr)
    const index = new Uint32Array(draco.HEAPF32.buffer, ptr, numIndices).slice()
    draco._free(ptr)

    return {array: index, itemSize: 1}
  }

  function decodeAttribute(
    draco,
    decoder,
    dracoGeometry,
    attributeName,
    attributeType,
    attribute
  ) {
    const numComponents = attribute.num_components()
    const numPoints = dracoGeometry.num_points()
    const numValues = numPoints * numComponents
    const byteLength = numValues * attributeType.BYTES_PER_ELEMENT
    const dataType = getDracoDataType(draco, attributeType)

    const ptr = draco._malloc(byteLength)
    decoder.GetAttributeDataArrayForAllPoints(
      dracoGeometry,
      attribute,
      dataType,
      byteLength,
      ptr
    )
    const array = new attributeType(
      draco.HEAPF32.buffer,
      ptr,
      numValues
    ).slice()
    draco._free(ptr)

    return {
      name: attributeName,
      array: array,
      itemSize: numComponents
    }
  }

  function getDracoDataType(draco, attributeType) {
    switch (attributeType) {
      case Float32Array:
        return draco.DT_FLOAT32
      case Int8Array:
        return draco.DT_INT8
      case Int16Array:
        return draco.DT_INT16
      case Int32Array:
        return draco.DT_INT32
      case Uint8Array:
        return draco.DT_UINT8
      case Uint16Array:
        return draco.DT_UINT16
      case Uint32Array:
        return draco.DT_UINT32
    }
  }
}

//===============================================================================================================================================================================
// DragControls

const _plane = new Plane()
const _draycaster = new Raycaster()

const _pointer = new Vector2()
const _offset = new Vector3()
const _intersection = new Vector3()
const _worldPosition = new Vector3()
const _inverseMatrix = new Matrix4()

class DragControls extends EventDispatcher {
  constructor(_objects, _camera, _domElement) {
    super()

    _domElement.style.touchAction = 'none' // disable touch scroll

    let _selected = null,
      _hovered = null

    const _intersections = []

    //

    const scope = this

    function activate() {
      _domElement.addEventListener('pointermove', onPointerMove)
      _domElement.addEventListener('pointerdown', onPointerDown)
      _domElement.addEventListener('pointerup', onPointerCancel)
      _domElement.addEventListener('pointerleave', onPointerCancel)
    }

    function deactivate() {
      _domElement.removeEventListener('pointermove', onPointerMove)
      _domElement.removeEventListener('pointerdown', onPointerDown)
      _domElement.removeEventListener('pointerup', onPointerCancel)
      _domElement.removeEventListener('pointerleave', onPointerCancel)

      _domElement.style.cursor = ''
    }

    function dispose() {
      deactivate()
    }

    function getObjects() {
      return _objects
    }

    function getRaycaster() {
      return _draycaster
    }

    function onPointerMove(event) {
      if (scope.enabled === false) return

      updatePointer(event)

      _draycaster.setFromCamera(_pointer, _camera)

      if (_selected) {
        if (_draycaster.ray.intersectPlane(_plane, _intersection)) {
          _selected.position.copy(
            _intersection.sub(_offset).applyMatrix4(_inverseMatrix)
          )
        }

        scope.dispatchEvent({type: 'drag', object: _selected})

        return
      }

      // hover support

      if (event.pointerType === 'mouse' || event.pointerType === 'pen') {
        _intersections.length = 0

        _draycaster.setFromCamera(_pointer, _camera)
        _draycaster.intersectObjects(_objects, true, _intersections)

        if (_intersections.length > 0) {
          const object = _intersections[0].object

          _plane.setFromNormalAndCoplanarPoint(
            _camera.getWorldDirection(_plane.normal),
            _worldPosition.setFromMatrixPosition(object.matrixWorld)
          )

          if (_hovered !== object && _hovered !== null) {
            scope.dispatchEvent({type: 'hoveroff', object: _hovered})

            _domElement.style.cursor = 'auto'
            _hovered = null
          }

          if (_hovered !== object) {
            scope.dispatchEvent({type: 'hoveron', object: object})

            _domElement.style.cursor = 'pointer'
            _hovered = object
          }
        } else {
          if (_hovered !== null) {
            scope.dispatchEvent({type: 'hoveroff', object: _hovered})

            _domElement.style.cursor = 'auto'
            _hovered = null
          }
        }
      }
    }

    function onPointerDown(event) {
      if (scope.enabled === false) return

      updatePointer(event)

      _intersections.length = 0

      _draycaster.setFromCamera(_pointer, _camera)
      _draycaster.intersectObjects(_objects, true, _intersections)

      if (_intersections.length > 0) {
        _selected =
          scope.transformGroup === true ? _objects[0] : _intersections[0].object

        _plane.setFromNormalAndCoplanarPoint(
          _camera.getWorldDirection(_plane.normal),
          _worldPosition.setFromMatrixPosition(_selected.matrixWorld)
        )

        if (_draycaster.ray.intersectPlane(_plane, _intersection)) {
          _inverseMatrix.copy(_selected.parent.matrixWorld).invert()
          _offset
            .copy(_intersection)
            .sub(_worldPosition.setFromMatrixPosition(_selected.matrixWorld))
        }

        _domElement.style.cursor = 'move'

        scope.dispatchEvent({type: 'dragstart', object: _selected})
      }
    }

    function onPointerCancel() {
      if (scope.enabled === false) return

      if (_selected) {
        scope.dispatchEvent({type: 'dragend', object: _selected})

        _selected = null
      }

      _domElement.style.cursor = _hovered ? 'pointer' : 'auto'
    }

    function updatePointer(event) {
      const rect = _domElement.getBoundingClientRect()

      _pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      _pointer.y = (-(event.clientY - rect.top) / rect.height) * 2 + 1
    }

    activate()

    // API

    this.enabled = true
    this.transformGroup = false

    this.activate = activate
    this.deactivate = deactivate
    this.dispose = dispose
    this.getObjects = getObjects
    this.getRaycaster = getRaycaster
  }
}
//===============================================================================================================================================================================
// TrackballControls
// const _changeEvent = { type: 'change' }
// const _startEvent = { type: 'start' }
// const _endEvent = { type: 'end' }

class TrackballControls extends EventDispatcher {
  constructor(object, domElement) {
    super()

    const scope = this
    const STATE = {
      NONE: -1,
      ROTATE: 0,
      ZOOM: 1,
      PAN: 2,
      TOUCH_ROTATE: 3,
      TOUCH_ZOOM_PAN: 4
    }

    this.object = object
    this.domElement = domElement
    this.domElement.style.touchAction = 'none' // disable touch scroll

    // API

    this.enabled = true

    this.screen = {left: 0, top: 0, width: 0, height: 0}

    this.rotateSpeed = 1.0
    this.zoomSpeed = 1.2
    this.panSpeed = 0.3

    this.noRotate = false
    this.noZoom = false
    this.noPan = false

    this.staticMoving = false
    this.dynamicDampingFactor = 0.2

    this.minDistance = 0
    this.maxDistance = Infinity

    this.keys = ['KeyA' /*A*/, 'KeyS' /*S*/, 'KeyD' /*D*/]

    this.mouseButtons = {
      LEFT: MOUSE.ROTATE,
      MIDDLE: MOUSE.DOLLY,
      RIGHT: MOUSE.PAN
    }

    // internals

    this.target = new Vector3()

    const EPS = 0.000001

    const lastPosition = new Vector3()
    let lastZoom = 1

    let _state = STATE.NONE,
      _keyState = STATE.NONE,
      _touchZoomDistanceStart = 0,
      _touchZoomDistanceEnd = 0,
      _lastAngle = 0

    const _eye = new Vector3(),
      _movePrev = new Vector2(),
      _moveCurr = new Vector2(),
      _lastAxis = new Vector3(),
      _zoomStart = new Vector2(),
      _zoomEnd = new Vector2(),
      _panStart = new Vector2(),
      _panEnd = new Vector2(),
      _pointers = [],
      _pointerPositions = {}

    // for reset

    this.target0 = this.target.clone()
    this.position0 = this.object.position.clone()
    this.up0 = this.object.up.clone()
    this.zoom0 = this.object.zoom

    // methods

    this.handleResize = function () {
      const box = scope.domElement.getBoundingClientRect()
      // adjustments come from similar code in the jquery offset() function
      const d = scope.domElement.ownerDocument.documentElement
      scope.screen.left = box.left + window.pageXOffset - d.clientLeft
      scope.screen.top = box.top + window.pageYOffset - d.clientTop
      scope.screen.width = box.width
      scope.screen.height = box.height
    }

    const getMouseOnScreen = (function () {
      const vector = new Vector2()

      return function getMouseOnScreen(pageX, pageY) {
        vector.set(
          (pageX - scope.screen.left) / scope.screen.width,
          (pageY - scope.screen.top) / scope.screen.height
        )

        return vector
      }
    })()

    const getMouseOnCircle = (function () {
      const vector = new Vector2()

      return function getMouseOnCircle(pageX, pageY) {
        vector.set(
          (pageX - scope.screen.width * 0.5 - scope.screen.left) /
            (scope.screen.width * 0.5),
          (scope.screen.height + 2 * (scope.screen.top - pageY)) /
            scope.screen.width // screen.width intentional
        )

        return vector
      }
    })()

    this.rotateCamera = (function () {
      const axis = new Vector3(),
        quaternion = new Quaternion(),
        eyeDirection = new Vector3(),
        objectUpDirection = new Vector3(),
        objectSidewaysDirection = new Vector3(),
        moveDirection = new Vector3()

      return function rotateCamera() {
        moveDirection.set(
          _moveCurr.x - _movePrev.x,
          _moveCurr.y - _movePrev.y,
          0
        )
        let angle = moveDirection.length()

        if (angle) {
          _eye.copy(scope.object.position).sub(scope.target)

          eyeDirection.copy(_eye).normalize()
          objectUpDirection.copy(scope.object.up).normalize()
          objectSidewaysDirection
            .crossVectors(objectUpDirection, eyeDirection)
            .normalize()

          objectUpDirection.setLength(_moveCurr.y - _movePrev.y)
          objectSidewaysDirection.setLength(_moveCurr.x - _movePrev.x)

          moveDirection.copy(objectUpDirection.add(objectSidewaysDirection))

          axis.crossVectors(moveDirection, _eye).normalize()

          angle *= scope.rotateSpeed
          quaternion.setFromAxisAngle(axis, angle)

          _eye.applyQuaternion(quaternion)
          scope.object.up.applyQuaternion(quaternion)

          _lastAxis.copy(axis)
          _lastAngle = angle
        } else if (!scope.staticMoving && _lastAngle) {
          _lastAngle *= Math.sqrt(1.0 - scope.dynamicDampingFactor)
          _eye.copy(scope.object.position).sub(scope.target)
          quaternion.setFromAxisAngle(_lastAxis, _lastAngle)
          _eye.applyQuaternion(quaternion)
          scope.object.up.applyQuaternion(quaternion)
        }

        _movePrev.copy(_moveCurr)
      }
    })()

    this.zoomCamera = function () {
      let factor

      if (_state === STATE.TOUCH_ZOOM_PAN) {
        factor = _touchZoomDistanceStart / _touchZoomDistanceEnd
        _touchZoomDistanceStart = _touchZoomDistanceEnd

        if (scope.object.isPerspectiveCamera) {
          _eye.multiplyScalar(factor)
        } else if (scope.object.isOrthographicCamera) {
          scope.object.zoom /= factor
          scope.object.updateProjectionMatrix()
        } else {
          console.warn('THREE.TrackballControls: Unsupported camera type')
        }
      } else {
        factor = 1.0 + (_zoomEnd.y - _zoomStart.y) * scope.zoomSpeed

        if (factor !== 1.0 && factor > 0.0) {
          if (scope.object.isPerspectiveCamera) {
            _eye.multiplyScalar(factor)
          } else if (scope.object.isOrthographicCamera) {
            scope.object.zoom /= factor
            scope.object.updateProjectionMatrix()
          } else {
            console.warn('THREE.TrackballControls: Unsupported camera type')
          }
        }

        if (scope.staticMoving) {
          _zoomStart.copy(_zoomEnd)
        } else {
          _zoomStart.y +=
            (_zoomEnd.y - _zoomStart.y) * this.dynamicDampingFactor
        }
      }
    }

    this.panCamera = (function () {
      const mouseChange = new Vector2(),
        objectUp = new Vector3(),
        pan = new Vector3()

      return function panCamera() {
        mouseChange.copy(_panEnd).sub(_panStart)

        if (mouseChange.lengthSq()) {
          if (scope.object.isOrthographicCamera) {
            const scale_x =
              (scope.object.right - scope.object.left) /
              scope.object.zoom /
              scope.domElement.clientWidth
            const scale_y =
              (scope.object.top - scope.object.bottom) /
              scope.object.zoom /
              scope.domElement.clientWidth

            mouseChange.x *= scale_x
            mouseChange.y *= scale_y
          }

          mouseChange.multiplyScalar(_eye.length() * scope.panSpeed)

          pan.copy(_eye).cross(scope.object.up).setLength(mouseChange.x)
          pan.add(objectUp.copy(scope.object.up).setLength(mouseChange.y))

          scope.object.position.add(pan)
          scope.target.add(pan)

          if (scope.staticMoving) {
            _panStart.copy(_panEnd)
          } else {
            _panStart.add(
              mouseChange
                .subVectors(_panEnd, _panStart)
                .multiplyScalar(scope.dynamicDampingFactor)
            )
          }
        }
      }
    })()

    this.checkDistances = function () {
      if (!scope.noZoom || !scope.noPan) {
        if (_eye.lengthSq() > scope.maxDistance * scope.maxDistance) {
          scope.object.position.addVectors(
            scope.target,
            _eye.setLength(scope.maxDistance)
          )
          _zoomStart.copy(_zoomEnd)
        }

        if (_eye.lengthSq() < scope.minDistance * scope.minDistance) {
          scope.object.position.addVectors(
            scope.target,
            _eye.setLength(scope.minDistance)
          )
          _zoomStart.copy(_zoomEnd)
        }
      }
    }

    this.update = function () {
      _eye.subVectors(scope.object.position, scope.target)

      if (!scope.noRotate) {
        scope.rotateCamera()
      }

      if (!scope.noZoom) {
        scope.zoomCamera()
      }

      if (!scope.noPan) {
        scope.panCamera()
      }

      scope.object.position.addVectors(scope.target, _eye)

      if (scope.object.isPerspectiveCamera) {
        scope.checkDistances()

        scope.object.lookAt(scope.target)

        if (lastPosition.distanceToSquared(scope.object.position) > EPS) {
          scope.dispatchEvent(_changeEvent)

          lastPosition.copy(scope.object.position)
        }
      } else if (scope.object.isOrthographicCamera) {
        scope.object.lookAt(scope.target)

        if (
          lastPosition.distanceToSquared(scope.object.position) > EPS ||
          lastZoom !== scope.object.zoom
        ) {
          scope.dispatchEvent(_changeEvent)

          lastPosition.copy(scope.object.position)
          lastZoom = scope.object.zoom
        }
      } else {
        console.warn('THREE.TrackballControls: Unsupported camera type')
      }
    }

    this.reset = function () {
      _state = STATE.NONE
      _keyState = STATE.NONE

      scope.target.copy(scope.target0)
      scope.object.position.copy(scope.position0)
      scope.object.up.copy(scope.up0)
      scope.object.zoom = scope.zoom0

      scope.object.updateProjectionMatrix()

      _eye.subVectors(scope.object.position, scope.target)

      scope.object.lookAt(scope.target)

      scope.dispatchEvent(_changeEvent)

      lastPosition.copy(scope.object.position)
      lastZoom = scope.object.zoom
    }

    // listeners

    function onPointerDown(event) {
      if (scope.enabled === false) return

      if (_pointers.length === 0) {
        scope.domElement.setPointerCapture(event.pointerId)

        scope.domElement.addEventListener('pointermove', onPointerMove)
        scope.domElement.addEventListener('pointerup', onPointerUp)
      }

      //

      addPointer(event)

      if (event.pointerType === 'touch') {
        onTouchStart(event)
      } else {
        onMouseDown(event)
      }
    }

    function onPointerMove(event) {
      if (scope.enabled === false) return

      if (event.pointerType === 'touch') {
        onTouchMove(event)
      } else {
        onMouseMove(event)
      }
    }

    function onPointerUp(event) {
      if (scope.enabled === false) return

      if (event.pointerType === 'touch') {
        onTouchEnd(event)
      } else {
        onMouseUp()
      }

      //

      removePointer(event)

      if (_pointers.length === 0) {
        scope.domElement.releasePointerCapture(event.pointerId)

        scope.domElement.removeEventListener('pointermove', onPointerMove)
        scope.domElement.removeEventListener('pointerup', onPointerUp)
      }
    }

    function onPointerCancel(event) {
      removePointer(event)
    }

    function keydown(event) {
      if (scope.enabled === false) return

      window.removeEventListener('keydown', keydown)

      if (_keyState !== STATE.NONE) {
        return
      } else if (event.code === scope.keys[STATE.ROTATE] && !scope.noRotate) {
        _keyState = STATE.ROTATE
      } else if (event.code === scope.keys[STATE.ZOOM] && !scope.noZoom) {
        _keyState = STATE.ZOOM
      } else if (event.code === scope.keys[STATE.PAN] && !scope.noPan) {
        _keyState = STATE.PAN
      }
    }

    function keyup() {
      if (scope.enabled === false) return

      _keyState = STATE.NONE

      window.addEventListener('keydown', keydown)
    }

    function onMouseDown(event) {
      if (_state === STATE.NONE) {
        switch (event.button) {
          case scope.mouseButtons.LEFT:
            _state = STATE.ROTATE
            break

          case scope.mouseButtons.MIDDLE:
            _state = STATE.ZOOM
            break

          case scope.mouseButtons.RIGHT:
            _state = STATE.PAN
            break
        }
      }

      const state = _keyState !== STATE.NONE ? _keyState : _state

      if (state === STATE.ROTATE && !scope.noRotate) {
        _moveCurr.copy(getMouseOnCircle(event.pageX, event.pageY))
        _movePrev.copy(_moveCurr)
      } else if (state === STATE.ZOOM && !scope.noZoom) {
        _zoomStart.copy(getMouseOnScreen(event.pageX, event.pageY))
        _zoomEnd.copy(_zoomStart)
      } else if (state === STATE.PAN && !scope.noPan) {
        _panStart.copy(getMouseOnScreen(event.pageX, event.pageY))
        _panEnd.copy(_panStart)
      }

      scope.dispatchEvent(_startEvent)
    }

    function onMouseMove(event) {
      const state = _keyState !== STATE.NONE ? _keyState : _state

      if (state === STATE.ROTATE && !scope.noRotate) {
        _movePrev.copy(_moveCurr)
        _moveCurr.copy(getMouseOnCircle(event.pageX, event.pageY))
      } else if (state === STATE.ZOOM && !scope.noZoom) {
        _zoomEnd.copy(getMouseOnScreen(event.pageX, event.pageY))
      } else if (state === STATE.PAN && !scope.noPan) {
        _panEnd.copy(getMouseOnScreen(event.pageX, event.pageY))
      }
    }

    function onMouseUp() {
      _state = STATE.NONE

      scope.dispatchEvent(_endEvent)
    }

    function onMouseWheel(event) {
      if (scope.enabled === false) return

      if (scope.noZoom === true) return

      event.preventDefault()

      switch (event.deltaMode) {
        case 2:
          // Zoom in pages
          _zoomStart.y -= event.deltaY * 0.025
          break

        case 1:
          // Zoom in lines
          _zoomStart.y -= event.deltaY * 0.01
          break

        default:
          // undefined, 0, assume pixels
          _zoomStart.y -= event.deltaY * 0.00025
          break
      }

      scope.dispatchEvent(_startEvent)
      scope.dispatchEvent(_endEvent)
    }

    function onTouchStart(event) {
      trackPointer(event)

      switch (_pointers.length) {
        case 1:
          _state = STATE.TOUCH_ROTATE
          _moveCurr.copy(
            getMouseOnCircle(_pointers[0].pageX, _pointers[0].pageY)
          )
          _movePrev.copy(_moveCurr)
          break

        default: // 2 or more
          _state = STATE.TOUCH_ZOOM_PAN
          const dx = _pointers[0].pageX - _pointers[1].pageX
          const dy = _pointers[0].pageY - _pointers[1].pageY
          _touchZoomDistanceEnd = _touchZoomDistanceStart = Math.sqrt(
            dx * dx + dy * dy
          )

          const x = (_pointers[0].pageX + _pointers[1].pageX) / 2
          const y = (_pointers[0].pageY + _pointers[1].pageY) / 2
          _panStart.copy(getMouseOnScreen(x, y))
          _panEnd.copy(_panStart)
          break
      }

      scope.dispatchEvent(_startEvent)
    }

    function onTouchMove(event) {
      trackPointer(event)

      switch (_pointers.length) {
        case 1:
          _movePrev.copy(_moveCurr)
          _moveCurr.copy(getMouseOnCircle(event.pageX, event.pageY))
          break

        default: // 2 or more
          const position = getSecondPointerPosition(event)

          const dx = event.pageX - position.x
          const dy = event.pageY - position.y
          _touchZoomDistanceEnd = Math.sqrt(dx * dx + dy * dy)

          const x = (event.pageX + position.x) / 2
          const y = (event.pageY + position.y) / 2
          _panEnd.copy(getMouseOnScreen(x, y))
          break
      }
    }

    function onTouchEnd(event) {
      switch (_pointers.length) {
        case 0:
          _state = STATE.NONE
          break

        case 1:
          _state = STATE.TOUCH_ROTATE
          _moveCurr.copy(getMouseOnCircle(event.pageX, event.pageY))
          _movePrev.copy(_moveCurr)
          break

        case 2:
          _state = STATE.TOUCH_ZOOM_PAN

          for (let i = 0; i < _pointers.length; i++) {
            if (_pointers[i].pointerId !== event.pointerId) {
              const position = _pointerPositions[_pointers[i].pointerId]
              _moveCurr.copy(getMouseOnCircle(position.x, position.y))
              _movePrev.copy(_moveCurr)
              break
            }
          }

          break
      }

      scope.dispatchEvent(_endEvent)
    }

    function contextmenu(event) {
      if (scope.enabled === false) return

      event.preventDefault()
    }

    function addPointer(event) {
      _pointers.push(event)
    }

    function removePointer(event) {
      delete _pointerPositions[event.pointerId]

      for (let i = 0; i < _pointers.length; i++) {
        if (_pointers[i].pointerId == event.pointerId) {
          _pointers.splice(i, 1)
          return
        }
      }
    }

    function trackPointer(event) {
      let position = _pointerPositions[event.pointerId]

      if (position === undefined) {
        position = new Vector2()
        _pointerPositions[event.pointerId] = position
      }

      position.set(event.pageX, event.pageY)
    }

    function getSecondPointerPosition(event) {
      const pointer =
        event.pointerId === _pointers[0].pointerId ? _pointers[1] : _pointers[0]

      return _pointerPositions[pointer.pointerId]
    }

    this.dispose = function () {
      scope.domElement.removeEventListener('contextmenu', contextmenu)

      scope.domElement.removeEventListener('pointerdown', onPointerDown)
      scope.domElement.removeEventListener('pointercancel', onPointerCancel)
      scope.domElement.removeEventListener('wheel', onMouseWheel)

      scope.domElement.removeEventListener('pointermove', onPointerMove)
      scope.domElement.removeEventListener('pointerup', onPointerUp)

      window.removeEventListener('keydown', keydown)
      window.removeEventListener('keyup', keyup)
    }

    this.domElement.addEventListener('contextmenu', contextmenu)

    this.domElement.addEventListener('pointerdown', onPointerDown)
    this.domElement.addEventListener('pointercancel', onPointerCancel)
    this.domElement.addEventListener('wheel', onMouseWheel, {passive: false})

    window.addEventListener('keydown', keydown)
    window.addEventListener('keyup', keyup)

    this.handleResize()

    // force an update at start
    this.update()
  }
}

//===============================================================================================================================================================================
// TransformControls

const _raycaster = new Raycaster()

const _tempVector = new Vector3()
const _tempVector2 = new Vector3()
const _tempQuaternion = new Quaternion()
const _unit = {
  X: new Vector3(1, 0, 0),
  Y: new Vector3(0, 1, 0),
  Z: new Vector3(0, 0, 1)
}

const _tchangeEvent = {type: 'change'}
const _mouseDownEvent = {type: 'mouseDown'}
const _mouseUpEvent = {type: 'mouseUp', mode: null}
const _objectChangeEvent = {type: 'objectChange'}

class TransformControls extends Object3D {
  _gizmo: any
  _plane: any
  enabled: boolean
  constructor(camera, domElement) {
    super()

    if (domElement === undefined) {
      console.warn(
        'THREE.TransformControls: The second parameter "domElement" is now mandatory.'
      )
      domElement = document
    }

    this.visible = false
    this.domElement = domElement
    this.domElement.style.touchAction = 'none' // disable touch scroll

    const _gizmo = new TransformControlsGizmo()
    this._gizmo = _gizmo
    this.add(_gizmo)

    const _plane = new TransformControlsPlane()
    this._plane = _plane
    this.add(_plane)

    const scope = this

    // Defined getter, setter and store for a property
    function defineProperty(propName, defaultValue) {
      let propValue = defaultValue

      Object.defineProperty(scope, propName, {
        get: function () {
          return propValue !== undefined ? propValue : defaultValue
        },

        set: function (value) {
          if (propValue !== value) {
            propValue = value
            _plane[propName] = value
            _gizmo[propName] = value

            scope.dispatchEvent({type: propName + '-changed', value: value})
            scope.dispatchEvent(_tchangeEvent)
          }
        }
      })

      scope[propName] = defaultValue
      _plane[propName] = defaultValue
      _gizmo[propName] = defaultValue
    }

    // Define properties with getters/setter
    // Setting the defined property will automatically trigger change event
    // Defined properties are passed down to gizmo and plane

    defineProperty('camera', camera)
    defineProperty('object', undefined)
    defineProperty('enabled', true)
    defineProperty('axis', null)
    defineProperty('mode', 'translate')
    defineProperty('translationSnap', null)
    defineProperty('rotationSnap', null)
    defineProperty('scaleSnap', null)
    defineProperty('space', 'world')
    defineProperty('size', 1)
    defineProperty('dragging', false)
    defineProperty('showX', true)
    defineProperty('showY', true)
    defineProperty('showZ', true)

    // Reusable utility variables

    const worldPosition = new Vector3()
    const worldPositionStart = new Vector3()
    const worldQuaternion = new Quaternion()
    const worldQuaternionStart = new Quaternion()
    const cameraPosition = new Vector3()
    const cameraQuaternion = new Quaternion()
    const pointStart = new Vector3()
    const pointEnd = new Vector3()
    const rotationAxis = new Vector3()
    const rotationAngle = 0
    const eye = new Vector3()

    // TODO: remove properties unused in plane and gizmo

    defineProperty('worldPosition', worldPosition)
    defineProperty('worldPositionStart', worldPositionStart)
    defineProperty('worldQuaternion', worldQuaternion)
    defineProperty('worldQuaternionStart', worldQuaternionStart)
    defineProperty('cameraPosition', cameraPosition)
    defineProperty('cameraQuaternion', cameraQuaternion)
    defineProperty('pointStart', pointStart)
    defineProperty('pointEnd', pointEnd)
    defineProperty('rotationAxis', rotationAxis)
    defineProperty('rotationAngle', rotationAngle)
    defineProperty('eye', eye)

    this._offset = new Vector3()
    this._startNorm = new Vector3()
    this._endNorm = new Vector3()
    this._cameraScale = new Vector3()

    this._parentPosition = new Vector3()
    this._parentQuaternion = new Quaternion()
    this._parentQuaternionInv = new Quaternion()
    this._parentScale = new Vector3()

    this._worldScaleStart = new Vector3()
    this._worldQuaternionInv = new Quaternion()
    this._worldScale = new Vector3()

    this._positionStart = new Vector3()
    this._quaternionStart = new Quaternion()
    this._scaleStart = new Vector3()

    this._getPointer = getPointer.bind(this)
    this._onPointerDown = onPointerDown.bind(this)
    this._onPointerHover = onPointerHover.bind(this)
    this._onPointerMove = onPointerMove.bind(this)
    this._onPointerUp = onPointerUp.bind(this)

    this.domElement.addEventListener('pointerdown', this._onPointerDown)
    this.domElement.addEventListener('pointermove', this._onPointerHover)
    this.domElement.addEventListener('pointerup', this._onPointerUp)
  }

  // updateMatrixWorld  updates key transformation variables
  updateMatrixWorld() {
    if (this.object !== undefined) {
      this.object.updateMatrixWorld()

      if (this.object.parent === null) {
        console.error(
          'TransformControls: The attached 3D object must be a part of the scene graph.'
        )
      } else {
        this.object.parent.matrixWorld.decompose(
          this._parentPosition,
          this._parentQuaternion,
          this._parentScale
        )
      }

      this.object.matrixWorld.decompose(
        this.worldPosition,
        this.worldQuaternion,
        this._worldScale
      )

      this._parentQuaternionInv.copy(this._parentQuaternion).invert()
      this._worldQuaternionInv.copy(this.worldQuaternion).invert()
    }

    this.camera.updateMatrixWorld()
    this.camera.matrixWorld.decompose(
      this.cameraPosition,
      this.cameraQuaternion,
      this._cameraScale
    )

    this.eye.copy(this.cameraPosition).sub(this.worldPosition).normalize()

    super.updateMatrixWorld(this)
  }

  pointerHover(pointer) {
    if (this.object === undefined || this.dragging === true) return

    _raycaster.setFromCamera(pointer, this.camera)

    const intersect = intersectObjectWithRay(
      this._gizmo.picker[this.mode],
      _raycaster
    )

    if (intersect) {
      this.axis = intersect.object.name
    } else {
      this.axis = null
    }
  }

  pointerDown(pointer) {
    if (
      this.object === undefined ||
      this.dragging === true ||
      pointer.button !== 0
    )
      return

    if (this.axis !== null) {
      _raycaster.setFromCamera(pointer, this.camera)

      const planeIntersect = intersectObjectWithRay(
        this._plane,
        _raycaster,
        true
      )

      if (planeIntersect) {
        this.object.updateMatrixWorld()
        this.object.parent.updateMatrixWorld()

        this._positionStart.copy(this.object.position)
        this._quaternionStart.copy(this.object.quaternion)
        this._scaleStart.copy(this.object.scale)

        this.object.matrixWorld.decompose(
          this.worldPositionStart,
          this.worldQuaternionStart,
          this._worldScaleStart
        )

        this.pointStart.copy(planeIntersect.point).sub(this.worldPositionStart)
      }

      this.dragging = true
      _mouseDownEvent.mode = this.mode
      this.dispatchEvent(_mouseDownEvent)
    }
  }

  pointerMove(pointer) {
    const axis = this.axis
    const mode = this.mode
    const object = this.object
    let space = this.space

    if (mode === 'scale') {
      space = 'local'
    } else if (axis === 'E' || axis === 'XYZE' || axis === 'XYZ') {
      space = 'world'
    }

    if (
      object === undefined ||
      axis === null ||
      this.dragging === false ||
      pointer.button !== -1
    )
      return

    _raycaster.setFromCamera(pointer, this.camera)

    const planeIntersect = intersectObjectWithRay(this._plane, _raycaster, true)

    if (!planeIntersect) return

    this.pointEnd.copy(planeIntersect.point).sub(this.worldPositionStart)

    if (mode === 'translate') {
      // Apply translate

      this._offset.copy(this.pointEnd).sub(this.pointStart)

      if (space === 'local' && axis !== 'XYZ') {
        this._offset.applyQuaternion(this._worldQuaternionInv)
      }

      if (axis.indexOf('X') === -1) this._offset.x = 0
      if (axis.indexOf('Y') === -1) this._offset.y = 0
      if (axis.indexOf('Z') === -1) this._offset.z = 0

      if (space === 'local' && axis !== 'XYZ') {
        this._offset
          .applyQuaternion(this._quaternionStart)
          .divide(this._parentScale)
      } else {
        this._offset
          .applyQuaternion(this._parentQuaternionInv)
          .divide(this._parentScale)
      }

      object.position.copy(this._offset).add(this._positionStart)

      // Apply translation snap

      if (this.translationSnap) {
        if (space === 'local') {
          object.position.applyQuaternion(
            _tempQuaternion.copy(this._quaternionStart).invert()
          )

          if (axis.search('X') !== -1) {
            object.position.x =
              Math.round(object.position.x / this.translationSnap) *
              this.translationSnap
          }

          if (axis.search('Y') !== -1) {
            object.position.y =
              Math.round(object.position.y / this.translationSnap) *
              this.translationSnap
          }

          if (axis.search('Z') !== -1) {
            object.position.z =
              Math.round(object.position.z / this.translationSnap) *
              this.translationSnap
          }

          object.position.applyQuaternion(this._quaternionStart)
        }

        if (space === 'world') {
          if (object.parent) {
            object.position.add(
              _tempVector.setFromMatrixPosition(object.parent.matrixWorld)
            )
          }

          if (axis.search('X') !== -1) {
            object.position.x =
              Math.round(object.position.x / this.translationSnap) *
              this.translationSnap
          }

          if (axis.search('Y') !== -1) {
            object.position.y =
              Math.round(object.position.y / this.translationSnap) *
              this.translationSnap
          }

          if (axis.search('Z') !== -1) {
            object.position.z =
              Math.round(object.position.z / this.translationSnap) *
              this.translationSnap
          }

          if (object.parent) {
            object.position.sub(
              _tempVector.setFromMatrixPosition(object.parent.matrixWorld)
            )
          }
        }
      }
    } else if (mode === 'scale') {
      if (axis.search('XYZ') !== -1) {
        let d = this.pointEnd.length() / this.pointStart.length()

        if (this.pointEnd.dot(this.pointStart) < 0) d *= -1

        _tempVector2.set(d, d, d)
      } else {
        _tempVector.copy(this.pointStart)
        _tempVector2.copy(this.pointEnd)

        _tempVector.applyQuaternion(this._worldQuaternionInv)
        _tempVector2.applyQuaternion(this._worldQuaternionInv)

        _tempVector2.divide(_tempVector)

        if (axis.search('X') === -1) {
          _tempVector2.x = 1
        }

        if (axis.search('Y') === -1) {
          _tempVector2.y = 1
        }

        if (axis.search('Z') === -1) {
          _tempVector2.z = 1
        }
      }

      // Apply scale

      object.scale.copy(this._scaleStart).multiply(_tempVector2)

      if (this.scaleSnap) {
        if (axis.search('X') !== -1) {
          object.scale.x =
            Math.round(object.scale.x / this.scaleSnap) * this.scaleSnap ||
            this.scaleSnap
        }

        if (axis.search('Y') !== -1) {
          object.scale.y =
            Math.round(object.scale.y / this.scaleSnap) * this.scaleSnap ||
            this.scaleSnap
        }

        if (axis.search('Z') !== -1) {
          object.scale.z =
            Math.round(object.scale.z / this.scaleSnap) * this.scaleSnap ||
            this.scaleSnap
        }
      }
    } else if (mode === 'rotate') {
      this._offset.copy(this.pointEnd).sub(this.pointStart)

      const ROTATION_SPEED =
        20 /
        this.worldPosition.distanceTo(
          _tempVector.setFromMatrixPosition(this.camera.matrixWorld)
        )

      if (axis === 'E') {
        this.rotationAxis.copy(this.eye)
        this.rotationAngle = this.pointEnd.angleTo(this.pointStart)

        this._startNorm.copy(this.pointStart).normalize()
        this._endNorm.copy(this.pointEnd).normalize()

        this.rotationAngle *=
          this._endNorm.cross(this._startNorm).dot(this.eye) < 0 ? 1 : -1
      } else if (axis === 'XYZE') {
        this.rotationAxis.copy(this._offset).cross(this.eye).normalize()
        this.rotationAngle =
          this._offset.dot(
            _tempVector.copy(this.rotationAxis).cross(this.eye)
          ) * ROTATION_SPEED
      } else if (axis === 'X' || axis === 'Y' || axis === 'Z') {
        this.rotationAxis.copy(_unit[axis])

        _tempVector.copy(_unit[axis])

        if (space === 'local') {
          _tempVector.applyQuaternion(this.worldQuaternion)
        }

        this.rotationAngle =
          this._offset.dot(_tempVector.cross(this.eye).normalize()) *
          ROTATION_SPEED
      }

      // Apply rotation snap

      if (this.rotationSnap)
        this.rotationAngle =
          Math.round(this.rotationAngle / this.rotationSnap) * this.rotationSnap

      // Apply rotate
      if (space === 'local' && axis !== 'E' && axis !== 'XYZE') {
        object.quaternion.copy(this._quaternionStart)
        object.quaternion
          .multiply(
            _tempQuaternion.setFromAxisAngle(
              this.rotationAxis,
              this.rotationAngle
            )
          )
          .normalize()
      } else {
        this.rotationAxis.applyQuaternion(this._parentQuaternionInv)
        object.quaternion.copy(
          _tempQuaternion.setFromAxisAngle(
            this.rotationAxis,
            this.rotationAngle
          )
        )
        object.quaternion.multiply(this._quaternionStart).normalize()
      }
    }

    this.dispatchEvent(_tchangeEvent)
    this.dispatchEvent(_objectChangeEvent)
  }

  pointerUp(pointer) {
    if (pointer.button !== 0) return

    if (this.dragging && this.axis !== null) {
      _mouseUpEvent.mode = this.mode
      this.dispatchEvent(_mouseUpEvent)
    }

    this.dragging = false
    this.axis = null
  }

  dispose() {
    this.domElement.removeEventListener('pointerdown', this._onPointerDown)
    this.domElement.removeEventListener('pointermove', this._onPointerHover)
    this.domElement.removeEventListener('pointermove', this._onPointerMove)
    this.domElement.removeEventListener('pointerup', this._onPointerUp)

    this.traverse(function (child) {
      if (child.geometry) child.geometry.dispose()
      if (child.material) child.material.dispose()
    })
  }

  // Set current object
  attach(object) {
    this.object = object
    this.visible = true

    return this
  }

  // Detatch from object
  detach() {
    this.object = undefined
    this.visible = false
    this.axis = null

    return this
  }

  reset() {
    if (!this.enabled) return

    if (this.dragging) {
      this.object.position.copy(this._positionStart)
      this.object.quaternion.copy(this._quaternionStart)
      this.object.scale.copy(this._scaleStart)

      this.dispatchEvent(_tchangeEvent)
      this.dispatchEvent(_objectChangeEvent)

      this.pointStart.copy(this.pointEnd)
    }
  }

  getRaycaster() {
    return _raycaster
  }

  // TODO: deprecate

  getMode() {
    return this.mode
  }

  setMode(mode) {
    this.mode = mode
  }

  setTranslationSnap(translationSnap) {
    this.translationSnap = translationSnap
  }

  setRotationSnap(rotationSnap) {
    this.rotationSnap = rotationSnap
  }

  setScaleSnap(scaleSnap) {
    this.scaleSnap = scaleSnap
  }

  setSize(size) {
    this.size = size
  }

  setSpace(space) {
    this.space = space
  }

  update() {
    console.warn(
      'THREE.TransformControls: update function has no more functionality and therefore has been deprecated.'
    )
  }
}

TransformControls.prototype.isTransformControls = true

// mouse / touch event handlers

function getPointer(event) {
  if (this.domElement.ownerDocument.pointerLockElement) {
    return {
      x: 0,
      y: 0,
      button: event.button
    }
  } else {
    const rect = this.domElement.getBoundingClientRect()

    return {
      x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
      y: (-(event.clientY - rect.top) / rect.height) * 2 + 1,
      button: event.button
    }
  }
}

function onPointerHover(event) {
  if (!this.enabled) return

  switch (event.pointerType) {
    case 'mouse':
    case 'pen':
      this.pointerHover(this._getPointer(event))
      break
  }
}

function onPointerDown(event) {
  if (!this.enabled) return

  if (!document.pointerLockElement) {
    this.domElement.setPointerCapture(event.pointerId)
  }

  this.domElement.addEventListener('pointermove', this._onPointerMove)

  this.pointerHover(this._getPointer(event))
  this.pointerDown(this._getPointer(event))
}

function onPointerMove(event) {
  if (!this.enabled) return

  this.pointerMove(this._getPointer(event))
}

function onPointerUp(event) {
  if (!this.enabled) return

  this.domElement.releasePointerCapture(event.pointerId)

  this.domElement.removeEventListener('pointermove', this._onPointerMove)

  this.pointerUp(this._getPointer(event))
}

function intersectObjectWithRay(object, raycaster, includeInvisible) {
  const allIntersections = raycaster.intersectObject(object, true)

  for (let i = 0; i < allIntersections.length; i++) {
    if (allIntersections[i].object.visible || includeInvisible) {
      return allIntersections[i]
    }
  }

  return false
}

//

// Reusable utility variables

const _tempEuler = new Euler()
const _alignVector = new Vector3(0, 1, 0)
const _zeroVector = new Vector3(0, 0, 0)
const _lookAtMatrix = new Matrix4()
const _tempQuaternion2 = new Quaternion()
const _identityQuaternion = new Quaternion()
const _dirVector = new Vector3()
const _tempMatrix = new Matrix4()

const _unitX = new Vector3(1, 0, 0)
const _unitY = new Vector3(0, 1, 0)
const _unitZ = new Vector3(0, 0, 1)

const _v1 = new Vector3()
const _v2 = new Vector3()
const _v3 = new Vector3()

class TransformControlsGizmo extends Object3D {
  constructor() {
    super()

    this.type = 'TransformControlsGizmo'

    // shared materials

    const gizmoMaterial = new MeshBasicMaterial({
      depthTest: false,
      depthWrite: false,
      fog: false,
      toneMapped: false,
      transparent: true
    })

    const gizmoLineMaterial = new LineBasicMaterial({
      depthTest: false,
      depthWrite: false,
      fog: false,
      toneMapped: false,
      transparent: true
    })

    // Make unique material for each axis/color

    const matInvisible = gizmoMaterial.clone()
    matInvisible.opacity = 0.15

    const matHelper = gizmoLineMaterial.clone()
    matHelper.opacity = 0.5

    const matRed = gizmoMaterial.clone()
    matRed.color.setHex(0xff819f)

    const matGreen = gizmoMaterial.clone()
    matGreen.color.setHex(0x85ffe1)

    const matBlue = gizmoMaterial.clone()
    matBlue.color.setHex(0x3988ff)

    const matRedTransparent = gizmoMaterial.clone()
    matRedTransparent.color.setHex(0xff819f)
    matRedTransparent.opacity = 0.8

    const matGreenTransparent = gizmoMaterial.clone()
    matGreenTransparent.color.setHex(0x85ffe1)
    matGreenTransparent.opacity = 0.8

    const matBlueTransparent = gizmoMaterial.clone()
    matBlueTransparent.color.setHex(0x3988ff)
    matBlueTransparent.opacity = 0.8

    const matWhiteTransparent = gizmoMaterial.clone()
    matWhiteTransparent.opacity = 0.25

    const matYellowTransparent = gizmoMaterial.clone()
    matYellowTransparent.color.setHex(0xffff00)
    matYellowTransparent.opacity = 0.25

    const matYellow = gizmoMaterial.clone()
    matYellow.color.setHex(0xffff00)

    const matGray = gizmoMaterial.clone()
    matGray.color.setHex(0x787878)

    // reusable geometry

    const arrowGeometry = new CylinderGeometry(0, 0.04, 0.1, 12)
    arrowGeometry.translate(0, 0.05, 0)

    const scaleHandleGeometry = new BoxGeometry(0.08, 0.08, 0.08)
    scaleHandleGeometry.translate(0, 0.04, 0)

    const lineGeometry = new BufferGeometry()
    lineGeometry.setAttribute(
      'position',
      new Float32BufferAttribute([0, 0, 0, 1, 0, 0], 3)
    )

    const lineGeometry2 = new CylinderGeometry(0.0075, 0.0075, 0.5, 3)
    lineGeometry2.translate(0, 0.25, 0)

    const sphereGeometry = new SphereGeometry(0.03, 32, 16)

    function CircleGeometry(radius, arc) {
      const geometry = new TorusGeometry(
        radius,
        0.0075,
        3,
        64,
        arc * Math.PI * 2
      )
      geometry.rotateY(Math.PI / 2)
      geometry.rotateX(Math.PI / 2)
      return geometry
    }

    // Special geometry for transform helper. If scaled with position vector it spans from [0,0,0] to position

    function TranslateHelperGeometry() {
      const geometry = new BufferGeometry()

      geometry.setAttribute(
        'position',
        new Float32BufferAttribute([0, 0, 0, 1, 1, 1], 3)
      )

      return geometry
    }

    // Gizmo definitions - custom hierarchy definitions for setupGizmo() function

    const gizmoTranslate = {
      X: [
        [new Mesh(arrowGeometry, matRed), [0.5, 0, 0], [0, 0, -Math.PI / 2]],
        [new Mesh(lineGeometry2, matRed), [0.1, 0, 0], [0, 0, -Math.PI / 2]],
        [new Mesh(sphereGeometry, matRed), [0.4, 0, 0], [0, 0, -Math.PI / 2]]
      ],
      Y: [
        [new Mesh(arrowGeometry, matGreen), [0, 0.5, 0]],
        [new Mesh(lineGeometry2, matGreen), [0, 0.1, 0]],
        [new Mesh(sphereGeometry, matGreen), [0, 0.4, 0]]
      ],
      Z: [
        [new Mesh(arrowGeometry, matBlue), [0, 0, 0.5], [Math.PI / 2, 0, 0]],
        [new Mesh(lineGeometry2, matBlue), [0, 0, 0.1], [Math.PI / 2, 0, 0]],
        [new Mesh(sphereGeometry, matBlue), [0, 0, 0.4], [Math.PI / 2, 0, 0]]
      ],
      XYZ: [
        [
          new Mesh(new OctahedronGeometry(0.1, 0), matWhiteTransparent.clone()),
          [0, 0, 0]
        ]
      ],
      XY: [
        [
          new Mesh(
            new BoxGeometry(0.15, 0.15, 0.01),
            matBlueTransparent.clone()
          ),
          [0.15, 0.15, 0]
        ]
      ],
      YZ: [
        [
          new Mesh(
            new BoxGeometry(0.15, 0.15, 0.01),
            matRedTransparent.clone()
          ),
          [0, 0.15, 0.15],
          [0, Math.PI / 2, 0]
        ]
      ],
      XZ: [
        [
          new Mesh(
            new BoxGeometry(0.15, 0.15, 0.01),
            matGreenTransparent.clone()
          ),
          [0.15, 0, 0.15],
          [-Math.PI / 2, 0, 0]
        ]
      ]
    }

    const pickerTranslate = {
      X: [
        [
          new Mesh(new CylinderGeometry(0.2, 0, 0.6, 4), matInvisible),
          [0.3, 0, 0],
          [0, 0, -Math.PI / 2]
        ],
        [
          new Mesh(new CylinderGeometry(0.2, 0, 0.6, 4), matInvisible),
          [-0.3, 0, 0],
          [0, 0, Math.PI / 2]
        ]
      ],
      Y: [
        [
          new Mesh(new CylinderGeometry(0.2, 0, 0.6, 4), matInvisible),
          [0, 0.3, 0]
        ],
        [
          new Mesh(new CylinderGeometry(0.2, 0, 0.6, 4), matInvisible),
          [0, -0.3, 0],
          [0, 0, Math.PI]
        ]
      ],
      Z: [
        [
          new Mesh(new CylinderGeometry(0.2, 0, 0.6, 4), matInvisible),
          [0, 0, 0.3],
          [Math.PI / 2, 0, 0]
        ],
        [
          new Mesh(new CylinderGeometry(0.2, 0, 0.6, 4), matInvisible),
          [0, 0, -0.3],
          [-Math.PI / 2, 0, 0]
        ]
      ],
      XYZ: [[new Mesh(new OctahedronGeometry(0.2, 0), matInvisible)]],
      XY: [
        [
          new Mesh(new BoxGeometry(0.2, 0.2, 0.01), matInvisible),
          [0.15, 0.15, 0]
        ]
      ],
      YZ: [
        [
          new Mesh(new BoxGeometry(0.2, 0.2, 0.01), matInvisible),
          [0, 0.15, 0.15],
          [0, Math.PI / 2, 0]
        ]
      ],
      XZ: [
        [
          new Mesh(new BoxGeometry(0.2, 0.2, 0.01), matInvisible),
          [0.15, 0, 0.15],
          [-Math.PI / 2, 0, 0]
        ]
      ]
    }

    const helperTranslate = {
      START: [
        [
          new Mesh(new OctahedronGeometry(0.01, 2), matHelper),
          null,
          null,
          null,
          'helper'
        ]
      ],
      END: [
        [
          new Mesh(new OctahedronGeometry(0.01, 2), matHelper),
          null,
          null,
          null,
          'helper'
        ]
      ],
      DELTA: [
        [
          new Line(TranslateHelperGeometry(), matHelper),
          null,
          null,
          null,
          'helper'
        ]
      ],
      X: [
        [
          new Line(lineGeometry, matHelper.clone()),
          [-1e3, 0, 0],
          null,
          [1e6, 1, 1],
          'helper'
        ]
      ],
      Y: [
        [
          new Line(lineGeometry, matHelper.clone()),
          [0, -1e3, 0],
          [0, 0, Math.PI / 2],
          [1e6, 1, 1],
          'helper'
        ]
      ],
      Z: [
        [
          new Line(lineGeometry, matHelper.clone()),
          [0, 0, -1e3],
          [0, -Math.PI / 2, 0],
          [1e6, 1, 1],
          'helper'
        ]
      ]
    }

    const gizmoRotate = {
      XYZE: [
        [new Mesh(CircleGeometry(0.5, 1), matGray), null, [0, Math.PI / 2, 0]]
      ],
      X: [[new Mesh(CircleGeometry(0.5, 0.5), matRed)]],
      Y: [
        [
          new Mesh(CircleGeometry(0.5, 0.5), matGreen),
          null,
          [0, 0, -Math.PI / 2]
        ]
      ],
      Z: [
        [new Mesh(CircleGeometry(0.5, 0.5), matBlue), null, [0, Math.PI / 2, 0]]
      ],
      E: [
        [
          new Mesh(CircleGeometry(0.75, 1), matYellowTransparent),
          null,
          [0, Math.PI / 2, 0]
        ]
      ]
    }

    const helperRotate = {
      AXIS: [
        [
          new Line(lineGeometry, matHelper.clone()),
          [-1e3, 0, 0],
          null,
          [1e6, 1, 1],
          'helper'
        ]
      ]
    }

    const pickerRotate = {
      XYZE: [[new Mesh(new SphereGeometry(0.25, 10, 8), matInvisible)]],
      X: [
        [
          new Mesh(new TorusGeometry(0.5, 0.1, 4, 24), matInvisible),
          [0, 0, 0],
          [0, -Math.PI / 2, -Math.PI / 2]
        ]
      ],
      Y: [
        [
          new Mesh(new TorusGeometry(0.5, 0.1, 4, 24), matInvisible),
          [0, 0, 0],
          [Math.PI / 2, 0, 0]
        ]
      ],
      Z: [
        [
          new Mesh(new TorusGeometry(0.5, 0.1, 4, 24), matInvisible),
          [0, 0, 0],
          [0, 0, -Math.PI / 2]
        ]
      ],
      E: [[new Mesh(new TorusGeometry(0.75, 0.1, 2, 24), matInvisible)]]
    }

    const gizmoScale = {
      X: [
        [
          new Mesh(scaleHandleGeometry, matRed),
          [0.5, 0, 0],
          [0, 0, -Math.PI / 2]
        ],
        [new Mesh(lineGeometry2, matRed), [0, 0, 0], [0, 0, -Math.PI / 2]],
        [
          new Mesh(scaleHandleGeometry, matRed),
          [-0.5, 0, 0],
          [0, 0, Math.PI / 2]
        ]
      ],
      Y: [
        [new Mesh(scaleHandleGeometry, matGreen), [0, 0.5, 0]],
        [new Mesh(lineGeometry2, matGreen)],
        [new Mesh(scaleHandleGeometry, matGreen), [0, -0.5, 0], [0, 0, Math.PI]]
      ],
      Z: [
        [
          new Mesh(scaleHandleGeometry, matBlue),
          [0, 0, 0.5],
          [Math.PI / 2, 0, 0]
        ],
        [new Mesh(lineGeometry2, matBlue), [0, 0, 0], [Math.PI / 2, 0, 0]],
        [
          new Mesh(scaleHandleGeometry, matBlue),
          [0, 0, -0.5],
          [-Math.PI / 2, 0, 0]
        ]
      ],
      XY: [
        [
          new Mesh(new BoxGeometry(0.15, 0.15, 0.01), matBlueTransparent),
          [0.15, 0.15, 0]
        ]
      ],
      YZ: [
        [
          new Mesh(new BoxGeometry(0.15, 0.15, 0.01), matRedTransparent),
          [0, 0.15, 0.15],
          [0, Math.PI / 2, 0]
        ]
      ],
      XZ: [
        [
          new Mesh(new BoxGeometry(0.15, 0.15, 0.01), matGreenTransparent),
          [0.15, 0, 0.15],
          [-Math.PI / 2, 0, 0]
        ]
      ],
      XYZ: [
        [new Mesh(new BoxGeometry(0.1, 0.1, 0.1), matWhiteTransparent.clone())]
      ]
    }

    const pickerScale = {
      X: [
        [
          new Mesh(new CylinderGeometry(0.2, 0, 0.6, 4), matInvisible),
          [0.3, 0, 0],
          [0, 0, -Math.PI / 2]
        ],
        [
          new Mesh(new CylinderGeometry(0.2, 0, 0.6, 4), matInvisible),
          [-0.3, 0, 0],
          [0, 0, Math.PI / 2]
        ]
      ],
      Y: [
        [
          new Mesh(new CylinderGeometry(0.2, 0, 0.6, 4), matInvisible),
          [0, 0.3, 0]
        ],
        [
          new Mesh(new CylinderGeometry(0.2, 0, 0.6, 4), matInvisible),
          [0, -0.3, 0],
          [0, 0, Math.PI]
        ]
      ],
      Z: [
        [
          new Mesh(new CylinderGeometry(0.2, 0, 0.6, 4), matInvisible),
          [0, 0, 0.3],
          [Math.PI / 2, 0, 0]
        ],
        [
          new Mesh(new CylinderGeometry(0.2, 0, 0.6, 4), matInvisible),
          [0, 0, -0.3],
          [-Math.PI / 2, 0, 0]
        ]
      ],
      XY: [
        [
          new Mesh(new BoxGeometry(0.2, 0.2, 0.01), matInvisible),
          [0.15, 0.15, 0]
        ]
      ],
      YZ: [
        [
          new Mesh(new BoxGeometry(0.2, 0.2, 0.01), matInvisible),
          [0, 0.15, 0.15],
          [0, Math.PI / 2, 0]
        ]
      ],
      XZ: [
        [
          new Mesh(new BoxGeometry(0.2, 0.2, 0.01), matInvisible),
          [0.15, 0, 0.15],
          [-Math.PI / 2, 0, 0]
        ]
      ],
      XYZ: [[new Mesh(new BoxGeometry(0.2, 0.2, 0.2), matInvisible), [0, 0, 0]]]
    }

    const helperScale = {
      X: [
        [
          new Line(lineGeometry, matHelper.clone()),
          [-1e3, 0, 0],
          null,
          [1e6, 1, 1],
          'helper'
        ]
      ],
      Y: [
        [
          new Line(lineGeometry, matHelper.clone()),
          [0, -1e3, 0],
          [0, 0, Math.PI / 2],
          [1e6, 1, 1],
          'helper'
        ]
      ],
      Z: [
        [
          new Line(lineGeometry, matHelper.clone()),
          [0, 0, -1e3],
          [0, -Math.PI / 2, 0],
          [1e6, 1, 1],
          'helper'
        ]
      ]
    }

    // Creates an Object3D with gizmos described in custom hierarchy definition.

    function setupGizmo(gizmoMap) {
      const gizmo = new Object3D()

      for (const name in gizmoMap) {
        for (let i = gizmoMap[name].length; i--; ) {
          const object = gizmoMap[name][i][0].clone()
          const position = gizmoMap[name][i][1]
          const rotation = gizmoMap[name][i][2]
          const scale = gizmoMap[name][i][3]
          const tag = gizmoMap[name][i][4]

          // name and tag properties are essential for picking and updating logic.
          object.name = name
          object.tag = tag

          if (position) {
            object.position.set(position[0], position[1], position[2])
          }

          if (rotation) {
            object.rotation.set(rotation[0], rotation[1], rotation[2])
          }

          if (scale) {
            object.scale.set(scale[0], scale[1], scale[2])
          }

          object.updateMatrix()

          const tempGeometry = object.geometry.clone()
          tempGeometry.applyMatrix4(object.matrix)
          object.geometry = tempGeometry
          object.renderOrder = Infinity

          object.position.set(0, 0, 0)
          object.rotation.set(0, 0, 0)
          object.scale.set(1, 1, 1)

          gizmo.add(object)
        }
      }

      return gizmo
    }

    // Gizmo creation

    this.gizmo = {}
    this.picker = {}
    this.helper = {}

    this.add((this.gizmo['translate'] = setupGizmo(gizmoTranslate)))
    this.add((this.gizmo['rotate'] = setupGizmo(gizmoRotate)))
    this.add((this.gizmo['scale'] = setupGizmo(gizmoScale)))
    this.add((this.picker['translate'] = setupGizmo(pickerTranslate)))
    this.add((this.picker['rotate'] = setupGizmo(pickerRotate)))
    this.add((this.picker['scale'] = setupGizmo(pickerScale)))
    this.add((this.helper['translate'] = setupGizmo(helperTranslate)))
    this.add((this.helper['rotate'] = setupGizmo(helperRotate)))
    this.add((this.helper['scale'] = setupGizmo(helperScale)))

    // Pickers should be hidden always

    this.picker['translate'].visible = false
    this.picker['rotate'].visible = false
    this.picker['scale'].visible = false
  }

  // updateMatrixWorld will update transformations and appearance of individual handles

  updateMatrixWorld(force) {
    const space = this.mode === 'scale' ? 'local' : this.space // scale always oriented to local rotation

    const quaternion =
      space === 'local' ? this.worldQuaternion : _identityQuaternion

    // Show only gizmos for current transform mode

    this.gizmo['translate'].visible = this.mode === 'translate'
    this.gizmo['rotate'].visible = this.mode === 'rotate'
    this.gizmo['scale'].visible = this.mode === 'scale'

    this.helper['translate'].visible = this.mode === 'translate'
    this.helper['rotate'].visible = this.mode === 'rotate'
    this.helper['scale'].visible = this.mode === 'scale'

    let handles = []
    handles = handles.concat(this.picker[this.mode].children)
    handles = handles.concat(this.gizmo[this.mode].children)
    handles = handles.concat(this.helper[this.mode].children)

    for (let i = 0; i < handles.length; i++) {
      const handle = handles[i]

      // hide aligned to camera

      handle.visible = true
      handle.rotation.set(0, 0, 0)
      handle.position.copy(this.worldPosition)

      let factor

      if (this.camera.isOrthographicCamera) {
        factor = (this.camera.top - this.camera.bottom) / this.camera.zoom
      } else {
        factor =
          this.worldPosition.distanceTo(this.cameraPosition) *
          Math.min(
            (1.9 * Math.tan((Math.PI * this.camera.fov) / 360)) /
              this.camera.zoom,
            7
          )
      }

      handle.scale.set(1, 1, 1).multiplyScalar((factor * this.size) / 4)

      // TODO: simplify helpers and consider decoupling from gizmo

      if (handle.tag === 'helper') {
        handle.visible = false

        if (handle.name === 'AXIS') {
          handle.position.copy(this.worldPositionStart)
          handle.visible = !!this.axis

          if (this.axis === 'X') {
            _tempQuaternion.setFromEuler(_tempEuler.set(0, 0, 0))
            handle.quaternion.copy(quaternion).multiply(_tempQuaternion)

            if (
              Math.abs(
                _alignVector
                  .copy(_unitX)
                  .applyQuaternion(quaternion)
                  .dot(this.eye)
              ) > 0.9
            ) {
              handle.visible = false
            }
          }

          if (this.axis === 'Y') {
            _tempQuaternion.setFromEuler(_tempEuler.set(0, 0, Math.PI / 2))
            handle.quaternion.copy(quaternion).multiply(_tempQuaternion)

            if (
              Math.abs(
                _alignVector
                  .copy(_unitY)
                  .applyQuaternion(quaternion)
                  .dot(this.eye)
              ) > 0.9
            ) {
              handle.visible = false
            }
          }

          if (this.axis === 'Z') {
            _tempQuaternion.setFromEuler(_tempEuler.set(0, Math.PI / 2, 0))
            handle.quaternion.copy(quaternion).multiply(_tempQuaternion)

            if (
              Math.abs(
                _alignVector
                  .copy(_unitZ)
                  .applyQuaternion(quaternion)
                  .dot(this.eye)
              ) > 0.9
            ) {
              handle.visible = false
            }
          }

          if (this.axis === 'XYZE') {
            _tempQuaternion.setFromEuler(_tempEuler.set(0, Math.PI / 2, 0))
            _alignVector.copy(this.rotationAxis)
            handle.quaternion.setFromRotationMatrix(
              _lookAtMatrix.lookAt(_zeroVector, _alignVector, _unitY)
            )
            handle.quaternion.multiply(_tempQuaternion)
            handle.visible = this.dragging
          }

          if (this.axis === 'E') {
            handle.visible = false
          }
        } else if (handle.name === 'START') {
          handle.position.copy(this.worldPositionStart)
          handle.visible = this.dragging
        } else if (handle.name === 'END') {
          handle.position.copy(this.worldPosition)
          handle.visible = this.dragging
        } else if (handle.name === 'DELTA') {
          handle.position.copy(this.worldPositionStart)
          handle.quaternion.copy(this.worldQuaternionStart)
          _tempVector
            .set(1e-10, 1e-10, 1e-10)
            .add(this.worldPositionStart)
            .sub(this.worldPosition)
            .multiplyScalar(-1)
          _tempVector.applyQuaternion(
            this.worldQuaternionStart.clone().invert()
          )
          handle.scale.copy(_tempVector)
          handle.visible = this.dragging
        } else {
          handle.quaternion.copy(quaternion)

          if (this.dragging) {
            handle.position.copy(this.worldPositionStart)
          } else {
            handle.position.copy(this.worldPosition)
          }

          if (this.axis) {
            handle.visible = this.axis.search(handle.name) !== -1
          }
        }

        // If updating helper, skip rest of the loop
        continue
      }

      // Align handles to current local or world rotation

      handle.quaternion.copy(quaternion)

      if (this.mode === 'translate' || this.mode === 'scale') {
        // Hide translate and scale axis facing the camera

        const AXIS_HIDE_TRESHOLD = 0.99
        const PLANE_HIDE_TRESHOLD = 0.2

        if (handle.name === 'X') {
          if (
            Math.abs(
              _alignVector
                .copy(_unitX)
                .applyQuaternion(quaternion)
                .dot(this.eye)
            ) > AXIS_HIDE_TRESHOLD
          ) {
            handle.scale.set(1e-10, 1e-10, 1e-10)
            handle.visible = false
          }
        }

        if (handle.name === 'Y') {
          if (
            Math.abs(
              _alignVector
                .copy(_unitY)
                .applyQuaternion(quaternion)
                .dot(this.eye)
            ) > AXIS_HIDE_TRESHOLD
          ) {
            handle.scale.set(1e-10, 1e-10, 1e-10)
            handle.visible = false
          }
        }

        if (handle.name === 'Z') {
          if (
            Math.abs(
              _alignVector
                .copy(_unitZ)
                .applyQuaternion(quaternion)
                .dot(this.eye)
            ) > AXIS_HIDE_TRESHOLD
          ) {
            handle.scale.set(1e-10, 1e-10, 1e-10)
            handle.visible = false
          }
        }

        if (handle.name === 'XY') {
          if (
            Math.abs(
              _alignVector
                .copy(_unitZ)
                .applyQuaternion(quaternion)
                .dot(this.eye)
            ) < PLANE_HIDE_TRESHOLD
          ) {
            handle.scale.set(1e-10, 1e-10, 1e-10)
            handle.visible = false
          }
        }

        if (handle.name === 'YZ') {
          if (
            Math.abs(
              _alignVector
                .copy(_unitX)
                .applyQuaternion(quaternion)
                .dot(this.eye)
            ) < PLANE_HIDE_TRESHOLD
          ) {
            handle.scale.set(1e-10, 1e-10, 1e-10)
            handle.visible = false
          }
        }

        if (handle.name === 'XZ') {
          if (
            Math.abs(
              _alignVector
                .copy(_unitY)
                .applyQuaternion(quaternion)
                .dot(this.eye)
            ) < PLANE_HIDE_TRESHOLD
          ) {
            handle.scale.set(1e-10, 1e-10, 1e-10)
            handle.visible = false
          }
        }
      } else if (this.mode === 'rotate') {
        // Align handles to current local or world rotation

        _tempQuaternion2.copy(quaternion)
        _alignVector
          .copy(this.eye)
          .applyQuaternion(_tempQuaternion.copy(quaternion).invert())

        if (handle.name.search('E') !== -1) {
          handle.quaternion.setFromRotationMatrix(
            _lookAtMatrix.lookAt(this.eye, _zeroVector, _unitY)
          )
        }

        if (handle.name === 'X') {
          _tempQuaternion.setFromAxisAngle(
            _unitX,
            Math.atan2(-_alignVector.y, _alignVector.z)
          )
          _tempQuaternion.multiplyQuaternions(_tempQuaternion2, _tempQuaternion)
          handle.quaternion.copy(_tempQuaternion)
        }

        if (handle.name === 'Y') {
          _tempQuaternion.setFromAxisAngle(
            _unitY,
            Math.atan2(_alignVector.x, _alignVector.z)
          )
          _tempQuaternion.multiplyQuaternions(_tempQuaternion2, _tempQuaternion)
          handle.quaternion.copy(_tempQuaternion)
        }

        if (handle.name === 'Z') {
          _tempQuaternion.setFromAxisAngle(
            _unitZ,
            Math.atan2(_alignVector.y, _alignVector.x)
          )
          _tempQuaternion.multiplyQuaternions(_tempQuaternion2, _tempQuaternion)
          handle.quaternion.copy(_tempQuaternion)
        }
      }

      // Hide disabled axes
      handle.visible =
        handle.visible && (handle.name.indexOf('X') === -1 || this.showX)
      handle.visible =
        handle.visible && (handle.name.indexOf('Y') === -1 || this.showY)
      handle.visible =
        handle.visible && (handle.name.indexOf('Z') === -1 || this.showZ)
      handle.visible =
        handle.visible &&
        (handle.name.indexOf('E') === -1 ||
          (this.showX && this.showY && this.showZ))

      // highlight selected axis

      handle.material._color =
        handle.material._color || handle.material.color.clone()
      handle.material._opacity =
        handle.material._opacity || handle.material.opacity

      handle.material.color.copy(handle.material._color)
      handle.material.opacity = handle.material._opacity

      if (this.enabled && this.axis) {
        if (handle.name === this.axis) {
          handle.material.color.setHex(0xffff00)
          handle.material.opacity = 1.0
        } else if (
          this.axis.split('').some(function (a) {
            return handle.name === a
          })
        ) {
          handle.material.color.setHex(0xffff00)
          handle.material.opacity = 1.0
        }
      }
    }

    super.updateMatrixWorld(force)
  }
}

TransformControlsGizmo.prototype.isTransformControlsGizmo = true

//

class TransformControlsPlane extends Mesh {
  constructor() {
    super(
      new PlaneGeometry(100000, 100000, 2, 2),
      new MeshBasicMaterial({
        visible: false,
        wireframe: true,
        side: DoubleSide,
        transparent: true,
        opacity: 0.1,
        toneMapped: false
      })
    )

    this.type = 'TransformControlsPlane'
  }

  updateMatrixWorld(force) {
    let space = this.space

    this.position.copy(this.worldPosition)

    if (this.mode === 'scale') space = 'local' // scale always oriented to local rotation

    _v1
      .copy(_unitX)
      .applyQuaternion(
        space === 'local' ? this.worldQuaternion : _identityQuaternion
      )
    _v2
      .copy(_unitY)
      .applyQuaternion(
        space === 'local' ? this.worldQuaternion : _identityQuaternion
      )
    _v3
      .copy(_unitZ)
      .applyQuaternion(
        space === 'local' ? this.worldQuaternion : _identityQuaternion
      )

    // Align the plane for current transform mode, axis and space.

    _alignVector.copy(_v2)

    switch (this.mode) {
      case 'translate':
      case 'scale':
        switch (this.axis) {
          case 'X':
            _alignVector.copy(this.eye).cross(_v1)
            _dirVector.copy(_v1).cross(_alignVector)
            break
          case 'Y':
            _alignVector.copy(this.eye).cross(_v2)
            _dirVector.copy(_v2).cross(_alignVector)
            break
          case 'Z':
            _alignVector.copy(this.eye).cross(_v3)
            _dirVector.copy(_v3).cross(_alignVector)
            break
          case 'XY':
            _dirVector.copy(_v3)
            break
          case 'YZ':
            _dirVector.copy(_v1)
            break
          case 'XZ':
            _alignVector.copy(_v3)
            _dirVector.copy(_v2)
            break
          case 'XYZ':
          case 'E':
            _dirVector.set(0, 0, 0)
            break
        }

        break
      case 'rotate':
      default:
        // special case for rotate
        _dirVector.set(0, 0, 0)
    }

    if (_dirVector.length() === 0) {
      // If in rotate mode, make the plane parallel to camera
      this.quaternion.copy(this.cameraQuaternion)
    } else {
      _tempMatrix.lookAt(_tempVector.set(0, 0, 0), _dirVector, _alignVector)

      this.quaternion.setFromRotationMatrix(_tempMatrix)
    }

    super.updateMatrixWorld(force)
  }
}

TransformControlsPlane.prototype.isTransformControlsPlane = true

//===============================================================================================================================================================================
// OrbitControls

const _changeEvent = {type: 'change'}
const _startEvent = {type: 'start'}
const _endEvent = {type: 'end'}

class OrbitControls extends EventDispatcher {
  enablePan: boolean
  enableRotate: boolean
  minPolarAngle: any
  maxPolarAngle: any
  minAzimuthAngle: any
  maxAzimuthAngle: any
  minDistance: any
  maxDistance: any
  minZoom: any
  maxZoom: any
  minPan: any
  maxPan: any
  target: THREE.Vector3
  object: THREE.PerspectiveCamera
  reset: any
  dispose: any
  update: any
  enabled: boolean
  constructor(object, domElement) {
    super()

    if (domElement === undefined)
      console.warn(
        'THREE.OrbitControls: The second parameter "domElement" is now mandatory.'
      )
    if (domElement === document)
      console.error(
        'THREE.OrbitControls: "document" should not be used as the target "domElement". Please use "renderer.domElement" instead.'
      )

    this.object = object
    this.domElement = domElement
    this.domElement.style.touchAction = 'none' // disable touch scroll

    // Set to false to disable this control
    this.enabled = true

    // "target" sets the location of focus, where the object orbits around
    this.target = new Vector3()

    // How far you can dolly in and out ( PerspectiveCamera only )
    this.minDistance = 0
    this.maxDistance = Infinity

    // How far you can zoom in and out ( OrthographicCamera only )
    this.minZoom = 0
    this.maxZoom = Infinity

    // How far you can orbit vertically, upper and lower limits.
    // Range is 0 to Math.PI radians.
    this.minPolarAngle = 0 // radians
    this.maxPolarAngle = Math.PI // radians

    // How far you can orbit horizontally, upper and lower limits.
    // If set, the interval [ min, max ] must be a sub-interval of [ - 2 PI, 2 PI ], with ( max - min < 2 PI )
    this.minAzimuthAngle = -Infinity // radians
    this.maxAzimuthAngle = Infinity // radians

    // Set to true to enable damping (inertia)
    // If damping is enabled, you must call controls.update() in your animation loop
    this.enableDamping = false
    this.dampingFactor = 0.05

    // This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
    // Set to false to disable zooming
    this.enableZoom = true
    this.zoomSpeed = 1.0

    // Set to false to disable rotating
    this.enableRotate = true
    this.rotateSpeed = 1.0

    // Set to false to disable panning
    this.enablePan = true
    this.panSpeed = 1.0
    this.screenSpacePanning = true // if false, pan orthogonal to world-space direction camera.up
    this.keyPanSpeed = 7.0 // pixels moved per arrow key push

    // Set to true to automatically rotate around the target
    // If auto-rotate is enabled, you must call controls.update() in your animation loop
    this.autoRotate = false
    this.autoRotateSpeed = 2.0 // 30 seconds per orbit when fps is 60

    // The four arrow keys
    this.keys = {
      LEFT: 'ArrowLeft',
      UP: 'ArrowUp',
      RIGHT: 'ArrowRight',
      BOTTOM: 'ArrowDown'
    }

    // Mouse buttons
    this.mouseButtons = {
      LEFT: MOUSE.ROTATE,
      MIDDLE: MOUSE.DOLLY,
      RIGHT: MOUSE.PAN
    }

    // Touch fingers
    this.touches = {ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_PAN}

    // for reset
    this.target0 = this.target.clone()
    this.position0 = this.object.position.clone()
    this.zoom0 = this.object.zoom

    // the target DOM element for key events
    this._domElementKeyEvents = null

    //https://discourse.threejs.org/t/how-to-limit-pan-in-orbitcontrols-for-orthographiccamera/9061

    this.minPan = new Vector3(-100, -100, -100)
    this.maxPan = new Vector3(100, 100, 100)
    //
    // public methods
    //

    this.getPolarAngle = function () {
      return spherical.phi
    }

    this.getAzimuthalAngle = function () {
      return spherical.theta
    }

    this.getDistance = function () {
      return this.object.position.distanceTo(this.target)
    }

    this.listenToKeyEvents = function (domElement) {
      domElement.addEventListener('keydown', onKeyDown)
      this._domElementKeyEvents = domElement
    }

    this.saveState = function () {
      scope.target0.copy(scope.target)
      scope.position0.copy(scope.object.position)
      scope.zoom0 = scope.object.zoom
    }

    this.reset = function () {
      scope.target.copy(scope.target0)
      scope.object.position.copy(scope.position0)
      scope.object.zoom = scope.zoom0

      scope.object.updateProjectionMatrix()
      scope.dispatchEvent(_changeEvent)

      scope.update()

      state = STATE.NONE
    }

    // this method is exposed, but perhaps it would be better if we can make it private...
    this.update = (function () {
      const offset = new Vector3()

      // so camera.up is the orbit axis
      const quat = new Quaternion().setFromUnitVectors(
        object.up,
        new Vector3(0, 1, 0)
      )
      const quatInverse = quat.clone().invert()

      const lastPosition = new Vector3()
      const lastQuaternion = new Quaternion()

      const twoPI = 2 * Math.PI

      return function update() {
        const position = scope.object.position

        offset.copy(position).sub(scope.target)

        // rotate offset to "y-axis-is-up" space
        offset.applyQuaternion(quat)

        // angle from z-axis around y-axis
        spherical.setFromVector3(offset)

        if (scope.autoRotate && state === STATE.NONE) {
          rotateLeft(getAutoRotationAngle())
        }

        if (scope.enableDamping) {
          spherical.theta += sphericalDelta.theta * scope.dampingFactor
          spherical.phi += sphericalDelta.phi * scope.dampingFactor
        } else {
          spherical.theta += sphericalDelta.theta
          spherical.phi += sphericalDelta.phi
        }

        // restrict theta to be between desired limits

        let min = scope.minAzimuthAngle
        let max = scope.maxAzimuthAngle

        if (isFinite(min) && isFinite(max)) {
          if (min < -Math.PI) min += twoPI
          else if (min > Math.PI) min -= twoPI

          if (max < -Math.PI) max += twoPI
          else if (max > Math.PI) max -= twoPI

          if (min <= max) {
            spherical.theta = Math.max(min, Math.min(max, spherical.theta))
          } else {
            spherical.theta =
              spherical.theta > (min + max) / 2
                ? Math.max(min, spherical.theta)
                : Math.min(max, spherical.theta)
          }
        }

        // restrict phi to be between desired limits
        spherical.phi = Math.max(
          scope.minPolarAngle,
          Math.min(scope.maxPolarAngle, spherical.phi)
        )

        spherical.makeSafe()

        spherical.radius *= scale

        // restrict radius to be between desired limits
        spherical.radius = Math.max(
          scope.minDistance,
          Math.min(scope.maxDistance, spherical.radius)
        )

        // move target to panned location

        if (scope.enableDamping === true) {
          scope.target.addScaledVector(panOffset, scope.dampingFactor)
        } else {
          scope.target.add(panOffset)
        }

        // https://discourse.threejs.org/t/how-to-limit-pan-in-orbitcontrols-for-orthographiccamera/9061
        scope.target.clamp(this.minPan, this.maxPan)

        offset.setFromSpherical(spherical)

        // rotate offset back to "camera-up-vector-is-up" space
        offset.applyQuaternion(quatInverse)

        position.copy(scope.target).add(offset)

        scope.object.lookAt(scope.target)

        if (scope.enableDamping === true) {
          sphericalDelta.theta *= 1 - scope.dampingFactor
          sphericalDelta.phi *= 1 - scope.dampingFactor

          panOffset.multiplyScalar(1 - scope.dampingFactor)
        } else {
          sphericalDelta.set(0, 0, 0)

          panOffset.set(0, 0, 0)
        }

        scale = 1

        // update condition is:
        // min(camera displacement, camera rotation in radians)^2 > EPS
        // using small-angle approximation cos(x/2) = 1 - x^2 / 8

        if (
          zoomChanged ||
          lastPosition.distanceToSquared(scope.object.position) > EPS ||
          8 * (1 - lastQuaternion.dot(scope.object.quaternion)) > EPS
        ) {
          scope.dispatchEvent(_changeEvent)

          lastPosition.copy(scope.object.position)
          lastQuaternion.copy(scope.object.quaternion)
          zoomChanged = false

          return true
        }

        return false
      }
    })()

    this.dispose = function () {
      scope.domElement.removeEventListener('contextmenu', onContextMenu)

      scope.domElement.removeEventListener('pointerdown', onPointerDown)
      scope.domElement.removeEventListener('pointercancel', onPointerCancel)
      scope.domElement.removeEventListener('wheel', onMouseWheel)

      scope.domElement.removeEventListener('pointermove', onPointerMove)
      scope.domElement.removeEventListener('pointerup', onPointerUp)

      if (scope._domElementKeyEvents !== null) {
        scope._domElementKeyEvents.removeEventListener('keydown', onKeyDown)
      }

      //scope.dispatchEvent( { type: 'dispose' } ); // should this be added here?
    }

    //
    // internals
    //

    const scope = this

    const STATE = {
      NONE: -1,
      ROTATE: 0,
      DOLLY: 1,
      PAN: 2,
      TOUCH_ROTATE: 3,
      TOUCH_PAN: 4,
      TOUCH_DOLLY_PAN: 5,
      TOUCH_DOLLY_ROTATE: 6
    }

    let state = STATE.NONE

    const EPS = 0.000001

    // current position in spherical coordinates
    const spherical = new Spherical()
    const sphericalDelta = new Spherical()

    let scale = 1
    const panOffset = new Vector3()
    let zoomChanged = false

    const rotateStart = new Vector2()
    const rotateEnd = new Vector2()
    const rotateDelta = new Vector2()

    const panStart = new Vector2()
    const panEnd = new Vector2()
    const panDelta = new Vector2()

    const dollyStart = new Vector2()
    const dollyEnd = new Vector2()
    const dollyDelta = new Vector2()

    const pointers = []
    const pointerPositions = {}

    function getAutoRotationAngle() {
      return ((2 * Math.PI) / 60 / 60) * scope.autoRotateSpeed
    }

    function getZoomScale() {
      return Math.pow(0.95, scope.zoomSpeed)
    }

    function rotateLeft(angle) {
      sphericalDelta.theta -= angle
    }

    function rotateUp(angle) {
      sphericalDelta.phi -= angle
    }

    const panLeft = (function () {
      const v = new Vector3()

      return function panLeft(distance, objectMatrix) {
        v.setFromMatrixColumn(objectMatrix, 0) // get X column of objectMatrix
        v.multiplyScalar(-distance)

        panOffset.add(v)
      }
    })()

    const panUp = (function () {
      const v = new Vector3()

      return function panUp(distance, objectMatrix) {
        if (scope.screenSpacePanning === true) {
          v.setFromMatrixColumn(objectMatrix, 1)
        } else {
          v.setFromMatrixColumn(objectMatrix, 0)
          v.crossVectors(scope.object.up, v)
        }

        v.multiplyScalar(distance)

        panOffset.add(v)
      }
    })()

    // deltaX and deltaY are in pixels; right and down are positive
    const pan = (function () {
      const offset = new Vector3()

      return function pan(deltaX, deltaY) {
        const element = scope.domElement

        if (scope.object.isPerspectiveCamera) {
          // perspective
          const position = scope.object.position
          offset.copy(position).sub(scope.target)
          let targetDistance = offset.length()

          // half of the fov is center to top of screen
          targetDistance *= Math.tan(((scope.object.fov / 2) * Math.PI) / 180.0)

          // we use only clientHeight here so aspect ratio does not distort speed
          panLeft(
            (2 * deltaX * targetDistance) / element.clientHeight,
            scope.object.matrix
          )
          panUp(
            (2 * deltaY * targetDistance) / element.clientHeight,
            scope.object.matrix
          )
        } else if (scope.object.isOrthographicCamera) {
          // orthographic
          panLeft(
            (deltaX * (scope.object.right - scope.object.left)) /
              scope.object.zoom /
              element.clientWidth,
            scope.object.matrix
          )
          panUp(
            (deltaY * (scope.object.top - scope.object.bottom)) /
              scope.object.zoom /
              element.clientHeight,
            scope.object.matrix
          )
        } else {
          // camera neither orthographic nor perspective
          console.warn(
            'WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.'
          )
          scope.enablePan = false
        }
      }
    })()

    function dollyOut(dollyScale) {
      if (scope.object.isPerspectiveCamera) {
        scale /= dollyScale
      } else if (scope.object.isOrthographicCamera) {
        scope.object.zoom = Math.max(
          scope.minZoom,
          Math.min(scope.maxZoom, scope.object.zoom * dollyScale)
        )
        scope.object.updateProjectionMatrix()
        zoomChanged = true
      } else {
        console.warn(
          'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.'
        )
        scope.enableZoom = false
      }
    }

    function dollyIn(dollyScale) {
      if (scope.object.isPerspectiveCamera) {
        scale *= dollyScale
      } else if (scope.object.isOrthographicCamera) {
        scope.object.zoom = Math.max(
          scope.minZoom,
          Math.min(scope.maxZoom, scope.object.zoom / dollyScale)
        )
        scope.object.updateProjectionMatrix()
        zoomChanged = true
      } else {
        console.warn(
          'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.'
        )
        scope.enableZoom = false
      }
    }

    //
    // event callbacks - update the object state
    //

    function handleMouseDownRotate(event) {
      rotateStart.set(event.clientX, event.clientY)
    }

    function handleMouseDownDolly(event) {
      dollyStart.set(event.clientX, event.clientY)
    }

    function handleMouseDownPan(event) {
      panStart.set(event.clientX, event.clientY)
    }

    function handleMouseMoveRotate(event) {
      rotateEnd.set(event.clientX, event.clientY)

      rotateDelta
        .subVectors(rotateEnd, rotateStart)
        .multiplyScalar(scope.rotateSpeed)

      const element = scope.domElement

      rotateLeft((2 * Math.PI * rotateDelta.x) / element.clientHeight) // yes, height

      rotateUp((2 * Math.PI * rotateDelta.y) / element.clientHeight)

      rotateStart.copy(rotateEnd)

      scope.update()
    }

    function handleMouseMoveDolly(event) {
      dollyEnd.set(event.clientX, event.clientY)

      dollyDelta.subVectors(dollyEnd, dollyStart)

      if (dollyDelta.y > 0) {
        dollyOut(getZoomScale())
      } else if (dollyDelta.y < 0) {
        dollyIn(getZoomScale())
      }

      dollyStart.copy(dollyEnd)

      scope.update()
    }

    function handleMouseMovePan(event) {
      panEnd.set(event.clientX, event.clientY)

      panDelta.subVectors(panEnd, panStart).multiplyScalar(scope.panSpeed)

      pan(panDelta.x, panDelta.y)

      panStart.copy(panEnd)

      scope.update()
    }

    function handleMouseWheel(event) {
      if (event.deltaY < 0) {
        dollyIn(getZoomScale())
      } else if (event.deltaY > 0) {
        dollyOut(getZoomScale())
      }

      scope.update()
    }

    function handleKeyDown(event) {
      let needsUpdate = false

      switch (event.code) {
        case scope.keys.UP:
          pan(0, scope.keyPanSpeed)
          needsUpdate = true
          break

        case scope.keys.BOTTOM:
          pan(0, -scope.keyPanSpeed)
          needsUpdate = true
          break

        case scope.keys.LEFT:
          pan(scope.keyPanSpeed, 0)
          needsUpdate = true
          break

        case scope.keys.RIGHT:
          pan(-scope.keyPanSpeed, 0)
          needsUpdate = true
          break
      }

      if (needsUpdate) {
        // prevent the browser from scrolling on cursor keys
        event.preventDefault()

        scope.update()
      }
    }

    function handleTouchStartRotate() {
      if (pointers.length === 1) {
        rotateStart.set(pointers[0].pageX, pointers[0].pageY)
      } else {
        const x = 0.5 * (pointers[0].pageX + pointers[1].pageX)
        const y = 0.5 * (pointers[0].pageY + pointers[1].pageY)

        rotateStart.set(x, y)
      }
    }

    function handleTouchStartPan() {
      if (pointers.length === 1) {
        panStart.set(pointers[0].pageX, pointers[0].pageY)
      } else {
        const x = 0.5 * (pointers[0].pageX + pointers[1].pageX)
        const y = 0.5 * (pointers[0].pageY + pointers[1].pageY)

        panStart.set(x, y)
      }
    }

    function handleTouchStartDolly() {
      const dx = pointers[0].pageX - pointers[1].pageX
      const dy = pointers[0].pageY - pointers[1].pageY

      const distance = Math.sqrt(dx * dx + dy * dy)

      dollyStart.set(0, distance)
    }

    function handleTouchStartDollyPan() {
      if (scope.enableZoom) handleTouchStartDolly()

      if (scope.enablePan) handleTouchStartPan()
    }

    function handleTouchStartDollyRotate() {
      if (scope.enableZoom) handleTouchStartDolly()

      if (scope.enableRotate) handleTouchStartRotate()
    }

    function handleTouchMoveRotate(event) {
      if (pointers.length == 1) {
        rotateEnd.set(event.pageX, event.pageY)
      } else {
        const position = getSecondPointerPosition(event)

        const x = 0.5 * (event.pageX + position.x)
        const y = 0.5 * (event.pageY + position.y)

        rotateEnd.set(x, y)
      }

      rotateDelta
        .subVectors(rotateEnd, rotateStart)
        .multiplyScalar(scope.rotateSpeed)

      const element = scope.domElement

      rotateLeft((2 * Math.PI * rotateDelta.x) / element.clientHeight) // yes, height

      rotateUp((2 * Math.PI * rotateDelta.y) / element.clientHeight)

      rotateStart.copy(rotateEnd)
    }

    function handleTouchMovePan(event) {
      if (pointers.length === 1) {
        panEnd.set(event.pageX, event.pageY)
      } else {
        const position = getSecondPointerPosition(event)

        const x = 0.5 * (event.pageX + position.x)
        const y = 0.5 * (event.pageY + position.y)

        panEnd.set(x, y)
      }

      panDelta.subVectors(panEnd, panStart).multiplyScalar(scope.panSpeed)

      pan(panDelta.x, panDelta.y)

      panStart.copy(panEnd)
    }

    function handleTouchMoveDolly(event) {
      const position = getSecondPointerPosition(event)

      const dx = event.pageX - position.x
      const dy = event.pageY - position.y

      const distance = Math.sqrt(dx * dx + dy * dy)

      dollyEnd.set(0, distance)

      dollyDelta.set(0, Math.pow(dollyEnd.y / dollyStart.y, scope.zoomSpeed))

      dollyOut(dollyDelta.y)

      dollyStart.copy(dollyEnd)
    }

    function handleTouchMoveDollyPan(event) {
      if (scope.enableZoom) handleTouchMoveDolly(event)

      if (scope.enablePan) handleTouchMovePan(event)
    }

    function handleTouchMoveDollyRotate(event) {
      if (scope.enableZoom) handleTouchMoveDolly(event)

      if (scope.enableRotate) handleTouchMoveRotate(event)
    }

    //
    // event handlers - FSM: listen for events and reset state
    //

    function onPointerDown(event) {
      if (scope.enabled === false) return

      if (pointers.length === 0) {
        scope.domElement.setPointerCapture(event.pointerId)

        scope.domElement.addEventListener('pointermove', onPointerMove)
        scope.domElement.addEventListener('pointerup', onPointerUp)
      }

      //

      addPointer(event)

      if (event.pointerType === 'touch') {
        onTouchStart(event)
      } else {
        onMouseDown(event)
      }
    }

    function onPointerMove(event) {
      if (scope.enabled === false) return

      if (event.pointerType === 'touch') {
        onTouchMove(event)
      } else {
        onMouseMove(event)
      }
    }

    function onPointerUp(event) {
      removePointer(event)

      if (pointers.length === 0) {
        scope.domElement.releasePointerCapture(event.pointerId)

        scope.domElement.removeEventListener('pointermove', onPointerMove)
        scope.domElement.removeEventListener('pointerup', onPointerUp)
      }

      scope.dispatchEvent(_endEvent)

      state = STATE.NONE
    }

    function onPointerCancel(event) {
      removePointer(event)
    }

    function onMouseDown(event) {
      let mouseAction

      switch (event.button) {
        case 0:
          mouseAction = scope.mouseButtons.LEFT
          break

        case 1:
          mouseAction = scope.mouseButtons.MIDDLE
          break

        case 2:
          mouseAction = scope.mouseButtons.RIGHT
          break

        default:
          mouseAction = -1
      }

      switch (mouseAction) {
        case MOUSE.DOLLY:
          if (scope.enableZoom === false) return

          handleMouseDownDolly(event)

          state = STATE.DOLLY

          break

        case MOUSE.ROTATE:
          if (event.ctrlKey || event.metaKey || event.shiftKey) {
            if (scope.enablePan === false) return

            handleMouseDownPan(event)

            state = STATE.PAN
          } else {
            if (scope.enableRotate === false) return

            handleMouseDownRotate(event)

            state = STATE.ROTATE
          }

          break

        case MOUSE.PAN:
          if (event.ctrlKey || event.metaKey || event.shiftKey) {
            if (scope.enableRotate === false) return

            handleMouseDownRotate(event)

            state = STATE.ROTATE
          } else {
            if (scope.enablePan === false) return

            handleMouseDownPan(event)

            state = STATE.PAN
          }

          break

        default:
          state = STATE.NONE
      }

      if (state !== STATE.NONE) {
        scope.dispatchEvent(_startEvent)
      }
    }

    function onMouseMove(event) {
      if (scope.enabled === false) return

      switch (state) {
        case STATE.ROTATE:
          if (scope.enableRotate === false) return

          handleMouseMoveRotate(event)

          break

        case STATE.DOLLY:
          if (scope.enableZoom === false) return

          handleMouseMoveDolly(event)

          break

        case STATE.PAN:
          if (scope.enablePan === false) return

          handleMouseMovePan(event)

          break
      }
    }

    function onMouseWheel(event) {
      if (
        scope.enabled === false ||
        scope.enableZoom === false ||
        state !== STATE.NONE
      )
        return

      event.preventDefault()

      scope.dispatchEvent(_startEvent)

      handleMouseWheel(event)

      scope.dispatchEvent(_endEvent)
    }

    function onKeyDown(event) {
      if (scope.enabled === false || scope.enablePan === false) return

      handleKeyDown(event)
    }

    function onTouchStart(event) {
      trackPointer(event)

      switch (pointers.length) {
        case 1:
          switch (scope.touches.ONE) {
            case TOUCH.ROTATE:
              if (scope.enableRotate === false) return

              handleTouchStartRotate()

              state = STATE.TOUCH_ROTATE

              break

            case TOUCH.PAN:
              if (scope.enablePan === false) return

              handleTouchStartPan()

              state = STATE.TOUCH_PAN

              break

            default:
              state = STATE.NONE
          }

          break

        case 2:
          switch (scope.touches.TWO) {
            case TOUCH.DOLLY_PAN:
              if (scope.enableZoom === false && scope.enablePan === false)
                return

              handleTouchStartDollyPan()

              state = STATE.TOUCH_DOLLY_PAN

              break

            case TOUCH.DOLLY_ROTATE:
              if (scope.enableZoom === false && scope.enableRotate === false)
                return

              handleTouchStartDollyRotate()

              state = STATE.TOUCH_DOLLY_ROTATE

              break

            default:
              state = STATE.NONE
          }

          break

        default:
          state = STATE.NONE
      }

      if (state !== STATE.NONE) {
        scope.dispatchEvent(_startEvent)
      }
    }

    function onTouchMove(event) {
      trackPointer(event)

      switch (state) {
        case STATE.TOUCH_ROTATE:
          if (scope.enableRotate === false) return

          handleTouchMoveRotate(event)

          scope.update()

          break

        case STATE.TOUCH_PAN:
          if (scope.enablePan === false) return

          handleTouchMovePan(event)

          scope.update()

          break

        case STATE.TOUCH_DOLLY_PAN:
          if (scope.enableZoom === false && scope.enablePan === false) return

          handleTouchMoveDollyPan(event)

          scope.update()

          break

        case STATE.TOUCH_DOLLY_ROTATE:
          if (scope.enableZoom === false && scope.enableRotate === false) return

          handleTouchMoveDollyRotate(event)

          scope.update()

          break

        default:
          state = STATE.NONE
      }
    }

    function onContextMenu(event) {
      if (scope.enabled === false) return

      event.preventDefault()
    }

    function addPointer(event) {
      pointers.push(event)
    }

    function removePointer(event) {
      delete pointerPositions[event.pointerId]

      for (let i = 0; i < pointers.length; i++) {
        if (pointers[i].pointerId == event.pointerId) {
          pointers.splice(i, 1)
          return
        }
      }
    }

    function trackPointer(event) {
      let position = pointerPositions[event.pointerId]

      if (position === undefined) {
        position = new Vector2()
        pointerPositions[event.pointerId] = position
      }

      position.set(event.pageX, event.pageY)
    }

    function getSecondPointerPosition(event) {
      const pointer =
        event.pointerId === pointers[0].pointerId ? pointers[1] : pointers[0]

      return pointerPositions[pointer.pointerId]
    }

    //

    scope.domElement.addEventListener('contextmenu', onContextMenu)

    scope.domElement.addEventListener('pointerdown', onPointerDown)
    scope.domElement.addEventListener('pointercancel', onPointerCancel)
    scope.domElement.addEventListener('wheel', onMouseWheel, {passive: false})

    // force an update at start

    this.update()
  }
}

// This set of controls performs orbiting, dollying (zooming), and panning.
// Unlike TrackballControls, it maintains the "up" direction object.up (+Y by default).
// This is very similar to OrbitControls, another set of touch behavior
//
//    Orbit - right mouse, or left mouse + ctrl/meta/shiftKey / touch: two-finger rotate
//    Zoom - middle mouse, or mousewheel / touch: two-finger spread or squish
//    Pan - left mouse, or arrow keys / touch: one-finger move

class MapControls extends OrbitControls {
  constructor(object, domElement) {
    super(object, domElement)

    this.screenSpacePanning = false // pan orthogonal to world-space direction camera.up

    this.mouseButtons.LEFT = MOUSE.PAN
    this.mouseButtons.RIGHT = MOUSE.ROTATE

    this.touches.ONE = TOUCH.PAN
    this.touches.TWO = TOUCH.DOLLY_ROTATE
  }
}

// RGBELoader

// https://github.com/mrdoob/three.js/issues/5552
// http://en.wikipedia.org/wiki/RGBE_image_format

class RGBELoader extends DataTextureLoader {
  constructor(manager) {
    super(manager)

    this.type = HalfFloatType
  }

  // adapted from http://www.graphics.cornell.edu/~bjw/rgbe.html

  parse(buffer) {
    const /* return codes for rgbe routines */
      //RGBE_RETURN_SUCCESS = 0,
      RGBE_RETURN_FAILURE = -1,
      /* default error routine.  change this to change error handling */
      rgbe_read_error = 1,
      rgbe_write_error = 2,
      rgbe_format_error = 3,
      rgbe_memory_error = 4,
      rgbe_error = function (rgbe_error_code, msg) {
        switch (rgbe_error_code) {
          case rgbe_read_error:
            console.error('THREE.RGBELoader Read Error: ' + (msg || ''))
            break
          case rgbe_write_error:
            console.error('THREE.RGBELoader Write Error: ' + (msg || ''))
            break
          case rgbe_format_error:
            console.error('THREE.RGBELoader Bad File Format: ' + (msg || ''))
            break
          default:
          case rgbe_memory_error:
            console.error('THREE.RGBELoader: Error: ' + (msg || ''))
        }

        return RGBE_RETURN_FAILURE
      },
      /* offsets to red, green, and blue components in a data (float) pixel */
      //RGBE_DATA_RED = 0,
      //RGBE_DATA_GREEN = 1,
      //RGBE_DATA_BLUE = 2,

      /* number of floats per pixel, use 4 since stored in rgba image format */
      //RGBE_DATA_SIZE = 4,

      /* flags indicating which fields in an rgbe_header_info are valid */
      RGBE_VALID_PROGRAMTYPE = 1,
      RGBE_VALID_FORMAT = 2,
      RGBE_VALID_DIMENSIONS = 4,
      NEWLINE = '\n',
      fgets = function (buffer, lineLimit, consume) {
        const chunkSize = 128

        lineLimit = !lineLimit ? 1024 : lineLimit
        let p = buffer.pos,
          i = -1,
          len = 0,
          s = '',
          chunk = String.fromCharCode.apply(
            null,
            new Uint16Array(buffer.subarray(p, p + chunkSize))
          )

        while (
          0 > (i = chunk.indexOf(NEWLINE)) &&
          len < lineLimit &&
          p < buffer.byteLength
        ) {
          s += chunk
          len += chunk.length
          p += chunkSize
          chunk += String.fromCharCode.apply(
            null,
            new Uint16Array(buffer.subarray(p, p + chunkSize))
          )
        }

        if (-1 < i) {
          /*for (i=l-1; i>=0; i--) {
            byteCode = m.charCodeAt(i);
            if (byteCode > 0x7f && byteCode <= 0x7ff) byteLen++;
            else if (byteCode > 0x7ff && byteCode <= 0xffff) byteLen += 2;
            if (byteCode >= 0xDC00 && byteCode <= 0xDFFF) i--; //trail surrogate
          }*/
          if (false !== consume) buffer.pos += len + i + 1
          return s + chunk.slice(0, i)
        }

        return false
      },
      /* minimal header reading.  modify if you want to parse more information */
      RGBE_ReadHeader = function (buffer) {
        // regexes to parse header info fields
        const magic_token_re = /^#\?(\S+)/,
          gamma_re = /^\s*GAMMA\s*=\s*(\d+(\.\d+)?)\s*$/,
          exposure_re = /^\s*EXPOSURE\s*=\s*(\d+(\.\d+)?)\s*$/,
          format_re = /^\s*FORMAT=(\S+)\s*$/,
          // eslint-disable-next-line no-useless-escape
          dimensions_re = /^\s*\-Y\s+(\d+)\s+\+X\s+(\d+)\s*$/,
          // RGBE format header struct
          header = {
            valid: 0 /* indicate which fields are valid */,

            string: '' /* the actual header string */,

            comments: '' /* comments found in header */,

            programtype:
              'RGBE' /* listed at beginning of file to identify it after "#?". defaults to "RGBE" */,

            format: '' /* RGBE format, default 32-bit_rle_rgbe */,

            gamma: 1.0 /* image has already been gamma corrected with given gamma. defaults to 1.0 (no correction) */,

            exposure: 1.0 /* a value of 1.0 in an image corresponds to <exposure> watts/steradian/m^2. defaults to 1.0 */,

            width: 0,
            height: 0 /* image dimensions, width/height */
          }

        let line, match

        if (buffer.pos >= buffer.byteLength || !(line = fgets(buffer))) {
          return rgbe_error(rgbe_read_error, 'no header found')
        }

        /* if you want to require the magic token then uncomment the next line */
        if (!(match = line.match(magic_token_re))) {
          return rgbe_error(rgbe_format_error, 'bad initial token')
        }

        header.valid |= RGBE_VALID_PROGRAMTYPE
        header.programtype = match[1]
        header.string += line + '\n'

        while (true) {
          line = fgets(buffer)
          if (false === line) break
          header.string += line + '\n'

          if ('#' === line.charAt(0)) {
            header.comments += line + '\n'
            continue // comment line
          }

          if ((match = line.match(gamma_re))) {
            header.gamma = parseFloat(match[1])
          }

          if ((match = line.match(exposure_re))) {
            header.exposure = parseFloat(match[1])
          }

          if ((match = line.match(format_re))) {
            header.valid |= RGBE_VALID_FORMAT
            header.format = match[1] //'32-bit_rle_rgbe';
          }

          if ((match = line.match(dimensions_re))) {
            header.valid |= RGBE_VALID_DIMENSIONS
            header.height = parseInt(match[1], 10)
            header.width = parseInt(match[2], 10)
          }

          if (
            header.valid & RGBE_VALID_FORMAT &&
            header.valid & RGBE_VALID_DIMENSIONS
          )
            break
        }

        if (!(header.valid & RGBE_VALID_FORMAT)) {
          return rgbe_error(rgbe_format_error, 'missing format specifier')
        }

        if (!(header.valid & RGBE_VALID_DIMENSIONS)) {
          return rgbe_error(rgbe_format_error, 'missing image size specifier')
        }

        return header
      },
      RGBE_ReadPixels_RLE = function (buffer, w, h) {
        const scanline_width = w

        if (
          // run length encoding is not allowed so read flat
          scanline_width < 8 ||
          scanline_width > 0x7fff ||
          // this file is not run length encoded
          2 !== buffer[0] ||
          2 !== buffer[1] ||
          buffer[2] & 0x80
        ) {
          // return the flat buffer
          return new Uint8Array(buffer)
        }

        if (scanline_width !== ((buffer[2] << 8) | buffer[3])) {
          return rgbe_error(rgbe_format_error, 'wrong scanline width')
        }

        const data_rgba = new Uint8Array(4 * w * h)

        if (!data_rgba.length) {
          return rgbe_error(
            rgbe_memory_error,
            'unable to allocate buffer space'
          )
        }

        let offset = 0,
          pos = 0

        const ptr_end = 4 * scanline_width
        const rgbeStart = new Uint8Array(4)
        const scanline_buffer = new Uint8Array(ptr_end)
        let num_scanlines = h

        // read in each successive scanline
        while (num_scanlines > 0 && pos < buffer.byteLength) {
          if (pos + 4 > buffer.byteLength) {
            return rgbe_error(rgbe_read_error)
          }

          rgbeStart[0] = buffer[pos++]
          rgbeStart[1] = buffer[pos++]
          rgbeStart[2] = buffer[pos++]
          rgbeStart[3] = buffer[pos++]

          if (
            2 != rgbeStart[0] ||
            2 != rgbeStart[1] ||
            ((rgbeStart[2] << 8) | rgbeStart[3]) != scanline_width
          ) {
            return rgbe_error(rgbe_format_error, 'bad rgbe scanline format')
          }

          // read each of the four channels for the scanline into the buffer
          // first red, then green, then blue, then exponent
          let ptr = 0,
            count

          while (ptr < ptr_end && pos < buffer.byteLength) {
            count = buffer[pos++]
            const isEncodedRun = count > 128
            if (isEncodedRun) count -= 128

            if (0 === count || ptr + count > ptr_end) {
              return rgbe_error(rgbe_format_error, 'bad scanline data')
            }

            if (isEncodedRun) {
              // a (encoded) run of the same value
              const byteValue = buffer[pos++]
              for (let i = 0; i < count; i++) {
                scanline_buffer[ptr++] = byteValue
              }
              //ptr += count;
            } else {
              // a literal-run
              scanline_buffer.set(buffer.subarray(pos, pos + count), ptr)
              ptr += count
              pos += count
            }
          }

          // now convert data from buffer into rgba
          // first red, then green, then blue, then exponent (alpha)
          const l = scanline_width //scanline_buffer.byteLength;
          for (let i = 0; i < l; i++) {
            let off = 0
            data_rgba[offset] = scanline_buffer[i + off]
            off += scanline_width //1;
            data_rgba[offset + 1] = scanline_buffer[i + off]
            off += scanline_width //1;
            data_rgba[offset + 2] = scanline_buffer[i + off]
            off += scanline_width //1;
            data_rgba[offset + 3] = scanline_buffer[i + off]
            offset += 4
          }

          num_scanlines--
        }

        return data_rgba
      }

    const RGBEByteToRGBFloat = function (
      sourceArray,
      sourceOffset,
      destArray,
      destOffset
    ) {
      const e = sourceArray[sourceOffset + 3]
      const scale = Math.pow(2.0, e - 128.0) / 255.0

      destArray[destOffset + 0] = sourceArray[sourceOffset + 0] * scale
      destArray[destOffset + 1] = sourceArray[sourceOffset + 1] * scale
      destArray[destOffset + 2] = sourceArray[sourceOffset + 2] * scale
      destArray[destOffset + 3] = 1
    }

    const RGBEByteToRGBHalf = function (
      sourceArray,
      sourceOffset,
      destArray,
      destOffset
    ) {
      const e = sourceArray[sourceOffset + 3]
      const scale = Math.pow(2.0, e - 128.0) / 255.0

      // clamping to 65504, the maximum representable value in float16
      destArray[destOffset + 0] = toHalfFloat(
        Math.min(sourceArray[sourceOffset + 0] * scale, 65504)
      )
      destArray[destOffset + 1] = toHalfFloat(
        Math.min(sourceArray[sourceOffset + 1] * scale, 65504)
      )
      destArray[destOffset + 2] = toHalfFloat(
        Math.min(sourceArray[sourceOffset + 2] * scale, 65504)
      )
      destArray[destOffset + 3] = toHalfFloat(1)
    }

    const byteArray = new Uint8Array(buffer)
    byteArray.pos = 0
    const rgbe_header_info = RGBE_ReadHeader(byteArray)

    if (RGBE_RETURN_FAILURE !== rgbe_header_info) {
      const w = rgbe_header_info.width,
        h = rgbe_header_info.height,
        image_rgba_data = RGBE_ReadPixels_RLE(
          byteArray.subarray(byteArray.pos),
          w,
          h
        )

      if (RGBE_RETURN_FAILURE !== image_rgba_data) {
        let data, format, type
        let numElements

        switch (this.type) {
          case FloatType:
            numElements = image_rgba_data.length / 4
            const floatArray = new Float32Array(numElements * 4)

            for (let j = 0; j < numElements; j++) {
              RGBEByteToRGBFloat(image_rgba_data, j * 4, floatArray, j * 4)
            }

            data = floatArray
            type = FloatType
            break

          case HalfFloatType:
            numElements = image_rgba_data.length / 4
            const halfArray = new Uint16Array(numElements * 4)

            for (let j = 0; j < numElements; j++) {
              RGBEByteToRGBHalf(image_rgba_data, j * 4, halfArray, j * 4)
            }

            data = halfArray
            type = HalfFloatType
            break

          default:
            console.error('THREE.RGBELoader: unsupported type: ', this.type)
            break
        }

        return {
          width: w,
          height: h,
          data: data,
          header: rgbe_header_info.string,
          gamma: rgbe_header_info.gamma,
          exposure: rgbe_header_info.exposure,
          format: format,
          type: type
        }
      }
    }

    return null
  }

  setDataType(value) {
    this.type = value
    return this
  }

  load(url, onLoad, onProgress, onError) {
    function onLoadCallback(texture, texData) {
      switch (texture.type) {
        case FloatType:
          texture.encoding = LinearEncoding
          texture.minFilter = LinearFilter
          texture.magFilter = LinearFilter
          texture.generateMipmaps = false
          texture.flipY = true
          break

        case HalfFloatType:
          texture.encoding = LinearEncoding
          texture.minFilter = LinearFilter
          texture.magFilter = LinearFilter
          texture.generateMipmaps = false
          texture.flipY = true
          break
      }

      if (onLoad) onLoad(texture, texData)
    }

    return super.load(url, onLoadCallback, onProgress, onError)
  }
}

//===============================================================================================================================================================================
// stats for performance

var Stats = function () {
  let mode = 0

  const container = document.createElement('div')
  container.style.cssText =
    'position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000'
  container.addEventListener(
    'click',
    function (event) {
      event.preventDefault()
      showPanel(++mode % container.children.length)
    },
    false
  )

  //

  function addPanel(panel) {
    container.appendChild(panel.dom)
    return panel
  }

  function showPanel(id) {
    for (let i = 0; i < container.children.length; i++) {
      container.children[i].style.display = i === id ? 'block' : 'none'
    }

    mode = id
  }

  //

  let beginTime = (performance || Date).now(),
    prevTime = beginTime,
    frames = 0

  const fpsPanel = addPanel(new Stats.Panel('FPS', '#0ff', '#002'))
  const msPanel = addPanel(new Stats.Panel('MS', '#0f0', '#020'))

  if (self.performance && self.performance.memory) {
    var memPanel = addPanel(new Stats.Panel('MB', '#f08', '#201'))
  }

  showPanel(0)

  return {
    REVISION: 16,

    dom: container,

    addPanel: addPanel,
    showPanel: showPanel,

    begin: function () {
      beginTime = (performance || Date).now()
    },

    end: function () {
      frames++

      const time = (performance || Date).now()

      msPanel.update(time - beginTime, 200)

      if (time >= prevTime + 1000) {
        fpsPanel.update((frames * 1000) / (time - prevTime), 100)

        prevTime = time
        frames = 0

        if (memPanel) {
          const memory = performance.memory
          memPanel.update(
            memory.usedJSHeapSize / 1048576,
            memory.jsHeapSizeLimit / 1048576
          )
        }
      }

      return time
    },

    update: function () {
      beginTime = this.end()
    },

    // Backwards Compatibility

    domElement: container,
    setMode: showPanel
  }
}

Stats.Panel = function (name, fg, bg) {
  let min = Infinity,
    max = 0,
    round = Math.round
  const PR = round(window.devicePixelRatio || 1)

  const WIDTH = 80 * PR,
    HEIGHT = 48 * PR,
    TEXT_X = 3 * PR,
    TEXT_Y = 2 * PR,
    GRAPH_X = 3 * PR,
    GRAPH_Y = 15 * PR,
    GRAPH_WIDTH = 74 * PR,
    GRAPH_HEIGHT = 30 * PR

  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT
  canvas.style.cssText = 'width:80px;height:48px'

  const context = canvas.getContext('2d')
  context.font = 'bold ' + 9 * PR + 'px Helvetica,Arial,sans-serif'
  context.textBaseline = 'top'

  context.fillStyle = bg
  context.fillRect(0, 0, WIDTH, HEIGHT)

  context.fillStyle = fg
  context.fillText(name, TEXT_X, TEXT_Y)
  context.fillRect(GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT)

  context.fillStyle = bg
  context.globalAlpha = 0.9
  context.fillRect(GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT)

  return {
    dom: canvas,

    update: function (value, maxValue) {
      min = Math.min(min, value)
      max = Math.max(max, value)

      context.fillStyle = bg
      context.globalAlpha = 1
      context.fillRect(0, 0, WIDTH, GRAPH_Y)
      context.fillStyle = fg
      context.fillText(
        round(value) + ' ' + name + ' (' + round(min) + '-' + round(max) + ')',
        TEXT_X,
        TEXT_Y
      )

      context.drawImage(
        canvas,
        GRAPH_X + PR,
        GRAPH_Y,
        GRAPH_WIDTH - PR,
        GRAPH_HEIGHT,
        GRAPH_X,
        GRAPH_Y,
        GRAPH_WIDTH - PR,
        GRAPH_HEIGHT
      )

      context.fillRect(GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, GRAPH_HEIGHT)

      context.fillStyle = bg
      context.globalAlpha = 0.9
      context.fillRect(
        GRAPH_X + GRAPH_WIDTH - PR,
        GRAPH_Y,
        PR,
        round((1 - value / maxValue) * GRAPH_HEIGHT)
      )
    }
  }
}

//===============================================================================================================================================================================
// BufferGeometryUtils

function computeTangents() {
  throw new Error(
    'BufferGeometryUtils: computeTangents renamed to computeMikkTSpaceTangents.'
  )
}

function computeMikkTSpaceTangents(geometry, MikkTSpace, negateSign = true) {
  if (!MikkTSpace || !MikkTSpace.isReady) {
    throw new Error(
      'BufferGeometryUtils: Initialized MikkTSpace library required.'
    )
  }

  if (
    !geometry.hasAttribute('position') ||
    !geometry.hasAttribute('normal') ||
    !geometry.hasAttribute('uv')
  ) {
    throw new Error(
      'BufferGeometryUtils: Tangents require "position", "normal", and "uv" attributes.'
    )
  }

  function getAttributeArray(attribute) {
    if (attribute.normalized || attribute.isInterleavedBufferAttribute) {
      const srcArray = attribute.isInterleavedBufferAttribute
        ? attribute.data.array
        : attribute.array
      const dstArray = new Float32Array(
        attribute.getCount() * attribute.itemSize
      )

      for (let i = 0, j = 0; i < attribute.getCount(); i++) {
        dstArray[j++] = MathUtils.denormalize(attribute.getX(i), srcArray)
        dstArray[j++] = MathUtils.denormalize(attribute.getY(i), srcArray)

        if (attribute.itemSize > 2) {
          dstArray[j++] = MathUtils.denormalize(attribute.getZ(i), srcArray)
        }
      }

      return dstArray
    }

    if (attribute.array instanceof Float32Array) {
      return attribute.array
    }

    return new Float32Array(attribute.array)
  }

  // MikkTSpace algorithm requires non-indexed input.

  const _geometry = geometry.index ? geometry.toNonIndexed() : geometry

  // Compute vertex tangents.

  const tangents = MikkTSpace.generateTangents(
    getAttributeArray(_geometry.attributes.position),
    getAttributeArray(_geometry.attributes.normal),
    getAttributeArray(_geometry.attributes.uv)
  )

  // Texture coordinate convention of glTF differs from the apparent
  // default of the MikkTSpace library; .w component must be flipped.

  if (negateSign) {
    for (let i = 3; i < tangents.length; i += 4) {
      tangents[i] *= -1
    }
  }

  //

  _geometry.setAttribute('tangent', new BufferAttribute(tangents, 4))

  if (geometry !== _geometry) {
    geometry.copy(_geometry)
  }

  return geometry
}

/**
 * @param  {Array<BufferGeometry>} geometries
 * @param  {Boolean} useGroups
 * @return {BufferGeometry}
 */
function mergeBufferGeometries(geometries, useGroups = false) {
  const isIndexed = geometries[0].index !== null

  const attributesUsed = new Set(Object.keys(geometries[0].attributes))
  const morphAttributesUsed = new Set(
    Object.keys(geometries[0].morphAttributes)
  )

  const attributes = {}
  const morphAttributes = {}

  const morphTargetsRelative = geometries[0].morphTargetsRelative

  const mergedGeometry = new BufferGeometry()

  let offset = 0

  for (let i = 0; i < geometries.length; ++i) {
    const geometry = geometries[i]
    let attributesCount = 0

    // ensure that all geometries are indexed, or none

    if (isIndexed !== (geometry.index !== null)) {
      console.error(
        'THREE.BufferGeometryUtils: .mergeBufferGeometries() failed with geometry at index ' +
          i +
          '. All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them.'
      )
      return null
    }

    // gather attributes, exit early if they're different

    for (const name in geometry.attributes) {
      if (!attributesUsed.has(name)) {
        console.error(
          'THREE.BufferGeometryUtils: .mergeBufferGeometries() failed with geometry at index ' +
            i +
            '. All geometries must have compatible attributes; make sure "' +
            name +
            '" attribute exists among all geometries, or in none of them.'
        )
        return null
      }

      if (attributes[name] === undefined) attributes[name] = []

      attributes[name].push(geometry.attributes[name])

      attributesCount++
    }

    // ensure geometries have the same number of attributes

    if (attributesCount !== attributesUsed.size) {
      console.error(
        'THREE.BufferGeometryUtils: .mergeBufferGeometries() failed with geometry at index ' +
          i +
          '. Make sure all geometries have the same number of attributes.'
      )
      return null
    }

    // gather morph attributes, exit early if they're different

    if (morphTargetsRelative !== geometry.morphTargetsRelative) {
      console.error(
        'THREE.BufferGeometryUtils: .mergeBufferGeometries() failed with geometry at index ' +
          i +
          '. .morphTargetsRelative must be consistent throughout all geometries.'
      )
      return null
    }

    for (const name in geometry.morphAttributes) {
      if (!morphAttributesUsed.has(name)) {
        console.error(
          'THREE.BufferGeometryUtils: .mergeBufferGeometries() failed with geometry at index ' +
            i +
            '.  .morphAttributes must be consistent throughout all geometries.'
        )
        return null
      }

      if (morphAttributes[name] === undefined) morphAttributes[name] = []

      morphAttributes[name].push(geometry.morphAttributes[name])
    }

    // gather .userData

    mergedGeometry.userData.mergedUserData =
      mergedGeometry.userData.mergedUserData || []
    mergedGeometry.userData.mergedUserData.push(geometry.userData)

    if (useGroups) {
      let count

      if (isIndexed) {
        count = geometry.index.count
      } else if (geometry.attributes.position !== undefined) {
        count = geometry.attributes.position.count
      } else {
        console.error(
          'THREE.BufferGeometryUtils: .mergeBufferGeometries() failed with geometry at index ' +
            i +
            '. The geometry must have either an index or a position attribute'
        )
        return null
      }

      mergedGeometry.addGroup(offset, count, i)

      offset += count
    }
  }

  // merge indices

  if (isIndexed) {
    let indexOffset = 0
    const mergedIndex = []

    for (let i = 0; i < geometries.length; ++i) {
      const index = geometries[i].index

      for (let j = 0; j < index.count; ++j) {
        mergedIndex.push(index.getX(j) + indexOffset)
      }

      indexOffset += geometries[i].attributes.position.count
    }

    mergedGeometry.setIndex(mergedIndex)
  }

  // merge attributes

  for (const name in attributes) {
    const mergedAttribute = mergeBufferAttributes(attributes[name])

    if (!mergedAttribute) {
      console.error(
        'THREE.BufferGeometryUtils: .mergeBufferGeometries() failed while trying to merge the ' +
          name +
          ' attribute.'
      )
      return null
    }

    mergedGeometry.setAttribute(name, mergedAttribute)
  }

  // merge morph attributes

  for (const name in morphAttributes) {
    const numMorphTargets = morphAttributes[name][0].length

    if (numMorphTargets === 0) break

    mergedGeometry.morphAttributes = mergedGeometry.morphAttributes || {}
    mergedGeometry.morphAttributes[name] = []

    for (let i = 0; i < numMorphTargets; ++i) {
      const morphAttributesToMerge = []

      for (let j = 0; j < morphAttributes[name].length; ++j) {
        morphAttributesToMerge.push(morphAttributes[name][j][i])
      }

      const mergedMorphAttribute = mergeBufferAttributes(morphAttributesToMerge)

      if (!mergedMorphAttribute) {
        console.error(
          'THREE.BufferGeometryUtils: .mergeBufferGeometries() failed while trying to merge the ' +
            name +
            ' morphAttribute.'
        )
        return null
      }

      mergedGeometry.morphAttributes[name].push(mergedMorphAttribute)
    }
  }

  return mergedGeometry
}

/**
 * @param {Array<BufferAttribute>} attributes
 * @return {BufferAttribute}
 */
function mergeBufferAttributes(attributes) {
  let TypedArray
  let itemSize
  let normalized
  let arrayLength = 0

  for (let i = 0; i < attributes.length; ++i) {
    const attribute = attributes[i]

    if (attribute.isInterleavedBufferAttribute) {
      console.error(
        'THREE.BufferGeometryUtils: .mergeBufferAttributes() failed. InterleavedBufferAttributes are not supported.'
      )
      return null
    }

    if (TypedArray === undefined) TypedArray = attribute.array.constructor
    if (TypedArray !== attribute.array.constructor) {
      console.error(
        'THREE.BufferGeometryUtils: .mergeBufferAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes.'
      )
      return null
    }

    if (itemSize === undefined) itemSize = attribute.itemSize
    if (itemSize !== attribute.itemSize) {
      console.error(
        'THREE.BufferGeometryUtils: .mergeBufferAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes.'
      )
      return null
    }

    if (normalized === undefined) normalized = attribute.normalized
    if (normalized !== attribute.normalized) {
      console.error(
        'THREE.BufferGeometryUtils: .mergeBufferAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes.'
      )
      return null
    }

    arrayLength += attribute.array.length
  }

  const array = new TypedArray(arrayLength)
  let offset = 0

  for (let i = 0; i < attributes.length; ++i) {
    array.set(attributes[i].array, offset)

    offset += attributes[i].array.length
  }

  return new BufferAttribute(array, itemSize, normalized)
}

/**
 * @param {Array<BufferAttribute>} attributes
 * @return {Array<InterleavedBufferAttribute>}
 */
function interleaveAttributes(attributes) {
  // Interleaves the provided attributes into an InterleavedBuffer and returns
  // a set of InterleavedBufferAttributes for each attribute
  let TypedArray
  let arrayLength = 0
  let stride = 0

  // calculate the the length and type of the interleavedBuffer
  for (let i = 0, l = attributes.length; i < l; ++i) {
    const attribute = attributes[i]

    if (TypedArray === undefined) TypedArray = attribute.array.constructor
    if (TypedArray !== attribute.array.constructor) {
      console.error('AttributeBuffers of different types cannot be interleaved')
      return null
    }

    arrayLength += attribute.array.length
    stride += attribute.itemSize
  }

  // Create the set of buffer attributes
  const interleavedBuffer = new InterleavedBuffer(
    new TypedArray(arrayLength),
    stride
  )
  let offset = 0
  const res = []
  const getters = ['getX', 'getY', 'getZ', 'getW']
  const setters = ['setX', 'setY', 'setZ', 'setW']

  for (let j = 0, l = attributes.length; j < l; j++) {
    const attribute = attributes[j]
    const itemSize = attribute.itemSize
    const count = attribute.count
    const iba = new InterleavedBufferAttribute(
      interleavedBuffer,
      itemSize,
      offset,
      attribute.normalized
    )
    res.push(iba)

    offset += itemSize

    // Move the data for each attribute into the new interleavedBuffer
    // at the appropriate offset
    for (let c = 0; c < count; c++) {
      for (let k = 0; k < itemSize; k++) {
        iba[setters[k]](c, attribute[getters[k]](c))
      }
    }
  }

  return res
}

// returns a new, non-interleaved version of the provided attribute
export function deinterleaveAttribute(attribute) {
  const cons = attribute.data.array.constructor
  const count = attribute.count
  const itemSize = attribute.itemSize
  const normalized = attribute.normalized

  const array = new cons(count * itemSize)
  let newAttribute
  if (attribute.isInstancedInterleavedBufferAttribute) {
    newAttribute = new InstancedBufferAttribute(
      array,
      itemSize,
      normalized,
      attribute.meshPerAttribute
    )
  } else {
    newAttribute = new BufferAttribute(array, itemSize, normalized)
  }

  for (let i = 0; i < count; i++) {
    newAttribute.setX(i, attribute.getX(i))

    if (itemSize >= 2) {
      newAttribute.setY(i, attribute.getY(i))
    }

    if (itemSize >= 3) {
      newAttribute.setZ(i, attribute.getZ(i))
    }

    if (itemSize >= 4) {
      newAttribute.setW(i, attribute.getW(i))
    }
  }

  return newAttribute
}

// deinterleaves all attributes on the geometry
export function deinterleaveGeometry(geometry) {
  const attributes = geometry.attributes
  const morphTargets = geometry.morphTargets
  const attrMap = new Map()

  for (const key in attributes) {
    const attr = attributes[key]
    if (attr.isInterleavedBufferAttribute) {
      if (!attrMap.has(attr)) {
        attrMap.set(attr, deinterleaveAttribute(attr))
      }

      attributes[key] = attrMap.get(attr)
    }
  }

  for (const key in morphTargets) {
    const attr = morphTargets[key]
    if (attr.isInterleavedBufferAttribute) {
      if (!attrMap.has(attr)) {
        attrMap.set(attr, deinterleaveAttribute(attr))
      }

      morphTargets[key] = attrMap.get(attr)
    }
  }
}

/**
 * @param {Array<BufferGeometry>} geometry
 * @return {number}
 */
function estimateBytesUsed(geometry) {
  // Return the estimated memory used by this geometry in bytes
  // Calculate using itemSize, count, and BYTES_PER_ELEMENT to account
  // for InterleavedBufferAttributes.
  let mem = 0
  for (const name in geometry.attributes) {
    const attr = geometry.getAttribute(name)
    mem += attr.count * attr.itemSize * attr.array.BYTES_PER_ELEMENT
  }

  const indices = geometry.getIndex()
  mem += indices
    ? indices.count * indices.itemSize * indices.array.BYTES_PER_ELEMENT
    : 0
  return mem
}

/**
 * @param {BufferGeometry} geometry
 * @param {number} tolerance
 * @return {BufferGeometry>}
 */
function mergeVertices(geometry, tolerance = 1e-4) {
  tolerance = Math.max(tolerance, Number.EPSILON)

  // Generate an index buffer if the geometry doesn't have one, or optimize it
  // if it's already available.
  const hashToIndex = {}
  const indices = geometry.getIndex()
  const positions = geometry.getAttribute('position')
  const vertexCount = indices ? indices.count : positions.count

  // next value for triangle indices
  let nextIndex = 0

  // attributes and new attribute arrays
  const attributeNames = Object.keys(geometry.attributes)
  const attrArrays = {}
  const morphAttrsArrays = {}
  const newIndices = []
  const getters = ['getX', 'getY', 'getZ', 'getW']

  // initialize the arrays
  for (let i = 0, l = attributeNames.length; i < l; i++) {
    const name = attributeNames[i]

    attrArrays[name] = []

    const morphAttr = geometry.morphAttributes[name]
    if (morphAttr) {
      morphAttrsArrays[name] = new Array(morphAttr.length).fill().map(() => [])
    }
  }

  // convert the error tolerance to an amount of decimal places to truncate to
  const decimalShift = Math.log10(1 / tolerance)
  const shiftMultiplier = Math.pow(10, decimalShift)
  for (let i = 0; i < vertexCount; i++) {
    const index = indices ? indices.getX(i) : i

    // Generate a hash for the vertex attributes at the current index 'i'
    let hash = ''
    for (let j = 0, l = attributeNames.length; j < l; j++) {
      const name = attributeNames[j]
      const attribute = geometry.getAttribute(name)
      const itemSize = attribute.itemSize

      for (let k = 0; k < itemSize; k++) {
        // double tilde truncates the decimal value
        hash += `${~~(attribute[getters[k]](index) * shiftMultiplier)},`
      }
    }

    // Add another reference to the vertex if it's already
    // used by another index
    if (hash in hashToIndex) {
      newIndices.push(hashToIndex[hash])
    } else {
      // copy data to the new index in the attribute arrays
      for (let j = 0, l = attributeNames.length; j < l; j++) {
        const name = attributeNames[j]
        const attribute = geometry.getAttribute(name)
        const morphAttr = geometry.morphAttributes[name]
        const itemSize = attribute.itemSize
        const newarray = attrArrays[name]
        const newMorphArrays = morphAttrsArrays[name]

        for (let k = 0; k < itemSize; k++) {
          const getterFunc = getters[k]
          newarray.push(attribute[getterFunc](index))

          if (morphAttr) {
            for (let m = 0, ml = morphAttr.length; m < ml; m++) {
              newMorphArrays[m].push(morphAttr[m][getterFunc](index))
            }
          }
        }
      }

      hashToIndex[hash] = nextIndex
      newIndices.push(nextIndex)
      nextIndex++
    }
  }

  // Generate typed arrays from new attribute arrays and update
  // the attributeBuffers
  const result = geometry.clone()
  for (let i = 0, l = attributeNames.length; i < l; i++) {
    const name = attributeNames[i]
    const oldAttribute = geometry.getAttribute(name)

    const buffer = new oldAttribute.array.constructor(attrArrays[name])
    const attribute = new BufferAttribute(
      buffer,
      oldAttribute.itemSize,
      oldAttribute.normalized
    )

    result.setAttribute(name, attribute)

    // Update the attribute arrays
    if (name in morphAttrsArrays) {
      for (let j = 0; j < morphAttrsArrays[name].length; j++) {
        const oldMorphAttribute = geometry.morphAttributes[name][j]

        const buffer = new oldMorphAttribute.array.constructor(
          morphAttrsArrays[name][j]
        )
        const morphAttribute = new BufferAttribute(
          buffer,
          oldMorphAttribute.itemSize,
          oldMorphAttribute.normalized
        )
        result.morphAttributes[name][j] = morphAttribute
      }
    }
  }

  // indices

  result.setIndex(newIndices)

  return result
}

// /**
//  * @param {BufferGeometry} geometry
//  * @param {number} drawMode
//  * @return {BufferGeometry>}
//  */
// function toTrianglesDrawMode(geometry, drawMode) {
//   if (drawMode === TrianglesDrawMode) {
//     console.warn(
//       'THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles.',
//     )
//     return geometry
//   }

//   if (drawMode === TriangleFanDrawMode || drawMode === TriangleStripDrawMode) {
//     let index = geometry.getIndex()

//     // generate index if not present

//     if (index === null) {
//       const indices = []

//       const position = geometry.getAttribute('position')

//       if (position !== undefined) {
//         for (let i = 0; i < position.count; i++) {
//           indices.push(i)
//         }

//         geometry.setIndex(indices)
//         index = geometry.getIndex()
//       } else {
//         console.error(
//           'THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible.',
//         )
//         return geometry
//       }
//     }

//     //

//     const numberOfTriangles = index.count - 2
//     const newIndices = []

//     if (drawMode === TriangleFanDrawMode) {
//       // gl.TRIANGLE_FAN

//       for (let i = 1; i <= numberOfTriangles; i++) {
//         newIndices.push(index.getX(0))
//         newIndices.push(index.getX(i))
//         newIndices.push(index.getX(i + 1))
//       }
//     } else {
//       // gl.TRIANGLE_STRIP

//       for (let i = 0; i < numberOfTriangles; i++) {
//         if (i % 2 === 0) {
//           newIndices.push(index.getX(i))
//           newIndices.push(index.getX(i + 1))
//           newIndices.push(index.getX(i + 2))
//         } else {
//           newIndices.push(index.getX(i + 2))
//           newIndices.push(index.getX(i + 1))
//           newIndices.push(index.getX(i))
//         }
//       }
//     }

//     if (newIndices.length / 3 !== numberOfTriangles) {
//       console.error(
//         'THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.',
//       )
//     }

//     // build final geometry

//     const newGeometry = geometry.clone()
//     newGeometry.setIndex(newIndices)
//     newGeometry.clearGroups()

//     return newGeometry
//   } else {
//     console.error('THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:', drawMode)
//     return geometry
//   }
// }

/**
 * Calculates the morphed attributes of a morphed/skinned BufferGeometry.
 * Helpful for Raytracing or Decals.
 * @param {Mesh | Line | Points} object An instance of Mesh, Line or Points.
 * @return {Object} An Object with original position/normal attributes and morphed ones.
 */
function computeMorphedAttributes(object) {
  if (object.geometry.isBufferGeometry !== true) {
    console.error(
      'THREE.BufferGeometryUtils: Geometry is not of type BufferGeometry.'
    )
    return null
  }

  const _vA = new Vector3()
  const _vB = new Vector3()
  const _vC = new Vector3()

  const _tempA = new Vector3()
  const _tempB = new Vector3()
  const _tempC = new Vector3()

  const _morphA = new Vector3()
  const _morphB = new Vector3()
  const _morphC = new Vector3()

  function _calculateMorphedAttributeData(
    object,
    attribute,
    morphAttribute,
    morphTargetsRelative,
    a,
    b,
    c,
    modifiedAttributeArray
  ) {
    _vA.fromBufferAttribute(attribute, a)
    _vB.fromBufferAttribute(attribute, b)
    _vC.fromBufferAttribute(attribute, c)

    const morphInfluences = object.morphTargetInfluences

    if (morphAttribute && morphInfluences) {
      _morphA.set(0, 0, 0)
      _morphB.set(0, 0, 0)
      _morphC.set(0, 0, 0)

      for (let i = 0, il = morphAttribute.length; i < il; i++) {
        const influence = morphInfluences[i]
        const morph = morphAttribute[i]

        if (influence === 0) continue

        _tempA.fromBufferAttribute(morph, a)
        _tempB.fromBufferAttribute(morph, b)
        _tempC.fromBufferAttribute(morph, c)

        if (morphTargetsRelative) {
          _morphA.addScaledVector(_tempA, influence)
          _morphB.addScaledVector(_tempB, influence)
          _morphC.addScaledVector(_tempC, influence)
        } else {
          _morphA.addScaledVector(_tempA.sub(_vA), influence)
          _morphB.addScaledVector(_tempB.sub(_vB), influence)
          _morphC.addScaledVector(_tempC.sub(_vC), influence)
        }
      }

      _vA.add(_morphA)
      _vB.add(_morphB)
      _vC.add(_morphC)
    }

    if (object.isSkinnedMesh) {
      object.boneTransform(a, _vA)
      object.boneTransform(b, _vB)
      object.boneTransform(c, _vC)
    }

    modifiedAttributeArray[a * 3 + 0] = _vA.x
    modifiedAttributeArray[a * 3 + 1] = _vA.y
    modifiedAttributeArray[a * 3 + 2] = _vA.z
    modifiedAttributeArray[b * 3 + 0] = _vB.x
    modifiedAttributeArray[b * 3 + 1] = _vB.y
    modifiedAttributeArray[b * 3 + 2] = _vB.z
    modifiedAttributeArray[c * 3 + 0] = _vC.x
    modifiedAttributeArray[c * 3 + 1] = _vC.y
    modifiedAttributeArray[c * 3 + 2] = _vC.z
  }

  const geometry = object.geometry
  const material = object.material

  let a, b, c
  const index = geometry.index
  const positionAttribute = geometry.attributes.position
  const morphPosition = geometry.morphAttributes.position
  const morphTargetsRelative = geometry.morphTargetsRelative
  const normalAttribute = geometry.attributes.normal
  const morphNormal = geometry.morphAttributes.position

  const groups = geometry.groups
  const drawRange = geometry.drawRange
  let i, j, il, jl
  let group
  let start, end

  const modifiedPosition = new Float32Array(
    positionAttribute.count * positionAttribute.itemSize
  )
  const modifiedNormal = new Float32Array(
    normalAttribute.count * normalAttribute.itemSize
  )

  if (index !== null) {
    // indexed buffer geometry

    if (Array.isArray(material)) {
      for (i = 0, il = groups.length; i < il; i++) {
        group = groups[i]

        start = Math.max(group.start, drawRange.start)
        end = Math.min(
          group.start + group.count,
          drawRange.start + drawRange.count
        )

        for (j = start, jl = end; j < jl; j += 3) {
          a = index.getX(j)
          b = index.getX(j + 1)
          c = index.getX(j + 2)

          _calculateMorphedAttributeData(
            object,
            positionAttribute,
            morphPosition,
            morphTargetsRelative,
            a,
            b,
            c,
            modifiedPosition
          )

          _calculateMorphedAttributeData(
            object,
            normalAttribute,
            morphNormal,
            morphTargetsRelative,
            a,
            b,
            c,
            modifiedNormal
          )
        }
      }
    } else {
      start = Math.max(0, drawRange.start)
      end = Math.min(index.count, drawRange.start + drawRange.count)

      for (i = start, il = end; i < il; i += 3) {
        a = index.getX(i)
        b = index.getX(i + 1)
        c = index.getX(i + 2)

        _calculateMorphedAttributeData(
          object,
          positionAttribute,
          morphPosition,
          morphTargetsRelative,
          a,
          b,
          c,
          modifiedPosition
        )

        _calculateMorphedAttributeData(
          object,
          normalAttribute,
          morphNormal,
          morphTargetsRelative,
          a,
          b,
          c,
          modifiedNormal
        )
      }
    }
  } else {
    // non-indexed buffer geometry

    if (Array.isArray(material)) {
      for (i = 0, il = groups.length; i < il; i++) {
        group = groups[i]

        start = Math.max(group.start, drawRange.start)
        end = Math.min(
          group.start + group.count,
          drawRange.start + drawRange.count
        )

        for (j = start, jl = end; j < jl; j += 3) {
          a = j
          b = j + 1
          c = j + 2

          _calculateMorphedAttributeData(
            object,
            positionAttribute,
            morphPosition,
            morphTargetsRelative,
            a,
            b,
            c,
            modifiedPosition
          )

          _calculateMorphedAttributeData(
            object,
            normalAttribute,
            morphNormal,
            morphTargetsRelative,
            a,
            b,
            c,
            modifiedNormal
          )
        }
      }
    } else {
      start = Math.max(0, drawRange.start)
      end = Math.min(positionAttribute.count, drawRange.start + drawRange.count)

      for (i = start, il = end; i < il; i += 3) {
        a = i
        b = i + 1
        c = i + 2

        _calculateMorphedAttributeData(
          object,
          positionAttribute,
          morphPosition,
          morphTargetsRelative,
          a,
          b,
          c,
          modifiedPosition
        )

        _calculateMorphedAttributeData(
          object,
          normalAttribute,
          morphNormal,
          morphTargetsRelative,
          a,
          b,
          c,
          modifiedNormal
        )
      }
    }
  }

  const morphedPositionAttribute = new Float32BufferAttribute(
    modifiedPosition,
    3
  )
  const morphedNormalAttribute = new Float32BufferAttribute(modifiedNormal, 3)

  return {
    positionAttribute: positionAttribute,
    normalAttribute: normalAttribute,
    morphedPositionAttribute: morphedPositionAttribute,
    morphedNormalAttribute: morphedNormalAttribute
  }
}

function mergeGroups(geometry) {
  if (geometry.groups.length === 0) {
    console.warn(
      'THREE.BufferGeometryUtils.mergeGroups(): No groups are defined. Nothing to merge.'
    )
    return geometry
  }

  let groups = geometry.groups

  // sort groups by material index

  groups = groups.sort((a, b) => {
    if (a.materialIndex !== b.materialIndex)
      return a.materialIndex - b.materialIndex

    return a.start - b.start
  })

  // create index for non-indexed geometries

  if (geometry.getIndex() === null) {
    const positionAttribute = geometry.getAttribute('position')
    const indices = []

    for (let i = 0; i < positionAttribute.count; i += 3) {
      indices.push(i, i + 1, i + 2)
    }

    geometry.setIndex(indices)
  }

  // sort index

  const index = geometry.getIndex()

  const newIndices = []

  for (let i = 0; i < groups.length; i++) {
    const group = groups[i]

    const groupStart = group.start
    const groupLength = groupStart + group.count

    for (let j = groupStart; j < groupLength; j++) {
      newIndices.push(index.getX(j))
    }
  }

  geometry.dispose() // Required to force buffer recreation
  geometry.setIndex(newIndices)

  // update groups indices

  let start = 0

  for (let i = 0; i < groups.length; i++) {
    const group = groups[i]

    group.start = start
    start += group.count
  }

  // merge groups

  let currentGroup = groups[0]

  geometry.groups = [currentGroup]

  for (let i = 1; i < groups.length; i++) {
    const group = groups[i]

    if (currentGroup.materialIndex === group.materialIndex) {
      currentGroup.count += group.count
    } else {
      currentGroup = group
      geometry.groups.push(currentGroup)
    }
  }

  return geometry
}
const BufferGeometryUtils = {
  computeTangents,
  computeMikkTSpaceTangents,
  mergeBufferGeometries,
  mergeBufferAttributes,
  interleaveAttributes,
  estimateBytesUsed,
  mergeVertices,
  toTrianglesDrawMode,
  computeMorphedAttributes,
  mergeGroups
}

//===============================================================================================================================================================================
// export all
export {
  BufferGeometryUtils,
  DefaultLoadingManager,
  DRACOLoader,
  DragControls,
  EquirectangularReflectionMapping,
  GLTFExporter,
  GLTFLoader,
  KTX2Loader,
  MapControls,
  OrbitControls,
  RGBELoader,
  Stats,
  TrackballControls,
  TransformControls,
  TransformControlsGizmo,
  TransformControlsPlane,
  WEBGL
}
