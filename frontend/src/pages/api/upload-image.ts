import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import childProcess from 'child_process';


export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req : NextApiRequest, res : NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const form = formidable();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur parsing form' });
    }

    // Récupère le fichier image
    let file: formidable.File | undefined;
    const fileField = files.file;
    if (Array.isArray(fileField)) {
      file = fileField[0];
    } else {
      file = fileField;
    }

    if (!file || !file.filepath) {
      return res.status(400).json({ error: 'Fichier manquant' });
    }

    // Récupère le bbox (json)
    const bbox = fields.bbox || fields.data;
    let bboxValue: string;
    if (Array.isArray(bbox)) {
      bboxValue = bbox[0];
    } else if (typeof bbox === 'object' && bbox !== null) {
      bboxValue = JSON.stringify(bbox);
    } else if (typeof bbox === 'string') {
      bboxValue = bbox;
    } else {
      bboxValue = '';
    }

    try {
      // Chemins de sauvegarde
      const imagePath = path.join("/root/sokai_mvp/src/pages/api/", 'capture.jpg');
      const jsonPath = path.join("/root/sokai_mvp/src/pages/api/", 'box.json');

      // Sauvegarde l'image
      await fs.promises.copyFile(file.filepath, imagePath);

      // Sauvegarde le JSON
      await fs.promises.writeFile(jsonPath, bboxValue, 'utf-8');

      const output = childProcess.execSync(`python3 /root/sokai_mvp/src/pages/api/request.py`).toString();
      
      res.status(200).json(output);
    } catch (e) {
      res.status(500).json({ error: 'Erreur lors de la sauvegarde des fichiers' });
    }
  });
}