'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Server, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function CreateServer() {
  const [name, setName] = useState('');
  const [technology, setTechnology] = useState('python');
  const [version, setVersion] = useState('3.11');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        router.push('/');
        return;
    }

    const { error } = await supabase.from('servers').insert([
      {
        name,
        type: technology,
        version,
        status: 'stopped',
        user_id: user.id, // Ensure RLS allows this
      }
    ]);

    if (error) {
        alert('Ошибка при создании сервера: ' + error.message);
        setLoading(false);
        return;
    }

    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      <div className="max-w-3xl mx-auto w-full px-4 py-12 flex-1 flex flex-col justify-center">
        <Link href="/dashboard" className="inline-flex items-center text-gray-500 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад к списку
        </Link>

        <div className="bg-[#0a0a0a] border border-[#222] rounded-2xl p-8 shadow-2xl">
          <h1 className="text-2xl font-bold mb-6">Создание нового сервера</h1>

          <form onSubmit={handleCreate} className="space-y-8">
            {/* Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Название сервера</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="my-awesome-project"
                className="w-full bg-[#111] border border-[#333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>

            {/* Technology Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Технология</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setTechnology('python')}
                  className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    technology === 'python' 
                      ? 'border-blue-500 bg-blue-900/10' 
                      : 'border-[#222] bg-[#111] hover:border-[#444]'
                  }`}
                >
                  <div className="w-10 h-10 mb-2 text-yellow-500">
                    {/* Python Icon SVG */}
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.24-.01h.16l.06.01h8.16v-8.3H6.18l-.01-1.42.04-1.26.1-1.08.19-.89.26-.71.31-.56.35-.41.37-.28.39-.16.4-.06.41.02H14.25zm-1.44 9.85l.23.03.2.06.17.1.15.13.12.17.1.2.05.23-.01.25-.06.24-.1.2-.14.16-.17.12-.21.07-.23.03-.23-.02-.23-.06-.19-.11-.15-.15-.1-.19-.06-.23-.01-.25.04-.23.09-.21.15-.16.19-.11.23-.05z"/>
                    </svg>
                  </div>
                  <span className="font-medium">Python</span>
                  {technology === 'python' && (
                    <div className="absolute top-2 right-2 text-blue-500">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </button>
                
                {/* Disabled Options */}
                <button disabled className="flex flex-col items-center justify-center p-4 rounded-xl border border-[#222] bg-[#111] opacity-50 cursor-not-allowed">
                  <span className="text-gray-500">Node.js</span>
                  <span className="text-[10px] text-gray-600 mt-1">Скоро</span>
                </button>
                <button disabled className="flex flex-col items-center justify-center p-4 rounded-xl border border-[#222] bg-[#111] opacity-50 cursor-not-allowed">
                  <span className="text-gray-500">Go</span>
                  <span className="text-[10px] text-gray-600 mt-1">Скоро</span>
                </button>
              </div>
            </div>

            {/* Version Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Версия</label>
              <select
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                className="w-full bg-[#111] border border-[#333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="3.11">Python 3.11 (Latest)</option>
                <option value="3.10">Python 3.10</option>
                <option value="3.9">Python 3.9</option>
              </select>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-900/30 flex items-center justify-center"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Создание сервера...
                </div>
              ) : (
                'Создать сервер'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
