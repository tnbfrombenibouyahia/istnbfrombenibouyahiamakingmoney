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
    { label: 'BALANCE', value: `$${cash.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, color: 'text-green-400' },
    { label: 'FLOATING_PNL', value: `${positionValue >= 0 ? '+' : ''}$${positionValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, color: positionValue >= 0 ? 'text-green-400' : 'text-red-500' },
    { label: 'EQUITY', value: `$${totalCapital.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, color: 'text-green-400' },
    { label: 'DAILY_PNL', value: `${dailyPnl >= 0 ? '+' : ''}$${Math.abs(dailyPnl).toFixed(2)}`, color: dailyPnl >= 0 ? 'text-green-400' : 'text-red-500' },
    { label: 'MARGIN_USED', value: `${marginUsed.toFixed(1)}%`, color: marginUsed > 50 ? 'text-red-500' : 'text-green-400' },
    { label: 'WIN_RATE_ALL', value: `${winRate.toFixed(1)}%`, color: 'text-green-400' },
  ];

  return (
    <div className="border border-green-500 flex flex-col h-full bg-black">
      <div className="border-b border-green-500 p-2 bg-green-950/30 text-sm font-bold">
        <span>PORTFOLIO_BALANCE</span>
      </div>
      <div className="grid grid-cols-2 gap-px bg-green-500 p-px flex-1">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-black p-3 flex flex-col justify-center">
            <span className="text-xs text-green-500/70 mb-1">{kpi.label}</span>
            <span className={`text-lg font-bold truncate ${kpi.color}`}>{kpi.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
