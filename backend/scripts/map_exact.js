const fs = require('fs');

const coordsTxt = fs.readFileSync('coords.txt', 'utf8');
const lines = coordsTxt.split('\n');

function parseLine(line) {
    const regex = /\[([\d.]+)\]([^\[]+)/g;
    const items = [];
    let match;
    while ((match = regex.exec(line)) !== null) {
        items.push({
            x: parseFloat(match[1]),
            text: match[2].trim()
        });
    }
    return items;
}

function mapToClosest(vItems, headers) {
    const result = [];
    for (const v of vItems) {
        let closest = null;
        let minDiff = Infinity;
        for (const h of headers) {
            const diff = Math.abs(v.x - h.x);
            // Some columns might have weird offsets, find the absolute closest header
            if (diff < minDiff) {
                minDiff = diff;
                closest = h.text;
            }
        }
        if (closest && !result.includes(closest)) {
            result.push(closest);
        }
    }
    return result;
}

// 1. Parse CPL-BK (Page 8)
console.log("=== CPL-BK ===");
const cplBkHeaders = [
    {x: 5.83, text: 'CPL01'}, {x: 7.90, text: 'CPL02'}, {x: 9.97, text: 'CPL03'}, {x: 12.03, text: 'CPL04'},
    {x: 14.10, text: 'CPL05'}, {x: 16.17, text: 'CPL06'}, {x: 18.24, text: 'CPL07'}, {x: 20.30, text: 'CPL08'},
    {x: 22.37, text: 'CPL09'}, {x: 24.44, text: 'CPL10'}, {x: 26.50, text: 'CPL11'}, {x: 28.57, text: 'CPL12'},
    {x: 30.79, text: 'CPL13'}, {x: 33.05, text: 'CPL14'}
];

const cplBkMap = {};
for (let i = 4; i <= 24; i++) { // Lines 5 to 25
    const items = parseLine(lines[i]);
    if (items.length > 0 && items[0].text.startsWith('BK')) {
        const bk = items[0].text;
        const vs = items.filter(it => it.text.toLowerCase() === 'v' || it.text.toLowerCase() === 'v');
        cplBkMap[bk] = mapToClosest(vs, cplBkHeaders);
    }
}
console.log(cplBkMap);

// 2. Parse MK-BK (Page 9)
console.log("\n=== MK-BK ===");
const mkBkHeaders = [
    {x: 9.65, text: 'BK01'}, {x: 10.45, text: 'BK02'}, {x: 11.24, text: 'BK03'}, {x: 12.04, text: 'BK04'},
    {x: 12.84, text: 'BK05'}, {x: 13.63, text: 'BK06'}, {x: 14.43, text: 'BK07'}, {x: 15.23, text: 'BK08'},
    {x: 16.02, text: 'BK09'}, {x: 16.87, text: 'BK10'}, {x: 17.71, text: 'BK11'}, {x: 18.54, text: 'BK12'},
    {x: 19.46, text: 'BK13'}, {x: 20.29, text: 'BK14'}, {x: 21.02, text: 'BK15'}, {x: 21.74, text: 'BK16'},
    {x: 22.47, text: 'BK17'}, {x: 23.20, text: 'BK18'}, {x: 23.92, text: 'BK19'}, {x: 24.65, text: 'BK20'},
    {x: 25.38, text: 'BK21'}
];

const mkBkMap = {};
let currentMK = null;
for (let i = 28; i <= 97; i++) {
    const items = parseLine(lines[i]);
    const vs = items.filter(it => it.text.toLowerCase() === 'v' || it.text.toLowerCase() === 'v');
    
    // Check if this line defines a new MK
    const mkItem = items.find(it => it.text.match(/^MK\d+$/));
    if (mkItem) {
        currentMK = mkItem.text;
        if (!mkBkMap[currentMK]) mkBkMap[currentMK] = [];
    }
    
    if (currentMK && vs.length > 0) {
        const mapped = mapToClosest(vs, mkBkHeaders);
        mkBkMap[currentMK] = [...new Set([...mkBkMap[currentMK], ...mapped])];
    }
}
console.log(mkBkMap);

// 3. Parse MK-CPL (Page 10)
console.log("\n=== MK-CPL ===");
const mkCplHeaders = [
    {x: 8.98, text: 'CPL01'}, {x: 10.05, text: 'CPL02'}, {x: 11.06, text: 'CPL03'}, {x: 12.07, text: 'CPL04'},
    {x: 13.08, text: 'CPL05'}, {x: 14.07, text: 'CPL06'}, {x: 15.02, text: 'CPL07'}, {x: 15.97, text: 'CPL08'},
    {x: 16.90, text: 'CPL09'}, {x: 17.82, text: 'CPL10'}, {x: 18.86, text: 'CPL11'}, {x: 20.07, text: 'CPL12'},
    {x: 21.20, text: 'CPL13'}, {x: 22.26, text: 'CPL14'}
];

const mkCplMap = {};
currentMK = null;
for (let i = 101; i <= 162; i++) {
    const items = parseLine(lines[i]);
    const vs = items.filter(it => it.text.toLowerCase() === 'v' || it.text.toLowerCase() === 'v');
    
    // Find MKXX, it might be on the same line or previous line
    // But in page 10, MK code is usually explicitly there, wait, Page 10 doesn't have MKXX code!
    // Page 10 only has numbers like 1, 2, 3 and Names!
    // But I know the exact MKs. Wait, page 9 has MK codes. I can match by name or number.
    const noItem = items.find(it => /^\d+$/.test(it.text) && it.x < 4);
    if (noItem) {
        currentMK = 'MK' + noItem.text.padStart(2, '0');
        if (!mkCplMap[currentMK]) mkCplMap[currentMK] = [];
    }

    if (currentMK && vs.length > 0) {
        const mapped = mapToClosest(vs, mkCplHeaders);
        mkCplMap[currentMK] = [...new Set([...mkCplMap[currentMK], ...mapped])];
    }
}
console.log(mkCplMap);
