import { notFound } from "next/navigation"

import { VendorForm } from "@/components/entities/VendorForm"
import { vendorsAPI } from "@/lib/api"

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function EditVendorPage({ params }: PageProps) {
  const { id } = await params
  const vendor = await vendorsAPI.get(id)

  if (!vendor) notFound()

  return <VendorForm mode="edit" initialValues={vendor} />
}
