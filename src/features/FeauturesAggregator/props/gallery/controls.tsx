import { $createParagraphNode } from 'lexical'
import React, { useEffect, useState } from 'react'

import { Button } from 'payload/components'

import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection'
import './index.scss'
import { useTranslation } from 'react-i18next'
import { useInternalization } from '../../../custom/I18n/store'
import { ControlProps, ControlPropsWithField } from '../../../custom/Images/ImageGallery'

import { $isGalleryImageNode } from '../../../custom/Images/ImageGallery/nodes/ImageNode'
import { useGallery } from '../../../custom/Images/ImageGallery/store'

export type CustomGalleryField = {
  name: string
  props: Record<string, any>
}

/* 
    Optional and can be removed by user;
    see: https://react-photo-album.com/
    this library I use on my frontend to handle galleries.
    Base lexical frontend parser does support this library.
*/

const GALLERY_LAYOUTS = ['rows', 'columns', 'masonry'] as const
const columns = Array.from({ length: 10 }).map((_, i) => i + 1)

export const GalleryLayoutControls = ({
  fieldValue,
  fieldName,
  addCustomField,
  nodeKey,
}: ControlPropsWithField) => {
  const defaultLayout = 'columns'
  const defaultColumns = '3'
  const [value, setValue] = useState(fieldValue?.props?.layout || defaultLayout)
  const [cols, setCols] = useState(fieldValue?.props?.columns || defaultColumns)
  const { t, i18n } = useTranslation('image_gallery')

  useInternalization()

  useEffect(() => {
    const field: CustomGalleryField = {
      name: fieldName,
      props: {
        layout: value,
        ...(value !== 'rows' ? { columns: cols } : {}),
      },
    }
    addCustomField(field)
  }, [value, cols, addCustomField, fieldName])

  const handleLayoutChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValue(e.target.value)
  }

  const handleColumnsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCols(e.target.value)
  }

  return (
    <div className="layout">
      <div className="layout-select">
        <label htmlFor={`layout`}>{t('gallery_controls.layout')}</label>
        <select id={`layout`} value={value} onChange={handleLayoutChange}>
          {GALLERY_LAYOUTS.map((layout, index) => (
            <option key={index} value={layout}>
              {layout}
            </option>
          ))}
        </select>
      </div>
      {value !== 'rows' && (
        <div className="columns-select">
          <label htmlFor={`columns-${nodeKey}`}>{t('gallery_controls.columns')}</label>
          <select id={`columns-${nodeKey}`} value={cols} onChange={handleColumnsChange}>
            {columns.map((col, index) => {
              return (
                <option value={col} key={index}>
                  {col}
                </option>
              )
            })}
          </select>
        </div>
      )}
    </div>
  )
}

//Optional, delete gallery node
export const RemoveGalleryControl = ({ editor, galleryNode, nodeKey }: ControlProps) => {
  const { t } = useTranslation('image_gallery')

  useInternalization()

  const handleDeleteGallery = () => {
    if (editor && galleryNode) {
      editor.update(() => {
        const p = $createParagraphNode()
        galleryNode.replace(p)
        p.select()
      })
    }
  }

  return <Button onClick={handleDeleteGallery}>{t('gallery_controls.delete')}</Button>
}

//Optional, clear all image nodes
export const RemoveAllImagesControl = ({ editor, galleryNode, nodeKey }: ControlProps) => {
  const { clearSelection: clearGallerySelection, clearFiles } = useGallery(galleryNode.__key)
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey)

  const { t } = useTranslation('image_gallery')

  useInternalization()

  const handleClearImages = (e: React.MouseEvent) => {
    //important
    e.stopPropagation()
    editor.update(() => {
      const children = galleryNode.getChildren()
      children.forEach((child) => {
        if ($isGalleryImageNode(child)) {
          child.remove()
        }
      })
      clearGallerySelection(galleryNode.__key)
      clearFiles(galleryNode.__key)
    })
    clearSelection()
    setSelected(true)
  }

  return <Button onClick={handleClearImages}>{t('gallery_controls.clear')}</Button>
}

//Optional, in case selection gets trapped append p node before gallery
export const AppendParagraphBeforeControl = ({ editor, galleryNode, nodeKey }: ControlProps) => {
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey)

  const { t } = useTranslation('image_gallery')

  useInternalization()

  const handleAppendParagraphBefore = (e: React.MouseEvent) => {
    clearSelection()
    editor.update(() => {
      const p = $createParagraphNode()
      galleryNode.insertBefore(p)
      p.select()
    })
  }

  return (
    <Button onClick={handleAppendParagraphBefore}>{t('gallery_controls.append_p_before')}</Button>
  )
}

//Optional, in case selection gets trapped append p node after gallery
export const AppendParagraphAfterControl = ({ editor, galleryNode, nodeKey }: ControlProps) => {
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey)

  const { t } = useTranslation('image_gallery')

  useInternalization()

  const handleAppendParagraphAfter = (e: React.MouseEvent) => {
    clearSelection()
    editor.update(() => {
      const p = $createParagraphNode()
      galleryNode.insertAfter(p)
      p.select()
    })
  }

  return (
    <Button onClick={handleAppendParagraphAfter}>{t('gallery_controls.append_p_after')}</Button>
  )
}
