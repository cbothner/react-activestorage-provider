import React from 'react'
import renderer from 'react-test-renderer'
import DirectUploadProvider from './DirectUploadProvider'

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

import Upload from './Upload'

const onSuccess = jest.fn()

const file = new File([], 'file')

function renderComponent(props: Object = {}): ReactTestRenderer {
  return renderer.create(
    <DirectUploadProvider
      origin={{}}
      onSuccess={onSuccess}
      render={props => <div {...props} />}
      {...props}
    />
  )
}

beforeEach(() => {
  jest.clearAllMocks()
  fetch.resetMocks()
})

describe('DirectUploadProvider', () => {
  let component, tree

  beforeEach(() => {
    component = renderComponent()
    tree = component.toJSON()
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

  it('calls onSuccess prop when uploads are finished', async () => {
    await tree.props.handleUpload([file])
    expect(onSuccess).toHaveBeenCalledWith(['signedId'])
  })
})
