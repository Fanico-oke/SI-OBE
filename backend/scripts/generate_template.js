const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const data = [
  {
    'Nama': 'Kurikulum Teknik Elektro 2026',
    'Prodi': 'Teknik Elektro',
    'Tahun Mulai': 2026,
    'Tahun Selesai': 2030,
    'Deskripsi': 'Kurikulum berbasis OBE berstandar internasional.',
    'Status': 'Draft'
  },
  {
    'Nama': 'Kurikulum Akuntansi 2026',
    'Prodi': 'Akuntansi',
    'Tahun Mulai': 2026,
    'Tahun Selesai': 2030,
    'Deskripsi': 'Kurikulum OBE untuk jurusan akuntansi.',
    'Status': 'Published'
  }
];

const ws = xlsx.utils.json_to_sheet(data);
const wb = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(wb, ws, "Template Kurikulum");

// Fixed path resolving to D:/laragon/... correctly instead of using __dirname blindly
const publicDir = path.resolve('..', 'frontend', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const filePath = path.join(publicDir, 'template_kurikulum.xlsx');
xlsx.writeFile(wb, filePath);
console.log('Template created at:', filePath);
