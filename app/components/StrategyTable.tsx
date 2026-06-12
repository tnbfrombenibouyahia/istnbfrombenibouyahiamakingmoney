export interface StrategyRow {
  name: string;
  color: string;
  platform: string;
  totalPnl: number;
  todayPnl: number;
  winRate: number;
  profitFactor: number;
  maxDD: number;
  trades: number;
  openLots: number;
}

function formatCurrency(val: number) {
  const isNeg = val < 0;
  return `${isNeg ? '-$' : '+$'}${Math.abs(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function StrategyTable({ rows }: { rows: StrategyRow[] }) {
  return (
    <div className="terminal-panel flex flex-col h-full uppercase overflow-hidden">
      <div className="terminal-header p-2 text-sm font-bold flex justify-between items-center tracking-widest border-b border-green-500/20">
        <span className="glow-text text-green-300">STRATEGY_PERFORMANCE_MATRIX</span>
        <span className="text-[10px] text-green-500/70">{rows.length} ALGOS</span>
      </div>
      <div className="overflow-x-auto flex-1 pb-2">
        {rows.length === 0 ? (
          <div className="h-full flex items-center justify-center text-green-800 text-xs uppercase tracking-widest">
            NO STRATEGY DATA
          </div>
        ) : (
          <table className="w-full text-xs text-left border-collapse whitespace-nowrap min-w-[700px]">
            <thead className="text-[10px] text-green-500/60 border-b border-green-500/20 tracking-widest">
              <tr>
                <th className="pb-2 pt-2 px-3 font-medium">ALGO</th>
                <th className="pb-2 pt-2 pr-3 font-medium">PLT</th>
                <th className="pb-2 pt-2 pr-4 font-medium text-right">PNL_TOTAL</th>
                <th className="pb-2 pt-2 pr-4 font-medium text-right">PNL_TODAY</th>
                <th className="pb-2 pt-2 pr-4 font-medium text-right">WIN%</th>
                <th className="pb-2 pt-2 pr-4 font-medium text-right">PF</th>
                <th className="pb-2 pt-2 pr-4 font-medium text-right">MAX_DD</th>
                <th className="pb-2 pt-2 pr-4 font-medium text-right">TRADES</th>
                <th className="pb-2 pt-2 pr-3 font-medium text-right">OPEN_LOTS</th>
              </tr>
            </thead>
            <tbody className="text-[11px]">
              {rows.map((r) => {
                const pnlTotalColor = r.totalPnl >= 0 ? 'text-green-400' : 'text-red-500 glow-text-red';
                const pnlTodayColor = r.todayPnl >= 0 ? 'text-green-400' : 'text-red-500 glow-text-red';
                const winColor = r.winRate > 50 ? 'text-green-400' : r.winRate === 0 ? 'text-green-500/50' : 'text-yellow-500';
                const pfColor = r.profitFactor >= 2 ? 'text-green-400' : r.profitFactor >= 1.0 ? 'text-yellow-500' : 'text-red-500 glow-text-red';

                return (
                  <tr key={r.name} className="border-b border-zinc-900 hover:bg-green-500/5 transition-colors">
                    <td className="py-2.5 px-3 font-bold tracking-wide">
                      <span className="inline-flex items-center gap-2">
                        <span className="w-2 h-2 rounded-[1px]" style={{ backgroundColor: r.color, boxShadow: `0 0 5px ${r.color}` }} />
                        <span style={{ color: r.color, textShadow: `0 0 5px ${r.color}80` }}>{r.name}</span>
                      </span>
                    </td>
                    <td className="py-2.5 pr-3 text-green-500/50 text-[10px] font-medium">{r.platform}</td>
                    <td className={`py-2.5 pr-4 text-right font-bold tracking-wider ${pnlTotalColor}`}>{formatCurrency(r.totalPnl)}</td>
                    <td className={`py-2.5 pr-4 text-right font-bold ${pnlTodayColor}`}>{formatCurrency(r.todayPnl)}</td>
                    <td className={`py-2.5 pr-4 text-right ${winColor}`}>{r.winRate.toFixed(1)}%</td>
                    <td className={`py-2.5 pr-4 text-right ${pfColor}`}>{r.profitFactor.toFixed(2)}</td>
                    <td className="py-2.5 pr-4 text-right text-red-400">-${r.maxDD.toFixed(2)}</td>
                    <td className="py-2.5 pr-4 text-right text-green-500/70">{r.trades}</td>
                    <td className="py-2.5 pr-3 text-right text-green-500/70">{r.openLots.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
