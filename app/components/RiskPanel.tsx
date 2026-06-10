interface GaugeProps {
  label: string;
  used: number;
  limit: number;
}

function Gauge({ label, used, limit }: GaugeProps) {
  const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  const remaining = Math.max(limit - used, 0);
  const color = pct < 50 ? '#4ade80' : pct < 80 ? '#eab308' : '#ef4444';
  const textColor = pct < 50 ? 'text-green-400' : pct < 80 ? 'text-yellow-500' : 'text-red-500';

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs">
        <span className="text-green-500/70">{label}</span>
        <span className={`font-bold ${textColor}`}>
          ${used.toFixed(2)} / ${limit.toFixed(0)}
        </span>
      </div>
      <div className="h-3 border border-green-500/40 bg-black relative">
        <div className="h-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <div className="flex justify-between text-[10px]">
        <span className={textColor}>{pct.toFixed(1)}% USED</span>
        <span className="text-green-500/50">${remaining.toFixed(2)} REMAINING</span>
      </div>
    </div>
  );
}

interface RiskPanelProps {
  initialBalance: number;
  equity: number;
  dailyPnl: number;
  floatingPnl: number;
  dailyLossLimitPct: number;
  maxDrawdownPct: number;
  singleAccount: boolean;
}

export function RiskPanel({
  initialBalance,
  equity,
  dailyPnl,
  floatingPnl,
  dailyLossLimitPct,
  maxDrawdownPct,
  singleAccount,
}: RiskPanelProps) {
  const dailyLimit = initialBalance * dailyLossLimitPct;
  const ddLimit = initialBalance * maxDrawdownPct;
  // FTMO counts floating P&L against the daily limit
  const dailyUsed = Math.max(0, -(dailyPnl + floatingPnl));
  const ddUsed = Math.max(0, initialBalance - equity);

  const breach = dailyUsed >= dailyLimit || ddUsed >= ddLimit;
  const danger = dailyUsed >= dailyLimit * 0.8 || ddUsed >= ddLimit * 0.8;

  return (
    <div className={`border flex flex-col h-full bg-black ${breach ? 'border-red-500' : 'border-green-500'}`}>
      <div className={`border-b p-2 text-sm font-bold flex justify-between items-center ${breach ? 'border-red-500 bg-red-950/30 text-red-500' : 'border-green-500 bg-green-950/30'}`}>
        <span>PROP_RISK_MONITOR</span>
        {breach ? (
          <span className="text-xs animate-pulse text-red-500 font-bold">⚠ BREACH</span>
        ) : danger ? (
          <span className="text-xs animate-pulse text-yellow-500 font-bold">⚠ DANGER</span>
        ) : (
          <span className="text-xs text-green-400">OK</span>
        )}
      </div>
      <div className="flex-1 p-3 flex flex-col justify-center gap-5">
        {!singleAccount ? (
          <div className="text-center text-green-800 text-xs uppercase">
            SELECT A SINGLE ACCOUNT TO MONITOR PROP RULES
          </div>
        ) : (
          <>
            <Gauge
              label={`DAILY_LOSS_LIMIT (${(dailyLossLimitPct * 100).toFixed(0)}%)`}
              used={dailyUsed}
              limit={dailyLimit}
            />
            <Gauge
              label={`MAX_DRAWDOWN (${(maxDrawdownPct * 100).toFixed(0)}%)`}
              used={ddUsed}
              limit={ddLimit}
            />
            <div className="text-[10px] text-green-500/50 border-t border-green-500/20 pt-2">
              BASE: ${initialBalance.toLocaleString()} — DAILY INCLUDES FLOATING P&L
            </div>
          </>
        )}
      </div>
    </div>
  );
}
