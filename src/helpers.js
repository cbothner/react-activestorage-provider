/**
 * @flow
 */

import type { Origin } from './types'

type BuildUrlOptions = { ...Origin, path: string }

export function buildUrl({ protocol, host, port, path }: BuildUrlOptions) {
  if (!host) return path

  const buildProtocol = protocol ? `${protocol.split(':')[0]}://` : '//'
  const builtPort = port ? `:${port}` : ''
  return buildProtocol + host + builtPort + path
}

export function compactObject<T: {}>(obj: T): T {
  let newObj = { ...obj }

  Object.keys(newObj).forEach(
    key => newObj[key] === undefined && delete newObj[key]
  )

  return newObj
}
