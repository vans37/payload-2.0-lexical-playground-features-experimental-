import type { Block, BlockField, Field } from 'payload/types'

import { baseBlockFields, sanitizeFields } from 'payload/config'
import { fieldsToJSONSchema, formatLabels, getTranslation } from 'payload/utilities'

import { BlockNode } from './nodes/BlocksNode'
import { INSERT_BLOCK_COMMAND } from './plugin/commands'
import { blockPopulationPromiseHOC } from './populationPromise'
import { blockValidationHOC } from './validate'
import { cloneDeep, SlashMenuOption } from '@payloadcms/richtext-lexical'
import { FeatureProviderWithToolbar, ToolbarGroupItem, ToolbarGroup } from '../../lib/types'
import { BlockIcon } from '../../lib/ui/icons/Block'

export type BlocksFeatureProps = {
  blocks?: Block[]
  //inlineBlocks?: Block[]  maybe port this later
}

export const BlocksFeature = (props: BlocksFeatureProps): FeatureProviderWithToolbar => {
  // Sanitization taken from payload/src/fields/config/sanitize.ts
  if (props?.blocks?.length) {
    props.blocks = props.blocks.map((block) => {
      const blockCopy = cloneDeep(block)

      blockCopy.fields = blockCopy.fields.concat(baseBlockFields)
      blockCopy.labels = !blockCopy.labels ? formatLabels(blockCopy.slug) : blockCopy.labels
      return blockCopy
    })
    //  unsanitizedBlock.fields are sanitized in the React component and not here.
    // That's because we do not have access to the payload config here.
  }
  return {
    feature: () => {
      return {
        generatedTypes: {
          modifyOutputSchema: ({
            collectionIDFieldTypes,
            config,
            currentSchema,
            field,
            interfaceNameDefinitions,
            payload,
          }) => {
            if (!props?.blocks?.length) {
              return currentSchema
            }

            // sanitize blocks
            const validRelationships = config?.collections?.map((c) => c.slug) || []

            const sanitizedBlocks = props.blocks.map((block) => {
              const blockCopy = cloneDeep(block)
              return {
                ...blockCopy,
                fields: sanitizeFields({
                  config,
                  fields: blockCopy.fields,
                  requireFieldLevelRichTextEditor: true,
                  validRelationships,
                }),
              }
            })

            const blocksField: BlockField = {
              name: field?.name + '_lexical_blocks',
              type: 'blocks',
              blocks: sanitizedBlocks,
            }

            // This is only done so that interfaceNameDefinitions sets those block's interfaceNames.
            // we don't actually use the JSON Schema itself in the generated types yet.
            fieldsToJSONSchema(
              collectionIDFieldTypes,
              [blocksField],
              interfaceNameDefinitions,
              payload,
              config,
            )

            return currentSchema
          },
        },
        nodes: [
          {
            type: BlockNode.getType(),
            node: BlockNode,
            populationPromises: [blockPopulationPromiseHOC(props)],
            validations: [blockValidationHOC(props)],
          },
        ],
        plugins: [
          {
            //@ts-ignore
            Component: () => import('./plugin').then((module) => module.BlocksPlugin),
            position: 'normal',
          },
        ],
        props,
        slashMenu: {
          options: [
            {
              displayName: 'Blocks',
              key: 'blocks',
              options: [
                ...props.blocks.map((block) => {
                  return new SlashMenuOption('block-' + block.slug, {
                    Icon: () =>
                      //@ts-ignore
                      import('../../lib/ui/icons/Block').then((module) => module.BlockIcon),
                    displayName: ({ i18n }) => {
                      return getTranslation(block.labels.singular, i18n)
                    },
                    keywords: ['block', 'blocks', block.slug],
                    onSelect: ({ editor }) => {
                      editor.dispatchCommand(INSERT_BLOCK_COMMAND, {
                        id: null,
                        blockName: '',
                        blockType: block.slug,
                      })
                    },
                  })
                }),
              ],
            },
          ],
        },
        toolbarFixed: {
          groups: [
            props.blocks?.length
              ? {
                  type: 'dropdown',
                  ChildComponent: BlockIcon,
                  items: props.blocks.map((block, index) => {
                    return {
                      ChildComponent: BlockIcon,
                      isActive: undefined, // At this point, we would be inside a sub-richtext-editor. And at this point this will be run against the focused sub-editor, not the parent editor which has the actual block. Thus, no point in running this
                      key: 'block-' + block.slug,
                      // label: ({ i18n, richTextComponentMap }) => {
                      //   if (!richTextComponentMap) {
                      //     return blockSlug
                      //   }
                      //   const componentMapRenderedBlockPath = `lexical_internal_feature.blocks.fields.lexical_blocks`
                      //   const blocksField: BlocksFieldClient = richTextComponentMap.get(
                      //     componentMapRenderedBlockPath,
                      //   )?.[0]

                      //   const clientBlock = blocksField.blocks.find(
                      //     (_block) => _block.slug === blockSlug,
                      //   )

                      //   const blockDisplayName = clientBlock?.labels?.singular
                      //     ? getTranslation(clientBlock.labels.singular, i18n)
                      //     : clientBlock?.slug

                      //   return blockDisplayName
                      // },
                      onSelect: ({ editor }) => {
                        editor.dispatchCommand(INSERT_BLOCK_COMMAND, {
                          id: null,
                          blockName: '',
                          blockType: block.slug,
                        })
                      },
                      order: index,
                    } as ToolbarGroupItem
                  }),
                  key: 'blocks',
                  order: 20,
                }
              : null,
          ].filter(Boolean) as ToolbarGroup[],
        },
      }
    },
    key: 'blocks',
  }
}
