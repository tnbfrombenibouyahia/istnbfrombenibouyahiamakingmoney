import { AlertTriangle } from 'lucide-react';

interface GaugeProps {
  label: string;
  used: number;
  limit: number;
  pct: number;
}

function Gauge({ label, used, limit, pct }: GaugeProps) {
  const remaining = Math.max(limit - used, 0);
  const isDanger = pct > 80;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between font-bold text-xs">
        <span className={isDanger ? 'text-red-400 glow-text-red' : 'text-green-500/80 glow-text'}>{label}</span>
        <span className={isDanger ? 'text-red-500 glow-text-red' : 'text-green-400 glow-text'}>
          ${used.toFixed(2)} / ${limit.toFixed(0)}
        </span>
      </div>
      <div className="h-3 w-full border border-green-500/40 bg-[#020602] relative shadow-[0_0_5px_rgba(74,222,128,0.2)]">
        <div
          className={`h-full absolute left-0 top-0 transition-all ${isDanger ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-green-500/50'}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <div className="flex justify-between text-[9px] font-bold tracking-wider">
        <span className={isDanger ? 'text-red-500 glow-text-red' : 'text-green-500/70'}>{pct.toFixed(1)}% USED</span>
        <span className="text-green-500/60">${remaining.toFixed(2)} REMAINING</span>
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
  const dailyUsed = Math.max(0, -(dailyPnl + floatingPnl));
  const ddUsed = Math.max(0, initialBalance - equity);
  const dailyUsedPct = dailyLimit > 0 ? (dailyUsed / dailyLimit) * 100 : 0;
  const ddUsedPct = ddLimit > 0 ? (ddUsed / ddLimit) * 100 : 0;

  const breach = dailyUsed >= dailyLimit || ddUsed >= ddLimit;
  const danger = dailyUsedPct > 80 || ddUsedPct > 80;

  return (
    <div className="terminal-panel flex flex-col h-full uppercase">
      <div className="terminal-header p-2 text-sm font-bold flex justify-between items-center tracking-widest border-b border-green-500/20">
        <span className="glow-text text-green-300">PROP_RISK_MONITOR</span>
        {breach ? (
          <span className="flex items-center gap-1 text-[10px] text-red-500 font-bold animate-pulse glow-text-red">
            <AlertTriangle size={12} fill="currentColor" stroke="black" /> BREACH
          </span>
        ) : danger ? (
          <span className="flex items-center gap-1 text-[10px] text-yellow-500 font-bold" style={{ textShadow: '0 0 5px rgba(234, 179, 8, 0.5)' }}>
            <AlertTriangle size={12} fill="currentColor" stroke="black" /> DANGER
          </span>
        ) : (
          <span className="text-[10px] text-green-400 font-bold glow-text">SAFE</span>
        )}
      </div>
      <div className="flex-1 px-4 py-6 flex flex-col justify-around space-y-4 text-xs font-mono">
        {!singleAccount ? (
          <div className="text-center text-green-800 text-xs uppercase tracking-widest">
            SELECT A SINGLE ACCOUNT TO MONITOR PROP RULES
          </div>
        ) : (
          <>
            <Gauge
              label={`DAILY_LOSS_LIMIT (${(dailyLossLimitPct * 100).toFixed(0)}%)`}
              used={dailyUsed}
              limit={dailyLimit}
              pct={dailyUsedPct}
            />
            <Gauge
              label={`MAX_DRAWDOWN (${(maxDrawdownPct * 100).toFixed(0)}%)`}
              used={ddUsed}
              limit={ddLimit}
              pct={ddUsedPct}
            />
          </>
        )}
      </div>
      <div className="px-4 py-3 border-t border-green-500/20 text-[9px] text-green-500/50 tracking-widest font-bold">
        BASE: ${initialBalance.toLocaleString()} — DAILY INCLUDES FLOATING P&L
      </div>
    </div>
  );
}
