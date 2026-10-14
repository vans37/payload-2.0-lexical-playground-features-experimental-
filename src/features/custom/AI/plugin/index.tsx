import * as React from 'react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { mergeRegister } from '@lexical/utils'
import { COMMAND_PRIORITY_EDITOR, createCommand } from 'lexical'

import AIComponent from './components/AIComponent'

import './index.scss'

export const TOGGLE_AI_INPUT_OPEN_COMMAND = createCommand<null>()
export const TOGGLE_AI_INPUT_OPEN_COMMAND_WITH_SELECTION = createCommand<null>()

export const AITextGeneratorPlugin = () => {
  const [editor] = useLexicalComposerContext()
  const [isAIBoxVisible, setIsAIBoxVisible] = useState(false)

  const handleAIBoxToggleOpen = (v: boolean) => {
    setIsAIBoxVisible(v)
  }

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        TOGGLE_AI_INPUT_OPEN_COMMAND,
        () => {
          setIsAIBoxVisible(true)
          return true
        },
        COMMAND_PRIORITY_EDITOR,
      ),
      editor.registerCommand(
        TOGGLE_AI_INPUT_OPEN_COMMAND_WITH_SELECTION,
        () => {
          setIsAIBoxVisible(true)
          return true
        },
        COMMAND_PRIORITY_EDITOR,
      ),
    )
  }, [editor])

  if (isAIBoxVisible) {
    return createPortal(
      <AIComponent toggleAIBoxOpen={handleAIBoxToggleOpen} editor={editor} />,
      document.body,
    )
  } else {
    return null
  }
}
