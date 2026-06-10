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
      <div className="bg-black border border-green-500 p-2 text-xs font-mono">
        <p className="text-green-500/70 mb-1">{label}</p>
        {payload.map((entry: any) => (
          <p key={entry.dataKey} style={{ color: entry.color }} className="font-bold">
            {entry.name}: {entry.value > 0 ? '+' : ''}{(entry.value as number).toFixed(2)}%
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="border border-green-500 flex flex-col h-full bg-black">
      <div className="border-b border-green-500 p-2 flex justify-between items-center bg-green-950/30">
        <span className="text-sm font-bold">MULTI-AGENT_STRATEGY_COMPARISON (% DRIFT)</span>
        <div className="flex gap-4 text-xs font-bold">
          {strategies.map((s) => (
            <div key={s.name} className="flex items-center gap-1">
              <span className="w-2 h-2 inline-block" style={{ backgroundColor: s.color }} />
              <span style={{ color: s.color }}>{s.name}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 p-2 min-h-[250px]">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-green-800 text-xs uppercase">
            NO STRATEGY DATA YET
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
                tickFormatter={(val) => `${val > 0 ? '+' : ''}${(val as number).toFixed(1)}%`}
                width={50}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(74, 222, 128, 0.05)' }} />
              <ReferenceLine y={0} stroke="rgba(74, 222, 128, 0.3)" />
              {strategies.map((s) => (
                <Line
                  key={s.name}
                  name={s.name}
                  type="monotone"
                  dataKey={s.name}
                  stroke={s.color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#000', stroke: s.color, strokeWidth: 2 }}
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
