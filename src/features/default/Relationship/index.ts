import { $isRelationshipNode, SlashMenuOption } from '@payloadcms/richtext-lexical'
import { INSERT_RELATIONSHIP_WITH_DRAWER_COMMAND } from './drawer/commands'
import { RelationshipNode } from './nodes/RelationshipNode'
import { relationshipPopulationPromiseHOC } from './populationPromise'
import { toolbarAddDropdownGroupWithItems } from '../Shared/toolbar/addDropdownGroup'
import { $isNodeSelection } from 'lexical'
import { FeatureProviderWithToolbar } from '../../lib/types'
import { RelationshipIcon } from '../../lib/ui/icons/Relationship'
import { i18n } from './i18n'

export type ExclusiveRelationshipFeatureProps =
  | {
      /**
       * The collections that should be disabled. Overrides the `enableRichTextRelationship` property in the collection config.
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
       * The collections that should be enabled. Overrides the `enableRichTextRelationship` property in the collection config
       * When this property is set, `disabledCollections` will not be available.
       **/
      enabledCollections?: string[]
    }

export type RelationshipFeatureProps = ExclusiveRelationshipFeatureProps & {
  /**
   * Sets a maximum population depth for this relationship, regardless of the remaining depth when the respective field is reached.
   * This behaves exactly like the maxDepth properties of relationship and upload fields.
   */
  maxDepth?: number
}

export const RelationshipFeature = (
  props?: RelationshipFeatureProps,
): FeatureProviderWithToolbar => {
  return {
    feature: () => {
      return {
        nodes: [
          {
            type: RelationshipNode.getType(),
            node: RelationshipNode,
            populationPromises: [relationshipPopulationPromiseHOC(props)],
            // TODO: Add validation similar to upload
          },
        ],
        plugins: [
          {
            Component: () =>
              //@ts-ignore
              import('../../custom/Shared/TranslationPlugin').then((module) => {
                const plugin = module.default
                return () => plugin('relationship')
              }),
            position: 'normal',
          },
          {
            Component: () =>
              //@ts-ignore
              import('./plugins').then((module) => {
                const RelationshipPlugin = module.RelationshipPlugin
                return import('payload/utilities').then((module2) =>
                  module2.withMergedProps({
                    Component: RelationshipPlugin,
                    toMergeIntoProps: props,
                  }),
                )
              }),
            position: 'normal',
          },
        ],
        props,
        slashMenu: {
          options: [
            {
              displayName: ({ i18n }) => i18n.t('default_relationship:slash_menu_title'),
              key: 'basic',
              options: [
                new SlashMenuOption('relationship', {
                  Icon: () =>
                    //@ts-ignore
                    import('../../lib/ui/icons/Relationship').then(
                      (module) => module.RelationshipIcon,
                    ),
                  displayName: ({ i18n }) => i18n.t('default_relationship:slash_menu_label'),
                  keywords: ['relationship', 'relation', 'rel'],
                  onSelect: ({ editor }) => {
                    editor.dispatchCommand(INSERT_RELATIONSHIP_WITH_DRAWER_COMMAND, {
                      replace: false,
                    })
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
                ChildComponent: RelationshipIcon,
                isActive: ({ selection }) => {
                  if (!$isNodeSelection(selection) || !selection.getNodes().length) {
                    return false
                  }

                  const firstNode = selection.getNodes()[0]
                  return $isRelationshipNode(firstNode)
                },
                key: 'relationship',
                label: ({ i18n }) => i18n.t('default_relationship:label'),
                onSelect: ({ editor }) => {
                  // dispatch INSERT_RELATIONSHIP_WITH_DRAWER_COMMAND
                  editor.dispatchCommand(INSERT_RELATIONSHIP_WITH_DRAWER_COMMAND, {
                    replace: false,
                  })
                },
              },
            ]),
          ],
        },
        translation: i18n,
      }
    },
    key: 'relationship',
  }
}
