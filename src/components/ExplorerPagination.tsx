import { ChevronLeft, ChevronRight } from "lucide-react";

type ExplorerPaginationProps = {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
};

export function ExplorerPagination({ page, totalPages, totalItems, pageSize, onPageChange }: ExplorerPaginationProps) {
  if (totalItems === 0) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 text-sm text-slate-400">
        <span>0 kayıt</span>
      </div>
    );
  }

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-300">
        <span className="text-slate-400">
          Gösterilen {start}–{end} / {totalItems} kayıt
        </span>
        <span className="mx-2 hidden text-slate-600 sm:inline" aria-hidden>
          |
        </span>
        <span className="text-slate-400">
          Sayfa {page} / {totalPages}
        </span>
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={!canPrev}
          onClick={() => onPageChange(page - 1)}
          className="inline-flex items-center gap-1 rounded-lg border border-white/20 bg-slate-900 px-3 py-2 text-sm text-slate-100 transition hover:bg-white/10 disabled:pointer-events-none disabled:opacity-40"
          aria-label="Önceki sayfa"
        >
          <ChevronLeft size={18} className="shrink-0" />
          Önceki
        </button>
        <button
          type="button"
          disabled={!canNext}
          onClick={() => onPageChange(page + 1)}
          className="inline-flex items-center gap-1 rounded-lg border border-white/20 bg-slate-900 px-3 py-2 text-sm text-slate-100 transition hover:bg-white/10 disabled:pointer-events-none disabled:opacity-40"
          aria-label="Sonraki sayfa"
        >
          Sonraki
          <ChevronRight size={18} className="shrink-0" />
        </button>
      </div>
    </div>
  );
}
