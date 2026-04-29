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
    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
      <div className="text-sm text-gray-500">
        {onReset && (
          <button
            onClick={onReset}
            className="text-blue-600 hover:text-blue-500"
          >
            Reset filters
          </button>
        )}
      </div>
      {hasMore && (
        <button
          onClick={onLoadMore}
          disabled={loading}
          className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Load more"}
        </button>
      )}
    </div>
  );
}
