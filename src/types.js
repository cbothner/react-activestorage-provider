/**
 * @flow
 */

export type ActiveStorageFileUpload =
  | { state: 'waiting', file: File }
  | { state: 'uploading', file: File, progress: number }
  | { state: 'error', file: File, error: string }
  | { state: 'finished', file: File }

export type Endpoint = {
  path: string,
  model: string,
  attribute: string,
  method: string,
}

export type RenderProps = {
  handleUpload: FileList => void /* call to initiate an upload */,
  ready: boolean /* false while any file is uploading */,
  uploads: ActiveStorageFileUpload[] /* uploads in progress */,
}
