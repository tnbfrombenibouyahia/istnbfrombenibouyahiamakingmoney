interface KPIGridProps {
  cash: number;
  positionValue: number;
  totalCapital: number;
  dailyPnl: number;
  marginUsed: number;
  winRate: number;
}

export function KPIGrid({ cash, positionValue, totalCapital, dailyPnl, marginUsed, winRate }: KPIGridProps) {
  const kpis = [
    { label: 'BALANCE', value: `$${cash.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, isPositive: true },
    { label: 'FLOATING_PNL', value: `${positionValue >= 0 ? '+' : ''}$${positionValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, isPositive: positionValue >= 0 },
    { label: 'EQUITY', value: `$${totalCapital.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, isPositive: true },
    { label: 'DAILY_PNL', value: `${dailyPnl >= 0 ? '+' : ''}$${Math.abs(dailyPnl).toFixed(2)}`, isPositive: dailyPnl >= 0 },
    { label: 'MARGIN_USED', value: `${marginUsed.toFixed(1)}%`, isPositive: marginUsed <= 50 },
    { label: 'WIN_RATE_ALL', value: `${winRate.toFixed(1)}%`, isPositive: true },
  ];

  return (
    <div className="terminal-panel flex flex-col h-full uppercase">
      <div className="terminal-header p-2 text-sm font-bold tracking-widest">
        <span className="glow-text text-green-300">PORTFOLIO_BALANCE</span>
      </div>
      <div className="grid grid-cols-2 gap-[1px] bg-green-500/20 p-[1px] flex-1">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-[#020602] p-4 flex flex-col justify-center hover:bg-[#050f05] transition-colors group relative overflow-hidden">
            <span className="text-[10px] text-green-500/60 mb-2 tracking-widest leading-tight">{kpi.label}</span>
            <span className={`text-lg font-bold truncate tracking-tight transition-all duration-300 ${kpi.isPositive ? 'text-green-400 group-hover:text-green-300' : 'text-red-500 glow-text-red'}`}>
              {kpi.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
