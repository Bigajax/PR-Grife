"use client"

/** Modal de confirmação do painel — substitui o window.confirm. */
export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  danger = false,
  busy = false,
  onConfirm,
  onCancel,
}: {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  busy?: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-text-primary/60 p-4"
      role="alertdialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="my-auto max-h-[85vh] w-full max-w-sm overflow-y-auto border border-border bg-bg-elevated p-5">
        <h2 className="font-display text-2xl font-medium text-text-primary">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary">{message}</p>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            onClick={onCancel}
            disabled={busy}
            className="border border-border bg-white px-4 py-2.5 text-sm font-semibold text-text-primary hover:bg-bg-surface"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className={`px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60 ${
              danger ? "bg-alert hover:opacity-90" : "bg-text-primary hover:opacity-90"
            }`}
          >
            {busy ? "Aguarde..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
