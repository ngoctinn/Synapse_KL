import { createClient } from "@supabase/supabase-js";

// Khởi tạo Supabase client cho frontend
// Cần đảm bảo các biến môi trường này đã được thiết lập trong .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);
