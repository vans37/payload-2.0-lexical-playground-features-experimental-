import { INDENT_CONTENT_COMMAND, OUTDENT_CONTENT_COMMAND } from 'lexical'

import { toolbarIndentGroupWithItems } from './toolbarIndentGroup'
import { IndentDecreaseIcon } from '../../lib/ui/icons/IndentDecrease'
import { FeatureProviderWithToolbar, ToolbarGroup } from '../../lib/types'
import { IndentIncreaseIcon } from '../../lib/ui/icons/IndentIncrease'

const toolbarGroups: ToolbarGroup[] = [
  toolbarIndentGroupWithItems([
    {
      ChildComponent: IndentDecreaseIcon,
      isActive: () => false,
      isEnabled: ({ selection }) => {
        if (!selection || !selection?.getNodes()?.length) {
          return false
        }
        for (const node of selection.getNodes()) {
          const parent = node.getParentOrThrow()
          // If at least one node is indented, this should be active
          if (
            ('__indent' in node && (node.__indent as number) > 0) ||
            ('__indent' in parent && parent.__indent > 0)
          ) {
            return true
          }
        }
        return false
      },
      key: 'indentDecrease',
      // label: ({ i18n }) => {
      //   return i18n.t('lexical:indent:decreaseLabel')
      // },
      onSelect: ({ editor }) => {
        editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined)
      },
      order: 1,
    },
    {
      ChildComponent: IndentIncreaseIcon,
      isActive: () => false,
      key: 'indentIncrease',
      label: ({ i18n }) => i18n.t('lexical:indent:increaseLabel'),
      onSelect: ({ editor }) => {
        editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined)
      },
      order: 2,
    },
  ]),
]

export const IndentFeature = (): FeatureProviderWithToolbar => {
  return {
    feature: () => {
      return {
        plugins: [
          {
            //@ts-ignore
            Component: () => import('./plugin').then((module) => module.IndentPlugin),
            position: 'normal',
          },
        ],
        toolbarFixed: {
          groups: toolbarGroups,
        },
        toolbarInline: {
          groups: toolbarGroups,
        },
        props: null,
      }
    },
    key: 'indent',
  }
}
