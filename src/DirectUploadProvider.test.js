/**
 * @noflow
 */

import React from 'react'
import renderer from 'react-test-renderer'
import DirectUploadProvider from './DirectUploadProvider'
import Upload from './Upload'

global.fetch = require('jest-fetch-mock')

jest.mock('Upload', () =>
  jest.fn((file, { onChangeFile }) => {
    onChangeFile({ [Date.now()]: { fileName: file.name } })

    return {
      start: jest.fn(() => {
        return Promise.resolve('signedId')
      }),
    }
  })
)

const onSuccess = jest.fn()

const file = new File([], 'file')

const uploadOptions = {
  directUploadsPath: 'direct_uploads',
  headers: { 'X-Custom': true },
  onBeforeBlobRequest: jest.fn(),
  onBeforeStorageRequest: jest.fn(),
  origin: {},
}

function renderComponent(props) {
  return renderer.create(
    <DirectUploadProvider
      {...uploadOptions}
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

  it('creates and starts an upload when handleUpload is called', () => {
    tree.props.handleUpload([file])
    expect(Upload).toHaveBeenCalledWith(
      file,
      expect.objectContaining(uploadOptions)
    )
    expect(Upload.mock.results[0].value.start).toHaveBeenCalled()
  })

  it('creates an upload when handleChooseFiles is called', () => {
    tree.props.handleChooseFiles([file])
    expect(Upload).toHaveBeenCalledWith(
      file,
      expect.objectContaining(uploadOptions)
    )
    expect(Upload.mock.results[0].value.start).not.toHaveBeenCalled()
  })

  it('updates the file upload progress list when handleChooseFiles is called', () => {
    tree.props.handleChooseFiles([file])
    tree = component.toJSON()
    expect(tree.props.uploads).toHaveLength(1)

    tree.props.handleChooseFiles([file])
    tree = component.toJSON()
    expect(tree.props.uploads).toHaveLength(1)
  })

  it('starts the upload when handleBeginUpload is called', () => {
    tree.props.handleChooseFiles([file])

    tree.props.handleBeginUpload()
    expect(Upload.mock.results[0].value.start).toHaveBeenCalled()
  })

  it('calls onSuccess with [] if handleBeginUpload is called with no chosen files', async () => {
    await tree.props.handleBeginUpload()
    expect(onSuccess).toHaveBeenCalledWith([])
  })

  it('calls onSuccess prop when uploads are finished', async () => {
    await tree.props.handleUpload([file])
    expect(onSuccess).toHaveBeenCalledWith(['signedId'])
  })
})
