import { useEffect, useState } from "react";

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

const marketStats = [
  { label: "Arena TVL", value: "$128.7M", icon: WalletCards },
  { label: "Active Agents", value: "2,481", icon: Bot },
  { label: "Trades Today", value: "96,320", icon: Activity },
  { label: "Signal Accuracy", value: "84.6%", icon: ShieldCheck }
];

function App() {
  const API_KEY = import.meta.env.VITE_BIRDEYE_API_KEY;

  const [liveTokens, setLiveTokens] = useState([]);
  const [loadingTokens, setLoadingTokens] = useState(false);
  const [apiCalls, setApiCalls] = useState(0);

  const fetchTokens = async () => {
    try {
      setLoadingTokens(true);

      const response = await fetch(
        "https://public-api.birdeye.so/defi/tokenlist?sort_by=v24hUSD&sort_type=desc&offset=0&limit=10",
        {
          headers: {
            accept: "application/json",
            "X-API-KEY": API_KEY,
            "x-chain": "solana"
          }
        }
      );

      const data = await response.json();

      console.log("Birdeye API Response:", data);

      if (data?.data?.tokens) {
        setLiveTokens(data.data.tokens);
      }

      setApiCalls((prev) => prev + 1);
    } catch (error) {
      console.error("Birdeye API Error:", error);
    } finally {
      setLoadingTokens(false);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, []);

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
            <button className="primary-action" type="button" onClick={fetchTokens}>
              {loadingTokens ? "Loading Data..." : "Refresh Arena Data"}
              <ArrowUpRight size={18} />
            </button>

            <button className="secondary-action" type="button">
              <CandlestickChart size={18} />
              API Calls: {apiCalls}
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
            <span>BTC +3.4%</span>
            <span>ETH +5.2%</span>
            <span>SOL +8.1%</span>
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
          </div>

          <div className="token-list">
            {liveTokens.length === 0 ? (
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
              liveTokens.map((token) => (
                <article className="token-card" key={token.address || token.symbol}>
                  <div>
                    <strong>{token.symbol || "N/A"}</strong>
                    <span>{token.name || "Unknown Token"}</span>
                  </div>

                  <div>
                    <strong>
                      ${Number(token.price || 0).toLocaleString(undefined, {
                        maximumFractionDigits: 6
                      })}
                    </strong>
                    <span>
                      ${Number(token.v24hUSD || 0).toLocaleString(undefined, {
                        maximumFractionDigits: 0
                      })} Vol
                    </span>
                  </div>

                  <b>
                    {Number(token.v24hChangePercent || 0).toFixed(2)}%
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
            {Array.from({ length: 22 }).map((_, index) => (
              <span
                className="chart-bar"
                key={index}
                style={{
                  "--height": `${28 + ((index * 17) % 68)}%`,
                  "--delay": `${index * 0.08}s`
                }}
              />
            ))}
          </div>

          <div className="console-feed">
            <p><Gem size={16} /> Birdeye token list connected</p>
            <p><CircleDollarSign size={16} /> Live Solana market data loaded</p>
            <p><Bot size={16} /> Arena agents scanning top volume tokens</p>
            <p><Activity size={16} /> API calls tracked for campaign progress</p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
