-- Table to store contact form messages
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  ip_address inet,
  user_agent text
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can insert contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "No one can view contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Anyone can view contact messages" ON public.contact_messages;

-- Policy: Allow anyone (including anonymous users) to insert contact messages
CREATE POLICY "Anyone can insert contact messages"
ON public.contact_messages 
FOR INSERT 
TO public 
WITH CHECK (true);

-- Policy: Allow anyone to view contact messages (for now)
CREATE POLICY "Anyone can view contact messages"
ON public.contact_messages 
FOR SELECT 
TO public 
USING (true);

-- Create an index on created_at for better query performance
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at 
ON public.contact_messages(created_at DESC); 