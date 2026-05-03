import Button from "./Button";

export default function PaginationControls({ pagination, onPageChange }) {
  if (!pagination) {
    return null;
  }

  const { page, totalPages, total } = pagination;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-500 sm:flex-row sm:items-center sm:justify-between">
      <span>
        Page {page} of {totalPages} - {total} total
      </span>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Previous
        </Button>
        <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}
