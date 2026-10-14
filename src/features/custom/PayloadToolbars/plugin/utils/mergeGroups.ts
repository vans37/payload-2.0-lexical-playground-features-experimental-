import { ToolbarGroup } from '../../../../lib/types'

//Merge groups with the same key together
const mergeGroups = (groups: ToolbarGroup[]): ToolbarGroup[] => {
  let merged: ToolbarGroup[] = []

  if (groups && groups.length) {
    for (const group of groups) {
      let foundGroup = merged.find((sanitizedGroup) => sanitizedGroup.key === group.key)
      if (!foundGroup) {
        foundGroup = { ...group, items: [...(group.items || [])] }
        merged.push(foundGroup)
      } else {
        foundGroup.items = foundGroup.items.concat(group.items || [])
      }
    }
  }

  return merged
}

export default mergeGroups
