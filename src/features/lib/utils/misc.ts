export const removeForwardSlash = (string: string): string => {
  return string.replace(/([^:]\/)\/+/g, '$1')
}

//TODO: this is tied to certain implementation, needs rework
export const replaceOriginWithServerUrl = (url: string): string => {
  const newUrl = removeForwardSlash(url)

  if (url.startsWith('http')) {
    const origin = new URL(newUrl).origin
    return process.env.PAYLOAD_PUBLIC_SERVER_URL + newUrl.replace(origin, '')
  } else {
    return url
  }
}
