"use client";
import { useState, useEffect, useRef } from 'react';

export interface LogEntry {
  id: string;
  time: string;
  message: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  algo?: string;
}

export function ReasoningPanel({ logs }: { logs: LogEntry[] }) {
  const [activeTab, setActiveTab] = useState<'NEURAL' | 'ACTIVITY' | 'REFLECTIONS'>('NEURAL');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, activeTab]);

  return (
    <div className="terminal-panel flex flex-col h-full uppercase">
      <div className="terminal-header flex text-xs">
        {(['NEURAL', 'ACTIVITY', 'REFLECTIONS'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-2 border-r border-green-500/30 hover:bg-green-500/10 transition-colors tracking-widest ${
              activeTab === tab ? 'bg-green-500/15 font-bold text-green-300 glow-text' : 'text-green-500/50'
            }`}
          >
            [{tab}]
          </button>
        ))}
        <div className="flex-1 flex items-center justify-end px-3">
          <span className="animate-pulse w-2 h-2 bg-green-400 shadow-[0_0_5px_#4ade80]" />
        </div>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 text-xs font-mono space-y-1.5">
        {activeTab === 'NEURAL' && logs.map((log) => (
          <div key={log.id} className="flex gap-2 hover:bg-green-500/5 px-1 py-0.5 -mx-1 transition-colors">
            <span className="text-green-500/40 shrink-0">[{log.time}]</span>
            <span className={`shrink-0 font-bold ${log.level === 'WARN' ? 'text-yellow-500' : log.level === 'ERROR' ? 'text-red-500 glow-text-red' : 'text-green-500/70'}`}>
              [{log.level}]
            </span>
            <span className={log.level === 'WARN' ? 'text-yellow-400' : log.level === 'ERROR' ? 'text-red-400 glow-text-red' : 'text-green-400'}>
              {log.message}
            </span>
          </div>
        ))}
        {activeTab === 'ACTIVITY' && (
          <div className="text-green-500/40 text-center pt-4 tracking-widest">REAL-TIME FEED ACTIVE</div>
        )}
        {activeTab === 'REFLECTIONS' && (
          <div className="text-green-500/40 text-center pt-4 tracking-widest">STRATEGY ANALYSIS PENDING DATA</div>
        )}
        {logs.length === 0 && activeTab === 'NEURAL' && (
          <div className="text-green-800 text-center pt-4 tracking-widest">AWAITING TRADE EVENTS...</div>
        )}
        <div className="animate-pulse text-green-500">_</div>
      </div>
    </div>
  );
}
