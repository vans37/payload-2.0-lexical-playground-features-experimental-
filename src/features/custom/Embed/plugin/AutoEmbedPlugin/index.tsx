import {
  AutoEmbedOption,
  EmbedConfig,
  EmbedMatchResult,
  URL_MATCHER,
} from '@lexical/react/LexicalAutoEmbedPlugin'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useMemo, useState } from 'react'
import * as React from 'react'
import { createPortal } from 'react-dom'
import { DialogActions } from '../../../../lib/ui/Dialog'
import { LexicalAutoEmbedPlugin } from './LexicalAutoEmbedPlugin'
import { useEditorConfigContext } from '@payloadcms/richtext-lexical'
import { EmbedFeatureProps } from '../..'
import { Button, Drawer } from 'payload/components/elements'
import { useModal } from '@faceless-ui/modal'
import { useTranslation } from 'react-i18next'

import './index.scss'

interface PlaygroundEmbedConfig extends EmbedConfig {
  // Human readable name of the embeded content e.g. Tweet or Google Map.
  contentName: string

  // Icon for display.
  icon?: JSX.Element

  // An example of a matching url https://twitter.com/jack/status/20
  exampleUrl: string

  // For extra searching.
  keywords: Array<string>

  // Embed a Figma Project.
  description?: string
}

function AutoEmbedMenuItem({
  index,
  isSelected,
  onClick,
  onMouseEnter,
  option,
}: {
  index: number
  isSelected: boolean
  onClick: () => void
  onMouseEnter: () => void
  option: AutoEmbedOption
}) {
  let className = 'item'
  if (isSelected) {
    className += ' selected'
  }
  return (
    <li
      key={option.key}
      tabIndex={-1}
      className={className}
      ref={option.setRefElement}
      role="option"
      aria-selected={isSelected}
      id={'typeahead-item-' + index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
    >
      <span className="text">{option.title}</span>
    </li>
  )
}

function AutoEmbedMenu({
  options,
  selectedItemIndex,
  onOptionClick,
  onOptionMouseEnter,
}: {
  selectedItemIndex: number | null
  onOptionClick: (option: AutoEmbedOption, index: number) => void
  onOptionMouseEnter: (index: number) => void
  options: Array<AutoEmbedOption>
}) {
  return (
    <div className="typeahead-popover">
      <ul>
        {options.map((option: AutoEmbedOption, i: number) => (
          <AutoEmbedMenuItem
            index={i}
            isSelected={selectedItemIndex === i}
            onClick={() => onOptionClick(option, i)}
            onMouseEnter={() => onOptionMouseEnter(i)}
            key={option.key}
            option={option}
          />
        ))}
      </ul>
    </div>
  )
}

const debounce = (callback: (text: string) => void, delay: number) => {
  let timeoutId: number
  return (text: string) => {
    window.clearTimeout(timeoutId)
    timeoutId = window.setTimeout(() => {
      callback(text)
    }, delay)
  }
}

const baseClass = 'embed-dialog'

export function AutoEmbedDialog({
  embedConfig,
  onClose,
}: {
  embedConfig: PlaygroundEmbedConfig
  onClose: () => void
}): JSX.Element {
  const [text, setText] = useState('')
  const [editor] = useLexicalComposerContext()
  const [embedResult, setEmbedResult] = useState<EmbedMatchResult | null>(null)

  const { t } = useTranslation('embed')

  const validateText = useMemo(
    () =>
      debounce((inputText: string) => {
        const urlMatch = URL_MATCHER.exec(inputText)
        if (embedConfig != null && inputText != null && urlMatch != null) {
          Promise.resolve(embedConfig.parseUrl(inputText)).then((parseResult) => {
            setEmbedResult(parseResult)
          })
        } else if (embedResult != null) {
          setEmbedResult(null)
        }
      }, 200),
    [embedConfig, embedResult],
  )

  const onClick = () => {
    if (embedResult != null) {
      embedConfig.insertNode(editor, embedResult)
      onClose()
    }
  }

  return (
    <div>
      <div className={`${baseClass}__input-wrapper`}>
        <input
          type="text"
          className={`${baseClass}__input`}
          placeholder={embedConfig.exampleUrl}
          value={text}
          data-test-id={`${embedConfig.type}-embed-modal-url`}
          onChange={(e) => {
            const { value } = e.target
            setText(value)
            validateText(value)
          }}
        />
      </div>
      <DialogActions>
        <Button
          disabled={!embedResult}
          onClick={onClick}
          data-test-id={`${embedConfig.type}-embed-modal-submit-btn`}
        >
          {t('button_embed')}
        </Button>
      </DialogActions>
    </div>
  )
}

export default function AutoEmbedPlugin(): JSX.Element {
  const { openModal, closeModal } = useModal()
  const { editorConfig, field } = useEditorConfigContext()

  //embed configs from props
  const configs = (editorConfig?.resolvedFeatureMap?.get('embed')?.props as EmbedFeatureProps)
    ?.embedConfigs

  const openEmbedModal = (embedConfig: PlaygroundEmbedConfig) => {
    openModal(`${field.path}_${embedConfig.type}`)
  }

  const getMenuOptions = (
    activeEmbedConfig: PlaygroundEmbedConfig,
    embedFn: () => void,
    dismissFn: () => void,
  ) => {
    return [
      new AutoEmbedOption('Dismiss', {
        onSelect: dismissFn,
      }),
      new AutoEmbedOption(`Embed ${activeEmbedConfig.contentName}`, {
        onSelect: embedFn,
      }),
    ]
  }

  return (
    <React.Fragment>
      {configs.map((config, index) => {
        const slug = `${field.path}_${config.type}`

        return (
          <React.Fragment key={index}>
            <Drawer slug={slug}>
              <AutoEmbedDialog embedConfig={config} onClose={() => closeModal(slug)} />
            </Drawer>
            <LexicalAutoEmbedPlugin<PlaygroundEmbedConfig>
              embedConfigs={configs}
              onOpenEmbedModalForConfig={openEmbedModal}
              getMenuOptions={getMenuOptions}
              menuRenderFn={(
                anchorElementRef,
                { selectedIndex, options, selectOptionAndCleanUp, setHighlightedIndex },
              ) =>
                anchorElementRef.current
                  ? createPortal(
                      <div
                        className="typeahead-popover auto-embed-menu"
                        style={{
                          marginLeft: anchorElementRef.current.style.width,
                          width: 200,
                        }}
                      >
                        <AutoEmbedMenu
                          options={options}
                          selectedItemIndex={selectedIndex}
                          onOptionClick={(option: AutoEmbedOption, index: number) => {
                            setHighlightedIndex(index)
                            selectOptionAndCleanUp(option)
                          }}
                          onOptionMouseEnter={(index: number) => {
                            setHighlightedIndex(index)
                          }}
                        />
                      </div>,
                      anchorElementRef.current,
                    )
                  : null
              }
            />
          </React.Fragment>
        )
      })}
    </React.Fragment>
  )
}
