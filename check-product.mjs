import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ybgbwryttzlhjajhjwcq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InliZ2J3cnl0dHpsaGphamhqd2NxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3ODIwOTQsImV4cCI6MjA3NTM1ODA5NH0.S82RQvO--KgEzElpaJUPp9A6WfRuBCreb3r93WK92dg'
);

const { data: product } = await supabase
  .from('products')
  .select('*')
  .eq('id', '4d0bfd30-5027-4f1a-9570-39865492a5cb')
  .single();

console.log('Producto:', product);
console.log('\nImágenes:', JSON.stringify(product.images, null, 2));
