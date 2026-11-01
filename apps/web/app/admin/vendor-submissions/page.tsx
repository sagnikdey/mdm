import { SubmissionsInbox } from "@/app/admin/vendor-submissions/submissions-inbox"

export default function VendorSubmissionsPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Vendor submissions</h1>
        <p className="mt-1 text-fg-muted">
          Review portal changes before they update master data
        </p>
      </div>
      <SubmissionsInbox />
    </div>
  )
}
