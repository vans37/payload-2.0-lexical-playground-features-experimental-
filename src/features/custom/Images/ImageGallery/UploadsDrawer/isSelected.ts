import { ImageDataTypeWithSlug } from '../../Shared/types'

const isSelected = (selection: ImageDataTypeWithSlug[], id: number | string): boolean => {
  return false

  // if (!selection || selection?.length === 0) return false
  // return !!selection?.filter((selection) => selection?.id === id)?.length
}

export default isSelected
