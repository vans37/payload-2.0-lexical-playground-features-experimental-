import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { COMMAND_PRIORITY_EDITOR, createCommand, LexicalCommand } from 'lexical'
import { useEffect } from 'react'

import { $insertNodeToNearestRoot } from '@lexical/utils'
import { $createVkVideoNode, VkVideoNode } from '../node/VkVideoNode'

export type VkVideoPayload = {
  videoID: string
  ownerID: string
  url: string
}

export const INSERT_VKVIDEO_COMMAND: LexicalCommand<VkVideoPayload> =
  createCommand('INSERT_VKVIDEO_COMMAND')

export default function VkVideoPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (!editor.hasNodes([VkVideoNode])) {
      throw new Error('VKVideoPlugin: VkVideoNode not registered on editor')
    }

    return editor.registerCommand<VkVideoPayload>(
      INSERT_VKVIDEO_COMMAND,
      (payload) => {
        const youTubeNode = $createVkVideoNode(payload.url, payload.ownerID, payload.videoID)
        $insertNodeToNearestRoot(youTubeNode)

        return true
      },
      COMMAND_PRIORITY_EDITOR,
    )
  }, [editor])

  return null
}
