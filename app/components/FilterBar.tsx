"use client";

export interface Filters {
  account: string;
  platform: string;
  algo: string;
  symbol: string;
}

export const ALL = "ALL";

interface FilterBarProps {
  accounts: string[];
  platforms: string[];
  algos: string[];
  symbols: string[];
  filters: Filters;
  onChange: (f: Filters) => void;
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-xs">
      <span className="text-green-500/70">{label}:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-black border border-green-500/50 text-green-400 px-2 py-1 text-xs font-mono outline-none hover:border-green-500 focus:border-green-400 cursor-pointer"
      >
        <option value={ALL}>ALL</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}

export function FilterBar({ accounts, platforms, algos, symbols, filters, onChange }: FilterBarProps) {
  const isFiltered =
    filters.account !== ALL || filters.platform !== ALL || filters.algo !== ALL || filters.symbol !== ALL;

  return (
    <div className="border border-green-500 bg-black p-2 flex flex-wrap items-center gap-x-6 gap-y-2">
      <span className="text-xs font-bold bg-green-500 text-black px-2 py-1">FILTERS</span>
      <Select label="ACCOUNT" value={filters.account} options={accounts}
        onChange={(v) => onChange({ ...filters, account: v })} />
      <Select label="PLATFORM" value={filters.platform} options={platforms}
        onChange={(v) => onChange({ ...filters, platform: v })} />
      <Select label="STRATEGY" value={filters.algo} options={algos}
        onChange={(v) => onChange({ ...filters, algo: v })} />
      <Select label="ASSET" value={filters.symbol} options={symbols}
        onChange={(v) => onChange({ ...filters, symbol: v })} />
      {isFiltered && (
        <button
          onClick={() => onChange({ account: ALL, platform: ALL, algo: ALL, symbol: ALL })}
          className="text-xs border border-green-500/50 px-2 py-1 text-green-400 hover:bg-green-500 hover:text-black transition-colors"
        >
          [X] RESET
        </button>
      )}
    </div>
  );
}
