import { useCallback, useEffect, useRef, useState } from "react";
import { getTrendingTokens } from "../services/birdeyeClient";

export function useBirdeyeTokens(options = {}) {
  const [tokens, setTokens] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [meta, setMeta] = useState({
    calls: 0,
    fetchedAt: "",
    source: ""
  });
  const mountedRef = useRef(false);

  const refresh = useCallback(
    async ({ forceRefresh = true } = {}) => {
      setStatus("loading");
      setError("");

      try {
        const result = await getTrendingTokens({
          ...options,
          forceRefresh
        });

        if (!mountedRef.current) {
          return;
        }

        setTokens(result.tokens);
        setMeta((current) => ({
          calls: result.fromCache ? current.calls : current.calls + 1,
          fetchedAt: result.fetchedAt,
          source: result.source
        }));
        setStatus("success");
      } catch (requestError) {
        if (!mountedRef.current) {
          return;
        }

        setError(requestError.message || "Unable to load live market data.");
        setStatus("error");
      }
    },
    [options]
  );

  useEffect(() => {
    mountedRef.current = true;

    const initialLoadId = window.setTimeout(() => {
      refresh({ forceRefresh: false });
    }, 0);

    const intervalId = window.setInterval(() => {
      refresh({ forceRefresh: true });
    }, 45_000);

    return () => {
      mountedRef.current = false;
      window.clearTimeout(initialLoadId);
      window.clearInterval(intervalId);
    };
  }, [refresh]);

  return {
    tokens,
    status,
    error,
    meta,
    refresh
  };
}
