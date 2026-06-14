// Copia o worker do pdf.js (pdfjs-dist) para public/, para que o
// DocumentPreview o sirva same-origin em vez de depender de um CDN externo.
import { copyFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const src = path.join(__dirname, '..', 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.min.mjs');
const dest = path.join(__dirname, '..', 'public', 'pdf.worker.min.mjs');

copyFileSync(src, dest);
console.log(`pdf.worker.min.mjs copiado para public/`);
