import Link from "next/link"

export type Crumb = { label: string; href?: string }

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Você está em" className="text-[13px] text-text-gray">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="flex items-center gap-1.5">
            {item.href ? (
              <Link href={item.href} className="transition-colors hover:text-gold-dark">
                {item.label}
              </Link>
            ) : (
              <span className="text-black-soft" aria-current="page">
                {item.label}
              </span>
            )}
            {i < items.length - 1 && (
              <span aria-hidden="true" className="text-sand">
                /
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
