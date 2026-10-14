'use client'
import type {
  HTMLTableElementWithWithTableSelectionState,
  TableRowNode,
  TableSelection,
} from '@lexical/table'
import type { ElementNode, LexicalEditor } from 'lexical'
import type { ReactPortal } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  $deleteTableColumn__EXPERIMENTAL,
  $deleteTableRow__EXPERIMENTAL,
  $getNodeTriplet,
  $getTableCellNodeFromLexicalNode,
  $getTableColumnIndexFromTableCellNode,
  $getTableNodeFromLexicalNodeOrThrow,
  $getTableRowIndexFromTableCellNode,
  $insertTableColumn__EXPERIMENTAL,
  $insertTableRow__EXPERIMENTAL,
  $isTableCellNode,
  $isTableRowNode,
  $isTableSelection,
  $unmergeCell,
  TableCellHeaderStates,
  TableCellNode,
  getTableObserverFromTableElement,
} from '@lexical/table'
import {
  $createParagraphNode,
  $getRoot,
  $getSelection,
  $isElementNode,
  $isParagraphNode,
  $isRangeSelection,
  $isTextNode,
} from 'lexical'
import * as React from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import invariant from '../../../../features/lib/shared/invariant'

import './index.scss'
import ColorPicker from '../../../lib/ui/ColorPicker/ColorPicker'
import { useTranslation } from 'react-i18next'
import { useEditorConfigContext } from '@payloadcms/richtext-lexical'
import { useModal } from '@faceless-ui/modal'
import { Button, Drawer } from 'payload/components/elements'
import { TableActionMenuProps } from '..'

const useScrollInfo = require('@faceless-ui/scroll-info').useScrollInfo

const computeSelectionCount = (
  selection: TableSelection,
): {
  columns: number
  rows: number
} => {
  const selectionShape = selection.getShape()
  return {
    columns: selectionShape.toX - selectionShape.fromX + 1,
    rows: selectionShape.toY - selectionShape.fromY + 1,
  }
}

// This is important when merging cells as there is no good way to re-merge weird shapes (a result
// of selecting merged cells and non-merged)
const isTableSelectionRectangular = (selection: TableSelection): boolean => {
  const nodes = selection.getNodes()
  const currentRows: Array<number> = []
  let currentRow = null
  let expectedColumns = null
  let currentColumns = 0
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    if ($isTableCellNode(node)) {
      const row = node.getParentOrThrow()
      invariant($isTableRowNode(row), 'Expected CellNode to have a RowNode parent')
      if (currentRow !== row) {
        if (expectedColumns !== null && currentColumns !== expectedColumns) {
          return false
        }
        if (currentRow !== null) {
          expectedColumns = currentColumns
        }
        currentRow = row
        currentColumns = 0
      }
      const colSpan = node.__colSpan
      for (let j = 0; j < colSpan; j++) {
        if (currentRows[currentColumns + j] === undefined) {
          currentRows[currentColumns + j] = 0
        }
        currentRows[currentColumns + j] += node.__rowSpan
      }
      currentColumns += colSpan
    }
  }
  return (
    (expectedColumns === null || currentColumns === expectedColumns) &&
    currentRows.every((v) => v === currentRows[0])
  )
}

const $canUnmerge = (): boolean => {
  const selection = $getSelection()
  if (
    ($isRangeSelection(selection) && !selection.isCollapsed()) ||
    ($isTableSelection(selection) && !selection.anchor.is(selection.focus)) ||
    (!$isRangeSelection(selection) && !$isTableSelection(selection))
  ) {
    return false
  }
  const [cell] = $getNodeTriplet(selection.anchor)
  return cell.__colSpan > 1 || cell.__rowSpan > 1
}

const $cellContainsEmptyParagraph = (cell: TableCellNode): boolean => {
  if (cell.getChildrenSize() !== 1) {
    return false
  }
  const firstChild = cell.getFirstChildOrThrow()
  if (!$isParagraphNode(firstChild) || !firstChild.isEmpty()) {
    return false
  }
  return true
}

const $selectLastDescendant = (node: ElementNode): void => {
  const lastDescendant = node.getLastDescendant()
  if ($isTextNode(lastDescendant)) {
    lastDescendant.select()
  } else if ($isElementNode(lastDescendant)) {
    lastDescendant.selectEnd()
  } else if (lastDescendant !== null) {
    lastDescendant.selectNext()
  }
}

const currentCellBackgroundColor = (editor: LexicalEditor): null | string => {
  return editor.getEditorState().read(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection) || $isTableSelection(selection)) {
      const [cell] = $getNodeTriplet(selection.anchor)
      if ($isTableCellNode(cell)) {
        return cell.getBackgroundColor()
      }
    }
    return null
  })
}

type TableCellActionMenuProps = Readonly<{
  cellMerge: boolean
  contextRef: { current: HTMLElement | null }
  tableCellNode: TableCellNode
  drawerSlug: string
  shouldApplyColor: boolean
  lockMenu: boolean
  setLockMenu: (v: boolean) => void
  onClose: () => void
  setIsMenuOpen: (isOpen: boolean) => void
  setColorPicker: (component: JSX.Element) => void
  setShouldApplyColor: (v: boolean) => void
}>

const TableActionMenu = ({
  cellMerge,
  contextRef,
  onClose,
  setIsMenuOpen,
  setColorPicker,
  tableCellNode: _tableCellNode,
  drawerSlug,
  shouldApplyColor,
  setShouldApplyColor,
  lockMenu,
  setLockMenu,
}: TableCellActionMenuProps) => {
  const [editor] = useLexicalComposerContext()
  const dropDownRef = useRef<HTMLDivElement | null>(null)
  const [tableCellNode, updateTableCellNode] = useState(_tableCellNode)
  const [selectionCounts, updateSelectionCounts] = useState({
    columns: 1,
    rows: 1,
  })
  const [canMergeCells, setCanMergeCells] = useState(false)
  const [canUnmergeCell, setCanUnmergeCell] = useState(false)
  const [backgroundColor, setBackgroundColor] = useState(
    () => currentCellBackgroundColor(editor) || '',
  )
  const [colorPickerValue, setColorPickerValue] = useState('')
  const { toggleModal } = useModal()
  const { y } = useScrollInfo()
  const { t } = useTranslation('table_action')

  const { editorConfig } = useEditorConfigContext()

  const predefinedColors = (
    editorConfig.resolvedFeatureMap.get('table_action_menu')?.props as TableActionMenuProps
  )?.predefinedColors

  //update node
  useEffect(() => {
    return editor.registerMutationListener(TableCellNode, (nodeMutations) => {
      const nodeUpdated = nodeMutations.get(tableCellNode.getKey()) === 'updated'

      if (nodeUpdated) {
        editor.getEditorState().read(() => {
          updateTableCellNode(tableCellNode.getLatest())
        })
        setBackgroundColor(currentCellBackgroundColor(editor) || '')
      }
    })
  }, [editor, tableCellNode])

  //merge cell
  useEffect(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection()
      // Merge cells
      if ($isTableSelection(selection)) {
        const currentSelectionCounts = computeSelectionCount(selection)
        updateSelectionCounts(computeSelectionCount(selection))
        setCanMergeCells(
          isTableSelectionRectangular(selection) &&
            (currentSelectionCounts.columns > 1 || currentSelectionCounts.rows > 1),
        )
      }
      // Unmerge cell
      setCanUnmergeCell($canUnmerge())
    })
  }, [editor])

  useEffect(() => {
    const menuButtonElement = contextRef.current
    const dropDownElement = dropDownRef.current
    const rootElement = editor.getRootElement()

    if (menuButtonElement != null && dropDownElement != null && rootElement != null) {
      const rootEleRect = rootElement.getBoundingClientRect()
      const menuButtonRect = menuButtonElement.getBoundingClientRect()
      dropDownElement.style.opacity = '1'
      const dropDownElementRect = dropDownElement.getBoundingClientRect()
      const margin = 5
      let leftPosition = menuButtonRect.right + margin
      if (
        leftPosition + dropDownElementRect.width > window.innerWidth ||
        leftPosition + dropDownElementRect.width > rootEleRect.right
      ) {
        const position = menuButtonRect.left - dropDownElementRect.width - margin
        leftPosition = (position < 0 ? margin : position) + window.pageXOffset
      }
      dropDownElement.style.left = `${leftPosition + window.pageXOffset}px`
      let topPosition = menuButtonRect.top
      if (topPosition + dropDownElementRect.height > window.innerHeight) {
        const position = menuButtonRect.top - dropDownElementRect.height
        topPosition = (position < 0 ? margin : position) + window.pageYOffset
      }
      dropDownElement.style.top = `${topPosition}px`
    }
  }, [contextRef, dropDownRef, editor, y])

  //click outside to close menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropDownRef.current != null &&
        contextRef.current != null &&
        !dropDownRef.current.contains(event.target as Node) &&
        !contextRef.current.contains(event.target as Node) &&
        !lockMenu
      ) {
        setIsMenuOpen(false)
      }
    }

    window.addEventListener('click', handleClickOutside)

    return () => window.removeEventListener('click', handleClickOutside)
  }, [setIsMenuOpen, contextRef, lockMenu])

  useEffect(() => {
    if (shouldApplyColor) {
      editor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection) || $isTableSelection(selection)) {
          const [cell] = $getNodeTriplet(selection.anchor)
          if ($isTableCellNode(cell)) {
            cell.setBackgroundColor(colorPickerValue)
            setShouldApplyColor(false)
          }

          if ($isTableSelection(selection)) {
            const nodes = selection.getNodes()

            for (let i = 0; i < nodes.length; i++) {
              const node = nodes[i]
              if ($isTableCellNode(node)) {
                node.setBackgroundColor(colorPickerValue)
                setShouldApplyColor(false)
              }
            }
          }
        }
      })
    }
  }, [shouldApplyColor, colorPickerValue])

  const clearTableSelection = useCallback(() => {
    editor.update(() => {
      if (tableCellNode.isAttached()) {
        const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode)
        const tableElement = editor.getElementByKey(
          tableNode.getKey(),
        ) as HTMLTableElementWithWithTableSelectionState

        if (!tableElement) {
          throw new Error('Expected to find tableElement in DOM')
        }

        const tableSelection = getTableObserverFromTableElement(tableElement)
        if (tableSelection !== null) {
          tableSelection.clearHighlight()
        }

        tableNode.markDirty()
        updateTableCellNode(tableCellNode.getLatest())
      }

      const rootNode = $getRoot()
      rootNode.selectStart()
    })
  }, [editor, tableCellNode])

  const mergeTableCellsAtSelection = () => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isTableSelection(selection)) {
        const { columns, rows } = computeSelectionCount(selection)
        const nodes = selection.getNodes()
        let firstCell: TableCellNode | null = null
        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i]
          if ($isTableCellNode(node)) {
            if (firstCell === null) {
              node.setColSpan(columns).setRowSpan(rows)
              firstCell = node
              const isEmpty = $cellContainsEmptyParagraph(node)
              let firstChild
              if (isEmpty && $isParagraphNode((firstChild = node.getFirstChild()))) {
                firstChild.remove()
              }
            } else if ($isTableCellNode(firstCell)) {
              const isEmpty = $cellContainsEmptyParagraph(node)
              if (!isEmpty) {
                firstCell.append(...node.getChildren())
              }
              node.remove()
            }
          }
        }
        if (firstCell !== null) {
          if (firstCell.getChildrenSize() === 0) {
            firstCell.append($createParagraphNode())
          }
          $selectLastDescendant(firstCell)
        }
        onClose()
      }
    })
  }

  const unmergeTableCellsAtSelection = () => {
    editor.update(() => {
      $unmergeCell()
    })
  }

  const insertTableRowAtSelection = useCallback(
    (shouldInsertAfter: boolean) => {
      editor.update(() => {
        $insertTableRow__EXPERIMENTAL(shouldInsertAfter)
        onClose()
      })
    },
    [editor, onClose],
  )

  const insertTableColumnAtSelection = useCallback(
    (shouldInsertAfter: boolean) => {
      editor.update(() => {
        for (let i = 0; i < selectionCounts.columns; i++) {
          $insertTableColumn__EXPERIMENTAL(shouldInsertAfter)
        }
        onClose()
      })
    },
    [editor, onClose, selectionCounts.columns],
  )

  const deleteTableRowAtSelection = useCallback(() => {
    editor.update(() => {
      $deleteTableRow__EXPERIMENTAL()
      onClose()
    })
  }, [editor, onClose])

  const deleteTableAtSelection = useCallback(() => {
    editor.update(() => {
      const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode)
      const root = $getRoot()
      tableNode.remove()

      //prevent setting editor state empty
      //else error will be thrown
      if (root.isEmpty()) {
        const p = $createParagraphNode()
        root.append(p)
      }

      clearTableSelection()
      onClose()
    })
  }, [editor, tableCellNode, clearTableSelection, onClose])

  const deleteTableColumnAtSelection = useCallback(() => {
    editor.update(() => {
      $deleteTableColumn__EXPERIMENTAL()
      onClose()
    })
  }, [editor, onClose])

  const toggleTableRowIsHeader = useCallback(() => {
    editor.update(() => {
      const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode)

      const tableRowIndex = $getTableRowIndexFromTableCellNode(tableCellNode)

      const tableRows = tableNode.getChildren()

      if (tableRowIndex >= tableRows.length || tableRowIndex < 0) {
        throw new Error('Expected table cell to be inside of table row.')
      }

      const tableRow = tableRows[tableRowIndex]

      if (!$isTableRowNode(tableRow)) {
        throw new Error('Expected table row')
      }

      tableRow.getChildren().forEach((tableCell) => {
        if (!$isTableCellNode(tableCell)) {
          throw new Error('Expected table cell')
        }

        tableCell.toggleHeaderStyle(TableCellHeaderStates.ROW)
      })

      clearTableSelection()
      onClose()
    })
  }, [editor, tableCellNode, clearTableSelection, onClose])

  const toggleTableColumnIsHeader = useCallback(() => {
    editor.update(() => {
      const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode)

      const tableColumnIndex = $getTableColumnIndexFromTableCellNode(tableCellNode)

      const tableRows = tableNode.getChildren<TableRowNode>()
      const maxRowsLength = Math.max(...tableRows.map((row) => row.getChildren().length))

      if (tableColumnIndex >= maxRowsLength || tableColumnIndex < 0) {
        throw new Error('Expected table cell to be inside of table row.')
      }

      for (let r = 0; r < tableRows.length; r++) {
        const tableRow = tableRows[r]

        if (!$isTableRowNode(tableRow)) {
          throw new Error('Expected table row')
        }

        const tableCells = tableRow.getChildren()
        if (tableColumnIndex >= tableCells.length) {
          // if cell is outside of bounds for the current row (for example various merge cell cases) we shouldn't highlight it
          continue
        }

        const tableCell = tableCells[tableColumnIndex]

        if (!$isTableCellNode(tableCell)) {
          throw new Error('Expected table cell')
        }

        tableCell.toggleHeaderStyle(TableCellHeaderStates.COLUMN)
      }

      clearTableSelection()
      onClose()
    })
  }, [editor, tableCellNode, clearTableSelection, onClose])

  let mergeCellButton: JSX.Element | null = null
  if (cellMerge) {
    if (canMergeCells) {
      mergeCellButton = (
        <button
          className="item"
          data-test-id="table-merge-cells"
          onClick={() => mergeTableCellsAtSelection()}
          type="button"
        >
          {t('merge_cells')}
        </button>
      )
    } else if (canUnmergeCell) {
      mergeCellButton = (
        <button
          className="item"
          data-test-id="table-unmerge-cells"
          onClick={() => unmergeTableCellsAtSelection()}
          type="button"
        >
          {t('unmerge_cells')}
        </button>
      )
    }
  }

  const ColorPickerComponent = useMemo(
    () => (
      <ColorPicker
        onChange={(value) => setColorPickerValue(value)}
        color={backgroundColor}
        predefinedColors={predefinedColors}
      />
    ),
    [backgroundColor],
  )

  const handleClickBackgroundColor = () => {
    //don't hide menu in click away listener
    //otherwise it will not recieve latest shouldApplyColor prop
    setLockMenu(true)
    toggleModal(drawerSlug)
    setColorPicker(ColorPickerComponent)
  }

  const handleRemoveBackgroundColor = () => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection) || $isTableSelection(selection)) {
        const [cell] = $getNodeTriplet(selection.anchor)
        if ($isTableCellNode(cell)) {
          cell.setBackgroundColor(null)
        }

        if ($isTableSelection(selection)) {
          const nodes = selection.getNodes()

          for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i]
            if ($isTableCellNode(node)) {
              node.setBackgroundColor(null)
            }
          }
        }
      }
    })
  }

  return createPortal(
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      className="table-action-menu-dropdown"
      onClick={(e) => {
        e.stopPropagation()
      }}
      ref={dropDownRef}
    >
      {mergeCellButton}
      <button
        className="item"
        data-test-id="table-background-color"
        onClick={handleClickBackgroundColor}
        type="button"
      >
        <span className="text">{t('background_color')}</span>
      </button>
      {currentCellBackgroundColor(editor) && (
        <button
          className="item"
          data-test-id="table-remove-background-color"
          onClick={handleRemoveBackgroundColor}
          type="button"
        >
          <span className="text">{t('remove_background')}</span>
        </button>
      )}

      <hr />
      <button
        className="item"
        data-test-id="table-insert-row-above"
        onClick={() => insertTableRowAtSelection(false)}
        type="button"
      >
        <span className="text">
          {t('insert')}{' '}
          {selectionCounts.rows === 1 ? t('row') : `${selectionCounts.rows} ${t('rows')}`}{' '}
          {t('above')}
        </span>
      </button>
      <button
        className="item"
        data-test-id="table-insert-row-below"
        onClick={() => insertTableRowAtSelection(true)}
        type="button"
      >
        <span className="text">
          {t('insert')}{' '}
          {selectionCounts.rows === 1 ? t('row') : `${selectionCounts.rows} ${t('rows')}`}{' '}
          {t('below')}
        </span>
      </button>
      <hr />
      <button
        className="item"
        data-test-id="table-insert-column-before"
        onClick={() => insertTableColumnAtSelection(false)}
        type="button"
      >
        <span className="text">
          {t('insert')}{' '}
          {selectionCounts.columns === 1
            ? t('column')
            : `${selectionCounts.columns} ${t('columns')}`}{' '}
          {t('left')}
        </span>
      </button>
      <button
        className="item"
        data-test-id="table-insert-column-after"
        onClick={() => insertTableColumnAtSelection(true)}
        type="button"
      >
        <span className="text">
          {t('insert')}{' '}
          {selectionCounts.columns === 1
            ? t('column')
            : `${selectionCounts.columns} ${t('columns')}`}{' '}
          {t('right')}
        </span>
      </button>
      <hr />
      <button
        className="item"
        data-test-id="table-delete-columns"
        onClick={() => deleteTableColumnAtSelection()}
        type="button"
      >
        <span className="text">{t('delete_column')}</span>
      </button>
      <button
        className="item"
        data-test-id="table-delete-rows"
        onClick={() => deleteTableRowAtSelection()}
        type="button"
      >
        <span className="text">{t('delete_row')}</span>
      </button>
      <button
        className="item"
        data-test-id="table-delete"
        onClick={() => deleteTableAtSelection()}
        type="button"
      >
        <span className="text">{t('delete_table')}</span>
      </button>
      <hr />
      <button className="item" onClick={() => toggleTableRowIsHeader()} type="button">
        <span className="text">
          {(tableCellNode.__headerState & TableCellHeaderStates.ROW) === TableCellHeaderStates.ROW
            ? t('remove')
            : t('add')}{' '}
          {t('row_header')}
        </span>
      </button>
      <button
        className="item"
        data-test-id="table-column-header"
        onClick={() => toggleTableColumnIsHeader()}
        type="button"
      >
        <span className="text">
          {(tableCellNode.__headerState & TableCellHeaderStates.COLUMN) ===
          TableCellHeaderStates.COLUMN
            ? t('remove')
            : t('add')}{' '}
          {t('column_header')}
        </span>
      </button>
    </div>,
    document.body,
  )
}

function TableCellActionMenuContainer({
  anchorElem,
  cellMerge,
}: {
  anchorElem: HTMLElement
  cellMerge: boolean
}): JSX.Element {
  const [editor] = useLexicalComposerContext()

  const menuButtonRef = useRef(null)
  const menuRootRef = useRef(null)
  const [isMenuOpen, setIsMenuOpen] = useState(true)
  const [ColorPickerComponent, setColorPickerComponent] = useState<JSX.Element | null>(null)
  const [shouldApplyColor, setShouldApplyColor] = useState(false)
  const [lockMenu, setLockMenu] = useState(false)
  const [tableCellNode, setTableMenuCellNode] = useState<TableCellNode | null>(null)
  const { field } = useEditorConfigContext()
  const { t } = useTranslation('table_action')
  const slug = `table_cell_background_drawer_${field.path}`

  const { toggleModal } = useModal()

  const moveMenu = useCallback(() => {
    const menu = menuButtonRef.current
    const selection = $getSelection()
    const nativeSelection = window.getSelection()
    const activeElement = document.activeElement

    if (selection == null || menu == null) {
      setTableMenuCellNode(null)
      return
    }

    const rootElement = editor.getRootElement()

    if (
      $isRangeSelection(selection) &&
      rootElement !== null &&
      nativeSelection !== null &&
      rootElement.contains(nativeSelection.anchorNode)
    ) {
      const tableCellNodeFromSelection = $getTableCellNodeFromLexicalNode(
        selection.anchor.getNode(),
      )

      if (tableCellNodeFromSelection == null) {
        setTableMenuCellNode(null)
        return
      }

      const tableCellParentNodeDOM = editor.getElementByKey(tableCellNodeFromSelection.getKey())

      if (tableCellParentNodeDOM == null) {
        setTableMenuCellNode(null)
        return
      }

      setTableMenuCellNode(tableCellNodeFromSelection)
    } else if (!activeElement) {
      setTableMenuCellNode(null)
    }
  }, [editor])

  useEffect(() => {
    return editor.registerUpdateListener(() => {
      editor.getEditorState().read(() => {
        moveMenu()
      })
    })
  })

  useEffect(() => {
    const menuButtonDOM = menuButtonRef.current as HTMLButtonElement | null

    if (menuButtonDOM != null && tableCellNode != null) {
      const tableCellNodeDOM = editor.getElementByKey(tableCellNode.getKey())

      if (tableCellNodeDOM != null) {
        const tableCellRect = tableCellNodeDOM.getBoundingClientRect()
        const menuRect = menuButtonDOM.getBoundingClientRect()
        const anchorRect = anchorElem.getBoundingClientRect()

        const top = tableCellRect.top - anchorRect.top + 4
        const left = tableCellRect.right - menuRect.width - 10 - anchorRect.left

        menuButtonDOM.style.opacity = '1'
        menuButtonDOM.style.transform = `translate(${left}px, ${top}px)`
      } else {
        menuButtonDOM.style.opacity = '0'
        menuButtonDOM.style.transform = 'translate(-10000px, -10000px)'
      }
    }
  }, [menuButtonRef, tableCellNode, editor, anchorElem])

  const prevTableCellDOM = useRef(tableCellNode)

  useEffect(() => {
    if (prevTableCellDOM.current !== tableCellNode) {
      setIsMenuOpen(false)
    }

    prevTableCellDOM.current = tableCellNode
  }, [prevTableCellDOM, tableCellNode])

  return (
    <div className="table-cell-action-button-container" ref={menuButtonRef}>
      {tableCellNode != null && (
        <React.Fragment>
          <button
            className="table-cell-action-button chevron-down"
            onClick={(e) => {
              e.stopPropagation()
              setIsMenuOpen(!isMenuOpen)
            }}
            ref={menuRootRef}
            type="button"
          >
            <i className="chevron-down" />
          </button>
          <Drawer slug={slug}>
            {ColorPickerComponent}
            <Button
              onClick={() => {
                setShouldApplyColor(true)
                setLockMenu(false)
                toggleModal(slug)
              }}
            >
              {t('apply')}
            </Button>
            <Button
              onClick={() => {
                toggleModal(slug)
                setShouldApplyColor(false)
                setLockMenu(false)
              }}
            >
              {' '}
              {t('cancel')}
            </Button>
          </Drawer>
          {isMenuOpen && (
            <TableActionMenu
              cellMerge={cellMerge}
              contextRef={menuRootRef}
              onClose={() => setIsMenuOpen(false)}
              setIsMenuOpen={setIsMenuOpen}
              setColorPicker={(component) => setColorPickerComponent(component)}
              tableCellNode={tableCellNode}
              drawerSlug={slug}
              shouldApplyColor={shouldApplyColor}
              setShouldApplyColor={(v) => setShouldApplyColor(v)}
              lockMenu={lockMenu}
              setLockMenu={(v: boolean) => setLockMenu(v)}
            />
          )}
        </React.Fragment>
      )}
    </div>
  )
}

export default function TableActionMenuPlugin({
  anchorElem = document.body,
  cellMerge = true,
}: {
  anchorElem?: HTMLElement
  cellMerge?: boolean
}): ReactPortal | null {
  return createPortal(
    <TableCellActionMenuContainer anchorElem={anchorElem} cellMerge={cellMerge} />,
    anchorElem,
  )
}
