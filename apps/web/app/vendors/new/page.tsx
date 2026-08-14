import { VendorForm } from "@/components/entities/VendorForm"
import { vendorsAPI } from "@/lib/api"

export default async function NewVendorPage() {
  const vendorId = await vendorsAPI.getNextId()

  return (
    <VendorForm
      mode="create"
      initialValues={{
        vendorId,
        vendorName: "",
        vendorCategory: "beverages",
        contactPerson: "",
        email: "",
        phone: "",
        address: "",
        paymentTerms: "Net 30",
        minimumOrderQuantity: 1,
        isActive: true,
      }}
    />
  )
}
