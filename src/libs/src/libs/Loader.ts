/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-useless-escape */
/* eslint-disable prefer-const */
/* eslint-disable no-var */
// @ts-nocheck
import {DefaultLoadingManager} from './LoadingManager'

class Loader {
  constructor(manager) {
    this.manager = manager !== undefined ? manager : DefaultLoadingManager

    this.crossOrigin = 'anonymous'
    this.withCredentials = false
    this.path = ''
    this.resourcePath = ''
    this.requestHeader = {}
    this.abortSignal = null
  }

  load(/* url, onLoad, onProgress, onError */) {
    //
  }

  loadAsync(url, onProgress) {
    const scope = this
    return new Promise(function (resolve, reject) {
      scope.load(url, resolve, onProgress, reject)
    })
  }

  parse(/* data */) {
    //
  }

  setCrossOrigin(crossOrigin) {
    this.crossOrigin = crossOrigin
    return this
  }

  setWithCredentials(value) {
    this.withCredentials = value
    return this
  }

  setPath(path) {
    this.path = path
    return this
  }

  setResourcePath(resourcePath) {
    this.resourcePath = resourcePath
    return this
  }

  setRequestHeader(requestHeader) {
    this.requestHeader = requestHeader
    return this
  }
  setAbortSignal(abortSignal) {
    this.abortSignal = abortSignal
    return this
  }
}

export {Loader}
