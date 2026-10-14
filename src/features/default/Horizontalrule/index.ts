import type { HTMLConverter } from '../converters/html/converter/types'
import type { SerializedHorizontalRuleNode } from './nodes/HorizontalRuleNode'

import {
  $isHorizontalRuleNode,
  HorizontalRuleNode,
  INSERT_HORIZONTAL_RULE_COMMAND,
} from './nodes/HorizontalRuleNode'

import { toolbarAddDropdownGroupWithItems } from '../Shared/toolbar/addDropdownGroup'

import { $isNodeSelection } from 'lexical'
import { SlashMenuOption } from '@payloadcms/richtext-lexical'
import { FeatureProviderWithToolbar } from '../../lib/types'
import { HorizontalRuleIcon } from '../../lib/ui/icons/HorizontalRule'
import { i18n } from './i18n'

export const HorizontalRuleFeature = (): FeatureProviderWithToolbar => {
  return {
    feature: () => {
      return {
        /**
         * Define the nodes that this feature provides. Nodes define how the node is rendered in the lexical editor, what data is saved, and other lexical node behavior.
         */
        nodes: [
          {
            type: HorizontalRuleNode.getType(),
            converters: {
              html: {
                converter: () => {
                  return `<hr/>`
                },
                nodeTypes: [HorizontalRuleNode.getType()],
              } as HTMLConverter<SerializedHorizontalRuleNode>,
            },
            node: HorizontalRuleNode,
          },
        ],
        /**
         * Plugins are React components which can interact with the lexical API. This one specifically registers the INSERT_HORIZONTAL_RULE_COMMAND command and defines the behavior for when it is called.
         */
        plugins: [
          {
            //@ts-ignore
            Component: () => import('./plugin').then((module) => module.HorizontalRulePlugin),
            position: 'normal',
          },
        ],
        props: null,
        /**
         * Add a new slash menu option for inserting a horizontal rule. When running /hr in the editor, the user will be able to insert a horizontal rule. This runs the onSelect function when the option is selected.
         * Inside onSelect, we run the INSERT_HORIZONTAL_RULE_COMMAND command whose behavior is defined in the plugin.
         */
        slashMenu: {
          options: [
            {
              displayName: ({ i18n }) => i18n.t('default_horizontalrule:slash_menu_title'),
              key: 'basic',
              options: [
                new SlashMenuOption(`horizontalrule`, {
                  Icon: () =>
                    //@ts-ignore
                    import('../../lib/ui/icons/HorizontalRule').then(
                      (module) => module.HorizontalRuleIcon,
                    ),
                  displayName: ({ i18n }) => i18n.t('default_horizontalrule:slash_menu_label'),
                  keywords: ['hr', 'horizontal rule', 'line', 'separator'],
                  onSelect: ({ editor }) => {
                    editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined)
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
                ChildComponent: HorizontalRuleIcon,
                isActive: ({ selection }) => {
                  if (!$isNodeSelection(selection) || !selection.getNodes().length) {
                    return false
                  }

                  const firstNode = selection.getNodes()[0]
                  return $isHorizontalRuleNode(firstNode)
                },
                key: 'horizontalRule',
                label: ({ i18n }) => i18n.t('default_horizontalrule:label'),
                onSelect: ({ editor }) => {
                  editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined)
                },
              },
            ]),
          ],
        },
        translation: i18n,
      }
    },
    key: 'horizontalrule',
  }
}
