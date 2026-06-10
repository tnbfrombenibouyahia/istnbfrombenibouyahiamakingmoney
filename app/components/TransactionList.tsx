export interface Transaction {
  id: string;
  time: string;
  pair: string;
  algo: string;
  pnl: number;
  risk: number;
}

function RiskGauge({ risk }: { risk: number }) {
  const bars = 10;
  const filled = Math.round(risk * bars);
  const colorClass = risk > 0.7 ? 'text-red-500' : risk > 0.4 ? 'text-yellow-500' : 'text-green-400';
  return (
    <span className={`font-mono text-[10px] ${colorClass}`}>
      {'█'.repeat(filled)}{'░'.repeat(bars - filled)}
    </span>
  );
}

export function TransactionList({ transactions }: { transactions: Transaction[] }) {
  return (
    <div className="border border-green-500 flex flex-col h-full bg-black">
      <div className="border-b border-green-500 p-2 bg-green-950/30 text-sm font-bold">
        <span>EXECUTION_FLOW</span>
      </div>
      <div className="overflow-auto flex-1 p-2">
        {transactions.length === 0 ? (
          <div className="h-full flex items-center justify-center text-green-800 text-xs uppercase">
            NO CLOSED TRADES
          </div>
        ) : (
          <table className="w-full text-xs text-left font-mono">
            <thead className="text-green-500/70 border-b border-green-500/30">
              <tr>
                <th className="pb-2 font-normal">TIME</th>
                <th className="pb-2 font-normal">PAIR</th>
                <th className="pb-2 font-normal">ALGO</th>
                <th className="pb-2 font-normal text-right">NET P&L</th>
                <th className="pb-2 font-normal text-right">IMPACT</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-b border-green-500/10 hover:bg-green-500/5">
                  <td className="py-1.5 opacity-70">{tx.time}</td>
                  <td className="py-1.5 font-bold text-green-300">{tx.pair}</td>
                  <td className="py-1.5 text-green-500/80 truncate max-w-[70px]">{tx.algo}</td>
                  <td className={`py-1.5 text-right font-bold ${tx.pnl >= 0 ? 'text-green-400' : 'text-red-500'}`}>
                    {tx.pnl >= 0 ? '+' : ''}${tx.pnl.toFixed(2)}
                  </td>
                  <td className="py-1.5 text-right"><RiskGauge risk={tx.risk} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
