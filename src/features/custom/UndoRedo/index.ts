import {
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  REDO_COMMAND,
  UNDO_COMMAND,
} from 'lexical'
import { FeatureProviderWithToolbar } from '../../../features/lib/types'
import { ArrowCounterClockwiseIcon } from '../../../features/lib/ui/icons/ArrowCounterClockwise'
import { ArrowClockwiseIcon } from '../../../features/lib/ui/icons/ArrowClockwise'

let isRedoEnabled = false
let isUndoEnabled = false

export const UndoRedoFeature = (): FeatureProviderWithToolbar => {
  return {
    feature: () => {
      return {
        props: null,
        toolbarFixed: {
          groups: [
            {
              type: 'buttons',
              items: [
                {
                  ChildComponent: ArrowCounterClockwiseIcon,
                  isEnabled: ({ editor }) => {
                    editor.registerCommand<boolean>(
                      CAN_UNDO_COMMAND,
                      (payload) => {
                        isUndoEnabled = payload
                        return false
                      },
                      COMMAND_PRIORITY_CRITICAL,
                    )
                    return isUndoEnabled
                  },

                  key: 'undo_history',
                  onSelect: ({ editor }) => {
                    editor.dispatchCommand(UNDO_COMMAND, undefined)
                  },
                  order: 10,
                },
                {
                  ChildComponent: ArrowClockwiseIcon,
                  isEnabled: ({ editor }) => {
                    editor.registerCommand<boolean>(
                      CAN_REDO_COMMAND,
                      (payload) => {
                        isRedoEnabled = payload
                        return false
                      },
                      COMMAND_PRIORITY_CRITICAL,
                    )
                    return isRedoEnabled
                  },
                  key: 'redo_history',
                  onSelect: ({ editor }) => {
                    editor.dispatchCommand(REDO_COMMAND, undefined)
                  },
                  order: 20,
                },
              ],
              key: 'history_undo_redo',
              order: 10,
            },
          ],
        },
      }
    },
    key: 'undo_redo',
  }
}
