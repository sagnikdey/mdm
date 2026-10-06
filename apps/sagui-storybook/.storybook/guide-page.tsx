/// <reference types="vite/client" />
import * as React from "react";
import { Controls, Markdown, Primary, Stories, Subtitle, Title, useOf } from "@storybook/addon-docs/blocks";

/**
 * The component guidance lives once, in the docs site's markdown. Storybook's Docs tab reads the same files,
 * so "When to use", the API table and the accessibility notes never drift between the two.
 */
const files = import.meta.glob<string>("../../docs/content/components/*.md", { query: "?raw", import: "default", eager: true });
const bySlug = new Map(Object.entries(files).map(([file, text]) => [file.split("/").pop()!.replace(/\.md$/, ""), text]));

interface Guide { description: string; sections: Map<string, string> }

function parse(raw: string): Guide {
  const front = /^---\n([\s\S]*?)\n---\n/.exec(raw);
  const description = /^description:\s*"?(.*?)"?\s*$/m.exec(front?.[1] ?? "")?.[1] ?? "";
  const body = raw
    .slice(front?.[0].length ?? 0)
    .replace(/^<!-- demo: \w+ -->$/gm, "")
    // Site links have no meaning inside Storybook, so they read as plain text.
    .replace(/\[([^\]]+)\]\((\/[^)]*)\)/g, "$1");
  const sections = new Map<string, string>();
  for (const part of body.split(/^## /m).slice(1)) {
    const newline = part.indexOf("\n");
    sections.set(part.slice(0, newline).trim(), part.slice(newline + 1).trim());
  }
  return { description, sections };
}

/** "Data display/Avatar group" → "avatar-group". */
const slugOf = (title: string) => title.split("/").pop()!.trim().toLowerCase().replace(/\s+/g, "-");

function Section({ guide, name, title = name }: { guide: Guide; name: string; title?: string }) {
  const text = guide.sections.get(name);
  if (!text) return null;
  return (
    <>
      <h2>{title}</h2>
      <Markdown>{text}</Markdown>
    </>
  );
}

export function GuidePage() {
  const { preparedMeta } = useOf("meta");
  const slug = (preparedMeta.parameters?.docs?.slug as string | undefined) ?? slugOf(preparedMeta.title);
  const raw = bySlug.get(slug);
  const guide = raw ? parse(raw) : null;
  if (!guide) {
    return (
      <>
        <Title />
        <Subtitle />
        <Primary />
        <Controls />
        <Stories />
      </>
    );
  }
  return (
    <>
      <Title />
      <Subtitle>{guide.description}</Subtitle>
      <Primary />
      <Controls />
      <Section guide={guide} name="When to use" />
      <Section guide={guide} name="When not to use" />
      <Section guide={guide} name="Usage" />
      <Stories title="Examples" />
      <Section guide={guide} name="API reference" />
      <Section guide={guide} name="Keyboard interactions" />
      <Section guide={guide} name="Accessibility" />
      <Section guide={guide} name="Motion" />
      <Section guide={guide} name="Responsive behavior" />
      <Section guide={guide} name="Performance" />
      <Section guide={guide} name="Notes" />
    </>
  );
}
