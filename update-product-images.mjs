import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ybgbwryttzlhjajhjwcq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InliZ2J3cnl0dHpsaGphamhqd2NxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3ODIwOTQsImV4cCI6MjA3NTM1ODA5NH0.S82RQvO--KgEzElpaJUPp9A6WfRuBCreb3r93WK92dg'
);

const productId = '4d0bfd30-5027-4f1a-9570-39865492a5cb';

// Listar las imágenes que están en el bucket
const { data: files, error: listError } = await supabase.storage
  .from('product-images')
  .list(productId);

if (listError) {
  console.error('Error listando archivos:', listError);
  process.exit(1);
}

console.log(`Encontradas ${files.length} imágenes en el bucket`);

// Crear el array de imágenes con las URLs
const images = files.map((file, index) => {
  const filePath = `${productId}/${file.name}`;
  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath);

  console.log(`Imagen ${index + 1}: ${publicUrl}`);

  return {
    id: crypto.randomUUID(),
    image_name: file.name,
    image_url: filePath,
    label: `Vista ${index + 1}`,
    size: 'large'
  };
});

console.log('\nActualizando producto...');

// Actualizar el producto
const { data, error } = await supabase
  .from('products')
  .update({ images: images })
  .eq('id', productId)
  .select();

if (error) {
  console.error('Error actualizando producto:', error);
  process.exit(1);
}

console.log('\n✅ Producto actualizado exitosamente!');
console.log('\nImágenes guardadas:');
console.log(JSON.stringify(images, null, 2));
