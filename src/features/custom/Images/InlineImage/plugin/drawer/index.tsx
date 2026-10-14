'use client'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  COMMAND_PRIORITY_EDITOR,
  $getSelection,
  $isRangeSelection,
  $getPreviousSelection,
} from 'lexical'
import { useListDrawer } from 'payload/components/elements'
import React, { useCallback, useEffect, useState } from 'react'
import { EnabledRelationshipsCondition } from './EnabledRelationshipsCondition'
import { TOGGLE_UPLOADS_DRAWER_COMMAND } from '..'
import { useConfig } from 'payload/components/utilities'

import { $createInlineImageNode, Position } from '../../nodes/InlineImageNode'
import { toast } from 'react-toastify'
import fetchResource, { isSuccessResponse } from '../../../../../lib/api/fetchResource'

type Props = {
  enabledCollectionSlugs: string[]
  position: Position
  toggleModal: (slug: string) => void
  modalSlug: string
}

const UploadDrawerComponent: React.FC<Props> = ({
  enabledCollectionSlugs,
  position,
  modalSlug,
  toggleModal,
}) => {
  const [editor] = useLexicalComposerContext()
  const {
    routes: { api },
    serverURL,
  } = useConfig()
  const [replaceNodeKey, setReplaceNodeKey] = useState<null | string>(null)
  const [ListDrawer, ListDrawerToggler, { closeDrawer, openDrawer }] = useListDrawer({
    collectionSlugs: enabledCollectionSlugs,
    uploads: true,
  })

  useEffect(() => {
    return editor.registerCommand<boolean>(
      TOGGLE_UPLOADS_DRAWER_COMMAND,
      (isOpen) => {
        if (isOpen) {
          openDrawer()
        } else {
          closeDrawer()
        }
        return true
      },
      COMMAND_PRIORITY_EDITOR,
    )
  }, [editor, openDrawer])

  const onSelect = useCallback(
    async ({ collectionConfig, docID }) => {
      const { slug } = collectionConfig
      const response = await fetchResource<any>(`${serverURL}${api}/${slug}/${docID}`)

      if (isSuccessResponse(response)) {
        if (response?.data?.url) {
          editor.update(() => {
            const selection = $getSelection() || $getPreviousSelection()
            if (!$isRangeSelection(selection)) {
              return
            }

            // const node = $createInlineImageNode({
            //   position,
            //   belongsTo: slug,
            //   fi: docID,
            //   src: response.data.url,
            //   altText: '',
            // })

            // selection.insertNodes([node])
          })
        }

        editor.dispatchCommand(TOGGLE_UPLOADS_DRAWER_COMMAND, false)
        toggleModal(modalSlug)
      } else {
        toast.error(response.message)
      }
    },
    [
      editor,
      replaceNodeKey,
      fetchResource,
      isSuccessResponse,
      $getSelection,
      $isRangeSelection,
      $createInlineImageNode,
    ],
  )

  return <ListDrawer onSelect={onSelect} />
}

export const UploadDrawer = (props: Props): React.ReactNode => {
  return (
    <EnabledRelationshipsCondition {...props} uploads>
      <UploadDrawerComponent {...props} />
    </EnabledRelationshipsCondition>
  )
}
