import { GetAdminThumbnail } from '../../../../../lib/types'
import qs from 'qs'
import React, { createContext, useContext } from 'react'
import { useLocation } from 'react-router-dom'
import { ImageDataTypeWithSlug } from '../../../Shared/types'

export const getThumbnailUrl = (
  upload: ImageDataTypeWithSlug,
  adminThumbnail: GetAdminThumbnail | string,
) => {
  let url = ''
  if (typeof adminThumbnail === 'function') {
    const thumb = adminThumbnail({ doc: upload })
    if (thumb) {
      url = thumb
    } else {
      url = upload.url
    }
  } else {
    //@ts-expect-error
    url = upload?.sizes?.[adminThumbnail as string]?.url || upload.url
  }

  return url
}

const Context = createContext({})

export const SearchParamsProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const location = useLocation()

  const params = qs.parse(location.search, { depth: 10, ignoreQueryPrefix: true })

  return <Context.Provider value={params}>{children}</Context.Provider>
}

export const useSearchParams = (): qs.ParsedQs => useContext(Context)
