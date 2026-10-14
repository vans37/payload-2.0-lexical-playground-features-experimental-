import { SlashMenuOption } from '@payloadcms/richtext-lexical'
import { TOGGLE_AI_INPUT_OPEN_COMMAND, TOGGLE_AI_INPUT_OPEN_COMMAND_WITH_SELECTION } from './plugin'
import { AIAdapter } from './plugin/adapters/interface'
import { $isRangeSelection } from 'lexical'
import { toolbarAddDropdownGroupWithItems } from '../../default/Shared/toolbar/addDropdownGroup'
import { ToolbarGroupItem, ToolbarGroup } from '../../lib/types'
import { AIIcon } from '../../lib/ui/icons/AI'
import { Resource } from '../I18n/types'
import { FeatureProviderWithToolbar } from '../../..'

export type AIAssistantFeatureProps = {
  /** New editor instance will be used to display model response (formatted markdown, if model outputs text as markdown) */
  useNestedEditor: boolean
  adapter: AIAdapter
  translation?: Resource
}

export const toolbarAIAssistantGroupWithItems = (items: ToolbarGroupItem[]): ToolbarGroup => {
  return {
    type: 'buttons',
    items,
    key: 'ai_assistant',
    order: 41,
  }
}

export const AIAssistantFeature = (props: AIAssistantFeatureProps): FeatureProviderWithToolbar => {
  return {
    feature: () => {
      return {
        plugins: [
          {
            Component: () =>
              //@ts-ignore
              import('../Shared/TranslationPlugin').then((module) => {
                const plugin = module.default
                return () => plugin('ai_assistant')
              }),
            position: 'normal',
          },
          {
            //@ts-ignore
            Component: () => import('./plugin').then((module) => module.AITextGeneratorPlugin),
            position: 'normal',
          },
        ],
        props,
        slashMenu: {
          options: [
            {
              displayName: ({ i18n }) => i18n.t('ai_assistant:slash_menu_title'),
              key: 'custom',
              options: [
                new SlashMenuOption('AI', {
                  //@ts-ignore
                  Icon: () => import('../../lib/ui/icons/AI').then((module) => module.AIIcon),
                  displayName: ({ i18n }) => i18n.t('ai_assistant:slash_menu_label'),
                  keywords: ['ai', 'generate', 'text'],
                  onSelect: ({ editor }) => {
                    editor.dispatchCommand(TOGGLE_AI_INPUT_OPEN_COMMAND, null)
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
                ChildComponent: AIIcon,
                isEnabled: ({ selection }) => {
                  if (!$isRangeSelection(selection)) {
                    return false
                  }
                  return true
                },
                key: 'ai_assistant',
                label: ({ i18n }) => i18n.t('ai_assistant:label'),
                onSelect: ({ editor }) => {
                  editor.update(() => {
                    editor.dispatchCommand(TOGGLE_AI_INPUT_OPEN_COMMAND, null)
                  })
                },
                order: 22,
              },
            ]),
          ],
        },
        toolbarInline: {
          groups: [
            toolbarAIAssistantGroupWithItems([
              {
                ChildComponent: AIIcon,
                isEnabled: ({ selection }) => {
                  if (!$isRangeSelection(selection)) {
                    return false
                  }
                  return true
                },
                key: 'ai_assistant',
                label: ({ i18n }) => i18n.t('ai_assistant:label'),
                onSelect: ({ editor }) => {
                  editor.update(() => {
                    editor.dispatchCommand(TOGGLE_AI_INPUT_OPEN_COMMAND_WITH_SELECTION, null)
                  })
                },
                order: 22,
              },
            ]),
          ],
        },
      }
    },
    key: 'ai_assistant',
  }
}
