"use client";

import { ApprovalCard, type ApprovalQuestion } from "@sagui/ui";

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// #region Hero
const launch: ApprovalQuestion[] = [
  { id: "flavors", question: "How many flavors should we launch?", options: [{ value: "three", label: "Three (core line)" }, { value: "five", label: "Five (full case)" }, { value: "one", label: "Just one hero" }] },
  { id: "mixins", question: "Which mix-ins should we stock?", type: "multiple", options: [{ value: "chocolate", label: "Chocolate chips" }, { value: "waffle", label: "Waffle bits" }, { value: "sprinkles", label: "Sprinkles" }] },
  { id: "market", question: "Which market do we enter first?", options: [{ value: "trucks", label: "Food trucks" }, { value: "grocery", label: "Grocery freezers" }, { value: "shops", label: "Scoop shops" }] },
];

export function Hero() {
  return <ApprovalCard questions={launch} onSubmit={() => wait(700)} onDismiss={() => {}} />;
}
// #endregion

// #region SingleQuestion
export function SingleQuestion() {
  return (
    <ApprovalCard
      questions={[{ id: "refund", question: "Refund the duplicate charge of $48?", allowOther: false, options: [{ value: "full", label: "Refund in full" }, { value: "credit", label: "Issue store credit" }, { value: "none", label: "Don't refund" }] }]}
      submitLabel="Approve"
      onSubmit={() => wait(700)}
    />
  );
}
// #endregion
