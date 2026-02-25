import { redirect } from 'next/navigation';

export async function GET(request: Request) {
  // In a full production app with @supabase/ssr, we would exchange the code for a session here.
  // For this prototype using client-side supabase-js, we'll redirect to the dashboard.
  // The client-side library will handle session recovery if the URL contains the necessary fragments.
  
  return redirect('/dashboard');
}
