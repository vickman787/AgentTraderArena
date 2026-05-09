const BIRDEYE_TOKEN_LIST_URL = "https://public-api.birdeye.so/defi/tokenlist";
const ALLOWED_SORT_FIELDS = new Set(["mc", "v24hUSD", "v24hChangePercent", "liquidity"]);
const ALLOWED_CHAINS = new Set([
  "solana",
  "ethereum",
  "bsc",
  "arbitrum",
  "avalanche",
  "base",
  "optimism",
  "polygon"
]);

function cleanInteger(value, fallback, min, max) {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(Math.max(parsed, min), max);
}

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.BIRDEYE_API_KEY;

  if (!apiKey) {
    return response.status(500).json({
      error: "Missing BIRDEYE_API_KEY environment variable."
    });
  }

  const chain = ALLOWED_CHAINS.has(request.query.chain) ? request.query.chain : "solana";
  const sortBy = ALLOWED_SORT_FIELDS.has(request.query.sort_by) ? request.query.sort_by : "v24hUSD";
  const limit = cleanInteger(request.query.limit, 10, 1, 50);
  const offset = cleanInteger(request.query.offset, 0, 0, 5000);
  const minLiquidity = cleanInteger(request.query.min_liquidity, 100, 0, 1_000_000_000);

  const upstreamUrl = new URL(BIRDEYE_TOKEN_LIST_URL);
  upstreamUrl.searchParams.set("sort_by", sortBy);
  upstreamUrl.searchParams.set("sort_type", "desc");
  upstreamUrl.searchParams.set("offset", String(offset));
  upstreamUrl.searchParams.set("limit", String(limit));
  upstreamUrl.searchParams.set("min_liquidity", String(minLiquidity));

  try {
    const upstreamResponse = await fetch(upstreamUrl, {
      headers: {
        accept: "application/json",
        "X-API-KEY": apiKey,
        "x-chain": chain
      }
    });

    const payload = await upstreamResponse.json().catch(() => null);

    response.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=60");

    if (!upstreamResponse.ok) {
      return response.status(upstreamResponse.status).json({
        error: payload?.message || payload?.error || "Birdeye request failed.",
        details: payload
      });
    }

    return response.status(200).json(payload);
  } catch (error) {
    return response.status(502).json({
      error: "Unable to reach Birdeye.",
      details: error.message
    });
  }
}
