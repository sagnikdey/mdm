import { StoreForm } from "@/components/entities/StoreForm"
import { storesAPI } from "@/lib/api"
import { defaultOperatingHours } from "@/lib/schemas/store.schema"

export default async function NewStorePage() {
  const storeId = await storesAPI.getNextId()

  return (
    <StoreForm
      mode="create"
      initialValues={{
        storeId,
        storeName: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        region: "Central",
        storeType: "standalone",
        operatingHours: defaultOperatingHours,
        squareFootage: 1000,
        manager: "",
        managerPhone: "",
        isActive: true,
      }}
    />
  )
}
