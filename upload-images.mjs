import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(
  'https://ybgbwryttzlhjajhjwcq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InliZ2J3cnl0dHpsaGphamhqd2NxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3ODIwOTQsImV4cCI6MjA3NTM1ODA5NH0.S82RQvO--KgEzElpaJUPp9A6WfRuBCreb3r93WK92dg'
);

async function main() {
  console.log('1. Creando bucket...');

  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some(b => b.name === 'product-images');

  if (!exists) {
    const { error } = await supabase.storage.createBucket('product-images', {
      public: true,
      fileSizeLimit: 5242880,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    });
    if (error) console.error('Error creando bucket:', error);
    else console.log('✓ Bucket creado');
  } else {
    console.log('✓ Bucket ya existe');
  }

  console.log('\n2. Obteniendo producto...');
  const { data: products } = await supabase.from('products').select('*').limit(1);
  if (!products || products.length === 0) {
    console.error('No hay productos');
    return;
  }
  const product = products[0];
  console.log(`✓ Producto: ${product.name} (${product.id})`);

  console.log('\n3. Creando y subiendo imágenes...');

  // Crear 5 SVG simples como imágenes de ejemplo
  const images = [];
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];

  for (let i = 0; i < 5; i++) {
    const svg = `
      <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
        <rect width="800" height="600" fill="${colors[i]}"/>
        <text x="400" y="300" font-size="60" text-anchor="middle" fill="white" font-family="Arial">
          Producto ${product.name} - Imagen ${i + 1}
        </text>
      </svg>
    `;

    const filename = `${product.id}/image-${i + 1}-${Date.now()}.svg`;
    const buffer = Buffer.from(svg);

    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(filename, buffer, {
        contentType: 'image/svg+xml',
        upsert: false
      });

    if (error) {
      console.error(`Error subiendo imagen ${i + 1}:`, error);
      continue;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filename);

    images.push({
      id: crypto.randomUUID(),
      image_name: `image-${i + 1}.svg`,
      image_url: filename,
      label: `Vista ${i + 1}`,
      size: 'large'
    });

    console.log(`✓ Imagen ${i + 1} subida: ${publicUrl}`);
  }

  console.log('\n4. Actualizando producto...');
  const { error: updateError } = await supabase
    .from('products')
    .update({ images })
    .eq('id', product.id);

  if (updateError) {
    console.error('Error actualizando producto:', updateError);
  } else {
    console.log(`✓ Producto actualizado con ${images.length} imágenes`);
  }

  console.log('\n✅ Proceso completado!');
}

main();
