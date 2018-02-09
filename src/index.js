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

import type { ActiveStorageFileUpload, Endpoint, RenderProps } from './types'

class ActiveStorageProvider extends React.Component<
  {
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

  virtualForm: ?VirtualForm

  componentDidMount() {
    const { endpoint, multiple } = this.props
    this.virtualForm = new VirtualForm({
      endpoint,
      multiple,
      onSubmit: this.handlePostUploadSubmit,
    })

    ActiveStorage.start()
  }

  componentWillUnmount() {
    this.virtualForm && this.virtualForm.deconstruct()
  }

  handleChooseFiles = (files: FileList) => {
    if (this.state.uploading) return

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

      this.props.onSubmit(
        fetch(this.props.endpoint.path, {
          credentials: 'same-origin',
          method: this.props.endpoint.method,
          body: formData,
          headers: new Headers(csrfHeader()),
        })
      )
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
}

export default ActiveStorageProvider
