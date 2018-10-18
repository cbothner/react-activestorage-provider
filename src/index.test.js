import React from 'react'
import renderer from 'react-test-renderer'
import ActiveStorageProvider from './index'

global.fetch = require('jest-fetch-mock')

jest.mock('DirectUploadProvider', () =>
  jest.fn(props => <div data-component="DirectUploadProvider" {...props} />)
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
})
