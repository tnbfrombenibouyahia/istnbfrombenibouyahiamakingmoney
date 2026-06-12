export interface Holding {
  ticker: string;
  algo: string;
  lots: number;
  openTime: string;
  unrealizedPnl: number;
}

export function HoldingsTable({ holdings }: { holdings: Holding[] }) {
  return (
    <div className="terminal-panel flex flex-col h-full uppercase">
      <div className="terminal-header p-2 text-sm font-bold flex justify-between items-center tracking-widest">
        <span className="glow-text text-green-300">ACTIVE_HOLDINGS</span>
        <span className="text-xs animate-pulse text-green-400/70">LIVE</span>
      </div>
      <div className="overflow-auto flex-1 p-2">
        {holdings.length === 0 ? (
          <div className="h-full flex items-center justify-center text-green-800 text-xs uppercase tracking-widest">
            NO OPEN POSITIONS
          </div>
        ) : (
          <table className="w-full text-xs text-left font-mono">
            <thead className="text-[10px] text-green-500/60 border-b border-green-500/20 tracking-widest">
              <tr>
                <th className="pb-2 font-medium">ASSET</th>
                <th className="pb-2 font-medium">ALGO</th>
                <th className="pb-2 font-medium text-right">LOTS</th>
                <th className="pb-2 font-medium text-right">SINCE</th>
                <th className="pb-2 font-medium text-right">UNREALIZED_PNL</th>
              </tr>
            </thead>
            <tbody className="text-[11px]">
              {holdings.map((h, i) => (
                <tr key={i} className="border-b border-green-500/10 hover:bg-green-500/5 transition-colors">
                  <td className="py-1.5 font-bold text-green-300 glow-text">{h.ticker}</td>
                  <td className="py-1.5 text-green-500/70 truncate max-w-[80px]">{h.algo}</td>
                  <td className="py-1.5 text-right">{h.lots.toFixed(2)}</td>
                  <td className="py-1.5 text-right text-green-500/50">{h.openTime}</td>
                  <td className={`py-1.5 text-right font-bold ${h.unrealizedPnl >= 0 ? 'text-green-400' : 'text-red-500 glow-text-red'}`}>
                    {h.unrealizedPnl >= 0 ? '+' : ''}${h.unrealizedPnl.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
