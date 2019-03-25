/**
 * @noflow
 */

import * as H from './helpers'

describe('compactObject', () => {
  it('removes attributes set to undefined', () => {
    const object = { a: 1, b: undefined, c: 'c' }
    expect(H.compactObject(object)).toEqual({ a: 1, c: 'c' })
  })

  it('doesn’t remove attributes set to null', () => {
    const object = { a: null }
    expect(H.compactObject(object)).toEqual(object)
  })
})

describe('buildUrl', () => {
  test.each`
    protocol     | host         | port         | path      | url
    ${'http'}    | ${'0.0.0.0'} | ${3000}      | ${'/api'} | ${'http://0.0.0.0:3000/api'}
    ${'http'}    | ${'0.0.0.0'} | ${undefined} | ${'/api'} | ${'http://0.0.0.0/api'}
    ${'http://'} | ${'0.0.0.0'} | ${undefined} | ${'/api'} | ${'http://0.0.0.0/api'}
    ${undefined} | ${'0.0.0.0'} | ${3000}      | ${'/api'} | ${'//0.0.0.0:3000/api'}
    ${undefined} | ${'0.0.0.0'} | ${undefined} | ${'/api'} | ${'//0.0.0.0/api'}
  `(
    'generates $url for { protocol: $protocol, host: $host, port: $port, path: $path }',
    ({ protocol, host, port, path, url }) => {
      expect(H.buildUrl({ protocol, host, port, path })).toEqual(url)
    }
  )
})
