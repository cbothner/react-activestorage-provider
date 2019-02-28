/**
 * @noflow
 */

import React from 'react'
import renderer from 'react-test-renderer'
import ActiveStorageProvider from './index'

global.fetch = require('jest-fetch-mock')

jest.mock('DirectUploadProvider', () =>
  jest.fn(props => <div data-component="DirectUploadProvider" {...props} />)
)

const mockCSRFHeader = { 'x-csrf-token': 'qwertyuiop' }
jest.mock('csrfHeader', () => () => mockCSRFHeader)

const endpoint = {
  path: '/users/1',
  model: 'User',
  attribute: 'avatar',
  method: 'PUT',
}
const onSubmit = jest.fn()

const userData = { id: '1', avatar: 'file' }

function renderComponent(props: Object = {}) {
  return renderer.create(
    <ActiveStorageProvider
      directUploadsPath="direct_uploads/"
      endpoint={endpoint}
      headers={{ 'X-Custom': true }}
      multiple={false}
      onBeforeBlobRequest={jest.fn()}
      onBeforeStorageRequest={jest.fn()}
      onError={jest.fn()}
      onSubmit={onSubmit}
      render={props => <div {...props} />}
      {...props}
    />
  )
}

beforeEach(() => {
  jest.clearAllMocks()
  fetch.resetMocks()
})

describe('ActiveStorageProvider', () => {
  let component, tree

  beforeEach(() => {
    component = renderComponent()
    tree = component.toJSON()
    fetch.mockResponse(JSON.stringify(userData))
  })

  it('renders a DirectUploadProvider', () => {
    expect(tree).toMatchSnapshot()
  })

  it('hits the given endpoint with the signed id of the upload after it has finished', async () => {
    await tree.props.onSuccess(['signedId'])
    expect(fetch).toHaveBeenCalledWith(
      endpoint.path,
      expect.objectContaining({
        method: endpoint.method,
        body: JSON.stringify({
          [endpoint.model.toLowerCase()]: { avatar: 'signedId' },
        }),
      })
    )
    expect(onSubmit).toHaveBeenCalledWith(userData)
  })

  it('doesn’t hit the endpoint if handleUpload is called with no files', async () => {
    await tree.props.onSuccess([])
    expect(fetch).not.toHaveBeenCalled()
  })

  describe('if custom headers are provided', () => {
    it('merges headers indifferently', async () => {
      const baseCustomHeaders = { 'TEST-HEADER': 'testValue' }
      const customHeaders = {
        ...baseCustomHeaders,
        'X-CSRF-Token': 'testToken',
      }

      component = renderComponent({ headers: customHeaders })
      tree = component.toJSON()
      await tree.props.onSuccess(['signedId'])
      expect(fetch).toHaveBeenCalledWith(
        endpoint.path,
        expect.objectContaining({
          method: endpoint.method,
          body: JSON.stringify({
            [endpoint.model.toLowerCase()]: { avatar: 'signedId' },
          }),
          headers: new Headers({
            Accept: 'application/json',
            'Content-Type': 'application/json',
            ...customHeaders,
          }),
        })
      )

      const newCustomHeaders = {
        ...baseCustomHeaders,
        'x-csrf-token': 'testToken',
      }
      component = renderComponent({ headers: newCustomHeaders })
      tree = component.toJSON()
      await tree.props.onSuccess(['signedId'])
      expect(fetch).toHaveBeenCalledWith(
        endpoint.path,
        expect.objectContaining({
          method: endpoint.method,
          body: JSON.stringify({
            [endpoint.model.toLowerCase()]: { avatar: 'signedId' },
          }),
          headers: new Headers({
            Accept: 'application/json',
            'Content-Type': 'application/json',
            ...customHeaders,
          }),
        })
      )

      component = renderComponent({ headers: baseCustomHeaders })
      tree = component.toJSON()
      await tree.props.onSuccess(['signedId'])
      expect(fetch).toHaveBeenCalledWith(
        endpoint.path,
        expect.objectContaining({
          method: endpoint.method,
          body: JSON.stringify({
            [endpoint.model.toLowerCase()]: { avatar: 'signedId' },
          }),
          headers: new Headers({
            Accept: 'application/json',
            'Content-Type': 'application/json',
            ...baseCustomHeaders,
            ...mockCSRFHeader,
          }),
        })
      )
    })
  })

  describe('if no headers are provided', () => {
    beforeEach(() => {
      component = renderComponent()
      tree = component.toJSON()
    })

    it('adds a CSRF token through the meta tag', async () => {
      await tree.props.onSuccess(['signedId'])
      expect(fetch).toHaveBeenCalledWith(
        endpoint.path,
        expect.objectContaining({
          method: endpoint.method,
          body: JSON.stringify({
            [endpoint.model.toLowerCase()]: { avatar: 'signedId' },
          }),
          headers: new Headers({
            Accept: 'application/json',
            'Content-Type': 'application/json',
            ...mockCSRFHeader,
          }),
        })
      )
    })
  })
})
