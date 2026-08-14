import { notFound } from "next/navigation"

import { StoreForm } from "@/components/entities/StoreForm"
import { storesAPI } from "@/lib/api"

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function EditStorePage({ params }: PageProps) {
  const { id } = await params
  const store = await storesAPI.get(id)

  if (!store) notFound()

  return <StoreForm mode="edit" initialValues={store} />
}
