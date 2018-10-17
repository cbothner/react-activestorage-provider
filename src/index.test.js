import React from 'react'
import renderer from 'react-test-renderer'
import ActiveStorageProvider from './index'
import Upload from './Upload'

import type { ReactTestRenderer } from 'react-test-renderer'

global.fetch = require('jest-fetch-mock')

jest.mock('Upload', () =>
  jest.fn((file, { onChangeFile }) => ({
    start: jest.fn(() => {
      onChangeFile({ [file.name]: { fileName: file.name } })
      return Promise.resolve('signedId')
    }),
  }))
)

jest.mock('csrfHeader', () => () => ({ 'X-CSRF-Token': 'qwertyuiop' }))

const endpoint = {
  path: '/users/1',
  model: 'User',
  attribute: 'avatar',
  method: 'PUT',
}
const onSubmit = jest.fn()

const file = new File([], 'file')

const userData = { id: '1', avatar: 'file' }

function renderComponent(props: Object = {}): ReactTestRenderer {
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

  it('updates the UI with upload progress', () => {
    expect(tree).toMatchSnapshot()

    tree.props.handleUpload([file])
    tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('creates and starts an upload', () => {
    tree.props.handleUpload([file])
    expect(Upload).toHaveBeenCalledWith(file, expect.any(Object))
  })

  it('hits the given endpoint with the signed id of the upload after it has finished', async () => {
    await tree.props.handleUpload([file])
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
})
