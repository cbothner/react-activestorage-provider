/**
 * @noflow
 */

import csrfHeader from './csrfHeader'

describe('csrfHeader', () => {
  it('gets the CSRF header from the meta tag on the page', () => {
    document.head.innerHTML = '<meta name="csrf-token" content="qwertyuiop">'
    expect(csrfHeader()).toEqual({ 'x-csrf-token': 'qwertyuiop' })
  })

  it('does nothing if CSRF header does not exist', () => {
    document.head.innerHTML = ''
    expect(csrfHeader()).toEqual({})
  })
})
