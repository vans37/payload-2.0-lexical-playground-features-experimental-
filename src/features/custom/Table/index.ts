import { TableCellNode, TableNode, TableRowNode } from '@lexical/table'
import { SlashMenuOption } from '@payloadcms/richtext-lexical'
import { TableCellConverter, TableConverter, TableRowConverter } from './converters'
import { INSERT_NEW_TABLE_DIALOG_COMMAND } from './plugin'
import { toolbarAddDropdownGroupWithItems } from '../../default/Shared/toolbar/addDropdownGroup'
import { FeatureProviderWithToolbar } from '../../lib/types'
import { TableIcon } from '../../lib/ui/icons/Table'
import { Resource } from '../I18n/types'

export type TableFeatureProps = {
  translation?: Resource
}

export const TableFeature = (props: TableFeatureProps): FeatureProviderWithToolbar => {
  return {
    feature: () => {
      return {
        nodes: [
          {
            type: TableNode.getType(),
            converters: {
              html: TableConverter,
            },
            node: TableNode,
          },
          {
            type: TableCellNode.getType(),
            converters: {
              html: TableCellConverter,
            },
            node: TableCellNode,
          },
          {
            type: TableRowNode.getType(),
            converters: {
              html: TableRowConverter,
            },
            node: TableRowNode,
          },
        ],
        plugins: [
          {
            Component: () =>
              //@ts-ignore
              import('../Shared/TranslationPlugin').then((module) => {
                const plugin = module.default
                return () => plugin('table')
              }),
            position: 'normal',
          },
          {
            //@ts-ignore
            Component: () => import('./plugin').then((module) => module.TablePlugin),
            position: 'normal',
          },
        ],
        props,
        slashMenu: {
          options: [
            {
              displayName: ({ i18n }) => i18n.t('table:slash_menu_title'),
              key: 'custom',
              options: [
                new SlashMenuOption('Table', {
                  //@ts-ignore
                  Icon: () =>
                    //@ts-ignore
                    import('../../lib/ui/icons/Table').then((module) => module.TableIcon),
                  displayName: ({ i18n }) => i18n.t('table:slash_menu_label'),
                  keywords: ['table'],
                  onSelect: ({ editor }) => {
                    editor.dispatchCommand(INSERT_NEW_TABLE_DIALOG_COMMAND, null)
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
                ChildComponent: TableIcon,
                key: 'Table',
                label: ({ i18n }) => i18n.t('table:label'),
                onSelect: ({ editor }) => {
                  editor.update(() => {
                    editor.dispatchCommand(INSERT_NEW_TABLE_DIALOG_COMMAND, null)
                  })
                },
                order: 22,
              },
            ]),
          ],
        },
      }
    },
    key: 'table',
  }
}
