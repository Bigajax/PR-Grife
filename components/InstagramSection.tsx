"use client"

import Image from "next/image"
import { Play } from "lucide-react"

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}
import { instagramPosts } from "@/data/instagram"
import { siteConfig } from "@/data/site.config"
import { SectionHeading } from "@/components/SectionHeading"
import { track } from "@/lib/tracking"

export function InstagramSection() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="Instagram" title="Acompanhe a PR Grife." />
          <a
            href={siteConfig.instagram}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("instagram_click", { placement: "section_header" })}
            className="inline-flex min-h-12 items-center gap-2 rounded-full border border-black-soft px-6 text-sm font-semibold text-black-soft transition-colors hover:border-gold-dark hover:text-gold-dark"
          >
            <InstagramIcon className="h-4 w-4" />
            Seguir {siteConfig.instagramHandle}
          </a>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
          {instagramPosts.map((post) => (
            <a
              key={post.url}
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("instagram_click", { url: post.url })}
              className="group relative block aspect-square overflow-hidden bg-beige-light"
              aria-label={post.alt}
            >
              <Image
                src={post.image}
                alt={post.alt}
                fill
                sizes="(min-width: 1024px) 16vw, 33vw"
                className="img-zoom object-cover"
              />
              {post.type === "reel" && (
                <Play
                  className="absolute right-2 top-2 h-4 w-4 text-white drop-shadow"
                  fill="currentColor"
                  aria-hidden="true"
                />
              )}
              <span className="absolute inset-0 bg-black-soft/0 transition-colors duration-300 group-hover:bg-black-soft/20" aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
