/**
 * This class handles the virtual form ActiveStorageProvider uses to take
 * advantage of ActiveStorage’s public API.
 *
 * @providesModule VirtualForm
 * @flow
 */

import type { Endpoint } from './types'

const CONVENTIONAL_DIRECT_UPLOADS_PATH = '/rails/active_storage/direct_uploads'

class VirtualForm {
  _endpoint: Endpoint
  _multiple: ?boolean

  _input: HTMLInputElement
  _submitButton: HTMLButtonElement

  form: HTMLFormElement

  constructor(props: {
    endpoint: Endpoint,
    multiple?: boolean,
    onSubmit: Event => mixed,
  }) {
    this._endpoint = props.endpoint
    this._multiple = props.multiple

    this._createForm()

    this.form.append(this._createFileInput())
    this.form.append(this._createSubmitButton())

    this.form.addEventListener('submit', props.onSubmit)

    this._appendForm()
  }

  submit(files: FileList) {
    this._input.files = files
    this._submitButton.click()
  }

  deconstruct() {
    document.body && document.body.removeChild(this.form)
  }

  _createForm() {
    this.form = document.createElement('form')
    this.form.action = this._endpoint.path
    this.form.enctype = 'multipart/form-data'
    this.form.method = 'post'
    this.form.style.display = 'none'
    return this.form
  }

  _createFileInput() {
    this._input = document.createElement('input')
    this._input.type = 'file'
    this._input.dataset.directUploadUrl = CONVENTIONAL_DIRECT_UPLOADS_PATH
    this._input.name = this._inputName()
    this._input.multiple = Boolean(this._multiple)
    return this._input
  }

  _createSubmitButton() {
    const button = document.createElement('input')
    button.type = 'submit'
    button.style.display = 'none'
    return button
  }

  _inputName() {
    const { attribute, model } = this._endpoint
    return `${model.toLowerCase()}[${attribute}]`
  }

  _appendForm() {
    document.body && document.body.appendChild(this.form)
  }
}

export default VirtualForm
