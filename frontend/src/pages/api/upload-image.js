import formidable from 'formidable';
import fs from 'fs';

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
      console.log("Fichier reçu :", file);
      console.log("Bbox reçu :", bboxValue ? JSON.parse(bboxValue) : null);
      
      // Conversion du fichier en base64 pour retourner au client
      // Le traitement IA se fait maintenant côté client avec localAI
      const fileBuffer = fs.readFileSync(file.filepath);
      const base64Data = fileBuffer.toString('base64');
      const mimeType = file.mimetype || 'image/jpeg';
      const dataUrl = `data:${mimeType};base64,${base64Data}`;
      
      // Retourne les données pour que le client puisse traiter avec l'IA locale
      res.status(200).json({
        success: true,
        message: 'Image reçue - traitement côté client avec IA locale',
        imageData: dataUrl,
        bbox: bboxValue ? JSON.parse(bboxValue) : null
      });
      
    } catch (e) {
      console.error('Erreur lors du traitement de l\'image:', e);
      res.status(500).json({ error: 'Erreur lors du traitement de l\'image' });
    }
  });
}