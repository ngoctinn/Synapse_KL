import { createClient } from '@/shared/lib/supabase/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function getAuthHeaders() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  return {
    'Authorization': `Bearer ${session?.access_token || ''}`,
    'Content-Type': 'application/json',
  };
}

export async function fetchWithAuth(path: string, options: RequestInit = {}) {
  const headers = await getAuthHeaders();

  const url = path.startsWith('http') ? path : `${API_URL}${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  return response;
}
