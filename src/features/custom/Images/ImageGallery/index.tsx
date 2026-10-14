import { SlashMenuOption } from '@payloadcms/richtext-lexical'
import { GalleryConverter, GalleryImageConverter } from './converter'
import { GalleryControlsNode } from './nodes/ControlsNode'
import { GalleryImageNode } from './nodes/ImageNode'
import { CustomGalleryField, GalleryNode } from './nodes/GalleryNode'
import { INSERT_GALLERY_COMMAND } from './plugin'

import { $isRangeSelection, LexicalEditor, NodeKey } from 'lexical'

import { GalleryControllerNode } from './nodes/ControllerNode'
import { Resource } from '../../I18n/types'
import { FeatureProviderWithToolbar } from '../../../lib/types'
import { toolbarAddDropdownGroupWithItems } from '../../../default/Shared/toolbar/addDropdownGroup'
import { GalleryIcon } from '../../../lib/ui/icons/Gallery'

//full props
export type ControlPropsWithField = {
  editor: LexicalEditor
  //TODO: check if user tries to store unserializable value
  /** Serialized value, stored in gallery node */
  fieldValue: CustomGalleryField
  /** Unique field name */
  fieldName: string
  /** Parent gallery to which controls belong / are direct children */
  galleryNode: GalleryNode
  /** Controls decorator node key */
  nodeKey: NodeKey
  /** Status of controls collapsed/expanded */
  controlsExpanded: boolean
  /** Collapse/expand controls */
  setControlsExpanded: (v: boolean) => void
  /** Adds field to gallery instance properties */
  addCustomField: (field: CustomGalleryField) => void
  /** Remove field from gallery instance properties  */
  removeCustomField: () => void
}

//stripped down props if storing custom values in gallery node is not required
export type ControlProps = Omit<
  ControlPropsWithField,
  'fieldValue' | 'fieldName' | 'addCustomField' | 'removeCustomField'
>

export type CustomGalleryControl = {
  /** custom component which will be rendered in expandable gallery controls */
  component: React.FC<ControlPropsWithField | ControlProps>
  /** unique field name */
  fieldName?: string
}

export type GalleryCollectionConfig = {
  /**
   * Base URL for image assets.
   * Example: "https://cdn.example.com" or "https://mybucket.s3.amazonaws.com"
   */
  serverURL: string

  /**
   * If true, skip inserting collection slug in URL path.
   * Useful for external storage (S3, GCS, etc.)
   */
  useCustomURL?: boolean
}

export type GalleryFeatureProps = {
  /**
   * Collection slugs mapped to their URL configs.
   * Example: { media: {...}, uploads: {...} }
   */
  collections: Record<string, GalleryCollectionConfig>

  /**
   * Optional custom gallery controls.
   */
  customControls?: CustomGalleryControl[]

  /**
   * Optional translation resource for UI strings.
   */
  translation?: Resource
}

export const GalleryFeature = (props: GalleryFeatureProps): FeatureProviderWithToolbar => {
  return {
    feature: () => {
      return {
        nodes: [
          {
            //parent node
            type: GalleryNode.getType(),
            converters: {
              html: GalleryConverter,
            },
            node: GalleryNode,
          },
          {
            type: GalleryImageNode.getType(),
            converters: {
              html: GalleryImageConverter,
            },
            node: GalleryImageNode,
          },
          {
            //controls, buttons to select media etc
            type: GalleryControlsNode.getType(),
            converters: {
              html: {
                converter: () => {
                  return ''
                },
                nodeTypes: [GalleryControlsNode.getType()],
              },
            },
            node: GalleryControlsNode,
          },
          {
            //main controller, handling image nodes insertion, deletion etc
            type: GalleryControllerNode.getType(),
            converters: {
              html: {
                converter: () => {
                  return ''
                },
                nodeTypes: [GalleryControllerNode.getType()],
              },
            },
            node: GalleryControllerNode,
          },
        ],
        plugins: [
          {
            Component: () =>
              //@ts-ignore
              import('../../Shared/TranslationPlugin').then((module) => {
                const plugin = module.default
                return () => plugin('gallery')
              }),
            position: 'normal',
          },
          {
            //@ts-ignore
            Component: () => import('./plugin').then((module) => module.GalleryPlugin),
            position: 'bottom',
          },
          {
            //@ts-ignore
            Component: () => import('./plugin/reorder').then((module) => module.default),
            position: 'bottom',
          },
        ],
        props,
        slashMenu: {
          options: [
            {
              displayName: ({ i18n }) => i18n.t('image_gallery:slash_menu_title'),
              key: 'custom',
              options: [
                new SlashMenuOption('Gallery', {
                  Icon: () =>
                    //@ts-ignore
                    import('../../../lib/ui/icons/Gallery').then((module) => module.GalleryIcon),
                  displayName: ({ i18n }) => i18n.t('image_gallery:slash_menu_label'),
                  keywords: ['gallery'],
                  onSelect: ({ editor }) => {
                    editor.dispatchCommand(INSERT_GALLERY_COMMAND, null)
                  },
                }),
              ],
            },
          ],
        },
        toolbarFixed: {
          groups: [
            toolbarAddDropdownGroupWithItems([
              {
                ChildComponent: GalleryIcon,
                isEnabled: ({ selection }) => {
                  if ($isRangeSelection(selection)) {
                    return true
                  }
                  return false
                },
                key: 'image gallery',
                label: ({ i18n }) => i18n.t('image_gallery:label'),
                onSelect: ({ editor }) => {
                  editor.update(() => {
                    editor.dispatchCommand(INSERT_GALLERY_COMMAND, null)
                  })
                },
                order: 21,
              },
            ]),
          ],
        },
      }
    },
    key: 'gallery',
  }
}
