import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const SUPABASE_URL = "https://jbqaznerntjlbdhcmodj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpicWF6bmVybnRqbGJkaGNtb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMjIzOTksImV4cCI6MjA3NzY5ODM5OX0.BH2xhvB9EsNqQbKpZV3JErtjNL0TKdNOe7DKj0VQ2pU";
const BUCKET = "twinclash-audio";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function createBucket() {
  console.log('🪣 Creando bucket...');
  const { data: buckets } = await supabase.storage.listBuckets();

  if (!buckets.find(b => b.name === BUCKET)) {
    const { data, error } = await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 52428800
    });

    if (error) {
      console.log('Bucket ya existe o error:', error.message);
    } else {
      console.log('✅ Bucket creado:', BUCKET);
    }
  } else {
    console.log('✅ Bucket ya existe:', BUCKET);
  }
}

async function uploadAudioFiles() {
  const audioDir = './public/audio';
  const files = readdirSync(audioDir);

  console.log(`\n📁 Encontrados ${files.length} archivos en ${audioDir}\n`);

  const uploadedUrls = [];

  for (const filename of files) {
    if (!filename.endsWith('.mp3') && !filename.endsWith('.wav')) continue;

    const filePath = join(audioDir, filename);
    const fileBuffer = readFileSync(filePath);

    console.log(`⬆️  Subiendo: ${filename}...`);

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(`audio/${filename}`, fileBuffer, {
        contentType: filename.endsWith('.mp3') ? 'audio/mpeg' : 'audio/wav',
        upsert: true
      });

    if (error) {
      console.error(`❌ Error en ${filename}:`, error.message);
    } else {
      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/audio/${filename}`;
      console.log(`✅ ${filename}`);
      console.log(`   ${publicUrl}\n`);
      uploadedUrls.push({ filename, url: publicUrl });
    }
  }

  console.log('\n🎉 ¡SUBIDA COMPLETA!\n');
  console.log('📋 URLs GENERADAS:');
  console.log('═'.repeat(80));
  uploadedUrls.forEach(({ filename, url }) => {
    console.log(`${filename}:`);
    console.log(`${url}\n`);
  });
}

async function main() {
  console.log('🚀 Iniciando subida de audio a Supabase Storage...\n');
  await createBucket();
  await uploadAudioFiles();
  console.log('✅ Proceso completado exitosamente!');
}

main().catch(console.error);
