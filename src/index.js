/**
 * A component that attaches a file or files to a Rails model using
 * ActiveStorage. It delegates to DirectUploadProvider to create an
 * ActiveStorage::Blob in the Rails database and upload the files directly to
 * the storage service, then it makes a request to the model’s controller to
 * attach the blob to the model. Calling a render function prop to allow the
 * consumer to display the upload’s progress is also delegated.
 *
 * @providesModule ActiveStorageProvider
 * @flow
 */

import * as React from 'react'

import DirectUploadProvider from './DirectUploadProvider'
export { DirectUploadProvider }

import csrfHeader from './csrfHeader'

import type { DelegatedProps } from './DirectUploadProvider'
import type { Endpoint, CustomHeaders } from './types'
export type { ActiveStorageFileUpload, Endpoint, RenderProps } from './types'

type Props = {|
  ...DelegatedProps,
  endpoint: Endpoint,
  onSubmit: Object => mixed,
  onError?: Response => mixed,
  headers?: CustomHeaders,
|}

class ActiveStorageProvider extends React.Component<Props> {
  render() {
    const {
      endpoint: { host, port, protocol },
      onSubmit,
      headers,
      ...props
    } = this.props

    return (
      <DirectUploadProvider
        {...props}
        origin={{ host, port, protocol }}
        onSuccess={this.handleSuccess}
      />
    )
  }

  handleSuccess = async (ids: string[]) => {
    if (ids.length === 0) return

    try {
      const data = await this._hitEndpointWithSignedIds(ids)
      this.props.onSubmit(data)
    } catch (e) {
      this.props.onError && this.props.onError(e)
    }
  }

  async _hitEndpointWithSignedIds(signedIds: string[]): Promise<Object> {
    const { endpoint, multiple, headers } = this.props
    const { path, method, attribute, model } = endpoint
    const body = {
      [model.toLowerCase()]: {
        [attribute]: multiple ? signedIds : signedIds[0],
      },
    }

    const addCSRFHeader = !headers || !headers.hasOwnProperty('X-CSRF-Token')
    const response = await fetch(path, {
      credentials: 'same-origin',
      method,
      body: JSON.stringify(body),
      headers: new Headers({
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(addCSRFHeader ? csrfHeader() : {}),
        ...headers,
      }),
    })

    if (!response.ok) throw response

    return response.json()
  }
}

export default ActiveStorageProvider
