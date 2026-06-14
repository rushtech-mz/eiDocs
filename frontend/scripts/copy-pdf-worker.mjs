// Copia o worker do pdf.js (pdfjs-dist) para public/, para que o
// DocumentPreview o sirva same-origin em vez de depender de um CDN externo.
//
// O `pdfjs` usado pelo DocumentPreview vem de `react-pdf` (`import { pdfjs }
// from 'react-pdf'`), que tem a sua própria dependência `pdfjs-dist`
// (normalmente nested em node_modules/react-pdf/node_modules/pdfjs-dist),
// possivelmente numa versão diferente da declarada diretamente em
// package.json. O worker copiado tem de corresponder à versão da API que o
// `pdfjs` do react-pdf reporta (`pdfjs.version`), senão o pdf.js lança
// "API version does not match Worker version". Por isso preferimos a cópia
// nested do react-pdf, e só usamos a top-level como fallback.
import { copyFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const nestedSrc = path.join(root, 'node_modules', 'react-pdf', 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.min.mjs');
const topLevelSrc = path.join(root, 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.min.mjs');
const src = existsSync(nestedSrc) ? nestedSrc : topLevelSrc;
const dest = path.join(root, 'public', 'pdf.worker.min.mjs');

copyFileSync(src, dest);
console.log(`pdf.worker.min.mjs copiado de ${path.relative(root, src)} para public/`);
