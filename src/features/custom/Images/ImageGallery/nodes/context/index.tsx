import { NodeKey } from 'lexical'
import React, { createContext, useCallback, useState } from 'react'

export type GalleryContext = {
  galleryNodeKey: NodeKey
  uploadsDrawerSlug: string
  selectImageDrawerSlug: string
  setGalleryNodeKey: (key: NodeKey) => void
  setUploadsDrawerSlug: (slug: string) => void
  setSelectImageDrawerSlug: (slug: string) => void
}

const defaultContextState: GalleryContext = {
  galleryNodeKey: '',
  uploadsDrawerSlug: '',
  selectImageDrawerSlug: '',
  setGalleryNodeKey: () => {},
  setUploadsDrawerSlug: () => {},
  setSelectImageDrawerSlug: () => {},
}

export const GalleryContext = createContext<GalleryContext>(defaultContextState)

export default function GalleryContextProvider({ children }: { children: React.ReactNode }) {
  const [galleryNodeKeyState, setGalleryNodeKeyState] = useState('')
  const [uploadsDrawerSlugState, setUploadsDrawerSlugState] = useState('')
  const [selectImageDrawerSlugState, setSelectImageDrawerSlugState] = useState('')

  const setGalleryNodeKey = useCallback((key: string) => {
    setGalleryNodeKeyState(key)
  }, [])

  const setUploadsDrawerSlug = useCallback((slug: string) => {
    setUploadsDrawerSlugState(slug)
  }, [])

  const setSelectImageDrawerSlug = useCallback((slug: string) => {
    setSelectImageDrawerSlugState(slug)
  }, [])

  return (
    <GalleryContext.Provider
      value={{
        galleryNodeKey: galleryNodeKeyState,
        uploadsDrawerSlug: uploadsDrawerSlugState,
        selectImageDrawerSlug: selectImageDrawerSlugState,
        setGalleryNodeKey,
        setUploadsDrawerSlug,
        setSelectImageDrawerSlug,
      }}
    >
      {children}
    </GalleryContext.Provider>
  )
}
