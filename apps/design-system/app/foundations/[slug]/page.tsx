import { redirect } from "next/navigation"

import { foundationEntries, getFoundation } from "@/lib/docs-registry"

type PageProps = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return foundationEntries.map((entry) => ({ slug: entry.slug }))
}

export default async function FoundationPage({ params }: PageProps) {
  const { slug } = await params
  if (!getFoundation(slug)) {
    redirect("/")
  }
  redirect("/")
}
