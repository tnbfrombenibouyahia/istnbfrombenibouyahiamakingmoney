"use client";
import { useState, useEffect, useRef } from 'react';

export interface LogEntry {
  id: string;
  time: string;
  message: string;
  level: 'INFO' | 'WARN' | 'ERROR';
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
    <div className="border border-green-500 flex flex-col h-full bg-black">
      <div className="border-b border-green-500 flex text-xs bg-green-950/20">
        {(['NEURAL', 'ACTIVITY', 'REFLECTIONS'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-2 border-r border-green-500/50 hover:bg-green-500/20 transition-colors ${
              activeTab === tab ? 'bg-green-900/40 font-bold text-green-300' : 'text-green-500/60'
            }`}
          >
            [{tab}]
          </button>
        ))}
        <div className="flex-1 flex items-center justify-end px-3">
          <span className="animate-pulse w-2 h-2 rounded-full bg-green-500" />
        </div>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 text-xs font-mono space-y-1.5">
        {activeTab === 'NEURAL' && logs.map((log) => (
          <div key={log.id} className="flex gap-2">
            <span className="text-green-500/50 shrink-0">[{log.time}]</span>
            <span className={`shrink-0 ${log.level === 'WARN' ? 'text-yellow-500' : log.level === 'ERROR' ? 'text-red-500' : 'text-green-500/80'}`}>
              [{log.level}]
            </span>
            <span className={log.level === 'WARN' ? 'text-yellow-400' : log.level === 'ERROR' ? 'text-red-400' : 'text-green-400'}>
              {log.message}
            </span>
          </div>
        ))}
        {activeTab === 'ACTIVITY' && (
          <div className="text-green-500/50 text-center pt-4">REAL-TIME FEED ACTIVE</div>
        )}
        {activeTab === 'REFLECTIONS' && (
          <div className="text-green-500/50 text-center pt-4">STRATEGY ANALYSIS PENDING DATA</div>
        )}
        {logs.length === 0 && activeTab === 'NEURAL' && (
          <div className="text-green-800 text-center pt-4">AWAITING TRADE EVENTS...</div>
        )}
        <div className="animate-pulse text-green-500">_</div>
      </div>
    </div>
  );
}
