import { ToolbarGroupItem, ToolbarGroup } from '../../../lib/types'
import { TextIcon } from '../../../lib/ui/icons/Text'

export const toolbarTextDropdownGroupWithItems = (items: ToolbarGroupItem[]): ToolbarGroup => {
  return {
    type: 'dropdown',
    ChildComponent: TextIcon,
    items,
    key: 'text',
    order: 25,
  }
}
