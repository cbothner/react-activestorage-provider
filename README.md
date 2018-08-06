# react-activestorage-provider

[![NPM](https://img.shields.io/npm/v/react-activestorage-provider.svg)](https://www.npmjs.com/package/react-activestorage-provider)

ActiveStorage is an amazing addition to Rails 5.2, and as usual the team have made it fantastically simple to use... if you’re generating HTML server-side, that is. This component aims to make it just as easy to use from React.

ActiveStorageProvider handles the direct upload of a file to an ActiveStorage service and calls render props with arguments that let you build your own upload widget.

## Install

```bash
npm install --save react-activestorage-provider
```

## Usage

```jsx
<ActiveStorageProvider
  endpoint={{
    path: '/profile',
    model: 'User',
    attribute: 'avatar',
    method: 'PUT',
  }}
  onSubmit={user => this.setState({ avatar: user.avatar })}
  render={({ handleUpload, uploads, ready }) => (
    <div>
      <input
        type="file"
        disabled={!ready}
        onChange={e => handleUpload(e.currentTarget.files)}
      />

      {uploads.map(
        upload =>
          upload.state === 'waiting' ? (
            <p key={upload.id}>Waiting to upload {upload.file.name}</p>
          ) : upload.state === 'uploading' ? (
            <p key={upload.id}>
              Uploading {upload.file.name}: {upload.progress}%
            </p>
          ) : upload.state === 'error' ? (
            <p key={upload.id}>
              Error uploading {upload.file.name}: {upload.error}
            </p>
          ) : (
            <p key={upload.id}>Finished uploading {upload.file.name}</p>
          )
      )}
    </div>
  )}
/>
```

### `ActiveStorageProvider` Props

These are your options for configuring ActiveStorageProvider.

| Prop (\*required)        | Description                                                                                                                                                                |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `endpoint`\*             | `{ path: string, model: string, attribute: string, method: string, host?: string, port?: string, protocol?: string }`<br />The details for the request to attach the file. |
| `multiple`               | `boolean`<br/>Whether the component should accept multiple files. If true, the model should use `has_many_attached`.                                                       |
| `token`               | `string`<br/>Optional authorization token.                                                       |
| `onBeforeBlobRequest`    | `({ id: string, file: File, xhr: XMLHttpRequest }) => mixed`<br />A callback that allows you to modify the blob request                                                    |
| `onBeforeStorageRequest` | `({ id: string, file: File, xhr: XMLHttpRequest }) => mixed`<br />A callback that allows you to modify the storage request                                                 |
| `onSubmit`\*             | `Object => mixed`<br />A callback for the server response to the upload                                                                                                    |
| `render`\*               | `RenderProps => React.Node`<br />Render props                                                                                                                              |

### `RenderProps`

This is the type of the argument with which your render function will be called.

```jsx
type RenderProps = {
  handleUpload: (FileList | File[]) => void /* call to initiate an upload */,
  ready: boolean /* false while any file is uploading */,
  uploads: ActiveStorageFileUpload[] /* uploads in progress */,
}

type ActiveStorageFileUpload =
  | { state: 'waiting', id: string, file: File }
  | { state: 'uploading', id: string, file: File, progress: number }
  | { state: 'error', id: string, file: File, error: string }
  | { state: 'finished', id: string, file: File }
```
