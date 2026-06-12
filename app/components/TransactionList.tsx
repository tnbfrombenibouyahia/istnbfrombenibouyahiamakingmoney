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
    <div className="terminal-panel flex flex-col h-full uppercase">
      <div className="terminal-header p-2 text-sm font-bold tracking-widest">
        <span className="glow-text text-green-300">EXECUTION_FLOW</span>
      </div>
      <div className="overflow-auto flex-1 p-2">
        {transactions.length === 0 ? (
          <div className="h-full flex items-center justify-center text-green-800 text-xs uppercase tracking-widest">
            NO CLOSED TRADES
          </div>
        ) : (
          <table className="w-full text-xs text-left font-mono">
            <thead className="text-[10px] text-green-500/60 border-b border-green-500/20 tracking-widest">
              <tr>
                <th className="pb-2 font-medium">TIME</th>
                <th className="pb-2 font-medium">PAIR</th>
                <th className="pb-2 font-medium">ALGO</th>
                <th className="pb-2 font-medium text-right">NET P&L</th>
                <th className="pb-2 font-medium text-right">IMPACT</th>
              </tr>
            </thead>
            <tbody className="text-[11px]">
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-b border-green-500/10 hover:bg-green-500/5 transition-colors">
                  <td className="py-1.5 text-green-500/50">{tx.time}</td>
                  <td className="py-1.5 font-bold text-green-300 glow-text">{tx.pair}</td>
                  <td className="py-1.5 text-green-500/70 truncate max-w-[70px]">{tx.algo}</td>
                  <td className={`py-1.5 text-right font-bold ${tx.pnl >= 0 ? 'text-green-400' : 'text-red-500 glow-text-red'}`}>
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
