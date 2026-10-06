"use client";

import { useState } from "react";
import { Button, Dialog, DialogClose, DialogContent, DialogTrigger } from "@sagui/ui";

// #region Hero
export function Hero() {
  return (
    <Dialog>
      <DialogTrigger asChild><Button variant="danger">Delete project</Button></DialogTrigger>
      <DialogContent title="Delete Atlas redesign?" description="This removes the project and its 14 files for everyone.">
        <p className="mb-5 text-muted-foreground">You can restore it from the trash for 30 days.</p>
        <div className="flex justify-end gap-2">
          <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
          <DialogClose asChild><Button variant="danger">Delete</Button></DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
// #endregion

// #region Controlled
export function Controlled() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>Invite people</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent title="Invite people" description="They will get an email with a link.">
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Not now</Button>
            <Button onClick={() => setOpen(false)}>Send invites</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
// #endregion

// #region ChangingCopy
export function ChangingCopy() {
  const [step, setStep] = useState(1);
  return (
    <Dialog>
      <DialogTrigger asChild><Button variant="outline">Two step flow</Button></DialogTrigger>
      <DialogContent title={step === 1 ? "Step 1: choose a plan" : "Step 2: confirm"} description={step === 1 ? "You can change it later." : "You will be billed today."}>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setStep(step === 1 ? 2 : 1)}>{step === 1 ? "Next" : "Back"}</Button>
          <DialogClose asChild><Button>Done</Button></DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
// #endregion
