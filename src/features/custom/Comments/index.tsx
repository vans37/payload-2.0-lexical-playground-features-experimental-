import { INSERT_INLINE_COMMAND } from './plugin'
import { MarkNode } from './nodes'
import { ToolbarGroupItem, ToolbarGroup, FeatureProviderWithToolbar } from '../../lib/types'
import { CommentsIcon } from '../../lib/ui/icons/Comments'
import { Resource } from '../I18n/types'

export const toolbarCommentsGroupWithItems = (items: ToolbarGroupItem[]): ToolbarGroup => {
  return {
    type: 'buttons',
    items,
    key: 'comments',
    order: 41,
  }
}

export type CommentsFeatureProps = {
  collection?: string
  translation?: Resource
}

export const CommentsFeature = (props: CommentsFeatureProps): FeatureProviderWithToolbar => {
  return {
    feature: () => {
      return {
        floatingSelectToolbar: {
          sections: [
            {
              entries: [
                {
                  ChildComponent: () =>
                    //@ts-ignore
                    import('../../lib/ui/icons/Comments').then((module) => module.CommentsIcon),
                  order: 3,
                  key: 'add_comment',
                  onClick: ({ editor }) => {
                    editor.dispatchCommand(INSERT_INLINE_COMMAND, undefined)
                  },
                },
              ],
              key: 'add_comment',
              order: 5,
              type: 'buttons',
            },
          ],
        },
        nodes: [
          {
            type: MarkNode.getType(),
            node: MarkNode,
          },
        ],
        plugins: [
          {
            //@ts-ignore
            Component: () => import('./plugin').then((module) => module.default),
            position: 'normal',
          },
        ],
        props,
        toolbarInline: {
          groups: [
            toolbarCommentsGroupWithItems([
              {
                ChildComponent: CommentsIcon,
                isActive: ({ selection }) => {
                  // if (!$isRangeSelection(selection)) {
                  //   return false
                  // }
                  // for (const node of selection.getNodes()) {
                  //   if (!$isQuoteNode(node) && !$isQuoteNode(node.getParent())) {
                  //     return false
                  //   }
                  // }
                  return false
                },
                isEnabled: () => true,
                key: 'comments',
                // label: ({ i18n }) => {
                //   return i18n.t('lexical:blockquote:label')
                // },

                onSelect: ({ editor }) => {
                  editor.update(() => {
                    editor.dispatchCommand(INSERT_INLINE_COMMAND, undefined)
                  })
                },
                order: 22,
              },
            ]),
          ],
        },
      }
    },
    key: 'comments',
  }
}
