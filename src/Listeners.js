/**
 * This class handles the listeners for ActiveStorage’s direct upload events
 *
 * @providesModule Listeners
 * @flow
 */

import type VirtualForm from './VirtualForm'
import type { ActiveStorageFileUpload } from './types'

type Props = {
  virtualForm: VirtualForm,
  onChangeFile: ({ [string]: ActiveStorageFileUpload }) => mixed,
  onResetFiles: (uploading: boolean) => mixed,
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
}

class Listeners {
  props: Props

  constructor(props: Props) {
    this.props = props

    this._addUploadSetListeners()
    this._addUploadInstanceListeners()
  }

  _addUploadSetListeners() {
    const { onResetFiles } = this.props
    this._f().addEventListener('direct-uploads:start', () => onResetFiles(true))
    this._f().addEventListener('direct-uploads:end', () => onResetFiles(false))
  }

  _addUploadInstanceListeners() {
    this._forwardRequestListeners()
    this._addInitializeListener()
    this._addProgressListeners()
    this._addErrorListener()
    this._addFinishListener()
  }

  _forwardRequestListeners() {
    const { onBeforeBlobRequest, onBeforeStorageRequest } = this.props

    onBeforeBlobRequest &&
      this._f().addEventListener('direct-upload:before-blob-request', e =>
        onBeforeBlobRequest(e.detail)
      )
    onBeforeStorageRequest &&
      this._f().addEventListener('direct-upload:before-storage-request', e =>
        onBeforeStorageRequest(e.detail)
      )
  }

  _addInitializeListener() {
    this._f().addEventListener('direct-upload:initialize', ({ detail }) => {
      const { id, file } = detail
      this.props.onChangeFile({
        [id]: { state: 'waiting', file, id },
      })
    })
  }

  _addProgressListeners() {
    this._f().addEventListener('direct-upload:start', ({ detail }) => {
      const { id, file } = detail
      this.props.onChangeFile({
        [id]: { state: 'uploading', progress: 0, file, id },
      })
    })

    this._f().addEventListener('direct-upload:progress', ({ detail }) => {
      const { id, file, progress } = detail
      this.props.onChangeFile({
        [id]: { state: 'uploading', progress, file, id },
      })
    })
  }

  _addErrorListener() {
    this._f().addEventListener('direct-upload:error', ({ detail }) => {
      const { id, file, error } = detail
      this.props.onChangeFile({ [id]: { state: 'error', file, error, id } })
    })
  }

  _addFinishListener() {
    this._f().addEventListener('direct-upload:end', ({ detail }) => {
      const { id, file } = detail
      this.props.onChangeFile({ [id]: { state: 'finished', file, id } })
    })
  }

  _f(): $FlowIssue {
    return this.props.virtualForm.form
  }
}

export default Listeners
