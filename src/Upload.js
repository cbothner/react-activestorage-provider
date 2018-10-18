/**
 * Perform the direct upload of a single file.
 *
 * @providesModule Upload
 * @flow
 */

import * as ActiveStorage from 'activestorage'

import type { ActiveStorageFileUpload, Origin } from './types'

const CONVENTIONAL_DIRECT_UPLOADS_PATH = '/rails/active_storage/direct_uploads'

type Options = {|
  origin?: Origin,
  directUploadsPath?: string,
  onBeforeBlobRequest?: ({
    id: string,
    file: File,
    xhr: XMLHttpRequest,
  }) => mixed,
  onBeforeStorageRequest?: ({
    id: string,
    file: File,
    xhr: XMLHttpRequest,
  }) => mixed,
  onChangeFile: ({ [string]: ActiveStorageFileUpload }) => mixed,
|}

class Upload {
  static defaultOptions = {
    origin: {},
    directUploadsPath: CONVENTIONAL_DIRECT_UPLOADS_PATH,
  }

  directUpload: ActiveStorage.DirectUpload
  options: { ...Options, ...typeof Upload.defaultOptions }

  get id(): string {
    return `${this.directUpload.id}`
  }

  get directUploadsUrl(): string {
    const {
      origin: { host, protocol, port },
      directUploadsPath,
    } = this.options

    if (host) {
      const builtProtocol = protocol
        ? `${protocol.split(':')[0]}://`
        : 'https://'
      const builtPort = port ? `:${port}` : ''
      return `${builtProtocol}${host}${builtPort}${directUploadsPath}`
    }
    return directUploadsPath
  }

  constructor(file: File, options: Options) {
    this.options = { ...Upload.defaultOptions, ...options }
    this.directUpload = new ActiveStorage.DirectUpload(
      file,
      this.directUploadsUrl,
      this
    )

    this.handleChangeFile({ state: 'waiting', id: this.id, file })
  }

  start(): Promise<string> {
    const promise = new Promise((resolve, reject) => {
      this.directUpload.create((error, attributes) => {
        if (error) reject(error)
        else resolve(attributes.signed_id)
      })
    })

    return promise.then(this.handleSuccess).catch(this.handleError)
  }

  /**
   * DirectUpload delegate protocol conformance
   */

  directUploadWillCreateBlobWithXHR(xhr: XMLHttpRequest) {
    this.options.onBeforeBlobRequest &&
      this.options.onBeforeBlobRequest({
        id: this.id,
        file: this.directUpload.file,
        xhr,
      })
  }

  directUploadWillStoreFileWithXHR(xhr: XMLHttpRequest) {
    this.options.onBeforeStorageRequest &&
      this.options.onBeforeStorageRequest({
        id: this.id,
        file: this.directUpload.file,
        xhr,
      })

    xhr.upload.addEventListener('progress', this.handleProgress)
  }

  /**
   * @private
   */

  handleChangeFile = (upload: ActiveStorageFileUpload) => {
    this.options.onChangeFile({ [this.id]: upload })
  }

  handleProgress = ({ loaded, total }: ProgressEvent) => {
    const progress = (loaded / total) * 100

    this.handleChangeFile({
      state: 'uploading',
      file: this.directUpload.file,
      id: this.id,
      progress,
    })
  }

  handleSuccess = (signedId: string) => {
    this.handleChangeFile({
      state: 'finished',
      id: this.id,
      file: this.directUpload.file,
    })
    return signedId
  }

  handleError = (error: string) => {
    this.handleChangeFile({
      state: 'error',
      id: this.id,
      file: this.directUpload.file,
      error,
    })
    throw error
  }
}

export default Upload
