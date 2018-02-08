/**
 * Extract the CSRF token from the <%= csrf_meta_tags %>
 *
 * @providesModule csrfHeader
 * @flow
 */

function getToken(): ?string {
  const meta = document.querySelector(`meta[name="csrf-token"]`)
  return meta && meta.getAttribute('content')
}

export default function csrfHeader(): { 'X-CSRF-Token': string } {
  const token = getToken()
  if (token == null) throw new Error('<meta name="csrf-token"> tag not found')

  return { 'X-CSRF-Token': token }
}
