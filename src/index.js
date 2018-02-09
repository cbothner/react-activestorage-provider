/**
 * This component handles the direct upload of a file to an ActiveStorage
 * service and calls render props with arguments that indicate that upload’s
 * progress.
 *
 * @providesModule ActiveStorageProvider
 * @flow
 */

import * as React from 'react'
import * as ActiveStorage from 'activestorage'

import csrfHeader from './csrfHeader'
import VirtualForm from './VirtualForm'
import Listeners from './Listeners'

import type { ActiveStorageFileUpload, Endpoint, RenderProps } from './types'

type Props = {
  endpoint: Endpoint,
  multiple?: boolean,
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
  onSubmit: Object => mixed,
  render: RenderProps => React.Node,
}
type State = {
  uploading: boolean,
  files: { [string]: ActiveStorageFileUpload },
}
class ActiveStorageProvider extends React.Component<Props, State> {
  state = {
    uploading: false,
    files: {},
  }

  listeners: ?Listeners
  virtualForm: ?VirtualForm

  componentDidMount() {
    this._connect()
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props !== prevProps) {
      this._disconnect()
      this._connect()
    }
  }

  componentWillUnmount() {
    this._disconnect()
  }

  handleChooseFiles = (files: FileList) => {
    if (this.state.uploading) return
    if (files.length === 0) return

    this.setState({ uploading: true }, () => {
      this.virtualForm && this.virtualForm.submit(files)
    })
  }

  handlePostUploadSubmit = (e: Event) => {
    e.preventDefault()
    const form = e.currentTarget

    if (form instanceof HTMLFormElement) {
      if (!form.querySelector('[type="file"]:disabled')) return

      const formData = new FormData(form)

      this._hitEndpoint(formData).then(this.props.onSubmit)

      this._disconnect()
      this._connect()
    }
  }

  render() {
    const { files } = this.state
    return this.props.render({
      handleUpload: this.handleChooseFiles,
      ready: !this.state.uploading,
      uploads: Object.keys(files).map(key => files[key]),
    })
  }

  _connect() {
    const {
      endpoint,
      multiple,
      onBeforeBlobRequest,
      onBeforeStorageRequest,
    } = this.props

    this.virtualForm = new VirtualForm({
      endpoint,
      multiple,
      onSubmit: this.handlePostUploadSubmit,
    })

    this.virtualForm &&
      (this.listeners = new Listeners({
        virtualForm: this.virtualForm,
        onChangeFile: file =>
          this.setState(({ files }) => ({ files: { ...files, ...file } })),
        onResetFiles: uploading => this.setState({ files: {}, uploading }),
        onBeforeBlobRequest,
        onBeforeStorageRequest,
      }))

    ActiveStorage.start()
  }

  _disconnect() {
    if (this.virtualForm == null) return
    this.virtualForm.deconstruct()
    delete this.virtualForm
  }

  _hitEndpoint(formData: FormData): Promise<Object> {
    return fetch(this.props.endpoint.path, {
      credentials: 'same-origin',
      method: this.props.endpoint.method,
      body: formData,
      headers: new Headers(csrfHeader()),
    }).then(r => r.json())
  }
}

export default ActiveStorageProvider
