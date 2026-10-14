import { useEditorConfigContext } from '@payloadcms/richtext-lexical'
import { useInternalization } from '../store'
import { useEffect } from 'react'

export const I18nPlugin = (): React.ReactNode => {
  const { setResource } = useInternalization()

  const { editorConfig } = useEditorConfigContext()

  useEffect(() => {
    //load translations from each default feature
    for (const feature of editorConfig?.resolvedFeatureMap?.values()) {
      if (feature && Object.hasOwn(feature, 'translation')) {
        //@ts-ignore
        setResource(feature.translation)
      }
    }
  }, [editorConfig, setResource])

  return null
}
