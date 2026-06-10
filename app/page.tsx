"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import { Activity } from "lucide-react";
import { KPIGrid } from "./components/KPIGrid";
import { PortfolioChart, PortfolioDataPoint } from "./components/PortfolioChart";
import { StrategyChart, StrategyDataPoint, StrategyMeta } from "./components/StrategyChart";
import { HoldingsTable, Holding } from "./components/HoldingsTable";
import { TransactionList, Transaction } from "./components/TransactionList";
import { ReasoningPanel, LogEntry } from "./components/ReasoningPanel";
import { RiskPanel } from "./components/RiskPanel";
import { StrategyTable, StrategyRow } from "./components/StrategyTable";
import { FilterBar, Filters, ALL } from "./components/FilterBar";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const STRATEGY_COLORS = ["#4ade80", "#c084fc", "#00ffff", "#ff9900", "#ff6666", "#ffffff"];

// Prop firm rules — ideally these come from an `accounts` metadata table (see ETL guidelines)
const DAILY_LOSS_LIMIT_PCT = 0.05;
const MAX_DRAWDOWN_PCT = 0.10;

// Parse initial balance from account ids like "FTMO_10K_550163411" → 10000
function parseInitialBalance(accountId: string): number {
  const m = accountId.match(/(\d+)K/i);
  return m ? parseInt(m[1], 10) * 1000 : 10000;
}

interface AccountState {
  account_id: string;
  platform: string;
  currency: string;
  balance: number;
  equity: number;
  margin_used: number;
  open_positions: number;
  last_update: string;
}

interface TradeSnapshot {
  ticket: number;
  account_id: string;
  platform: string;
  algo_name: string;
  symbol: string;
  lots: number;
  profit_net: number;
  open_time: string;
  close_time: string | null;
}

/* ── Data transforms ─────────────────────────────────────────── */

function buildPortfolioData(trades: TradeSnapshot[], startBalance: number): PortfolioDataPoint[] {
  const closed = trades
    .filter((t) => t.close_time !== null)
    .sort((a, b) => new Date(a.close_time!).getTime() - new Date(b.close_time!).getTime());

  if (closed.length === 0) return [];

  let equity = startBalance;
  return closed.map((t) => {
    equity += t.profit_net;
    const dt = new Date(t.close_time!);
    const time = `${String(dt.getUTCHours()).padStart(2, "0")}:${String(dt.getUTCMinutes()).padStart(2, "0")}`;
    return {
      time,
      value: Math.round(equity * 100) / 100,
      pct: startBalance > 0 ? Math.round(((equity - startBalance) / startBalance) * 10000) / 100 : 0,
    };
  });
}

function buildStrategyData(
  trades: TradeSnapshot[],
  strategies: StrategyMeta[],
  startBalance: number,
): StrategyDataPoint[] {
  const names = strategies.map((s) => s.name);
  const closed = trades
    .filter((t) => t.close_time !== null)
    .sort((a, b) => new Date(a.close_time!).getTime() - new Date(b.close_time!).getTime());

  if (closed.length === 0) return [];

  const cumulative: Record<string, number> = {};
  names.forEach((n) => { cumulative[n] = 0; });

  const points: StrategyDataPoint[] = [];
  for (const t of closed) {
    if (!names.includes(t.algo_name)) continue;
    cumulative[t.algo_name] += t.profit_net;
    const dt = new Date(t.close_time!);
    const time = `${String(dt.getUTCHours()).padStart(2, "0")}:${String(dt.getUTCMinutes()).padStart(2, "0")}`;
    const pt: StrategyDataPoint = { time };
    const base = startBalance > 0 ? startBalance : 1;
    names.forEach((n) => { pt[n] = Math.round((cumulative[n] / base) * 10000) / 100; });
    points.push(pt);
  }

  if (points.length <= 60) return points;
  const step = Math.floor(points.length / 60);
  return points.filter((_, i) => i % step === 0).slice(0, 60);
}

function buildStrategyRows(trades: TradeSnapshot[], strategies: StrategyMeta[], today: string): StrategyRow[] {
  return strategies.map((s) => {
    const algoTrades = trades.filter((t) => t.algo_name === s.name);
    const closed = algoTrades
      .filter((t) => t.close_time !== null)
      .sort((a, b) => new Date(a.close_time!).getTime() - new Date(b.close_time!).getTime());
    const open = algoTrades.filter((t) => !t.close_time);

    const winners = closed.filter((t) => t.profit_net > 0);
    const grossProfit = winners.reduce((sum, t) => sum + t.profit_net, 0);
    const grossLoss = Math.abs(closed.filter((t) => t.profit_net <= 0).reduce((sum, t) => sum + t.profit_net, 0));

    // Max drawdown on the cumulative closed P&L curve
    let cum = 0, peak = 0, maxDD = 0;
    for (const t of closed) {
      cum += t.profit_net;
      if (cum > peak) peak = cum;
      if (peak - cum > maxDD) maxDD = peak - cum;
    }

    return {
      name: s.name,
      color: s.color,
      platform: algoTrades[0]?.platform ?? "—",
      totalPnl: Math.round(closed.reduce((sum, t) => sum + t.profit_net, 0) * 100) / 100,
      todayPnl: Math.round(closed.filter((t) => t.close_time!.startsWith(today)).reduce((sum, t) => sum + t.profit_net, 0) * 100) / 100,
      winRate: closed.length > 0 ? (winners.length / closed.length) * 100 : 0,
      profitFactor: grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 99 : 0,
      maxDD: Math.round(maxDD * 100) / 100,
      trades: closed.length,
      openLots: open.reduce((sum, t) => sum + t.lots, 0),
    };
  }).sort((a, b) => b.totalPnl - a.totalPnl);
}

function buildHoldings(trades: TradeSnapshot[]): Holding[] {
  return trades
    .filter((t) => !t.close_time)
    .map((t) => ({
      ticker: t.symbol,
      algo: t.algo_name,
      lots: t.lots,
      openTime: new Date(t.open_time).toUTCString().slice(17, 22),
      unrealizedPnl: Math.round(t.profit_net * 100) / 100,
    }));
}

function buildTransactions(trades: TradeSnapshot[]): Transaction[] {
  const closed = trades
    .filter((t) => t.close_time !== null)
    .sort((a, b) => new Date(b.close_time!).getTime() - new Date(a.close_time!).getTime())
    .slice(0, 20);

  const maxAbs = Math.max(...closed.map((t) => Math.abs(t.profit_net)), 1);
  return closed.map((t) => ({
    id: String(t.ticket),
    time: new Date(t.close_time!).toUTCString().slice(17, 22),
    pair: t.symbol,
    algo: t.algo_name,
    pnl: Math.round(t.profit_net * 100) / 100,
    risk: Math.abs(t.profit_net) / maxAbs,
  }));
}

function buildLogs(trades: TradeSnapshot[]): LogEntry[] {
  return trades
    .filter((t) => t.close_time !== null)
    .sort((a, b) => new Date(b.close_time!).getTime() - new Date(a.close_time!).getTime())
    .slice(0, 30)
    .map((t) => ({
      id: String(t.ticket),
      time: new Date(t.close_time!).toUTCString().slice(17, 22),
      message: `${t.algo_name}: Closed ${t.symbol} ${t.lots}L → ${t.profit_net >= 0 ? "+" : ""}$${t.profit_net.toFixed(2)}`,
      level: t.profit_net < -200 ? ("WARN" as const) : ("INFO" as const),
    }))
    .reverse();
}

/* ── Main component ─────────────────────────────────────────── */

export default function Dashboard() {
  const [accounts, setAccounts] = useState<AccountState[]>([]);
  const [allTrades, setAllTrades] = useState<TradeSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [time, setTime] = useState("");
  const [filters, setFilters] = useState<Filters>({ account: ALL, platform: ALL, algo: ALL, symbol: ALL });

  useEffect(() => {
    setTime(new Date().toLocaleTimeString("en-US", { hour12: false, timeZone: "UTC" }));
    const id = setInterval(() =>
      setTime(new Date().toLocaleTimeString("en-US", { hour12: false, timeZone: "UTC" })), 1000);
    return () => clearInterval(id);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const [accountRes, tradesRes] = await Promise.all([
        supabase.from("live_account_state").select("*").order("last_update", { ascending: false }),
        supabase.from("trade_snapshots").select("*").order("open_time", { ascending: true }),
      ]);

      if (accountRes.error) throw new Error(`live_account_state: ${accountRes.error.message}`);
      if (tradesRes.error) throw new Error(`trade_snapshots: ${tradesRes.error.message}`);

      // Keep only the latest state per account
      const seen = new Set<string>();
      const latestAccounts = (accountRes.data as AccountState[]).filter((a) => {
        if (seen.has(a.account_id)) return false;
        seen.add(a.account_id);
        return true;
      });

      setAccounts(latestAccounts);
      setAllTrades((tradesRes.data ?? []) as TradeSnapshot[]);
      setFetchError(null);
    } catch (err: unknown) {
      setFetchError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 30_000);
    return () => clearInterval(id);
  }, [fetchData]);

  /* ── Filter options (from raw data) ── */
  const accountIds = useMemo(() => Array.from(new Set(allTrades.map((t) => t.account_id).concat(accounts.map((a) => a.account_id)))), [allTrades, accounts]);
  const platformIds = useMemo(() => Array.from(new Set(allTrades.map((t) => t.platform).concat(accounts.map((a) => a.platform)))), [allTrades, accounts]);
  const algoIds = useMemo(() => Array.from(new Set(allTrades.map((t) => t.algo_name))), [allTrades]);
  const symbolIds = useMemo(() => Array.from(new Set(allTrades.map((t) => t.symbol))), [allTrades]);

  /* ── Apply filters ── */
  const trades = useMemo(() => allTrades.filter((t) =>
    (filters.account === ALL || t.account_id === filters.account) &&
    (filters.platform === ALL || t.platform === filters.platform) &&
    (filters.algo === ALL || t.algo_name === filters.algo) &&
    (filters.symbol === ALL || t.symbol === filters.symbol)
  ), [allTrades, filters]);

  const filteredAccounts = useMemo(() => accounts.filter((a) =>
    (filters.account === ALL || a.account_id === filters.account) &&
    (filters.platform === ALL || a.platform === filters.platform)
  ), [accounts, filters]);

  // Aggregate account state across the filtered accounts
  const balance = filteredAccounts.reduce((s, a) => s + a.balance, 0);
  const equity = filteredAccounts.reduce((s, a) => s + a.equity, 0);
  const marginUsed = filteredAccounts.reduce((s, a) => s + a.margin_used, 0);
  const floatingPnl = equity - balance;
  const marginUsedPct = balance > 0 ? (marginUsed / balance) * 100 : 0;

  const strategies = useMemo<StrategyMeta[]>(() => {
    const names = Array.from(new Set(trades.map((t) => t.algo_name)));
    return names.map((name, i) => ({ name, color: STRATEGY_COLORS[i % STRATEGY_COLORS.length] }));
  }, [trades]);

  const closedTrades = useMemo(() => trades.filter((t) => t.close_time), [trades]);
  const today = new Date().toISOString().slice(0, 10);
  const dailyPnl = useMemo(
    () => closedTrades.filter((t) => t.close_time!.startsWith(today)).reduce((s, t) => s + t.profit_net, 0),
    [closedTrades, today],
  );
  const winRate = useMemo(() => {
    if (closedTrades.length === 0) return 0;
    return (closedTrades.filter((t) => t.profit_net > 0).length / closedTrades.length) * 100;
  }, [closedTrades]);

  const totalPnl = useMemo(() => closedTrades.reduce((s, t) => s + t.profit_net, 0), [closedTrades]);
  const totalPnlPct = balance > 0 ? (totalPnl / balance) * 100 : 0;

  const portfolioData = useMemo(() => buildPortfolioData(trades, balance), [trades, balance]);
  const strategyData = useMemo(() => buildStrategyData(trades, strategies, balance), [trades, strategies, balance]);
  const strategyRows = useMemo(() => buildStrategyRows(trades, strategies, today), [trades, strategies, today]);
  const holdings = useMemo(() => buildHoldings(trades), [trades]);
  const transactions = useMemo(() => buildTransactions(trades), [trades]);
  const logs = useMemo(() => buildLogs(trades), [trades]);

  // Risk panel: only meaningful when exactly one account is in scope
  const singleAccount = filteredAccounts.length === 1;
  const riskAccount = singleAccount ? filteredAccounts[0] : null;
  const initialBalance = riskAccount ? parseInitialBalance(riskAccount.account_id) : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center font-mono">
        <div className="text-green-400 text-sm animate-pulse uppercase tracking-widest">
          ESTABLISHING SECURE CONNECTION TO QUANT ENGINE...
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center font-mono gap-3 px-8">
        <div className="text-red-500 text-xs uppercase tracking-widest">⚠ CONNECTION ERROR</div>
        <div className="border border-red-500 bg-black px-4 py-3 text-xs text-red-400 max-w-2xl w-full break-all">
          {fetchError}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-2 lg:p-4 selection:bg-green-500/30">
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-4 gap-4">

        {/* Header */}
        <header className="lg:col-span-4 border border-green-500 p-4 flex flex-col md:flex-row justify-between items-start md:items-center bg-black/80 relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{ backgroundImage: 'linear-gradient(#4ade80 1px, transparent 1px), linear-gradient(90deg, #4ade80 1px, transparent 1px)', backgroundSize: '20px 20px' }}
          />
          <div className="flex gap-4 items-center relative z-10 mb-4 md:mb-0">
            <Activity className="w-6 h-6 text-green-400" />
            <h1 className="text-xl font-bold tracking-wider">NEOTAJIB — QUANT TERMINAL</h1>
            <span className="animate-pulse bg-green-500/20 text-green-400 border border-green-500 px-2 py-0.5 text-xs font-bold">
              LIVE
            </span>
          </div>
          <div className="text-left md:text-right relative z-10 w-full md:w-auto">
            <div className="flex justify-between md:block gap-4">
              <div className="text-sm border-b border-green-500/30 pb-1 mb-1 text-green-500/70">
                SYS_TIME: {time} UTC
              </div>
              <div className={`font-bold tracking-tight ${totalPnl >= 0 ? 'text-green-400' : 'text-red-500'}`}>
                NET_PNL_ALL: {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)} ({totalPnlPct >= 0 ? '+' : ''}{totalPnlPct.toFixed(2)}%)
              </div>
            </div>
          </div>
        </header>

        {/* Filters */}
        <div className="lg:col-span-4">
          <FilterBar
            accounts={accountIds}
            platforms={platformIds}
            algos={algoIds}
            symbols={symbolIds}
            filters={filters}
            onChange={setFilters}
          />
        </div>

        {/* Row 1: Chart + KPIs */}
        <div className="lg:col-span-3 h-[300px] lg:h-[400px]">
          <PortfolioChart data={portfolioData} />
        </div>
        <div className="lg:col-span-1 h-[300px] lg:h-[400px]">
          <KPIGrid
            cash={balance}
            positionValue={floatingPnl}
            totalCapital={equity}
            dailyPnl={dailyPnl}
            marginUsed={marginUsedPct}
            winRate={winRate}
          />
        </div>

        {/* Row 2: Risk monitor + Strategy matrix */}
        <div className="lg:col-span-1 h-[300px]">
          <RiskPanel
            initialBalance={initialBalance}
            equity={riskAccount?.equity ?? 0}
            dailyPnl={dailyPnl}
            floatingPnl={riskAccount ? riskAccount.equity - riskAccount.balance : 0}
            dailyLossLimitPct={DAILY_LOSS_LIMIT_PCT}
            maxDrawdownPct={MAX_DRAWDOWN_PCT}
            singleAccount={singleAccount}
          />
        </div>
        <div className="lg:col-span-3 h-[300px]">
          <StrategyTable rows={strategyRows} />
        </div>

        {/* Row 3: Strategy comparison chart */}
        <div className="lg:col-span-4 h-[300px]">
          <StrategyChart data={strategyData} strategies={strategies} />
        </div>

        {/* Row 4: Holdings + Transactions + Logs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:col-span-4 gap-4 min-h-[350px]">
          <div className="h-[350px]">
            <HoldingsTable holdings={holdings} />
          </div>
          <div className="h-[350px]">
            <TransactionList transactions={transactions} />
          </div>
          <div className="h-[350px]">
            <ReasoningPanel logs={logs} />
          </div>
        </div>

      </div>
    </div>
  );
}
