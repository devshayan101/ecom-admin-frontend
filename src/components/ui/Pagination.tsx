interface PaginationProps {
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  onReset?: () => void;
}

export default function Pagination({
  hasMore,
  loading,
  onLoadMore,
  onReset,
}: PaginationProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-border">
      <div className="text-sm text-muted-foreground">
        {onReset && (
          <button
            onClick={onReset}
            className="text-primary hover:text-blue-500"
          >
            Reset filters
          </button>
        )}
      </div>
      {hasMore && (
        <button
          onClick={onLoadMore}
          disabled={loading}
          className="rounded-md bg-background px-4 py-2 text-sm font-medium text-foreground border border-gray-300 hover:bg-muted/50 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Load more"}
        </button>
      )}
    </div>
  );
}
