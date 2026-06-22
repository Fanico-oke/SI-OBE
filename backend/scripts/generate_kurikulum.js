const fs = require('fs');

let html = fs.readFileSync('d:/laragon/www/SI-OBE/frontend/kurikulum.html', 'utf8');

// Extract the main content
const startIndex = html.indexOf('<div class="max-w-container_max mx-auto space-y-gap_section">');
const endIndex = html.indexOf('</main>');

if (startIndex !== -1 && endIndex !== -1) {
    let mainContent = html.substring(startIndex, endIndex);

    // Convert to JSX
    mainContent = mainContent.replace(/class=/g, 'className=');
    mainContent = mainContent.replace(/<!--(.*?)-->/g, '{/* $1 */}');
    
    // Self-closing tags if any
    mainContent = mainContent.replace(/<hr([^>]*)>/g, '<hr$1/>');
    mainContent = mainContent.replace(/<br([^>]*)>/g, '<br$1/>');
    mainContent = mainContent.replace(/<img([^>]*)>/g, '<img$1/>');

    const jsx = `import React from 'react';

export const KurikulumDetail = () => {
  return (
    ${mainContent}
  );
};
`;

    fs.writeFileSync('d:/laragon/www/SI-OBE/frontend/src/pages/KurikulumDetail.tsx', jsx);
    console.log('Successfully created KurikulumDetail.tsx');
} else {
    console.log('Could not find main content');
}
