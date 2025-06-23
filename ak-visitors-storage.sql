-- Table to track visitor uploads by fingerprint
CREATE TABLE IF NOT EXISTS public.visitor_fingerprints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fingerprint text NOT NULL UNIQUE,
  object_name text NOT NULL,
  filter varchar(255) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on the storage.objects table if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can upload to aakarshika-visitors if their fingerprint is not already present
CREATE POLICY "Anyone can upload to aakarshika-visitors if not already uploaded"
ON storage.objects FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'aakarshika-visitors'
  AND NOT EXISTS (
    SELECT 1 FROM public.visitor_fingerprints vf
    WHERE vf.fingerprint = current_setting('request.fingerprint', true)
  )
);

-- Policy: Anyone can view objects in aakarshika-visitors
CREATE POLICY "Anyone can view aakarshika-visitors"
ON storage.objects FOR SELECT
TO public
USING (
  bucket_id = 'aakarshika-visitors'
)