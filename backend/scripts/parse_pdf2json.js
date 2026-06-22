const fs = require('fs');
const PDFParser = require('pdf2json');

const pdfParser = new PDFParser();

pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError));
pdfParser.on("pdfParser_dataReady", pdfData => {
    for (let p = 0; p < pdfData.Pages.length; p++) {
        const page = pdfData.Pages[p];
        const texts = page.Texts.map(t => {
            let str = '';
            try {
                str = decodeURIComponent(t.R[0].T);
            } catch (e) {
                str = '???';
            }
            return {
                text: str,
                x: t.x,
                y: t.y
            };
        });

        texts.sort((a, b) => {
            if (Math.abs(b.y - a.y) > 0.5) return a.y - b.y;
            return a.x - b.x;
        });

        const pageText = texts.map(t => t.text).join(' ');
        
        if (pageText.includes('Capaian Pembelajaran Lulusan (CPL)') || 
            pageText.includes('Bahan Kajian (BK)') ||
            pageText.includes('Pemetaan CPL-BK-MK')) {
            
            console.log(`\n--- PAGE ${p + 1} ---`);
            let lastY = -1;
            let line = '';
            for (const t of texts) {
                if (Math.abs(t.y - lastY) > 0.5) {
                    if (line) console.log(line);
                    line = '';
                    lastY = t.y;
                }
                line += `[${t.x.toFixed(2)}]${t.text}  `;
            }
            if (line) console.log(line);
        }
    }
});

pdfParser.loadPDF("../docs/Rancangan Kurikulum SI Gasal 24-25 3.pdf");
