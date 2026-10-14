import type { EditorThemeClasses } from 'lexical'

import './CommentEditorTheme.css'

import { theme as baseTheme } from '../../../lib/LexicalEditorTheme'

const theme: EditorThemeClasses = {
  ...baseTheme,
  paragraph: 'CommentEditorTheme__paragraph',
}

export default theme
