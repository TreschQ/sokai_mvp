import fs from 'fs';

// import du fichier image
export default function importerFichier(imagePath) {
    return fs.readFileSync(imagePath);
}