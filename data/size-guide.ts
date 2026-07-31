/**
 * Guia de medidas.
 *
 * ATENÇÃO — o que estes números SÃO e o que NÃO SÃO.
 *
 * São medidas de CORPO na convenção do vestuário masculino brasileiro: as
 * faixas que o mercado usa para dizer quem veste P, M, G ou GG. Servem para a
 * pessoa se localizar antes de escolher.
 *
 * NÃO são as medidas das peças da PR Grife. Peça de Reserva, Biotwo e Ankor no
 * mesmo "M" tem corte diferente, e a modelagem (slim, regular, comfort) muda
 * tudo. Por isso a tela continua dizendo que o atendimento manda as medidas
 * exatas da peça — essa promessa é a que fecha a compra sem troca.
 *
 * Quando o proprietário levantar a tabela real por modelagem, é aqui que ela
 * entra: troque as faixas e ajuste o aviso em `observacao`.
 */

export type SizeRow = {
  /** Rótulo do tamanho como aparece nos chips do produto. */
  tamanho: string
  /** Equivalência numérica usual da etiqueta. */
  numerico?: string
  /** Faixas em centímetros. */
  colunas: string[]
}

export type SizeTable = {
  titulo: string
  /** Cabeçalho das colunas de medida (a primeira coluna é sempre o tamanho). */
  colunas: string[]
  linhas: SizeRow[]
  observacao: string
}

export const guiaRoupas: SizeTable = {
  titulo: "Roupas",
  colunas: ["Tamanho", "Etiqueta", "Tórax", "Cintura"],
  linhas: [
    { tamanho: "P", numerico: "36–38", colunas: ["92–96 cm", "78–82 cm"] },
    { tamanho: "M", numerico: "40–42", colunas: ["96–100 cm", "82–86 cm"] },
    { tamanho: "G", numerico: "44–46", colunas: ["100–106 cm", "86–92 cm"] },
    { tamanho: "GG", numerico: "48–50", colunas: ["106–112 cm", "92–98 cm"] },
  ],
  observacao:
    "Meça por cima de uma camiseta leve, com a fita justa mas sem apertar. Entre dois tamanhos, o maior costuma cair melhor em modelagem slim.",
}

export const guiaCalcados: SizeTable = {
  titulo: "Calçados",
  colunas: ["Tamanho", "Comprimento do pé"],
  linhas: [
    { tamanho: "38", colunas: ["24,5 cm"] },
    { tamanho: "39", colunas: ["25,3 cm"] },
    { tamanho: "40", colunas: ["26,0 cm"] },
    { tamanho: "41", colunas: ["26,8 cm"] },
    { tamanho: "42", colunas: ["27,5 cm"] },
    { tamanho: "43", colunas: ["28,3 cm"] },
    { tamanho: "44", colunas: ["29,0 cm"] },
  ],
  observacao:
    "Apoie o pé numa folha encostada na parede e marque o ponto do dedo mais longo. Meça no fim do dia, quando o pé está mais dilatado.",
}

/** Escolhe a tabela pelo formato dos tamanhos da peça (numérico = calçado). */
export function tabelaPara(tamanhos: string[]): SizeTable {
  return tamanhos.some((t) => /^\d+$/.test(t)) ? guiaCalcados : guiaRoupas
}
