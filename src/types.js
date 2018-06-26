/**
 * @flow
 */

export type ActiveStorageFileUpload =
  | { state: 'waiting', id: string, file: File }
  | { state: 'uploading', id: string, file: File, progress: number }
  | { state: 'error', id: string, file: File, error: string }
  | { state: 'finished', id: string, file: File }

export type Endpoint = {
  path: string,
  model: string,
  attribute: string,
  method: string,
  host?: string,
  port?: string,
  protocol?: string,
}

export type RenderProps = {
  handleUpload: (FileList | File[]) => void /* call to initiate an upload */,
  ready: boolean /* false while any file is uploading */,
  uploads: ActiveStorageFileUpload[] /* uploads in progress */,
}
