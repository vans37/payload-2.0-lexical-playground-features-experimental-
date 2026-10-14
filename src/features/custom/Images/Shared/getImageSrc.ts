export default function getImageSrc(
  filename: string,
  serverUrl: string,
  customUrl?: boolean,
  collection?: string,
) {
  let src = ''
  const fallbackUrl = '/'

  //set gallery image src
  if (collection) {
    if (customUrl) {
      src = serverUrl + '/' + filename
    } else if (serverUrl) {
      src = serverUrl + '/' + collection + '/' + filename
    } else {
      src = fallbackUrl + filename
    }

    return src
  }

  //set other images src
  if (serverUrl) {
    src = serverUrl + '/' + filename
  } else {
    src = fallbackUrl + filename
  }

  return src
}
