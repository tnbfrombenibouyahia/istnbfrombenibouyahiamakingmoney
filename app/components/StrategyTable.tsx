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

function PnlCell({ value }: { value: number }) {
  return (
    <span className={`font-bold ${value >= 0 ? 'text-green-400' : 'text-red-500'}`}>
      {value >= 0 ? '+' : ''}${value.toFixed(2)}
    </span>
  );
}

export function StrategyTable({ rows }: { rows: StrategyRow[] }) {
  return (
    <div className="border border-green-500 flex flex-col h-full bg-black">
      <div className="border-b border-green-500 p-2 bg-green-950/30 text-sm font-bold flex justify-between items-center">
        <span>STRATEGY_PERFORMANCE_MATRIX</span>
        <span className="text-xs text-green-500/70">{rows.length} ALGOS</span>
      </div>
      <div className="overflow-auto flex-1 p-2">
        {rows.length === 0 ? (
          <div className="h-full flex items-center justify-center text-green-800 text-xs uppercase">
            NO STRATEGY DATA
          </div>
        ) : (
          <table className="w-full text-xs text-left font-mono">
            <thead className="text-green-500/70 border-b border-green-500/30">
              <tr>
                <th className="pb-2 font-normal">ALGO</th>
                <th className="pb-2 font-normal">PLT</th>
                <th className="pb-2 font-normal text-right">PNL_TOTAL</th>
                <th className="pb-2 font-normal text-right">PNL_TODAY</th>
                <th className="pb-2 font-normal text-right">WIN%</th>
                <th className="pb-2 font-normal text-right">PF</th>
                <th className="pb-2 font-normal text-right">MAX_DD</th>
                <th className="pb-2 font-normal text-right">TRADES</th>
                <th className="pb-2 font-normal text-right">OPEN_LOTS</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.name} className="border-b border-green-500/10 hover:bg-green-500/5">
                  <td className="py-2 font-bold" style={{ color: r.color }}>
                    <span className="inline-block w-2 h-2 mr-2" style={{ backgroundColor: r.color }} />
                    {r.name}
                  </td>
                  <td className="py-2 text-green-500/70">{r.platform}</td>
                  <td className="py-2 text-right"><PnlCell value={r.totalPnl} /></td>
                  <td className="py-2 text-right"><PnlCell value={r.todayPnl} /></td>
                  <td className="py-2 text-right">{r.winRate.toFixed(1)}%</td>
                  <td className={`py-2 text-right ${r.profitFactor >= 1 ? 'text-green-400' : 'text-red-500'}`}>
                    {r.profitFactor.toFixed(2)}
                  </td>
                  <td className="py-2 text-right text-red-400">-${r.maxDD.toFixed(2)}</td>
                  <td className="py-2 text-right text-green-500/80">{r.trades}</td>
                  <td className="py-2 text-right text-green-500/80">{r.openLots.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
