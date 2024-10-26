/**
 * @deprecated This file has TypeScript errors and needs refactoring
 * TODO:
 * 1. Remove Next.js specific code
 * 2. Implement proper file system interface
 * 3. Add validation and error handling
 * 4. Update types for modern structure
 */

import { fileSystem } from '@/services/fileSystem'

export interface ProjectFile {
  name: string
  content: string
  path: string
}

export async function importProject(files: ProjectFile[]): Promise<void> {
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
}

export async function handleImportProject(request: Request): Promise<Response> {
  try {
    const { files } = await request.json()
    await importProject(files)
    return new Response(JSON.stringify({ message: 'Project imported successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to import project' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
