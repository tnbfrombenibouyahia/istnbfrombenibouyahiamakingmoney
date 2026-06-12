"use client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export interface StrategyDataPoint {
  time: string;
  [key: string]: string | number;
}

export interface StrategyMeta {
  name: string;
  color: string;
}

export function StrategyChart({ data, strategies }: { data: StrategyDataPoint[]; strategies: StrategyMeta[] }) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="terminal-panel p-3 text-xs border border-green-400/50 shadow-xl shadow-green-900/20 min-w-[200px]">
        <p className="text-green-500/60 mb-2 tracking-widest border-b border-green-500/20 pb-1 uppercase">{label} // SNAPSHOT</p>
        <div className="space-y-1.5">
          {payload.map((entry: any) => (
            <div key={entry.dataKey} className="flex justify-between items-center text-[10px] sm:text-xs">
              <span className="font-bold tracking-wider truncate mr-4 max-w-[120px]" style={{ color: entry.color, textShadow: `0 0 5px ${entry.color}80` }}>
                {entry.name}
              </span>
              <span className="font-mono font-bold" style={{ color: entry.color }}>
                {entry.value > 0 ? '+' : ''}{(entry.value as number).toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="terminal-panel flex flex-col h-full relative uppercase">
      <div className="terminal-header p-2 flex justify-between items-center z-10 flex-wrap gap-2">
        <span className="text-sm font-bold tracking-widest glow-text text-green-300">MULTI-STRATEGY_PERFORMANCE (% DRIFT)</span>
        <div className="flex gap-2 text-[9px] tracking-widest font-bold overflow-x-auto pb-1">
          {strategies.map((s) => (
            <div key={s.name} className="flex items-center gap-1.5 border px-1.5 py-0.5 whitespace-nowrap" style={{ borderColor: `${s.color}30`, backgroundColor: `${s.color}05` }}>
              <span className="w-1.5 h-1.5" style={{ backgroundColor: s.color, boxShadow: `0 0 5px ${s.color}` }} />
              <span style={{ color: s.color }}>{s.name}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 p-2 min-h-[250px]">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-green-800 text-xs uppercase tracking-widest">
            NO STRATEGY DATA YET
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
                tickFormatter={(val) => `${val > 0 ? '+' : ''}${(val as number).toFixed(1)}%`}
                width={50}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(74, 222, 128, 0.03)' }} />
              <ReferenceLine y={0} stroke="rgba(74, 222, 128, 0.2)" strokeDasharray="3 3" />
              {strategies.map((s) => (
                <Line
                  key={s.name}
                  name={s.name}
                  type="monotone"
                  dataKey={s.name}
                  stroke={s.color}
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 3, fill: '#000', stroke: s.color, strokeWidth: 2 }}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
