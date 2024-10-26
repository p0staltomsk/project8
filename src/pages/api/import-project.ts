// pages/api/import-project.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { fileSystem } from '@/services/fileSystem'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { files } = req.body

    // Clear existing files and folders
    fileSystem.files = []
    fileSystem.folders = [{ id: 'root', name: 'Root', parentId: null }]

    // Import new files
    files.forEach((file: { name: string, content: string, path: string }) => {
      const pathParts = file.path.split('/')
      let currentParentId = 'root'

      // Create folders if they don't exist
      for (let i = 0; i < pathParts.length - 1; i++) {
        const folderName = pathParts[i]
        let folder = fileSystem.folders.find(f => f.name === folderName && f.parentId === currentParentId)
        if (!folder) {
          folder = fileSystem.createFolder(folderName, currentParentId)
        }
        currentParentId = folder.id
      }

      // Create file
      fileSystem.createFile(file.name, file.content, currentParentId)
    })

    res.status(200).json({ message: 'Project imported successfully' })
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}