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
import csrfHeader from './csrfHeader'

import type { DelegatedProps } from './DirectUploadProvider'
import type { Endpoint, CustomHeaders } from './types'

type Props = {|
  ...DelegatedProps,
  endpoint: Endpoint,
  onSubmit: Object => mixed,
  onError?: Response => mixed,
  headers: CustomHeaders,
|}

class ActiveStorageProvider extends React.Component<Props> {
  static defaultProps = { headers: {} }

  get _headers(): Headers {
    const { headers } = this.props
    const normalizedHeaders = Object.keys(headers).reduce((acc, key) => {
      acc[key.toLowerCase()] = headers[key]
      return acc
    }, {})

    return new Headers({
      accept: 'application/json',
      'content-type': 'application/json',
      ...csrfHeader(),
      ...normalizedHeaders,
    })
  }

  render() {
    const {
      endpoint: { host, port, protocol },
      onSubmit,
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
    const { endpoint, multiple } = this.props
    const { path, method, attribute, model } = endpoint
    const body = {
      [model.toLowerCase()]: {
        [attribute]: multiple ? signedIds : signedIds[0],
      },
    }

    const response = await fetch(path, {
      credentials: 'same-origin',
      method,
      body: JSON.stringify(body),
      headers: this._headers,
    })

    if (!response.ok) throw response

    return response.json()
  }
}

export default ActiveStorageProvider
export { DirectUploadProvider }

export type { ActiveStorageFileUpload, Endpoint, RenderProps } from './types'
