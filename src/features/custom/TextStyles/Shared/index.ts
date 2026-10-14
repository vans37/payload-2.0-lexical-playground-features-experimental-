import { ToolbarGroup, ToolbarGroupItem } from '../../../lib/types'

export const toolbarTextStylesGroupWithItems = (items: ToolbarGroupItem[]): ToolbarGroup => {
  return {
    type: 'buttons',
    items,
    key: 'text_format',
    order: 50,
  }
}
