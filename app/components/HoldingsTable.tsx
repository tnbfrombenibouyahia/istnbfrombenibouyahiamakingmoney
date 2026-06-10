export interface Holding {
  ticker: string;
  algo: string;
  lots: number;
  openTime: string;
  unrealizedPnl: number;
}

export function HoldingsTable({ holdings }: { holdings: Holding[] }) {
  return (
    <div className="border border-green-500 flex flex-col h-full bg-black">
      <div className="border-b border-green-500 p-2 bg-green-950/30 text-sm font-bold flex justify-between items-center">
        <span>ACTIVE_HOLDINGS</span>
        <span className="text-xs animate-pulse opacity-70">LIVE</span>
      </div>
      <div className="overflow-auto flex-1 p-2">
        {holdings.length === 0 ? (
          <div className="h-full flex items-center justify-center text-green-800 text-xs uppercase">
            NO OPEN POSITIONS
          </div>
        ) : (
          <table className="w-full text-xs text-left font-mono">
            <thead className="text-green-500/70 border-b border-green-500/30">
              <tr>
                <th className="pb-2 font-normal">ASSET</th>
                <th className="pb-2 font-normal">ALGO</th>
                <th className="pb-2 font-normal text-right">LOTS</th>
                <th className="pb-2 font-normal text-right">SINCE</th>
                <th className="pb-2 font-normal text-right">UNREALIZED_PNL</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((h, i) => (
                <tr key={i} className="border-b border-green-500/10 hover:bg-green-500/5">
                  <td className="py-1.5 font-bold text-green-300">{h.ticker}</td>
                  <td className="py-1.5 text-green-500/80 truncate max-w-[80px]">{h.algo}</td>
                  <td className="py-1.5 text-right">{h.lots.toFixed(2)}</td>
                  <td className="py-1.5 text-right text-green-500/60">{h.openTime}</td>
                  <td className={`py-1.5 text-right font-bold ${h.unrealizedPnl >= 0 ? 'text-green-400' : 'text-red-500'}`}>
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
