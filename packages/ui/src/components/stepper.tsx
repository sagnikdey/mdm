"use client"

import * as React from "react"
import { Slot } from "radix-ui"

import { cn } from "@workspace/ui/lib/utils"

export type StepState = "active" | "completed" | "inactive" | "loading" | "error"

export type StepIndicators = {
  active?: React.ReactNode
  completed?: React.ReactNode
  inactive?: React.ReactNode
  loading?: React.ReactNode
  error?: React.ReactNode
}

type StepperContextValue = {
  value: number
  orientation: "horizontal" | "vertical"
  indicators?: StepIndicators
  onValueChange?: (value: number) => void
}

type StepperItemContextValue = {
  step: number
  state: StepState
  disabled: boolean
}

const StepperContext = React.createContext<StepperContextValue | null>(null)
const StepperItemContext = React.createContext<StepperItemContextValue | null>(
  null
)

function useStepper() {
  const context = React.useContext(StepperContext)
  if (!context) {
    throw new Error("Stepper components must be used within <Stepper>")
  }
  return context
}

function useStepperItem() {
  const context = React.useContext(StepperItemContext)
  if (!context) {
    throw new Error("Stepper item parts must be used within <StepperItem>")
  }
  return context
}

function Stepper({
  defaultValue = 1,
  value,
  onValueChange,
  orientation = "horizontal",
  indicators,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  defaultValue?: number
  value?: number
  onValueChange?: (value: number) => void
  orientation?: "horizontal" | "vertical"
  indicators?: StepIndicators
}) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue)
  const current = value ?? uncontrolled

  const handleValueChange = React.useCallback(
    (next: number) => {
      if (value === undefined) {
        setUncontrolled(next)
      }
      onValueChange?.(next)
    },
    [onValueChange, value]
  )

  return (
    <StepperContext.Provider
      value={{
        value: current,
        orientation,
        indicators,
        onValueChange: handleValueChange,
      }}
    >
      <div
        data-slot="stepper"
        data-orientation={orientation}
        className={cn(
          "group/stepper flex w-full gap-8 data-[orientation=horizontal]:flex-col data-[orientation=vertical]:flex-col lg:data-[orientation=vertical]:flex-row",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </StepperContext.Provider>
  )
}

function StepperNav({ className, ...props }: React.ComponentProps<"nav">) {
  const { orientation } = useStepper()

  return (
    <nav
      data-slot="stepper-nav"
      data-orientation={orientation}
      aria-label="Progress"
      className={cn(
        "group/stepper-nav flex data-[orientation=horizontal]:w-full data-[orientation=horizontal]:flex-row data-[orientation=horizontal]:items-center data-[orientation=vertical]:w-full data-[orientation=vertical]:flex-col lg:data-[orientation=vertical]:w-56 lg:data-[orientation=vertical]:shrink-0",
        className
      )}
      {...props}
    />
  )
}

function StepperItem({
  step,
  loading = false,
  error = false,
  disabled = false,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  step: number
  loading?: boolean
  error?: boolean
  disabled?: boolean
}) {
  const { value } = useStepper()
  const state: StepState = loading
    ? "loading"
    : error
      ? "error"
      : step === value
        ? "active"
        : step < value
          ? "completed"
          : "inactive"

  return (
    <StepperItemContext.Provider value={{ step, state, disabled }}>
      <div
        data-slot="stepper-item"
        data-state={state}
        data-disabled={disabled || undefined}
        className={cn(
          "group/step relative flex items-center",
          "group-data-[orientation=horizontal]/stepper-nav:flex-1 group-data-[orientation=horizontal]/stepper-nav:last:flex-none",
          "group-data-[orientation=vertical]/stepper-nav:items-start group-data-[orientation=vertical]/stepper-nav:not-last:flex-1",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </StepperItemContext.Provider>
  )
}

function StepperTrigger({
  className,
  asChild = false,
  children,
  ...props
}: React.ComponentProps<"button"> & { asChild?: boolean }) {
  const { onValueChange } = useStepper()
  const { step, state, disabled } = useStepperItem()
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      type={asChild ? undefined : "button"}
      data-slot="stepper-trigger"
      data-state={state}
      aria-current={state === "active" || state === "error" ? "step" : undefined}
      aria-invalid={state === "error" || undefined}
      disabled={disabled}
      onClick={() => {
        if (!disabled) onValueChange?.(step)
      }}
      className={cn(
        "inline-flex cursor-pointer items-center gap-2.5 rounded-md text-start transition-colors outline-none",
        "hover:opacity-90 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30",
        "disabled:pointer-events-none disabled:opacity-50",
        "group-data-[orientation=vertical]/stepper-nav:items-start group-data-[orientation=vertical]/stepper-nav:pb-12 group-last/step:pb-0",
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  )
}

function StepperIndicator({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const { indicators } = useStepper()
  const { step, state } = useStepperItem()

  const content =
    (state === "loading" && indicators?.loading) ||
    (state === "error" && indicators?.error) ||
    (state === "completed" && indicators?.completed) ||
    (state === "active" && indicators?.active) ||
    (state === "inactive" && indicators?.inactive) ||
    children ||
    step

  return (
    <div
      data-slot="stepper-indicator"
      data-state={state}
      className={cn(
        "flex size-6 shrink-0 items-center justify-center rounded-full border border-border bg-background text-xs font-medium text-muted-foreground transition-colors",
        "data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
        "data-[state=completed]:border-primary data-[state=completed]:bg-primary data-[state=completed]:text-primary-foreground",
        "data-[state=loading]:border-primary data-[state=loading]:text-primary",
        "data-[state=error]:border-destructive data-[state=error]:bg-destructive/10 data-[state=error]:text-destructive",
        className
      )}
      {...props}
    >
      {content}
    </div>
  )
}

function StepperSeparator({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="stepper-separator"
      aria-hidden
      className={cn(
        "bg-border group-data-[state=completed]/step:bg-primary group-data-[state=error]/step:bg-destructive",
        "group-data-[orientation=horizontal]/stepper-nav:mx-2 group-data-[orientation=horizontal]/stepper-nav:h-px group-data-[orientation=horizontal]/stepper-nav:flex-1",
        "group-data-[orientation=vertical]/stepper-nav:absolute group-data-[orientation=vertical]/stepper-nav:inset-y-0 group-data-[orientation=vertical]/stepper-nav:inset-s-3 group-data-[orientation=vertical]/stepper-nav:top-7 group-data-[orientation=vertical]/stepper-nav:-order-1 group-data-[orientation=vertical]/stepper-nav:m-0 group-data-[orientation=vertical]/stepper-nav:h-[calc(100%-2rem)] group-data-[orientation=vertical]/stepper-nav:w-px group-data-[orientation=vertical]/stepper-nav:-translate-x-1/2 rtl:group-data-[orientation=vertical]/stepper-nav:translate-x-1/2",
        className
      )}
      {...props}
    />
  )
}

function StepperTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="stepper-title"
      className={cn(
        "font-heading text-sm font-medium text-foreground group-data-[state=inactive]/step:text-muted-foreground group-data-[state=error]/step:text-destructive",
        className
      )}
      {...props}
    />
  )
}

function StepperDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="stepper-description"
      className={cn(
        "text-xs/relaxed text-muted-foreground group-data-[state=error]/step:text-destructive",
        className
      )}
      {...props}
    />
  )
}

function StepperPanel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="stepper-panel"
      className={cn("min-w-0 flex-1", className)}
      {...props}
    />
  )
}

function StepperContent({
  value,
  forceMount = false,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  value: number
  forceMount?: boolean
}) {
  const { value: current } = useStepper()
  const isActive = current === value

  if (!forceMount && !isActive) return null

  return (
    <div
      data-slot="stepper-content"
      data-state={isActive ? "active" : "inactive"}
      hidden={!isActive}
      className={cn("outline-none", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export {
  Stepper,
  StepperNav,
  StepperItem,
  StepperTrigger,
  StepperIndicator,
  StepperSeparator,
  StepperTitle,
  StepperDescription,
  StepperPanel,
  StepperContent,
}
