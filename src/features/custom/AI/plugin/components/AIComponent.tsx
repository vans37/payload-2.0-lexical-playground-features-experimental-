import * as React from 'react'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { $convertFromMarkdownString, TRANSFORMERS } from '@lexical/markdown'
import { createDOMRange, createRectsFromDOMRange } from '@lexical/selection'
import { useEditorConfigContext } from '@payloadcms/richtext-lexical'
import type { LexicalEditor, RangeSelection } from 'lexical'
import {
  $createParagraphNode,
  $getSelection,
  $isElementNode,
  $isParagraphNode,
  $isRangeSelection,
  $isTextNode,
} from 'lexical'
import { Button } from 'payload/components/elements'

import useClickOutside from '../hooks/useClickOutside'
import DisplayResponse from './DisplayResponse'
import ModelResponseEditor from './EditorComponent'
import { useInternalization } from '../../../I18n/store'

const AIComponent = ({
  editor,
  toggleAIBoxOpen,
}: {
  editor: LexicalEditor
  toggleAIBoxOpen: (v: boolean) => void
}) => {
  const [selectionText, setSelectionText] = useState('')
  const [queryValue, setQueryValue] = useState('')
  const [error, setError] = useState('')
  const [isPending, setIsPending] = useState(false)
  const selectionRef = useRef<RangeSelection | null>(null)
  const [response, setResponse] = useState('')
  const [streamingIsDone, setStreamingIsDone] = useState(false)
  const [streamingResponse, setStreamingResponse] = useState('')
  const { t } = useInternalization('ai_assistant')
  const { editorConfig } = useEditorConfigContext()

  const { useNestedEditor, adapter } = editorConfig?.resolvedFeatureMap?.get('ai_assistant')
    ?.props as any

  if (!adapter) {
    throw new Error('AIAssistant: adapter has not been provided')
  }

  const selectionState = useMemo(
    () => ({
      container: document.createElement('div'),
      elements: [],
    }),
    [],
  )

  const handleClose = () => {
    toggleAIBoxOpen(false)
  }

  const handleGenerate = async () => {
    try {
      const promt = selectionText?.length > 0 ? selectionText + ' - ' + queryValue : queryValue
      const capabilities = adapter.getCapabilities()

      if (!capabilities.textGeneration) {
        alert(t('error.text_generation_not_supported'))
        return
      }

      if (capabilities.streaming) {
        setIsPending(true)
        const stream = await adapter.streamGenerate({ prompt: promt })
        const reader = stream.getReader()
        const read = () => {
          return reader.read().then(({ value, done }) => {
            if (done) {
              setStreamingIsDone(true)
              return
            }
            setStreamingResponse((prev) => prev + value.text)

            return read()
          })
        }
        read()
      } else {
        setIsPending(true)
        const data = await adapter.generate({ prompt: promt })
        const text = data.content
        setResponse(text)
      }
    } catch (error) {
      setError(`${t('error.general')}: ${error.message}`)
    } finally {
      setIsPending(false)
    }
  }

  //Insert model response at current cursor position
  const handleInsert = () => {
    if (selectionRef.current && (response || streamingResponse)) {
      const currentSelection = selectionRef.current
      editor.update(() => {
        if ($isRangeSelection(currentSelection)) {
          const anchorNode = currentSelection.anchor.getNode()
          let markdownString = ''

          if (response) {
            markdownString = response
          } else if (streamingResponse) {
            markdownString = streamingResponse
          }

          if ($isElementNode(anchorNode)) {
            $convertFromMarkdownString(markdownString, TRANSFORMERS, anchorNode)
          } else if ($isTextNode(anchorNode)) {
            //Parent node can be number of nodes: headers, list, tables etc, which contains
            //selection as children. We should avoid having Element node as anything but paragraph.
            const parent = anchorNode.getParent()
            if (parent) {
              if ($isParagraphNode(parent)) {
                $convertFromMarkdownString(markdownString, TRANSFORMERS, parent)
              }
              const paragraph = $createParagraphNode()
              const newParent = parent.replace(paragraph)
              $convertFromMarkdownString(markdownString, TRANSFORMERS, newParent)
            }
          }
        }
      })
    }
  }

  //Replace selection with model response
  const handleReplace = () => {
    if (selectionRef.current && (response || streamingResponse)) {
      const currentSelection = selectionRef.current
      /* 
          Some adapters(google gemini, open ai) return repsonse as markdown.
          We can leverage lexical/markdown plugin to transform model markdown response to
          lexical nodes, which will be inserted at selection anchor and replace selection. 
        */
      editor.update(() => {
        if ($isRangeSelection(currentSelection)) {
          const anchorNode = currentSelection.anchor.getNode()
          let markdownString = ''

          if (response) {
            markdownString = response
          } else if (streamingResponse) {
            markdownString = streamingResponse
          }
          /* 
              $convertFromMarkdownString() expects node?: ElementNode as an optional parameter, 
              into which it will insert tranformed nodes; if node is not provided function will replace 
              all nodes in the editor starting from root() with tranformed markdown nodes, replacing all editor existing
              content.
            */
          if ($isElementNode(anchorNode)) {
            $convertFromMarkdownString(markdownString, TRANSFORMERS, anchorNode)
          } else if ($isTextNode(anchorNode)) {
            /* 
                Parent node can be number of nodes: headers, list, tables etc, which contains
                selection as children. We should avoid having Element node as anything but paragraph. 
              */
            const parent = anchorNode.getParent()
            if (parent) {
              if ($isParagraphNode(parent)) {
                $convertFromMarkdownString(markdownString, TRANSFORMERS, parent)
              }
              const paragraph = $createParagraphNode()
              const newParent = parent.replace(paragraph)
              $convertFromMarkdownString(markdownString, TRANSFORMERS, newParent)
            }
          }
        }
      })
    }
  }

  const containerRef = useClickOutside(handleClose)

  //The code for calculating position of the input box over node selection is adopted from:
  //https://github.com/facebook/lexical/blob/main/packages/lexical-playground/src/plugins/CommentPlugin/index.tsx
  const updateComponentPosition = useCallback(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection()

      if ($isRangeSelection(selection)) {
        selectionRef.current = selection.clone()
        if (selection.getTextContent()) {
          setSelectionText(selection.getTextContent())
        }

        const anchor = selection.anchor
        const focus = selection.focus
        const range = createDOMRange(
          editor,
          anchor.getNode(),
          anchor.offset,
          focus.getNode(),
          focus.offset,
        )
        const boxElem = containerRef.current
        if (range !== null && boxElem !== null) {
          const { left, bottom, width } = range.getBoundingClientRect()
          const selectionRects = createRectsFromDOMRange(editor, range)
          let correctedLeft = selectionRects.length === 1 ? left + width / 2 - 125 : left - 125
          if (correctedLeft < 10) {
            correctedLeft = 10
          }
          boxElem.style.left = `${correctedLeft}px`
          boxElem.style.top = `${
            bottom + 20 + (window.pageYOffset || document.documentElement.scrollTop)
          }px`
          const selectionRectsLength = selectionRects.length
          const { container } = selectionState
          const elements: Array<HTMLSpanElement> = selectionState.elements
          const elementsLength = elements.length

          for (let i = 0; i < selectionRectsLength; i++) {
            const selectionRect = selectionRects[i]
            let elem: HTMLSpanElement = elements[i]
            if (elem === undefined) {
              elem = document.createElement('span')
              elements[i] = elem
              container.appendChild(elem)
            }
            const color = '255, 212, 0'
            const style = `position:absolute;top:${
              selectionRect.top + (window.pageYOffset || document.documentElement.scrollTop)
            }px;left:${selectionRect.left}px;height:${selectionRect.height}px;width:${
              selectionRect.width
            }px;background-color:rgba(${color}, 0.3);pointer-events:none;z-index:5;`
            elem.style.cssText = style
          }
          for (let i = elementsLength - 1; i >= selectionRectsLength; i--) {
            const elem = elements[i]
            container.removeChild(elem)
            elements.pop()
          }
        }
      }
    })
  }, [containerRef, editor, selectionState])

  useLayoutEffect(() => {
    updateComponentPosition()
    const container = selectionState.container
    const body = document.body
    if (body !== null) {
      body.appendChild(container)
      return () => {
        body.removeChild(container)
      }
    }
  }, [selectionState.container, updateComponentPosition])

  useEffect(() => {
    window.addEventListener('resize', updateComponentPosition)

    return () => {
      window.removeEventListener('resize', updateComponentPosition)
    }
  }, [updateComponentPosition])

  return (
    <div className="ai-assistant-box" ref={containerRef as React.LegacyRef<HTMLDivElement>}>
      {selectionText?.length > 0 && (
        <React.Fragment>
          <div className="label">{t('selection')}:</div>
          <div className="selection-text">{selectionText}</div>
        </React.Fragment>
      )}
      <React.Fragment>
        <div className="label">{t('prompt')}:</div>
        <textarea
          className="user-input"
          rows={5}
          name="query"
          value={queryValue}
          onChange={(e) => setQueryValue(e.target.value)}
        />
      </React.Fragment>
      <div className="btn-group">
        <Button onClick={handleClose}>{t('cancel')}</Button>
        <Button onClick={handleGenerate}>{t('generate')}</Button>
      </div>
      {error && <p>{error}</p>}
      {isPending && <p>{t('await_response')}</p>}
      {!useNestedEditor && (response || streamingResponse) && (
        <DisplayResponse
          buttonTitle={selectionText?.length > 0 ? t('replace') : t('insert')}
          buttonAction={selectionText?.length > 0 ? handleReplace : handleInsert}
          isDisabled={isPending}
        >
          {response.length > 0 ? response : streamingResponse}
        </DisplayResponse>
      )}
      {useNestedEditor && (response || streamingResponse) && (
        <React.Fragment>
          <ModelResponseEditor
            markdown={streamingResponse ?? response}
            isStream={streamingResponse?.length > 0 ? true : false}
          />
          <Button
            disabled={!streamingIsDone}
            onClick={selectionText?.length > 0 ? handleReplace : handleInsert}
          >
            {selectionText?.length > 0 ? t('replace') : t('insert')}
          </Button>
        </React.Fragment>
      )}
    </div>
  )
}

export default AIComponent
