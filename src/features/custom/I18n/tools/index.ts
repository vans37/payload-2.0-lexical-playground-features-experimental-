export default function addNamespaceToI18nFile(
  object: {
    [language: string]: Record<string, any>
  },
  namespace: string,
) {
  const result = {}
  Object.keys(object).forEach((lang) => {
    result[lang] = {
      [namespace]: object[lang],
    }
  })

  return result
}
