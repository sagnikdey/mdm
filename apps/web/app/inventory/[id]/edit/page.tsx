import { notFound } from "next/navigation"

import { InventoryForm } from "@/components/entities/InventoryForm"
import { inventoryAPI } from "@/lib/api"

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function EditInventoryPage({ params }: PageProps) {
  const { id } = await params
  const record = await inventoryAPI.get(id)

  if (!record) notFound()

  return <InventoryForm mode="edit" initialValues={record} />
}
