import formidable from 'formidable';
import fs from 'fs';
import fetch from 'node-fetch';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Erreur parsing form' });

    const bbox = fields.bbox;
    const file = files.file;

    // Forward en multipart vers le backend Python
    const formData = new FormData();
    formData.append('file', fs.createReadStream(file.filepath), file.originalFilename);
    formData.append('bbox', bbox);

    const backendResponse = await fetch('http://localhost:8000/upload', {
      method: 'POST',
      body: formData
    });

    const data = await backendResponse.json();
    res.status(backendResponse.status).json(data);
  });
}