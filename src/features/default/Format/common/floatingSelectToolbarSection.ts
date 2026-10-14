import { FloatingToolbarSectionEntry, FloatingToolbarSection } from '@payloadcms/richtext-lexical'

export const SectionWithEntries = (
  entries: FloatingToolbarSectionEntry[],
): FloatingToolbarSection => {
  return {
    entries,
    key: 'format',
    order: 4,
    type: 'buttons',
  }
}
