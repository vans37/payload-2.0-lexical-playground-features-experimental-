import { NodeKey } from 'lexical'
import React, { createContext, useCallback, useState } from 'react'
import { ImageDataTypeWithSlug } from '../../../../Shared/types'

export type UploadsDrawerContext = {
  galleryNodeKey: NodeKey
  activeCollection: string
  enabledCollections: string[]

  onSelect: (item: ImageDataTypeWithSlug) => void
  onConfirm: () => void

  setActiveCollection: (collection: string) => void
  setEnabledCollections: (collections: string[]) => void
  setGalleryNodeKey: (key: NodeKey) => void

  setOnSelect: (fn: (item: ImageDataTypeWithSlug) => void) => void
  setOnConfirm: (fn: () => void) => void
}

const defaultContextState: UploadsDrawerContext = {
  galleryNodeKey: '',
  activeCollection: '',
  enabledCollections: [],
  onSelect: null,
  setOnSelect: null,
  onConfirm: null,
  setOnConfirm: null,
  setActiveCollection: null,
  setEnabledCollections: null,
  setGalleryNodeKey: null,
}

export const UploadsDrawerContext = createContext<UploadsDrawerContext>(defaultContextState)

export default function UploadsDrawerContextProvider({ children }: { children: React.ReactNode }) {
  const [galleryNodeKeyState, setGalleryNodeKeyState] = useState('')
  const [activeCollectionState, setActiveCollectionState] = useState('')
  const [enabledCollectionsState, setEnabledCollectionsState] = useState([])
  const [onSelect, setOnSelectState] = useState<(item: ImageDataTypeWithSlug) => void>()
  const [onConfirm, setOnConfirmState] = useState<() => void>()

  const setActiveCollection = useCallback((collection: string) => {
    setActiveCollectionState(collection)
  }, [])

  const setGalleryNodeKey = useCallback((key: string) => {
    setGalleryNodeKeyState(key)
  }, [])

  const setEnabledCollections = useCallback((collections: string[]) => {
    setEnabledCollectionsState(collections)
  }, [])

  const setOnSelect = useCallback((fn: (item: ImageDataTypeWithSlug) => void) => {
    setOnSelectState(() => fn)
  }, [])

  const setOnConfirm = useCallback((fn: () => void) => {
    setOnConfirmState(() => fn)
  }, [])

  return (
    <UploadsDrawerContext.Provider
      value={{
        galleryNodeKey: galleryNodeKeyState,
        activeCollection: activeCollectionState,
        enabledCollections: enabledCollectionsState,
        setGalleryNodeKey,
        setActiveCollection,
        setEnabledCollections,
        setOnSelect,
        onSelect,
        onConfirm,
        setOnConfirm,
      }}
    >
      {children}
    </UploadsDrawerContext.Provider>
  )
}
