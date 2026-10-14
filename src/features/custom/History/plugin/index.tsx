import * as React from 'react'
import { useSharedHistoryStore } from '../store'
import { HistoryPlugin } from '../../Shared/PatchedHistory'

export default function SharedHistoryPlugin() {
  const { sharedHistory } = useSharedHistoryStore()
  //patched history is used. If <HistoryPlugin> is already
  //present in the lexical editor, it will not work properly.
  //You need to patch lexical editor and remove history plugin from it
  //to use this implementation
  return <HistoryPlugin externalHistoryState={sharedHistory} />
}
