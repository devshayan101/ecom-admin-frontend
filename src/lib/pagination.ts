export interface CursorPaginationState {
  cursor: string | null;
  hasMore: boolean;
  loading: boolean;
  items: any[];
}

export function createPaginationState(): CursorPaginationState {
  return {
    cursor: null,
    hasMore: true,
    loading: false,
    items: [],
  };
}

export function buildPaginationParams(
  state: CursorPaginationState,
  limit: number = 20,
  extraParams: Record<string, any> = {}
): Record<string, any> {
  const params: Record<string, any> = {
    limit,
    ...extraParams,
  };
  if (state.cursor) {
    params.cursor = state.cursor;
  }
  return params;
}

export function getNextCursor(response: { next_cursor?: string; has_more: boolean }): string | null {
  return response.has_more ? (response.next_cursor || null) : null;
}
