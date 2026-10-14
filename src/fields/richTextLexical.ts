import { lexicalEditor, type LexicalRichTextAdapter } from '@payloadcms/richtext-lexical'
import type { Field, FieldHook } from 'payload/types'
import { EnabledFeatures, FeaturesAggregator } from '../features/FeauturesAggregator'
import { uploadImagesHook } from '../features/custom/UploadImages/fieldHook'
import { theme } from '../features/lib/LexicalEditorTheme'
import deepMerge from '../features/lib/utils/deepMerge'
import { commentsHook } from '../features/custom/Comments/fieldHook'

export interface RichTextProps {
  fieldName: string
  editor?: LexicalRichTextAdapter
  hooks?: {
    afterChange?: FieldHook[]
    afterRead?: FieldHook[]
    beforeChange?: FieldHook[]
    beforeValidate?: FieldHook[]
  }
  featureProps?: EnabledFeatures
  uploadImageHook: {
    enabled: boolean
    uploadCollection: string
  }
}

export const richText = (props: RichTextProps, overWrites = {}) => {
  const field: Field = {
    name: props.fieldName,
    type: 'richText',
    editor: lexicalEditor({
      features: () => {
        return [...FeaturesAggregator(props?.featureProps)]
      },
      lexical: {
        namespace: 'lexical',
        theme,
      },
    }),
    ...(props?.uploadImageHook?.enabled
      ? {
          hooks: {
            ...(props?.hooks || {}),
            beforeChange: [
              ...(props?.hooks?.beforeChange || []),
              async (args) => uploadImagesHook(args, props.uploadImageHook.uploadCollection),
              async (args) => commentsHook(args),
            ],
          },
        }
      : {
          hooks: {
            ...(props?.hooks || {}),
          },
        }),
  }

  return deepMerge(field, overWrites)
}
