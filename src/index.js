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

const CONVENTIONAL_DIRECT_UPLOADS_PATH = '/rails/active_storage/direct_uploads'

export type RenderProps = {
  handleUpload: FileList => void /* call to initiate an upload */,
  ready: boolean /* false while any file is uploading */,
  uploads: ActiveStorageFileUpload[] /* uploads in progress */,
}

export type ActiveStorageFileUpload =
  | { state: 'uploading', file: File, progress: number }
  | { state: 'error', file: File, error: string }
  | { state: 'finished', file: File }

class ActiveStorageProvider extends React.Component<
  {
    endpoint: {
      path: string,
      model: string,
      attribute: string,
      method: string,
    },
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
    onSubmit: (Promise<Response>) => mixed,
    render: RenderProps => React.Node,
  },
  {
    uploading: boolean,
    files: { [string]: ActiveStorageFileUpload },
  }
> {
  state = {
    uploading: false,
    files: {},
  }

  form: ?HTMLFormElement
  input: ?HTMLInputElement

  componentDidMount() {
    const form = this._createForm()
    form.append(this._createFileInput())

    form.addEventListener('submit', this.handlePostUploadSubmit)

    document.body && document.body.appendChild(form)

    ActiveStorage.start()
  }

  componentWillUnmount() {
    this.form && document.body && document.body.removeChild(this.form)
  }

  handleChooseFiles = (files: FileList) => {
    if (this.state.uploading) return

    this.setState({ uploading: true }, () => {
      this.input && (this.input.files = files)
      this._submitForm()
    })
  }

  handlePostUploadSubmit = (e: Event) => {
    e.preventDefault()

    const form = this.form
    if (form == null) return
    if (!form.querySelector('[type="file"]:disabled')) return

    const formData = new FormData(form)

    this.props.onSubmit(
      fetch(this.props.endpoint.path, {
        credentials: 'same-origin',
        method: this.props.endpoint.method,
        body: formData,
        headers: new Headers(csrfHeader()),
      })
    )
  }

  render() {
    const { files } = this.state
    return this.props.render({
      handleUpload: this.handleChooseFiles,
      ready: !this.state.uploading,
      uploads: Object.keys(files).map(key => files[key]),
    })
  }

  _createForm() {
    const form = document.createElement('form')
    form.action = this.props.endpoint.path
    form.enctype = 'multipart/form-data'
    form.method = 'post'

    form.style.display = 'none'

    this.form = form
    return form
  }

  _createFileInput() {
    const input = document.createElement('input')
    input.type = 'file'
    input.dataset.directUploadUrl = CONVENTIONAL_DIRECT_UPLOADS_PATH
    input.name = this._inputName()
    input.multiple = Boolean(this.props.multiple)

    this.input = input
    return input
  }

  _inputName() {
    const { attribute, model } = this.props.endpoint
    return `${model.toLowerCase()}[${attribute}]`
  }

  _submitForm() {
    const form = this.form
    if (form == null) return

    const button = document.createElement('input')
    button.type = 'submit'
    button.style.display = 'none'
    form.appendChild(button)
    button.click()
    form.removeChild(button)
  }
}

export default ActiveStorageProvider
