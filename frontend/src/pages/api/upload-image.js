import formidable from 'formidable';
import fs from 'fs';
import FormData from 'form-data';
import axios from 'axios';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const form = formidable();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur parsing form' });
    }

    // Récupère le fichier image
    let file;
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
    let bboxValue;
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
      // Envoi direct sans sauvegarde de fichiers
      const formData = new FormData();
      console.log("Fichier à envoyer :", file.toString());
      console.log("Bbox à envoyer :", bboxValue);
      formData.append('file', fs.createReadStream(file.filepath), {
        filename: file.filepath,
        contentType: 'image/jpeg'
      });
      formData.append('target_bbox', bboxValue);

      try {
        const response = await axios.post(
          // à changer lors du déploiement
          'http://172.21.0.2:8000/detect_ball',
          formData,
          { headers: formData.getHeaders() }
        );
        console.log('Réponse de l\'API Python:', response.data);
        res.status(200).json(response.data);
      } catch (error) {
        console.error('Erreur lors de la requête à l\'API Python:', error.response.data);
        res.status(500).json({ error: 'Erreur lors de la requête à l\'API Python', details: error.message });
      }
    } catch (e) {
        console.error('Erreur lors de la requête à l\'API Python:', e);
      res.status(500).json({ error: 'Erreur lors de la préparation des données' });
    }
  });
}