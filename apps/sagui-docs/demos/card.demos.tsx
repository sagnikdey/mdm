"use client";

import { useState } from "react";
import { Avatar, Button, Card } from "@sagui/ui";

/** Photos from Unsplash (free to use under the Unsplash License), served at card width. */
const unsplash = (id: string, width: number, height: number) => `https://images.unsplash.com/${id}?w=${width}&h=${height}&q=80&auto=format&fit=crop`;
const officePhoto = unsplash("photo-1497366216548-37526070297c", 640, 320);
const dashboardPhoto = unsplash("photo-1460925895917-afdab827c52f", 640, 320);
const mayaPhoto = unsplash("photo-1494790108377-be9c29b29330", 96, 96);
const samirPhoto = unsplash("photo-1507003211169-0a1dd7228f2d", 96, 96);

// #region Hero
export function Hero() {
  return (
    <div className="w-full max-w-xs">
      <Card
        title="Atlas redesign"
        description="A quiet redesign of the workspace home."
        media={<img src={officePhoto} alt="A bright, empty office corridor" width={640} height={320} className="block h-40 w-full object-cover" />}
        avatar={<Avatar name="Maya Chen" src={mayaPhoto} size="sm" />}
        meta="Maya Chen"
        status="Updated 2 hours ago"
        action={<Button size="sm" variant="outline">Open</Button>}
      />
    </div>
  );
}
// #endregion

// #region QuickLook
export function QuickLook() {
  return (
    <div className="w-full max-w-xs">
      <Card
        title="Billing migration"
        description="Moving invoices to the new provider."
        media={<img src={dashboardPhoto} alt="A laptop showing a revenue dashboard" width={640} height={320} className="block h-40 w-full object-cover" />}
        avatar={<Avatar name="Samir Patel" src={samirPhoto} size="sm" />}
        meta="Samir Patel"
        status="Updated yesterday"
        details={<p>Everything the team needs to review the migration: scope, open questions, and the cutover checklist.</p>}
        action={<Button size="sm" variant="outline">Share</Button>}
      />
    </div>
  );
}
// #endregion

// #region Plain
export function Plain() {
  return (
    <div className="w-full max-w-xs">
      <Card title="Onboarding checklist" description="Five steps to get a new teammate productive." />
    </div>
  );
}
// #endregion

// #region ChangingStatus
export function ChangingStatus() {
  const [saved, setSaved] = useState(false);
  return (
    <div className="grid w-full max-w-xs gap-3">
      <Card title="Pricing page copy" description="Draft for review." meta="Sam" status={saved ? "Saved just now" : "Updated 2 hours ago"} />
      <Button variant="outline" size="sm" onClick={() => setSaved((value) => !value)}>Toggle status</Button>
    </div>
  );
}
// #endregion
