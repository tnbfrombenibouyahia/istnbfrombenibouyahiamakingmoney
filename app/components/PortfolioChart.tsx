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
      <div className="bg-black border border-green-500 p-2 text-xs font-mono">
        <p className="text-green-500/70 mb-1">{label}</p>
        <p className="text-green-400 font-bold">{displayVal}</p>
      </div>
    );
  };

  return (
    <div className="border border-green-500 flex flex-col h-full bg-black relative">
      <div className="border-b border-green-500 p-2 flex justify-between items-center bg-green-950/30">
        <span className="text-sm font-bold">PORTFOLIO_VALUE_HISTORY</span>
        <div className="flex space-x-1">
          {(['$', '%'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-2 py-0.5 text-xs border border-green-500 transition-colors ${mode === m ? 'bg-green-500 text-black' : 'hover:bg-green-500/20'}`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 p-2 min-h-[250px]">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-green-800 text-xs uppercase">
            NO CLOSED TRADE HISTORY — CHART WILL POPULATE ON FIRST CLOSE
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(74, 222, 128, 0.15)" vertical={false} />
              <XAxis
                dataKey="time"
                stroke="rgba(74, 222, 128, 0.5)"
                tick={{ fill: 'rgba(74, 222, 128, 0.7)', fontSize: 10, fontFamily: 'monospace' }}
                tickMargin={10}
                minTickGap={30}
              />
              <YAxis
                stroke="rgba(74, 222, 128, 0.5)"
                tick={{ fill: 'rgba(74, 222, 128, 0.7)', fontSize: 10, fontFamily: 'monospace' }}
                domain={['auto', 'auto']}
                tickFormatter={(val) => mode === '$' ? `$${(val / 1000).toFixed(0)}k` : `${(val as number).toFixed(1)}%`}
                width={60}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(74, 222, 128, 0.4)', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Line
                type="monotone"
                dataKey={mode === '$' ? 'value' : 'pct'}
                stroke="#4ade80"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#000', stroke: '#4ade80', strokeWidth: 2 }}
                animationDuration={800}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
