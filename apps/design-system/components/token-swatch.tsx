type TokenSwatchProps = {
  name: string
  variable: string
  foreground?: string
}

export function TokenSwatch({
  name,
  variable,
  foreground = "var(--foreground)",
}: TokenSwatchProps) {
  return (
    <div className="space-y-2">
      <div
        className="h-16 rounded-lg border border-border shadow-sm"
        style={{
          background: `var(${variable})`,
          color: foreground.startsWith("var(")
            ? foreground
            : `var(${foreground})`,
        }}
      />
      <div>
        <p className="text-sm font-medium">{name}</p>
        <p className="font-mono text-xs text-muted-foreground">{variable}</p>
      </div>
    </div>
  )
}
