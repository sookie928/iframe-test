/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-useless-escape */
/* eslint-disable prefer-const */
/* eslint-disable no-var */
// @ts-nocheck
import {ImageLoader} from './ImageLoader'
import {Loader} from './Loader'
import {Texture} from './Texture'

class TextureLoader extends Loader {
  constructor(manager) {
    super(manager)
  }

  load(url, onLoad, onProgress, onError) {
    const texture = new Texture()

    const loader = new ImageLoader(this.manager)
    loader.setCrossOrigin(this.crossOrigin)
    loader.setPath(this.path)
    loader.setAbortSignal(this.abortSignal)

    loader.load(
      url,
      function (image) {
        texture.image = image
        texture.needsUpdate = true

        if (onLoad !== undefined) {
          onLoad(texture)
        }
      },
      onProgress,
      onError
    )

    return texture
  }
}

export {TextureLoader}
