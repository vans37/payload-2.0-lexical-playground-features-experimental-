import { SanitizedEditorConfig } from '@payloadcms/richtext-lexical'
import { create } from 'zustand'

export type DefaultLexicalConfig = {
  defaultLexicalConfig: SanitizedEditorConfig | null
}

export type ConfigActions = {
  setGlobalConfig: (config: SanitizedEditorConfig) => void
}

export const useGlobalConfig = create<DefaultLexicalConfig & ConfigActions>((set) => ({
  defaultLexicalConfig: null,
  setGlobalConfig: (config) => set(() => ({ defaultLexicalConfig: config })),
}))
