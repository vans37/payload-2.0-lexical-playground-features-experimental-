export type Props = {
  isCurrent?: boolean
  isFirstPage?: boolean
  isLastPage?: boolean
  isDisabled?: boolean
  page?: number
  updatePage?: (page) => void
}
