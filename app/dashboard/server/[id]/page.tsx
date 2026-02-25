'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Play, Square, Upload, Terminal as TerminalIcon, FileText, Settings, RefreshCw } from 'lucide-react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { supabase } from '@/lib/supabase';

type ServerInstance = {
  id: string;
  name: string;
  type: string;
  version: string;
  status: 'running' | 'stopped' | 'error';
  created_at: string;
};

export default function ServerControlPanel() {
  const params = useParams();
  const router = useRouter();
  const [server, setServer] = useState<ServerInstance | null>(null);
  const [activeTab, setActiveTab] = useState<'terminal' | 'logs' | 'files'>('terminal');
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);

  useEffect(() => {
    const fetchServer = async () => {
        const { data, error } = await supabase
            .from('servers')
            .select('*')
            .eq('id', params.id)
            .single();
        
        if (error || !data) {
            console.error('Error fetching server:', error);
            router.push('/dashboard');
            return;
        }
        setServer(data);
    };
    fetchServer();
  }, [params.id, router]);

  // Terminal Init
  useEffect(() => {
    if (activeTab === 'terminal' && terminalRef.current && !xtermRef.current) {
      const term = new Terminal({
        theme: {
          background: '#0a0a0a',
          foreground: '#ffffff',
          cursor: '#0070f3',
        },
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 14,
        cursorBlink: true,
      });
      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      term.open(terminalRef.current);
      fitAddon.fit();
      
      term.writeln('\x1b[1;34mWelcome to Goh Host Terminal\x1b[0m');
      term.writeln('Connected to server instance...');
      term.write('$ ');

      let currentLine = '';
      
      term.onData(e => {
        // Handle Enter
        if (e === '\r') {
            term.write('\r\n');
            const trimmed = currentLine.trim();
            
            if (trimmed.startsWith('pip install')) {
                const parts = trimmed.split(' ');
                if (parts.length > 2) {
                    const pkg = parts[2];
                    term.writeln(`\x1b[33mCollecting ${pkg}...\x1b[0m`);
                    term.writeln(`Downloading ${pkg}-1.0.0-py3-none-any.whl (10 kB)`);
                    term.writeln(`Installing collected packages: ${pkg}`);
                    term.writeln(`\x1b[32mSuccessfully installed ${pkg}-1.0.0\x1b[0m`);
                } else {
                    term.writeln('\x1b[31mERROR: You must give at least one requirement to install\x1b[0m');
                }
            } else if (trimmed === 'python --version') {
                // Use optional chaining or default since server might be stale in closure
                // Ideally we use a ref for current server state, but for this demo:
                term.writeln(`Python 3.11`); 
            } else if (trimmed === 'ls') {
                term.writeln('main.py  requirements.txt  venv');
            } else if (trimmed !== '') {
                term.writeln(`\x1b[31mbash: ${trimmed.split(' ')[0]}: command not found\x1b[0m`);
            }
            
            term.write('$ ');
            currentLine = '';
        } 
        // Handle Backspace
        else if (e === '\u007F') {
            if (currentLine.length > 0) {
              currentLine = currentLine.substr(0, currentLine.length - 1);
              term.write('\b \b');
            }
        } 
        // Handle printable characters
        else if (e >= String.fromCharCode(0x20) && e <= String.fromCharCode(0x7E) || e >= '\u00a0') {
            currentLine += e;
            term.write(e);
        }
      });

      xtermRef.current = term;

      const handleResize = () => fitAddon.fit();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [activeTab]);

  const toggleStatus = async () => {
    if (!server) return;
    const newStatus = server.status === 'running' ? 'stopped' : 'running';
    
    // Optimistic update
    setServer({ ...server, status: newStatus });

    const { error } = await supabase
        .from('servers')
        .update({ status: newStatus })
        .eq('id', server.id);

    if (error) {
        console.error('Error updating status:', error);
        // Revert on error
        setServer({ ...server, status: server.status });
        return;
    }

    if (xtermRef.current) {
        xtermRef.current.writeln(`\r\n\x1b[1;33mSystem:\x1b[0m Server ${newStatus === 'running' ? 'started' : 'stopped'}.`);
        xtermRef.current.write('$ ');
    }
  };

  if (!server) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-[#222] bg-[#0a0a0a] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-gray-500 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-bold text-lg flex items-center gap-2">
              {server.name}
              <span className={`w-2 h-2 rounded-full ${server.status === 'running' ? 'bg-green-500' : 'bg-red-500'}`}></span>
            </h1>
            <p className="text-xs text-gray-500 font-mono">{server.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleStatus}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              server.status === 'running' 
                ? 'bg-red-900/20 text-red-500 hover:bg-red-900/30' 
                : 'bg-green-900/20 text-green-500 hover:bg-green-900/30'
            }`}
          >
            {server.status === 'running' ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            {server.status === 'running' ? 'Остановить' : 'Запустить'}
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-[#222] bg-[#0a0a0a] flex flex-col">
          <nav className="p-4 space-y-2">
            <button 
              onClick={() => setActiveTab('terminal')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'terminal' ? 'bg-blue-600/10 text-blue-500' : 'text-gray-400 hover:bg-[#111]'}`}
            >
              <TerminalIcon className="w-5 h-5" />
              Терминал
            </button>
            <button 
              onClick={() => setActiveTab('logs')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'logs' ? 'bg-blue-600/10 text-blue-500' : 'text-gray-400 hover:bg-[#111]'}`}
            >
              <FileText className="w-5 h-5" />
              Логи
            </button>
            <button 
              onClick={() => setActiveTab('files')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'files' ? 'bg-blue-600/10 text-blue-500' : 'text-gray-400 hover:bg-[#111]'}`}
            >
              <Upload className="w-5 h-5" />
              Файлы
            </button>
          </nav>
          
          <div className="mt-auto p-4 border-t border-[#222]">
             <div className="bg-[#111] rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">CPU Usage</p>
                <div className="w-full bg-[#222] h-1.5 rounded-full mb-3">
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: server.status === 'running' ? '12%' : '0%' }}></div>
                </div>
                <p className="text-xs text-gray-500 mb-1">RAM Usage</p>
                <div className="w-full bg-[#222] h-1.5 rounded-full">
                    <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: server.status === 'running' ? '45%' : '0%' }}></div>
                </div>
             </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 bg-[#050505] relative overflow-hidden flex flex-col">
          {activeTab === 'terminal' && (
            <div className="flex-1 p-4 bg-[#0a0a0a]">
                <div ref={terminalRef} className="w-full h-full rounded-lg overflow-hidden border border-[#222]" />
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="flex-1 p-6 overflow-auto font-mono text-sm text-gray-300">
                <div className="mb-2 text-gray-500">[System] Initializing container...</div>
                <div className="mb-2 text-gray-500">[System] Pulling image python:{server.version}...</div>
                <div className="mb-2 text-green-500">[System] Container ready.</div>
                {server.status === 'running' ? (
                    <>
                        <div className="mb-2">[App] Starting server on 0.0.0.0:8000</div>
                        <div className="mb-2">[App] Worker 1 started</div>
                        <div className="mb-2 animate-pulse">_</div>
                    </>
                ) : (
                    <div className="text-red-500">[System] Server stopped.</div>
                )}
            </div>
          )}
          
          {activeTab === 'files' && (
            <div className="flex-1 p-8">
                <div className="border-2 border-dashed border-[#333] rounded-2xl h-64 flex flex-col items-center justify-center text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors cursor-pointer bg-[#0a0a0a]">
                    <Upload className="w-12 h-12 mb-4" />
                    <p className="font-medium">Перетащите файлы сюда</p>
                    <p className="text-sm opacity-60 mt-2">или нажмите для выбора</p>
                </div>
                
                <div className="mt-8">
                    <h3 className="font-bold mb-4">Файлы сервера</h3>
                    <div className="bg-[#0a0a0a] border border-[#222] rounded-lg overflow-hidden">
                        <div className="p-3 border-b border-[#222] flex items-center gap-3 hover:bg-[#111]">
                            <FileText className="w-4 h-4 text-blue-500" />
                            <span>main.py</span>
                            <span className="ml-auto text-xs text-gray-600">2.4 KB</span>
                        </div>
                        <div className="p-3 border-b border-[#222] flex items-center gap-3 hover:bg-[#111]">
                            <FileText className="w-4 h-4 text-yellow-500" />
                            <span>requirements.txt</span>
                            <span className="ml-auto text-xs text-gray-600">128 B</span>
                        </div>
                    </div>
                </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
