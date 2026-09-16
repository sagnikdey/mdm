import { redirect } from "next/navigation"

import { getComponent } from "@/lib/docs-registry"

type PageProps = {
  params: Promise<{ slug: string }>
}

export default async function ComponentDocPage({ params }: PageProps) {
  const { slug } = await params
  if (!getComponent(slug)) {
    redirect("/")
  }
  redirect(`/#${slug}`)
}
