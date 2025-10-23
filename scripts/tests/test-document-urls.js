// Script para probar URLs de documentos
const testUrls = [
  'http://localhost:3000/uploads/delivery-applications/4_1760148157461_cv.pdf',
  'http://localhost:3000/uploads/delivery-applications/4_1760148157464_id_document.pdf',
  'http://localhost:3000/uploads/delivery-applications/4_1760148157466_license_photo.pdf',
  'http://localhost:3000/uploads/delivery-applications/2_1760148975474_cv.pdf'
];

async function testUrl(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    console.log(`OK ${url} - Status: ${response.status} ${response.ok ? 'OK' : 'ERROR'}`);
  } catch (error) {
    console.log(`Error ${url} - Error: ${error.message}`);
  }
}

async function testAllUrls() {
  console.log(' Probando URLs de documentos...\n');
  
  for (const url of testUrls) {
    await testUrl(url);
  }
  
  console.log('\n Prueba completada');
}

testAllUrls();