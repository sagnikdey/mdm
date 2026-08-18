"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

import {
  saveOnboardingStep,
  submitOnboardingApplication,
} from "@/app/onboarding/actions"
import {
  ONBOARDING_STEPS,
  type VendorApplication,
} from "@workspace/vendor-onboarding/types"
import { LoadingState } from "@workspace/ui/components/loading-state"
import { TaskRows, type TaskRowItem } from "@workspace/ui/components/task-rows"
import { ContextCard } from "@workspace/ui/components/context-card"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Textarea } from "@workspace/ui/components/textarea"
import { Badge } from "@workspace/ui/components/badge"

const CATEGORY_OPTIONS = [
  "Beverages",
  "Snacks",
  "Food",
  "Tobacco",
  "Household",
  "Health & Beauty",
]

type OnboardingWizardProps = {
  application: VendorApplication
}

export function OnboardingWizard({ application: initial }: OnboardingWizardProps) {
  const [application, setApplication] = useState(initial)
  const [step, setStep] = useState(initial.currentStep)
  const [isSaving, setIsSaving] = useState(false)
  const [submitTasks, setSubmitTasks] = useState<TaskRowItem[]>([])
  const [elapsed, setElapsed] = useState(0)

  const isSubmitted = application.status === "submitted" || application.status === "under_review" || application.status === "approved"

  useEffect(() => {
    if (!isSaving) return
    const timer = setInterval(() => setElapsed((value) => value + 0.1), 100)
    return () => clearInterval(timer)
  }, [isSaving])

  const stepMeta = ONBOARDING_STEPS[step - 1]!

  async function persist(nextStep: number) {
    setIsSaving(true)
    setElapsed(0)
    try {
      const updated = await saveOnboardingStep({
        step: nextStep,
        companyData: application.companyData,
        contactData: application.contactData,
        addressData: application.addressData,
        paymentData: application.paymentData,
        categoriesData: application.categoriesData,
        documentsData: application.documentsData,
      })
      setApplication(updated)
      setStep(nextStep)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save step")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleSubmit() {
    setSubmitTasks([
      { id: "1", label: "Validating application", status: "running" },
      { id: "2", label: "Checking documents", status: "pending" },
      { id: "3", label: "Notifying reviewers", status: "pending" },
    ])

    await new Promise((r) => setTimeout(r, 600))
    setSubmitTasks((tasks) =>
      tasks.map((task) =>
        task.id === "1"
          ? { ...task, status: "completed", detail: "All required fields present" }
          : task.id === "2"
            ? { ...task, status: "running" }
            : task
      )
    )

    await new Promise((r) => setTimeout(r, 600))
    setSubmitTasks((tasks) =>
      tasks.map((task) =>
        task.id === "2"
          ? { ...task, status: "completed", detail: `${application.documentsData.length} documents attached` }
          : task.id === "3"
            ? { ...task, status: "running" }
            : task
      )
    )

    try {
      const updated = await submitOnboardingApplication()
      setApplication(updated)
      setStep(8)
      setSubmitTasks((tasks) =>
        tasks.map((task) =>
          task.id === "3"
            ? { ...task, status: "completed", detail: "Review queue updated" }
            : task
        )
      )
      toast.success("Application submitted for review")
    } catch (error) {
      setSubmitTasks((tasks) =>
        tasks.map((task) =>
          task.status === "running" ? { ...task, status: "failed" } : task
        )
      )
      toast.error(error instanceof Error ? error.message : "Submission failed")
    }
  }

  const reviewSummary = useMemo(
    () => [
      { label: "Company", value: application.companyData.legalName || "—" },
      { label: "Contact", value: application.contactData.contactPerson || "—" },
      { label: "Location", value: `${application.addressData.city}, ${application.addressData.state}` },
      {
        label: "Categories",
        value: application.categoriesData.categories.length
          ? application.categoriesData.categories.join(", ")
          : "—",
      },
      { label: "Documents", value: String(application.documentsData.length) },
    ],
    [application]
  )

  if (isSubmitted && step === 8) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Application submitted</CardTitle>
          <CardDescription>
            Your vendor application is in the review queue. We&apos;ll email{" "}
            {application.ownerEmail} with updates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TaskRows tasks={submitTasks.length ? submitTasks : [
            { id: "done", label: "Submitted for review", status: "completed" },
          ]} />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {ONBOARDING_STEPS.map((item) => (
          <Badge
            key={item.id}
            variant={item.id === step ? "default" : item.id < step ? "secondary" : "outline"}
          >
            {item.id}. {item.title}
          </Badge>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Step {step}: {stepMeta.title}
          </CardTitle>
          <CardDescription>{stepMeta.description}</CardDescription>
        </CardHeader>

        <CardContent>
          {isSaving ? <LoadingState label="Saving step" elapsedSeconds={elapsed} /> : null}

          {!isSaving && step === 1 ? (
            <FieldGroup>
              <Field>
                <FieldLabel>Legal company name</FieldLabel>
                <FieldContent>
                  <Input
                    value={application.companyData.legalName}
                    onChange={(e) =>
                      setApplication((prev) => ({
                        ...prev,
                        companyData: { ...prev.companyData, legalName: e.target.value },
                      }))
                    }
                  />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel>DBA name (optional)</FieldLabel>
                <FieldContent>
                  <Input
                    value={application.companyData.dbaName ?? ""}
                    onChange={(e) =>
                      setApplication((prev) => ({
                        ...prev,
                        companyData: { ...prev.companyData, dbaName: e.target.value },
                      }))
                    }
                  />
                </FieldContent>
              </Field>
              <div className="grid gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel>Tax ID / EIN</FieldLabel>
                  <FieldContent>
                    <Input
                      value={application.companyData.taxId ?? ""}
                      onChange={(e) =>
                        setApplication((prev) => ({
                          ...prev,
                          companyData: { ...prev.companyData, taxId: e.target.value },
                        }))
                      }
                    />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel>Primary category</FieldLabel>
                  <FieldContent>
                    <Select
                      value={application.companyData.vendorCategory}
                      onValueChange={(value) =>
                        setApplication((prev) => ({
                          ...prev,
                          companyData: { ...prev.companyData, vendorCategory: value },
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["beverages", "snacks", "food"].map((value) => (
                          <SelectItem key={value} value={value} className="capitalize">
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldContent>
                </Field>
              </div>
            </FieldGroup>
          ) : null}

          {!isSaving && step === 2 ? (
            <FieldGroup>
              <Field>
                <FieldLabel>Contact person</FieldLabel>
                <FieldContent>
                  <Input
                    value={application.contactData.contactPerson}
                    onChange={(e) =>
                      setApplication((prev) => ({
                        ...prev,
                        contactData: { ...prev.contactData, contactPerson: e.target.value },
                      }))
                    }
                  />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel>Email (from invitation)</FieldLabel>
                <FieldContent>
                  <Input value={application.contactData.email} disabled />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel>Phone</FieldLabel>
                <FieldContent>
                  <Input
                    value={application.contactData.phone}
                    onChange={(e) =>
                      setApplication((prev) => ({
                        ...prev,
                        contactData: { ...prev.contactData, phone: e.target.value },
                      }))
                    }
                  />
                </FieldContent>
              </Field>
            </FieldGroup>
          ) : null}

          {!isSaving && step === 3 ? (
            <FieldGroup>
              <Field>
                <FieldLabel>Street address</FieldLabel>
                <FieldContent>
                  <Textarea
                    value={application.addressData.street}
                    onChange={(e) =>
                      setApplication((prev) => ({
                        ...prev,
                        addressData: { ...prev.addressData, street: e.target.value },
                      }))
                    }
                  />
                </FieldContent>
              </Field>
              <div className="grid gap-4 md:grid-cols-3">
                <Field>
                  <FieldLabel>City</FieldLabel>
                  <FieldContent>
                    <Input
                      value={application.addressData.city}
                      onChange={(e) =>
                        setApplication((prev) => ({
                          ...prev,
                          addressData: { ...prev.addressData, city: e.target.value },
                        }))
                      }
                    />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel>State</FieldLabel>
                  <FieldContent>
                    <Input
                      value={application.addressData.state}
                      onChange={(e) =>
                        setApplication((prev) => ({
                          ...prev,
                          addressData: { ...prev.addressData, state: e.target.value },
                        }))
                      }
                    />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel>ZIP</FieldLabel>
                  <FieldContent>
                    <Input
                      value={application.addressData.zipCode}
                      onChange={(e) =>
                        setApplication((prev) => ({
                          ...prev,
                          addressData: { ...prev.addressData, zipCode: e.target.value },
                        }))
                      }
                    />
                  </FieldContent>
                </Field>
              </div>
            </FieldGroup>
          ) : null}

          {!isSaving && step === 4 ? (
            <FieldGroup>
              <Field>
                <FieldLabel>Payment terms</FieldLabel>
                <FieldContent>
                  <Input
                    value={application.paymentData.paymentTerms}
                    onChange={(e) =>
                      setApplication((prev) => ({
                        ...prev,
                        paymentData: { ...prev.paymentData, paymentTerms: e.target.value },
                      }))
                    }
                  />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel>Minimum order quantity</FieldLabel>
                <FieldContent>
                  <Input
                    type="number"
                    value={application.paymentData.minimumOrderQuantity}
                    onChange={(e) =>
                      setApplication((prev) => ({
                        ...prev,
                        paymentData: {
                          ...prev.paymentData,
                          minimumOrderQuantity: Number(e.target.value) || 1,
                        },
                      }))
                    }
                  />
                </FieldContent>
              </Field>
            </FieldGroup>
          ) : null}

          {!isSaving && step === 5 ? (
            <FieldGroup>
              <FieldLabel>Categories you supply</FieldLabel>
              {CATEGORY_OPTIONS.map((category) => {
                const checked = application.categoriesData.categories.includes(category)
                return (
                  <Field key={category} orientation="horizontal">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(value) =>
                        setApplication((prev) => ({
                          ...prev,
                          categoriesData: {
                            ...prev.categoriesData,
                            categories: value
                              ? [...prev.categoriesData.categories, category]
                              : prev.categoriesData.categories.filter((item) => item !== category),
                          },
                        }))
                      }
                    />
                    <FieldLabel>{category}</FieldLabel>
                  </Field>
                )
              })}
            </FieldGroup>
          ) : null}

          {!isSaving && step === 6 ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Add compliance document references for review. File upload storage can be wired later.
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                {application.documentsData.map((doc) => (
                  <ContextCard
                    key={doc.id}
                    title={doc.name}
                    source={doc.name}
                    sourceType={doc.type.toUpperCase()}
                    excerpt={`Uploaded ${new Date(doc.uploadedAt).toLocaleDateString()}`}
                  />
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() =>
                  setApplication((prev) => ({
                    ...prev,
                    documentsData: [
                      ...prev.documentsData,
                      {
                        id: crypto.randomUUID(),
                        name: `Compliance Document ${prev.documentsData.length + 1}.pdf`,
                        type: "other",
                        uploadedAt: new Date().toISOString(),
                      },
                    ],
                  }))
                }
              >
                Add document placeholder
              </Button>
            </div>
          ) : null}

          {!isSaving && step === 7 ? (
            <div className="space-y-3">
              {reviewSummary.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                >
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="font-medium">{row.value}</span>
                </div>
              ))}
            </div>
          ) : null}

          {!isSaving && step === 8 ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Submit your application to the buyer review queue.
              </p>
              <TaskRows tasks={submitTasks} />
            </div>
          ) : null}
        </CardContent>

        <CardFooter className="justify-between gap-3 border-t">
          <Button
            type="button"
            variant="outline"
            size="lg"
            disabled={step <= 1 || isSaving}
            onClick={() => setStep((current) => Math.max(1, current - 1))}
          >
            Back
          </Button>

          {step < 8 ? (
            <Button
              type="button"
              size="lg"
              disabled={isSaving}
              onClick={() => void persist(step + 1)}
            >
              Save & continue
            </Button>
          ) : (
            <Button type="button" size="lg" disabled={isSaving} onClick={() => void handleSubmit()}>
              Submit application
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
