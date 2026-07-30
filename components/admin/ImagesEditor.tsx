"use client"

import { useRef, useState } from "react"
import { ImagePlus, Link2, Trash2 } from "lucide-react"
import { uploadProductImage } from "@/app/admin/produtos/actions"

/**
 * Fotos do produto: upload para o Supabase Storage ou URL externa.
 * A primeira imagem da lista é a capa exibida nos cards.
 */
export function ImagesEditor({
  images,
  onChange,
}: {
  images: string[]
  onChange: (images: string[]) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [url, setUrl] = useState("")
  const [uploading, setUploading] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  const addUrl = () => {
    const value = url.trim()
    if (!value) return
    if (images.length >= 8) {
      setNotice("Máximo de 8 fotos por produto.")
      return
    }
    onChange([...images, value])
    setUrl("")
    setNotice(null)
  }

  const upload = async (file: File) => {
    if (images.length >= 8) {
      setNotice("Máximo de 8 fotos por produto.")
      return
    }
    setUploading(true)
    setNotice(null)
    const formData = new FormData()
    formData.append("file", file)
    const result = await uploadProductImage(formData)
    setUploading(false)
    if (!result.ok || !result.url) {
      setNotice(result.ok ? "Falha no upload." : result.error)
      return
    }
    onChange([...images, result.url])
  }

  return (
    <div>
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-text-primary">
        Fotos{" "}
        <span className="normal-case font-normal tracking-normal text-text-secondary">
          (a primeira é a capa do card)
        </span>
      </p>

      {images.length > 0 && (
        <ul className="mb-2 flex flex-wrap gap-2">
          {images.map((src, i) => (
            <li key={`${src}-${i}`} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`Foto ${i + 1}`}
                className="h-16 w-16 border border-border object-cover"
              />
              {i === 0 && (
                <span className="absolute -left-1 -top-1 bg-text-primary px-1 text-[9px] font-bold text-white">
                  capa
                </span>
              )}
              <button
                type="button"
                onClick={() => onChange(images.filter((_, j) => j !== i))}
                aria-label={`Remover foto ${i + 1}`}
                className="absolute -right-2 -top-2 border border-border bg-white p-1 text-text-secondary hover:text-alert"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) upload(file)
            e.target.value = ""
          }}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 border border-text-primary px-3 py-2 text-xs font-semibold text-text-primary hover:bg-text-primary hover:text-white disabled:opacity-60"
        >
          <ImagePlus className="h-3.5 w-3.5" aria-hidden="true" />
          {uploading ? "Enviando..." : "Enviar foto"}
        </button>
        <span className="text-xs text-text-secondary">ou</span>
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          <Link2 className="h-3.5 w-3.5 shrink-0 text-text-secondary" aria-hidden="true" />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addUrl()
              }
            }}
            placeholder="Colar URL da imagem"
            className="w-full min-w-0 border border-border px-2.5 py-2 text-xs focus:border-accent-strong focus:outline-none"
          />
          <button
            type="button"
            onClick={addUrl}
            className="border border-border px-2.5 py-2 text-xs font-semibold text-text-primary hover:bg-bg-surface"
          >
            Adicionar
          </button>
        </div>
      </div>

      {notice && (
        <p role="alert" className="mt-2 text-xs font-medium text-alert">
          {notice}
        </p>
      )}
    </div>
  )
}
