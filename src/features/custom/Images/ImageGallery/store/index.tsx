import { create } from 'zustand'
import { useCallback } from 'react'
import type { NodeKey } from 'lexical'
import { ImageDataTypeWithSlug } from '../../Shared/types'
import { FileResultDataURL } from '../../../../lib/types'

export type State = {
  selection: ImageDataTypeWithSlug[]
  shouldInsertMedia: boolean
  files: FileResultDataURL[]
  isModalOpen: boolean
}

export type States = Record<NodeKey, State>

const initialState: State = {
  selection: [],
  shouldInsertMedia: false,
  files: [],
  isModalOpen: false,
}

type GalleryStore = {
  state: States
  setStateForKey: (galleryKey: NodeKey, partial: Partial<State>) => void
  clearStateForKey: (galleryKey: NodeKey) => void
}

export const useGalleryStore = create<GalleryStore>((set) => ({
  state: {},
  setStateForKey: (galleryKey, partial) =>
    set((prev) => ({
      state: {
        ...prev.state,
        [galleryKey]: {
          ...initialState,
          ...prev.state[galleryKey],
          ...partial,
        },
      },
    })),
  clearStateForKey: (galleryKey) =>
    set((prev) => ({
      state: { ...prev.state, [galleryKey]: initialState },
    })),
}))

export const useGallery = (galleryKey: NodeKey) => {
  const { state, setStateForKey, clearStateForKey } = useGalleryStore()
  const gallery = state[galleryKey] || initialState

  const setSelection = useCallback(
    (
      updater:
        | ImageDataTypeWithSlug[]
        | ((prev: ImageDataTypeWithSlug[]) => ImageDataTypeWithSlug[]),
      key?: NodeKey,
    ) => {
      const k = key || galleryKey

      const { state } = useGalleryStore.getState()

      const prevSelection = state[k]?.selection || []

      const nextSelection = typeof updater === 'function' ? updater(prevSelection) : updater

      setStateForKey(k, { selection: nextSelection })
    },
    [galleryKey, setStateForKey],
  )

  const deleteSelectionBySlugAndId = useCallback(
    (selection, key) => {
      const k = key || galleryKey
      const { state } = useGalleryStore.getState()
      const prev = state[k]?.selection || []

      const filtered = prev.filter(
        (item) => !(item.id === selection.id && item.slug === selection.collectionSlug),
      )

      setStateForKey(k, { selection: filtered })
    },
    [galleryKey, setStateForKey],
  )

  const clearSelection = useCallback(
    (key?: NodeKey) => {
      const k = key || galleryKey
      setStateForKey(k, { selection: [] })
    },
    [galleryKey, state, setStateForKey],
  )

  const setShouldInsertMedia = useCallback(
    (value: boolean, key?: NodeKey) =>
      setStateForKey(key || galleryKey, { shouldInsertMedia: value }),
    [galleryKey, setStateForKey],
  )

  const setFiles = useCallback((files: FileResultDataURL[], key?: NodeKey) => {
    const k = key || galleryKey
    const live = useGalleryStore.getState().state
    const prev = live[k]?.files || []

    const fileKey = (file: File) => `${file.name}-${file.size}`

    const merged = [...prev]

    for (const f of files) {
      if (!merged.some((p) => fileKey(p.file) === fileKey(f.file))) {
        merged.push(f)
      }
    }

    setStateForKey(k, { files: merged })
  }, [])

  const clearFiles = useCallback(
    (key?: NodeKey) => setStateForKey(key || galleryKey, { files: [] }),
    [galleryKey, setStateForKey],
  )

  const deleteFile = useCallback(
    (result: string, key?: NodeKey) => {
      const k = key || galleryKey
      const { state } = useGalleryStore.getState()
      const prev = state[k]?.files || []
      const filtered = prev.filter((f) => f.result !== result)
      setStateForKey(k, { files: filtered })
    },
    [galleryKey, setStateForKey],
  )

  const toggleModal = useCallback(
    (key?: NodeKey) => {
      const k = key || galleryKey
      const { state } = useGalleryStore.getState()
      const prev = state[k]?.isModalOpen || false
      setStateForKey(k, { isModalOpen: !prev })
    },
    [galleryKey, setStateForKey],
  )

  return {
    selection: gallery.selection,
    files: gallery.files,
    shouldInsertMedia: gallery.shouldInsertMedia,
    isModalOpen: gallery.isModalOpen,

    clearSelection,
    setSelection,
    deleteSelectionBySlugAndId,
    setShouldInsertMedia,
    setFiles,
    clearFiles,
    deleteFile,
    toggleModal,
  }
}
