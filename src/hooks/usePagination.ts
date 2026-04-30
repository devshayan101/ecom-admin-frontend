"use client";

import { useState, useCallback, useEffect } from "react";
import { PaginatedResponse } from "@/lib/types";
import { buildPaginationParams, createPaginationState } from "@/lib/pagination";

export function usePagination<T>(
  fetcher: (params: Record<string, any>) => Promise<PaginatedResponse<T>>
) {
  const [state, setState] = useState(createPaginationState());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (extraParams: Record<string, any> = {}, reset: boolean = false) => {
      if (loading && !reset) return;
      setLoading(true);
      setError(null);

      try {
        const params = buildPaginationParams(
          reset ? createPaginationState() : state,
          20,
          extraParams
        );
        const response = await fetcher(params);
        setState((prev) => ({
          ...prev,
          items: reset ? response.items : [...prev.items, ...response.items],
          cursor: response.next_cursor || null,
          hasMore: response.has_more,
          loading: false,
        }));
      } catch (err: any) {
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    },
    [loading, state, fetcher]
  );

  useEffect(() => {
    load({}, true);
  }, []); // Only on mount

  const loadMore = useCallback(() => {
    if (state.hasMore && !loading) {
      load({}, false);
    }
  }, [state.hasMore, loading, load]);

  const reset = useCallback(() => {
    setState(createPaginationState());
    load({}, true);
  }, [load]);

  return {
    items: state.items,
    loading,
    error,
    hasMore: state.hasMore,
    loadMore,
    reset,
    load,
  };
}
