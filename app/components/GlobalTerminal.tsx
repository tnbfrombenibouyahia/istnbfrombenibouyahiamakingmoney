"use client";
import { useEffect, useRef } from 'react';
import { LogEntry } from './ReasoningPanel';
import { StrategyMeta } from './StrategyChart';

interface GlobalTerminalProps {
  logs: LogEntry[];
  strategies: StrategyMeta[];
}

export function GlobalTerminal({ logs, strategies }: GlobalTerminalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const strategyColorMap = strategies.reduce((acc, s) => {
    acc[s.name] = s.color;
    return acc;
  }, {} as Record<string, string>);

  function getStrategyColor(log: LogEntry): string {
    if (log.algo && strategyColorMap[log.algo]) return strategyColorMap[log.algo];
    const match = strategies.find(s => log.message.startsWith(s.name));
    return match ? match.color : '#4ade80';
  }

  function getLevelStyle(level: string) {
    if (level === 'ERROR') return 'text-black bg-red-500';
    if (level === 'WARN') return 'text-black bg-yellow-400';
    return '';
  }

  return (
    <div className="terminal-panel flex flex-col h-full uppercase">
      <div className="terminal-header p-2 flex justify-between items-center z-10 sticky top-0">
        <span className="text-sm font-bold tracking-widest glow-text text-green-300">GLOBAL_EVENT_TERMINAL</span>
        <span className="animate-pulse w-2 h-2 bg-green-400 shadow-[0_0_5px_#4ade80]"></span>
      </div>

      {/* Strategy legend */}
      {strategies.length > 0 && (
        <div className="border-b border-green-500/20 p-2 text-[10px] grid grid-cols-2 gap-2 bg-[#020402]">
          {strategies.map(s => (
            <div key={s.name} className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 shrink-0" style={{ backgroundColor: s.color, boxShadow: `0 0 5px ${s.color}` }} />
              <span style={{ color: s.color }} className="truncate tracking-wider" title={s.name}>{s.name}</span>
            </div>
          ))}
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 text-[10px] sm:text-xs font-mono space-y-2 pb-8">
        {logs.length === 0 && (
          <div className="text-green-800 text-center pt-6 tracking-widest">AWAITING EVENTS...</div>
        )}
        {logs.map((log) => {
          const color = getStrategyColor(log);
          return (
            <div key={log.id} className="flex gap-2 leading-relaxed hover:bg-green-500/5 px-2 py-1.5 -mx-2 transition-colors border-b border-green-500/5 items-start">
              <span className="text-green-500/40 shrink-0 select-none hidden sm:inline-block">[{log.time}]</span>

              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <div className="flex justify-between w-full pr-1">
                  <span className="font-bold tracking-wider truncate" style={{ color, textShadow: `0 0 5px ${color}50` }}>
                    {log.algo ?? log.message.split(':')[0]}
                  </span>
                  {log.level !== 'INFO' && (
                    <span className={`text-[9px] font-bold px-1 hidden md:block ${getLevelStyle(log.level)}`}>
                      {log.level}
                    </span>
                  )}
                </div>
                <span className="text-green-400/70 leading-snug break-words">
                  {log.algo ? log.message : log.message.split(':').slice(1).join(':').trim()}
                </span>
              </div>
            </div>
          );
        })}
        <div className="animate-pulse text-green-500 px-2">_</div>
      </div>
    </div>
  );
}
