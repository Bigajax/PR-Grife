import { ImageResponse } from "next/og"
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { siteConfig } from "@/data/site.config"

/**
 * Cartão de prévia do link (WhatsApp, Instagram, Facebook, X).
 *
 * Gerado por código em vez de arquivo estático por dois motivos: nasce sempre
 * em 1200×630, que é a proporção que os apps de mensagem esperam, e acompanha a
 * paleta da casa sem alguém precisar reexportar um PNG quando ela mudar.
 *
 * Antes o og:image apontava para /images/hero.jpg — foto em RETRATO de 941×1672
 * e 237 KB. Prévia de link é paisagem: o WhatsApp descarta imagem vertical, e é
 * por isso que o link chegava só com título e texto.
 *
 * Sem fonte customizada de propósito: carregar TTF aqui é mais uma coisa para
 * quebrar no build, e o desenho se sustenta no lockup e no espaçamento.
 */
export const alt = `${siteConfig.name} — ${siteConfig.metadata.title}`
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image() {
  // O mesmo diamante do favicon e do cabeçalho, embutido em data URI: o
  // gerador não busca arquivo por URL relativa.
  const icone = await readFile(join(process.cwd(), "app", "icon.png"))
  const diamante = `data:image/png;base64,${icone.toString("base64")}`

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          // Marfim da casa (--color-bg-base).
          backgroundColor: "#f8f4e9",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={diamante} width={132} height={132} alt="" />

        <div
          style={{
            marginTop: 34,
            fontSize: 82,
            fontWeight: 600,
            letterSpacing: 26,
            // O tracking do CSS empurra o texto para a direita; o recuo devolve
            // o bloco ao centro óptico.
            textIndent: 26,
            color: "#1c1c1a",
          }}
        >
          PR GRIFE
        </div>

        {/* Filete em ouro rosé — mesmo divisor editorial do site. */}
        <div
          style={{
            marginTop: 30,
            width: 190,
            height: 2,
            backgroundColor: "#b76e79",
          }}
        />

        <div
          style={{
            marginTop: 30,
            fontSize: 29,
            letterSpacing: 7,
            textIndent: 7,
            color: "#6b6862",
          }}
        >
          MODA MULTIMARCAS · MARINGÁ
        </div>
      </div>
    ),
    size
  )
}
