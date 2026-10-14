import { create } from 'zustand'
import { ImageDataTypeWithSlug } from '../../../Shared/types'

export type UploadsDrawerDocsStore = {
  docs: ImageDataTypeWithSlug[]
  totalDocs: number
  limit: number
  currentPage: number

  setDocs: (docs: ImageDataTypeWithSlug[]) => void
  setTotalDocs: (total: number) => void
  setLimit: (limit: number) => void
  setCurrentPage: (page: number) => void
}

export const useUploadsDrawerDocsStore = create<UploadsDrawerDocsStore>((set) => ({
  docs: [],
  totalDocs: 0,
  limit: 10,
  currentPage: 1,

  setDocs: (docs) => set({ docs }),
  setTotalDocs: (totalDocs) => set({ totalDocs }),
  setLimit: (limit) => set({ limit }),
  setCurrentPage: (currentPage) => set({ currentPage }),
}))
