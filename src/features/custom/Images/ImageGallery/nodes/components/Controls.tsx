import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CustomGalleryField } from '../GalleryNode'
import { GalleryNode } from '../GalleryNode'
import type { NodeKey } from 'lexical'
import { $getSelection, SELECTION_CHANGE_COMMAND, COMMAND_PRIORITY_LOW } from 'lexical'
import { Button } from 'payload/components/elements'
import { useModal } from '@faceless-ui/modal'
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection'
import { useEditorConfigContext } from '@payloadcms/richtext-lexical'
import { GalleryFeatureProps } from '../..'
import { mergeRegister } from '@lexical/utils'
import './controls.scss'
import { useInternalization } from '../../../../I18n/store'

const ControlsComponent = ({
  nodeKey,
  galleryNode,
}: {
  nodeKey: NodeKey
  galleryNode: GalleryNode
}) => {
  //each slug must be unique in order to insert uploads
  //into the right gallery node
  const selectImageDrawerslug = galleryNode.__selectImageDrawerSlug

  return (
    <React.Fragment>
      <ExpandableControls
        selectImageDrawerSlug={selectImageDrawerslug}
        galleryNode={galleryNode}
        nodeKey={nodeKey}
      />
    </React.Fragment>
  )
}

const ExpandableControls = ({
  galleryNode,
  nodeKey,
  selectImageDrawerSlug,
}: {
  galleryNode: GalleryNode
  nodeKey: NodeKey
  selectImageDrawerSlug: string
}) => {
  const [editor] = useLexicalComposerContext()
  const { editorConfig } = useEditorConfigContext()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey)

  const { t } = useInternalization('image_gallery')
  const controlsWrapperRef = useRef<HTMLDivElement>(null)
  const expandBtnRef = useRef<HTMLButtonElement>(null)

  //custom controls
  const customControls = (
    editorConfig.resolvedFeatureMap.get('gallery').props as GalleryFeatureProps
  )?.customControls

  const { toggleModal: toggleSelectDrawer, closeModal } = useModal()

  useEffect(() => {
    const unregister = mergeRegister(
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          const selection = $getSelection()
          if (selection) {
            const nodes = selection.getNodes()
            nodes.forEach((node) => {
              if (node.__key === nodeKey) {
                setSelected(true)
              }
            })
          }
          return false
        },
        COMMAND_PRIORITY_LOW,
      ),
    )

    return () => {
      unregister()
    }
  }, [editor])

  useEffect(() => {
    if (controlsWrapperRef.current) {
      const controls = controlsWrapperRef.current?.parentElement
      const galleryElement = editor.getElementByKey(galleryNode.getKey())

      if (controls && galleryElement) {
        const updateControlsPosition = () => {
          controls.style.top = `${galleryElement.scrollTop + 16}px`
        }

        galleryElement.addEventListener('scroll', updateControlsPosition)
        return () => {
          galleryElement.removeEventListener('scroll', updateControlsPosition)
        }
      }
    }
  }, [controlsWrapperRef.current])

  const handleModalToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      clearSelection()
      setSelected(true)
      toggleSelectDrawer(selectImageDrawerSlug)
    },
    [setSelected, toggleSelectDrawer],
  )

  const handleExpandControls = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      clearSelection()
      setSelected(true)
      setIsExpanded((prev) => !prev)
    },
    [setIsExpanded, setSelected],
  )

  const customControlComponents = useMemo(() => {
    return customControls?.map((control, id) => {
      const ControlComponent = control.component

      const fields = editor.getEditorState().read(() => galleryNode.getCustomFields())

      //user needs to store custom values in gallery node
      if (control?.fieldName) {
        const { fieldName } = control
        const fieldValue = fields.find((v) => v.name === fieldName)

        const addCustomField = (field: CustomGalleryField) => {
          editor.update(() => {
            const foundIndex = fields.findIndex((v) => v.name === field.name)
            if (foundIndex > -1) {
              fields[foundIndex] = field
              galleryNode.setCustomFields([...fields])
            } else {
              galleryNode.setCustomFields([...fields, field])
            }
          })
        }

        const removeCustomField = () => {
          editor.update(() => {
            const filtered = fields.filter((field) => field.name !== fieldName)
            galleryNode.setCustomFields(filtered)
          })
        }

        const setControlsExpanded = (v: boolean) => {
          setControlsExpanded(v)
        }

        return (
          <ControlComponent
            key={id}
            editor={editor}
            fieldValue={fieldValue}
            fieldName={fieldName}
            galleryNode={galleryNode}
            nodeKey={nodeKey}
            controlsExpanded={isExpanded}
            setControlsExpanded={setControlsExpanded}
            addCustomField={addCustomField}
            removeCustomField={removeCustomField}
          />
        )
      } else {
        const setControlsExpanded = (v: boolean) => {
          setControlsExpanded(v)
        }

        return (
          <ControlComponent
            key={id}
            editor={editor}
            galleryNode={galleryNode}
            nodeKey={nodeKey}
            controlsExpanded={isExpanded}
            setControlsExpanded={setControlsExpanded}
          />
        )
      }
    })
  }, [customControls, editor])

  return (
    <React.Fragment>
      <div ref={controlsWrapperRef} className="controls-wrapper">
        <Button onClick={handleModalToggle}>{t('gallery_controls.add_images')}</Button>
        {customControlComponents && customControlComponents.length > 0 && (
          <React.Fragment>
            <Button
              ref={expandBtnRef}
              className={`collapsible-btn ${isExpanded ? 'expanded' : ''}`}
              onClick={handleExpandControls}
            />
            <div className={`expandable-controls ${isExpanded ? 'expanded' : ''}`}>
              {customControlComponents}
            </div>
          </React.Fragment>
        )}
      </div>
    </React.Fragment>
  )
}

export default ControlsComponent
