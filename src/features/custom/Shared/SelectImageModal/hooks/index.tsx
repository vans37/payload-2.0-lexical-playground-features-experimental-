import { isMimeType, mediaFileReader } from '@lexical/utils'
import { useCallback, useState } from 'react'
import { FileResultDataURL } from '../../../../lib/types'

export const useDropPasteInsert = ({
  acceptableMimeTypes,
}: {
  acceptableMimeTypes: Array<string>
}) => {
  const [files, setFiles] = useState<FileResultDataURL[]>([])
  const [existingFiles, setExistingFiles] = useState<string[]>([])

  const onDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()

      const droppedFiles = e.dataTransfer.files

      if (droppedFiles?.length > 0) {
        const fileRes = await mediaFileReader(Array.from(droppedFiles), acceptableMimeTypes)
        const fileKey = (file: File) => `${file.name}-${file.size}`

        const newFiles = []
        for (const { file, result } of fileRes) {
          const exists = files.some((f) => fileKey(f.file) === fileKey(file))
          if (!exists) {
            newFiles.push({ file, result })
          }
        }
        setFiles((prev) => [...prev, ...newFiles])
      }
    },
    [files, setFiles, setExistingFiles],
  )

  const onPaste = useCallback(
    async (e: React.ClipboardEvent<HTMLDivElement>) => {
      e.preventDefault()

      const droppedFiles = e.clipboardData.files

      if (droppedFiles?.length > 0) {
        const filesRes = await mediaFileReader(Array.from(droppedFiles), acceptableMimeTypes)
        const newFiles: FileResultDataURL[] = []
        for (const { file, result } of filesRes) {
          const fileExists = files.some((f) => f.file.name === file.name)
          if (!fileExists && isMimeType(file, acceptableMimeTypes)) {
            newFiles.push({ file, result })
          } else {
            setExistingFiles((prev) => [...prev, file.name])
          }
        }
        setFiles((prev) => [...prev, ...newFiles])
      }
    },
    [files, setFiles],
  )

  const onFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault()

      const selectedFiles = e.target.files

      if (selectedFiles?.length > 0) {
        const fileRes = await mediaFileReader(Array.from(selectedFiles), acceptableMimeTypes)
        const newFiles: FileResultDataURL[] = []
        for (const { file, result } of fileRes) {
          const fileExists = files.some((f) => f.file.name == file.name)
          if (!fileExists && isMimeType(file, acceptableMimeTypes)) {
            newFiles.push({ file, result })
          } else {
            setExistingFiles((prev) => [...prev, file.name])
          }
        }
        setFiles((prev) => [...prev, ...newFiles])
      }
    },
    [files, setFiles],
  )

  const clearExistingFile = (fileName: string) => {
    setExistingFiles(existingFiles.filter((name) => name !== fileName))
  }

  return {
    files,
    existingFiles,
    onDrop,
    onPaste,
    onFileChange,
    clearExistingFile,
  }
}
