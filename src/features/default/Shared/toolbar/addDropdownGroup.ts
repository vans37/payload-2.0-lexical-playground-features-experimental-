import { ToolbarGroup, ToolbarGroupItem } from '../../../lib/types'
import { AddIcon } from '../../../lib/ui/icons/Add'

export const toolbarAddDropdownGroupWithItems = (items: ToolbarGroupItem[]): ToolbarGroup => {
  return {
    type: 'dropdown',
    ChildComponent: AddIcon,
    items,
    key: 'add',
    order: 10,
  }
}
