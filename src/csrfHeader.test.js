/**
 * @noflow
 */

import csrfHeader from './csrfHeader'

describe('csrfHeader', () => {
  it('gets the CSRF header from the meta tag on the page', () => {
    document.head.innerHTML = '<meta name="csrf-token" content="qwertyuiop">'
    expect(csrfHeader()).toEqual({ 'X-CSRF-Token': 'qwertyuiop' })
  })

  it('throws an error if there is no CSRF meta tag on the page', () => {
    document.head.innerHTML = ''
    expect(csrfHeader).toThrow('<meta name="csrf-token"> tag not found')
  })
})
