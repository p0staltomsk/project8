/**
 * @deprecated This file needs refactoring:
 * - Remove Next.js dependencies
 * - Move API logic to services
 * - Use Vite-compatible approach
 * 
 * Current implementation is kept for reference only.
 * See src/services/fileSystem.ts for the active implementation.
 */

import { fileSystem } from '@/services/fileSystem'

export interface ProjectFile {
  name: string
  content: string
  path: string
}

export async function handleImportProject(files: ProjectFile[]): Promise<void> {
  try {
    // Очищаем текущие файлы
    fileSystem.files = []
    fileSystem.folders = [{ id: 'root', name: 'Root', parentId: null }]

    // Импортируем новые файлы
    for (const file of files) {
      const pathParts = file.path.split('/')
      let currentParentId = 'root'

      // Создаем папки если их нет
      for (let i = 0; i < pathParts.length - 1; i++) {
        const folderName = pathParts[i]
        let folder = fileSystem.folders.find(f => f.name === folderName && f.parentId === currentParentId)
        if (!folder) {
          folder = fileSystem.createFolder(folderName, currentParentId)
        }
        currentParentId = folder.id
      }

      // Создаем файл
      fileSystem.createFile(file.name, file.content, currentParentId)
    }
  } catch (error) {
    console.error('Import failed:', error)
    throw error
  }
}
