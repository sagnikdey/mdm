import {
  Button,
  Panel,
  PanelContent,
  PanelDescription,
  PanelFooter,
  PanelHeader,
  PanelTitle,
} from "@sagui/ui"

type ReviewAction = {
  label: string
  variant?: "primary" | "outline" | "danger"
  onClick: () => void
  disabled?: boolean
}

/** Composed from Panel and Button: SagUI's ApprovalCard is for questions an agent asks, not one human decision. */
export function ReviewDecision({
  description,
  question,
  actions,
}: {
  description: string
  question: string
  actions: ReviewAction[]
}) {
  return (
    <Panel as="section">
      <PanelHeader>
        <PanelTitle as="h2">Review decision</PanelTitle>
        <PanelDescription>{description}</PanelDescription>
      </PanelHeader>
      <PanelContent>
        <p className="text-sm font-medium">{question}</p>
      </PanelContent>
      <PanelFooter className="flex-wrap justify-start">
        {actions.map((action) => (
          <Button
            key={action.label}
            type="button"
            variant={action.variant ?? "primary"}
            onClick={action.onClick}
            disabled={action.disabled}
          >
            {action.label}
          </Button>
        ))}
      </PanelFooter>
    </Panel>
  )
}
