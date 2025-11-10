import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ybgbwryttzlhjajhjwcq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InliZ2J3cnl0dHpsaGphamhqd2NxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3ODIwOTQsImV4cCI6MjA3NTM1ODA5NH0.S82RQvO--KgEzElpaJUPp9A6WfRuBCreb3r93WK92dg'
);

const productId = '4d0bfd30-5027-4f1a-9570-39865492a5cb';

const testImages = [
  {
    id: '1',
    image_name: 'test1.svg',
    image_url: `${productId}/image-1-1762816966302.svg`,
    label: 'Vista 1',
    size: 'large'
  },
  {
    id: '2',
    image_name: 'test2.svg',
    image_url: `${productId}/image-2-1762816966521.svg`,
    label: 'Vista 2',
    size: 'large'
  },
  {
    id: '3',
    image_name: 'test3.svg',
    image_url: `${productId}/image-3-1762816966749.svg`,
    label: 'Vista 3',
    size: 'large'
  },
  {
    id: '4',
    image_name: 'test4.svg',
    image_url: `${productId}/image-4-1762816966956.svg`,
    label: 'Vista 4',
    size: 'large'
  },
  {
    id: '5',
    image_name: 'test5.svg',
    image_url: `${productId}/image-5-1762816967106.svg`,
    label: 'Vista 5',
    size: 'large'
  }
];

console.log('Intentando actualizar con:', JSON.stringify(testImages, null, 2));

const { data, error } = await supabase
  .from('products')
  .update({ images: testImages })
  .eq('id', productId)
  .select();

if (error) {
  console.error('ERROR:', error);
} else {
  console.log('\n✅ Actualizado!');
  console.log('Resultado:', data);
}

// Verificar
const { data: check } = await supabase
  .from('products')
  .select('images')
  .eq('id', productId)
  .single();

console.log('\nVerificación - Images en DB:', check.images);
