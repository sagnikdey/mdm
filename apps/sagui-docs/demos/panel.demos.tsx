"use client";

import { Button, Input, Panel, PanelContent, PanelDescription, PanelFooter, PanelHeader, PanelTitle } from "@sagui/ui";

// #region Hero
export function Hero() {
  return (
    <Panel as="form" className="w-full max-w-md" onSubmit={(event) => event.preventDefault()}>
      <PanelHeader>
        <PanelTitle>Company profile</PanelTitle>
        <PanelDescription>Shown to your buyers.</PanelDescription>
      </PanelHeader>
      <PanelContent>
        <Input label="Legal name" defaultValue="Northwind Foods" />
      </PanelContent>
      <PanelFooter>
        <Button variant="ghost" type="button">Cancel</Button>
        <Button type="submit">Save</Button>
      </PanelFooter>
    </Panel>
  );
}
// #endregion

// #region WithAction
export function WithAction() {
  return (
    <Panel elevation="resting" className="w-full max-w-md">
      <PanelHeader action={<Button variant="outline" size="sm">Edit</Button>}>
        <PanelTitle>Banking</PanelTitle>
        <PanelDescription>Account ending 4821</PanelDescription>
      </PanelHeader>
      <PanelContent className="text-sm text-fg-muted">Payments settle within two business days.</PanelContent>
    </Panel>
  );
}
// #endregion
