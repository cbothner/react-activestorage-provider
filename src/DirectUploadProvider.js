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

import type { ActiveStorageFileUpload, Origin, RenderProps } from './types'

export type DelegatedProps = {|
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
  directUploadsPath?: string,
  onSuccess: (string[]) => mixed,
}

type State = {|
  uploading: boolean,
  files: { [string]: ActiveStorageFileUpload },
|}

class DirectUploadProvider extends React.Component<Props, State> {
  static defaultProps = {
    origin: {},
  }

  state = {
    uploading: false,
    files: {},
  }

  render() {
    const { files } = this.state
    return this.props.render({
      handleUpload: this.handleChooseFiles,
      ready: !this.state.uploading,
      uploads: Object.keys(files).map(key => files[key]),
    })
  }

  handleChooseFiles = async (files: FileList | File[]) => {
    if (this.state.uploading) return
    if (files.length === 0) return

    this.setState({ uploading: true })

    const signedIds = await Promise.all(
      [...files].map(file => this._upload(file))
    )

    await this.props.onSuccess(signedIds)
    this.setState({ files: {}, uploading: false })
  }

  handleChangeFile = (fileUpload: { [string]: ActiveStorageFileUpload }) =>
    this.setState(({ files }) => ({ files: { ...files, ...fileUpload } }))

  _upload(file: File): Promise<string> {
    const {
      origin,
      directUploadsPath,
      onBeforeBlobRequest,
      onBeforeStorageRequest,
    } = this.props

    return new Upload(file, {
      origin,
      directUploadsPath,
      onBeforeBlobRequest,
      onBeforeStorageRequest,
      onChangeFile: this.handleChangeFile,
    }).start()
  }
}

export default DirectUploadProvider
