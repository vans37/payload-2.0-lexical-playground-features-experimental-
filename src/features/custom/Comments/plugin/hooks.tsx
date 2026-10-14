import { $isRootTextContentEmpty, $rootTextContent } from '@lexical/text'
import { EditorState, LexicalEditor } from 'lexical'
import { User } from 'payload/auth'
import { useAuth } from 'payload/components/utilities'
import { useCallback } from 'react'

export const useCollabAuthorName = (): string => {
  const { user } = useAuth<User>()

  if (user.firstName) {
    return `${user.firstName} ${user.lastName}`
  } else if (user.email) {
    return `${user.email}`
  }
}

export const useOnChange = (
  setContent: (text: string) => void,
  setCanSubmit: (canSubmit: boolean) => void,
) => {
  return useCallback(
    (editorState: EditorState, _editor: LexicalEditor) => {
      editorState.read(() => {
        setContent($rootTextContent())
        setCanSubmit(!$isRootTextContentEmpty(_editor.isComposing(), true))
      })
    },
    [setCanSubmit, setContent],
  )
}
