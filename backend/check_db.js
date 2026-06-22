const{PrismaClient}=require('@prisma/client');
const p=new PrismaClient();
async function main(){
  console.log('SubCPMK:',await p.subCPMK.count());
  console.log('Mahasiswa:',await p.mahasiswa.count());
  console.log('Kelas:',await p.kelas.count());
  console.log('CPMK:',await p.cPMK.count());
  const kelas = await p.kelas.findMany({select:{id:true,nama:true,mkId:true}});
  console.log('Kelas data:', JSON.stringify(kelas));
  await p.$disconnect();
}
main();
