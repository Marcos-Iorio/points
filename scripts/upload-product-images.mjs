import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Supabase credentials not found in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Function to download image
async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const file = fs.createWriteStream(filepath);
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      } else {
        reject(new Error(`Failed to download: ${response.statusCode}`));
      }
    }).on('error', reject);
  });
}

async function createBucketIfNotExists() {
  console.log('Checking if bucket exists...');

  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    console.error('Error listing buckets:', listError);
    return false;
  }

  const bucketExists = buckets.some(bucket => bucket.name === 'product-images');

  if (!bucketExists) {
    console.log('Creating product-images bucket...');
    const { data, error } = await supabase.storage.createBucket('product-images', {
      public: true,
      fileSizeLimit: 5242880,
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    });

    if (error) {
      console.error('Error creating bucket:', error);
      return false;
    }
    console.log('Bucket created successfully!');
  } else {
    console.log('Bucket already exists');
  }

  return true;
}

async function main() {
  console.log('Starting product image upload process...\n');

  // Create bucket
  const bucketCreated = await createBucketIfNotExists();
  if (!bucketCreated) {
    console.error('Failed to create/verify bucket');
    process.exit(1);
  }

  // Sample product images from placeholder service
  const imageUrls = [
    'https://picsum.photos/800/600?random=1',
    'https://picsum.photos/800/600?random=2',
    'https://picsum.photos/800/600?random=3',
    'https://picsum.photos/800/600?random=4',
    'https://picsum.photos/800/600?random=5'
  ];

  const tempDir = path.join(__dirname, '..', 'public', 'temp-product-images');

  // Download images
  console.log('\nDownloading sample images...');
  const downloadedImages = [];

  for (let i = 0; i < imageUrls.length; i++) {
    const filename = `product-image-${i + 1}.jpg`;
    const filepath = path.join(tempDir, filename);

    try {
      console.log(`Downloading image ${i + 1}...`);
      await downloadImage(imageUrls[i], filepath);
      downloadedImages.push({ filename, filepath });
      console.log(`✓ Downloaded: ${filename}`);
    } catch (error) {
      console.error(`✗ Failed to download image ${i + 1}:`, error.message);
    }
  }

  // Get first product
  console.log('\nFetching product from database...');
  const { data: products, error: productError } = await supabase
    .from('products')
    .select('*')
    .limit(1);

  if (productError || !products || products.length === 0) {
    console.error('Error fetching product:', productError);
    process.exit(1);
  }

  const product = products[0];
  console.log(`Found product: ${product.name} (ID: ${product.id})`);

  // Upload images to storage
  console.log('\nUploading images to Supabase Storage...');
  const uploadedImages = [];

  for (const { filename, filepath } of downloadedImages) {
    const fileBuffer = fs.readFileSync(filepath);
    const storagePath = `${product.id}/${Date.now()}_${filename}`;

    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(storagePath, fileBuffer, {
        contentType: 'image/jpeg',
        upsert: false
      });

    if (error) {
      console.error(`✗ Failed to upload ${filename}:`, error.message);
      continue;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(storagePath);

    uploadedImages.push({
      id: crypto.randomUUID(),
      image_name: filename,
      image_url: storagePath,
      label: `Product Image ${uploadedImages.length + 1}`,
      size: 'large'
    });

    console.log(`✓ Uploaded: ${filename} -> ${storagePath}`);
    console.log(`  Public URL: ${publicUrl}`);
  }

  // Update product with images
  console.log('\nUpdating product with image URLs...');
  const { data: updatedProduct, error: updateError } = await supabase
    .from('products')
    .update({ images: uploadedImages })
    .eq('id', product.id)
    .select();

  if (updateError) {
    console.error('Error updating product:', updateError);
    process.exit(1);
  }

  console.log('\n✓ Product updated successfully!');
  console.log(`\nProduct "${product.name}" now has ${uploadedImages.length} images:`);
  uploadedImages.forEach((img, idx) => {
    console.log(`  ${idx + 1}. ${img.image_name} - ${img.label}`);
  });

  // Cleanup temp files
  console.log('\nCleaning up temporary files...');
  for (const { filepath } of downloadedImages) {
    fs.unlinkSync(filepath);
  }
  console.log('✓ Cleanup complete');

  console.log('\n🎉 Process completed successfully!');
}

main().catch(console.error);
