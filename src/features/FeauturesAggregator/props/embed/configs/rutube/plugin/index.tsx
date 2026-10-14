import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { COMMAND_PRIORITY_EDITOR, createCommand, LexicalCommand } from 'lexical'
import { useEffect } from 'react'

import { $insertNodeToNearestRoot } from '@lexical/utils'
import { $createRutubeNode, RutubeNode } from '../node/RutubeNode'

export const INSERT_RUTUBE_COMMAND: LexicalCommand<string> = createCommand('INSERT_RUTUBE_COMMAND')

export default function YouTubePlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (!editor.hasNodes([RutubeNode])) {
      throw new Error('RutubePlugin: RutubeNode not registered on editor')
    }

    return editor.registerCommand<string>(
      INSERT_RUTUBE_COMMAND,
      (payload) => {
        const youTubeNode = $createRutubeNode(payload)
        $insertNodeToNearestRoot(youTubeNode)

        return true
      },
      COMMAND_PRIORITY_EDITOR,
    )
  }, [editor])

  return null
}
