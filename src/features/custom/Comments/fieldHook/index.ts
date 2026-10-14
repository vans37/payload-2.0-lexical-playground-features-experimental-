import { FieldHookArgs } from 'payload/types'

//parse editor state, find comments node, extract comments from it,
//push comments to comments collections and remove node to prevent leaking into the user frontend
export const commentsHook = async (args: FieldHookArgs) => {
  const previousValue = args.previousDoc
  const currentValue = args.value
}
