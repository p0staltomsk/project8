// src/services/fileSystem.ts
import { v4 as uuidv4 } from 'uuid'

export interface File {
  id: string
  name: string
  content: string
  parentId: string | null
}

export interface Folder {
  id: string
  name: string
  parentId: string | null
  children?: (File | Folder)[]
}

export class FileSystem {
  files: File[]
  folders: Folder[]

  constructor() {
    this.files = []
    this.folders = [{ id: 'root', name: 'Root', parentId: null }]
  }

  createFile(name: string, content: string, parentId: string = 'root'): File {
    const id = uuidv4()
    const newFile: File = { id, name, content, parentId }
    this.files.push(newFile)
    return newFile
  }

  createFolder(name: string, parentId: string = 'root'): Folder {
    const id = uuidv4()
    const newFolder: Folder = { id, name, parentId }
    this.folders.push(newFolder)
    return newFolder
  }

  getFileById(id: string): File | undefined {
    return this.files.find(file => file.id === id)
  }

  getFolderById(id: string): Folder | undefined {
    return this.folders.find(folder => folder.id === id)
  }

  getFileTree(): (File | Folder)[] {
    const buildTree = (parentId: string | null): (File | Folder)[] => {
      const folders = this.folders
        .filter(folder => folder.parentId === parentId)
        .map(folder => ({
          ...folder,
          children: buildTree(folder.id)
        }))

      const files = this.files.filter(file => file.parentId === parentId)

      return [...folders, ...files]
    }

    return buildTree('root')
  }
}

export const fileSystem = new FileSystem()
