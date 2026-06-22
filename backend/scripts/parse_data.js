const fs = require('fs');
const text = fs.readFileSync('docs/Rancangan Kurikulum SI Gasal 24-25 3_extracted.txt', 'utf8');
const lines = text.split('\n');

// A simple utility to extract a block between two line numbers
const getLines = (startStr, endStr) => {
    let startIdx = lines.findIndex(l => l.startsWith(startStr));
    let endIdx = lines.findIndex(l => l.startsWith(endStr));
    if (endIdx === -1) endIdx = lines.length;
    return lines.slice(startIdx + 1, endIdx).filter(l => l.trim().length > 0);
};

// 1. PL
const plLines = getLines('1: No   Kode PL', '2:');
const pls = plLines.map(l => {
    const match = l.match(/PL\d+/g);
    if (!match) return null;
    return l;
});

// We can just dump the whole text and let the LLM see it.
// Wait, I already viewed the text!
