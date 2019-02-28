/**
 * A component that creates an ActiveStorage::Blob in the Rails database,
 * uploads the files directly to the storage service and calls a render function
 * prop to allow the consumer to display the upload’s progress. On completion,
 * it calls back with the signed ids of the created blob objects.
 *
 * @providesModule DirectUploadProvider
 * @flow
 */

import * as React from 'react'

import Upload from './Upload'

import type {
  ActiveStorageFileUpload,
  Origin,
  RenderProps,
  CustomHeaders,
} from './types'

export type DelegatedProps = {|
  directUploadsPath?: string,
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
  render: RenderProps => React.Node,
|}

type Props = {
  ...DelegatedProps,
  origin: Origin,
  onSuccess: (string[]) => mixed,
  headers?: CustomHeaders,
}

type State = {|
  uploading: boolean,
  fileUploads: { [string]: ActiveStorageFileUpload },
|}

class DirectUploadProvider extends React.Component<Props, State> {
  static defaultProps = {
    origin: {},
  }

  state = {
    uploading: false,
    fileUploads: {},
  }

  uploads: Upload[] = []

  render() {
    const { fileUploads } = this.state
    return this.props.render({
      handleChooseFiles: this.handleChooseFiles,
      handleBeginUpload: this.handleBeginUpload,
      handleUpload: this.handleUpload,
      ready: !this.state.uploading,
      uploads: Object.keys(fileUploads).map(key => fileUploads[key]),
    })
  }

  handleUpload = async (files: FileList | File[]) => {
    this.handleChooseFiles(files)
    return this.handleBeginUpload()
  }

  handleChooseFiles = (files: FileList | File[]) => {
    if (this.state.uploading) return

    this.setState({ fileUploads: {} })
    this.uploads = [...files].map(file => this._createUpload(file))
  }

  handleBeginUpload = async () => {
    if (this.state.uploading) return

    this.setState({ uploading: true })

    const signedIds = await Promise.all(
      this.uploads.map(upload => upload.start())
    )

    this.props.onSuccess(signedIds)
    this.uploads = []
    this.setState({ fileUploads: {}, uploading: false })
  }

  handleChangeFileUpload = (fileUpload: {
    [string]: ActiveStorageFileUpload,
  }) =>
    this.setState(({ fileUploads }) => ({
      fileUploads: { ...fileUploads, ...fileUpload },
    }))

  _createUpload(file: File) {
    const {
      directUploadsPath,
      headers,
      onBeforeBlobRequest,
      onBeforeStorageRequest,
      origin,
    } = this.props

    return new Upload(file, {
      directUploadsPath,
      headers,
      onBeforeBlobRequest,
      onBeforeStorageRequest,
      onChangeFile: this.handleChangeFileUpload,
      origin,
    })
  }
}

export default DirectUploadProvider
