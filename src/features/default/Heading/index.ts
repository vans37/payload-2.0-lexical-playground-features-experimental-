import type { HeadingTagType, SerializedHeadingNode } from '@lexical/rich-text'

import { $createHeadingNode, $isHeadingNode, HeadingNode } from '@lexical/rich-text'
import { $setBlocksType } from '@lexical/selection'
import { $getSelection, $isRangeSelection } from 'lexical'

import { MarkdownTransformer } from './markdownTransformer'
import {
  FeatureProviderWithToolbar,
  ToolbarGroup,
  ToolbarGroupItem,
} from '../../../features/lib/types'
import {
  convertLexicalNodesToHTML,
  HTMLConverter,
  SlashMenuOption,
} from '@payloadcms/richtext-lexical'

import { toolbarTextDropdownGroupWithItems } from '../../custom/PayloadToolbars/plugin/textDropdownGroup'
import { H1Icon } from '../../lib/ui/icons/H1'
import { H2Icon } from '../../lib/ui/icons/H2'
import { H3Icon } from '../../lib/ui/icons/H3'
import { H4Icon } from '../../lib/ui/icons/H4'
import { H5Icon } from '../../lib/ui/icons/H5'
import { H6Icon } from '../../lib/ui/icons/H6'
import { i18n } from './i18n'

const setHeading = (headingSize: HeadingTagType) => {
  const selection = $getSelection()
  $setBlocksType(selection, () => $createHeadingNode(headingSize))
}

export type HeadingFeatureProps = {
  enabledHeadingSizes?: HeadingTagType[]
}

const iconImports = {
  h1: H1Icon,
  h2: H2Icon,
  h3: H3Icon,
  h4: H4Icon,
  h5: H5Icon,
  h6: H6Icon,
}

const iconImportsDynamic = {
  //@ts-ignore
  h1: () => import('../../lib/ui/icons/H1').then((module) => module.H1Icon),
  //@ts-ignore
  h2: () => import('../../lib/ui/icons/H2').then((module) => module.H2Icon),
  //@ts-ignore
  h3: () => import('../../lib/ui/icons/H3').then((module) => module.H3Icon),
  //@ts-ignore
  h4: () => import('../../lib/ui/icons/H4').then((module) => module.H4Icon),
  //@ts-ignore
  h5: () => import('../../lib/ui/icons/H5').then((module) => module.H5Icon),
  //@ts-ignore
  h6: () => import('../../lib/ui/icons/H6').then((module) => module.H6Icon),
}

const $setHeading = (headingSize: HeadingTagType) => {
  const selection = $getSelection()
  $setBlocksType(selection, () => $createHeadingNode(headingSize))
}

export const HeadingFeature = (props: HeadingFeatureProps): FeatureProviderWithToolbar => {
  const { enabledHeadingSizes = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] } = props
  const toolbarGroups: ToolbarGroup[] = [
    toolbarTextDropdownGroupWithItems(
      enabledHeadingSizes.map((headingSize, i) => {
        return {
          ChildComponent: iconImports[headingSize],
          isActive: ({ selection }) => {
            if (!$isRangeSelection(selection)) {
              return false
            }
            for (const node of selection.getNodes()) {
              if ($isHeadingNode(node) && node.getTag() === headingSize) {
                continue
              }

              const parent = node.getParent()
              if ($isHeadingNode(parent) && parent.getTag() === headingSize) {
                continue
              }

              return false
            }
            return true
          },
          key: headingSize,
          label: ({ i18n }) =>
            i18n.t('default_heading:label', { headingLevel: headingSize.charAt(1) }),
          onSelect: ({ editor }) => {
            editor.update(() => {
              $setHeading(headingSize)
            })
          },
          order: i + 2,
        }
      }),
    ),
  ]

  return {
    feature: () => {
      return {
        markdownTransformers: [MarkdownTransformer(enabledHeadingSizes)],
        nodes: [
          {
            type: HeadingNode.getType(),
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

                  return '<' + node?.tag + '>' + childrenText + '</' + node?.tag + '>'
                },
                nodeTypes: [HeadingNode.getType()],
              } as HTMLConverter<SerializedHeadingNode>,
            },
            node: HeadingNode,
          },
        ],
        props,
        slashMenu: {
          options: [
            ...enabledHeadingSizes.map((headingSize) => {
              return {
                displayName: ({ i18n }) => i18n.t('default_heading:slash_menu_title'),
                key: 'basic',
                options: [
                  new SlashMenuOption(`heading-${headingSize.charAt(1)}`, {
                    Icon: iconImportsDynamic[headingSize],
                    displayName: ({ i18n }) =>
                      i18n.t('default_heading:slash_menu_label', {
                        headingLevel: headingSize.charAt(1),
                      }),
                    keywords: ['heading', headingSize],
                    onSelect: () => {
                      setHeading(headingSize)
                    },
                  }),
                ],
              }
            }),
          ],
        },
        toolbarFixed: {
          groups: enabledHeadingSizes?.length ? toolbarGroups : [],
        },
        toolbarInline: {
          groups: enabledHeadingSizes?.length ? toolbarGroups : [],
        },
        translation: i18n,
      }
    },
    key: 'heading',
  }
}
