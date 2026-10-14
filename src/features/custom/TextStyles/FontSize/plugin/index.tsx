import * as React from 'react'
import FontSize from './fontSize'
import {
  COMMAND_PRIORITY_CRITICAL,
  SELECTION_CHANGE_COMMAND,
  $getSelection,
  $isRangeSelection,
  LexicalEditor,
} from 'lexical'
import { $isTableSelection } from '@lexical/table'
import { $getSelectionStyleValueForProperty } from '@lexical/selection'
import { useCallback, useEffect, useState } from 'react'
import { mergeRegister } from '@lexical/utils'
import { ToolbarGroupItem } from '../../../../lib/types'

export const TextSizeToolbarComponent = (props: {
  active?: boolean
  anchorElem: HTMLElement
  editor: LexicalEditor
  enabled?: boolean
  item: ToolbarGroupItem
}) => {
  const { editor } = props
  const [fontSize, setFontSize] = useState('16px')

  const $updateFontSize = useCallback(() => {
    const selection = $getSelection()

    if ($isRangeSelection(selection) || $isTableSelection(selection)) {
      //TODO: in a later lexical version types get compatible?
      //@ts-ignore
      setFontSize($getSelectionStyleValueForProperty(selection, 'font-size', '16px'))
    }
  }, [])

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateFontSize()
        })
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          $updateFontSize()
          return false
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
    )
  }, [$updateFontSize, editor])

  return <FontSize editor={editor} selectionFontSize={fontSize.slice(0, -2)} disabled={false} />
}
