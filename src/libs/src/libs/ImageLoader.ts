/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-useless-escape */
/* eslint-disable prefer-const */
/* eslint-disable no-var */
// @ts-nocheck
import {Cache} from 'three'

import {Loader} from './Loader'
import {createElementNS} from './utils'

class ImageLoader extends Loader {
  constructor(manager) {
    super(manager)
  }

  load(url, onLoad, onProgress, onError) {
    if (this.path !== undefined) url = this.path + url

    url = this.manager.resolveURL(url)

    const scope = this || self

    const cached = Cache.get(url)

    if (cached !== undefined) {
      scope.manager.itemStart(url)

      setTimeout(function () {
        if (onLoad) onLoad(cached)

        scope.manager.itemEnd(url)
      }, 0)

      return cached
    }

    const image = createElementNS('img')

    function onImageLoad() {
      removeEventListeners()

      Cache.add(url, this)

      if (onLoad) onLoad(this)

      scope.manager.itemEnd(url)
    }

    function onImageError(event) {
      removeEventListeners()

      if (onError) {
        if (this.abortSignal && this.abortSignal.aborted) {
          // Simulate an error similar to the DOMException thrown by the Fetch API
          // (DOMException is not instanciable)
          const e = new Error()
          e.name = 'AbortError'
          e.message = 'The operation was aborted.'
          onError(e)
        } else {
          onError(event)
        }
      }

      scope.manager.itemError(url)
      scope.manager.itemEnd(url)
    }

    function onAbortSignal() {
      image.src = ''
    }

    function removeEventListeners() {
      image.removeEventListener('load', onImageLoad, false)
      image.removeEventListener('error', onImageError, false)

      if (scope.abortSignal) {
        scope.abortSignal.removeEventListener('abort', onAbortSignal, false)
      }
    }

    image.addEventListener('load', onImageLoad, false)
    image.addEventListener('error', onImageError, false)

    if (scope.abortSignal) {
      scope.abortSignal.addEventListener('abort', onAbortSignal, false)
    }

    if (url.slice(0, 5) !== 'data:') {
      if (this.crossOrigin !== undefined) image.crossOrigin = this.crossOrigin
    }

    scope.manager.itemStart(url)

    image.src = url

    return image
  }
}

export {ImageLoader}
