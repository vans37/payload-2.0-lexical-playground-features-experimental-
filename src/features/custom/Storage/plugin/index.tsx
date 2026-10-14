'use client'

import { useEditorConfigContext } from '@payloadcms/richtext-lexical'
import { useGlobalConfig } from '../../../../globalStore'

export default function GlobalStorage() {
  const { editorConfig, field } = useEditorConfigContext()

  const setGlobalConfig = useGlobalConfig((state) => state.setGlobalConfig)

  setGlobalConfig(editorConfig)

  return null
}
