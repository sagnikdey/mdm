import { SubmissionsInbox } from "@/app/admin/vendor-submissions/submissions-inbox"

export default function VendorSubmissionsPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-3xl font-bold">Vendor submissions</h2>
        <p className="mt-1 text-muted-foreground">
          Review portal changes before they update master data
        </p>
      </div>
      <SubmissionsInbox />
    </div>
  )
}
