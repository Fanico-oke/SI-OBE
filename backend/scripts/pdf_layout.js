const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

async function extract() {
    const doc = await pdfjsLib.getDocument('../docs/Rancangan Kurikulum SI Gasal 24-25 3.pdf').promise;
    
    // We know PL-CPL table is around page 5 or 6 (since MK-CPL is around 8-10)
    for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        
        const hasPLCPL = content.items.some(item => item.str.includes('Profil Lulusan (PL)'));
        if (hasPLCPL) {
            console.log(`--- PAGE ${i} ---`);
            // Sort items by Y descending, then X ascending
            const items = content.items.map(item => ({
                text: item.str,
                x: item.transform[4],
                y: item.transform[5]
            })).sort((a, b) => {
                if (Math.abs(b.y - a.y) > 2) return b.y - a.y; // group lines
                return a.x - b.x;
            });
            
            let lastY = -1;
            let line = '';
            for (const item of items) {
                if (Math.abs(item.y - lastY) > 2) {
                    if (line.trim()) console.log(line);
                    line = '';
                    lastY = item.y;
                }
                line += `[X:${Math.round(item.x)}] ${item.text}  `;
            }
            if (line.trim()) console.log(line);
        }
    }
}
extract().catch(console.error);
