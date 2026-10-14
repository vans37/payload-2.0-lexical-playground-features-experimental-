import { ToolbarGroup, ToolbarGroupItem } from '../../../lib/types'

export const toolbarFormatGroupWithItems = (items: ToolbarGroupItem[]): ToolbarGroup => {
  return {
    type: 'buttons',
    items,
    key: 'format',
    order: 40,
  }
}
