const BIRDEYE_TOKEN_LIST_URL = "/api/birdeye/token-list";
const BIRDEYE_PUBLIC_TOKEN_LIST_URL = "https://public-api.birdeye.so/defi/tokenlist";
const CACHE_TTL_MS = 30_000;
const DEFAULT_TIMEOUT_MS = 9_000;

const cache = new Map();

function sleep(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function buildQuery(params) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });

  return query.toString();
}

async function fetchJsonWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), options.timeoutMs ?? DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        accept: "application/json",
        ...options.headers
      }
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      const message = payload?.message || payload?.error || `Request failed with ${response.status}`;
      const error = new Error(message);
      error.status = response.status;
      error.payload = payload;
      throw error;
    }

    return payload;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

async function requestWithRetry(url, options = {}) {
  const retries = options.retries ?? 2;
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await fetchJsonWithTimeout(url, options);
    } catch (error) {
      lastError = error;
      const retryable = error.name === "AbortError" || error.status === 429 || error.status >= 500;

      if (!retryable || attempt === retries) {
        break;
      }

      await sleep(450 * 2 ** attempt);
    }
  }

  throw lastError;
}

function normalizeToken(token) {
  const change = Number(token.v24hChangePercent ?? token.priceChange24hPercent ?? 0);

  return {
    address: token.address,
    symbol: token.symbol || "N/A",
    name: token.name || "Unknown Token",
    price: Number(token.price ?? 0),
    volume24h: Number(token.v24hUSD ?? token.volume24hUSD ?? 0),
    liquidity: Number(token.liquidity ?? 0),
    change24h: Number.isFinite(change) ? change : 0
  };
}

export async function getTrendingTokens({
  chain = "solana",
  limit = 10,
  sortBy = "v24hUSD",
  forceRefresh = false
} = {}) {
  const query = buildQuery({
    chain,
    limit,
    sort_by: sortBy,
    sort_type: "desc",
    offset: 0,
    min_liquidity: 100
  });
  const cacheKey = `tokens:${query}`;
  const cached = cache.get(cacheKey);

  if (!forceRefresh && cached && Date.now() - cached.createdAt < CACHE_TTL_MS) {
    return {
      ...cached.value,
      fromCache: true
    };
  }

  let payload;
  let source = "serverless-proxy";

  try {
    payload = await requestWithRetry(`${BIRDEYE_TOKEN_LIST_URL}?${query}`);

    if (!Array.isArray(payload?.data?.tokens)) {
      throw new Error("Local serverless proxy is not returning Birdeye JSON.");
    }
  } catch (proxyError) {
    const publicKey = import.meta.env.VITE_BIRDEYE_API_KEY;

    if (!publicKey) {
      throw proxyError;
    }

    source = "direct-browser-fallback";
    payload = await requestWithRetry(`${BIRDEYE_PUBLIC_TOKEN_LIST_URL}?${query}`, {
      headers: {
        "X-API-KEY": publicKey,
        "x-chain": chain
      }
    });
  }

  const rawTokens = payload?.data?.tokens;

  if (!Array.isArray(rawTokens)) {
    throw new Error("Birdeye returned an unexpected token list response.");
  }

  const value = {
    tokens: rawTokens.map(normalizeToken),
    source,
    fetchedAt: new Date().toISOString()
  };

  cache.set(cacheKey, {
    createdAt: Date.now(),
    value
  });

  return value;
}
