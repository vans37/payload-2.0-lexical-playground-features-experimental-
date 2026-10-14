import { GalleryFeatureProps } from '../../../custom/Images/ImageGallery'
import {
  AppendParagraphAfterControl,
  AppendParagraphBeforeControl,
  GalleryLayoutControls,
  RemoveAllImagesControl,
  RemoveGalleryControl,
} from './controls'
import { i18n } from './i18n'

const galleryProps: GalleryFeatureProps = {
  collections: {},
  customControls: [
    {
      component: RemoveGalleryControl,
    },
    {
      component: RemoveAllImagesControl,
    },
    {
      component: AppendParagraphBeforeControl,
    },
    {
      component: AppendParagraphAfterControl,
    },
    {
      component: GalleryLayoutControls,
      fieldName: 'layout',
    },
  ],
  translation: i18n,
}

export default galleryProps
