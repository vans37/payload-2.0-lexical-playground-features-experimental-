import type { SanitizedConfig } from 'payload/config'
import type { Field } from 'payload/types'

import { $findMatchingParent } from '@lexical/utils'
import { $getSelection, $isRangeSelection } from 'lexical'

import type { HTMLConverter } from '../converters/html/converter/types'
import type { SerializedAutoLinkNode } from './nodes/AutoLinkNode'
import type { LinkFields, SerializedLinkNode } from './nodes/LinkNode'

import { convertLexicalNodesToHTML } from '../converters/html/converter'
import { AutoLinkNode } from './nodes/AutoLinkNode'
import { $isLinkNode, LinkNode, TOGGLE_LINK_COMMAND } from './nodes/LinkNode'
import { TOGGLE_LINK_WITH_MODAL_COMMAND } from './plugins/floatingLinkEditor/LinkEditor/commands'
import { linkPopulationPromiseHOC } from './populationPromise'

import { toolbarFeatureButtonsGroupWithItems } from '../Shared/toolbar/featureButtonsGroup'
import { getSelectedNode } from '@payloadcms/richtext-lexical'
import { FeatureProviderWithToolbar, ToolbarGroup } from '../../lib/types'
import { LinkIcon } from '../../lib/ui/icons/Link'

type ExclusiveLinkCollectionsProps =
  | {
      /**
       * The collections that should be disabled for internal linking. Overrides the `enableRichTextLink` property in the collection config.
       * When this property is set, `enabledCollections` will not be available.
       **/
      disabledCollections?: string[]

      // Ensures that enabledCollections is not available when disabledCollections is set
      enabledCollections?: never
    }
  | {
      // Ensures that disabledCollections is not available when enabledCollections is set
      disabledCollections?: never

      /**
       * The collections that should be enabled for internal linking. Overrides the `enableRichTextLink` property in the collection config
       * When this property is set, `disabledCollections` will not be available.
       **/
      enabledCollections?: string[]
    }

export type LinkFeatureProps = ExclusiveLinkCollectionsProps & {
  /**
   * A function or array defining additional fields for the link feature. These will be
   * displayed in the link editor drawer.
   */
  fields?: ((args: { config: SanitizedConfig; defaultFields: Field[] }) => Field[]) | Field[]
  /**
   * Sets a maximum population depth for the internal doc default field of link, regardless of the remaining depth when the field is reached.
   * This behaves exactly like the maxDepth properties of relationship and upload fields.
   */
  maxDepth?: number
}

const toolbarGroups: ToolbarGroup[] = [
  toolbarFeatureButtonsGroupWithItems([
    {
      ChildComponent: LinkIcon,
      isActive: ({ selection }) => {
        if ($isRangeSelection(selection)) {
          const selectedNode = getSelectedNode(selection)
          const linkParent = $findMatchingParent(selectedNode, $isLinkNode)
          return linkParent != null
        }
        return false
      },
      isEnabled: ({ selection }) => {
        return !!($isRangeSelection(selection) && $getSelection()?.getTextContent()?.length)
      },
      key: 'link',
      label: ({ i18n }) => i18n.t('lexical:link:label'),
      onSelect: ({ editor, isActive }) => {
        if (!isActive) {
          let selectedText: string | undefined
          editor.getEditorState().read(() => {
            selectedText = $getSelection()?.getTextContent()
          })

          if (!selectedText?.length) {
            return
          }

          const linkFields: LinkFields = {
            doc: null,
            linkType: 'custom',
            newTab: false,
            url: 'https://',
          }

          editor.dispatchCommand(TOGGLE_LINK_WITH_MODAL_COMMAND, {
            fields: linkFields,
            text: selectedText,
          })
        } else {
          // remove link
          editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)
        }
      },
      order: 1,
    },
  ]),
]

export const LinkFeature = (props: LinkFeatureProps): FeatureProviderWithToolbar => {
  return {
    feature: () => {
      return {
        nodes: [
          {
            type: LinkNode.getType(),
            converters: {
              html: {
                converter: async ({ converters, node, parent }) => {
                  const childrenText = await convertLexicalNodesToHTML({
                    converters,
                    lexicalNodes: node.children,
                    parent: {
                      ...node,
                      parent,
                    },
                  })
                  const rel: string = node.fields.newTab ? ' rel="noopener noreferrer"' : ''
                  const href: string =
                    node.fields.linkType === 'custom'
                      ? node.fields.url
                      : (node.fields.doc?.value as string)
                  return `<a href="${href}"${rel}>${childrenText}</a>`
                },
                nodeTypes: [LinkNode.getType()],
              } as HTMLConverter<SerializedLinkNode>,
            },
            node: LinkNode,
            populationPromises: [linkPopulationPromiseHOC(props)],
            // TODO: Add validation similar to upload for internal links and fields
          },
          {
            type: AutoLinkNode.getType(),
            converters: {
              html: {
                converter: async ({ converters, node, parent }) => {
                  const childrenText = await convertLexicalNodesToHTML({
                    converters,
                    lexicalNodes: node.children,
                    parent: {
                      ...node,
                      parent,
                    },
                  })
                  const rel: string = node.fields.newTab ? ' rel="noopener noreferrer"' : ''
                  let href: string = node.fields.url
                  if (node.fields.linkType === 'internal') {
                    href =
                      typeof node.fields.doc?.value === 'string'
                        ? node.fields.doc?.value
                        : node.fields.doc?.value?.id
                  }
                  return `<a href="${href}"${rel}>${childrenText}</a>`
                },
                nodeTypes: [AutoLinkNode.getType()],
              } as HTMLConverter<SerializedAutoLinkNode>,
            },
            node: AutoLinkNode,
            populationPromises: [linkPopulationPromiseHOC(props)],
          },
        ],
        plugins: [
          {
            Component: () =>
              // @ts-expect-error
              import('./plugins/link').then((module) => module.LinkPlugin),
            position: 'normal',
          },
          {
            Component: () =>
              // @ts-expect-error
              import('./plugins/autoLink').then((module) => module.AutoLinkPlugin),
            position: 'normal',
          },
          {
            Component: () =>
              // @ts-expect-error
              import('./plugins/clickableLink').then((module) => module.ClickableLinkPlugin),
            position: 'normal',
          },
          {
            Component: () =>
              // @ts-expect-error
              import('./plugins/floatingLinkEditor').then((module) => {
                const floatingLinkEditorPlugin = module.FloatingLinkEditorPlugin
                return floatingLinkEditorPlugin
                //TODO: some issue with floating anchor when merging props
                // return import('payload/utilities').then((module) =>
                //   module.withMergedProps({
                //     Component: floatingLinkEditorPlugin,
                //     toMergeIntoProps: props,
                //   }),
                // )
              }),
            position: 'floatingAnchorElem',
          },
        ],
        props,
        toolbarFixed: {
          groups: toolbarGroups,
        },
        toolbarInline: {
          groups: toolbarGroups,
        },
      }
    },
    key: 'test',
  }
}
