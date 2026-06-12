"use client";
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export interface PortfolioDataPoint {
  time: string;
  value: number;
  pct: number;
}

export function PortfolioChart({ data }: { data: PortfolioDataPoint[] }) {
  const [mode, setMode] = useState<'$' | '%'>('$');

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const val = payload[0].value;
    const displayVal = mode === '$'
      ? `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : `${val > 0 ? '+' : ''}${val.toFixed(2)}%`;
    return (
      <div className="terminal-panel p-3 text-xs border border-green-400/50 shadow-xl shadow-green-900/20">
        <p className="text-green-500/60 mb-1 tracking-widest border-b border-green-500/20 pb-1">{label}</p>
        <p className="text-green-400 font-bold glow-text">{displayVal}</p>
      </div>
    );
  };

  return (
    <div className="terminal-panel flex flex-col h-full relative uppercase">
      <div className="terminal-header p-2 flex justify-between items-center z-10">
        <span className="text-sm font-bold tracking-widest glow-text text-green-300">PORTFOLIO_VALUE_HISTORY</span>
        <div className="flex space-x-1">
          {(['$', '%'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-2 py-0.5 text-xs border transition-colors ${mode === m ? 'border-green-400 bg-green-500/20 text-green-300 shadow-[0_0_5px_rgba(74,222,128,0.3)]' : 'border-green-500/40 hover:bg-green-500/10 text-green-500/70'}`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 p-2 min-h-[250px]">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-green-800 text-xs uppercase tracking-widest">
            NO CLOSED TRADE HISTORY — CHART WILL POPULATE ON FIRST CLOSE
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="rgba(74, 222, 128, 0.1)" vertical={false} />
              <XAxis
                dataKey="time"
                stroke="rgba(74, 222, 128, 0.3)"
                tick={{ fill: 'rgba(74, 222, 128, 0.6)', fontSize: 10, fontFamily: 'monospace' }}
                tickMargin={10}
                minTickGap={30}
              />
              <YAxis
                stroke="rgba(74, 222, 128, 0.3)"
                tick={{ fill: 'rgba(74, 222, 128, 0.6)', fontSize: 10, fontFamily: 'monospace' }}
                domain={['auto', 'auto']}
                tickFormatter={(val) => mode === '$' ? `$${(val / 1000).toFixed(0)}k` : `${(val as number).toFixed(1)}%`}
                width={60}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(74, 222, 128, 0.3)', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Line
                type="monotone"
                dataKey={mode === '$' ? 'value' : 'pct'}
                stroke="#4ade80"
                strokeWidth={1.5}
                dot={false}
                activeDot={{ r: 3, fill: '#000', stroke: '#4ade80', strokeWidth: 2 }}
                animationDuration={800}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
