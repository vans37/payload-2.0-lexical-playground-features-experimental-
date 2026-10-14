import {
  FloatingToolbarSection,
  FloatingToolbarSectionEntry,
} from '@payloadcms/richtext-lexical/dist/field/lexical/plugins/FloatingSelectToolbar/types'

export const FeaturesSectionWithEntries = (
  entries: FloatingToolbarSectionEntry[],
): FloatingToolbarSection => {
  return {
    entries,
    key: 'features',
    order: 5,
    type: 'buttons',
  }
}
