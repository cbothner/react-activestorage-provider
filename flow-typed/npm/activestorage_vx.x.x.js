// flow-typed signature: 55e0b81ec0bd1bec370a9881bcaf8c64
// flow-typed version: <<STUB>>/activestorage_v5.2.0/flow_v0.75.0

declare module 'activestorage' {
  declare export function start(): void

  declare export class DirectUpload {
    id: number;
    file: File;
    url: string;

    constructor(
      file: File,
      url: string,
      delegate: {
        +directUploadWillCreateBlobWithXHR?: (xhr: XMLHttpRequest) => mixed,
        +directUploadWillStoreFileWithXHR?: (xhr: XMLHttpRequest) => mixed,
      }
    ): DirectUpload;

    create(
      callback: (
        error: Error,
        blob: {
          byte_size: number,
          checksum: string,
          content_type: string,
          filename: string,
          signed_id: string,
        }
      ) => mixed
    ): void;
  }
}
