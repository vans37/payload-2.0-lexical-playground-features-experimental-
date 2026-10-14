import { create } from 'zustand'
import { createEmptyHistoryState, HistoryState } from '../../Shared/PatchedHistory/history'

interface HistoryStateStore {
  sharedHistory: HistoryState
}

export const useSharedHistoryStore = create<HistoryStateStore>(() => ({
  sharedHistory: createEmptyHistoryState(),
}))
