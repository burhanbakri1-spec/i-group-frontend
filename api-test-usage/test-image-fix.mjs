import https from 'https';

// Copy the getUniqueProductImages function logic directly
const FALLBACK_PRODUCT_IMAGE = 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80&auto=format&fit=crop';

const getUniqueProductImages = (product, variant = null) => {
  const backendImages = [
    variant?.image,
    product.featuredImage,
    product.images?.find((image) => image.isPrimary)?.imageUrl,
    ...(product.images?.map((image) => image.imageUrl) ?? []),
  ];

  // Convert relative paths to absolute URLs
  const normalizedImages = backendImages.map(image => {
    if (!image?.trim()) return null;
    if (image.startsWith('http')) return image;
    if (image.startsWith('/')) return `https://backend.igroup.website${image}`;
    return image;
  });

  const uniqueImages = normalizedImages
    .filter((image) => Boolean(image?.trim()))
    .filter((image, index, images) => images.indexOf(image) === index);

  // Return fallback image if no images are available
  return uniqueImages.length > 0 ? uniqueImages : [FALLBACK_PRODUCT_IMAGE];
};

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
  const backendProduct = data.data[0];
  console.log('=== BACKEND PRODUCT ===');
  console.log('featuredImage:', backendProduct.featuredImage);
  console.log('images:', backendProduct.images);
  
  console.log('\n=== IMAGE PROCESSING ===');
  const processedImages = getUniqueProductImages(backendProduct);
  console.log('Processed images:', processedImages);
  
  console.log('\n=== FINAL IMAGE URL ===');
  console.log('Primary image to display:', processedImages[0]);
}).catch(err => {
  console.error('Error:', err);
});
