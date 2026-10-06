"use client";

import { Accordion } from "@sagui/ui";

const faq = [
  { title: "Can I cancel anytime?", content: "Yes. Your plan stays active until the end of the billing period." },
  { title: "Do you offer refunds?", content: "Within 14 days of purchase, no questions asked." },
  { title: "Is there a free plan?", content: "Yes. It includes up to three projects and community support." },
];

// #region Hero
export function Hero() {
  return (
    <div className="w-full max-w-lg">
      <Accordion items={faq} />
    </div>
  );
}
// #endregion

// #region Large
export function Large() {
  return (
    <div className="w-full max-w-2xl">
      <Accordion size="lg" items={faq} />
    </div>
  );
}
// #endregion

// #region AllClosed
export function AllClosed() {
  return (
    <div className="w-full max-w-lg">
      <Accordion defaultOpen={-1} items={faq} />
    </div>
  );
}
// #endregion

// #region RichContent
export function RichContent() {
  return (
    <div className="w-full max-w-lg">
      <Accordion
        items={[
          {
            title: "What is included?",
            content: (
              <ul className="list-disc space-y-1 pl-5">
                <li>Unlimited projects</li>
                <li>Priority support</li>
                <li>Audit log</li>
              </ul>
            ),
          },
          { title: "How do I upgrade?", content: <p>Open Settings, choose Billing, then pick a plan.</p> },
        ]}
      />
    </div>
  );
}
// #endregion
