/**
 * @flow
 */

export function compactObject<T: {}>(obj: T): T {
  let newObj = { ...obj }

  Object.keys(newObj).forEach(
    key => newObj[key] === undefined && delete newObj[key]
  )

  return newObj
}
