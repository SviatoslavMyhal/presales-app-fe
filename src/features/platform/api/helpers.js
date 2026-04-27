export function parseDynamicKeys(url, dynamicKeys) {
  const regex = /\{([^}]+)\}/g
  const replacedUrl = url.replace(regex, (match, key) => {
    if (dynamicKeys?.[key]) {
      return dynamicKeys[key]?.toString() || match
    }
    return match
  })
  return replacedUrl
}
