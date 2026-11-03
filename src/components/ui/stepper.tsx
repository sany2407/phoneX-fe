"use client"

import * as React from "react"
import { CheckIcon } from "@radix-ui/react-icons"
import { Slot, Tabs as TabsPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

type StepState = "completed" | "active" | "upcoming"

type StepperContextValue = {
  activeStep: number
  furthestStep: number
  setActiveStep: (step: number) => void
  isLinear: boolean
  stepCount?: number
  hasContent: boolean
  setHasContent: (hasContent: boolean) => void
}

const StepperContext = React.createContext<StepperContextValue | null>(null)
const StepperItemContext = React.createContext<{
  step: number
  state: StepState
} | null>(null)

function useStepper() {
  const context = React.useContext(StepperContext)
  if (!context) throw new Error("useStepper must be used within <Stepper>")
  return context
}

function useStepperItem() {
  const context = React.useContext(StepperItemContext)
  if (!context)
    throw new Error("Stepper parts must be used within <StepperItem>")
  return context
}

function Stepper({
  value,
  defaultValue = 0,
  onValueChange,
  linear = false,
  stepCount,
  orientation = "horizontal",
  className,
  ...props
}: Omit<
  React.ComponentProps<typeof TabsPrimitive.Root>,
  "value" | "defaultValue" | "onValueChange" | "activationMode"
> & {
  value?: number
  defaultValue?: number
  onValueChange?: (step: number) => void
  linear?: boolean
  stepCount?: number
}) {
  const [uncontrolledStep, setUncontrolledStep] = React.useState(defaultValue)
  const activeStep = value ?? uncontrolledStep
  const [furthestStep, setFurthestStep] = React.useState(activeStep)
  const [hasContent, setHasContent] = React.useState(false)

  if (activeStep > furthestStep) setFurthestStep(activeStep)

  function setActiveStep(step: number) {
    if (value === undefined) setUncontrolledStep(step)
    onValueChange?.(step)
  }

  return (
    <StepperContext.Provider
      value={{
        activeStep,
        furthestStep,
        setActiveStep,
        isLinear: linear,
        stepCount,
        hasContent,
        setHasContent,
      }}
    >
      <TabsPrimitive.Root
        data-slot="stepper"
        value={String(activeStep)}
        onValueChange={(next) => setActiveStep(Number(next))}
        orientation={orientation}
        activationMode="manual"
        className={cn(
          "group/stepper flex gap-6 data-[orientation=horizontal]:flex-col",
          className
        )}
        {...props}
      />
    </StepperContext.Provider>
  )
}

function StepperList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="stepper-list"
      className={cn(
        "flex gap-2 group-data-[orientation=horizontal]/stepper:items-center group-data-[orientation=vertical]/stepper:flex-col",
        className
      )}
      {...props}
    />
  )
}

function StepperItem({
  step,
  className,
  ...props
}: React.ComponentProps<"div"> & { step: number }) {
  const { activeStep } = useStepper()
  const state: StepState =
    step < activeStep
      ? "completed"
      : step === activeStep
        ? "active"
        : "upcoming"

  return (
    <StepperItemContext.Provider value={{ step, state }}>
      <div
        data-slot="stepper-item"
        data-state={state}
        className={cn(
          "group/step flex flex-1 gap-2 group-data-[orientation=horizontal]/stepper:items-center group-data-[orientation=vertical]/stepper:flex-col last:flex-none",
          className
        )}
        {...props}
      />
    </StepperItemContext.Provider>
  )
}

function StepperTrigger({
  className,
  disabled,
  ...props
}: Omit<React.ComponentProps<typeof TabsPrimitive.Trigger>, "value">) {
  const { furthestStep, isLinear, hasContent } = useStepper()
  const { step } = useStepperItem()

  return (
    <TabsPrimitive.Trigger
      data-slot="stepper-trigger"
      value={String(step)}
      disabled={disabled || (isLinear && step > furthestStep)}
      {...(!hasContent && { "aria-controls": undefined })}
      className={cn(
        "flex shrink-0 items-center gap-2.5 rounded-md text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-60",
        className
      )}
      {...props}
    />
  )
}

function StepperIndicator({
  className,
  children,
  ...props
}: React.ComponentProps<"span">) {
  const { step, state } = useStepperItem()

  return (
    <span
      data-slot="stepper-indicator"
      data-state={state}
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium text-muted-foreground tabular-nums transition-colors",
        "data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:ring-[3px] data-[state=active]:ring-primary/15",
        "data-[state=completed]:border-primary data-[state=completed]:bg-primary data-[state=completed]:text-primary-foreground",
        className
      )}
      {...props}
    >
      {children ??
        (state === "completed" ? <CheckIcon className="size-3.5" /> : step + 1)}
    </span>
  )
}

function StepperTitle({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="stepper-title"
      className={cn(
        "text-sm font-medium group-data-[state=upcoming]/step:text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function StepperDescription({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="stepper-description"
      className={cn("block text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

function StepperSeparator({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="stepper-separator"
      aria-hidden
      className={cn(
        "flex-1 bg-border transition-colors group-last/step:hidden group-data-[state=completed]/step:bg-primary",
        "group-data-[orientation=horizontal]/stepper:h-px group-data-[orientation=horizontal]/stepper:min-w-6",
        "group-data-[orientation=vertical]/stepper:ml-3.5 group-data-[orientation=vertical]/stepper:min-h-6 group-data-[orientation=vertical]/stepper:w-px",
        className
      )}
      {...props}
    />
  )
}

function StepperContent({
  step,
  className,
  ...props
}: Omit<React.ComponentProps<typeof TabsPrimitive.Content>, "value"> & {
  step: number
}) {
  const { setHasContent } = useStepper()

  React.useEffect(() => setHasContent(true), [setHasContent])

  return (
    <TabsPrimitive.Content
      data-slot="stepper-content"
      value={String(step)}
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

function StepperPrevious({
  asChild = false,
  disabled,
  onClick,
  ...props
}: React.ComponentProps<"button"> & { asChild?: boolean }) {
  const { activeStep, setActiveStep } = useStepper()
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="stepper-previous"
      type="button"
      disabled={disabled || activeStep === 0}
      onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event)
        if (!event.defaultPrevented) setActiveStep(activeStep - 1)
      }}
      {...props}
    />
  )
}

function StepperNext({
  asChild = false,
  disabled,
  onClick,
  ...props
}: React.ComponentProps<"button"> & { asChild?: boolean }) {
  const { activeStep, setActiveStep, stepCount } = useStepper()
  const Comp = asChild ? Slot.Root : "button"
  const isLastStep = stepCount !== undefined && activeStep >= stepCount - 1

  return (
    <Comp
      data-slot="stepper-next"
      type="button"
      disabled={disabled || isLastStep}
      onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event)
        if (!event.defaultPrevented) setActiveStep(activeStep + 1)
      }}
      {...props}
    />
  )
}

export {
  Stepper,
  StepperList,
  StepperItem,
  StepperTrigger,
  StepperIndicator,
  StepperTitle,
  StepperDescription,
  StepperSeparator,
  StepperContent,
  StepperPrevious,
  StepperNext,
  useStepper,
}
