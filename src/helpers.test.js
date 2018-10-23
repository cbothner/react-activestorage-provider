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
