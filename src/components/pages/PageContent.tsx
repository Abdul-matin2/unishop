/**
 * Render admin-authored page content written in a tiny markup:
 *   - `## Heading`            -> h2
 *   - `### Sub-heading`       -> h3
 *   - `- item` lines (block)  -> bulleted list
 *   - blank-line paragraphs   -> <p>
 * Any other line becomes plain text. This keeps the admin editor dependency-
 * free while still producing readable pages.
 */
export function PageContent({ content }: { content: string }) {
  const blocks = content
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return (
    <div className="flex flex-col gap-6">
      {blocks.map((block, index) => {
        if (block.startsWith("### ")) {
          const text = block.replace(/^###\s+/, "");
          return (
            <h3 key={index} className="text-base font-semibold tracking-tight">
              {text}
            </h3>
          );
        }
        if (block.startsWith("## ")) {
          const text = block.replace(/^##\s+/, "");
          return (
            <h2 key={index} className="text-xl font-bold tracking-tight">
              {text}
            </h2>
          );
        }
        const lines = block.split("\n");
        if (lines.every((line) => line.trim().startsWith("- "))) {
          return (
            <ul key={index} className="flex flex-col gap-3">
              {lines.map((line, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 leading-relaxed text-muted-foreground"
                >
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                  <span>{line.replace(/^\-\s+/, "")}</span>
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p
            key={index}
            className="leading-relaxed text-muted-foreground"
          >
            {lines.join(" ")}
          </p>
        );
      })}
    </div>
  );
}