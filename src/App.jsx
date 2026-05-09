import { useMemo } from "react";

import {
  Activity,
  ArrowUpRight,
  Bot,
  BrainCircuit,
  CandlestickChart,
  CircleDollarSign,
  Cpu,
  Gauge,
  Gem,
  RadioTower,
  ShieldCheck,
  Sparkles,
  Trophy,
  WalletCards,
  Zap
} from "lucide-react";
import { useBirdeyeTokens } from "./hooks/useBirdeyeTokens";

const traders = [
  {
    name: "Axiom Nova",
    role: "Momentum hunter",
    pnl: "+38.4%",
    risk: "Low",
    winRate: "82%",
    strategy: "Breakout scalp",
    accent: "cyan",
    icon: BrainCircuit
  },
  {
    name: "Vega Pulse",
    role: "Liquidity sniper",
    pnl: "+29.7%",
    risk: "Medium",
    winRate: "76%",
    strategy: "Orderflow sweep",
    accent: "green",
    icon: RadioTower
  },
  {
    name: "Orion Flux",
    role: "Macro allocator",
    pnl: "+21.9%",
    risk: "Guarded",
    winRate: "71%",
    strategy: "Rotation grid",
    accent: "violet",
    icon: Cpu
  }
];

const leaderboard = [
  { rank: 1, agent: "Axiom Nova", score: "98,420", arena: "Perps", streak: "12W" },
  { rank: 2, agent: "Vega Pulse", score: "91,870", arena: "Spot", streak: "9W" },
  { rank: 3, agent: "Orion Flux", score: "86,140", arena: "Yield", streak: "7W" },
  { rank: 4, agent: "Cipher Ray", score: "79,330", arena: "Options", streak: "5W" }
];

const fallbackTokens = [
  { symbol: "SOL", name: "Solana", price: 0, volume24h: 0, liquidity: 0, change24h: 0 },
  { symbol: "JUP", name: "Jupiter", price: 0, volume24h: 0, liquidity: 0, change24h: 0 },
  { symbol: "PYTH", name: "Pyth Network", price: 0, volume24h: 0, liquidity: 0, change24h: 0 }
];

const featuredMarketSymbols = [
  { symbol: "SOL", name: "Wrapped SOL" },
  { symbol: "USDC", name: "USD Coin" },
  { symbol: "USDT", name: "USDT" },
  { symbol: "jlUSDC", name: "Jupiter Lend USDC" },
  { symbol: "USD1", name: "World Liberty Financial USD" },
  { symbol: "cbBTC", name: "Coinbase Wrapped BTC" },
  { symbol: "ALIEN BOY", name: "ALIEN BOY" },
  { symbol: "ROAF", name: "Russian Oil Asset Fund" },
  { symbol: "ROLLING ON FLOOR", name: "ROFL" },
  { symbol: "RS C0IN", name: "RIV" },
  { symbol: "C0IN", name: "HANTA" },
  { symbol: "C0IN", name: "UNOS" }
];

function formatCurrency(value, maximumFractionDigits = 2) {
  return `$${Number(value || 0).toLocaleString(undefined, {
    maximumFractionDigits
  })}`;
}

function formatCompactCurrency(value) {
  return Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1
  }).format(Number(value || 0));
}

function formatPercent(value) {
  const number = Number(value || 0);
  return `${number >= 0 ? "+" : ""}${number.toFixed(2)}%`;
}

function buildFeaturedMarketMovers(tokens) {
  const usedKeys = new Set();
  const findToken = (asset) =>
    tokens.find((token) => {
      const key = token.address || `${token.symbol}-${token.name}`;
      const symbolMatches = token.symbol.toUpperCase() === asset.symbol.toUpperCase();
      const nameMatches = token.name.toUpperCase().includes(asset.name.toUpperCase());

      return symbolMatches && !usedKeys.has(key) && (asset.symbol !== "C0IN" || nameMatches);
    });
  const featured = featuredMarketSymbols.map((asset) => {
    const liveToken = findToken(asset);

    if (liveToken) {
      usedKeys.add(liveToken.address || `${liveToken.symbol}-${liveToken.name}`);
    }

    return liveToken ?? {
      ...asset,
      price: 0,
      volume24h: 0,
      liquidity: 0,
      change24h: 0,
      watchOnly: true
    };
  });
  const liveExtras = tokens.filter((token) => {
    const key = token.address || `${token.symbol}-${token.name}`;

    return !usedKeys.has(key);
  });

  return [...featured, ...liveExtras];
}

function App() {
  const tokenOptions = useMemo(() => ({ chain: "solana", limit: 50 }), []);
  const {
    tokens: liveTokens,
    status,
    error,
    meta,
    refresh
  } = useBirdeyeTokens(tokenOptions);
  const displayTokens = liveTokens.length > 0 ? buildFeaturedMarketMovers(liveTokens) : buildFeaturedMarketMovers(fallbackTokens);
  const isLoading = status === "loading";
  const totalVolume = displayTokens.reduce((sum, token) => sum + token.volume24h, 0);
  const totalLiquidity = displayTokens.reduce((sum, token) => sum + token.liquidity, 0);
  const positiveTokens = displayTokens.filter((token) => token.change24h >= 0).length;
  const averageChange =
    displayTokens.reduce((sum, token) => sum + token.change24h, 0) / displayTokens.length;
  const marketStats = [
    { label: "24h Volume", value: formatCompactCurrency(totalVolume), icon: WalletCards },
    { label: "Tracked Tokens", value: String(displayTokens.length), icon: Bot },
    { label: "Liquidity", value: formatCompactCurrency(totalLiquidity), icon: Activity },
    { label: "Positive Movers", value: `${positiveTokens}/${displayTokens.length}`, icon: ShieldCheck }
  ];
  const signalBars = displayTokens.slice(0, 10).map((token, index) => ({
    height: `${Math.min(96, Math.max(24, Math.abs(token.change24h) * 4 + 24))}%`,
    delay: `${index * 0.08}s`
  }));

  return (
    <main className="app-shell">
      <div className="grid-glow" />

      <header className="topbar">
        <a className="brand" href="/" aria-label="Agent Trader Arena home">
          <span className="brand-mark">
            <Sparkles size={18} />
          </span>
          <span>Agent Trader Arena</span>
        </a>

        <nav className="nav-links" aria-label="Primary navigation">
          <a href="#agents">Agents</a>
          <a href="#tokens">Tokens</a>
          <a href="#leaderboard">Leaderboard</a>
        </nav>

        <button className="connect-button" type="button">
          <WalletCards size={18} />
          Connect
        </button>
      </header>

      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">
            <Zap size={16} />
            Powered by Birdeye API
          </p>

          <h1>Agent Trader Arena</h1>

          <p className="hero-text">
            Watch AI traders compete across crypto markets with live Birdeye token data,
            market signals, risk telemetry, and leaderboard momentum.
          </p>

          <div className="hero-actions">
            <button
              className="primary-action"
              type="button"
              onClick={() => refresh({ forceRefresh: true })}
              disabled={isLoading}
            >
              {isLoading ? "Loading Data..." : "Refresh Arena Data"}
              <ArrowUpRight size={18} />
            </button>

            <button className="secondary-action" type="button">
              <CandlestickChart size={18} />
              API Calls: {meta.calls}
            </button>
          </div>
        </div>

        <div className="arena-visual" aria-label="Animated market dashboard preview">
          <div className="orbital orbital-one" />
          <div className="orbital orbital-two" />

          <div className="core-panel">
            <div className="pulse-ring" />
            <Gauge size={54} />
            <span>AI Market Core</span>
          </div>

          <div className="ticker-strip">
            {displayTokens.slice(0, 3).map((token) => (
              <span key={token.symbol}>
                {token.symbol} {formatPercent(token.change24h)}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="stats-grid" aria-label="Market statistics">
        {marketStats.map((stat) => {
          const Icon = stat.icon;

          return (
            <article className="stat-card" key={stat.label}>
              <Icon size={22} />
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </article>
          );
        })}
      </section>

      <section className="dashboard-band" id="agents">
        <div className="section-heading">
          <p>AI trader cards</p>
          <h2>Live competing agents</h2>
        </div>

        <div className="trader-grid">
          {traders.map((trader) => {
            const Icon = trader.icon;

            return (
              <article className={`trader-card accent-${trader.accent}`} key={trader.name}>
                <div className="card-header">
                  <div className="avatar">
                    <Icon size={24} />
                  </div>

                  <span className="risk-pill">{trader.risk}</span>
                </div>

                <h3>{trader.name}</h3>
                <p>{trader.role}</p>

                <div className="metric-row">
                  <span>PNL</span>
                  <strong>{trader.pnl}</strong>
                </div>

                <div className="metric-row">
                  <span>Win rate</span>
                  <strong>{trader.winRate}</strong>
                </div>

                <div className="strategy-bar">
                  <span>{trader.strategy}</span>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="split-layout">
        <div className="panel" id="tokens">
          <div className="section-heading compact">
            <p>Live Birdeye token cards</p>
            <h2>Market movers</h2>
            <span className="data-status">
              {error
                ? error
                : `${meta.source || "connecting"}${meta.fetchedAt ? ` | ${new Date(meta.fetchedAt).toLocaleTimeString()}` : ""}`}
            </span>
          </div>

          <div className="token-list">
            {isLoading && liveTokens.length === 0 ? (
              <article className="token-card">
                <div>
                  <strong>Loading</strong>
                  <span>Fetching Birdeye token data...</span>
                </div>
                <div>
                  <strong>--</strong>
                  <span>--</span>
                </div>
                <b>--</b>
              </article>
            ) : (
              displayTokens.slice(0, 14).map((token) => (
                <article className="token-card" key={token.address || token.symbol}>
                  <div>
                    <strong>{token.symbol}</strong>
                    <span>{token.watchOnly ? `${token.name} watchlist` : token.name}</span>
                  </div>

                  <div>
                    <strong>{formatCurrency(token.price, 6)}</strong>
                    <span>{formatCompactCurrency(token.volume24h)} Vol</span>
                  </div>

                  <b className={token.change24h < 0 ? "negative" : ""}>
                    {formatPercent(token.change24h)}
                  </b>
                </article>
              ))
            )}
          </div>
        </div>

        <div className="panel" id="leaderboard">
          <div className="section-heading compact">
            <p>Leaderboard cards</p>
            <h2>Top agents</h2>
          </div>

          <div className="leaderboard-list">
            {leaderboard.map((entry) => (
              <article className="leader-card" key={entry.agent}>
                <span className="rank">
                  <Trophy size={16} />
                  #{entry.rank}
                </span>

                <div>
                  <strong>{entry.agent}</strong>
                  <span>{entry.arena} arena</span>
                </div>

                <div>
                  <strong>{entry.score}</strong>
                  <span>{entry.streak} streak</span>
                </div>
              </article>
            ))}
            {displayTokens.slice(0, 3).map((token, index) => (
              <article className="leader-card" key={`token-${token.address || token.symbol}`}>
                <span className="rank">
                  <Trophy size={16} />
                  #{index + 5}
                </span>

                <div>
                  <strong>{token.symbol} Scout</strong>
                  <span>Live token arena</span>
                </div>

                <div>
                  <strong>{formatCompactCurrency(token.volume24h)}</strong>
                  <span>{formatPercent(token.change24h)} 24h</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="signal-console" aria-label="Animated dashboard">
        <div className="section-heading compact">
          <p>Animated dashboard</p>
          <h2>Signal stream</h2>
        </div>

        <div className="console-grid">
          <div className="signal-chart">
            {signalBars.map((bar, index) => (
              <span
                className="chart-bar"
                key={index}
                style={{
                  "--height": bar.height,
                  "--delay": bar.delay
                }}
              />
            ))}
          </div>

          <div className="console-feed">
            <p><Gem size={16} /> {displayTokens[0]?.symbol} leads live volume scan</p>
            <p><CircleDollarSign size={16} /> {formatCompactCurrency(totalVolume)} routed through watched markets</p>
            <p><Bot size={16} /> Arena agents tracking {displayTokens.length} Solana tokens</p>
            <p><Activity size={16} /> Average 24h move is {formatPercent(averageChange)}</p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
