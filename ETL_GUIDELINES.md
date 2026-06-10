# ETL Guidelines — Quant Terminal Data Pipeline

Objectif : enrichir le pipeline (EA/bot → Supabase) pour supporter les besoins actuels
et futurs du dashboard (multi-stratégies, multi-plateformes, multi-assets, règles prop firm).

---

## 1. Schéma cible

### 1.1 `trade_snapshots` — colonnes à ajouter

```sql
ALTER TABLE trade_snapshots
  ADD COLUMN direction      text CHECK (direction IN ('BUY','SELL')),
  ADD COLUMN open_price     numeric,
  ADD COLUMN close_price    numeric,
  ADD COLUMN sl             numeric,          -- stop loss au moment du snapshot
  ADD COLUMN tp             numeric,          -- take profit
  ADD COLUMN commission     numeric DEFAULT 0,
  ADD COLUMN swap           numeric DEFAULT 0,
  ADD COLUMN profit_gross   numeric,          -- profit_net = profit_gross + commission + swap
  ADD COLUMN magic_number   bigint,           -- identifiant EA côté MT4/MT5
  ADD COLUMN asset_class    text,             -- 'FOREX' | 'INDICES' | 'METALS' | 'CRYPTO' | 'EQUITIES'
  ADD COLUMN strategy_version text;           -- ex: 'v2.3' — crucial pour comparer les itérations d'un algo
```

Pourquoi :
- `direction` + lots signés → calcul d'**exposition nette par symbole** (3 algos long EURUSD = risque concentré).
- `open_price/close_price/sl/tp` → calcul du **R-multiple réel** (gain en multiples du risque initial), MAE/MFE plus tard.
- `commission/swap/profit_gross` → séparer la performance de la stratégie des coûts de trading.
- `asset_class` → agrégations par classe d'actif quand tu auras des assets hétérogènes.
- `strategy_version` → quand tu améliores un algo, ne pas mélanger les stats de v1 et v2.

### 1.2 Nouvelle table `equity_snapshots` (fortement recommandée)

```sql
CREATE TABLE equity_snapshots (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  account_id  text NOT NULL,
  ts          timestamptz NOT NULL DEFAULT now(),
  balance     numeric NOT NULL,
  equity      numeric NOT NULL,
  margin_used numeric DEFAULT 0,
  UNIQUE (account_id, ts)
);
CREATE INDEX idx_equity_snap ON equity_snapshots (account_id, ts DESC);
```

Pousser **toutes les 1 à 5 minutes** depuis l'EA. C'est la seule façon d'avoir :
- une vraie courbe d'équité (incluant le P&L flottant, pas juste les trades fermés) ;
- un **drawdown intra-trade exact** — reconstruire depuis les trades fermés sous-estime
  systématiquement le drawdown réel ;
- un monitoring FTMO fiable (la daily loss FTMO inclut le flottant).

### 1.3 Nouvelle table `accounts` (métadonnées)

```sql
CREATE TABLE accounts (
  account_id            text PRIMARY KEY,
  platform              text NOT NULL,        -- 'MT5', 'MT4', 'cTrader', 'IBKR'...
  broker                text,                 -- 'FTMO', 'ICMarkets'...
  currency              text DEFAULT 'USD',
  initial_balance       numeric NOT NULL,     -- 10000 pour le FTMO 10K
  daily_loss_limit_pct  numeric,              -- 0.05 pour FTMO
  max_drawdown_pct      numeric,              -- 0.10 pour FTMO
  is_prop               boolean DEFAULT false,
  day_anchor_tz         text DEFAULT 'Europe/Prague',  -- FTMO reset à minuit CE(S)T
  created_at            timestamptz DEFAULT now()
);
```

Le dashboard lira les règles de risque ici au lieu de les coder en dur
(actuellement `parseInitialBalance()` devine depuis le nom du compte — fragile).

---

## 2. Règles ETL (côté EA / script)

### 2.1 Idempotence — toujours UPSERT, jamais INSERT

```sql
-- clé de conflit : un ticket est unique par compte
INSERT INTO trade_snapshots (...) VALUES (...)
ON CONFLICT (account_id, ticket) DO UPDATE SET
  profit_net = EXCLUDED.profit_net,
  close_time = EXCLUDED.close_time, ...
```

Si l'EA redémarre ou renvoie l'historique, aucun doublon. Ajoute la contrainte :
`ALTER TABLE trade_snapshots ADD CONSTRAINT uq_trade UNIQUE (account_id, ticket);`

### 2.2 Timestamps — UTC partout, type `timestamptz`

- Convertis le temps serveur MT4/MT5 (souvent GMT+2/+3 selon le broker) en **UTC avant l'envoi**.
- Ne jamais stocker du texte ambigu type `2026-06-10 14:30:00` sans timezone.
- Le "jour de trading" FTMO commence à minuit heure de Prague : stocke en UTC,
  laisse le dashboard convertir avec `day_anchor_tz`.

### 2.3 Fréquences de push recommandées

| Donnée                  | Fréquence                       |
|-------------------------|---------------------------------|
| `equity_snapshots`      | 1–5 min (+ à chaque trade)      |
| Trades ouverts (P&L flottant) | 30–60 s                   |
| Trade fermé             | immédiat à la clôture           |
| `live_account_state`    | 30–60 s                         |
| `accounts`              | une fois (manuel ou à l'init)   |

### 2.4 Fiabilité

- **Buffer local + retry** : si Supabase est injoignable, mettre en file (fichier local)
  et rejouer au retour du réseau. Ne jamais perdre un trade fermé.
- **Backfill au démarrage** : à chaque démarrage de l'EA, renvoyer l'historique des
  N derniers jours (l'UPSERT rend ça sans risque). Couvre les trous de connexion.
- **Heartbeat** : `live_account_state.last_update` sert de heartbeat — le dashboard
  pourra afficher "STALE DATA" si > 2 min.

### 2.5 Sécurité Supabase

- L'EA écrit avec la **clé `service_role` ou une clé dédiée**, jamais la publishable.
- La publishable key (celle du dashboard) doit être **read-only** via RLS :

```sql
ALTER TABLE trade_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY read_only ON trade_snapshots FOR SELECT USING (true);
-- pas de policy INSERT/UPDATE/DELETE pour anon → écriture bloquée
-- répéter pour equity_snapshots, live_account_state, accounts
```

### 2.6 Indexes

```sql
CREATE INDEX idx_trades_account_close ON trade_snapshots (account_id, close_time DESC);
CREATE INDEX idx_trades_algo ON trade_snapshots (algo_name);
```

---

## 3. Conventions de nommage (multi-plateformes)

- `account_id` : `{BROKER}_{TAILLE}_{LOGIN}` → `FTMO_10K_550163411`. Garde ce format.
- `algo_name` : stable dans le temps, sans espaces — `mean_rev_eurusd`, pas `Mean Rev v2 (test)`.
  La version va dans `strategy_version`, pas dans le nom.
- `symbol` : **normalise entre brokers** — `EURUSD.r`, `EURUSD.pro`, `EURUSDm` → `EURUSD`.
  Sinon les filtres et l'exposition nette par asset seront cassés. Garde le symbole brut
  dans une colonne `symbol_raw` si besoin de debug.
- `platform` : valeurs fixes — `MT5`, `MT4`, `CTRADER`, `IBKR`.

---

## 4. Roadmap données → features dashboard

| Enrichissement              | Feature débloquée                                  |
|-----------------------------|----------------------------------------------------|
| `equity_snapshots`          | Courbe d'équité réelle, underwater curve, monitoring FTMO précis |
| `direction` + lots          | Exposition nette par symbole                       |
| `sl` / `open_price`         | R-multiples, distribution risque/trade             |
| `accounts` metadata         | Risk panel data-driven, multi-comptes propre       |
| `commission` / `swap`       | Performance nette vs brute par stratégie           |
| `strategy_version`          | A/B comparaison des itérations d'un algo           |
| P&L journaliers par algo (vue SQL) | Matrice de corrélation entre stratégies     |
