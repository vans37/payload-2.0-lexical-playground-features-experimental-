'use client'
import { ToolbarGroup, ToolbarGroupItem } from '../../lib/types'

export const toolbarIndentGroupWithItems = (items: ToolbarGroupItem[]): ToolbarGroup => {
  return {
    type: 'buttons',
    items,
    key: 'indent',
    order: 35,
  }
}
