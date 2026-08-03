import type { Category } from "@/types"
import { categories } from "@/data/categories"

// Departamentos do catálogo — a camada acima das categorias. O produto não tem
// campo de departamento: ele pertence ao departamento que contém a sua
// categoria (mapa abaixo). Cadastrar categoria nova = adicioná-la aqui e em
// data/categories.ts; o resto da navegação (header, abas, footer) deriva disto.
export type Department = {
  slug: "roupas" | "perfumes" | "acessorios" | "tenis" | "kits"
  label: string
  /** Texto editorial exibido no topo da página do departamento. */
  description: string
  categoryIds: string[]
  /**
   * Grade dividida em blocos por marca, um título por marca ("Tênis Tommy
   * Hilfiger", "Tênis Ankor"), em vez de uma grade única. Para departamento de
   * uma categoria só, em que a marca é a pergunta que a pessoa faz — é o caso
   * de Tênis. Em Roupas não serve: lá o corte que importa é camiseta/calça, e
   * as abas de categoria já fazem isso.
   *
   * Os blocos saem dos produtos (lib/catalog.ts → groupByBrand): cadastrar um
   * tênis de marca nova já cria o bloco dela. Ligar aqui é tudo o que outro
   * departamento precisa para ganhar o mesmo comportamento.
   */
  agruparPorMarca?: boolean
}

export const departments: Department[] = [
  {
    slug: "roupas",
    label: "Roupas",
    description: "Peças selecionadas das principais marcas nacionais e internacionais.",
    categoryIds: ["camisetas", "polos", "camisas", "calcas", "shorts", "jaquetas", "moletons-tricos"],
  },
  {
    slug: "perfumes",
    label: "Perfumes",
    description: "Fragrâncias marcantes escolhidas para diferentes ocasiões.",
    categoryIds: ["perfumes"],
  },
  {
    slug: "acessorios",
    label: "Acessórios",
    description: "Detalhes que completam o visual.",
    categoryIds: ["bones", "cintos", "carteiras", "oculos", "acessorios"],
  },
  {
    slug: "tenis",
    label: "Tênis",
    description: "Modelos casuais e versáteis, separados por marca.",
    categoryIds: ["tenis"],
    agruparPorMarca: true,
  },
  {
    slug: "kits",
    label: "Kits",
    description: "O look inteiro montado pela curadoria, pronto para vestir.",
    categoryIds: ["kits"],
  },
]

export const departmentBySlug = (slug: string) =>
  departments.find((d) => d.slug === slug)

export const departmentOfCategory = (categoryId: string) =>
  departments.find((d) => d.categoryIds.includes(categoryId))

// Categorias do departamento na ordem definida acima (não na ordem do array
// global de categorias).
export const categoriesOfDepartment = (slug: string): Category[] => {
  const dep = departmentBySlug(slug)
  if (!dep) return []
  return dep.categoryIds
    .map((id) => categories.find((c) => c.id === id))
    .filter((c): c is Category => Boolean(c))
}
