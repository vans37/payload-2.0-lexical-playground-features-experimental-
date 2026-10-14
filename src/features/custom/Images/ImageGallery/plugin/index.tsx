import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $insertNodeToNearestRoot, mergeRegister, $getNearestNodeOfType } from '@lexical/utils'
import {
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_NORMAL,
  type LexicalCommand,
  type NodeKey,
  SELECTION_CHANGE_COMMAND,
  createCommand,
  $getSelection,
  $isRangeSelection,
  $isNodeSelection,
  $getNodeByKey,
  LexicalNode,
} from 'lexical'
import { useConfig } from 'payload/components/utilities'
import { useEffect, useMemo } from 'react'
import { $createGalleryNode, $isGalleryNode, GalleryNode } from '../nodes/GalleryNode'
import './index.scss'
import { useModal } from '@faceless-ui/modal'
import { $isGalleryImageNode, GalleryImageNode } from '../nodes/ImageNode'
import { useEditorConfigContext } from '@payloadcms/richtext-lexical'
import { GalleryFeatureProps } from '../index'
import {
  $createGalleryControlsNode,
  $isGalleryControlsNode,
  GalleryControlsNode,
} from '../nodes/ControlsNode'

import { $getRoot } from 'lexical'

import {
  $createGalleryControllerNode,
  $isGalleryControllerNode,
  GalleryControllerNode,
} from '../nodes/ControllerNode'
import { useGallery } from '../store'

export const INSERT_GALLERY_COMMAND: LexicalCommand<unknown> =
  createCommand('INSERT_GALLERY_COMMAND')

export const OPEN_UPLOAD_DRAWER_COMMAND: LexicalCommand<NodeKey> =
  createCommand('OPEN_UPLOAD_DRAWER')

export const GalleryPlugin = () => {
  const [editor] = useLexicalComposerContext()
  const { collections } = useConfig()
  const { openModal } = useModal()

  const { setSelection } = useGallery('')

  const { editorConfig, field } = useEditorConfigContext()

  const galleryConfig = useMemo(() => {
    const galleryFeature = editorConfig.resolvedFeatureMap.get('gallery')
    return galleryFeature?.props as GalleryFeatureProps | undefined
  }, [editorConfig.resolvedFeatureMap])

  //check if user provided upload collections
  useEffect(() => {
    if (!galleryConfig?.collections) {
      console.warn('GalleryFeature: no upload collection was provided yet')
      return
    }

    Object.keys(galleryConfig.collections)
      .flat()
      .map((enabledSlug) => {
        const foundIndex = collections.findIndex((collection, index) => {
          if (collection.slug === enabledSlug && collection.upload) {
            return index
          } else {
            return -1
          }
        })

        if (foundIndex === -1) {
          throw new Error(
            `GalleryFeature: provided collection '${enabledSlug}' does not exist or is not upload enabled`,
          )
        }
      })
  }, [galleryConfig.collections])

  const $getGallery = (node: LexicalNode) => {
    return $getNearestNodeOfType(node, GalleryNode)
  }

  const $resetGallerySelection = () => {
    //$nodesOfType returns duplicates on each call, probably bug
    //or wrong usage, so instead find all gallery nodes which
    //are direct children of root node
    let galleryNodes: GalleryNode[] = []

    const root = $getRoot()

    if (!root) {
      return
    }

    root.getChildren().forEach((child) => {
      if (child.getType() === GalleryNode.getType()) {
        galleryNodes.push(child as GalleryNode)
      }
    })

    if (galleryNodes.length > 0) {
      galleryNodes.forEach((node: GalleryNode) => {
        if ($getNodeByKey(node.__key)) {
          node.setIsHighlighted(false)
        }
      })
    }
  }

  useEffect(() => {
    editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        const selection = $getSelection()
        if (selection) {
          $resetGallerySelection()
          if ($isNodeSelection(selection)) {
            const nodes = selection.getNodes()
            nodes.forEach((node) => {
              if ($isGalleryControlsNode(node)) {
                const gallery = $getGallery(node)
                if (gallery && $isGalleryNode(gallery)) {
                  gallery.setIsHighlighted(true)
                }
              } else if ($isGalleryImageNode(node)) {
                const gallery = $getGallery(node)
                if (gallery && $isGalleryNode(gallery)) {
                  gallery.setIsHighlighted(true)
                }
              } else if ($isGalleryControllerNode(node)) {
                const gallery = $getGallery(node)
                if (gallery && $isGalleryNode(gallery)) {
                  gallery.setIsHighlighted(true)
                }
              }
            })
          } else if ($isRangeSelection(selection)) {
            const nodes = selection.getNodes()
            nodes.forEach((node) => {
              if ($isGalleryImageNode(node)) {
                const gallery = $getGallery(node)
                if (gallery && $isGalleryNode(gallery)) {
                  gallery.setIsHighlighted(true)
                }
              } else if ($isGalleryControlsNode(node)) {
                const gallery = $getGallery(node)
                if (gallery && $isGalleryNode(gallery)) {
                  gallery.setIsHighlighted(true)
                }
              } else if ($isGalleryControllerNode) {
                const gallery = $getGallery(node)
                if (gallery && $isGalleryNode(gallery)) {
                  gallery.setIsHighlighted(true)
                }
              }
            })
          }
        }

        return false
      },
      COMMAND_PRIORITY_NORMAL,
    )
  }, [editor])

  useEffect(() => {
    if (!editor.hasNodes([GalleryNode])) {
      throw new Error('GalleryPlugin: GalleryNode not registered on editor')
    }
    if (!editor.hasNodes([GalleryImageNode])) {
      throw new Error('GalleryPlugin: GalleryImageNode not registered on editor')
    }
    if (!editor.hasNodes([GalleryControllerNode])) {
      throw new Error('GalleryPlugin: GalleryControllerNode not registered on editor')
    }
    if (!editor.hasNodes([GalleryControlsNode])) {
      throw new Error('GalleryPlugin: GalleryControlsNode not registered on editor')
    }
    return mergeRegister(
      editor.registerCommand(
        INSERT_GALLERY_COMMAND,
        () => {
          editor.update(() => {
            const galleryNode = $createGalleryNode(field.path, [])
            const controlsNode = $createGalleryControlsNode()
            const controllerNode = $createGalleryControllerNode()
            galleryNode.append(controlsNode)
            galleryNode.append(controllerNode)
            $insertNodeToNearestRoot(galleryNode)
            //create zustand state with gallery node key
            setSelection([], galleryNode.getKey())
            galleryNode.setIsHighlighted(true)
          })
          return true
        },
        COMMAND_PRIORITY_EDITOR,
      ),
      editor.registerCommand(
        OPEN_UPLOAD_DRAWER_COMMAND,
        (slug) => {
          openModal(slug)
          return true
        },
        COMMAND_PRIORITY_EDITOR,
      ),
    )
  }, [editor, openModal])

  return null
}
