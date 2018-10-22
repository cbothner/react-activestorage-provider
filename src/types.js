/**
 * @flow
 */

export type ActiveStorageFileUpload =
  | { state: 'waiting', id: string, file: File }
  | { state: 'uploading', id: string, file: File, progress: number }
  | { state: 'error', id: string, file: File, error: string }
  | { state: 'finished', id: string, file: File }

export type Origin = { host?: string, port?: string, protocol?: string }

export type Endpoint = {
  ...Origin,
  path: string,
  model: string,
  attribute: string,
  method: string,
}

export type RenderProps = {
  ready: boolean /* false while any file is uploading */,
  uploads: ActiveStorageFileUpload[] /* uploads in progress */,

  handleUpload: (FileList | File[]) => mixed /* call to initiate an upload */,

  /* or, if you want more granular control... */

  /* call to set list of files to be uploaded */
  handleChooseFiles: (FileList | File[]) => mixed,
  /* begin the upload of the files in the list */
  handleBeginUpload: () => mixed,
}

export type CustomHeaders = { [string]: string }
