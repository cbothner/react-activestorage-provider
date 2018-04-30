/**
 * This class handles the virtual form ActiveStorageProvider uses to take
 * advantage of ActiveStorage’s public API.
 *
 * @providesModule VirtualForm
 * @flow
 */

import type { Endpoint } from './types'

const CONVENTIONAL_DIRECT_UPLOADS_PATH = '/rails/active_storage/direct_uploads'

type Props = {
  endpoint: Endpoint,
  multiple?: boolean,
  onSubmit: Event => mixed,
}

class VirtualForm {
  props: Props

  _input: HTMLInputElement
  _submitButton: HTMLInputElement

  form: HTMLFormElement

  constructor(props: Props) {
    this.props = props

    this._createForm()
    this._attachForm()

    this.form.addEventListener('submit', props.onSubmit)
  }

  submit(files: FileList) {
    this._input.files = files
    this._submitButton.click()
  }

  deconstruct() {
    this._detachForm()
  }

  _createForm() {
    this.form = document.createElement('form')
    this.form.action = this.props.endpoint.path
    this.form.enctype = 'multipart/form-data'
    this.form.method = 'post'
    this.form.style.display = 'none'

    this.form.append(this._createFileInput())
    this.form.append(this._createSubmitButton())

    return this.form
  }

  _createFileInput() {
    this._input = document.createElement('input')
    this._input.type = 'file'
    this._input.dataset.directUploadUrl = this._directUploadsUrl()
    this._input.name = this._inputName()
    this._input.multiple = Boolean(this.props.multiple)
    return this._input
  }

  _directUploadsUrl() {
    const { host, protocol, port } = this.props.endpoint
    if (host) {
      const builtProtocol = protocol
        ? `${protocol.split(':')[0]}://`
        : 'https://'
      const builtPort = port ? `:${port}` : ''
      return `${builtProtocol}${host}${builtPort}${CONVENTIONAL_DIRECT_UPLOADS_PATH}`
    }
    return CONVENTIONAL_DIRECT_UPLOADS_PATH
  }

  _createSubmitButton() {
    this._submitButton = document.createElement('input')
    this._submitButton.type = 'submit'
    this._submitButton.style.display = 'none'
    return this._submitButton
  }

  _inputName() {
    const { endpoint, multiple } = this.props
    const { attribute, model } = endpoint
    return `${model.toLowerCase()}[${attribute}]${multiple ? '[]' : ''}`
  }

  _attachForm() {
    document.body && document.body.appendChild(this.form)
  }

  _detachForm() {
    document.body && document.body.removeChild(this.form)
  }
}

export default VirtualForm
