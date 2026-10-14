import { FloatingToolbarSection, FloatingToolbarSectionEntry } from '@payloadcms/richtext-lexical'

export const IndentSectionWithEntries = (
  entries: FloatingToolbarSectionEntry[],
): FloatingToolbarSection => {
  return {
    entries,
    key: 'indent',
    order: 3,
    type: 'buttons',
  }
}
