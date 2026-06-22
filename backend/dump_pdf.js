const fs = require('fs');
const pdf = require('pdf-parse');

let dataBuffer = fs.readFileSync('d:/laragon/www/SI-OBE/docs/Rancangan Kurikulum SI Gasal 24-25 3.pdf');

pdf(dataBuffer).then(function(data) {
    fs.writeFileSync('pdf_dump.txt', data.text, 'utf8');
    console.log('PDF dumped successfully');
}).catch(function(error) {
    console.error(error);
});
