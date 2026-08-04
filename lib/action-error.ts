import { z } from "zod"

/**
 * Erro de server action virando frase para quem está no painel.
 *
 * `ZodError.message` é o JSON das issues. Jogado direto na caixa de erro do
 * formulário, o dono da loja via um bloco de `{"code":"invalid_type",...}` —
 * inclusive quando a explicação útil já estava escrita em português lá dentro.
 */

// Rótulo por campo. Só o primeiro segmento do path importa: erro em
// colors[2].hex é, para quem está na tela, um erro em "Cores".
const fieldLabels: Record<string, string> = {
  name: "Nome",
  category: "Categoria",
  brand: "Marca",
  shortDescription: "Descrição curta",
  fullDescription: "Descrição completa",
  price: "Preço",
  oldPrice: 'Preço "de"',
  installmentText: "Parcelamento",
  paymentOverride: "Forma de pagamento da peça",
  images: "Fotos",
  availableSizes: "Tamanhos",
  colors: "Cores",
  stockStatus: "Disponibilidade",
  material: "Material",
  fit: "Modelagem",
  saleMode: "Modo de venda",
  minimumStock: "Estoque mínimo",
  variants: "Tamanhos",
  variantId: "Variação",
  quantity: "Quantidade",
  reason: "Motivo",
  notes: "Observação",
  email: "E-mail",
  pw: "Senha",
}

// Mensagens que o zod gera sozinho — inglês e sem contexto, precisam de
// tradução e do nome do campo. As demais vêm dos schemas, já são frases
// prontas em português, e passam intactas.
const zodDefault =
  /^(Invalid input|Invalid option|Invalid format|Invalid key|Invalid value|Invalid union|Too big|Too small|Unrecognized key)/

function labelFor(path: readonly PropertyKey[]): string {
  const root = path.find((p) => typeof p === "string")
  return typeof root === "string" ? fieldLabels[root] ?? "" : ""
}

/** O que o cliente realmente mandou naquele caminho — `undefined` = não mandou. */
function valueAt(input: unknown, path: readonly PropertyKey[]): unknown {
  return path.reduce<unknown>(
    (acc, key) =>
      acc === null || acc === undefined
        ? undefined
        : (acc as Record<PropertyKey, unknown>)[key],
    input
  )
}

function describe(issue: z.core.$ZodIssue): string {
  if (!zodDefault.test(issue.message)) return issue.message

  const label = labelFor(issue.path)
  if (!label) return "Revise os campos e tente de novo."

  if (issue.code === "too_big") {
    return issue.origin === "array"
      ? `${label}: no máximo ${issue.maximum} itens.`
      : `${label}: use no máximo ${issue.maximum} caracteres.`
  }
  if (issue.code === "too_small") {
    return issue.origin === "array"
      ? `${label}: informe pelo menos ${issue.minimum} itens.`
      : `${label}: use pelo menos ${issue.minimum} caracteres.`
  }
  return `${label}: valor inválido.`
}

function fromZod(error: z.ZodError, input: unknown): string {
  // Campo AUSENTE no payload é diferente de campo preenchido errado: o
  // formulário nem enviou a chave, o que só acontece com a aba rodando o
  // bundle anterior ao deploy. Pedir para corrigir o campo não ajuda — ele
  // nem existe na tela dessa pessoa.
  const missing =
    typeof input === "object" &&
    input !== null &&
    error.issues.some(
      (i) => i.code === "invalid_type" && valueAt(input, i.path) === undefined
    )
  if (missing) {
    return "Esta página está desatualizada — recarregue (Ctrl+Shift+R) e salve de novo."
  }

  // Três problemas já são o bastante para agir; a lista inteira vira parede.
  // Separador visível: as mensagens dos schemas não terminam em ponto, e
  // emendadas por espaço viram uma frase só ("Nome muito curto Informe a marca").
  const messages = [...new Set(error.issues.map(describe))]
  return messages.slice(0, 3).join(" • ")
}

/**
 * Mensagem final da action. `input` é o payload recebido: só com ele dá para
 * separar "campo inválido" de "campo que nem foi enviado".
 */
export function actionErrorMessage(
  e: unknown,
  input: unknown,
  fallback: string
): string {
  if (e instanceof z.ZodError) return fromZod(e, input)
  return e instanceof Error ? e.message : fallback
}
