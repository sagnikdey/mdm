"use client"

import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  FormLayout,
  formContainerClassName,
} from "@workspace/ui/components/form-layout"

export function FormLayoutDemo() {
  return (
    <div className={formContainerClassName}>
      <FormLayout
        title="Add product"
        description="Preview of the shared form shell used in vendor and onboarding apps."
        submitLabel="Save draft"
        onSubmit={(event) => event.preventDefault()}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="demo-product">Product name</Label>
            <Input id="demo-product" placeholder="Sparkling water 12oz" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="demo-sku">SKU</Label>
            <Input id="demo-sku" placeholder="BEV-1204" />
          </div>
        </div>
      </FormLayout>
    </div>
  )
}
