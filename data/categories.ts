import type { Category } from "@/types"

export const categories: Category[] = [
  { id: "camisetas", label: "Camisetas", image: "/images/products/camiseta-branca.jpg" },
  { id: "polos", label: "Polos", image: "/images/products/polo-branca.jpg" },
  { id: "camisas", label: "Camisas", image: "/images/products/camisa-linho-terracota.jpg" },
  { id: "calcas", label: "Calças", image: "/images/products/calca-jeans.jpg" },
  { id: "shorts", label: "Shorts", image: "/images/products/shorts-caqui.jpg" },
  { id: "jaquetas", label: "Jaquetas", image: "/images/products/bomber-off-white.jpg" },
  { id: "moletons-tricos", label: "Moletons e tricôs", image: "/images/products/trico-marinho.jpg" },
  { id: "tenis", label: "Tênis", image: "/images/products/tenis-hilfiger-box.jpg" },
  { id: "bones", label: "Bonés", image: "/images/products/bone-bege.jpg" },
  // Categorias ainda sem SKU: existem para a navegação por departamento
  // (dropdown do header) e ganham vida quando o primeiro produto entrar.
  // `image` é obrigatório no tipo mas nenhuma UI renderiza — placeholder.
  { id: "cintos", label: "Cintos", image: "/images/products/slides-212.jpg" },
  { id: "carteiras", label: "Carteiras", image: "/images/products/slides-212.jpg" },
  { id: "oculos", label: "Óculos", image: "/images/products/slides-212.jpg" },
  { id: "acessorios", label: "Acessórios", image: "/images/products/slides-212.jpg" },
  { id: "perfumes", label: "Perfumes", image: "/images/products/perfume-le-male.jpg" },
]

export const categoryLabel = (id: string) =>
  categories.find((c) => c.id === id)?.label ?? id
