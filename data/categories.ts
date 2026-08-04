import type { Category } from "@/types"

export const categories: Category[] = [
  { id: "camisetas", label: "Camisetas", image: "/images/products/camiseta-branca.webp" },
  { id: "polos", label: "Polos", image: "/images/products/polo-branca.webp" },
  { id: "camisas", label: "Camisas", image: "/images/products/camisa-linho-terracota.webp" },
  { id: "calcas", label: "Calças", image: "/images/products/calca-jeans.webp" },
  { id: "shorts", label: "Shorts", image: "/images/products/shorts-caqui.webp" },
  { id: "jaquetas", label: "Jaquetas", image: "/images/products/bomber-off-white.webp" },
  { id: "moletons-tricos", label: "Moletons e tricôs", image: "/images/products/trico-marinho.webp" },
  { id: "tenis", label: "Tênis", image: "/images/products/tenis-hilfiger-box.webp" },
  { id: "bones", label: "Bonés", image: "/images/products/bone-bege.webp" },
  // Categorias ainda sem SKU: existem para a navegação por departamento
  // (dropdown do header) e ganham vida quando o primeiro produto entrar.
  // `image` é obrigatório no tipo mas nenhuma UI renderiza — placeholder.
  { id: "cintos", label: "Cintos", image: "/images/products/slides-212.webp" },
  { id: "carteiras", label: "Carteiras", image: "/images/products/slides-212.webp" },
  { id: "oculos", label: "Óculos", image: "/images/products/slides-212.webp" },
  { id: "acessorios", label: "Acessórios", image: "/images/products/slides-212.webp" },
  { id: "perfumes", label: "Perfumes", image: "/images/products/perfume-le-male.webp" },
  // Kit = look inteiro vendido junto (peça de cima, de baixo, calçado e o que
  // mais estiver na foto). Não é peça: por isso categoria e departamento
  // próprios, fora da árvore de Roupas.
  { id: "kits", label: "Kits", image: "/images/products/camiseta-branca.webp" },
]

export const categoryLabel = (id: string) =>
  categories.find((c) => c.id === id)?.label ?? id
