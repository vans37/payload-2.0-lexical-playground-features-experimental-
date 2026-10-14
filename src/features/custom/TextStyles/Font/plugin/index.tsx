import { $getSelection, $isTextNode, LexicalEditor } from 'lexical'
import React, { useCallback } from 'react'
import { ToolbarGroupItem } from '../../../../lib/types'
import './insex.scss'

export function FontPlugin(props: {
  active?: boolean
  anchorElem: HTMLElement
  editor: LexicalEditor
  enabled?: boolean
  item: ToolbarGroupItem
  font: string
}) {
  const { font, editor, enabled } = props

  const $setFont = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection()
      if (selection !== null) {
        const nodes = selection.getNodes()
        for (const node of nodes) {
          if ($isTextNode(node)) {
            const style = node.getStyle()
            const newStyle = `${style}; font-family: ${font}`
            node.setStyle(newStyle)
          }
        }
      }
    })
  }, [editor])

  return (
    <div onClick={$setFont} className={`font-dropdown ${!enabled ? 'disabled' : ''}`}>
      {font}
    </div>
  )
}
