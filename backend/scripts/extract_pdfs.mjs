import fs from 'fs';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

async function extractPDF(filePath) {
  const data = new Uint8Array(fs.readFileSync(filePath));
  const doc = await getDocument({ data }).promise;
  let fullText = '';
  
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map(item => item.str);
    fullText += strings.join(' ') + '\n\n';
  }
  
  return { text: fullText, numPages: doc.numPages };
}

async function main() {
  const files = [
    'd:/laragon/www/SI-OBE/docs/Perencanaan.pdf',
    'd:/laragon/www/SI-OBE/docs/Rancangan Kurikulum SI Gasal 24-25 (2).pdf',
    'd:/laragon/www/SI-OBE/docs/Rancangan Kurikulum SI Gasal 24-25 3.pdf'
  ];

  for (const f of files) {
    console.log('=== FILE:', f, '===');
    try {
      const result = await extractPDF(f);
      const outFile = f.replace('.pdf', '_extracted.txt');
      fs.writeFileSync(outFile, result.text);
      console.log('Pages:', result.numPages);
      console.log('Saved to:', outFile);
      console.log('--- First 3000 chars ---');
      console.log(result.text.substring(0, 3000));
      console.log('...\n');
    } catch(e) {
      console.log('Error:', e.message);
    }
  }
}

main();
