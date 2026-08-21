"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

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
import { FormLayout } from "@workspace/ui/components/form-layout"
import { LoadingState } from "@workspace/ui/components/loading-state"
import { TaskRows, type TaskRowItem } from "@workspace/ui/components/task-rows"
import { ContextCard } from "@workspace/ui/components/context-card"
import { Button } from "@workspace/ui/components/button"
import { GlassCardFooter } from "@workspace/ui/components/glass-card"
import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  Field,
  FieldContent,
  FieldError,
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
import {
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperPanel,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@workspace/ui/components/stepper"
import { CheckIcon, CircleAlertIcon, LoaderCircleIcon } from "lucide-react"

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
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [errorSteps, setErrorSteps] = useState<Set<number>>(new Set())

  const isSubmitted = application.status === "submitted" || application.status === "under_review" || application.status === "approved"

  useEffect(() => {
    if (!isSaving) return
    const timer = setInterval(() => setElapsed((value) => value + 0.1), 100)
    return () => clearInterval(timer)
  }, [isSaving])

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

  function fieldError(name: string) {
    const message = errors[name]
    return message ? [{ message }] : undefined
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
      toast.error("Please complete the required fields")
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
    toast.error("Please complete the required fields")
    return false
  }

  function goToStep(next: number) {
    if (
      next === step ||
      isSaving ||
      next < 1 ||
      next > ONBOARDING_STEPS.length
    ) {
      return
    }
    if (next < step) {
      setErrors({})
      setStep(next)
      return
    }
    void persist(next)
  }

  async function persist(nextStep: number) {
    if (!validateCurrentStep()) return
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
    const invalid = getFirstInvalidOnboardingStep(application)
    if (invalid) {
      setErrors(invalid.errors)
      markStepError(invalid.step)
      setStep(invalid.step)
      toast.error("Please complete the required fields")
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
      <FormLayout
        contained={false}
        title="Application submitted"
        description={`Your vendor application is in the review queue. We'll email ${application.ownerEmail} with updates.`}
      >
        <TaskRows
          tasks={
            submitTasks.length
              ? submitTasks
              : [{ id: "done", label: "Submitted for review", status: "completed" }]
          }
        />
      </FormLayout>
    )
  }

  return (
    <Stepper
      value={step}
      onValueChange={goToStep}
      orientation="vertical"
      className="items-start gap-8 lg:gap-10"
      indicators={{
        completed: <CheckIcon className="size-3.5" />,
        loading: <LoaderCircleIcon className="size-3.5 animate-spin" />,
        error: <CircleAlertIcon className="size-3.5" />,
      }}
    >
      <StepperNav>
        {ONBOARDING_STEPS.map((item, index) => (
          <StepperItem
            key={item.id}
            step={item.id}
            loading={isSaving && item.id === step}
            error={errorSteps.has(item.id)}
            disabled={isSaving}
          >
            <StepperTrigger className="items-start gap-2.5">
              <StepperIndicator>{item.id}</StepperIndicator>
              <div className="mt-0.5 space-y-0.5 text-start">
                <StepperTitle>{item.title}</StepperTitle>
                <StepperDescription>{item.description}</StepperDescription>
              </div>
            </StepperTrigger>
            {index < ONBOARDING_STEPS.length - 1 ? <StepperSeparator /> : null}
          </StepperItem>
        ))}
      </StepperNav>

      <StepperPanel>
        <FormLayout
          contained={false}
          title={`Step ${step}: ${stepMeta.title}`}
          description={stepMeta.description}
        footer={
          <GlassCardFooter className="justify-between gap-3 border-t">
            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={step <= 1 || isSaving}
              onClick={() => goToStep(step - 1)}
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
              <Button
                type="button"
                size="lg"
                disabled={isSaving}
                onClick={() => void handleSubmit()}
              >
                Submit application
              </Button>
            )}
          </GlassCardFooter>
        }
      >
          {isSaving ? <LoadingState label="Saving step" elapsedSeconds={elapsed} /> : null}

          {!isSaving && step === 1 ? (
            <FieldGroup>
              <Field data-invalid={Boolean(errors.legalName) || undefined}>
                <FieldLabel htmlFor="legalName">Legal company name</FieldLabel>
                <FieldContent>
                  <Input
                    id="legalName"
                    value={application.companyData.legalName}
                    aria-invalid={Boolean(errors.legalName) || undefined}
                    onChange={(e) => {
                      clearError("legalName")
                      setApplication((prev) => ({
                        ...prev,
                        companyData: { ...prev.companyData, legalName: e.target.value },
                      }))
                    }}
                  />
                  <FieldError errors={fieldError("legalName")} />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel htmlFor="dbaName">DBA name (optional)</FieldLabel>
                <FieldContent>
                  <Input
                    id="dbaName"
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
                  <FieldLabel htmlFor="taxId">Tax ID / EIN (optional)</FieldLabel>
                  <FieldContent>
                    <Input
                      id="taxId"
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
                <Field data-invalid={Boolean(errors.vendorCategory) || undefined}>
                  <FieldLabel>Primary category</FieldLabel>
                  <FieldContent>
                    <Select
                      value={application.companyData.vendorCategory}
                      onValueChange={(value) => {
                        clearError("vendorCategory")
                        setApplication((prev) => ({
                          ...prev,
                          companyData: { ...prev.companyData, vendorCategory: value },
                        }))
                      }}
                    >
                      <SelectTrigger aria-invalid={Boolean(errors.vendorCategory) || undefined}>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {["beverages", "snacks", "food"].map((value) => (
                          <SelectItem key={value} value={value} className="capitalize">
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError errors={fieldError("vendorCategory")} />
                  </FieldContent>
                </Field>
              </div>
            </FieldGroup>
          ) : null}

          {!isSaving && step === 2 ? (
            <FieldGroup>
              <Field data-invalid={Boolean(errors.contactPerson) || undefined}>
                <FieldLabel htmlFor="contactPerson">Contact person</FieldLabel>
                <FieldContent>
                  <Input
                    id="contactPerson"
                    value={application.contactData.contactPerson}
                    aria-invalid={Boolean(errors.contactPerson) || undefined}
                    onChange={(e) => {
                      clearError("contactPerson")
                      setApplication((prev) => ({
                        ...prev,
                        contactData: { ...prev.contactData, contactPerson: e.target.value },
                      }))
                    }}
                  />
                  <FieldError errors={fieldError("contactPerson")} />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel htmlFor="contactEmail">Email (from invitation)</FieldLabel>
                <FieldContent>
                  <Input id="contactEmail" value={application.contactData.email} disabled />
                </FieldContent>
              </Field>
              <Field data-invalid={Boolean(errors.phone) || undefined}>
                <FieldLabel htmlFor="phone">Phone</FieldLabel>
                <FieldContent>
                  <Input
                    id="phone"
                    type="tel"
                    value={application.contactData.phone}
                    aria-invalid={Boolean(errors.phone) || undefined}
                    onChange={(e) => {
                      clearError("phone")
                      setApplication((prev) => ({
                        ...prev,
                        contactData: { ...prev.contactData, phone: e.target.value },
                      }))
                    }}
                  />
                  <FieldError errors={fieldError("phone")} />
                </FieldContent>
              </Field>
            </FieldGroup>
          ) : null}

          {!isSaving && step === 3 ? (
            <FieldGroup>
              <Field data-invalid={Boolean(errors.street) || undefined}>
                <FieldLabel htmlFor="street">Street address</FieldLabel>
                <FieldContent>
                  <Textarea
                    id="street"
                    value={application.addressData.street}
                    aria-invalid={Boolean(errors.street) || undefined}
                    onChange={(e) => {
                      clearError("street")
                      setApplication((prev) => ({
                        ...prev,
                        addressData: { ...prev.addressData, street: e.target.value },
                      }))
                    }}
                  />
                  <FieldError errors={fieldError("street")} />
                </FieldContent>
              </Field>
              <div className="grid gap-4 md:grid-cols-3">
                <Field data-invalid={Boolean(errors.city) || undefined}>
                  <FieldLabel htmlFor="city">City</FieldLabel>
                  <FieldContent>
                    <Input
                      id="city"
                      value={application.addressData.city}
                      aria-invalid={Boolean(errors.city) || undefined}
                      onChange={(e) => {
                        clearError("city")
                        setApplication((prev) => ({
                          ...prev,
                          addressData: { ...prev.addressData, city: e.target.value },
                        }))
                      }}
                    />
                    <FieldError errors={fieldError("city")} />
                  </FieldContent>
                </Field>
                <Field data-invalid={Boolean(errors.state) || undefined}>
                  <FieldLabel htmlFor="state">State</FieldLabel>
                  <FieldContent>
                    <Input
                      id="state"
                      value={application.addressData.state}
                      aria-invalid={Boolean(errors.state) || undefined}
                      onChange={(e) => {
                        clearError("state")
                        setApplication((prev) => ({
                          ...prev,
                          addressData: { ...prev.addressData, state: e.target.value },
                        }))
                      }}
                    />
                    <FieldError errors={fieldError("state")} />
                  </FieldContent>
                </Field>
                <Field data-invalid={Boolean(errors.zipCode) || undefined}>
                  <FieldLabel htmlFor="zipCode">ZIP</FieldLabel>
                  <FieldContent>
                    <Input
                      id="zipCode"
                      inputMode="numeric"
                      value={application.addressData.zipCode}
                      aria-invalid={Boolean(errors.zipCode) || undefined}
                      onChange={(e) => {
                        clearError("zipCode")
                        setApplication((prev) => ({
                          ...prev,
                          addressData: { ...prev.addressData, zipCode: e.target.value },
                        }))
                      }}
                    />
                    <FieldError errors={fieldError("zipCode")} />
                  </FieldContent>
                </Field>
              </div>
            </FieldGroup>
          ) : null}

          {!isSaving && step === 4 ? (
            <FieldGroup>
              <Field data-invalid={Boolean(errors.paymentTerms) || undefined}>
                <FieldLabel htmlFor="paymentTerms">Payment terms</FieldLabel>
                <FieldContent>
                  <Input
                    id="paymentTerms"
                    value={application.paymentData.paymentTerms}
                    aria-invalid={Boolean(errors.paymentTerms) || undefined}
                    onChange={(e) => {
                      clearError("paymentTerms")
                      setApplication((prev) => ({
                        ...prev,
                        paymentData: { ...prev.paymentData, paymentTerms: e.target.value },
                      }))
                    }}
                  />
                  <FieldError errors={fieldError("paymentTerms")} />
                </FieldContent>
              </Field>
              <Field data-invalid={Boolean(errors.minimumOrderQuantity) || undefined}>
                <FieldLabel htmlFor="minimumOrderQuantity">Minimum order quantity</FieldLabel>
                <FieldContent>
                  <Input
                    id="minimumOrderQuantity"
                    type="number"
                    min={1}
                    value={application.paymentData.minimumOrderQuantity}
                    aria-invalid={Boolean(errors.minimumOrderQuantity) || undefined}
                    onChange={(e) => {
                      clearError("minimumOrderQuantity")
                      setApplication((prev) => ({
                        ...prev,
                        paymentData: {
                          ...prev.paymentData,
                          minimumOrderQuantity: Number(e.target.value) || 0,
                        },
                      }))
                    }}
                  />
                  <FieldError errors={fieldError("minimumOrderQuantity")} />
                </FieldContent>
              </Field>
            </FieldGroup>
          ) : null}

          {!isSaving && step === 5 ? (
            <FieldGroup>
              <Field data-invalid={Boolean(errors.categories) || undefined}>
                <FieldLabel>Categories you supply</FieldLabel>
                <FieldContent>
                  {CATEGORY_OPTIONS.map((category) => {
                    const checked = application.categoriesData.categories.includes(category)
                    return (
                      <Field key={category} orientation="horizontal">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(value) => {
                            clearError("categories")
                            setApplication((prev) => ({
                              ...prev,
                              categoriesData: {
                                ...prev.categoriesData,
                                categories: value
                                  ? [...prev.categoriesData.categories, category]
                                  : prev.categoriesData.categories.filter(
                                      (item) => item !== category
                                    ),
                              },
                            }))
                          }}
                        />
                        <FieldLabel>{category}</FieldLabel>
                      </Field>
                    )
                  })}
                  <FieldError errors={fieldError("categories")} />
                </FieldContent>
              </Field>
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
      </FormLayout>
      </StepperPanel>
    </Stepper>
  )
}
