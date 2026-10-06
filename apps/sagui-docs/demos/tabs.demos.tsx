"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@sagui/ui";

// #region Hero
export function Hero() {
  return (
    <div className="w-full max-w-md">
      <Tabs defaultValue="overview">
        <TabsList aria-label="Project">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">Owners, status and the latest milestone for this project.</TabsContent>
        <TabsContent value="activity">
          <p>Recent changes by everyone on the team.</p>
          <p className="mt-2">Updated every few minutes, newest first.</p>
        </TabsContent>
        <TabsContent value="settings">Rename the project, change its visibility or archive it.</TabsContent>
      </Tabs>
    </div>
  );
}
// #endregion

// #region Controlled
export function Controlled() {
  const [tab, setTab] = useState("monthly");
  return (
    <div className="w-full max-w-md">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList aria-label="Billing period">
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="yearly">Yearly</TabsTrigger>
        </TabsList>
        <TabsContent value="monthly">$12 per seat, billed every month.</TabsContent>
        <TabsContent value="yearly">$120 per seat, billed once a year.</TabsContent>
      </Tabs>
      <p className="mt-4 text-sm text-muted-foreground">Selected: {tab}</p>
    </div>
  );
}
// #endregion

// #region Overflow
const months = ["January", "February", "March", "April", "May", "June", "July"];
export function Overflow() {
  return (
    <div className="w-full max-w-xs">
      <Tabs defaultValue="January">
        <TabsList aria-label="Months">
          {months.map((month) => <TabsTrigger key={month} value={month}>{month}</TabsTrigger>)}
        </TabsList>
        {months.map((month) => <TabsContent key={month} value={month}>{month} report.</TabsContent>)}
      </Tabs>
    </div>
  );
}
// #endregion

// #region Disabled
export function Disabled() {
  return (
    <div className="w-full max-w-md">
      <Tabs defaultValue="free">
        <TabsList aria-label="Plans">
          <TabsTrigger value="free">Free</TabsTrigger>
          <TabsTrigger value="pro">Pro</TabsTrigger>
          <TabsTrigger value="team" disabled>Team</TabsTrigger>
        </TabsList>
        <TabsContent value="free">Up to three projects.</TabsContent>
        <TabsContent value="pro">Unlimited projects and priority support.</TabsContent>
        <TabsContent value="team">Coming soon.</TabsContent>
      </Tabs>
    </div>
  );
}
// #endregion
