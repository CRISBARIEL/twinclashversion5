/*
  # Create Audio Storage Bucket

  1. Storage Setup
    - Creates public bucket `twinclash-audio` for audio files
    - Sets up policies for public read access
    - Allows users to upload audio files
  
  2. Security
    - Public read access for all audio files
    - Upload allowed for authenticated and anon users
*/

-- Create the storage bucket for audio files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'twinclash-audio',
  'twinclash-audio',
  true,
  52428800,
  ARRAY['audio/mpeg', 'audio/wav', 'audio/mp3']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access for audio files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload audio" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update audio" ON storage.objects;
DROP POLICY IF EXISTS "Anon users can upload audio" ON storage.objects;

-- Allow public read access to all audio files
CREATE POLICY "Public read access for audio files"
ON storage.objects FOR SELECT
USING (bucket_id = 'twinclash-audio');

-- Allow authenticated users to upload audio files
CREATE POLICY "Authenticated users can upload audio"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'twinclash-audio');

-- Allow authenticated users to update audio files
CREATE POLICY "Authenticated users can update audio"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'twinclash-audio')
WITH CHECK (bucket_id = 'twinclash-audio');

-- Allow anon users to upload (for initial setup)
CREATE POLICY "Anon users can upload audio"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'twinclash-audio');
