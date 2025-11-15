async function testEndpoint() {
  try {
    console.log('Probando endpoint: http://localhost:3000/api/v1/restaurants/1');
    const response = await fetch('http://localhost:3000/api/v1/restaurants/1');
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('\nRestaurante:', data.data?.name);
    console.log('Productos:', data.data?.products?.length || 0);
    if (data.data?.products?.length > 0) {
      console.log('\nPrimeros 3 productos:');
      data.data.products.slice(0, 3).forEach(p => {
        console.log(`- ${p.name}: $${p.price}`);
      });
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
  process.exit(0);
}

testEndpoint();
