import { Demo } from "./demo";
import { CodeBlock } from "./code-block";
import { InstallTabs } from "./install-tabs";
import type { Block } from "../lib/content";

/** Renders markdown blocks, with live demos, code blocks and install commands between them. */
export function Blocks({ blocks, slug }: { blocks: Block[]; slug: string }) {
  return (
    <>
      {blocks.map((block, index) => {
        if (block.type === "html") return <div key={index} className="prose" dangerouslySetInnerHTML={{ __html: block.html }} />;
        if (block.type === "code") return <CodeBlock key={index} title={block.title} lang={block.lang} code={block.code} html={block.html} />;
        if (block.type === "install") return <InstallTabs key={index} packages={block.packages} />;
        return <Demo key={index} slug={slug} name={block.name} code={block.code} codeHtml={block.html} />;
      })}
    </>
  );
}
