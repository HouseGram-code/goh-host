'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Server, Terminal, Settings, LogOut } from 'lucide-react';

// Mock data type until we connect to real DB table
type ServerInstance = {
  id: string;
  name: string;
  type: string;
  version: string;
  status: 'running' | 'stopped' | 'error';
  created_at: string;
};

export default function Dashboard() {
  const [servers, setServers] = useState<ServerInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchServers = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/');
        return;
      }

      // Fetch from real DB
      const { data, error } = await supabase
        .from('servers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching servers:', error);
        // Fallback to empty if table doesn't exist yet (user needs to run SQL)
        setServers([]);
      } else {
        setServers(data || []);
      }
      setLoading(false);
    };

    fetchServers();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-blue-500">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Navbar */}
      <nav className="border-b border-[#222] bg-[#0a0a0a]/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Server className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight">Goh Host</span>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={handleLogout} className="text-gray-400 hover:text-white transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Мои Серверы</h1>
          <Link 
            href="/dashboard/create" 
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20"
          >
            <Plus className="w-4 h-4" />
            Создать сервер
          </Link>
        </div>

        {servers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed border-[#333] rounded-2xl bg-[#0a0a0a]">
            <div className="w-16 h-16 bg-[#111] rounded-full flex items-center justify-center mb-4">
              <Server className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-xl font-medium text-gray-300 mb-2">Пусто</h3>
            <p className="text-gray-500 mb-6">У вас пока нет активных серверов</p>
            <Link 
              href="/dashboard/create" 
              className="text-blue-500 hover:text-blue-400 font-medium"
            >
              Создать первый сервер &rarr;
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servers.map((server) => (
              <div key={server.id} className="bg-[#0a0a0a] border border-[#222] rounded-xl p-6 hover:border-blue-500/50 transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg group-hover:text-blue-400 transition-colors">{server.name}</h3>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">{server.type} {server.version}</p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${server.status === 'running' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`}></div>
                </div>
                
                <div className="flex items-center justify-between mt-8 pt-4 border-t border-[#222]">
                  <span className="text-xs text-gray-600 font-mono">{server.id.substring(0, 8)}...</span>
                  <Link 
                    href={`/dashboard/server/${server.id}`}
                    className="bg-[#111] hover:bg-[#222] text-white text-sm px-3 py-1.5 rounded-md border border-[#333] transition-colors"
                  >
                    Управление
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
