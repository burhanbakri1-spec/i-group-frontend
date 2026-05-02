import https from 'https';

const getProductData = async () => {
  return new Promise((resolve, reject) => {
    https.get('https://backend.igroup.website/api/v1/products/featured?limit=8', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
};

getProductData().then(data => {
  const product = data.data[0];
  console.log('=== PRODUCT IMAGE DEBUG ===');
  console.log('Product ID:', product.id);
  console.log('Product Name:', product.name);
  console.log('featuredImage:', product.featuredImage);
  console.log('images:', product.images);
  console.log('variants:', product.variants?.map(v => ({
    id: v.id,
    name: v.name,
    image: v.image
  })));
}).catch(err => {
  console.error('Error:', err);
});
