import { ToolbarGroup, ToolbarGroupItem } from '../../../lib/types'

export const toolbarFeatureButtonsGroupWithItems = (items: ToolbarGroupItem[]): ToolbarGroup => {
  return {
    type: 'buttons',
    items,
    key: 'features',
    order: 50,
  }
}
