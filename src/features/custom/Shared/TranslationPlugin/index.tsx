import { useEditorConfigContext } from '@payloadcms/richtext-lexical'
import { useInternalization } from '../../I18n/store'
import { useEffect } from 'react'

const TranslationPlugin = (key: string) => {
  const config = useEditorConfigContext()
  const { setResource } = useInternalization()

  const translation = (config.editorConfig.resolvedFeatureMap.get(key)?.props as any)?.translation

  useEffect(() => {
    if (translation) {
      setResource(translation)
    }
  }, [setResource, translation])

  return null
}

export default TranslationPlugin
