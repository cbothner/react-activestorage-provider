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

const mockCSRFHeader = { 'X-CSRF-Token': 'qwertyuiop' }
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
      endpoint={endpoint}
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
    const customHeaders = { 'TEST-HEADER': 'testValue' }

    beforeEach(() => {
      component = renderComponent({ headers: customHeaders })
      tree = component.toJSON()
    })

    it('hits the given endpoint with the custom headers', async () => {
      await tree.props.onSuccess(['signedId'])
      const headers = new Headers({
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...mockCSRFHeader,
        ...customHeaders,
      })
      expect(fetch).toHaveBeenCalledWith(
        endpoint.path,
        expect.objectContaining({
          method: endpoint.method,
          body: JSON.stringify({
            [endpoint.model.toLowerCase()]: { avatar: 'signedId' },
          }),
          headers,
        })
      )
    })

    describe('if an X-CSRF-Token is provided', () => {
      const customHeaders = { 'X-CSRF-Token': 'testToken' }

      beforeEach(() => {
        component = renderComponent({ headers: customHeaders })
        tree = component.toJSON()
      })

      it('uses the provided X-CSRF-Token', async () => {
        await tree.props.onSuccess(['signedId'])
        const headers = new Headers({
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...customHeaders,
        })
        expect(fetch).toHaveBeenCalledWith(
          endpoint.path,
          expect.objectContaining({
            method: endpoint.method,
            body: JSON.stringify({
              [endpoint.model.toLowerCase()]: { avatar: 'signedId' },
            }),
            headers,
          })
        )
      })
    })
  })
})
