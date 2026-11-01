"use client"

import { useEffect, useMemo, useState } from "react"

import {
  saveOnboardingStep,
  submitOnboardingApplication,
} from "@/app/onboarding/actions"
import {
  getFirstInvalidOnboardingStep,
  validateOnboardingStep,
} from "@/lib/onboarding-schema"
import {
  ONBOARDING_STEPS,
  type VendorApplication,
} from "@workspace/vendor-onboarding/types"
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Input,
  Panel,
  PanelContent,
  PanelDescription,
  PanelFooter,
  PanelHeader,
  PanelTitle,
  Select,
  Stepper,
  Textarea,
} from "@sagui/ui"
import { CheckIcon, CircleAlertIcon, CircleIcon, LoaderCircleIcon } from "lucide-react"

const CATEGORY_OPTIONS = [
  "Beverages",
  "Snacks",
  "Food",
  "Tobacco",
  "Household",
  "Health & Beauty",
]

const PRIMARY_CATEGORY_OPTIONS = [
  { value: "beverages", label: "Beverages" },
  { value: "snacks", label: "Snacks" },
  { value: "food", label: "Food" },
]

type TaskStatus = "pending" | "running" | "completed" | "failed"

type SubmitTask = {
  id: string
  label: string
  status: TaskStatus
  detail?: string
}

const TASK_STATUS: Record<TaskStatus, { icon: React.ReactNode; text: string }> = {
  pending: { icon: <CircleIcon className="size-4 text-fg-muted" />, text: "Pending" },
  running: {
    icon: <LoaderCircleIcon className="size-4 text-fg-muted motion-safe:animate-spin" />,
    text: "In progress",
  },
  completed: { icon: <CheckIcon className="size-4 text-success-default" />, text: "Done" },
  failed: { icon: <CircleAlertIcon className="size-4 text-danger-default" />, text: "Failed" },
}

function SubmitTaskList({ tasks }: { tasks: SubmitTask[] }) {
  return (
    <ul className="grid gap-3" aria-live="polite">
      {tasks.map((task) => (
        <li key={task.id} className="flex items-start gap-3 text-sm">
          <span className="mt-0.5 shrink-0" aria-hidden>
            {TASK_STATUS[task.status].icon}
          </span>
          <span className="min-w-0">
            <span className="sr-only">{TASK_STATUS[task.status].text}: </span>
            <span className="text-fg-default">{task.label}</span>
            {task.detail ? <span className="block text-fg-muted">{task.detail}</span> : null}
          </span>
        </li>
      ))}
    </ul>
  )
}

type EditableSection =
  | "companyData"
  | "contactData"
  | "addressData"
  | "paymentData"
  | "categoriesData"

type OnboardingWizardProps = {
  application: VendorApplication
}

export function OnboardingWizard({ application: initial }: OnboardingWizardProps) {
  const [application, setApplication] = useState(initial)
  const [step, setStep] = useState(initial.currentStep)
  const [isSaving, setIsSaving] = useState(false)
  const [submitTasks, setSubmitTasks] = useState<SubmitTask[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [errorSteps, setErrorSteps] = useState<Set<number>>(new Set())
  const [formError, setFormError] = useState<string | null>(null)

  const isSubmitted = application.status === "submitted" || application.status === "under_review" || application.status === "approved"
  const isSubmitting = submitTasks.some((task) => task.status === "running")

  const stepMeta = ONBOARDING_STEPS[step - 1]!

  function markStepError(stepId: number) {
    setErrorSteps((current) => {
      if (current.has(stepId)) return current
      const next = new Set(current)
      next.add(stepId)
      return next
    })
  }

  function clearStepError(stepId: number) {
    setErrorSteps((current) => {
      if (!current.has(stepId)) return current
      const next = new Set(current)
      next.delete(stepId)
      return next
    })
  }

  useEffect(() => {
    if (!errorSteps.has(step)) return

    const result = validateOnboardingStep(step, application)
    if (result.ok) {
      setErrors({})
      clearStepError(step)
      return
    }

    setErrors(result.errors)
  }, [application, errorSteps, step])

  function clearError(name: string) {
    setErrors((current) => {
      if (!current[name]) return current
      const next = { ...current }
      delete next[name]
      return next
    })
  }

  function updateSection<K extends EditableSection>(
    section: K,
    patch: Partial<VendorApplication[K]>,
    errorName?: string
  ) {
    if (errorName) clearError(errorName)
    setApplication((prev) => ({
      ...prev,
      [section]: { ...prev[section], ...patch },
    }))
  }

  function validateCurrentStep() {
    if (step >= 7) {
      const invalid = getFirstInvalidOnboardingStep(application)
      if (!invalid) {
        setErrors({})
        setErrorSteps(new Set())
        return true
      }
      setErrors(invalid.errors)
      markStepError(invalid.step)
      setStep(invalid.step)
      setFormError("Please complete the required fields")
      return false
    }

    const result = validateOnboardingStep(step, application)
    if (result.ok) {
      setErrors({})
      clearStepError(step)
      return true
    }

    setErrors(result.errors)
    markStepError(step)
    setFormError("Please complete the required fields")
    return false
  }

  function goToStep(next: number) {
    if (
      next === step ||
      isSaving ||
      isSubmitting ||
      next < 1 ||
      next > ONBOARDING_STEPS.length
    ) {
      return
    }
    if (next < step) {
      setErrors({})
      setFormError(null)
      setStep(next)
      return
    }
    void persist(next)
  }

  async function persist(nextStep: number) {
    setFormError(null)
    if (!validateCurrentStep()) return
    setIsSaving(true)
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
      setFormError(error instanceof Error ? error.message : "Failed to save step")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleSubmit() {
    setFormError(null)
    const invalid = getFirstInvalidOnboardingStep(application)
    if (invalid) {
      setErrors(invalid.errors)
      markStepError(invalid.step)
      setStep(invalid.step)
      setFormError("Please complete the required fields")
      return
    }

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
    } catch (error) {
      setSubmitTasks((tasks) =>
        tasks.map((task) =>
          task.status === "running" ? { ...task, status: "failed" } : task
        )
      )
      setFormError(error instanceof Error ? error.message : "Submission failed")
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
      <Panel as="section">
        <PanelHeader>
          <PanelTitle as="h2">Application submitted</PanelTitle>
          <PanelDescription>
            Your vendor application is in the review queue. We&apos;ll email {application.ownerEmail} with updates.
          </PanelDescription>
        </PanelHeader>
        <PanelContent>
          <SubmitTaskList
            tasks={
              submitTasks.length
                ? submitTasks
                : [{ id: "done", label: "Submitted for review", status: "completed" }]
            }
          />
        </PanelContent>
      </Panel>
    )
  }

  return (
    <div className="flex flex-col items-start gap-8 lg:flex-row lg:gap-10">
      <div className="w-full lg:w-64 lg:shrink-0">
        <Stepper
          aria-label="Onboarding progress"
          current={step - 1}
          onStepClick={(index) => goToStep(index + 1)}
          steps={ONBOARDING_STEPS.map((item) => ({
            label: (
              <>
                {item.title}
                <span className="block text-xs font-normal text-fg-muted">{item.description}</span>
              </>
            ),
            error: errorSteps.has(item.id),
          }))}
        />
      </div>

      <Panel as="section" className="w-full flex-1">
        <PanelHeader>
          <PanelTitle as="h2">{`Step ${step}: ${stepMeta.title}`}</PanelTitle>
          <PanelDescription>{stepMeta.description}</PanelDescription>
        </PanelHeader>

        <PanelContent className="grid gap-5">
          {formError ? <Alert tone="danger" title={formError} /> : null}

          <fieldset disabled={isSaving} className="m-0 min-w-0 border-0 p-0">
            {step === 1 ? (
              <div className="grid gap-5">
                <Input
                  label="Legal company name"
                  value={application.companyData.legalName}
                  error={errors.legalName}
                  onChange={(e) => updateSection("companyData", { legalName: e.target.value }, "legalName")}
                />
                <Input
                  label="DBA name (optional)"
                  value={application.companyData.dbaName ?? ""}
                  onChange={(e) => updateSection("companyData", { dbaName: e.target.value })}
                />
                <div className="grid items-start gap-4 md:grid-cols-2">
                  <Input
                    label="Tax ID / EIN (optional)"
                    value={application.companyData.taxId ?? ""}
                    onChange={(e) => updateSection("companyData", { taxId: e.target.value })}
                  />
                  <Select
                    label="Primary category"
                    placeholder="Select category"
                    value={application.companyData.vendorCategory}
                    options={PRIMARY_CATEGORY_OPTIONS}
                    error={errors.vendorCategory}
                    onValueChange={(value) => updateSection("companyData", { vendorCategory: value }, "vendorCategory")}
                  />
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="grid gap-5">
                <Input
                  label="Contact person"
                  value={application.contactData.contactPerson}
                  error={errors.contactPerson}
                  onChange={(e) => updateSection("contactData", { contactPerson: e.target.value }, "contactPerson")}
                />
                <Input label="Email (from invitation)" value={application.contactData.email} disabled />
                <Input
                  label="Phone"
                  type="tel"
                  value={application.contactData.phone}
                  error={errors.phone}
                  onChange={(e) => updateSection("contactData", { phone: e.target.value }, "phone")}
                />
              </div>
            ) : null}

            {step === 3 ? (
              <div className="grid gap-5">
                <Textarea
                  label="Street address"
                  value={application.addressData.street}
                  error={errors.street}
                  onChange={(e) => updateSection("addressData", { street: e.target.value }, "street")}
                />
                <div className="grid items-start gap-4 md:grid-cols-3">
                  <Input
                    label="City"
                    value={application.addressData.city}
                    error={errors.city}
                    onChange={(e) => updateSection("addressData", { city: e.target.value }, "city")}
                  />
                  <Input
                    label="State"
                    value={application.addressData.state}
                    error={errors.state}
                    onChange={(e) => updateSection("addressData", { state: e.target.value }, "state")}
                  />
                  <Input
                    label="ZIP"
                    inputMode="numeric"
                    value={application.addressData.zipCode}
                    error={errors.zipCode}
                    onChange={(e) => updateSection("addressData", { zipCode: e.target.value }, "zipCode")}
                  />
                </div>
              </div>
            ) : null}

            {step === 4 ? (
              <div className="grid gap-5">
                <Input
                  label="Payment terms"
                  value={application.paymentData.paymentTerms}
                  error={errors.paymentTerms}
                  onChange={(e) => updateSection("paymentData", { paymentTerms: e.target.value }, "paymentTerms")}
                />
                <Input
                  label="Minimum order quantity"
                  type="number"
                  min={1}
                  value={application.paymentData.minimumOrderQuantity}
                  error={errors.minimumOrderQuantity}
                  onChange={(e) =>
                    updateSection(
                      "paymentData",
                      { minimumOrderQuantity: Number(e.target.value) || 0 },
                      "minimumOrderQuantity"
                    )
                  }
                />
              </div>
            ) : null}

            {step === 5 ? (
              <fieldset className="m-0 grid min-w-0 gap-1 border-0 p-0">
                <legend className="mb-2 p-0 text-sm font-medium text-fg-default">Categories you supply</legend>
                {CATEGORY_OPTIONS.map((category) => (
                  <Checkbox
                    key={category}
                    label={category}
                    checked={application.categoriesData.categories.includes(category)}
                    onCheckedChange={(value) =>
                      updateSection(
                        "categoriesData",
                        {
                          categories: value
                            ? [...application.categoriesData.categories, category]
                            : application.categoriesData.categories.filter((item) => item !== category),
                        },
                        "categories"
                      )
                    }
                  />
                ))}
                {errors.categories ? (
                  <p role="alert" className="m-0 mt-1 text-sm text-danger-default">
                    {errors.categories}
                  </p>
                ) : null}
              </fieldset>
            ) : null}

            {step === 6 ? (
              <div className="grid justify-items-start gap-4">
                <p className="m-0 text-sm text-fg-muted">
                  Add compliance document references for review. File upload storage can be wired later.
                </p>
                {application.documentsData.length ? (
                  <div className="grid w-full gap-3 md:grid-cols-2">
                    {application.documentsData.map((doc) => (
                      <Card
                        key={doc.id}
                        title={doc.name}
                        description={`Uploaded ${new Date(doc.uploadedAt).toLocaleDateString()}`}
                        meta={doc.type.toUpperCase()}
                      />
                    ))}
                  </div>
                ) : null}
                <Button
                  type="button"
                  variant="outline"
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

            {step === 7 ? (
              <dl className="m-0 grid gap-3">
                {reviewSummary.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between gap-4 rounded-control border border-border-default px-3 py-2 text-sm"
                  >
                    <dt className="text-fg-muted">{row.label}</dt>
                    <dd className="m-0 text-right font-medium text-fg-default">{row.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}

            {step === 8 ? (
              <div className="grid gap-4">
                <p className="m-0 text-sm text-fg-muted">
                  Submit your application to the buyer review queue.
                </p>
                <SubmitTaskList tasks={submitTasks} />
              </div>
            ) : null}
          </fieldset>
        </PanelContent>

        <PanelFooter className="justify-between">
          <Button
            type="button"
            variant="outline"
            disabled={step <= 1 || isSaving || isSubmitting}
            onClick={() => goToStep(step - 1)}
          >
            Back
          </Button>

          {step < 8 ? (
            <Button type="button" loading={isSaving} onClick={() => void persist(step + 1)}>
              Save & continue
            </Button>
          ) : (
            <Button type="button" loading={isSubmitting} onClick={() => void handleSubmit()}>
              Submit application
            </Button>
          )}
        </PanelFooter>
      </Panel>
    </div>
  )
}
