const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const pl = await p.profilLulusan.count();
  const cpl = await p.cPL.count();
  const sd = await p.cPLSnDikti.count();
  const bk = await p.bahanKajian.count();
  const mk = await p.mataKuliah.count();
  const cpmk = await p.cPMK.count();
  const m1 = await p.pemetaanPLCPL.count();
  const m2 = await p.pemetaanCPLBK.count();
  const m3 = await p.pemetaanBKMK.count();
  const m4 = await p.pemetaanCPLMK.count();
  const m5 = await p.pemetaanSnDiktiCPLProdi.count();

  console.log('=== VERIFIKASI DATABASE vs PDF ===');
  console.log('');
  console.log('DATA                  | DB  | PDF | STATUS');
  console.log('----------------------|-----|-----|-------');
  console.log(`Profil Lulusan (PL)   | ${pl}   | 5   | ${pl===5?'✅':'❌'}`);
  console.log(`CPL Prodi             | ${cpl}  | 14  | ${cpl===14?'✅':'❌'}`);
  console.log(`CPL SN-DIKTI          | ${sd}  | 54  | ${sd===54?'✅':'❌'}`);
  console.log(`Bahan Kajian (BK)     | ${bk}  | 21  | ${bk===21?'✅':'❌'}`);
  console.log(`Mata Kuliah (MK)      | ${mk}  | 66  | ${mk===66?'✅':'❌'}`);
  console.log(`CPMK                  | ${cpmk}   | ?   | ${cpmk>0?'✅':'⚠️ kosong'}`);
  console.log('');
  console.log('PEMETAAN              | DB  | STATUS');
  console.log('----------------------|-----|-------');
  console.log(`PL ↔ CPL              | ${m1}  | ${m1>0?'✅':'❌'}`);
  console.log(`CPL ↔ BK              | ${m2}  | ${m2>0?'✅':'❌'}`);
  console.log(`BK ↔ MK               | ${m3}  | ${m3>0?'✅':'❌'}`);
  console.log(`CPL ↔ MK              | ${m4}  | ${m4>0?'✅':'❌'}`);
  console.log(`SN-DIKTI → CPL Prodi  | ${m5}  | ${m5>0?'✅':'❌'}`);

  // Verify PL-CPL mapping detail
  console.log('\n=== DETAIL PL-CPL (dari PDF Page 5) ===');
  const plcpl = await p.pemetaanPLCPL.findMany({ include: { pl: true, cpl: true } });
  const plMap = {};
  plcpl.forEach(m => {
    if (!plMap[m.cpl.kode]) plMap[m.cpl.kode] = [];
    plMap[m.cpl.kode].push(m.pl.kode);
  });
  
  const expected = {
    'CPL01': ['PL1','PL2','PL3','PL5'],
    'CPL02': ['PL1','PL3'],
    'CPL03': ['PL1'],
    'CPL04': ['PL1'],
    'CPL05': ['PL1','PL2','PL3','PL4','PL5'],
    'CPL06': ['PL2'],
    'CPL07': ['PL1'],
    'CPL08': ['PL3'],
    'CPL09': ['PL2'],
    'CPL10': ['PL4'],
    'CPL11': ['PL4'],
    'CPL12': ['PL5'],
    'CPL13': ['PL5'],
    'CPL14': ['PL5'],
  };

  for (const [cplKode, expectedPLs] of Object.entries(expected)) {
    const actual = (plMap[cplKode] || []).sort();
    const exp = expectedPLs.sort();
    const match = JSON.stringify(actual) === JSON.stringify(exp);
    console.log(`${cplKode}: ${match ? '✅' : '❌'} DB=[${actual}] PDF=[${exp}]`);
  }

  // Verify CPL-BK mapping
  console.log('\n=== DETAIL CPL-BK (dari PDF Page 8) ===');
  const cplbk = await p.pemetaanCPLBK.findMany({ include: { cpl: true, bk: true } });
  const bkMap = {};
  cplbk.forEach(m => {
    if (!bkMap[m.bk.kode]) bkMap[m.bk.kode] = [];
    bkMap[m.bk.kode].push(m.cpl.kode);
  });

  const expectedBkCpl = {
    'BK01': ['CPL01','CPL02','CPL05','CPL07','CPL09'],
    'BK02': ['CPL02','CPL08'],
    'BK03': ['CPL04'],
    'BK04': ['CPL07'],
    'BK05': ['CPL03'],
    'BK06': ['CPL06'],
    'BK07': ['CPL03'],
    'BK08': ['CPL04'],
    'BK09': ['CPL05','CPL10','CPL11'],
    'BK10': ['CPL02','CPL07','CPL12','CPL13','CPL14'],
    'BK11': ['CPL02','CPL08'],
    'BK12': ['CPL08'],
    'BK13': ['CPL05','CPL10','CPL11','CPL12','CPL13','CPL14'],
    'BK14': ['CPL09'],
    'BK15': ['CPL04','CPL06'],
    'BK16': ['CPL03'],
    'BK17': ['CPL09'],
    'BK18': ['CPL08'],
    'BK19': ['CPL03'],
    'BK20': ['CPL03'],
    'BK21': ['CPL03'],
  };

  let bkOk = 0, bkFail = 0;
  for (const [bkKode, expectedCPLs] of Object.entries(expectedBkCpl)) {
    const actual = (bkMap[bkKode] || []).sort();
    const exp = expectedCPLs.sort();
    const match = JSON.stringify(actual) === JSON.stringify(exp);
    if (match) bkOk++; else bkFail++;
    if (!match) console.log(`${bkKode}: ❌ DB=[${actual}] PDF=[${exp}]`);
  }
  console.log(`BK-CPL: ${bkOk} benar, ${bkFail} salah`);

  await p.$disconnect();
}
main();
