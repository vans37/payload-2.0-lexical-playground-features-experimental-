import * as React from 'react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
//import * as facelessUIImport from '@faceless-ui/scroll-info'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { SanitizedEditorConfig, useEditorConfigContext } from '@payloadcms/richtext-lexical'
import type { LexicalEditor } from 'lexical'

import { ToolbarButton } from '../../shared/ToolbarButton'
import { ToolbarDropdown } from '../../shared/ToolbarDropdown'

import './index.scss'
import { useThrottledEffect } from '../../hooks'
import mergeGroups from '../../utils/mergeGroups'
import { ToolbarGroupItem, ToolbarGroup } from '../../../../../lib/types'

// const { ScrollInfoProvider } =
//   facelessUIImport && 'ScrollInfoProvider' in facelessUIImport
//     ? facelessUIImport
//     : { ScrollInfoProvider: undefined }
// const { useScrollInfo } =
//   facelessUIImport && 'useScrollInfo' in facelessUIImport
//     ? facelessUIImport
//     : { useScrollInfo: undefined }
// export { ScrollInfoProvider, useScrollInfo }

function ButtonGroupItem({
  anchorElem,
  editor,
  item,
}: {
  anchorElem: HTMLElement
  editor: LexicalEditor
  item: ToolbarGroupItem
}): React.ReactNode {
  if (item.Component) {
    return (
      item?.Component && (
        <item.Component anchorElem={anchorElem} editor={editor} item={item} key={item.key} />
      )
    )
  }

  if (!item.ChildComponent) {
    return null
  }

  return (
    <ToolbarButton editor={editor} item={item} key={item.key}>
      {<item.ChildComponent />}
    </ToolbarButton>
  )
}

function ToolbarGroupComponent({
  anchorElem,
  editor,
  editorConfig,
  group,
  index,
}: {
  anchorElem: HTMLElement
  editor: LexicalEditor
  editorConfig: SanitizedEditorConfig
  group: ToolbarGroup
  index: number
}): React.ReactNode {
  const [dropdownLabel, setDropdownLabel] = React.useState<string | undefined>(undefined)
  const [DropdownIcon, setDropdownIcon] = React.useState<React.FC | undefined>(undefined)

  const { i18n } = useTranslation()

  const toolbarsCountRef = React.useRef(0)

  useEffect(() => {
    for (const feature of editorConfig.resolvedFeatureMap.values()) {
      if (Object.hasOwn(feature, 'toolbarFixed')) {
        toolbarsCountRef.current++
      }
    }
  }, [editorConfig])

  React.useEffect(() => {
    if (group?.type === 'dropdown' && group.items.length && group.ChildComponent) {
      setDropdownIcon(() => group.ChildComponent!)
    } else {
      setDropdownIcon(undefined)
    }
  }, [group])

  const onActiveChange = React.useCallback(
    ({ activeItems }: { activeItems: ToolbarGroupItem[] }) => {
      if (!activeItems.length) {
        if (group?.type === 'dropdown' && group.items.length && group.ChildComponent) {
          setDropdownIcon(() => group.ChildComponent!)
          setDropdownLabel(undefined)
        } else {
          setDropdownIcon(undefined)
          setDropdownLabel(undefined)
        }
        return
      }
      const item = activeItems[0]

      let label = item.key
      if (item.label) {
        label = typeof item.label === 'function' ? item.label({ i18n }) : item.label
      }
      // Crop title to max. 25 characters
      if (label.length > 25) {
        label = label.substring(0, 25) + '...'
      }
      setDropdownLabel(label)
      setDropdownIcon(() => item.ChildComponent)
    },
    [group, i18n],
  )

  return (
    <div className={`fixed-toolbar__group fixed-toolbar__group-${group.key}`} key={group.key}>
      {group.type === 'dropdown' &&
        group.items.length &&
        (DropdownIcon ? (
          <ToolbarDropdown
            anchorElem={anchorElem}
            editor={editor}
            group={group}
            Icon={DropdownIcon}
            itemsContainerClassNames={['fixed-toolbar__dropdown-items']}
            label={dropdownLabel}
            maxActiveItems={1}
            onActiveChange={onActiveChange}
          />
        ) : (
          <ToolbarDropdown
            anchorElem={anchorElem}
            editor={editor}
            group={group}
            itemsContainerClassNames={['fixed-toolbar__dropdown-items']}
            label={dropdownLabel}
            maxActiveItems={1}
            onActiveChange={onActiveChange}
          />
        ))}
      {group.type === 'buttons' &&
        group.items.length &&
        group.items.map((item) => {
          return (
            <ButtonGroupItem anchorElem={anchorElem} editor={editor} item={item} key={item.key} />
          )
        })}
      {index < toolbarsCountRef.current - 1 && <div className="divider" />}
    </div>
  )
}

function FixedToolbar({
  anchorElem,
  editor,
  editorConfig,
  groups,
}: {
  anchorElem: HTMLElement
  editor: LexicalEditor
  editorConfig: SanitizedEditorConfig
  groups: ToolbarGroup[]
}): React.ReactNode {
  const currentToolbarRef = React.useRef<HTMLDivElement>(null)

  //const { y } = useScrollInfo!()

  const parentToolbarElem = null

  useThrottledEffect(
    () => {
      if (!parentToolbarElem) {
        // this also checks for clientProps?.disableIfParentHasFixedToolbar indirectly, see the parentToolbarElem useMemo
        return
      }
      const currentToolbarElem = currentToolbarRef.current
      if (!currentToolbarElem) {
        return
      }

      const currentRect = currentToolbarElem.getBoundingClientRect()
      const parentRect = parentToolbarElem.getBoundingClientRect()

      // we only need to check for vertical overlap
      const overlapping = !(
        currentRect.bottom < parentRect.top || currentRect.top > parentRect.bottom
      )

      if (overlapping) {
        currentToolbarElem.className = 'fixed-toolbar fixed-toolbar--overlapping'
        parentToolbarElem.className = 'fixed-toolbar fixed-toolbar--hide'
      } else {
        if (!currentToolbarElem.classList.contains('fixed-toolbar--overlapping')) {
          return
        }
        currentToolbarElem.className = 'fixed-toolbar'
        parentToolbarElem.className = 'fixed-toolbar'
      }
    },
    50,
    [currentToolbarRef, parentToolbarElem],
  )

  return (
    <div
      className="fixed-toolbar"
      onFocus={(event) => {
        // Prevent other focus events being triggered. Otherwise, if this was to be clicked while in a child editor,
        // the parent editor will be focused, and the child editor will lose focus.
        event.stopPropagation()
      }}
      ref={currentToolbarRef}
    >
      {editor.isEditable() && (
        <React.Fragment>
          {groups.map((group, i) => {
            return (
              <ToolbarGroupComponent
                anchorElem={anchorElem}
                editor={editor}
                editorConfig={editorConfig}
                group={group}
                index={i}
                key={group.key}
              />
            )
          })}
        </React.Fragment>
      )}
    </div>
  )
}

export const FixedToolbarPlugin: any = ({ anchorElem, clientProps }) => {
  const [currentEditor] = useLexicalComposerContext()
  const editorConfigContext = useEditorConfigContext()
  const [groups, setGroups] = React.useState<ToolbarGroup[]>([])
  const { editorConfig: currentEditorConfig } = editorConfigContext

  const editor = currentEditor
  const editorConfig = currentEditorConfig

  useEffect(() => {
    let featureGroups: ToolbarGroup[] = []
    for (const feature of editorConfig?.resolvedFeatureMap?.values()) {
      if (Object.hasOwn(feature, 'toolbarFixed')) {
        //@ts-ignore
        featureGroups.push(...(feature?.toolbarFixed?.groups || []))
      }
    }
    //toolbars from props so that user can
    //dynamically alter toolbar
    //TODO: check same keys
    for (const feature of editorConfig?.resolvedFeatureMap?.values()) {
      //@ts-ignore
      if (feature?.props?.toolbar?.toolbarFixed) {
        //@ts-ignore
        featureGroups.push(...(feature?.props?.toolbar?.toolbarFixed?.groups || []))
      }
    }

    featureGroups = mergeGroups(featureGroups || [])
    setGroups(featureGroups)
  }, [editorConfig])

  if (groups?.length === 0) {
    return null
  }

  return (
    <FixedToolbar
      anchorElem={anchorElem}
      editor={editor}
      editorConfig={editorConfig}
      groups={groups}
    />
  )
}
