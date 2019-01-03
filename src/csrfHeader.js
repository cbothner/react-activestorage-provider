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

export default function csrfHeader(): { 'x-csrf-token'?: string } {
  const token = getToken()
  return token ? { 'x-csrf-token': token } : {}
}
