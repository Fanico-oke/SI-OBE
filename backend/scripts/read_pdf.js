const fs = require('fs');
const pdf = require('pdf-parse');

let dataBuffer = fs.readFileSync('d:/laragon/www/SI-OBE/docs/Rancangan Kurikulum SI Gasal 24-25 3.pdf');

pdf(dataBuffer).then(function(data) {
    // Print first 2000 characters
    console.log(data.text.substring(0, 4000));
}).catch(function(error) {
    console.error(error);
});
