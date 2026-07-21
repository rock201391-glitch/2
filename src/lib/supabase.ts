import { supabase } from "../../../lib/supabase";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.SUPABASE_URL;

const supabaseKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.SUPABASE_API_KEY;

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);
