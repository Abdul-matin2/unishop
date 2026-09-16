import type { ReactNode } from "react";

/**
 * Render admin-authored page content written in a tiny markup:
 *   - `## Heading`          -> h2
 *   - `### Sub-heading`     -> h3
 *   - `- item` lines        -> bulleted list (consecutive lines group together)
 *   - anything else         -> paragraph text (blank line separates paragraphs)
 *
 * Parsed line-by-line so a heading on its own line is always a heading,
 * even when it is immediately followed by its body text.
 */
export function PageContent({ content }: { content: string }) {
  const nodes: ReactNode[] = [];
  let bullets: string[] = [];
  let para: string[] = [];

  const pushBullets = () => {
    if (bullets.length === 0) return;
    nodes.push(
      <ul
        key={`ul-${nodes.length}`}
        className="flex flex-col gap-3"
      >
        {bullets.map((line, i) => (
          <li
            key={i}
            className="flex items-start gap-3 leading-relaxed text-muted-foreground"
          >
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
            <span>{line}</span>
          </li>
        ))}
      </ul>
    );
    bullets = [];
  };

  const pushPara = () => {
    if (para.length === 0) return;
    nodes.push(
      <p key={`p-${nodes.length}`} className="leading-relaxed text-muted-foreground">
        {para.join(" ")}
      </p>
    );
    para = [];
  };

  const flush = () => {
    pushPara();
    pushBullets();
  };

  for (const rawLine of content.split("\n")) {
    const line = rawLine.trim();

    if (line.startsWith("### ")) {
      flush();
      nodes.push(
        <h3 key={`h3-${nodes.length}`} className="text-base font-semibold tracking-tight">
          {line.replace(/^###\s+/, "")}
        </h3>
      );
    } else if (line.startsWith("## ")) {
      flush();
      nodes.push(
        <h2 key={`h2-${nodes.length}`} className="text-xl font-bold tracking-tight">
          {line.replace(/^##\s+/, "")}
        </h2>
      );
    } else if (line.startsWith("- ")) {
      pushPara();
      bullets.push(line.replace(/^\-\s+/, ""));
    } else if (line === "") {
      flush();
    } else {
      pushBullets();
      para.push(line);
    }
  }
  flush();

  return <div className="flex flex-col gap-6">{nodes}</div>;
}

export default PageContent;